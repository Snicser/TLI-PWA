const user = {
    username: "",
    token: "",
    dark: true,
    profile: {},

    /**
     * Updates the user profile
     */
    setProfile: function () {
        //Check if profile info exists
        if (
            !database.get("profile") == "" ||
            !database.get("profile") === null
        ) {
            //If true
            //Place them in profile localDB
            user.profile =  database.get("profile");
            debug.add(user.profile);
        } else {
            //If false

            //Get profile information
            //Fill profile info in profile object
            let inputData = {
                username: user.username,
                token: user.token,
            };

            debug.add(inputData);

            app
                .callToServer(inputData, app.endpoints.profile)
                .then(function (result) {
                    switch (result.status) {
                        case 200:
                            let profileInfo = {
                                firstname: result.data.firstname,
                                lastname: result.data.lastname,
                                email: result.data.email,
                                country: result.data.country,
                            };

                            //Store the profile info in local object
                            user.profile.firstname = profileInfo.firstname;
                            user.profile.lastname = profileInfo.lastname;
                            user.profile.email = profileInfo.email;
                            user.profile.country = profileInfo.country;

                            //Store the profile info in localStorage
                            database.add("profile", JSON.stringify(profileInfo));

                            debug.add(profileInfo);
                            break;
                        default:
                            debug.add(`Default behavior: ${result}`);
                    }
                });
        }
    },

    /**
     * Check if user is in darkmode, if so apply it
     */
    setDarkMode: function () {
        let element = document.querySelector("body");
        let darkmodeClass = element.className;

        if (
            localStorage.getItem("dark") == "true" ||
            localStorage.getItem("dark") === null
        ) {
            if (!darkmodeClass.includes("dark")) {
                element.classList.add("dark");
            }
        }
         else {
            if (darkmodeClass.includes("dark")) {
                element.classList.remove("dark");
                user.dark = false;
                localStorage.setItem("dark", false);
            }
        }        
    },

    /**
     * Get the global user statistics
     */
    getGlobalUserStatistics: function () {
        // Check if there is connection otherwise the get a message
        if (onlineStatus.check()) {
            // Fill input data
            let data = {
                username: user.username,
                token: user.token,
            };

            debug.add(data);

            // Post the data to the sever en get a response
            app.callToServer(data, app.endpoints.overview).then(function (result) {
                switch (result.status) {
                    case 200:
                        // Fill the span element with the return data
                        document.getElementById("global-user-statistics").innerHTML = result.data;
                        debug.add(result);
                        break;
                    default:
                        debug.add(result);
                        break;
                }
            });
        }
    },

    /**
     * Change the user profile color
     */
    changeColor: function () {
        // Get the root element
        let rootElement = document.querySelector(":root");

        // Get the new color
        let newColor = document.querySelector(".color-picker").value;

        // Change to the new color
        rootElement.style.setProperty("--main-bg-color", newColor);

        // Write to localStorage
        database.add("userColor", newColor);
    },
};
