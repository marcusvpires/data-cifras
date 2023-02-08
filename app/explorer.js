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
        getCifras(cifras => {
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

const deleteCifra = (cifraIDs) => {
    getPlaylists(playlists => {
        getCifras(cifras => {
            cifraIDs.forEach(cifraID => {
                delete playlists[document.querySelector(".locationbarurl").id].cifras[cifraID]
                let anyPlaylist = false
                Object.keys(cifras[cifraID].playlists).forEach(playlistID => {
                    if (playlists[playlistID].cifras[cifraID]) anyPlaylist = true
                })
                if (!anyPlaylist) delete cifras[cifraID]
            })
            storage.set({ "playlists": playlists }).then(() => {
                storage.set({ "cifras": cifras }).then(updateCifraTable)
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

const updateCifraTable = () => {
    const container = document.querySelector("tbody")
    container.innerText = ""
    container.appendChild(createHTML("tr", [["class", "space"]]))
    const playlistID = document.querySelector(".locationbarurl").id
    getPlaylists(playlists => {
        const cifraIDs = Object.keys(playlists[playlistID].cifras)
        getCifras((cifras) => {
            cifraIDs.forEach(cifraID => {
                const cifra = cifras[cifraID]
                const component = createHTML("tr", [["id", cifraID]])
                const checkbox = createHTML("td", [["data-label", "Checkbox"]])
                checkbox.appendChild(createHTML("input", [["type", "checkbox"]]))

                const title = createHTML("td", [["data-label", "Titulo"]])
                const author = createHTML("td", [["data-label", "Autores"]])
                title.innerText = cifra.title
                author.innerText = cifra.author

                component.appendChild(checkbox)
                component.appendChild(title)
                component.appendChild(author)
                component.addEventListener("click", handleSelect)
                container.appendChild(component)
            })
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

const handleDeleteCifra = () => {
    const query = document.querySelectorAll(".selected")
    const ids = Object.values(query).map(row => row.id)
    console.log(ids)
    deleteCifra(ids)
}

const handleRename = () => {
    const targets = document.querySelectorAll(".selected")
    const novoNome = window.prompt("Escreva um novo nome")
    const object = {}
    targets.forEach((target, index) => {
        if (index !== 0) object[target.id] = { name: novoNome + ` (${index})` }
        else object[target.id] = { name: novoNome }
    })
    getPlaylists(playlists => {
        Object.entries(object).forEach(([id, element]) => playlists[id] = { ...playlists[id], ...element })
        storage.set({ "playlists": playlists }).then(updatePlaylistTable)
    })
}

const handleRenameCifra = () => {
    const targets = document.querySelectorAll(".selected")
    const novoNome = window.prompt("Escreva um novo nome")
    const object = {}
    targets.forEach((target, index) => {
        if (index !== 0) object[target.id] = { name: novoNome + ` (${index})` }
        else object[target.id] = { title: novoNome }
    })
    getCifras(cifras => {
        Object.entries(object).forEach(([id, element]) => cifras[id] = { ...cifras[id], ...element })
        storage.set({ "cifras": cifras }).then(updateCifraTable)
    })
}

const handleOpen = () => {
    const target = document.querySelector(".selected")
    document.getElementById("headerplaylists").style.display = "none"
    document.getElementById("headercifras").style.display = "table-row"
    document.getElementById("return").addEventListener("click", handleReturn, false)
    document.getElementById("delete").removeEventListener("click", handleDeletePlaylist)
    document.getElementById("delete").addEventListener("click", handleDeleteCifra)
    document.getElementById("rename").removeEventListener("click", handleRename)
    document.getElementById("rename").addEventListener("click", handleRenameCifra)
    document.getElementById("open").removeEventListener("click", handleOpen)
    document.getElementById("open").addEventListener("click", handleOpenCifra)

    const bar = document.querySelector(".locationbarurl")
    bar.innerText = target.querySelector('.name')
    bar.id = target.id
    updateCifraTable()
}

const handleOpenCifra = () => {
    const target = document.querySelector(".selected")
    getCifras(cifras => {
        const cifra = cifras[target.id]
        let storingNote = browser.storage.local.set({ "targetcifra": cifra });
        storingNote.then(() => {
            window.location.href = "index.html";
        }, onError)
    })
    bar.id = target.id
    updateCifraTable()
}

const handleReturn = () => {
    const target = document.querySelector(".selected")
    document.getElementById("headerplaylists").style.display = "table-row"
    document.getElementById("headercifras").style.display = "none"
    document.getElementById("delete").removeEventListener("click", handleDeleteCifra)
    document.getElementById("delete").addEventListener("click", handleDeletePlaylist)
    document.getElementById("rename").removeEventListener("click", handleRenameCifra)
    document.getElementById("rename").addEventListener("click", handleRename)
    document.getElementById("open").removeEventListener("click", handleOpenCifra)
    document.getElementById("open").addEventListener("click", handleOpen)
    const bar = document.querySelector(".locationbarurl")
    bar.innerText = ""
    bar.id = ""
    updatePlaylistTable()
}

/* <tr>
    <td data-label="Checkbox"><input type="checkbox" name="" id=""></td>
    <td data-label="Name">Vou Deixar</td>
    <td data-label="Cifras">12/05/23</td>
</tr> */

document.getElementById("delete").addEventListener("click", handleDeletePlaylist)
document.getElementById("rename").addEventListener("click", handleRename)
document.getElementById("open").addEventListener("click", handleOpen)
document.getElementById("close").addEventListener("click", () => {
    window.location.href = "index.html";
})
updatePlaylistTable()