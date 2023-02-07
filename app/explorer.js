/* -------------------------------------------------------------------------- */
/*                                   assets                                   */
/* -------------------------------------------------------------------------- */

const createUniqueID = (string) => {
    return (string + new Date().toTimeString() + new Date().getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

const onSusses = (message = "sucesso") => console.info(message)

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

const deletePlaylist = (ID, callback = () => { }) =>
    getAllPlaylists((playlists) => {
        delete playlists[ID]
        browser.storage.local.set({ "playlists": playlists }).then(callback, onError)
    })

const updatePlaylist = (ID, name, musicas = [], callback = () => { }) =>
    getAllPlaylists((playlists) => {
        playlists[ID] = new Playlist(name, musicas)
        browser.storage.local.set({ "playlists": playlists }).then(callback, onError)
    })


/* -------------------------------------------------------------------------- */
/*                               handle explorer                              */
/* -------------------------------------------------------------------------- */

const handleRenomear = () => {
    const target = document.querySelector(".selected-ps")
    const novoNome = window.prompt("Escreva um novo nome para a playlist")
    updatePlaylist(target.id, novoNome, [],updateExplorerPlaylistComponent) 
}

const handleDeletePlaylist = () => {
    const target = document.querySelector(".selected-ps")
    deletePlaylist(target.id, updateExplorerPlaylistComponent)
}

const activePlaylistButtins = () => {
    const excluir = document.getElementById("excluirPlaylist")
    const renomear = document.getElementById("renomearPlaylist")
    if (excluir.style.backgroundColor !== "rgb(191, 46, 60)") {
        console.log("add event listener")
        excluir.style.backgroundColor = "rgb(191, 46, 60)"
        excluir.addEventListener("click", handleDeletePlaylist, false)
    }
    if (renomear.style.backgroundColor !== "rgb(0, 89, 184)") {
        renomear.style.backgroundColor = "rgb(0, 89, 184)"
        renomear.addEventListener("click", handleRenomear, false)

    }
}

const updateExplorerPlaylistComponent = () => {
    document.getElementById("excluirPlaylist").style.backgroundColor = "#883b42"
    document.getElementById("renomearPlaylist").style.backgroundColor = "#0c3d73"

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