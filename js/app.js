'use strict';

let m = new Monitor();

let printJson = function(o) {
    let debug = document.getElementById('debug');
    let line = document.createElement('p');
    let p = '';

    p = '{ ';
    for (let k in o.data) {
        if (o.data.hasOwnProperty(k)) {
            p += k + ':' + o.data[k] + ', ';
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
    let cbs = document.querySelectorAll('input[type=checkbox]');
    for (let i = 0; i < cbs.length; i++) {
        cbs[i].checked = false;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    let uiConnected = function() {
        document.querySelector('#connect').disabled = true;
        document.querySelector('#toggle_messages').disabled = false;
        document.querySelector('#clear_messages').disabled = false;
        document.querySelector('#connect').textContent = 'Disconnect';
    };

    let uiPending = function() {
        document.querySelector('#connect').disabled = true;
        document.querySelector('#toggle_messages').disabled = true;
    };

    let uiDisconnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#connect').textContent = 'Connect';

        document.querySelector('#toggle_messages').disabled = true;
        document.querySelector('#clear_messages').disabled = true;
        addClass(document.getElementById('messages'), 'hidden');
    };

    let cbDisconnected = function() {
        console.log('cbDisconnected');
        /* XXX remove all listeners */
        this.removeEventListener(document.querySelector('#message-type').value, cbMessage)
        this.removeEventListener('disconnect', cbDisconnected);

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

    document.querySelector('#clear_messages').addEventListener('click', function() {
        clearMessageTypes();
    });

    let boxes = document.querySelectorAll('input[type=checkbox]')
    boxes.forEach((element) => {
        element.addEventListener('change', (e) => {
            console.log(element.value + ' is checked? ' + element.checked);

            m.addEventListener(element.value, cbMessage);
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
                /* XXX add all selected message types */
                //m.addEventListener(document.querySelector('#message-type').value, cbMessage);
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
