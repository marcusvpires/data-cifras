
// abre data cifras ao clicar no icone
const openDataCifras = () => browser.tabs.create({ "url": "/app/home/index.html" });
browser.browserAction.onClicked.addListener(openDataCifras);


const setTarget = (cipher) => {
    browser.storage.local.get("", (res) => {
        const ciphers = res?.ciphers || []

        if (!cipher.id || !cipher.title) throw new Error('Unable to add a target cipher as it has no title or id: ', cipher)
        if (!ciphers.find(c => c.id === cipher.id)) ciphers.push(cipher)
        console.log('Save target', cipher.id)
        console.log(cipher)
        browser.storage.local.set({ ciphers, target: cipher.id }, openDataCifras)
    })
}


// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        switch (message.type) {
            case "set_target_cipher":
                setTarget(message.cipher)
                break;
            default:
                console.error("Unknown message type received");
                break;
        }
        console.log("data cifras: Message received from content script");
    } catch (error) {
        console.error("data cifras: Error occurred in background script", error);
    }
});
