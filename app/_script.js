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

function createID() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${random}`;
}


class Database {
    constructor() {
        this.table = { playlists: [], ciphers: [] };
        browser.storage.local.get(["table"], (result) => {
            if (result.table) {
                this.table = result.table;
            }
        });
        browser.storage.local.get("targetCipher").then((results) => {
            const cifra = results.targetCipher;
            cifra.id = cifra.id || createID();
            cifra.playlists = cifra.playlists || []
            console.log(cifra.title)
            this.targetCipher = cifra;
            injectCipher(this.targetCipher);
        });
    }

    updateTable() {
        updatePlaylistsUl()
        this.targetCipher = this.getCipherById(this.targetCipher.id) || this.targetCipher
        browser.storage.local.set({ table: this.table, targetCipher: this.targetCipher });
    }

    /* --------------------------------- cipher --------------------------------- */

    getCipherById(cipherId) {
        return this.table.ciphers.find(cipher => cipher.id === cipherId);
    }

    // Create a new cipher
    createCipher(cipherId, title, playlistId = null, code = "") {
        const cipher = { id: cipherId, title, playlists: [], code: code };
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

    updateCipherCode(cipherId, newCode) {
        const targetCipher = this.targetCipher
        const cipher = this.getCipherById(cipherId);
        targetCipher.code = newCode
        if (cipher) {
            cipher.code = newCode;
            this.updateTable();
        } else {
            console.error(`Cipher with ID ${cipherId} not found`);
        }
    }

    /* -------------------------------- playlist -------------------------------- */

    getPlaylistsFilter() {
        const playlists = this.table.playlists;
        const result = [];

        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i];
            const containsTargetCipher = this.targetCipher && playlist.ciphers.includes(this.targetCipher.id);
            result.push({ containsTargetCipher, playlist });
        }

        return result;
    }

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
        let cipher = this.table.ciphers.find(c => c.id === cipherId);
        if (!cipher) {
            cipher = this.createCipher(cipherId, this.targetCipher.title, playlistId, this.targetCipher.code);
        }

        const playlist = this.table.playlists.find(p => p.id === playlistId);

        if (!playlist.ciphers.includes(cipherId)) {
            playlist.ciphers.push(cipherId);
        }

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

const database = new Database()


/* -------------------------------------------------------------------------- */
/*                                constructor                                 */
/* -------------------------------------------------------------------------- */

function injectCipher(cifra) {
    const component = new DOMParser().parseFromString(cifra.code, "text/html").querySelector("pre");
    component.id = cifra.id;
    component.contentEditable = true;
    component.removeAttribute("xmlns");
    component.addEventListener('input', (event) => {
        const code = new XMLSerializer().serializeToString(event.target);
        database.updateCipherCode(database.targetCipher.id, code)
    });
    document.querySelector("#cifra").appendChild(component);
}

function createPlaylistComponentList(playlist, containsTargetCipher) {
    // create the elements
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');
    const nameSpan = document.createElement('span');

    // set the attributes
    li.classList.add('playlist');
    label.classList.add('checkbox-container');
    input.type = 'checkbox';
    input.checked = containsTargetCipher
    span.classList.add('checkmark');
    nameSpan.classList.add('playlists__name');
    nameSpan.textContent = playlist.title;

    // append the elements
    label.appendChild(input);
    label.appendChild(span);
    li.appendChild(label);
    li.appendChild(nameSpan);

    // add event listener to li
    li.addEventListener('click', function () {
        input.checked = !input.checked;
        if (input.checked) database.addCipherToPlaylist(database.targetCipher.id, playlist.id)
        else database.removeCipherFromPlaylist(database.targetCipher.id, playlist.id)
    });

    return li;
}

const updatePlaylistsUl = () => {
    const playlistsUl = document.getElementById("playlists")
    playlistsUl.innerText = ""
    const playlists = database.getPlaylistsFilter()
    playlists.forEach((p) => {
        const pCompoment = createPlaylistComponentList(p.playlist, p.containsTargetCipher)
        playlistsUl.appendChild(pCompoment)
    })
}

let fontSize = 1.5
const controller = document.querySelector('#controller');

/* -------------------------------------------------------------------------- */
/*                                auto rolagem                                */
/* -------------------------------------------------------------------------- */

const scrollSpeed = document.querySelector('#scroll-speed');
const scrollSpeedDisplay = document.querySelector('#scroll-speend-display');
let scrolldelay = 0
let autoScrollTimeOutID

// loop que executa a rolagem infinita
const autoScrollLoop = () => {
    window.scrollBy(1, 1);
    console.log(scrolldelay)
    if (scrolldelay) autoScrollTimeOutID = setTimeout(autoScrollLoop, scrolldelay);
}

// função executada ao apertar play ou pause
const handleToggleAutoScroll = () => {
    const playPauseScrollButton = document.getElementById("play-pause-scroll")
    if (scrolldelay) {
        playPauseScrollButton.classList.remove("checked")
        playPauseScrollButton.querySelector('img').src = "./public/play.svg"
        clearTimeout(autoScrollTimeOutID)
        scrolldelay = 0
    }
    else {
        playPauseScrollButton.classList.add("checked")
        playPauseScrollButton.querySelector('img').src = "./public/pause.svg"
        scrolldelay = scrollSpeed.value
        autoScrollLoop()
    }
}

scrollSpeed.addEventListener('input', () => {
    scrollSpeedDisplay.textContent = scrollSpeed.value;
    scrolldelay = scrollSpeed.value
});

scrollSpeedDisplay.addEventListener("click", () => {
    const newSpeed = prompt("Digite uma nova velocidade de rolagem (1-201):");

    if (newSpeed !== null && !isNaN(newSpeed) && newSpeed >= 1 && newSpeed <= 201) {
        const scrollSpeed = parseInt(newSpeed);
        document.querySelector("#scroll-speed").value = scrollSpeed;
        scrollSpeedDisplay.textContent = scrollSpeed;
        scrolldelay = scrollSpeed
    }
});

controller.querySelectorAll('button').forEach((button) => {

    button.addEventListener('click', () => {
        switch (button.id) {
            case 'controller-toggler':
                (() => {
                    const className = controller.className
                    if (className.includes("hide")) controller.className = ""
                    else controller.className = "hide"
                })()
                break;
            case 'open-db-manager':
                window.location.href = "./dbManeger/index.html"
                break;
            case 'toggle-playlists':
                (() => {
                    updatePlaylistsUl()
                    const className = controller.className
                    if (className.includes("expanded")) controller.className = ""
                    else controller.className = "expanded"
                })()
                break;
            case 'create-playlist':
                (() => {
                    const playlistName = prompt("Digite um nome para a nova playlist")
                    if (playlistName) {
                        database.createPlaylist(createID(), playlistName)
                    } else {
                        alert("A playlist tem que ter um nome")
                    }
                })()
                break;

            case 'decrease-size':
                (() => {
                    const cifraCode = document.querySelector("#cifra pre")
                    fontSize = fontSize - 0.1
                    cifraCode.style.fontSize = fontSize + "rem"
                })()
                break;
            case 'increase-size':
                (() => {
                    const cifraCode = document.querySelector("#cifra pre")
                    fontSize = fontSize + 0.1
                    cifraCode.style.fontSize = fontSize + "rem"
                })()
                break;
            case 'cipher-direction':
                console.log('Cipher direction button clicked');
                break;
            case 'toggleTablatura':
                (() => {
                    const button = document.getElementById("toggleTablatura")
                    const tbList = document.querySelectorAll(".tablatura")
                    if (button.classList.contains("checked")) {
                        button.classList.remove("checked")
                        tbList.forEach(tb => tb.style.display = "block")
                    } else {
                        button.classList.add("checked")
                        tbList.forEach(tb => tb.style.display = "none")
                    }
                })()
                break;
            case 'skip-scroll-backward':
                scrollBy(-250, -250)
                break;
            case 'play-pause-scroll':
                handleToggleAutoScroll()
                break;
            case 'skip-scroll-forward':
                scrollBy(250, 250)
                break;
            case 'scroll-speend-display':
                break;
            default:
                console.log('Unknown button clicked', button.id, button);
        }
    });
});
