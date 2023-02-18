/* -------------------------------------------------------------------------- */
/*                                  Database                                  */
/* -------------------------------------------------------------------------- */

/* 

table = {
    playlists: Playlists[],
    cipher: Ciphers[],
}

Playlists = {
    id: string,
    title: string,
    ciphers: cipherIDs[]
}

Ciphers = {
    id: string,
    title: string,
    playlists: playlistsIDs[]
}

*/


class Database {
    constructor(callback) {
        this.table = { playlists: [], ciphers: [] };
        browser.storage.local.get(["table"], (result) => {
            if (result.table) {
                this.table = result.table;
            }
            callback(result.table)
        });
    }

    updateTable() {
        updateHTMLTable()
        browser.storage.local.set({ table: this.table });
    }

    /* --------------------------------- cipher --------------------------------- */

    // Create a new cipher
    createCipher(cipherId, title, playlistId = null) {
        const cipher = { id: cipherId, title, playlists: [] };
        this.table.ciphers.push(cipher);

        if (playlistId !== null) {
            this.addCipherToPlaylist(cipherId, playlistId);
        }

        this.updateTable();
        return cipher;
    }

    renameCiphers(cipherIds, newName) {
        for (const cipherId of cipherIds) {
            const cipher = this.table.ciphers.find(c => c.id === cipherId);
            if (cipher) {
                cipher.title = newName;
            }
        }
        this.updateTable();
    }


    // Delete one or more ciphers
    deleteCiphers(cipherIds) {
        // Remove ciphers from table and remove them from playlists
        for (const cipherId of cipherIds) {
            this.table.ciphers = this.table.ciphers.filter((c) => c.id !== cipherId);
            for (const playlist of this.table.playlists) {
                playlist.ciphers = playlist.ciphers.filter((c) => c !== cipherId);
            }
        }
        this.updateTable();
    }

    /* -------------------------------- playlist -------------------------------- */

    renamePlaylists(playlistIds, name) {
        for (let i = 0; i < playlistIds.length; i++) {
            const playlist = this.table.playlists.find(p => p.id === playlistIds[i]);
            if (playlist) {
                const newName = i === 0 ? name : `${name} (${i})`;
                playlist.title = newName;
                this.updateTable();
            }
        }
    }

    // Create a new playlist
    createPlaylist(playlistId, title) {
        const playlist = { id: playlistId, title, ciphers: [] };
        this.table.playlists.push(playlist);
        this.updateTable();
        return playlist;
    }

    // Update a playlist's name
    updatePlaylistName(playlistId, newTitle) {
        const playlist = this.table.playlists.find(p => p.id === playlistId);
        playlist.title = newTitle;
        this.updateTable();
    }

    // Delete one or more playlists
    deletePlaylists(playlistIds) {
        // Remove playlists from table and remove ciphers from playlists
        for (const playlistId of playlistIds) {
            this.table.playlists = this.table.playlists.filter((p) => p.id !== playlistId);
            for (const cipher of this.table.ciphers) {
                if (cipher.playlists.includes(playlistId)) {
                    this.removeCipherFromPlaylist(cipher.id, playlistId);
                }
            }
        }
        this.updateTable();
    }

    /* ------------------------------- relational ------------------------------- */

    // Add a cipher to a playlist
    addCipherToPlaylist(cipherId, playlistId) {
        const playlist = this.table.playlists.find(p => p.id === playlistId);
        const cipher = this.table.ciphers.find(c => c.id === cipherId);

        // Check if cipher is already in playlist
        if (!playlist.ciphers.includes(cipherId)) {
            playlist.ciphers.push(cipherId);
        }

        // Check if playlist is already in cipher's playlists
        if (!cipher.playlists.includes(playlistId)) {
            cipher.playlists.push(playlistId);
        }

        this.updateTable();
    }

    // Remove a cipher from a playlist
    removeCipherFromPlaylist(cipherId, playlistId) {
        const playlist = this.table.playlists.find((p) => p.id === playlistId);
        if (!playlist) {
            console.error(`Playlist with ID ${playlistId} not found`);
            return;
        }

        const cipher = this.table.ciphers.find((c) => c.id === cipherId);
        if (!cipher) {
            console.error(`Cipher with ID ${cipherId} not found`);
            return;
        }

        playlist.ciphers = playlist.ciphers.filter((c) => c !== cipherId);
        cipher.playlists = cipher.playlists.filter((p) => p !== playlistId);
        this.updateTable();

        // Delete cipher if it's not in any playlists
        if (cipher.playlists.length === 0) {
            this.deleteCipher(cipher);
        }
    }

    openPlaylistById(playlistId) {
        const playlist = this.table.playlists.find(p => p.id === playlistId);
        if (playlist) {
            this.targetPlaylist = playlist;
            this.targetPlaylistID = playlistId;
        }
        return playlist;
    }

    getCiphersInPlaylist(playlistId) {
        const playlist = this.table.playlists.find(p => p.id === playlistId);
        if (!playlist) {
            console.error(`Playlist with ID ${playlistId} not found`);
            return [];
        }

        const ciphers = [];
        for (const cipherId of playlist.ciphers) {
            const cipher = this.table.ciphers.find(c => c.id === cipherId);
            if (cipher) {
                ciphers.push(cipher);
            } else {
                console.error(`Cipher with ID ${cipherId} not found in playlist ${playlist.title}`);
            }
        }

        return ciphers;
    }
}


/* -------------------------------------------------------------------------- */
/*                                 constructor                                */
/* -------------------------------------------------------------------------- */


// script that will check the checkbox when a row is clicked
function attachRowClickHandler() {
    // Get all rows in the table body
    const rows = document.querySelectorAll('tbody > tr');

    for (let i = 0; i < rows.length; i++) {
        const checkbox = rows[i].querySelector('input[type="checkbox"]');
        rows[i].addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
        });
    }
}

// Function to add an event listener to each button
function addButtonEventListeners() {
    // Get all buttons
    const buttons = document.querySelectorAll('.btn');

    // Loop through each button and add an event listener
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Handle button click event here
            switch (button.id) {
                case 'btn-novo-item':
                    // Handle click on "Nova Playlist" or "Nova Cifra" button
                    var name = prompt("Digite um nome")
                    if (name) {
                        if (document.querySelector('.title').id === "playlists") {
                            database.createPlaylist(createUniqueId(), name)
                        } else {
                            database.createCipher(createUniqueId(), name, database.targetPlaylistID)
                        }
                    }
                    break;
                case 'btn-renomear':
                    // Handle click on "Renomear" button
                    var name = prompt("Digite um nome")
                    if (document.querySelector('.title').id === "playlists") {
                        database.renamePlaylists(getCheckedRows(), name)
                    } else {
                        database.renameCiphers(getCheckedRows(), name)
                    }
                    break;
                case 'btn-excluir':
                    // Handle click on "Excluir" button
                    if (document.querySelector('.title').id === "playlists") {
                        database.deletePlaylists(getCheckedRows(), name)
                    } else {
                        database.deleteCiphers(getCheckedRows())
                    }
                    break;
                case 'btn-abrir':
                    // Handle click on "Abrir" button/]
                    if (document.querySelector('.title').id === "playlists") {
                        var playlistID = getCheckedRows()[0]
                        if (playlistID) {
                            database.openPlaylistById(playlistID)
                            createCiphersLayout(playlistID)
                            updateHTMLTable()
                        }
                    }
                    break;
                case 'return-to-playlists':
                    // Handle click on "Abrir" button/]
                    console.log('teste')
                    createPlaylistsLayout()
                    updateHTMLTable()
                    break;
                default:
                    console.log('Unknown button clicked!');
            }
        });
    });
}

function createPlaylistRow(id, title, cifras) {
    // Create the elements
    const tr = document.createElement('tr');
    const tdCheckbox = document.createElement('td');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');
    const tdTitle = document.createElement('td');
    const tdCifras = document.createElement('td');

    // Set the attributes
    tr.setAttribute('id', id);
    tdCheckbox.appendChild(label);
    label.setAttribute('class', 'checkbox-container');
    input.setAttribute('type', 'checkbox');
    span.setAttribute('class', 'checkmark');
    label.appendChild(input);
    label.appendChild(span);
    tdTitle.textContent = title;
    tdCifras.textContent = cifras.length;

    // Append the elements to the row
    tr.appendChild(tdCheckbox);
    tr.appendChild(tdTitle);
    tr.appendChild(tdCifras);

    return tr;
}

function createCipherRow(id, title) {
    const row = document.createElement("tr");
    row.id = id;

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");
    const checkboxLabel = document.createElement("label");
    checkboxLabel.classList.add("checkbox-container");
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkmark);
    checkboxCell.appendChild(checkboxLabel);
    row.appendChild(checkboxCell);

    const titleCell = document.createElement("td");
    titleCell.textContent = title;
    row.appendChild(titleCell);

    return row;
}


const database = new Database(updateHTMLTable)

function updateHTMLTable() {
    if (document.querySelector('.title').id === "playlists") {
        const tbody = document.querySelector('tbody')
        console.log(database.table)
        tbody.innerText = ""
        database.table.playlists.forEach((playlist) => {
            tbody.appendChild(createPlaylistRow(playlist.id, playlist.title, playlist.ciphers))
        })
        attachRowClickHandler()
    } else {
        const tbody = document.querySelector('tbody')
        console.log(database.table)
        tbody.innerText = ""
        database.getCiphersInPlaylist(document.querySelector('.title').id).forEach(cipher => {
            tbody.appendChild(createCipherRow(cipher.id, cipher.title))
        })
        attachRowClickHandler()
    }
}

function createCiphersLayout(playlistID) {
    // Select the elements that need to be changed
    const title = document.querySelector('.title');
    const newItem = document.querySelector('#btn-novo-item');

    // Change the text and IDs of the selected elements
    title.textContent = database.targetPlaylist.title;
    title.id = playlistID;

    newItem.textContent = 'Nova Cifra';

    // Remove the unneeded elements from the table header
    const tableHeader = document.querySelector('thead tr');
    const returnToPlaylistsButton = document.querySelector('.return-to-playlists');
    if (returnToPlaylistsButton) {
        returnToPlaylistsButton.style.display = 'block';
    }
    tableHeader.querySelector('#title-head').textContent = "Cifras"
    tableHeader.removeChild(document.querySelector('#relation-head'));
}

function createPlaylistsLayout() {
    // Select the elements that need to be changed
    const title = document.querySelector('.title');
    const newItem = document.querySelector('#btn-novo-item');

    // Change the text and IDs of the selected elements
    title.textContent = "PLAYLISTS";
    title.id = "playlists";

    newItem.textContent = 'Nova Playlist';

    // Remove the unneeded elements from the table header
    const tableHeader = document.querySelector('thead tr');
    const returnToPlaylistsButton = document.querySelector('.return-to-playlists');
    if (returnToPlaylistsButton) {
        returnToPlaylistsButton.style.display = 'none';
    }
    tableHeader.querySelector('#title-head').textContent = "Playlists"
    var cifrasNumber = document.createElement('th');
    cifrasNumber.setAttribute('id', 'relation-head');
    cifrasNumber.textContent = 'Cifras';
    tableHeader.appendChild(cifrasNumber)
}

/* -------------------------------------------------------------------------- */
/*                                   accets                                   */
/* -------------------------------------------------------------------------- */

function getCheckedRows() {
    const checkedRows = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const id = row.getAttribute('id');
            checkedRows.push(id);
        }
    });
    return checkedRows;
}

function createUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${randomString}`;
}



addButtonEventListeners();