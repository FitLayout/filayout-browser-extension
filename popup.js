// Listen for messages
document.addEventListener('DOMContentLoaded', () => {


    const saveCheckbox = document.querySelector('.material-checkbox');
    const hostnameInput = document.getElementById('hostname');
    const uidInput = document.getElementById('UID');
    const comboBox = document.querySelector('.profile');
    const comboBoxLayer = document.querySelector('.activeLayer');

    // load saved profiles
    browser.storage.sync.get(['profiles']).then(result => {
        if (result.profiles) {
            result.profiles.forEach(profile => {
                addProfileToComboBox(profile.uid, profile.hostname, profile.activeLayer);
            });
        }
    }).catch(error => {
        console.error('Error:', error);
    });

    function addProfileToComboBox(uid, hostname, activeLayer) {
        const option = document.createElement('option');
        option.value = uid;
        option.textContent = hostname;
        option.dataset.uid = uid;
        option.dataset.activeLayer = activeLayer;
        comboBox.appendChild(option);
    }



    comboBox.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const uid = selectedOption.value; // load uid
        const hostname = selectedOption.textContent; // load hostname
        const activeLayer = selectedOption.dataset.activeLayer; // load 

        hostnameInput.value = hostname;
        uidInput.value = uid;

        if (!activeLayer) {
            comboBoxLayer.selectedIndex = 0;
        } else {
            comboBoxLayer.value = activeLayer;
        }
    });




    comboBoxLayer.addEventListener('change', () => {
        var activeLayer = document.querySelector('.activeLayer').value;

        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, {
                action: "updatePointerEvents",
                pointerEvents: activeLayer
            });
        }).catch(error => {
            console.error('Error:', error);
        });
    });


    saveCheckbox.addEventListener('change', () => {
        if (saveCheckbox.checked) {
            const uid = uidInput.value;
            const hostname = hostnameInput.value;
            const activeLayer = comboBoxLayer.value;

            if (uid && hostname) {
                addProfileToComboBox(uid, hostname, activeLayer);
                // save profile
                browser.storage.sync.get(['profiles']).then(result => {
                    const profiles = result.profiles || [];
                    profiles.push({ uid: uid, hostname: hostname, activeLayer: activeLayer });
                    browser.storage.sync.set({ profiles: profiles }).then(() => {
                        console.log('Profile saved');
                    });
                }).catch(error => {
                    console.error('Error:', error);
                });
            } else {
                alert('Please fill UID and Hostname fields.');
            }
        }
    });


    document.getElementById('settingsButton').addEventListener('click', function () {
        if (browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        }
    });



    browser.runtime.onMessage.addListener((message) => {
        if (message.action === "displayHTML") {
            const textarea = document.getElementById('serverData');
            textarea.value = message.html;
        }

        if (message.action === "displaySpinner") {
            document.querySelector('.mdl-progress').classList.remove('hidden');
        }
        document.querySelector('.mdl-progress').classList.remove('hidden');

        if (message.action === "done") {
            document.querySelector('.mdl-progress').classList.add('hidden');
        }
    });

    // Generate JSON
    document.getElementById('sendJson').addEventListener('click', () => {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {

            var activeLayer = document.querySelector('.activeLayer').value;

            const serverUrl = document.getElementById('hostname').value.trim();
            const serverUID = document.getElementById('UID').value.trim();

            if (serverUrl && serverUID) {
                browser.tabs.sendMessage(tabs[0].id, { action: "genJson", url: serverUrl, uid: serverUID, layer: activeLayer });
            } else {
                alert('Please enter a server URL a UID.');
                const textarea = document.getElementById('serverData');
                textarea.value = 'Please enter a server URL a UID.';
            }
        });
    });

    // Overlay
    document.getElementById('sendJson').addEventListener('click', function () {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, { action: "fetchHTML" });
        });
    });


    function changeUID() {
        var hostnameInput = document.getElementById('hostname');
        var uidInput = document.getElementById('UID');
        var uidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

        var match = hostnameInput.value.match(uidRegex);

        if (match) {
            uidInput.value = match[0];
            hostnameInput.value = hostnameInput.value.replace(uidRegex, '..');
        }

        uidRegex = /^https:\/\//;
        match = hostnameInput.value.match(uidRegex);
        if (match) {
            hostnameInput.value = hostnameInput.value.replace(uidRegex, '');
        }
    }

    function replaceUIDinHostname() {
        var uidInput = document.getElementById('UID');
        var hostnameInput = document.getElementById('hostname');

        var uidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

        if (uidRegex.test(uidInput.value)) {
            hostnameInput.value = hostnameInput.value.replace(uidRegex, uidInput.value);
        }
    }

    document.getElementById('hostname').addEventListener('change', changeUID);
    document.getElementById('UID').addEventListener('change', replaceUIDinHostname);

});


