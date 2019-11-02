'use strict';

let m = new Monitor();

let printJson = function(o) {
    let debug = document.getElementById('debug');
    let line = document.createElement('p');
    let p = '';

    p = '{ ';
    for (let k in o.data) {
        if (o.data.hasOwnProperty(k)) {
            p += k + ':' + o.data[k].toFixed(2) + ', ';
        }
    }

    line.textContent = p.replace(/, $/, ' },');
    debug.appendChild(line);

    window.scrollTo(0, document.body.scrollHeight);
};

let clearDebug = function() {
    document.getElementById('debug').innerHTML = '';
};

let toggleInstructions = function() {
    toggleClass(document.getElementById('instructions'), 'hidden');
};

let toggleMessages = function() {
    toggleClass(document.getElementById('messages'), 'hidden');
};

let clearMessageTypes = function() {
    let boxes = document.querySelectorAll('input[type=checkbox]:checked');
    boxes.forEach((b) => {
        b.checked = false;
    });
};

document.addEventListener('DOMContentLoaded', function() {
    if (!navigator.bluetooth) {
       toggleClass(document.querySelector('#unsupported'), 'hidden');
       document.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
       return;
    }

    let uiConnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#connect').textContent = 'Disconnect';

        document.querySelector('#toggle_messages').disabled = false;

        document.querySelector('#monitorInformation').textContent = 'Getting monitor information, please wait...';

        m.getMonitorInformation().
            then(information => {
                let mi = document.querySelector('#monitorInformation');
                mi.textContent = information.firmwareRevision + ' | ' +
                        information.hardwareRevision + ' | ' +
                        information.manufacturerName + ' | ' +
                        information.serialNumber;
            });
    };

    let uiPending = function() {
        document.querySelector('#connect').disabled = true;

        document.querySelector('#toggle_messages').disabled = true;
    };

    let uiDisconnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#connect').textContent = 'Connect';

        clearMessageTypes();
        document.querySelector('#monitorInformation').textContent = '';

        document.querySelector('#toggle_messages').disabled = true;
        addClass(document.getElementById('messages'), 'hidden');
    };

    let cbDisconnected = function() {
        m.removeEventListener('disconnect', cbDisconnected);
        uiDisconnected();
    };

    let cbMessage = function(e) {
        printJson(e);
    };

    document.querySelector('#clear').addEventListener('click', function() {
        clearDebug();
    });

    document.querySelector('#toggle_instructions').addEventListener('click', function() {
        toggleInstructions();
    });

    document.querySelector('#toggle_messages').addEventListener('click', function() {
        toggleMessages();
    });

    /*
     * Setup message type change.
     */
    let boxes = document.querySelectorAll('input[type=checkbox]');
    boxes.forEach((element) => {
        element.addEventListener('change', (e) => {
            if (element.checked) {
                m.addEventListener(element.value, cbMessage);
                console.log('notification added for ' + element.value);
            } else {
                m.removeEventListener(element.value, cbMessage);
                console.log('notification removed for ' + element.value);
            }
        });
    });

    document.querySelector('#connect').addEventListener('click', function() {
        uiPending();

        if (m.connected()) {
            cbDisconnected();
            uiDisconnected();
            m.disconnect();
        } else {
            m.connect()
            .then(() => {
                m.addEventListener('disconnect', cbDisconnected);
                uiConnected();
            })
            .catch(error => {
                uiDisconnected();
                console.log(error);
            });
        }
    });

    uiDisconnected();
});
