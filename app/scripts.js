/* -------------------------------------------------------------------------- */
/*                              variáveis globais                             */
/* -------------------------------------------------------------------------- */

// musica aberta no momento
let target = {
    id: undefined,
    name: undefined,
    code: undefined,
    playlists: {},
    saved: false,
}

/* -------------------------------------------------------------------------- */
/*                             funções auxiliares                             */
/* -------------------------------------------------------------------------- */

const onError = (err) => console.log(err)

const createID = () => {
    const dt = new Date()
    return (dt.toTimeString() + dt.getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

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
        const tg = results.targetcifra

        target = {
            id: createID(),
            title: tg.title,
            author: tg.author,
            playlists: {},
            code: tg.code,
            saved: false,
        }
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

const createHTML = (tag, attributes = []) => {
    const element = document.createElement(tag)
    attributes.forEach(([name, value]) => {
        element.setAttribute(name, value)
    })
    return element
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
        while (cifraCode.clientHeight > window.innerHeight - 60 || columnCount > 20) {
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
        } while (cifraCode.clientHeight > window.innerHeight - 60 || columnCount > 20)
    }
}

const handleToggleTablatura = () => {
    const button = document.getElementById("toggleTablatura")
    const tbList = document.querySelectorAll(".tablatura")
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

let scrolldelay = 30


// loop que executa a rolagem infinita
const autoScrollLoop = () => {
    window.scrollBy(1, 1);
    if (scrolldelay) setTimeout(autoScrollLoop, scrolldelay);
}

// função executada ao apertar play ou pause
const handleToggleAutoScroll = () => {
    const button = document.getElementById("toggleAutoScroll")
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

/* -------------------------------------------------------------------------- */
/*                               banco de dados                               */
/* -------------------------------------------------------------------------- */

const storage = browser.storage.local

/* -------------------------------- playlists ------------------------------- */

const getPlaylists = (callback) => storage.get("playlists").then((response) => {
    let playlists = {}
    if (response.playlists) playlists = response.playlists
    callback(playlists)
}, onError)


const createPlaylist = (callback) => {
    const name = window.prompt("Digite o nome da playlists")
    getPlaylists(playlists => {
        playlists[createID()] = { name, cifras: {} }
        storage.set({ "playlists": playlists }).then(callback)
    })
}

/* --------------------------------- cifras --------------------------------- */

const getCifras = (callback) => storage.get("cifras").then((response) => {
    let cifras = {}
    if (response.cifras) cifras = response.cifras
    callback(cifras)
}, onError)


const createCifra = () => {
    getCifras(cifras => {
        cifras[target.id] = {
            title: target.title,
            author: target.author,
            date: new Date(),
            playlists: target.playlists,
            code: target.code
        }
        target.saved = true
        storage.set({ "cifras": cifras })
    })
}

const deleteCifra = () => {
    getCifras(cifras => {
        delete cifras[target.id]
        target.saved = false
        storage.set({ "cifras": cifras })
    })
}

/* -------------------------------------------------------------------------- */
/*                              adicionar à lista                             */
/* -------------------------------------------------------------------------- */

const constructorAddToList = (list) => {
    const container = document.getElementById("playlistcontainer")
    container.innerText = ""

    list.forEach(playlist => {
        const component = createHTML("div", [["id", playlist.id]])

        const input = createHTML("input", [["type", "checkbox"], ["name", playlist.id]])
        input.checked = playlist.contain

        const name = createHTML("span")
        name.innerText = playlist.name

        component.appendChild(input)
        component.appendChild(name)
        component.addEventListener("click", updatePlaylistCifras)
        container.appendChild(component)
    })
}

const updateAddToList = () => {
    getPlaylists(playlists => {
        let anyContain = false
        console.log(playlists)
        const list = Object.entries(playlists).map(([id, playlist]) => {
            const contain = (playlist.cifras[target.id] ? true : false)
            console.log("a", contain, playlist.cifras[target.id])
            if (contain) anyContain = true
            return ({ id, name: playlist.name, contain })
        })
        if (anyContain) createCifra()
        else if (!anyContain && target.saved) deleteCifra()

        constructorAddToList(list)
    })
}

const toggleAddToList = () => {
    const target = document.querySelector(".add-to-list")
    if (target.style.display === "block") {
        target.style.display = "none"
        document.getElementById("toggleController").style.right = "0"
    } else {
        target.style.display = "block"
        document.getElementById("toggleController").style.right = "-15rem"
        updateAddToList()
    }
}

const toggleNewPlaylist = () => {
    createPlaylist(updateAddToList)
}

const updatePlaylistCifras = (event) => {
    let element = event.target
    while (element.nodeName !== "DIV") element = element.parentNode
    const id = element.id
    getPlaylists(playlists => {
        console.log(playlists[id].cifras[target.id])
        if (playlists[id].cifras[target.id]) {
            delete target.playlists[id]
            delete playlists[id].cifras[target.id]
        }
        else {
            target.playlists[id] = true
            playlists[id].cifras[target.id] = true
        }
        storage.set({ "playlists": playlists }).then(updateAddToList)
    })
}

// função principal do sistema, executada em quanto o site é carregado
// adciona todas as funções do controller
const main = () => {
    // carrega a targetcifra e compila na página 
    getTargetCifra()

    // esconde ou mostra o menu de controle
    document.getElementById("toggleController").addEventListener("click", handleToggleController)
    
    // sistema
    document.getElementById("toggle-add-to-list").addEventListener("click", toggleAddToList)
    document.getElementById("novaplaylist").addEventListener("click", toggleNewPlaylist)
    document.getElementById("my-lists").addEventListener("click", () => {
        window.location.href="explorer.html";
    })

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