
const openPage = () => {
    console.log("abrindo página")
    browser.tabs.create({
      "url": "/app/index.html"
    });
  }

const onError = (err) => console.error(err)

// salva targetcifra na memória
const storeTarget = (targetcifra) => {
    let storingNote = browser.storage.local.set({ "targetcifra": targetcifra });
    storingNote.then(openPage, onError)
}

// aciona quando uma menssagem é recebida do content
const trigger = (message) => {
    console.log("Cifra recebida:", message?.targetcifra?.title)
    if (message?.targetcifra) storeTarget(message?.targetcifra)
    else console.error("[message.targetcifra] não existe:", message)
}

browser.runtime.onMessage.addListener(trigger);