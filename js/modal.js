const modal = {
    /**
     * Creates and shows a modal to the user
     *
     * @param {string} id
     * The ID of the modal
     *
     * @param {string} title
     * The title of the modal
     *
     * @param {string} bodyText
     * The text you want to show to the user
     *
     * @param {string} button1Text
     * The text on button 1
     *
     * @param {string} button1ID
     * The id on button 1
     *
     * @param {EventListener|EventListenerObject} button1Callback
     * Callback function -> What the function need to execute when the button gets pressed
     *
     * @param {string} button2Text
     * The text on button 2
     *
     * @param {string} button2ID
     * The id on button 2
     *
     * @param {((this:HTMLElement, ev: HTMLElementEventMap[string]) => any)|EventListenerObject} button2Callback
     * Callback function -> What the function need to execute when the button gets pressed
     */
    show: function (
        id,
        title,
        bodyText,
        button1Text,
        button1ID,
        button1Callback = function () {
        },
        button2Text = null,
        button2ID = null,
        button2Callback = null
    ) {
        // Check if modal exists otherwise delete old modal
        if (document.getElementById(id)) {
            document.getElementById(id).remove();
        }

        // Create modal
        let HTMLStructure = `
            <div class="position-fixed overlay active">
                <div class="custom-modal position-fixed active" id="custom-modal">
                    <div class="custom-modal-header mx-2 mt-1 d-flex justify-content-between align-items-center">
                        <div class="custom-modal-title">${title}</div>
                        <button onclick="modal.close('${id}')" class="close-button border-0">&times;</button>
                    </div>
                    
                    <div class="custom-modal-body mx-2 my-1 d-flex flex-column">
                        <div id="support-text">${bodyText}</div>
                        <div class="d-flex justify-content-around mt-2 mb-1">
                            <button data-submit-button class="cancel-button general-modal-buttons border-0 py-2 px-3 my-2" id="${button1ID}">${button1Text}</button>`;

        // Check if there is second button needed...
        if (button2Text) {
            HTMLStructure =
                HTMLStructure +
                `<button data-submit-button class="ok-button general-modal-buttons border-0 py-2 px-3 my-2" id="${button2ID}">${button2Text}</button>`;
        }

        HTMLStructure += `</div>
                    </div>
                </div>            
            </div>`;

        debug.add(HTMLStructure);

        // Append to body
        let node = document.createElement("div");
        node.setAttribute("id", id);
        node.innerHTML = HTMLStructure;
        document.querySelector("body").appendChild(node);

        // Callbacks function executes
        document
            .getElementById(button1ID)
            .addEventListener("click", button1Callback);
        if (button2Text)
            document
                .getElementById(button2ID)
                .addEventListener("click", button2Callback);
    },

    /**
     * Closes the modal
     *
     * @param {string} id
     * The modal ID is needed to close the modal.
     * The modal ID is the ID you given in modal.show() first parameter.
     */
    close: function (id) {
        // Check if modal exists
        if (document.getElementById(id)) {
            document.getElementById(id).remove();
        } else {
            debug.add(`Modal with the ID: '${id}' does not exist...`);
        }
    },
};