document.getElementById('clearStorage').addEventListener('click', function () {
    browser.storage.sync.clear().then(() => {
        alert('Data was deleted.');
    });
});

document.getElementById('deleteItem').addEventListener('click', function () {
    var select = document.querySelector('.profile');
    var selectedUID = select.value;

    // remove from combobox
    select.remove(select.selectedIndex);

    // reload
    browser.storage.sync.get(['profiles']).then(result => {
        if (result.profiles) {
            // filter
            const filteredProfiles = result.profiles.filter(profile => profile.uid !== selectedUID);

            //save updated
            browser.storage.sync.set({ profiles: filteredProfiles }).then(() => {
                console.log('Profile removed');
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const comboBox = document.querySelector('.profile');

    // load
    function addProfileToComboBox(uid, hostname) {
        const option = document.createElement('option');
        option.value = uid;
        option.textContent = hostname;
        comboBox.appendChild(option);
    }

    // load
    browser.storage.sync.get(['profiles']).then(result => {
        if (result.profiles) {
            result.profiles.forEach(profile => {
                addProfileToComboBox(profile.uid, profile.hostname);
            });
        }
    });
});