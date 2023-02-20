
// abre data cifras ao clicar no icone
const openDataCifras = () => browser.tabs.create({ "url": "/app/index.html" });
browser.browserAction.onClicked.addListener(openDataCifras);

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        // Handle different message types
        switch (message.type) {
            case "set_target_cipher":
                // Save target cipher to local storage
                browser.storage.local.set({ targetCipher: message.targetCipher }).than(openDataCifras())
                
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
