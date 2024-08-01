export const HOSTNAME = '192.168.1.70'
export const PORT = '2250'
export const sessionData = { isLoggedIn: false }

export async function login(username, password) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://${HOSTNAME}:${PORT}/api/login`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send(JSON.stringify({
      username: username,
      password: password
    }));
  });
}

export async function register(username, email, password) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://${HOSTNAME}:${PORT}/api/register`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    };
    xhr.send(JSON.stringify({
      username: username,
      email: email,
      password: password
    }));
  });
}

export async function check() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://${HOSTNAME}:${PORT}/api/user/`, true);
    xhr.withCredentials = true;
    xhr.onload = () => {
      const jsonOutput = JSON.parse(xhr.response);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(jsonOutput);
      } else {
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send();
  });
}

export async function logout() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://${HOSTNAME}:${PORT}/api/logout`, true);
    xhr.withCredentials = true;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        const jsonOutput = JSON.parse(xhr.response);
        console.error('Server error');
        reject(jsonOutput);
      }
    }
    xhr.send();
  });
}