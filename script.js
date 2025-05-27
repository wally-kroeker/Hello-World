document.addEventListener('DOMContentLoaded', () => {
    let internalAlbumsData = null; // Renamed to avoid confusion, stores the {albums: []} structure

    // Function to fetch data from db.json
    async function fetchData() {
        if (internalAlbumsData) { // Check if data is already fetched
            return internalAlbumsData.albums; // Return the array of albums
        }
        try {
            const response = await fetch('db.json');
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} while fetching db.json`);
                // Fallback to placeholder if db.json fetch fails
                internalAlbumsData = { // Ensure placeholder has the same structure
                    "albums": [
                        {
                            "id": "album_placeholder_1",
                            "title": "Placeholder Album 1 (Fetch Failed)",
                            "year": 2023,
                            "songs": [{ "title": "Placeholder Song 1", "lyrics": "Fetch failed, using placeholder." }]
                        }
                    ]
                };
                console.log("Using placeholder data due to fetch error.");
                return internalAlbumsData.albums;
            }
            internalAlbumsData = await response.json(); // Should be { "albums": [...] }
            if (!internalAlbumsData || !Array.isArray(internalAlbumsData.albums)) {
                console.error("Fetched db.json is not in the expected format (missing 'albums' array).", internalAlbumsData);
                // Fallback if format is wrong
                internalAlbumsData = {
                     "albums": [
                        {
                            "id": "album_placeholder_format",
                            "title": "Placeholder Album (Format Error)",
                            "year": 2023,
                            "songs": [{ "title": "Placeholder Song (Format Error)", "lyrics": "Format error in db.json, using placeholder." }]
                        }
                    ]
                };
                console.log("Using placeholder data due to format error.");
                return internalAlbumsData.albums;
            }
            return internalAlbumsData.albums; // Return the array of albums
        } catch (error) {
            console.error("Failed to fetch or parse db.json:", error);
            // Fallback for any other errors (e.g., network, JSON parse error)
             internalAlbumsData = { // Ensure placeholder has the same structure
                "albums": [
                    {
                        "id": "album_placeholder_catch",
                        "title": "Placeholder Album (Catch Error)",
                        "year": 2023,
                        "songs": [{ "title": "Placeholder Song (Catch Error)", "lyrics": "General error, using placeholder." }]
                    }
                ]
            };
            console.log("Using placeholder data due to a caught error.");
            return internalAlbumsData.albums;
        }
    }

    // Helper function to get URL parameters
    function getParam(paramName) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName);
    }

    // Page-specific logic
    const pathname = window.location.pathname;

    if (pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('/')) {
        loadIndexPage();
    } else if (pathname.endsWith('album.html')) {
        loadAlbumPage();
    } else if (pathname.endsWith('song.html')) {
        loadSongPage();
    }

    async function loadIndexPage() {
        const albumsArray = await fetchData(); // Now receives the array of albums
        const albumListContainer = document.getElementById('album-list-container');

        if (!albumListContainer) {
            console.error("Album list container not found on index.html");
            return;
        }
        albumListContainer.innerHTML = ''; 

        if (!albumsArray || albumsArray.length === 0) {
            albumListContainer.textContent = 'No albums found or failed to load data.';
            return;
        }

        albumsArray.forEach(album => {
            const albumLink = document.createElement('a');
            albumLink.href = `album.html?albumId=${album.id}`;
            albumLink.textContent = `${album.title} (${album.year === null ? 'Year N/A' : album.year})`;
            
            const albumDiv = document.createElement('div');
            albumDiv.appendChild(albumLink);
            albumListContainer.appendChild(albumDiv);
        });
    }

    async function loadAlbumPage() {
        const albumId = getParam('albumId');
        if (!albumId) {
            document.body.innerHTML = '<h1>Error: Album ID is missing.</h1><a href="index.html">Back to list</a>';
            return;
        }

        const albumsArray = await fetchData(); // Receives array
        const album = albumsArray.find(a => a.id === albumId);

        const albumTitleElement = document.getElementById('album-title');
        const songListContainer = document.getElementById('song-list-container');

        if (!albumTitleElement || !songListContainer) {
            console.error("Required elements not found on album.html");
            return;
        }
        songListContainer.innerHTML = ''; 

        if (album) {
            albumTitleElement.textContent = album.title;
            if (album.songs && album.songs.length > 0) {
                album.songs.forEach(song => {
                    const songLink = document.createElement('a');
                    const encodedSongTitle = encodeURIComponent(song.title);
                    songLink.href = `song.html?albumId=${album.id}&songTitle=${encodedSongTitle}`;
                    songLink.textContent = song.title;
                    
                    const songDiv = document.createElement('div');
                    songDiv.appendChild(songLink);
                    songListContainer.appendChild(songDiv);
                });
            } else {
                songListContainer.textContent = 'No songs found for this album.';
            }
        } else {
            albumTitleElement.textContent = 'Album Not Found';
            songListContainer.textContent = `Could not find details for album ID: ${albumId}.`;
        }
    }

    async function loadSongPage() {
        const albumId = getParam('albumId');
        const songTitleParam = getParam('songTitle');

        if (!albumId || !songTitleParam) {
            document.body.innerHTML = '<h1>Error: Album ID or Song Title is missing.</h1><a href="index.html">Back to list</a>';
            return;
        }
        const songTitle = decodeURIComponent(songTitleParam);

        const albumsArray = await fetchData(); // Receives array
        const album = albumsArray.find(a => a.id === albumId);
        
        const songTitleElement = document.getElementById('song-title');
        const lyricsContainer = document.getElementById('lyrics-container');
        const backToAlbumLink = document.getElementById('back-to-album');

        if (!songTitleElement || !lyricsContainer || !backToAlbumLink) {
            console.error("Required elements not found on song.html");
            return;
        }
        lyricsContainer.innerHTML = '';

        if (album) {
            const song = album.songs.find(s => s.title === songTitle);
            if (song) {
                songTitleElement.textContent = song.title;
                lyricsContainer.textContent = song.lyrics || 'No lyrics available for this song.';
                backToAlbumLink.href = `album.html?albumId=${album.id}`;
            } else {
                songTitleElement.textContent = 'Song Not Found';
                lyricsContainer.textContent = `Could not find lyrics for song: "${songTitle}" in album "${album.title}".`;
                backToAlbumLink.href = `album.html?albumId=${album.id}`; 
            }
        } else {
            songTitleElement.textContent = 'Album Not Found';
            lyricsContainer.textContent = `Could not find album ID: ${albumId} to look for song: "${songTitle}".`;
            backToAlbumLink.href = 'index.html'; 
        }
    }
});
