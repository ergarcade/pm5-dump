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

    window.scrollTo(0,document.body.scrollHeight);
};

let clearDebug = function() {
    document.getElementById('debug').innerHTML = '';
}

let toggleInstructions = function() {
    toggleClass(document.getElementById('instructions'), 'hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    let uiConnected = function() {
        document.querySelector('#connect').disabled = true;
        document.querySelector('#disconnect').disabled = false;

        clearDebug();
    };

    let uiPending = function() {
        document.querySelector('#connect').disabled = true;
        document.querySelector('#disconnect').disabled = true;
    };

    let uiDisconnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#disconnect').disabled = true;
    };

    let cbDisconnected = function() {
        console.log('cbDisconnected');
        this.removeEventListener('multiplexed-information', cbMultiplexed)
        this.removeEventListener('disconnect', cbDisconnected);

        uiDisconnected();
    };

    let cbMultiplexed = function(e) {
        printJson(e);
    };

    document.querySelector('#clear').addEventListener('click', function() {
        clearDebug();
    });

    document.querySelector('#toggle_instructions').addEventListener('click', function() {
        toggleInstructions();
    });

    document.querySelector('#connect').addEventListener('click', function() {
        uiPending();

        m.connect()
        .then(() => {
            return m.getMonitorInformation();
        })
        .then(information => {
            return m.addEventListener('multiplexed-information', cbMultiplexed)
            .then(() => {
                uiConnected();
                return m.addEventListener('disconnect', cbDisconnected);
            })
            .catch(error => {
                uiDisconnected();
                console.log(error);
            });
        })
        .catch(error => {
            uiDisconnected();
            console.log(error);
        });
    });

    document.querySelector('#disconnect').addEventListener('click', function() {
        m.removeEventListener('multiplexed-information', cbMultiplexed)
        .then(() => {
            return m.disconnect();
        });
    });
});
