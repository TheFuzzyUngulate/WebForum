import { check, HOSTNAME, PORT, sessionData } from '/components/auth.js'
import { prepareNavbar } from '/components/parts.js'

const accNavbar    = document.getElementsByClassName("account-navbar")[0];
const forumContent = document.getElementsByClassName("forum-content")[0];
const forumBody    = forumContent.getElementsByClassName("forum-body")[0];
const forumNavbar  = forumContent.getElementsByClassName("forum-navbar")[0];
const forumTable   = forumBody.getElementsByTagName("table")[0];

function getTopics() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${HOSTNAME}:${PORT}/api/all-topics`, true);
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status == 200) {
        resolve(jsonOutput.topics);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send();
  });
}

function getRecentPosts(topic, limit) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${HOSTNAME}:${PORT}/api/topic/${topic}/posts`);
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status != 200) {
        console.error("Server error");
        reject(jsonOutput);
      }
      const posts = jsonOutput.posts;
      if (posts.length >= 5) {
        resolve(posts.slice(0, 5));
      } else {
        resolve(posts);
      }
    }
    xhr.send();
  });
}

async function tableAddTopics(max, tbody) {
  getTopics()
  .then(function (topics) {
    for (let topic of topics) {
      getRecentPosts(topic.name, max)
      .then(function(recents) {
        var newRow = tbody.insertRow();

        const nameCell = newRow.insertCell();
        const nameLink = document.createElement("a");
        nameLink.innerText = topic.name;
        nameLink.href = `/topic/${topic.name}`;
        nameCell.appendChild(nameLink);
        
        const postCountCell = newRow.insertCell();
        postCountCell.innerText = topic.postCount;

        const latestsCell = newRow.insertCell();
        const topicLatests = document.createElement("div");
        topicLatests.classList.add("forum-body-content-table-latest-holder");
        
        for (var i = 0; i < recents.length; ++i) {
          const item = document.createElement("div");
          const uploadDate = new Date(recents[i].dateCreated);
          item.innerHTML = `<a href="/post/${recents[i].id}">${recents[i].title}</a> - ${uploadDate.toLocaleString()}`;
          topicLatests.appendChild(item);
        }

        latestsCell.appendChild(topicLatests);
      })
      .catch(function(err) {
      });
    }   
  })
  .catch(function (err) {
    console.error(err);
  });
}

function tableCreateHeader(name1, name2, name3) {
  const header = forumTable.createTHead();
  const headrow = header.insertRow();
  const cell1 = headrow.insertCell();
  cell1.innerText = name1;
  const cell2 = headrow.insertCell();
  cell2.innerText = name2;
  const cell3 = headrow.insertCell();
  cell3.innerText = name3;
}

function fillTable() {
  tableCreateHeader("name", "posts", "latest");
  const body = forumTable.createTBody();
  tableAddTopics(5, body);
}

document.body.onload = async function() {
  check().then(
    async (value) => {
      if (!sessionData.isLoggedIn) {
        sessionData.isLoggedIn = true;
        sessionData.info = value;
      }
    },
    async (err) => {
      console.error(err);
    }
  ).then(async _ => {
    try {
      prepareNavbar();
      fillTable();
      // forumNavbar.innerText = `${window.screen.width} x ${window.screen.height}`;
    } catch (err) {
      console.error(err);
      // window.location.href = '/';
    }
  });
}