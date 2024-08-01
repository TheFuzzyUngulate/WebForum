const mdConverter   = new showdown.Converter();
const postContainer = document.getElementsByClassName("forum-post-container")[0];
const postFrame     = document.createElement("div");
const commentFrame  = document.createElement("div");

import { prepareNavbar } from '/components/parts.js'
import { check, HOSTNAME, PORT, sessionData } from '/components/auth.js'


function addComment(target, isPost, content) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (isPost) {
      xhr.open("POST", `http://${HOSTNAME}:${PORT}/api/posts/${target.id}/comment`, true);
    } else {
      xhr.open("POST", `http://${HOSTNAME}:${PORT}/api/comments/${target.id}/reply`, true);
    }
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status == 200) {
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    
    if (isPost) {
      xhr.send(JSON.stringify({
        content: content,
        post: sessionData.post.id,
      }));
    } else {
      xhr.send(JSON.stringify({
        post: sessionData.post.id,
        comment: target.id,
        content: content
      }));
    }
  });
}

function getComments(postId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://${HOSTNAME}:${PORT}/api/posts/${postId}/comments`, true);
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status == 200) {
        resolve(jsonOutput.comments);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send();
  });
}

function getPost(postId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${HOSTNAME}:${PORT}/api/posts/${postId}`, true);
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status == 200) {
        jsonOutput.id = postId;
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send();
  });
}

function addCommentBox(target, isPost, parent) {
  const commentHolder = document.createElement("div");
  commentHolder.classList.add('forum-comment-box-holder');

  const commentBox = document.createElement("textarea");
  commentBox.classList.add('forum-comment-box');
  commentHolder.appendChild(commentBox);

  const optionBar = document.createElement("div");
  optionBar.classList.add("forum-option-bar");

  const confirmButton = document.createElement("button");
  confirmButton.classList.add("forum-option-bar-button");
  confirmButton.innerHTML = 'Submit';
  confirmButton.onclick = async () => {
    var content = commentBox.value;
    addComment(target, isPost, content).then(
      (value) => {
        commentHolder.remove();
        const comcont = addCommentContainer(value, sessionData.post.comments.length);
        sessionData.post.comments.push(value);
        sessionData.post.commentCount++;
        commentFrame.appendChild(comcont);
      },
      (error) => {
        console.error(error);
        commentHolder.remove();
      }
    );
  };

  optionBar.appendChild(confirmButton);

  const closeButton = document.createElement("button");
  closeButton.classList.add("forum-option-bar-button");
  closeButton.innerHTML = 'Close';
  closeButton.onclick = () => {
    commentHolder.remove();
    parent.setAttribute('data-is-commenting', '');
  };
  optionBar.appendChild(closeButton);

  commentHolder.appendChild(optionBar);
  parent.appendChild(commentHolder);
}

function addOptionBar(isPost, bodyInfo) {
  // comment, delete*, report*
  const optionBar = document.createElement("div");
  optionBar.classList.add("forum-option-bar");
  
  // comment is always present
  const commentOption = document.createElement("button");
  commentOption.classList.add("forum-option-bar-button");
  commentOption.innerHTML = "comment";
  commentOption.onclick = function() {
    const comment = optionBar.parentNode;
    const isActivated = comment.getAttribute('data-is-commenting');
    if (!isActivated) {
      const box = addCommentBox(bodyInfo, isPost, comment);
      comment.setAttribute('data-is-commenting', 'b');
    }
  };
  optionBar.appendChild(commentOption);
  
  if (sessionData.info.id == bodyInfo.author.id) {
    const deleteOption = document.createElement("button");
    deleteOption.classList.add("forum-option-bar-button");
    deleteOption.innerHTML = "delete";
    optionBar.appendChild(deleteOption);
  } else {
    const reportOption = document.createElement("button");
    reportOption.classList.add("forum-option-bar-button");
    reportOption.innerHTML = "report";
    optionBar.appendChild(reportOption);
  }
  
  return optionBar;
}

function addPostInfoBox() {
  const postInfo = sessionData.post;
  const userNameHolder = document.createElement("div");
  userNameHolder.classList.add("forum-post-head-info");

  const userNameBox = document.createElement("div");
  userNameBox.innerHTML = `<a class='forum-post-username-link'>${postInfo.author.name}</a>`;
  userNameHolder.appendChild(userNameBox);

  const dateSection = document.createElement("div");
  dateSection.innerText = generateDateString(postInfo.dateCreated);
  userNameHolder.appendChild(dateSection);

  return userNameHolder;
}

function addPostTopicBox() {
  const postInfo = sessionData.post;
  const postTitleHolder = document.createElement("div");
  postTitleHolder.classList.add("forum-post-head-title");

  const postTitleTopicHolder = document.createElement("div");
  postTitleTopicHolder.textContent = `${postInfo.title}`;
  postTitleHolder.appendChild(postTitleTopicHolder);

  return postTitleHolder;
}

function addPostBody() {
  const postInfo = sessionData.post;
  postFrame.classList.add("forum-post-head-holder");

  const topicBox = addPostTopicBox();
  postFrame.appendChild(topicBox);

  const contentsBox = document.createElement("div");
  contentsBox.classList.add("forum-post-head-contents");
  
  const userHolder = addPostInfoBox();
  contentsBox.appendChild(userHolder);
  
  const contentHolder = document.createElement("div");
  contentHolder.classList.add('forum-post-description-holder');
  contentHolder.innerHTML = mdConverter.makeHtml(postInfo.description);
  contentsBox.appendChild(contentHolder);

  if (sessionData.isLoggedIn) {
    const optionBar = addOptionBar(true, postInfo);
    contentsBox.appendChild(optionBar);
  }

  postFrame.appendChild(contentsBox);
  postContainer.appendChild(postFrame);
}

function generateDateString(dateString) {
  const date = new Date(dateString);
  var resString = 'posted on ';
  resString += " " + String(date.getFullYear());
  resString += "-" + String(date.getMonth() + 1).padStart(2, '0');
  resString += "-" + String(date.getDate()).padStart(2, '0');
  resString += " " + String(date.getHours()).padStart(2, '0');
  resString += ":" + String(date.getMinutes()).padStart(2, '0');
  resString += ":" + String(date.getSeconds()).padStart(2, '0');
  resString += ":" + String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');

  return resString;
}

function createCommentUsernameLink(name) {
  const userLink = document.createElement("a");
  userLink.classList.add('forum-comment-username-link');
  userLink.textContent = name;
  return userLink;
}

function createHashlink(count) {
  const hashLink = document.createElement("a");
  hashLink.classList.add('forum-hashlink');
  hashLink.textContent = String(count).padStart(4, '0');
  hashLink.onclick = function() {
    window.location.href = `#${count}`;
    hashMovefunc();
  }
  return hashLink;
}

function addCommentUserBox(userInfo, commentInfo, count) {
  const userNameHolder = document.createElement("div");
  userNameHolder.classList.add("forum-comment-box-user-info");
  
  const userIndex = document.createElement("div");
  userIndex.innerHTML = `#`;
  userIndex.appendChild(createHashlink(count + 1));
  userIndex.append(' ');
  userIndex.appendChild(createCommentUsernameLink(userInfo.name));
  userNameHolder.appendChild(userIndex);
  
  const dateSection = document.createElement("div");
  dateSection.innerText = generateDateString(commentInfo.dateCreated);
  userNameHolder.appendChild(dateSection);

  if (commentInfo.repliedTo) {
    const commentList = sessionData.comments;
    for (let i = commentList.length - 1; i > -1; --i) {
      if (commentList[i].id == commentInfo.repliedTo) {
        const parentSection = document.createElement("div");
        parentSection.innerHTML = `replying to <a>${commentList[i].author.name}</a> at #`;
        parentSection.appendChild(createHashlink(commentList.length - i));
        userNameHolder.appendChild(parentSection);
        break;
      }
    }
  }

  return userNameHolder;
}

function addCommentContainer(commentInfo, count) {
  const commentHolder = document.createElement("div");
  commentHolder.classList.add("forum-post-comment");
  
  const userInfo = commentInfo.author;
  const userHolder = addCommentUserBox(userInfo, commentInfo, count);
  commentHolder.appendChild(userHolder);
  
  const contentHolder = document.createElement("div");
  contentHolder.classList.add('forum-post-comment-content-holder');
  contentHolder.innerHTML = mdConverter.makeHtml(commentInfo.content);
  commentHolder.appendChild(contentHolder);

  if (sessionData.isLoggedIn) {
    const optionBar = addOptionBar(false, commentInfo);
    commentHolder.appendChild(optionBar);
  }

  return commentHolder;
}

function addCommentFrame() {
  commentFrame.classList.add("forum-post-comments-holder");
  const commentList = sessionData.comments;
  for (let i = commentList.length - 1; i > -1; i--) {
    const commentHolder = addCommentContainer(commentList[i], commentList.length - (i + 1));
    commentFrame.append(commentHolder);
  }
  postContainer.append(commentFrame);
}

function hashMovefunc() {
  const splitHash = window.location.hash.substring(1, window.location.hash.length);
  const myHash = parseInt(splitHash);
  if (myHash && myHash > 0 && myHash <= sessionData.comments.length) {
    for (let i = 0; i < commentFrame.childNodes.length; ++i) {
      let currElement = commentFrame.childNodes[i];
      if (currElement.style.backgroundColor != 'transparent') {
        currElement.style.backgroundColor = 'transparent';
      }
    }

    const myElement = commentFrame.childNodes[myHash - 1];
    myElement.scrollIntoView({ behavior: "instant", block: "center" });
    myElement.style.backgroundColor = 'rgb(248, 248, 255)';
  }
}

document.body.onload = async function() {
  check().then(
    (value) => {
      if (!sessionData.isLoggedIn) {
        sessionData.isLoggedIn = true;
        sessionData.info = value;
      }
    },
    (err) => {
      console.error(err);
    }
  ).then(async _ => {
    try {
      const mypathname = window.location.pathname;
      const postId = mypathname.substring(mypathname.lastIndexOf('/') + 1);
      prepareNavbar();
      try {
        sessionData.post = await getPost(postId);
        sessionData.comments = await getComments(postId);
        addPostBody();
        addCommentFrame();
        if (window.location.hash) {hashMovefunc();}
        // window.onhashchange = hashMovefunc;
      } catch (err) {
        console.error(err);
        // window.location.href = '/';
      }
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  });
}