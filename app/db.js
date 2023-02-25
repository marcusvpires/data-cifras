
class Database {

    constructor(updateUI = () => { }, callback = () => { }) {
        this.playlists = [];
        this.ciphers = [];
        this.target = null;
        this.updateUI = updateUI;
        this.callback = callback;
        browser.storage.local.get(null, this.loadFromStorage);
    }

    loadFromStorage = (res) => {
        this.playlists = res?.playlists || [];
        this.ciphers = res?.ciphers || [];
        if (res?.target) {
            const cipher = this.ciphers.find((c) => c.id === res?.target);
            if (cipher) this.target = res?.target;
        }
        this.callback({
            playlists: this.playlists,
            ciphers: this.ciphers,
            target: this.target,
        });
    };

    createID = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000000);
        return `${timestamp}wow${random}`;
    };

    setUpadteUi = (updateUI) => {
        this.updateUI = updateUI;
    };

    save = () => {
        try {
            // console.log(db)
            // Check the validity of the database
            this.validateAndFix();
            // console.log(db.playlists.length, db.ciphers.length)

            // Update the UI with the current state of the database
            this.updateUI({
                playlists: this.playlists,
                ciphers: this.ciphers,
                target: this.target
            });

            // Save the current state of the database to local storage
            browser.storage.local.set({
                playlists: this.playlists,
                ciphers: this.ciphers,
                target: this.target
            });
        } catch (err) {
            // If an error occurs, log the error and revert to the previous state of the database
            alert("Ocorreu um erro ao atualizar os dados");
            // console.error(err);
            // console.log(db.playlists);
            // console.log(db.ciphers);
            // console.log(db.target);

            // Load the previous state of the database from local storage
            loadFromStorage()
        }
    };


    validateAndFix() {
        let valid = true;

        // Check if all cipher IDs are unique
        const idSet = new Set();
        for (const cipher of this.ciphers) {
            if (idSet.has(cipher.id)) {
                valid = false;
                const newId = this.createID();
                // console.warn(`Duplicate cipher ID "${cipher.id}" found. Changing ID to "${newId}"`);
                cipher.id = newId;
            } else {
                idSet.add(cipher.id);
            }
        }

        // Check if all playlist IDs are unique
        const playlistIdSet = new Set();
        for (const playlist of this.playlists) {
            if (playlistIdSet.has(playlist.id)) {
                valid = false;
                const newId = this.createID();
                // console.warn(`Duplicate playlist ID "${playlist.id}" found. Changing ID to "${newId}"`);
                playlist.id = newId;
            } else {
                playlistIdSet.add(playlist.id);
            }
        }

        // Check if all cipher IDs in playlists are valid
        for (const playlist of this.playlists) {
            playlist.ciphers = playlist.ciphers.filter(cipherId => {
                const found = this.ciphers.find(cipher => cipher.id === cipherId);
                if (!found) {
                    // console.warn(`Invalid cipher ID "${cipherId}" found in playlist "${playlist.title}". Removing from playlist.`);
                    valid = false;
                    return false;
                }
                return true;
            });
        }

        // Check if all playlist IDs in ciphers are valid
        for (const cipher of this.ciphers) {
            cipher.playlists = cipher.playlists.filter(playlistId => {
                const found = this.playlists.find(playlist => playlist.id === playlistId);
                if (!found) {
                    // console.warn(`Invalid playlist ID "${playlistId}" found in cipher "${cipher.title}". Removing from cipher.`);
                    valid = false;
                    return false;
                }
                return true;
            });
        }

        // Check if target cipher ID is valid
        if (this.target) {
            const found = this.ciphers.find(cipher => cipher.id === this.target);
            if (!found) {
                // console.warn(`Invalid target cipher ID "${this.target}" found. Clearing target.`);
                valid = false;
                this.target = null;
            }
        }

        if (!valid) {
            // console.warn("Database validation failed. Attempting to fix errors.");
            this.save();
        }

        return valid;
    }

    /* --------------------------------- cipher --------------------------------- */

    createCipher = (title, playlists = [], code =  new XMLSerializer().serializeToString(document.createElement('pre')), id = this.createID(), settings = { fontSize: 1.5, tablatura: false, scrollSpeed: 10 }) => {
        if (!title) throw new Error("The title is required to create a new cipher");
        if (this.ciphers.find((cipher) => cipher.id === id)) throw new Error("A cipher with this ID already exists");
        this.ciphers.push({ title, playlists, code, id, settings });
        this.addCiphersToPlaylists([id], playlists);
        this.save();
        return id;
    };

    renameCiphers = (cipherIds, newTitle) => {
        if (!newTitle) throw new Error("The title is required to create a new cipher");
        cipherIds.forEach((id, i) => {
            const cipher = this.ciphers.find((c) => c.id === id);
            if (cipher) cipher.title = i === 0 ? newTitle : `${newTitle} (${i})`;
        });
        this.save();
    };

    updateCipherCode = (id, newCode) => {
        const cipher = this.ciphers.find((c) => c.id === id);
        if (cipher) cipher.code = newCode;
        else throw new Error(`Unable to update cipher ${id} code because the cipher with that id does not exist`);
        this.save();
    };

    updateCipherSettings = (id, newSettings) => {
        const cipher = this.ciphers.find((c) => c.id === id);
        if (cipher) cipher.settings = newSettings;
        else throw new Error(`Unable to update cipher ${id} code because the cipher with that id does not exist`);
        this.save();
    };

    getCipherSettings(id) {
        return db.ciphers.find(c => c.id === db.target).settings || { fontSize: 1.5, tablatura: true, scrollSpeed: 10 }
    }

    deleteCiphers = (Ids) => {
        for (const id of Ids) {
            this.ciphers = this.ciphers.filter((c) => c.id !== id);
            this.playlists = this.playlists.map((p) => {
                p.ciphers = p.ciphers.filter((c) => c !== id);
                return p;
            });
        }
        this.save();
    };

    /* -------------------------------- playlist -------------------------------- */

    createPlaylist(title, ciphers = [], id = this.createID()) {
        if (!title) throw new Error("The title is required to create a new cipher");
        if (this.playlists.find(p => p.id === id)) throw new Error("A playlist with this ID already exists");
        this.playlists.push({ title, ciphers, id });
        this.addCiphersToPlaylists(ciphers, [id]);
        this.save();
        return id;
    }

    renamePlaylists(playlistIds, newTitle) {
        if (!newTitle) throw new Error("The title is required to create a new cipher");
        playlistIds.forEach((id, i) => {
            this.playlists = this.playlists.map(p => {
                if (p.id === id) p.title = i === 0 ? newTitle : `${newTitle} (${i})`;
                return p;
            });
        });
        this.save();
    }

    deletePlaylists = (playlistIds) => {
        const removedCiphers = new Set();
        this.playlists = this.playlists.filter((playlist) => {
            if (playlistIds.includes(playlist.id)) {
                playlist.ciphers.forEach((cipherId) => {
                    const cipherIndex = this.ciphers.findIndex((cipher) => cipher.id === cipherId);
                    if (cipherIndex !== -1) {
                        const cipher = this.ciphers[cipherIndex];
                        cipher.playlists = cipher.playlists.filter((playlistId) => playlistId !== playlist.id);
                        if (cipher.playlists.length === 0 && cipher.id !== this.target) {
                            removedCiphers.add(cipher);
                            this.ciphers.splice(cipherIndex, 1);
                        }
                    }
                });
                return false;
            }
            return true;
        });

        if (removedCiphers.size > 0) {
            const invalidCiphers = [];
            for (const cipher of removedCiphers) {
                if (!this.playlists.some((playlist) => playlist.ciphers.includes(cipher.id))) {
                    invalidCiphers.push(cipher);
                }
            }
            if (invalidCiphers.length > 0) {
                invalidCiphers.map((cipher) => cipher.id).join(", ");
                this.ciphers = this.ciphers.filter((cipher) => !invalidCiphers.includes(cipher));
            }
        }

        this.save();
    };

    /* ------------------------ many to many relationship ----------------------- */

    addCiphersToPlaylists(cipherIds, playlistIds) {
        for (const cipherId of cipherIds) {
            const cipher = this.ciphers.find(c => c.id === cipherId);
            if (!cipher) {
                // console.error(`Cipher with id '${cipherId}' does not exist`);
                continue;
            }
            for (const playlistId of playlistIds) {
                const playlist = this.playlists.find(p => p.id === playlistId);
                if (!playlist) {
                    // console.error(`Playlist with id '${playlistId}' does not exist`);
                    continue;
                }
                if (!playlist.ciphers.includes(cipherId)) playlist.ciphers.push(cipherId);
                if (!cipher.playlists.includes(playlistId)) cipher.playlists.push(playlistId);
            }
        }
        this.save();
    }

    getCiphersInPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) throw new Error(`Unable to find playlist with id: ${playlistId}`);
        return playlist.ciphers.map(cipherId => {
            const cipher = this.ciphers.find(c => c.id === cipherId);
            if (!cipher) throw new Error(`Unable to find cipher with id: ${cipherId}`);
            return cipher;
        });
    }

    removeCiphersFromPlaylists(cipherIds, playlistIds) {
        for (const cipherId of cipherIds) {
            const cipher = this.ciphers.find(c => c.id === cipherId);
            for (const playlistId of playlistIds) {
                const playlist = this.playlists.find(p => p.id === playlistId);
                playlist.ciphers = playlist.ciphers.filter(c => c !== cipherId);
                cipher.playlists = cipher.playlists.filter(p => p !== playlistId);
            }
            if (cipher.playlists.length === 0 && cipher.id !== this.target) this.deleteCipher(cipher);
        }
    }

    /* --------------------------------- target --------------------------------- */

    /**
     * Save the target onthe storage and if the cipher not exist, it create thi cipher
     * 
     * @param {string} code matches a pre element in HTML 
     * @param {string} id need to be unique
     * @param {array} playlists 
     * @param {string} title 
     */

    setTarget(title, code = '', playlists = [], id = this.createID()) {
        if (!title) throw new Error("The title is required to create a new cipher");
        if (!this.ciphers.find(cipher => cipher.id === id)) this.createCipher(title, playlists, code, id);
        this.target = id;
    }
}