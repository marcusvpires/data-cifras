
// The storage object is a property of the Database class that represents the data
// model used in the application

// storage = { playlists: [], ciphers: [], target: id }

// The playlists and ciphers arrays hold the playlists and ciphers added by the user

/* exemple of playlist object

{
    id: "playlist1",
    title: "My Playlist",
    settings: { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
    ciphers: ["cipher1", "cipher2", "cipher3"]
}

/* 

/* exemple of cipher object

{
    id: "cipher1",
    title: "My Cipher",
    code: "Song lyrics with sheet music"
    playlists: ["playlist1", "playlist2"]
}

*/

// the target cipher is the current cipher id who will be opened on the home page


class Database {

    constructor(updateUI = (table) => { }, cb = (table) => { }) {
        console.info("Starting database, accessing database through API")
        browser.storage.local.get(null, (res) => {

            // function called after update the storage
            this.updateUI = updateUI

            // Retrieve the 'table' key from local storage
            this.playlists = res?.playlists || []
            this.ciphers = res?.ciphers || []
            // the target is only applied if there is a cipher with the target id
            this.target = res?.target && this.ciphers.find(c => c.id === res?.target) ? res?.target : null

            console.info("API accessed successfully")
            console.log(`playlists: ${this.playlists.length}, ciphers: ${this.ciphers.length}, target: ${this.target}`)
            cb({ playlists: this.playlists, ciphers: this.ciphers, target: this.target })
        })
    }

    createID() {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        return `${timestamp}wow${random}`;
    }

    setUpadteUi(updateUI) {
        this.updateUI = updateUI
    }

    save() {
        // If the target cipher no longer exists, the target is removed from it.
        if (!this.ciphers.find(c => c.id === this.target)) this.target = null
        this.updateUI({ playlists: this.playlists, ciphers: this.ciphers, target: this.target })
        browser.storage.local.set({ playlists: this.playlists, ciphers: this.ciphers, target: this.target });
    }

    /* --------------------------------- cipher --------------------------------- */

    createCipher(title, playlists = [], code = "", id = this.createID(), settings = { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }) {

        // The title is the only constant differential in the system from the input
        // of the user, so it is a required item
        if (!title) throw new Error("The title is required to create a new cipher")

        // Check if a cipher with this ID aready exists
        if (this.ciphers.find(cipher => cipher.id === id))
            throw new Error("A cipher with this ID aready exixts")

        // save the playlist and set the relationship with the playlists table
        this.ciphers.push({ title, playlists, code, id, settings });
        this.addCiphersToPlaylists([id], playlists);
        this.save();
        return id
    }

    renameCiphers(cipherIds, newTitle) {
        // The title is the only constant differential in the system from the input
        // of the user, so it is a required item
        if (!newTitle) throw new Error("The title is required to create a new cipher")

        cipherIds.forEach((id, i) => {
            const cipher = this.ciphers.find(c => c.id === id);
            // rename multiple ciphers with an index to prevent same title
            if (cipher) cipher.title = i === 0 ? newTitle : `${newTitle} (${i})`;;
        })
        this.save();
    }

    updateCipherCode(id, newCode) {
        const cipher = this.ciphers.find(c => c.id === id);
        if (cipher) cipher.code = newCode
        else throw new Error(`Unable to update cipher ${id} code because the cipher with that id does not exist`)
        this.save();
    }
    
    updateCipherSettings (id, newSettings) {
        const cipher = this.ciphers.find(c => c.id === id);
        if (cipher) cipher.settings = newSettings
        else throw new Error(`Unable to update cipher ${id} code because the cipher with that id does not exist`)
        this.save();
    }

    deleteCiphers(Ids) {
        for (const id of Ids) {
            // Filter out the cipher with this ID from the "ciphers" array in the table
            this.ciphers = this.ciphers.filter((c) => c.id !== id);
            // Filter out the cipher with this ID from the "ciphers" array in the playlist
            this.playlists = this.playlists.map(p => p.ciphers.filter((c) => c !== id))
        }
        this.save();
    }

    /* -------------------------------- playlist -------------------------------- */

    createPlaylist(title, ciphers = [], id = this.createID()) {

        // The title is the only constant differential in the system from the input
        // of the user, so it is a required item
        if (!title) throw new Error("The title is required to create a new cipher")

        // Check if a playlist with this ID aready exists
        if (this.playlists.find(p => p.id === id)) throw new Error("A playlist with this ID aready exixts")

        this.playlists.push({ title, ciphers: ciphers, id: id });
        this.addCiphersToPlaylists(ciphers, [id])
        this.save();
        return id;
    }

    deletePlaylist(Ids) {
        for (const id of Ids) {
            // Filter out the playlist with this ID from the "playlists" array in the table
            this.playlists = this.playlists.filter((p) => p.id !== id);
            // Filter out the playlist with this ID from the "playlists" array in the cipher
            this.ciphers = this.ciphers.map(p => p.playlists.filter((p) => p !== id))
        }
        this.save();
    }

    /* ------------------------ many to many relationship ----------------------- */

    // for each playlist ID, add the cipher to the playlist
    addCiphersToPlaylists(cipherIds, playlistIds) {
        for (const cipherId of cipherIds) {
            const cipher = this.ciphers.find(c => c.id === cipherId);
            if (!cipher) {
                console.error(`Cipher with id '${cipherId}' does not exist`)
                continue;
            }
            for (const playlistId of playlistIds) {
                const playlist = this.playlists.find(p => p.id === playlistId);
                if (!playlist) {
                    console.error(`Playlist with id '${playlistId}' does not exist`)
                    continue;
                }
                if (!playlist.ciphers.includes(cipherId)) playlist.ciphers.push(cipherId);
                if (!cipher.playlists.includes(playlistId)) cipher.playlists.push(playlistId);
            }
        }
        this.save()
    }

    // Remove a cipher from a playlist
    removeCiphersFromPlaylists(cipherIds, playlistIds) {
        for (const cipherId of cipherIds) {
            const cipher = this.ciphers.find(c => c.id === cipherId);
            for (const playlistId of playlistIds) {
                const playlist = this.playlists.find((p) => p.id === playlistId);
                playlist.ciphers = playlist.ciphers.filter((c) => c !== cipherId);
                cipher.playlists = cipher.playlists.filter((p) => p !== playlistId);
            }
            if (cipher.playlists.length === 0 && cipher.id !== this.target) this.deleteCipher(cipher);

        }
    }

    /* --------------------------------- target --------------------------------- */

    setTarget(title, code = '', playlists = [], id = this.createID()) {
        // The title is the only constant differential in the system from the input
        // of the user, so it is a required item
        if (!title) throw new Error("The title is required to create a new cipher")

        if (!this.ciphers.find(cipher => cipher.id === id)) this.createCipher(title, playlists, code, id)
        this.target = id
    }
}