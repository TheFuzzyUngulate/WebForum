import { check, HOSTNAME, sessionData, PORT } from '/components/auth.js'
import { prepareNavbar } from '/components/parts.js'

const forumContent = document.getElementsByClassName("forum-content")[0];
const forumBody    = forumContent.getElementsByClassName("forum-body")[0];
const topicTitle   = forumContent.getElementsByClassName("forum-topic-title")[0];
const forumTable   = forumBody.getElementsByTagName("table")[0];

function getTopicPosts(topicName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${HOSTNAME}:${PORT}/api/topic/${topicName}/posts`, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          const jsonOutput = JSON.parse(xhr.response);
          resolve(jsonOutput.posts);
        } else {
          console.error('Server error');
          reject([]);
        }
      }
    }
    xhr.send();
  });
}

function addTopicTitle() {
  const titleDiv = document.createElement("div");
  titleDiv.innerText = `${sessionData.topic.name}`;
  topicTitle.appendChild(titleDiv);

  if (sessionData.isLoggedIn) {
    const makePost = document.createElement("button");
    makePost.innerText = "Create Post";
    makePost.onclick = function() {
      window.location.href = `/topic/${sessionData.topic.name}/submit`;
    }
    topicTitle.appendChild(makePost);
  }
}

function tableAddPosts(count, tbody) {
  for (let post of sessionData.topic) {
    var newRow = tbody.insertRow();

    const nameCell = newRow.insertCell();
    const nameLink = document.createElement("a");
    nameLink.innerText = post.title;
    nameLink.href = `/post/${post.id}`;
    nameCell.appendChild(nameLink);

    const commentCountCell = newRow.insertCell();
    commentCountCell.innerText = `${post.commentCount}`;

    const lastUpdatedCell = newRow.insertCell();
    const lastUpdatedDate = new Date(post.lastUpdated);
    lastUpdatedCell.innerText = `${lastUpdatedDate.toLocaleString()}`;
  }
}

function fillTable() {
  const header = forumTable.createTHead();
  const headrow = header.insertRow();
  const cell1 = headrow.insertCell();
  cell1.innerText = 'post';
  const cell2 = headrow.insertCell();
  cell2.innerText = 'comments';
  const cell3 = headrow.insertCell();
  cell3.innerText = 'last updated';

  const body = forumTable.createTBody();
  tableAddPosts(10, body);
}

document.body.onload = async function() {
  check().then(
    async (value) => {
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
      const topicName = mypathname.substring(mypathname.lastIndexOf('/') + 1);
      try {
        sessionData.topic = await getTopicPosts(topicName);
        sessionData.topic.name = topicName;
      } catch (err) {
        window.location.href = '/';
      }

      prepareNavbar();
      addTopicTitle();
      fillTable();
    } catch (err) {
      console.error(err);
    }
  });
}