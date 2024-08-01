const registerContainer = document.getElementsByClassName("login-form-container")[0];
const registerIndividualContainers = registerContainer.getElementsByClassName("login-form-individual-container");
const registerUserNameForm = registerIndividualContainers[0].getElementsByTagName('input')[0];
const registerEmailForm = registerIndividualContainers[1].getElementsByTagName('input')[0];
const registerPasswordForm = registerIndividualContainers[2].getElementsByTagName('input')[0];
const registerEnterButton = registerContainer.getElementsByTagName('button')[0];
const errorHolder = registerContainer.getElementsByClassName('login-page-error-holder')[0];
const warningHolder = registerContainer.getElementsByClassName('login-page-warning-holder')[0];

import { register } from '/components/auth.js'

function displayError(message) {
  errorHolder.textContent = message;
  errorHolder.style.visibility = 'visible';
  setTimeout(() => {
    errorHolder.style.visibility = 'hidden';
  }, 3000);
}

var shownNoEmailWarning = false;

function noEmailWarning() {
  warningHolder.style.visibility = 'visible';
  setTimeout(() => {
    warningHolder.style.visibility = 'hidden';
  }, 3000);
  shownNoEmailWarning = true;
}

registerEnterButton.onclick = function() {
  var username = registerUserNameForm.value;
  var password = registerPasswordForm.value;
  var email = registerEmailForm.value;

  if (!username) {
    displayError('Username is required');
  } else if (!password) {
    displayError('Password is required');
  } else if (!email && !shownNoEmailWarning) {
    noEmailWarning();
  } else {
    register(username, email, password).then(
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