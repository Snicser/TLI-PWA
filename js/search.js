let theQRScanner;

const QRCode = {
    contentType: '',
    available: true,

    /**
     * Start scanning the QR Code
     */
    startScanning: function () {

        const scanner = document.createElement("div");
        scanner.setAttribute("id", "reader");
        scanner.style.minHeight = "50vh";

        const refPoint = document.getElementById("insert-reader-after");
        debug.add(refPoint);

        let cameraID = 0;
        const config = {
            fps: 10,
            qrbox: 150,
            aspectRatio: 1.333334 /* Maybe change to 1.777778 for 16:9 */
        };

        Html5Qrcode.getCameras().then(devices => {
            /**
             * devices would be an array of objects of type:
             * { id: "id", label: "label" }
             */

            debug.add(devices);

            if (devices && devices.length) {
                cameraID = devices[0].id;

                let displayModus;
                if (screen.width < 480) {
                    // Mobile
                    displayModus = {facingMode: {exact: "environment"}}
                } else {
                    // Not mobile
                    displayModus = cameraID;
                }

                debug.add(displayModus);

                theQRScanner = new Html5Qrcode("reader", /* verbose = */ true);
                insertAfter(refPoint, scanner);
                theQRScanner.start(displayModus, config,
                    qrCodeMessage => {

                        if (this.available) {

                            // Strip of the HTTPS and get the id and access code
                            if (qrCodeMessage.includes(app.servername)) {

                                debug.add(qrCodeMessage);

                                //Stop the scanner
                                QRCode.stopScanner();

                                //Add the restart button
                                document.querySelector('.restart-button').style.display = 'block';

                                // Pop up animation
                                document.querySelector('.success-checkmark').style.display = 'block';

                                this.available = false;

                                window.setTimeout(function () {
                                    QRCode.available = true;
                                }, 3000);

                                let fullCode = qrCodeMessage;
                                fullCode = fullCode.replace(/\/$/, "")
                                fullCode = fullCode.replace(app.servername, '');
                                fullCode = fullCode.split('/');

                                debug.add(fullCode);

                                let groupSub = fullCode[1].split('-');
                                this.contentType = fullCode[0];

                                debug.add(groupSub);

                                // Fill boxes in QR Code scan page
                                document.getElementById('group-id').value = groupSub[0];
                                document.getElementById('group-code').value = groupSub[1];
                            }
                        }
                    },
                    errorMessage => {
                        // Parse error, ignore it.
                    })
                    .catch(error => {
                        debug.add(`Unable to start scanning, error: ${error}`);

                        // Start failed, replace the text 
                        document.getElementById("qr-status-text").innerHTML = "Het lukte niet om te beginnen met scannen... <br>Vul de velden hieronder handmatig in."
                        document.getElementById("reader").remove();
                    });
            }
        }).catch(error => {
            document.getElementById("qr-status-text").innerHTML = "Het lukte niet om te beginnen met scannen... <br>Vul de velden hieronder handmatig in."
            debug.add(`Something went wrong with getting the camera, error: ${error}`);
        });
    },

    // This code should be get called after QRCode was read
    submitCode: function (groupID, accessCode) {
        if (groupID.length === 0 || accessCode.length === 0) {
            return;
        }

        debug.add(groupID, accessCode);

        let theEndPoint = "";
        if (this.contentType === "g") {
            theEndPoint = app.endpoints.group;
        } else if (this.contentType === "c") {
            theEndPoint = app.endpoints.content;
        }

        const data = {
            "username": user.username,
            "token": user.token,
            "method": "subscribe",
            "id": groupID,
            "access": accessCode
        }

        debug.add(theEndPoint, data);

        app.callToServer(data, theEndPoint).then(function (result) {
            switch (result.status) {
                //If user info = ok
                case 200:

                    debug.add(result);

                    // Store data into localStorage
                    database.add(`group.${result.data.id}`, result.data);

                    app.loadPage('search.html');

                    break;
                default:
                    debug.add(result);
                    document.getElementById("qr-status-text").innerHTML = "Het ziet er naar uit de informatie niet beschikbaar is";
                    break;
            }
        });

    },

    /**
     * This function stops scanning the QR Code
     * After it stops it will clear the existing canvas,
     * and remove the DIV element show to don't see a big black square
     */
    stopScanner: function () {
        try {
            // Check if the element exists otherwise stop the code
            if (document.getElementById("reader")) {
                theQRScanner.stop();
                theQRScanner.clear();
                document.getElementById("reader").remove();
            } else {
                return;
            }
        } catch (error) {
            debug.add(error);
            console.info(`Something went wrong when try to stop and clear the scanner: ${error}`)
        }
    },

    /**
     * This function restarts the scanner
     */
    restartScanner: function () {
        // Add the restart button
        document.querySelector('.restart-button').style.display = 'none';

        // Remove Pop up animation
        document.querySelector('.success-checkmark').style.display = 'none';

        // Restart the scanner
        QRCode.startScanning();
    }
}

/**
 * @param {HTMLElement} referenceNode
 * Element you want to insert after the previous element
 *
 * @param {HTMLDivElement|T} newNode
 * Element you want to be inserted
 */
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * TODO DOCUMENTION
 */
function updateDropDown() {
    // What is 'let G' ??? {Well, let means define, and if you'd read the documentation code below it's the fa-chevron-up.}
    let g = document.querySelectorAll(".fa-chevron-down");
    for (let i = 0, len = g.length; i < len; i++) {

        (function (index) {
            g[i].onclick = function () {
                debug.add(index);

                let listItems = document.querySelectorAll(".list-item")
                let listIcons = document.querySelectorAll(".fa-chevron-down")

                if (listItems[index].style.height == "auto") {

                    listItems[index].style.height = "50px";
                    listIcons[index].style.transform = "rotate(0deg)";

                } else {

                    listItems[index].style.height = "auto";
                    listIcons[index].style.transform = "rotate(180deg)";

                }
                listIcons[index].style.height = "20px";
            }
        })(i);
    }
}