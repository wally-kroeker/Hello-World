/**
 * Wookiefoot Lyrics Website - Main JavaScript File
 *
 * Handles data fetching, URL parsing, and dynamic content loading for the website.
 * It populates album lists, song lists, and lyrics based on the current page
 * and data from db.json.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Stores the fetched album data (the entire object from db.json, e.g., { "albums": [...] })
  // to prevent redundant fetches.
  let internalAlbumsData = null;

  /**
   * Fetches album data from db.json.
   * Implements a simple caching mechanism: if data is already fetched, returns the cached version.
   * If fetching fails or the data is not in the expected format, it falls back to placeholder data
   * and logs appropriate errors to the console.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of album objects.
   */
  async function fetchData() {
    // If data is already fetched, return the 'albums' array from the cached data.
    if (internalAlbumsData && internalAlbumsData.albums) {
      return internalAlbumsData.albums;
    }

    try {
      const response = await fetch('db.json');
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} while fetching db.json`);
        // Fallback to placeholder data if the actual db.json fetch fails.
        internalAlbumsData = {
          "albums": [
            {
              "id": "album_placeholder_fetch_failed",
              "title": "Placeholder Album (Fetch Failed)",
              "year": 2024,
              "songs": [{ "title": "Placeholder Song", "lyrics": "Could not load data from db.json. Displaying placeholder." }]
            }
          ]
        };
        console.log("Using placeholder data due to db.json fetch error.");
        return internalAlbumsData.albums;
      }

      // Parse the JSON response. Expected structure: { "albums": [...] }
      internalAlbumsData = await response.json();

      // Validate the structure of the fetched data.
      if (!internalAlbumsData || !Array.isArray(internalAlbumsData.albums)) {
        console.error("Fetched db.json is not in the expected format (must be an object with an 'albums' array).", internalAlbumsData);
        // Fallback if the data format is incorrect.
        internalAlbumsData = {
          "albums": [
            {
              "id": "album_placeholder_format_error",
              "title": "Placeholder Album (Data Format Error)",
              "year": 2024,
              "songs": [{ "title": "Placeholder Song", "lyrics": "Invalid data format in db.json. Displaying placeholder." }]
            }
          ]
        };
        console.log("Using placeholder data due to db.json format error.");
        return internalAlbumsData.albums;
      }
      // Return the array of albums from the successfully fetched and validated data.
      return internalAlbumsData.albums;
    } catch (error) {
      console.error("Failed to fetch or parse db.json:", error);
      // Fallback for any other errors (e.g., network issues, JSON parsing errors).
      internalAlbumsData = {
        "albums": [
          {
            "id": "album_placeholder_catch_error",
            "title": "Placeholder Album (General Error)",
            "year": 2024,
            "songs": [{ "title": "Placeholder Song", "lyrics": "A general error occurred while loading data. Displaying placeholder." }]
          }
        ]
      };
      console.log("Using placeholder data due to a caught error during fetch/parse.");
      return internalAlbumsData.albums;
    }
  }

  /**
   * Helper function to get a specific URL query parameter by its name.
   * @param {string} paramName - The name of the URL parameter to retrieve.
   * @returns {string|null} The value of the parameter, or null if not found.
   */
  function getParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  }

  // Determine the current page and call the appropriate function to load its content.
  const pathname = window.location.pathname;
  if (pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('/')) {
    loadIndexPage();
  } else if (pathname.endsWith('album.html')) {
    loadAlbumPage();
  } else if (pathname.endsWith('song.html')) {
    loadSongPage();
  }

  /**
   * Loads content for the index.html page.
   * Fetches album data and populates the album list container with links to album.html.
   */
  async function loadIndexPage() {
    const albumsArray = await fetchData(); // This now correctly receives the array of albums.
    const albumListContainer = document.getElementById('album-list-container');

    if (!albumListContainer) {
      console.error("Element with ID 'album-list-container' not found on index.html.");
      return;
    }
    albumListContainer.innerHTML = ''; // Clear any existing content (e.g., placeholder text).

    if (!albumsArray || albumsArray.length === 0) {
      albumListContainer.textContent = 'No albums found. The database might be empty or there was an issue loading data.';
      return;
    }

    albumsArray.forEach(album => {
      const albumLink = document.createElement('a');
      albumLink.href = `album.html?albumId=${album.id}`;
      albumLink.textContent = `${album.title} (${album.year === null ? 'Year N/A' : album.year})`;
      
      const albumDiv = document.createElement('div'); // Wrap link in a div for potential future styling/layout
      albumDiv.appendChild(albumLink);
      albumListContainer.appendChild(albumDiv);
    });
  }

  /**
   * Loads content for the album.html page.
   * Fetches data for a specific album based on 'albumId' from URL parameters.
   * Populates the album title and the list of songs for that album.
   */
  async function loadAlbumPage() {
    const albumId = getParam('albumId');
    if (!albumId) {
      // If no albumId is provided, display an error and a link back to the main page.
      document.body.innerHTML = '<h1>Error: Album ID is missing in the URL.</h1><p><a href="index.html">Back to Album List</a></p>';
      console.error("Album ID missing in URL for album.html.");
      return;
    }

    const albumsArray = await fetchData();
    const album = albumsArray.find(a => a.id === albumId);

    const albumTitleElement = document.getElementById('album-title');
    const songListContainer = document.getElementById('song-list-container');

    if (!albumTitleElement || !songListContainer) {
      console.error("Required DOM elements ('album-title' or 'song-list-container') not found on album.html.");
      return;
    }
    songListContainer.innerHTML = ''; // Clear existing content.

    if (album) {
      albumTitleElement.textContent = album.title;
      if (album.songs && album.songs.length > 0) {
        album.songs.forEach(song => {
          const songLink = document.createElement('a');
          // Encode song title for safe inclusion in URL.
          const encodedSongTitle = encodeURIComponent(song.title);
          songLink.href = `song.html?albumId=${album.id}&songTitle=${encodedSongTitle}`;
          songLink.textContent = song.title;
          
          const songDiv = document.createElement('div'); // Wrap link for styling/layout
          songDiv.appendChild(songLink);
          songListContainer.appendChild(songDiv);
        });
      } else {
        songListContainer.textContent = 'No songs found for this album.';
      }
    } else {
      albumTitleElement.textContent = 'Album Not Found';
      songListContainer.textContent = `Could not find details for album ID: ${albumId}. Please check the ID or return to the album list.`;
    }
  }

  /**
   * Loads content for the song.html page.
   * Fetches data for a specific song based on 'albumId' and 'songTitle' from URL parameters.
   * Populates the song title and lyrics.
   */
  async function loadSongPage() {
    const albumId = getParam('albumId');
    const songTitleParam = getParam('songTitle'); // Song title from URL is URI encoded.

    if (!albumId || !songTitleParam) {
      document.body.innerHTML = '<h1>Error: Album ID or Song Title is missing in the URL.</h1><p><a href="index.html">Back to Album List</a></p>';
      console.error("Album ID or Song Title missing in URL for song.html.");
      return;
    }
    // Decode the song title from the URL parameter.
    const songTitle = decodeURIComponent(songTitleParam);

    const albumsArray = await fetchData();
    const album = albumsArray.find(a => a.id === albumId);
    
    const songTitleElement = document.getElementById('song-title');
    const lyricsContainer = document.getElementById('lyrics-container');
    const backToAlbumLink = document.getElementById('back-to-album');

    if (!songTitleElement || !lyricsContainer || !backToAlbumLink) {
      console.error("Required DOM elements ('song-title', 'lyrics-container', or 'back-to-album') not found on song.html.");
      return;
    }
    lyricsContainer.innerHTML = ''; // Clear existing content.

    if (album) {
      const song = album.songs.find(s => s.title === songTitle);
      if (song) {
        songTitleElement.textContent = song.title;
        lyricsContainer.textContent = song.lyrics || 'No lyrics available for this song.';
        backToAlbumLink.href = `album.html?albumId=${album.id}`;
      } else {
        songTitleElement.textContent = 'Song Not Found';
        lyricsContainer.textContent = `Could not find lyrics for the song: "${songTitle}" in the album: "${album.title}".`;
        backToAlbumLink.href = `album.html?albumId=${album.id}`; // Link back to the correct album page.
      }
    } else {
      songTitleElement.textContent = 'Album Not Found';
      lyricsContainer.textContent = `Could not find the album (ID: ${albumId}) to look for the song: "${songTitle}".`;
      backToAlbumLink.href = 'index.html'; // If album not found, link back to the main index page.
    }
  }
});
