/**
 * Add a click event listener to the browser action icon.
 * When clicked, retrieve the 'target' value from local storage and 
 * create a new tab with a URL based on the value.
 */

browser.browserAction.onClicked.addListener(() => {
    browser.storage.local.get('target', res => {
        const url = res.target ? '/app/home/index.html' : '/app/library/index.html'
        browser.tabs.create({ "url": url })
    })
});

/**
 * Set the target cipher in local storage and call openDataCifras to open the extension page.
 * @param {Object} cipher - The cipher object to set as the target cipher.
 * @throws {Error} Throws an error if the cipher object has no title or id.
 */

const setTarget = (cipher) => {
    browser.storage.local.get("ciphers", (response) => {
        const ciphers = response?.ciphers || []
        if (!ciphers.find(c => c.id === cipher.id)) ciphers.push(cipher)
        browser.storage.local.set({ ciphers, target: cipher.id }, () => browser.tabs.create({ "url": '/app/home/index.html' }))
    })
}

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        console.log("Messages from the content script:", message)
        if (message.type === "logoURL") sendResponse({ type: "logoURL", logoURL: browser.runtime.getURL("./media/logo-48.png") })
        else if (message.type === "target") {
            sendResponse({ message: "Cipher recived" })
            setTarget(message.cipher)
        }
    } catch (error) {
        console.error("data cifras: Error occurred in background script", error);
        console.log("Messages from the content script:", message)
    }
});
