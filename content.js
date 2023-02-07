
// extrai a cifra em HTML e envia para o background
const scrapCode = () => {
    const title = document.querySelector(".t1").innerText
    const author = document.querySelector(".t3").innerText
    const cifra = document.querySelector(".cifra_cnt > pre")
    const code = new XMLSerializer().serializeToString(cifra);
    console.log("data cifra carregado:", title)
    if (code) browser.runtime.sendMessage({"targetcifra": {
        title, author, code
    }});
    else alert("erro ao coletar a cifra")
}

// cria o botão no menu do cifra club
const createButton = () => {
    try {
        document.querySelectorAll("#datacifrabutton").forEach(element => element.remove())

        icon_url = browser.extension.getURL("media/logo-96-white.png"); 
        const button = document.createElement("li")
        button.innerText = "Data cifra"
        button.id = "datacifrabutton"
        button.classList.add("cifra-button")
        const image = document.createElement("img")
        image.src = icon_url
        image.classList.add("cifra-image") 
        button.appendChild(image)
        const container = document.querySelector("#side-menu > ul")
        if (container) {
            container.insertBefore(button, container.firstChild)
            container.addEventListener("click", scrapCode)
        }
    } catch (err) {
        console.log(err)
    }
}

createButton()