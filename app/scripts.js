console.log("script carregado")

let currentMusic = {
    ID: undefined,
    name: undefined,
    code: undefined
}

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
        currentMusic = {
            ID: createUniqueID(results.targetcifra.title),
            name: results.targetcifra.title + ';' + results.targetcifra.author,
            code: results.targetcifra.code
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

const createUniqueID = (string) => {
    return (string + new Date().toTimeString() + new Date().getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

const db = {
    getAll: (callback = console.log) => {
        browser.storage.local.get("playlists").then((result) => {
            let object = {}
            if (result["playlists"]) object = result["playlists"]
            callback(object)
        }, onError)
    },
    get: (ID = null, callback = () => { }) => {
        db.getAll((object) => callback(object[ID]))
    },
    set: (object, callback = () => { }) => {
        browser.storage.local.set({ ["playlists"]: object }).then(callback, onError)
    },
    create: (ID, element, callback = () => { }) => {
        db.getAll((object) => {
            object[ID] = element
            db.set(object, callback)
        })
    },
    update: (ID, element, callback = () => { }) => {
        db.getAll((object) => {
            object[ID] = { ...object[ID], ...element }
            db.set(object, callback)
        })
    },
    updateMany: (req, callback = () => { }) => {
        db.getAll((object) => {
            Object.entries(req).forEach(([ID, element]) => object[ID] = { ...object[ID], ...element })
            db.set(object, callback)
        })
    },
    updatePlaylistMusicas: (ID, musicaID, musica, callback = () => { }) => {
        db.getAll((object) => {
            if (object[ID].musicas[musicaID]) delete object[ID].musicas[musicaID]
            else object[ID].musicas[musicaID] = musica
            db.set(object, callback)
        })
    },
    delete: (ID, callback = () => { }) => {
        db.getAll((object) => {
            delete object[ID]
            db.set(object, callback)
            callback
        })
    },
    deleteMany: (IDs, callback = () => { }) => {
        db.getAll((object) => {
            IDs.forEach(ID => delete object[ID])
            db.set(object, callback)
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                                  explorer                                  */
/* -------------------------------------------------------------------------- */

/* --------------------------------- musicas -------------------------------- */

const musicaDB = {
    getAll: (callback = console.log) => {
        browser.storage.local.get("musicas").then((result) => {
            let object = {}
            if (result["musicas"]) object = result["musicas"]
            callback(object)
        }, onError)
    },
    get: (ID = null, callback = () => { }) => {
        musicaDB.getAll((object) => callback(object[ID]))
    },
    set: (object, callback = () => { }) => {
        browser.storage.local.set({ ["musicas"]: object }).then(callback, onError)
    },
    create: (ID, element, callback = () => { }) => {
        musicaDB.getAll((object) => {
            object[ID] = element
            musicaDB.set(object, callback)
        })
    },
    update: (ID, element, callback = () => { }) => {
        musicaDB.getAll((object) => {
            object[ID] = { ...object[ID], ...element }
            musicaDB.set(object, callback)
        })
    },
    updateMany: (req, callback = () => { }) => {
        musicaDB.getAll((object) => {
            Object.entries(req).forEach(([ID, element]) => object[ID] = { ...object[ID], ...element })
            musicaDB.set(object, callback)
        })
    },
    updatePlaylistMusicas: (ID, musicaID, musica, callback = () => { }) => {
        musicaDB.getAll((object) => {
            if (object[ID].musicas[musicaID]) delete object[ID].musicas[musicaID]
            else object[ID].musicas[musicaID] = musica
            musicaDB.set(object, callback)
        })
    },
    delete: (ID, callback = () => { }) => {
        musicaDB.getAll((object) => {
            delete object[ID]
            musicaDB.set(object, callback)
            callback
        })
    },
    deleteMany: (IDs, callback = () => { }) => {
        musicaDB.getAll((object) => {
            IDs.forEach(ID => delete object[ID])
            musicaDB.set(object, callback)
        })
    }
}

/* --------------------------------- playlis -------------------------------- */

const openExplorer = () => {
    document.querySelector(".explorer").style.display = "flex"
    updateExplorerPlaylistComponent()
}

const handleCloseExplorer = () => {
    document.querySelector(".explorer").style.display = "none"
}

const openPlaylist = (event) => {
    let element = event.target
    while (element.nodeName !== "TR") elment = element.parentNode
    db.get(element.id, (playlist) => {
        e
        document.getElementById("explorer-url-bar").style.display = "block"
        document.getElementById("explorer-music-head").style.display = "block"
        document.getElementById("playlist-name").innerText = ": " + playlist.name
    })
}

const explorerRowEvent = (event) => {
    let element = event.target
    while (element.nodeName !== "TR") element = element.parentNode
    if (element.className === "selected") element.className = ""
    else element.className = "selected"
}

const createPlaylistTable = (ID, playlist) => {
    const tr = createHTML("tr", [["id", ID]])
    const icon = createHTML("td", [["data-label", "icon"], ["style", "width: 20px;"]])
    icon.appendChild(createHTML("img", [["class", "folder-icon"], ["src", "public/folder.png"]]))
    tr.appendChild(icon)
    const name = createHTML("td", [["data-label", "name"]])
    name.innerText = playlist?.name
    tr.appendChild(name)

    tr.addEventListener("click", explorerRowEvent)
    tr.addEventListener("dblclick", openPlaylist)
    document.getElementById("playlist-tbody").appendChild(tr)
}

const updateExplorerPlaylistComponent = () => {
    db.getAll((playlists) => {
        document.getElementById("playlist-tbody").innerText = ""
        Object.entries(playlists).map(([ID, playlist]) => createPlaylistTable(ID, playlist))
    })
}

const handleDelete = () => {
    const targets = document.querySelectorAll(".selected")
    const IDs = []
    targets.forEach((target) => IDs.push(target.id))
    db.deleteMany(IDs, updateExplorerPlaylistComponent)
}

const handleRename = () => {
    const targets = document.querySelectorAll(".selected")
    const novoNome = window.prompt("Escreva um novo nome")
    const object = {}
    targets.forEach((target, index) => {
        if (index !== 0) object[target.id] = { name: novoNome + ` (${index})` }
        else object[target.id] = { name: novoNome }
    })
    db.updateMany(object, updateExplorerPlaylistComponent)
}

const handleNew = () => {
    const name = window.prompt("Digite o nome")
    db.create(createUniqueID(name), { name: name, musicas: {} }, updateExplorerPlaylistComponent)
}

const createHTML = (tag, attributes = []) => {
    const element = document.createElement(tag)
    attributes.forEach(([name, value]) => {
        element.setAttribute(name, value)
    })
    return element
}

/* -------------------------------------------------------------------------- */
/*                           popup adcionar a lista                           */
/* -------------------------------------------------------------------------- */

const updateList = (event) => {
    let element = event.target
    while (element.nodeName !== "DIV") element = element.parentNode
    db.updatePlaylistMusicas(element.id, currentMusic.ID, currentMusic.name, updateAddToList)
}

const constructorAddToList = (playlists) => {
    console.log("constructorAddToList")
    const container = document.querySelector(".adcionar-a-lista")
    container.innerText = ""
    let anyChecked = false
    playlists.forEach(([ID, name, checked]) => {
        const element = createHTML("div", [["id", ID]])
        const input = createHTML("input", [["type", "checkbox"], ["name", ID]])
        input.checked = checked
        if (checked) anyChecked = true
        const nameElement = createHTML("span")
        nameElement.innerText = name
        element.appendChild(input)
        element.appendChild(nameElement)
        element.addEventListener("click", updateList)
        container.appendChild(element)
    })

    if (anyChecked) {
        musicaDB.create(currentMusic.ID, {
            name: currentMusic.name,
            code: currentMusic.code
        })
    } else {
        musicaDB.delete(currentMusic.ID)
    }

}

const updateAddToList = () => {
    db.getAll(playlists => {
        const result = []
        Object.entries(playlists).forEach(([ID, playlist]) => {
            result.push([ID, playlist.name, playlist.musicas[currentMusic.ID] ? true : false])
        })
        constructorAddToList(result)
    })
}

const toggleAddList = () => {
    const target = document.querySelector(".adcionar-a-lista")
    if (target.style.display === "block") {
        target.style.display = "none"
        document.getElementById("toggleController").style.right = "0"
    } else {
        target.style.display = "block"
        document.getElementById("toggleController").style.right = "-15rem"
        updateAddToList()
    }

}

// função principal do sistema, executada em quanto o site é carregado
// adciona todas as funções do controller
const main = () => {
    // carrega a targetcifra e compila na página 
    getTargetCifra()

    // esconde ou mostra o menu de controle
    document.getElementById("toggleController").addEventListener("click", handleToggleController)

    // sistema
    document.getElementById("add-lista").addEventListener("click", toggleAddList)
    document.getElementById("my-lists").addEventListener("click", openExplorer)

    // configurações

    document.getElementById("increaseSize").addEventListener("click", handleIncreaseSize)
    document.getElementById("decreaseSize").addEventListener("click", handleDecreaseSize)
    document.getElementById("direction").addEventListener("click", handleDirection)
    document.getElementById("toggleTablatura").addEventListener("click", handleToggleTablatura)

    // auto rolagem

    document.getElementById("toggleAutoScroll").addEventListener("click", handleToggleAutoScroll)
    document.getElementById("scrollSpeed").addEventListener("input", handleScrollSpeed)

    // explorer

    updateExplorerPlaylistComponent()

    document.getElementById("close").addEventListener("click", handleCloseExplorer)
    document.getElementById("delete").addEventListener("click", handleDelete)
    document.getElementById("rename").addEventListener("click", handleRename)
    document.getElementById("new").addEventListener("click", handleNew)
}

main()