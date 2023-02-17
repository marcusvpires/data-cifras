
# Data cifras

Extensão para chrome e firefox que serve como uma extensão ao [cifra club](https://www.cifraclub.com.br). A Data cifra permite que você salve, edite e categorize as cifras, além de trazer várias ferramentas que ajudam a visualizar toda a cifra em quanto toca a musica.

![](media\screenshot\button.png)

![](media\screenshot\edicao.png)

![](media\screenshot\tela-cheia.png)

![](media\screenshot\modo-coluna.png)

![](media\screenshot\tabela.png)

## Database

The database system is a JavaScript implementation of a simple relational database that stores two types of objects: playlists and ciphers.

A "cipher" is an object with a unique identifier (id) and a name (title). A "playlist" is an object with a unique identifier (id), a name (title), and a list of ciphers that belong to the playlist.

The database has several methods that allow for adding, updating, and deleting playlists and ciphers. For example, there are methods to create a new cipher, update a cipher's name, delete one or more ciphers, create a new playlist, update a playlist's name, and delete one or more playlists.

The addCipherToPlaylist method allows for adding a cipher to a playlist, while the removeCipherFromPlaylist method removes a cipher from a playlist. The removeCipherFromPlaylist method also checks if the cipher is not in any other playlists, and if it's not, it deletes the cipher from the database.

The database system is implemented using the WebExtension API's browser.storage.local feature, which allows for storing and retrieving data in the browser's local storage. The database system retrieves the database table from the local storage in the constructor and saves any changes made to the table back to the local storage using the saveTable method.