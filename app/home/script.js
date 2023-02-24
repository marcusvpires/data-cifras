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
        if (input.checked) db.addCiphersToPlaylists([db.target], [playlist.id])
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

const scrollSmooth = (scroll) => {
    if (scrollIntervalId) {
        let count = 0
        bevs.playPauseScroll()
        let intervalID = setInterval(() => {
            count++
            document.getElementById('cifra').scrollBy(0, scroll)
            if (count > 70) {
                bevs.playPauseScroll()
                clearInterval(intervalID)
            }
        }, 1)
    } else {
        document.getElementById('cifra').scrollBy({
            top: scroll * 90,
            left: 0,
            behavior: 'smooth'
        });
    }
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
        let settings = db.getCipherSettings(db.target)
        settings.fontSize = settings.fontSize - 0.1
        console.log('Decrese fontsize to:', settings.fontSize)
        document.querySelector("#cifra pre").style.fontSize = settings.fontSize + "rem"
        db.updateCipherSettings(db.target, settings)
    },
    increaseSize: () => {
        let settings = db.getCipherSettings(db.target)
        settings.fontSize = settings.fontSize + 0.1
        document.querySelector("#cifra pre").style.fontSize = settings.fontSize + "rem"
        db.updateCipherSettings(db.target, settings)
    },
    toggleTablatura: () => {
        let settings = db.getCipherSettings(db.target)
        const cn = document.getElementById("toggleTablatura").classList
        const tbs = document.querySelectorAll(".tablatura")
        if (settings.tablatura) {
            cn.remove("checked")
            settings.tablatura = false
            tbs.forEach(tb => tb.style.display = "block")
        } else {
            cn.add("checked")
            settings.tablatura = true
            tbs.forEach(tb => tb.style.display = "none")
        }
        db.updateCipherSettings(db.target, settings)
    },
    skipScrollBackward: () => scrollSmooth(-5),
    skipScrollForward: () => scrollSmooth(5),
    playPauseScroll: () => {
        const input = document.getElementById("scrollSpeedInput")
        const btn = document.getElementById('playPauseScroll')
        if (scrollIntervalId) {
            btn.classList.remove("checked")
            btn.querySelector('img').src = "../public/play.svg"
            clearInterval(scrollIntervalId);
            scrollIntervalId = false
        } else {
            scrollIntervalId = setInterval(() => document.getElementById('cifra').scrollBy(0, 1), input.value)
            btn.classList.add("checked")
            btn.querySelector('img').src = "../public/pause.svg"
        }
    },
    scrollSpeedDisplay: () => {
        const newSpeed = prompt("Digite uma nova velocidade de rolagem (1-201):");

        if (newSpeed !== null && !isNaN(newSpeed) && newSpeed >= 1 && newSpeed <= 201 && parseInt(newSpeed)) {
            const scrollSpeed = parseInt(newSpeed);
            document.getElementById("scrollSpeedInput").value = scrollSpeed;
            document.getElementById('scrollSpeedDisplay').textContent = scrollSpeed;
            let settings = db.getCipherSettings(db.target)
            settings.scrollSpeed = scrollSpeed
            db.updateCipherSettings(db.target, settings)
        }
    },
    readerMode: () => {
        const btn = document.getElementById('readerMode').classList
        const pre = document.querySelector('#cifra pre')
        if (btn.contains('checked')) {
            btn.remove("checked")
            pre.contentEditable = true
            pre.style.userSelect = 'auto'
            document.exitFullscreen()
        } else {
            pre.contentEditable = false
            pre.style.userSelect = 'none'
            document.querySelector('body').requestFullscreen()
            btn.add("checked")
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
    if (settings.tablatura) {
        document.getElementById("toggleTablatura").classList.add("checked")
        document.querySelectorAll(".tablatura").forEach(tb => tb.style.display = "none")
    }
    document.getElementById('scrollSpeedDisplay').textContent = settings.scrollSpeed;
    document.getElementById('scrollSpeedInput').value = settings.scrollSpeed
}

const isCifraChildren = (el) => {
    for (let i = 0; i < 10; i++) {
        if (!el) return false
        if (el.id === "cifra") return true
        el = el.parentElement
    }
    return false
}

const keypressMap = (ev) => {
    if (document.fullscreenElement === null || !isCifraChildren(ev.target)) return
    switch (ev.keyCode) {
        case 115: bevs.skipScrollForward(); break;
        case 119: bevs.skipScrollBackward(); break;
        case 100: bevs.increaseSize(); break;
        case 97: bevs.decreaseSize(); break;
        case 113: bevs.playPauseScroll(); break;
        case 101: bevs.playPauseScroll(); break;
    }
}

let clickMapIdTemeOut = false
let clickCount = 0

const clickMap = (ev) => {
    console.log("f", document.fullscreenEnabled)
    if (document.fullscreenElement === null || !isCifraChildren(ev.target)) return
    else {
        clickCount++
        if (clickCount > 2) return
        if (clickMapIdTemeOut) clearInterval(clickMapIdTemeOut)
        clickMapIdTemeOut = setTimeout(() => {
            clickMapIdTemeOut = false
            if (clickCount === 1) bevs.skipScrollForward()
            else bevs.skipScrollBackward()
            clickCount = 0
        }, 300)
    }
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
        let settings = db.getCipherSettings(db.target)
        settings.scrollSpeed = ev.target.value
        if (scrollIntervalId) {
            clearInterval(scrollIntervalId)
            scrollIntervalId = setInterval(() => window.scrollBy(0, 1), ev.target.value)
        }
        db.updateCipherSettings(db.target, settings)
    })

    document.addEventListener('keypress', keypressMap)
    document.addEventListener('click', clickMap)
}


db = new Database(updatePlaylistsChecklist, main)
