console.log("script carregado")

const onError = (err) => console.log(err)

// carrega a targetcifra e compila na página 
const getTargetCifra = () => {
    let gettingAllStorageItems = browser.storage.local.get("targetcifra");
    gettingAllStorageItems.then((results) => {
        const code = results.targetcifra.code
        // usa o DOMParser pois o innerHTML é bloqueado em extensões
        var doc = new DOMParser().parseFromString(code, "text/html");
        const component = doc.querySelector("pre")
        component.id = "cifra-code"
        document.querySelector("body").appendChild(component)
    }, onError);
}

getTargetCifra()