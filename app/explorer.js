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
        this.musicas = []
    }
    get ID() {
        return this.createID()
    }
    createID() {
        return createUniqueID(this.name)
    }
}

/* -------------------------------------------------------------------------- */
/*                             Middleware playlist                            */
/* -------------------------------------------------------------------------- */

const getAllPlaylists = (callback = console.log) =>
    browser.storage.local.get("playlists").then((result) => {
        let playlists = {}
        if (result?.playlists) playlists = result.playlists
        callback(playlists)
    }, onError)

const createPlaylist = (name, musicas = [], callback = () => { }) =>
    getAllPlaylists((playlists) => {
        const playlist = new Playlist(name, musicas)
        playlists[playlist.ID] = playlist
        console.log(playlists)
        browser.storage.local.set({ "playlists": playlists }).then(callback, onError)
    })

const deletePlaylist = (ID, callback = () => {}) =>
    getAllPlaylists((playlists) => {
        delete playlists[ID]
        browser.storage.local.set({ "playlists": playlists }).then(callback, onError)
    })

const updatePlaylist = (ID, name, musicas = []) =>
    getAllPlaylists((playlists) => {
        playlists[ID] = new Playlist(name, musicas)
        browser.storage.local.set({ "playlists": playlists }).then(onSusses, onError)
    })


/* -------------------------------------------------------------------------- */
/*                               handle playlist                              */
/* -------------------------------------------------------------------------- */

const handleDeletePlaylist = () => {
    const target = document.querySelector(".selected-ps")
    deletePlaylist(target.id, updateExplorerPlaylistComponent)
    document.getElementById("excluirPlaylist").style.backgroundColor = "#883b42"
}

const activePlaylistButtins = () => {
    const exculir = document.getElementById("excluirPlaylist")
    exculir.style.backgroundColor = "#bf2e3c"
    exculir.addEventListener("click", handleDeletePlaylist, false)
}

const updateExplorerPlaylistComponent = () => {
    getAllPlaylists((playlists) => {
        document.getElementById("playlist-tbody").innerText = ""

        Object.entries(playlists).map(([ID, playlist]) => {
            const tr = document.createElement("tr")
            tr.id = ID

            const icon = document.createElement("td")
            icon.setAttribute("data-label", "icon")
            icon.style.width = "20px"

            const img = document.createElement("img")
            img.classList.add("folder-icon")
            img.src = "public/folder.png"
            icon.appendChild(img)

            const name = document.createElement("td")
            name.innerText = playlist?.name
            name.setAttribute("data-label", "name")

            tr.appendChild(icon)
            tr.appendChild(name)
            tr.addEventListener("click", event => {
                activePlaylistButtins()
                let element = event.target
                while (element.nodeName !== "TR") element = element.parentNode
                console.log(element)
                Object.values(document.getElementById("playlist-tbody").children).forEach(element => {
                    element.className = ""
                })
                document.getElementById(element.id).className = "selected-ps"
            })
            document.getElementById("playlist-tbody").appendChild(tr)
        })
    })
}

const handleNovaPlaylist = () => {
    const name = window.prompt("Digite o nome da playlist")
    createPlaylist(name, [], updateExplorerPlaylistComponent)
}

const createEvents = () => {
    updateExplorerPlaylistComponent()
    document.getElementById("novaPlaylist").addEventListener("click", handleNovaPlaylist)
}

createEvents()