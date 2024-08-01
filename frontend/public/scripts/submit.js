const submitContainer = document.getElementsByClassName("submit-form-container")[0];
const submitTitleForm = submitContainer.getElementsByTagName("input")[0];
const submitBodyForm = submitContainer.getElementsByTagName("textarea")[0];
const submitButton = submitContainer.getElementsByTagName("button")[0];

import { check, sessionData, HOSTNAME, PORT } from '/components/auth.js'

function addPost(title, contents, topic) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://${HOSTNAME}:${PORT}/api/posts`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = () => {
      if (xhr.status == 200) {
        const jsonOutput = JSON.parse(xhr.response);
        console.log(jsonOutput);
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          description: xhr.response
        });
      }
    }
    xhr.send(JSON.stringify({
      title: title,
      topic: topic,
      description: contents
    }));
  });
}

document.body.onload = function() {
  check().then(
    (value) => {
      if (!sessionData.isLoggedIn) {
        sessionData.isLoggedIn = true;
        sessionData.info = value;
      }
    },
    (error) => {
      console.error(error);
      window.location.href = '/';
    }
  ).then(async _ => {
    const mypathname = window.location.pathname;
    const topicNameList = mypathname.split('/');
    const topicName = topicNameList[topicNameList.length - 2];
    submitButton.onclick = function() {
      var title = submitTitleForm.value;
      var contents = submitBodyForm.value;
      addPost(title, contents, topicName).then(
        (value) => {
          const newId = value.id;
          window.location.href = `/post/${newId}`;
        },
        (error) => {
          console.error(error);
          window.location.href = '/';
        }
      );
    }
  });
}