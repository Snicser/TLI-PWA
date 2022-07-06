let content = {
  content: {},
  delay: true,
  toBeFetched: [],

  /**
   * This function get called when the user presses the refresh button on the home page
   */
  refreshButton: function () {
    if (this.delay) {
      // Delay, 3000ms delay after clicking
      this.delay = false;

      document.querySelector(".fa-sync-alt").classList.add("gly-rotate-45");
      setTimeout(() => {
        // Check if there is new content available
        content.refresh();

        // Update the list box
        app.loadListBox();

        setTimeout(() => {
          document
            .querySelector(".fa-sync-alt")
            .classList.remove("gly-rotate-45");
          this.delay = true;
        }, 3000);
      }, 3000);
    }
  },

  // TODO: Document the function description
  /**
   * Refresh the content, check if there is content?
   */
  refresh: function () {
    if (
      !database.get("lastContentRefresh") == "" ||
      !database.get("lastContentRefresh") === null
    ) {
      user.lastContentRefresh = database.get("lastContentRefresh");
    } else {
      user.lastContentRefresh = "0000-00-00 00:00:00";
    }

    //Normal input
    let inputData = {
      username: user.username,
      token: user.token,
      date: user.lastContentRefresh,
    };

    debug.add(inputData);

    // TODO: DELETE IF WHEN IN PRODUCTION, ONLY DEBUG PURPOSES
    let loginData2 = {
      username: "info@remark.no",
      token: "2d1011ed456f5b20fce56dcdbfa20ddf30b15634",
      date: user.lastContentRefresh,
    };

    // TODO: What is this element doing?
    let contentElement = document.querySelector(".content-noti");

    // Check if the user is online
    if (onlineStatus.check()) {
      app
        .callToServer(inputData, app.endpoints.refresh)
        .then(function (result) {
          switch (result.status) {
            //If user info = ok
            case 200:
              console.log("content.refresh.switch.ok ->", result);
              debug.add(result);

              // If required, add the content to the localDatabase
              content.updateContent(result);

              // Set the lastContentRefresh to current time
              let today = new Date();
              let dd = String(today.getDate()).padStart(2, "0");
              let mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
              let yyyy = today.getFullYear();
              let hour = today.getHours();
              let min = today.getMinutes();
              let sec = today.getSeconds();

              today = `${yyyy}-${mm}-${dd} ${hour}:${min}:${sec}`;

              // Update the loccal database
              database.update("lastContentRefresh", today);
              debug.add(today);

            //Fill the content into the listbox
            app.loadListBox();
            
            //Change username
            document.querySelector(".home-username").innerHTML = user.profile.firstname;

            case "NOT OK":
              console.log("content.refresh.switch.notok ->", result);
              break;
          }
        });
    }
  },

  /**
   * Update the content if it is possible
   */
  updateContent: function (data) {
    let serverContent = data.data;
    debug.add(serverContent);

    //Getting data
    //data.subscriptions: (3) ["3", "2", "5"]
    //data.updates: {2: {…}, 3: {…}, 5: {…}}+
    //Get localstorage list
    //

    //Delete from localContent if not on the server anymore

    let contentElement = document.querySelector(".content-noti");

    let localContent = database.getAll("content."); //contents: (3) ["3", "2", "7"]

    debug.add(localContent);

    for (let index = 0; index < localContent.length; index++) {
      if (!serverContent.subscriptions.includes(localContent[index])) {
        database.remove("content." + localContent[index]);
        //Remove the actual content
      }
    }
    //localContent = ["3", "2"]

    for (let index = 0; index < serverContent.subscriptions.length; index++) {
      // If the servercontent is in the localContent

      // Extract the id's from the localstorage list
      let localIDs = [];
      for (let index = 0; index < localContent.length; index++) {
        let temp = Object.keys(localContent[index])[0];
        temp = temp.replace("content.", "");
        localIDs[index] = parseInt(temp);
      }

      // Check if the local ID's are in the serverContent
      if (localIDs.includes(serverContent.subscriptions[index])) {
        // If the serverContent is in the updates list
        if (
          serverContent.updates.hasOwnProperty(
            serverContent.subscriptions[index]
          )
        ) {
          // Remove actual content
          let key = serverContent.subscriptions[index];
          let value = serverContent.updates[key];
          database.remove("content." + key, value);

          // Show the user that content was added
          // contentElement.innerHTML = "Nieuwe content geupdate!"
        }
      } else {
        // If the serverContent is NOT in the localContent
        if (
          serverContent.updates.hasOwnProperty(
            serverContent.subscriptions[index]
          )
        ) {
          //Add the content to the localDatabase
          let key = serverContent.subscriptions[index];
          let value = serverContent.updates[key];
          database.add("content." + key, value);

          // Show the user that content was added
          // contentElement.innerHTML = "Nieuwe content toegevoegd!"
        } else {
          //Content is missing, get it seperate from the server
          this.toBeFetched.push(serverContent.subscriptions[index]);
        }
      }
    }
    //localContent = ["3", "2,", "5"]

    // Fetch the toBeFetched array
    let pushData = {
      username: user.username,
      token: user.token,
      method: "get",
      ids: this.toBeFetched,
    };

    debug.add(pushData);

    function ObjectLength(object) {
      let length = 0;
      for (let key in object) {
        if (object.hasOwnProperty(key)) {
          ++length;
        }
      }
      return length;
    }

    // If there is content left to get and add it
    if (!this.toBeFetched.length == 0) {
      app
        .callToServer(pushData, app.endpoints.fetchContent)
        .then(function (result) {
          switch (result.status) {
            //If user info = ok
            case 200:
              console.log("updateContent.toBeFetched ->", result);
              debug.add(result);

              // Clear the toBeFetched array
              content.toBeFetched.length = 0;
              let serverContent = result.data;
              let objectLength = ObjectLength(serverContent);

              //Add each content element to the local data
              for (let index = 0; index < objectLength; index++) {
                //Add actual content
                let key = Object.keys(serverContent)[index];
                let value = serverContent[key];
                database.add("content." + key, value);
              }
          }
        });
    }
  },
};
