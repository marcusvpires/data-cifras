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


/* <tr>
    <td data-label="Checkbox"><input type="checkbox" name="" id=""></td>
    <td data-label="Name">Vou Deixar</td>
    <td data-label="Cifras">12/05/23</td>
</tr> */

updatePlaylistTable()