// Listen for messages
document.addEventListener('DOMContentLoaded', () => {


    const saveCheckbox = document.querySelector('.material-checkbox');
    const hostnameInput = document.getElementById('hostname');
    const uidInput = document.getElementById('UID');
    const comboBox = document.querySelector('.material-combo-box');

    // load saved profiles
    chrome.storage.sync.get(['profiles'], function(result) {
        if (result.profiles) {
            result.profiles.forEach(profile => {
                addProfileToComboBox(profile.uid, profile.hostname);
            });
        }
    });

    function addProfileToComboBox(uid, hostname) {
        const option = document.createElement('option');
        option.value = uid;
        option.textContent = hostname;
		option.dataset.uid = uid;
        comboBox.appendChild(option);
    }

	comboBox.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const uid = selectedOption.value; // load uid
        const hostname = selectedOption.textContent; // load hostname


        hostnameInput.value = hostname;
        uidInput.value = uid;
    });

    saveCheckbox.addEventListener('change', function() {
        if (saveCheckbox.checked) {
            const uid = uidInput.value;
            const hostname = hostnameInput.value;

            if (uid && hostname) {
                addProfileToComboBox(uid, hostname);
                // save profile
                chrome.storage.sync.get(['profiles'], function(result) {
                    const profiles = result.profiles || [];
                    profiles.push({uid: uid, hostname: hostname});
                    chrome.storage.sync.set({profiles: profiles}, function() {
                        console.log('Profile saved');
                    });
                });
            } else {
                alert('Please fill UID and Hostname fields.');
            }
        }
    });


	document.getElementById('settingsButton').addEventListener('click', function() {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		}
	});



    chrome.runtime.onMessage.addListener((message) => {
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
});


// Generate JSON
document.getElementById('sendJson').addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

		
		const serverUrl = document.getElementById('hostname').value.trim();
		const serverUID = document.getElementById('UID').value.trim();
		if (serverUrl && serverUID) {
			chrome.tabs.sendMessage(tabs[0].id, { action: "genJson", url: serverUrl, uid: serverUID });
        } else {
            alert('Please enter a server URL a UID.');
			const textarea = document.getElementById('serverData');
			textarea.value = 'Please enter a server URL a UID.';
        }

		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			files: ['contentScript.js']
		});
	});
});

// Overlay
document.getElementById('sendJson').addEventListener('click', function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { action: "fetchHTML" });
	});
});





