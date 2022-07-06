let onlineStatus = {
    /**
     * Check if the user has a internet connection
     */
    check: function () {
        // Check if the user is online
        let online = window.navigator.onLine;

        // Show the offline message if needed
        if (online) {
            // document.querySelector(".internet-noti").style.display = "none";
            debug.add("The user has a internet connection.");
        } else {
            // document.querySelector(".internet-noti").style.display = "block";
            debug.add("The user has no internet connection.");
        }
        return online;
    },
};
