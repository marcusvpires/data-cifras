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
    createCipher(cipherId, title) {
        const cipher = { id: cipherId, title, playlists: [] };
        this.table.ciphers.push(cipher);
        this.updateTable();
        return cipher;
    }

    // Update a cipher's name
    updateCipherName(cipherId, newTitle) {
        const cipher = this.table.ciphers.find(c => c.id === cipherId);
        cipher.title = newTitle;
        this.updateTable();
    }

    // Delete one or more ciphers
    deleteCiphers(cipherIds) {
        // Remove ciphers from table and remove them from playlists
        for (const cipherId of cipherIds) {
            this.table.ciphers = this.table.ciphers.filter((c) => c.id !== cipherId);
            for (const playlist of this.table.playlists) {
                if (playlist.ciphers.includes(cipherId)) {
                    this.removeCipherFromPlaylist(cipherId, playlist.id);
                }
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
                        }
                    }
                    break;
                case 'btn-renomear':
                    // Handle click on "Renomear" button
                    var name = prompt("Digite um nome")
                    if (document.querySelector('.title').id === "playlists") {
                        database.renamePlaylists(getCheckedRows(), name)
                    }
                    break;
                case 'btn-excluir':
                    // Handle click on "Excluir" button
                    if (document.querySelector('.title').id === "playlists") {
                        database.deletePlaylists(getCheckedRows(), name)
                    }
                    break;
                case 'btn-abrir':
                    // Handle click on "Abrir" button
                    console.log('Abrir clicked!');
                    break;
                default:
                    console.log('Unknown button clicked!');
            }
        });
    });
}

function updatePlaylistRow(id, title, cifras) {
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


const database = new Database(updateHTMLTable)

function updateHTMLTable() {
    if (document.querySelector('.title').id === "playlists") {
        const tbody = document.querySelector('tbody')
        console.log(database.table)
        tbody.innerText = ""
        database.table.playlists.forEach((playlist) => {
            if (playlist) {
                tbody.appendChild(updatePlaylistRow(playlist.id, playlist.title, playlist.ciphers))
            }
        })
        attachRowClickHandler()
    }
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