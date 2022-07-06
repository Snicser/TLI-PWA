let app = {
  className: "app",
  sessionTimeOut: 3000,
  config: {},
  servername: "https://apps.tli.cloud/",
  endpoints: {
    content: "api/v1/content/",
    group: "api/v1/group/",
    login: "api/v1/login/",
    loginGettoken: "api/v1/login-gettoken/",
    loginRefresh: "api/v1/login-refresh/",
    logout: "api/v1/logout/",
    overview: "api/v1/overview/",
    profile: "api/v1/profile/",
    refresh: "api/v1/refresh/",
    fetchContent: "api/v1/content/",
    support: "api/v1/support/",
    settings: "api/v1/settings/",
    statistics: "api/v1/statistics/",
    strategy: "api/v1/strategy/",
  },

  initialize: function () {
    if (app.isLoadedInBrowser()) {
      this.loadPage("demo.html");

      // Check if there's previous login data
    } else {
      // Check if there's a stylecolor available
      if (
        !database.get("userColor") == "" ||
        !database.get("userColor") === null
      ) {
        //Place them in profile localDB
        user.profile.color = database.get("userColor");

        let r = document.querySelector(":root");
        r.style.setProperty("--main-bg-color", user.profile.color);
      }

      //If token is availble in local storage
      if (
        !database.get("token") == null ||
        !database.get("token") == ""
      ) {
        //this.loadPage("home.html");
        this.loadPage("home.html");

        //Check if there's profile information from the last session
        user.setProfile();

        //Check dark mode status, and chance if necesarry
        user.setDarkMode();          

        //Update localDB data
        user.token = database.get("token");
        user.username = database.get("username");

        //Check if the content is up to date
        content.refresh();
      } else {
        this.loadPage("login.html");
      }
    }
  },

  isLoadedInBrowser: function () {
    if (navigator.standalone) {
      return false;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return false;
    }

    return true;
  },

  loadListBox: function () {
    //Add content boxes
    let listBox = document.querySelector(".list-box");
    listBox.innerHTML = "";

    let contentList = database.getAll("content.");
    console.log(contentList);

    for (let index = 0; index < contentList.length; index++) {
      let entry = Object.keys(contentList[index])[0];

      let HTMLStructure = 
          `<div class="rounded my-1 mx-1">
            <div onclick="app.loadPage('../strategy/info.html', '${entry}')" class="d-flex list-item justify-content-between">
              <div><span class="subject">${contentList[index][entry].title} - ${contentList[index][entry].code}</span></div>
              <div><span class="complete-percentage">${contentList[index][entry].fk_strategy}</span></div>
            </div>
          </div>`;

      listBox.innerHTML = listBox.innerHTML + HTMLStructure;
    }
  },

  loadHTML: function (html, id, contentId) {
    document.querySelector(`#${id}`).innerHTML =
      html + `<span id="hasFullyLoaded_${id}"></span>`;
    document.querySelector(`#${id}`).setAttribute("contentId", contentId);

    // NOTE: https://swizec.com/blog/how-to-wait-for-dom-elements-to-show-up-in-modern-browsers
    function tryCallbackSelf(id) {
      console.log(`Callback -> ${id}`);
      debug.add(`Callback -> ${id}`);
      if (document.getElementById(`hasFullyLoaded_${id}`)) {
        let nodeList = document.querySelectorAll("script[data-tli='1']");

        for (let index = 0; index < nodeList.length; index++) {
          nodeList[index].remove();
        }

        app.loadGlobalAppData();

        let scripts = document
          .getElementById("app")
          .getElementsByTagName("script");

        console.log(scripts);
        debug.add(scripts);

        let scriptsClone = [];

        for (let i = 0; i < scripts.length; i++) {
          scriptsClone.push(scripts[i]);
        }

        for (let i = 0; i < scriptsClone.length; i++) {
          let currentScript = scriptsClone[i];
          let s = document.createElement("script");
          s.async = false;
          s.setAttribute("data-tli", "1");
          // let s = document.querySelector("#script").createElement("script");
          // Copy all the attributes from the original script
          for (let j = 0; j < currentScript.attributes.length; j++) {
            let a = currentScript.attributes[j];
            s.setAttribute(a.name, a.value);
          }
          s.appendChild(document.createTextNode(currentScript.innerHTML));
          currentScript.parentNode.replaceChild(s, currentScript);
        }
        document.querySelector(`#hasFullyLoaded_${id}`).remove();
      } else {
        window.requestAnimationFrame(tryCallbackSelf(id));
      }
    }

    tryCallbackSelf(id);
  },

  // If you dont give a contenID it will be null
  loadPage: function (page, contentId = null) {
    // Fetch page
    debug.add(contentId);
    fetch(page)
      .then(function (response) {
        // Return text HTML version
        return response.text();
      })
      .then(function (html) {
        app.loadHTML(html, "app", contentId);
      })
      .catch(function (err) {
        console.warn("Something went wrong.", err);
      });
  },

  loadGlobalAppData: function () {
    fetch("../config.json")
      .then((response) => response.json())
      .then((data) => {
        for (const [key, value] of Object.entries(data)) {
          if (key === "app-name" || key === "app-version") {
            if (document.getElementById(key)) {
              document.getElementById(key).innerText = value;
            }
          }

          if (key === "app-icon") {
            if (document.getElementById(key)) {
              document.getElementById(key).src = value;
            }
          }

          if (key === "app-developers") {
            if (document.getElementById(key)) {
              for (let i = 0; i < value.length; i++) {
                let list = `<li>${value[i]}</li>`;
                document.getElementById(key).innerHTML += list;
              }
            }
          }
        }
      })
      .catch((error) => {
        debug.add(`Error while try to get the data. Error: ${error}`);
      });
  },

  changeDarkmode: function () {
    let element = document.querySelector("body");
    let darkmodeClass = element.className;

    if (document.querySelector(".slider-darkmode").checked) {
      if (!darkmodeClass.includes("dark")) {
        element.classList.add("dark");
        user.dark = true;
        localStorage.setItem("dark", true);
      }
    } else {
      if (darkmodeClass.includes("dark")) {
        element.classList.remove("dark");
        user.dark = false;
        localStorage.setItem("dark", false);
      }
    }
  },

  login: function (username, password) {
    let loginData = {
      username: username,
      password: password,
    };

    //Check if user may log in, and receive token
    this.callToServer(loginData, app.endpoints.login).then(function (result) {
      switch (result.status) {
        //If user info = ok
        case 200:
          //Save token and username in de local user object
          user.token = result.token;
          user.username = loginData.username;
          //Save token and username in localStorage
          database.add("token", result.token);
          database.add("username", loginData.username);
          //Check if user profile info is available, and place it in the localStorage + object
          user.setProfile(loginData.username, result.token);
          //Receive
          app.loadPage("home.html");

          content.refresh();

          break;
        default:
          document.querySelector(".noti").innerHTML =
            "Verkeerde gebruikersnaam of wachtwoord";
      }
    });
  },

  logout: function () {
    //Remove previous login information / auto login
    // database.add("username", "");
    // database.add("token", "");
    // database.add("profile", "");
    app.loadPage("logout.html", "");
    // console.log(database.getAll("content."));
    localStorage.clear();
  },

  install: function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    }
  },

  callToServer: function (inputData, endpoint) {
    return new Promise(function (resolve, reject) {
      let url = `${app.servername}${endpoint}`;
      let xhr = new XMLHttpRequest();
      xhr.timeout = this.sessionTimeOut;
      xhr.open("POST", url);
      xhr.onload = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText,
            });
          }
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };

      xhr.ontimeout = function () {
        xhr.abort();
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };

      xhr.send(JSON.stringify(inputData));
    });
  },
};
