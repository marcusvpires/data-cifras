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
        component.contentEditable = true
        component.removeAttribute("xmlns")
        document.querySelector("#cifra").appendChild(component)
    }, onError);
}

// função executada ao apertar a seta ao lado do menu de controle
// esconde ou mostra o menu de controle
const handleToggleController = () => {
    const button = document.getElementById("toggleController")
    const controller = document.getElementById('controller')
    if (controller.style.translate === "-100%") {
        controller.style.translate = "0"
        button.innerText = "◂"
    } else {
        controller.style.translate = "-100%"
        button.innerText = "▸"
    }
}

/* -------------------------------------------------------------------------- */
/*                                configurações                               */
/* -------------------------------------------------------------------------- */

// tamanho da letra da cifra

let fontSize = 1.5

const handleDecreaseSize = () => {
    const cifraCode = document.getElementById("cifra-code")
    fontSize = fontSize - 0.1
    cifraCode.style.fontSize = fontSize + "rem"
    updateCollum()
}
const handleIncreaseSize = () => {
    const cifraCode = document.getElementById("cifra-code")
    fontSize = fontSize + 0.1
    cifraCode.style.fontSize = fontSize + "rem"
    updateCollum()
}

// muda entre modo linha e modo coluna

const handleDirection = () => {
    const cifraCode = document.getElementById("cifra-code")
    const button = document.getElementById("direction")
    if (button.innerText === "Modo coluna") {
        button.innerHTML = "<span>Modo linha</span>"
        cifraCode.style.margin = "auto 0"
        cifraCode.style.padding = "0 50vw"

        let columnCount = 1
        while (cifraCode.clientHeight > window.innerHeight - 60 || columnCount > 20 ) {
            cifraCode.style.columnCount = columnCount
            columnCount++
        }
    }
    else {
        cifraCode.style.margin = "0 auto"
        cifraCode.style.padding = "50vh 0"
        cifraCode.style.columnCount = 1
        button.innerHTML = "<span>Modo coluna</span>"
    }
}

const updateCollum = () => {
    const button = document.getElementById("direction")
    if (button.innerText === "Modo linha") {
        const cifraCode = document.getElementById("cifra-code")

        let columnCount = 1
        do {
            cifraCode.style.columnCount = columnCount
            columnCount++
        } while (cifraCode.clientHeight > window.innerHeight - 60 || columnCount > 20 )
    }
}

const handleToggleTablatura = () => {
    const button = document.getElementById("toggleTablatura")
    const tbList = document.querySelectorAll(".tablatura")
    console.log(button.style.backgroundColor, button.style.backgroundColor === "#2c2637")
    if (button.style.backgroundColor === "rgb(95, 86, 111)") {
        button.style.backgroundColor = "#a191c0"
        tbList.forEach(tb => {
            tb.style.display = "block"
        })
    } else {
        button.style.backgroundColor = "rgb(95, 86, 111)"
        tbList.forEach(tb => {
            tb.style.display = "none"
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                                auto rolagem                                */
/* -------------------------------------------------------------------------- */

let scrolldelay = 0


// loop que executa a rolagem infinita
const autoScrollLoop = () => {
    document.querySelector("#cifra").scrollBy(1, 1);
    if (scrolldelay) setTimeout(autoScrollLoop, scrolldelay);
}

// função executada ao apertar play ou pause
const handleToggleAutoScroll = () => {
    const button = document.getElementById("toggleAutoScroll")
    const direction = document.getElementById("direction")
    if (scrolldelay) {
        button.style.paddingLeft = "0.6rem"
        button.src = "./public/play-button.png"
        scrolldelay = 0
    }
    else {
        button.style.paddingLeft = "0.5rem"
        button.src = "./public/pause.png"
        scrolldelay = document.getElementById("scrollSpeed").value
        autoScrollLoop()
    }
}

// muda a velocidade, mapeia o input range
const handleScrollSpeed = (event) => {
    document.getElementById("scrollSpeedDisplay").innerText = event.target.value
    scrolldelay = event.target.value
}

// função principal do sistema, executada em quanto o site é carregado
// adciona todas as funções do controller
const main = () => {
    // carrega a targetcifra e compila na página 
    getTargetCifra()
    
    // esconde ou mostra o menu de controle
    document.getElementById("toggleController").addEventListener("click", handleToggleController)

    // configurações
    
    document.getElementById("increaseSize").addEventListener("click", handleIncreaseSize)
    document.getElementById("decreaseSize").addEventListener("click", handleDecreaseSize)
    document.getElementById("direction").addEventListener("click", handleDirection)
    document.getElementById("toggleTablatura").addEventListener("click", handleToggleTablatura)
    
    // auto rolagem

    document.getElementById("toggleAutoScroll").addEventListener("click", handleToggleAutoScroll)
    document.getElementById("scrollSpeed").addEventListener("input", handleScrollSpeed)
}

main()