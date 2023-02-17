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
    constructor() {
        this.table = { playlists: [], ciphers: [] };
        browser.storage.local.get(["table"], (result) => {
            if (result.table) {
                this.table = result.table;
            }
        });
    }

    saveTable() {
        browser.storage.local.set({ table: this.table });
    }

    /* --------------------------------- cipher --------------------------------- */

    // Create a new cipher
    createCipher(cipherId, title) {
        const cipher = { id: cipherId, title, playlists: [] };
        this.table.ciphers.push(cipher);
        this.saveTable();
        return cipher;
    }

    // Update a cipher's name
    updateCipherName(cipherId, newTitle) {
        const cipher = this.table.ciphers.find(c => c.id === cipherId);
        cipher.title = newTitle;
        this.saveTable();
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
        this.saveTable();
    }

    /* -------------------------------- playlist -------------------------------- */

    // Create a new playlist
    createPlaylist(playlistId, title) {
        const playlist = { id: playlistId, title, ciphers: [] };
        this.table.playlists.push(playlist);
        this.saveTable();
        return playlist;
    }

    // Update a playlist's name
    updatePlaylistName(playlistId, newTitle) {
        const playlist = this.table.playlists.find(p => p.id === playlistId);
        playlist.title = newTitle;
        this.saveTable();
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
        this.saveTable();
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

        this.saveTable();
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
        this.saveTable();
    
        // Delete cipher if it's not in any playlists
        if (cipher.playlists.length === 0) {
            this.deleteCipher(cipher);
        }
    }
}

