const createUniqueID = (string) => {
    return (string + new Date().toTimeString() + new Date().getMilliseconds()).replace(/[^A-Z0-9]/ig, "");
}

const onSusses = (message = "sucesso") => console.info(message)

class Musica {
    constructor(title, author, code) {
        this[createUniqueID(title)] = {
            title: title,
            author: author,
            code: code,
            date: new Date()
        }
    }
}

class Playlist {
    constructor(name) {
        this.name = name;
        this.musicas = []
    }
    get ID() {
        return this.createID()
    }
    createID() {
        return createUniqueID(this.name)
    }
}

const getAllPlaylists = (callback = console.log) =>
    browser.storage.local.get("playlists").then((result) => {
        let playlists = {}
        if (result?.playlists) playlists = result.playlists
        callback(playlists)
    }, onError)

const createPlaylist = (title, author, code) =>
    getAllPlaylists((playlists) => {
        const playlist = new Playlist(title, author, code)
        playlists[playlist.ID] = playlist
        console.log(playlists)
        browser.storage.local.set({ "playlists": playlists }).then(onSusses, onError)
    })

const deletePlaylist = (ID) =>
    getAllPlaylists((playlists) => {
        delete playlists[ID]
        browser.storage.local.set({ "playlists": playlists }).then(onSusses, onError)
    })