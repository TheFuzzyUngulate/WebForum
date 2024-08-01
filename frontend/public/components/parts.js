import { sessionData, logout } from '/components/auth.js'

export async function prepareNavbar() {
  var accNavbar = null;
  if (document.getElementsByClassName("account-navbar").length == 0) {
    accNavbar = document.createElement("div");
    accNavbar.classList.add("account-navbar");
  } else accNavbar = document.getElementsByClassName("account-navbar")[0];
  
  const userOptions = document.createElement("div");
  userOptions.classList.add('user-options');
  const mainUserDisp = document.createElement("div");
  mainUserDisp.classList.add('user-login');
  
  const homeButton = document.createElement("a");
  homeButton.innerText = 'home';
  homeButton.onclick = () => { window.location.href = '/'; }
  userOptions.appendChild(homeButton);

  if (sessionData.isLoggedIn) {
    const historyButton = document.createElement("a");
    historyButton.innerText = 'history';
    userOptions.appendChild(historyButton);

    const optionsButton = document.createElement("a");
    optionsButton.innerText = 'options';
    userOptions.appendChild(optionsButton);
    
    const logoutButton = document.createElement("a");
    logoutButton.innerText = 'logout';
    logoutButton.onclick = async () => {
      logout().then(
        (value) => {
          window.location = window.location;
        },
        (error) => {
          console.error("couldn't log out");
        }
      )
    };
    userOptions.appendChild(logoutButton);
    accNavbar.appendChild(userOptions);
    
    const LoggedAlert = document.createElement('a');
    LoggedAlert.innerText = `${sessionData.info.name}`;
    mainUserDisp.appendChild(LoggedAlert);
    accNavbar.appendChild(mainUserDisp);
  } else {
    const loginButton = document.createElement('a');
    loginButton.innerText = 'login';
    loginButton.onclick = () => {
      window.location.href = '/login';
    }
    userOptions.appendChild(loginButton);
    
    const registerButton = document.createElement('a');
    registerButton.innerText = 'register';
    registerButton.onclick = () => {
      window.location.href = '/register';
    }
    userOptions.appendChild(registerButton);
    accNavbar.appendChild(userOptions);

    const notLoggedAlert = document.createElement('a');
    notLoggedAlert.innerText = 'Not logged in';
    mainUserDisp.appendChild(notLoggedAlert);
    accNavbar.appendChild(mainUserDisp);
  }
}