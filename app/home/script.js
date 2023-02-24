let db
let scrollIntervalId

/* -------------------------------------------------------------------------- */
/*                             playlists checklist                            */
/* -------------------------------------------------------------------------- */

const componentPlaylistChecklistItem = (playlist) => {
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
    input.checked = playlist.ciphers.includes(db.target)
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
        if (input.checked) database.addCiphersToPlaylists([db.target], [playlist.id])
        else db.removeCiphersFromPlaylists([db.target], [playlist.id])
    });

    return li;
}

const updatePlaylistsChecklist = () => {
    const ul = document.getElementById("playlists")
    ul.textContent = ''
    db.playlists.forEach(playlist => ul.appendChild(componentPlaylistChecklistItem(playlist)))
}


/* -------------------------------------------------------------------------- */
/*                                handle events                               */
/* -------------------------------------------------------------------------- */

const handleCode = ev => {
    const newCode = new XMLSerializer().serializeToString(ev.target);
    db.updateCipherCode(db.target, newCode)
}

const bevs = {
    default: (ev) => console.log('No handel button', ev.target),
    toggleSidebar: () => {
        let ct = document.getElementById('controller')
        ct.classList.contains("hide") ? ct.className = "" : ct.className = "hide"
    },
    openLibrary: () => window.location.href = "../library/index.html",
    togglePlaylistsChecklist: () => {
        updatePlaylistsChecklist()
        let ct = document.getElementById('controller')
        !ct.classList.contains("expanded") ? ct.className = "expanded" : ct.className = ""
    },
    createPlaylist: () => {
        const title = prompt("Digite um nome para a nova playlist")
        if (title) db.createPlaylist(title)
        else alert("A playlist tem que ter um nome")
    },
    decreaseSize: () => {
        let settings = db.ciphers.find(c => c.id === db.target).settings || { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
        settings.fontSize = settings.fontSize - 0.1
        console.log('Decrese fontsize to:', settings.fontSize)
        document.querySelector("#cifra pre").style.fontSize = settings.fontSize + "rem"
        db.updateCipherSettings(db.target, settings)
    },
    increaseSize: () => {
        let settings = db.ciphers.find(c => c.id === db.target).settings || { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
        settings.fontSize = settings.fontSize + 0.1
        document.querySelector("#cifra pre").style.fontSize = settings.fontSize + "rem"
        db.updateCipherSettings(db.target, settings)
    },
    toggleTablatura: () => {
        const cn = document.getElementById("toggleTablatura").classList
        const tbs = document.querySelectorAll(".tablatura")
        if (cn.contains("checked")) {
            cn.remove("checked")
            tbs.forEach(tb => tb.style.display = "block")
        } else {
            cn.add("checked")
            tbs.forEach(tb => tb.style.display = "none")
        }
    },
    skipScrollBackward: () => scrollBy(-250, -250),
    skipScrollForward: () => scrollBy(250, 250),
    playPauseScroll: () => {
        const input = document.getElementById("scrollSpeedInput")
        const btn = document.getElementById('playPauseScroll')
        if (scrollIntervalId) {
            btn.classList.remove("checked")
            btn.querySelector('img').src = "../public/play.svg"
            clearInterval(scrollIntervalId);
            scrollIntervalId = false
        } else {
            scrollIntervalId = setInterval(() => window.scrollBy(0, 1), input.value)
            btn.classList.add("checked")
            btn.querySelector('img').src = "../public/pause.svg"
        }
    },
    scrollSpeedDisplay: () => {
        const newSpeed = prompt("Digite uma nova velocidade de rolagem (1-201):");

        if (newSpeed !== null && !isNaN(newSpeed) && newSpeed >= 1 && newSpeed <= 201 && parseInt(newSpeed)) {
            const scrollSpeed = parseInt(newSpeed);
            document.getElementById("scrollSpeedInput").value = scrollSpeed;
            scrollSpeedDisplay.textContent = scrollSpeed;
            let settings = db.ciphers.find(c => c.id === db.target).settings || { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
            settings.scrollSpeed = scrollSpeed
            db.updateCipherSettings(db.target, settings)
        }
    }
}


/* -------------------------------------------------------------------------- */
/*                           components constructor                           */
/* -------------------------------------------------------------------------- */


const componentCode = (code, id, settings) => {
    const el = new DOMParser().parseFromString(code, "text/html").querySelector("pre");
    el.id = id; el.contentEditable = true; el.removeAttribute("xmlns");
    el.addEventListener('input', handleCode)
    el.style.fontSize = settings.fontSize + 'rem'
    document.querySelector("#cifra").appendChild(el)
}

const main = () => {

    const cipher = db.ciphers.find(c => c.id == db.target)
    console.log('Load target cipher:', cipher.title)
    if (!cipher) return

    componentCode(cipher.code, cipher.id, cipher.settings)
    document.querySelectorAll('button').forEach(btn =>
        btn.addEventListener('click', bevs[btn.id] ? bevs[btn.id] : bevs.default)
    )

    document.getElementById('scrollSpeedInput').addEventListener('input', ev => {
        document.getElementById('scrollSpeedDisplay').innerText = ev.target.value
        let settings = db.ciphers.find(c => c.id === db.target).settings || { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
        settings.scrollSpeed = ev.target.value
        if (scrollIntervalId) {
            clearInterval(scrollIntervalId)
            scrollIntervalId = setInterval(() => window.scrollBy(0, 1), ev.target.value)
        }
        db.updateCipherSettings(db.target, settings)
    })
}

db = new Database(updatePlaylistsChecklist, main)
