/* -------------------------------------------------------------------------- */
/*                             funções auxiliares                             */
/* -------------------------------------------------------------------------- */

const onError = (err) => console.log(err)

const createID = () => {
    const dt = new Date()
    return (dt.toTimeString() + dt.getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

const createHTML = (tag, attributes = []) => {
    const element = document.createElement(tag)
    attributes.forEach(([name, value]) => {
        element.setAttribute(name, value)
    })
    return element
}


/* -------------------------------------------------------------------------- */
/*                               banco de dados                               */
/* -------------------------------------------------------------------------- */

const storage = browser.storage.local

const getPlaylists = (callback) => storage.get("playlists").then((response) => {
    let playlists = {}
    if (response.playlists) playlists = response.playlists
    callback(playlists)
}, onError)

const getCifras = (callback) => storage.get("cifras").then((response) => {
    let cifras = {}
    if (response.cifras) cifras = response.cifras
    callback(cifras)
}, onError)

const deletePlaylist = (playlistIDs) => {
    getPlaylists(playlists => {
        getCifras(cifras =>{
            playlistIDs.forEach(playlistID => {
                Object.keys(playlists[playlistID].cifras).forEach(cifraID => {
                    delete cifras[cifraID].playlists[playlistID]
                    if (Object.keys(cifras[cifraID].playlists).length === 0) delete cifras[cifraID]
                })
                delete playlists[playlistID]
            })
            storage.set({ "playlists": playlists }).then(() => {
                storage.set({ "cifras": cifras }).then(updatePlaylistTable)
            })
        })
    })
}

/* -------------------------------------------------------------------------- */
/*                               atualiza tabela                              */
/* -------------------------------------------------------------------------- */

const handleSelect = (event) => {
    let element = event.target
    while (element.nodeName !== "TR") element = element.parentNode
    const checkbox = element.querySelector("input")
    if (element.className === "selected") {
        checkbox.checked = false
        element.className = ""
    }
    else {
        checkbox.checked = true;
        element.className = "selected"
    }
}

const updatePlaylistTable = () => {
    const container = document.querySelector("tbody")
    container.innerText = ""
    container.appendChild(createHTML("tr", [["class", "space"]]))
    getPlaylists((playlists) => {
        Object.entries(playlists).forEach(([id, playlist]) => {
            const component = createHTML("tr", [["id", id]])
            const checkbox = createHTML("td", [["data-label", "Checkbox"]])
            checkbox.appendChild(createHTML("input", [["type", "checkbox"]]))

            const name = createHTML("td", [["data-label", "Name"]])
            const cifras = createHTML("td", [["data-label", "Cifras"]])
            name.innerText = playlist.name
            cifras.innerText = Object.keys(playlist.cifras).length

            component.appendChild(checkbox)
            component.appendChild(name)
            component.appendChild(cifras)
            component.addEventListener("click", handleSelect)
            container.appendChild(component)
        })
    })
}

/* -------------------------------------------------------------------------- */
/*                             barra de utilidades                            */
/* -------------------------------------------------------------------------- */

const handleDeletePlaylist = () => {
    const query = document.querySelectorAll(".selected")
    const ids = Object.values(query).map(row => row.id)
    console.log(ids)
    deletePlaylist(ids)
}

/* <tr>
    <td data-label="Checkbox"><input type="checkbox" name="" id=""></td>
    <td data-label="Name">Vou Deixar</td>
    <td data-label="Cifras">12/05/23</td>
</tr> */

document.getElementById("delete").addEventListener("click", handleDeletePlaylist)
updatePlaylistTable()