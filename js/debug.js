let debug = {
    maxLines: 200,
    list: [],

    /**
     * Add something to the array list for debugging
     */
    add: function () {
        // Make sure we don't exceed the max memory in the array
        if (this.list.length > this.maxLines) {
            this.list.shift();
        }
        this.list.push(Array.from(arguments));

        // TODO:
        // Remove this line when production
        // console.log(Array.from(arguments));
    },

    /**
     * Display alert message with the list
     */
    show: function() {
        // DEBUG ONLY!!!!!! - Remove this comment when in production
        // Check if the user is a developer or in developer modus - for now you can always do this
        // TODO: Make a function or check, or something else to check if the user is a developer
        // if (user.isDeveloper) {
            alert(this.list.join('\n'));
        // }
    },

    /**
     * Submit debug log the server
     */
    submit: function () {
        let data = {
            "username": user.username,
            "token": user.token,
            "content": this.list
        }

        // Send the debug log the server and if it is 'OK' then clear the debug array
        app.callToServer(data, app.endpoints.support).then(function(result) {
            switch (result.status) {
                //If user info = ok
                case 200:
                    debug.add(result);
                    debug.clear();
                    break;
                default:
                    debug.add(result);
                    break;
            }
        });
    },

    /**
     * Clear the debug list object
     */
    clear: function () {
        // Best way to clear the array, list = [] don't work because then array length will not reset then
        this.list.length = 0;
    }
};
