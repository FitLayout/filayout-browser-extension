chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['contentScript.js']
  });
});

function screenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (tabs.length === 0) {
        return reject(new Error("No active tab"));
      }

      const currentTab = tabs[0];
      chrome.tabs.captureVisibleTab(currentTab.windowId, {format: 'png'}, (dataScreenshot) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        const base64Data = dataScreenshot.replace(/^data:image\/png;base64,/, '');

        console.log("Screenshot taken: ", base64Data);
        resolve(base64Data);
      });
    });
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "captureTab") {
      screenshot().then(dataScreenshot => {
          sendResponse({dataScreenshot: dataScreenshot});
      }).catch(error => {
          console.error('Error: screenshot:', error);
          sendResponse({error: error.toString()});
      });
      return true;
    }
});