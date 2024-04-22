if ('function' === typeof importScripts) {
  importScripts('js/browser-polyfill.min.js');
}

function screenshot() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (browser.runtime.lastError) {
        return reject(new Error(browser.runtime.lastError.message));
      }

      if (tabs.length === 0) {
        return reject(new Error("No active tab"));
      }

      const currentTab = tabs[0];
      browser.tabs.captureVisibleTab(currentTab.windowId, { format: 'png' }).then(dataScreenshot => {
        if (browser.runtime.lastError) {
          return reject(new Error(browser.runtime.lastError.message));
        }

        const base64Data = dataScreenshot.replace(/^data:image\/png;base64,/, '');

        console.log("Screenshot taken: ", base64Data);
        resolve(base64Data);
      });
    });
  });
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "captureTab") {
    screenshot().then(dataScreenshot => {
      sendResponse({ dataScreenshot: dataScreenshot });
    }).catch(error => {
      console.error('Error: screenshot:', error);
      sendResponse({ error: error.toString() });
    });
    return true;
  }
});