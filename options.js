document.getElementById('clearStorage').addEventListener('click', function() {
    chrome.storage.sync.clear(function() {
        alert('Data was deleted.');
    });
});

document.getElementById('deleteItem').addEventListener('click', function() {
    var select = document.getElementById('serverSelect');
    var selectedUID = select.value;

    // remove from combobox
    select.remove(select.selectedIndex);

    // reload
    chrome.storage.sync.get(['profiles'], function(result) {
        if (result.profiles) {
            // filter
            const filteredProfiles = result.profiles.filter(profile => profile.uid !== selectedUID);

            //save updated
            chrome.storage.sync.set({profiles: filteredProfiles}, function() {
                console.log('Profile removed');
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const comboBox = document.querySelector('.material-combo-box');

    // load
    function addProfileToComboBox(uid, hostname) {
        const option = document.createElement('option');
        option.value = uid;
        option.textContent = hostname;
        comboBox.appendChild(option);
    }

    // load
    chrome.storage.sync.get(['profiles'], function(result) {
        if (result.profiles) {
            result.profiles.forEach(profile => {
                addProfileToComboBox(profile.uid, profile.hostname);
            });
        }
    });
});