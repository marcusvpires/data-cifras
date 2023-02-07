/* -------------------------------------------------------------------------- */
/*                                   assets                                   */
/* -------------------------------------------------------------------------- */

const createUniqueID = (string) => {
    return (string + new Date().toTimeString() + new Date().getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

const onSusses = (message = "sucesso") => console.info(message)

/* -------------------------------------------------------------------------- */
/*                                   classes                                  */
/* -------------------------------------------------------------------------- */

class Musica {
    constructor(title, author, code) {
        this[createUniqueID(title)] = {
            title: title,
            author: author,
            code: code,
            date: new Date()
        }
    }
}

class Playlist {
    constructor(name, musicas = []) {
        this.name = name;
        this.musicas = musicas
    }
    get ID() {
        return createUniqueID(this.name)
    }
}

/* -------------------------------------------------------------------------- */
/*                             Middleware playlist                            */
/* -------------------------------------------------------------------------- */

class db {
    constructor(type) {
        if (type !== "playlists" && type !== "playlists")
            console.warn("DB criada com um tipo desconhecido")
        this.type = type
    }

    defaultCallback(result) {
        console.log("resultado", result)
    }

    onError(error) {
        console.error(error)
    }

    getAll(callback = this.defaultCallback) {
        browser.storage.local.get(this.type).then((result) => {
            let object = {}
            if (result[this.type]) object = result[this.type]
            callback(object)
        }, this.onError)
    }
    
    get(ID = null, callback = this.defaultCallback) {
        this.getAll((object) => callback(object[ID]))
    }

    create(element, callback = this.defaultCallback) {
        this.getAll((object) => { 
            object[element.ID] = element
            browser.storage.local.set({ [this.type]: object }).then(callback, this.onError)
         })
    }

    update(element, callback = this.defaultCallback) {
        this.getAll((object) => {
            object[element.ID] = element
            console.log(object)
            browser.storage.local.set({ [this.type]: object }).then(callback, this.onError)
        })
    }

    updateMany(req, callback = this.defaultCallback) {
        this.getAll((object) => {
            Object.entries(req).forEach(([ID, element]) => object[ID] = element)
            console.log(object)
            browser.storage.local.set({ [this.type]: object }).then(callback, this.onError)
        })
    }

    delete(ID, callback = this.defaultCallback) {
        this.getAll((object) => {
            delete object[ID]
            browser.storage.local.set({ [this.type]: object }).then(callback, this.onError)
        })
    }
    deleteMany(IDs, callback = this.defaultCallback) {
        this.getAll((object) => {
            IDs.forEach(ID => delete object[ID])
            browser.storage.local.set({ [this.type]: object }).then(callback, this.onError)
        })
    }
}


/* -------------------------------------------------------------------------- */
/*                               handle explorer                              */
/* -------------------------------------------------------------------------- */

const playlistDB = new db("playlists")

const createHTML = (tag, attributes) => {
    const element = document.createElement(tag)
    attributes.forEach(([name, value]) => {
        element.setAttribute(name, value)
    })
    return element
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
    document.getElementById("playlist-tbody").appendChild(tr)
}

const handleNew = () => {
    const name = window.prompt("Digite o nome")
    db.create(new Playlist(name), updateExplorerPlaylistComponent)
}

const handleRename = () => {
    const targets = document.querySelectorAll(".selected")
    const novoNome = window.prompt("Escreva um novo nome")
    const object = {}
    targets.forEach((target, index) => {
        if (index !== 0) object[target.id] = novoNome + ` (${index})`
        else object[target.id] = novoNome
    })
    db.updateMany(object, updateExplorerPlaylistComponent)
}

const handleDelete = () => {
    const targets = document.querySelectorAll(".selected")
    const IDs = []
    targets.forEach((target) => IDs.push(target.id))
    db.deleteMany(IDs, updateExplorerPlaylistComponent)
}

const updateExplorerPlaylistComponent = () => {
    db.getAll((playlists) => {
        document.getElementById("playlist-tbody").innerText = ""

        Object.entries(playlists).map(([ID, playlist]) => createPlaylistTable(ID, playlist))
    })
}

const createEvents = () => {
    document.getElementById("excluir").addEventListener("click", handleDelete)
    document.getElementById("renomear").addEventListener("click", handleRename)
    document.getElementById("novo").addEventListener("click", handleNew)
}

createEvents()