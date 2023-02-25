let table = 'playlists'
let crrPlaylistID


const getCheckedRows = () => {
    const ids = []
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => {
        ids.push(ch.closest('tr').id)
    })
    return ids
}


/* -------------------------------------------------------------------------- */
/*                                handle events                               */
/* -------------------------------------------------------------------------- */

const bevs = {
    default: (ev) => console.log('No handel button', ev.target),
    newItem: () => {
        var title = prompt("Digite um nome")
        if (title) {
            if (table === "playlists") db.createPlaylist(title)
            else if (table === "ciphers") db.createCipher(title, [crrPlaylistID])
            else throw new Error('Unknow table:', table)
        } else alert('Digite um nome válido para renomear')
    },
    rename: () => {
        const ids = getCheckedRows()
        // console.log(ids)
        var title = prompt("Digite um nome")
        if (title && table === "playlists") db.renamePlaylists(ids, title)
        else if (title && table === "ciphers") db.renameCiphers(ids, title)
        else throw new Error('Unknow table:', table)
    },
    delete: () => {
        const ids = getCheckedRows()
        if (ids && table === "playlists") db.deletePlaylists(ids)
        else if (ids && table === "ciphers") db.deleteCiphers(ids)
        else throw new Error('Unknow table:', table)
    },
    open: (id) => {
        if (typeof id !== "string") id = getCheckedRows()[0]
        if (table === "playlists" && id) {
            crrPlaylistID = id
            updateLayout('ciphers')
        } else if (table === "ciphers" && id) browser.storage.local.set({ target: id }, () =>
            browser.tabs.create({ "url": "/app/home/index.html" }));
        else throw new Error('Unknow table:', table)
    },
    returnToPlaylists: () => updateLayout('playlists')

}


/* -------------------------------------------------------------------------- */
/*                                 constructor                                */
/* -------------------------------------------------------------------------- */

const createRow = (id, title, ciphers = null) => {
    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    const checkmark = document.createElement("span");
    const checkboxLabel = document.createElement("label");
    checkbox.type = "checkbox";
    checkmark.classList.add("checkmark");
    checkboxLabel.classList.add("checkbox-container");
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkmark);
    checkboxCell.appendChild(checkboxLabel);

    const tr = document.createElement("tr");
    tr.setAttribute('id', id);
    tr.appendChild(checkboxCell);

    const titleCell = document.createElement("td");
    titleCell.textContent = title;
    tr.appendChild(titleCell);

    if (ciphers) {
        const tdCifras = document.createElement('td');
        tdCifras.textContent = ciphers.length;
        tr.appendChild(tdCifras);
    }
    tr.addEventListener('click', () => checkbox.checked = !checkbox.checked)
    tr.addEventListener('dblclick', () => bevs.open(id))

    return tr;
}

const updateHTMLTable = () => {
    const tbody = document.querySelector('tbody')
    tbody.innerText = ""
    if (table === "playlists") db.playlists.forEach((playlist) =>
        tbody.appendChild(createRow(playlist.id, playlist.title, playlist.ciphers))
    )
    else if (table === "ciphers") db.getCiphersInPlaylist(crrPlaylistID).forEach(cipher =>
        tbody.appendChild(createRow(cipher.id, cipher.title))
    )
    else throw new Error('Unkknow table:', newTable)
}

const updateLayout = (newTable) => {
    if (newTable === "playlists") {
        document.getElementById('title').textContent = "PLAYLISTS";
        document.getElementById('newItem').textContent = 'Nova Playlist';
        document.getElementById('title-head').textContent = "Playlists"

        document.getElementById('returnToPlaylists').style.display = 'none'
        document.getElementById('ciphersNum').style.display = 'inline-grid'
    } else if (newTable === "ciphers") {
        document.getElementById('title').textContent = db.playlists.find(p => p.id === crrPlaylistID).title;
        document.getElementById('newItem').textContent = 'Nova cifra';
        document.getElementById('title-head').textContent = "Cifras"

        document.getElementById('returnToPlaylists').style.display = 'block'
        document.getElementById('ciphersNum').style.display = 'none'
    } else throw new Error('Unkknow table:', newTable)
    table = newTable
    updateHTMLTable()
}

const main = () => {
    updateHTMLTable()

    document.querySelectorAll('button').forEach(btn =>
        btn.addEventListener('click', bevs[btn.id] ? bevs[btn.id] : bevs.default)
    )
}

db = new Database(updateHTMLTable, main)
