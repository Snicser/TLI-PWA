let statistics = {
    list: {},

    /**
     * Add user statistics to the list
     * @param {string} type
     * Example: 'app' or content ID
     *
     * @param action
     * Example: 'start' , 'stop'
     *
     * @param content
     * JSON
     */
    add: function (type, action, content = null) {
        // Check if a list already exits, if not then make
        if (!this.list.hasOwnProperty(type)) {
            this.list[type] = [];
        }

        // Make temp var because then you can later set the content if there is content
        let temp = {
            action: action,
            ts: new Date(),
        };

        // Check if there is content
        if (content != null) {
            temp.content = content;
        }

        // Sets the stats etc in the list
        this.list[type][this.list[type].length++] = temp;

        debug.add(temp);
    },

    /**
     * Submit list the server
     */
    submit: function (type) {
        let data = {
            username: user.username,
            token: user.token,
            type: type,
            content: this.list[type],
        };

        debug.add(data);

        // Send the list the server and if it is 'OK' then clear the list
        app.callToServer(data, app.endpoints.statistics).then(function (result) {
            switch (result.status) {
                //If user info = ok
                case 200:
                    debug.add(result);
                    this.clear(type);
                    break;
                default:
                    debug.add(result);
                    break;
            }
        });
    },

    /**
     * Clear the whole list
     */
    clear: function (type) {
        delete this.list[type];
    },
};
