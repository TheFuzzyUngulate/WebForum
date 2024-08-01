const loginContainer = document.getElementsByClassName("login-form-container")[0];
const loginIndividualContainers = loginContainer.getElementsByClassName("login-form-individual-container");
const loginUserNameForm = loginIndividualContainers[0].getElementsByTagName('input')[0];
const loginPasswordForm = loginIndividualContainers[1].getElementsByTagName('input')[0];
const loginEnterButton = loginContainer.getElementsByTagName('button')[0];
const errorHolder = loginContainer.getElementsByClassName('login-page-error-holder')[0];

import { login } from '/components/auth.js'

function displayError(message) {
  errorHolder.textContent = message;
  errorHolder.style.visibility = 'visible';
  setTimeout(() => {
    errorHolder.style.visibility = 'hidden';
  }, 3000);
}

loginEnterButton.onclick = function() {
  var username = loginUserNameForm.value;
  var password = loginPasswordForm.value;

  if (!username) {
    displayError('Username is required');
  } else if (!password) {
    displayError('Password is required');
  } else {
    console.log(`${username}, ${password}`)
    login(username, password).then(
      (value) => {
        console.log(value);
        window.location.href = '/';
      },
      (error) => {
        displayError(error.message);
      }
    );
  }
}