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

const handelScrollSpeedInput = ev => {
    document.getElementById('scrollSpeedDisplay').innerText = ev.target.value
    let settings = db.getCipherSettings(db.target)
    settings.scrollSpeed = ev.target.value
    db.updateCipherSettings(db.target, settings)
    if (scrollIntervalId) {
        buttonEvents.playPauseScroll()
        buttonEvents.playPauseScroll()
    }
}

/**
 * 
 * If auto scroll is on, the best way to move up or down is to turn auto scroll off and 
 * start another auto scroll at a higher speed and after a while, turn auto scroll off
 * 
 * @param {number} scroll amount of pixels to scroll for each loop (70 loops)
 * 
 */
const scrollSmooth = (scroll) => {
    if (scrollIntervalId) {
        let count = 0;
        buttonEvents.playPauseScroll();
        let intervalID = setInterval(() => {
            if (++count > 70) {
                buttonEvents.playPauseScroll();
                clearInterval(intervalID);
            }
            document.getElementById('cifra').scrollBy(0, scroll);
        }, 1);
    } else document.getElementById('cifra').scrollBy({ top: scroll * 90, left: 0, behavior: 'smooth' });

}


// Function to decrease or increse font size by rate
// Update cipher code component and save in db
const updateFontSize = (rate) => {
    let settings = db.getCipherSettings(db.target);
    settings.fontSize += rate;
    // prevent to set an invald number
    if (Numeber(settings.fontSize) < 0.1) settings.fontSize = 0.1
    db.updateCipherSettings(db.target, settings);
    document.querySelector("#cifra pre").style.fontSize = settings.fontSize + "rem";
}

const buttonEvents = {
    // Default function that logs to the console when a button is clicked
    default: (ev) => console.log('No handle button', ev.target),

    // Function to toggle the visibility of the #controller element by adding or removing the "hide" class
    toggleSidebar: () => {
        let controller = document.getElementById('controller');
        controller.classList.toggle('hide');
    },

    // Function to navigate to the library page
    openLibrary: () => window.location.href = "../library/index.html",

    // Function to toggle the visibility of the playlist checklist section
    togglePlaylistsChecklist: () => {
        updatePlaylistsChecklist();
        let controller = document.getElementById('controller');
        controller.classList.toggle('expanded');
    },

    // Function to create a new playlist
    createPlaylist: () => {
        const title = prompt("Digite um nome para a nova playlist");
        if (title) db.createPlaylist(title);
    },

    decreaseSize: () => updateFontSize(-1),
    increaseSize: () => updateFontSize(1),

    // Changes the visibility of the tablatures
    // The tablatures are tables made from characters that inform a sequence of notes to be played
    toggleTablatura: () => {
        let settings = db.getCipherSettings(db.target)
        const classList = document.getElementById("toggleTablatura").classList
        const tablaturaElements = document.querySelectorAll(".tablatura")
        if (settings.tablatura) {
            classList.remove("checked")
            settings.tablatura = false
            tablaturaElements.forEach(tb => tb.style.display = "block")
        } else {
            classList.add("checked")
            settings.tablatura = true
            tablaturaElements.forEach(tb => tb.style.display = "none")
        }
        db.updateCipherSettings(db.target, settings)
    },

    skipScrollBackward: () => scrollSmooth(-5),
    skipScrollForward: () => scrollSmooth(5),

    playPauseScroll: () => {
        const input = document.getElementById("scrollSpeedInput")
        const button = document.getElementById('playPauseScroll')
        if (scrollIntervalId) {
            button.classList.remove("checked")
            button.querySelector('img').src = "../public/play.svg"
            clearInterval(scrollIntervalId);
            scrollIntervalId = false
        } else {
            scrollIntervalId = setInterval(() => document.getElementById('cifra').scrollBy(0, 1), input.value)
            button.classList.add("checked")
            button.querySelector('img').src = "../public/pause.svg"
        }
    },

    // If the button showing the scrolling speed is clicked, the user can enter a specific speed
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

    // In reading mode, the system opens in full screen and it is not possible to edit the cipher
    // The system also provides shortcuts to help display the cipher.
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
            btn.add("checked")
            document.querySelector('body').requestFullscreen()
        }

    }
}


/* -------------------------------------------------------------------------- */
/*                           components constructor                           */
/* -------------------------------------------------------------------------- */

/**
 * 
 * @param {string} code matches a pre element in HTML
 * @param {strin} id unique
 * @param {object} settings { fontSize: float, tablatura: boolean, scrollSpeed: int }
 */

const constructor = (code, id, settings) => {
    // console.log("Create component", code, id, settings)
    const pre = new DOMParser().parseFromString(code, "text/html").querySelector("pre");
    // console.log("Code component:", el)
    pre.id = id; pre.contentEditable = true; pre.removeAttribute("xmlns");
    pre.addEventListener('input', handleCode)
    pre.style.fontSize = settings.fontSize + 'rem'
    document.querySelector("#cifra").appendChild(pre)
    if (settings.tablatura) {
        document.getElementById("toggleTablatura").classList.add("checked")
        document.querySelectorAll(".tablatura").forEach(tb => tb.style.display = "none")
    }
    document.getElementById('scrollSpeedDisplay').textContent = settings.scrollSpeed;
    document.getElementById('scrollSpeedInput').value = settings.scrollSpeed
}

/* -------------------------------------------------------------------------- */
/*                               user event map                               */
/* -------------------------------------------------------------------------- */

const isCifraChildren = (element) => {
    for (let i = 0; i < 10 && element; i++, element = element.parentElement)
        if (element.id === "cifra") return true;
    return false;
}

const scrollToTop = () => {
    const componentTop = document.getElementById("cifra").getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: componentTop, behavior: 'smooth' });
};

const keypressMap = (keyEvent) => {
    // Activate shortcuts if in reading mode
    if (document.fullscreenElement === null) return
    switch (keyEvent.code) {
        case 'KeyW': buttonEvents.skipScrollBackward(); break;
        case 'KeyS': buttonEvents.skipScrollForward(); break;
        case 'KeyD': buttonEvents.increaseSize(); break;
        case 'KeyA': buttonEvents.decreaseSize(); break;
        case 'KeyE': buttonEvents.playPauseScroll(); break;
        case 'KeyQ': buttonEvents.scrollToTop(); break;
        case 'ArrowUp': buttonEvents.skipScrollBackward(); break;
        case 'ArrowDown': buttonEvents.skipScrollBackward(); break;
        case 'ArrowLeft': buttonEvents.decreaseSize(); break;
        case 'ArrowRight': buttonEvents.increaseSize(); break;
    }
}

let clickMapIdTemeOut = false, clickCount = 0;

// Maps the number of consecutive clicks and executes actions based on that
const clickMap = (clickEvent) => {
    if (!document.fullscreenElement || !isCifraChildren(clickEvent.target)) return;
    clickCount++;
    if (clickCount > 4) return;
    clickMapIdTemeOut && clearInterval(clickMapIdTemeOut);
    clickMapIdTemeOut = setTimeout(() => {
        clickMapIdTemeOut = false;
        switch (clickCount) {
            case 1: buttonEvents.skipScrollForward(); break
            case 2: buttonEvents.skipScrollBackward(); break
            case 3: buttonEvents.scrollToTop(); break
            case 4: break
        }; clickCount = 0;
    }, 300);
}

/* -------------------------------------------------------------------------- */
/*                                    main                                    */
/* -------------------------------------------------------------------------- */

/**
 *  This function is a point of execution for all functionalities of this code
 * 
 *  @type playlist = {
 *     id: uniqueString
 *     title: string
 *     ciphers: id[]
 *  }
 *  @type cipher = {
 *     id: uniqueString
 *     title: string
 *     code: string
 *     playlists: id[]
 *     settings: { fontSize: float, tablatura: boolean, scrollSpeed: int }
 *  }
 *  @type target = cipher id
 */

const main = () => {
    // This code aims to find a target cipher in the database by its id
    // The found cipher is stored in the 'target' variable
    const target = db.targets.find(c => c.id == db.target)
    // console.log('Load target cipher:', target)
    if (!target) return

    // Inject the cipher and add functionalities
    constructor(target.code, target.id, target.settings)

    // Adds an event listener to each button element on the page.
    // The event listener's behavior is determined by the 'buttonEvents' object
    document.querySelectorAll('button').forEach(button =>
        button.addEventListener('click', buttonEvents[button.id] ? buttonEvents[button.id] : buttonEvents.default))

    document.getElementById('scrollSpeedInput').addEventListener('input', handelScrollSpeedInput)

    document.addEventListener('keydown', keypressMap)
    document.addEventListener('click', clickMap)
}


db = new Database(updatePlaylistsChecklist, main)
