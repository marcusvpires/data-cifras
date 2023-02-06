const listenMessageFromContent = (message) => {
    console.log("Cifra recebida:", message?.targetcifra?.title)
}

browser.runtime.onMessage.addListener(listenMessageFromContent);