# Wookiefoot Lyrics Website

A simple website to display Wookiefoot albums, songs, and their lyrics.

## How to View Locally

1.  Ensure you have all the project files in the same directory:
    *   `index.html`
    *   `album.html`
    *   `song.html`
    *   `style.css`
    *   `script.js`
    *   `db.json`
2.  Open the `index.html` file in your web browser (e.g., Chrome, Firefox, Safari).

## How to Update Content

The website's data is stored in the `db.json` file. You can edit this file to add more albums, songs, or update lyrics.

### Data Structure

The `db.json` file has the following structure:

```json
{
  "albums": [
    {
      "id": "album-unique-id", // Lowercase, hyphenated version of the title
      "title": "Album Title",
      "year": YYYY, // Optional: release year
      "songs": [
        {
          "title": "Song Title",
          "lyrics": "Full song lyrics here..."
        }
        // ... more songs
      ]
    }
    // ... more albums
  ]
}
```

### Adding a New Album

1.  Copy an existing album object in the `albums` array.
2.  Update the `id` (make it unique, lowercase, and hyphenated), `title`, and `year` (optional).
3.  Add song objects to its `songs` array.

### Adding a New Song to an Album

1.  Find the album object in the `albums` array by its `id` or `title`.
2.  Add a new song object to its `songs` array. Each song needs a `title` and `lyrics`.

### Updating Lyrics

1.  Find the album and then the specific song within `db.json`.
2.  Replace the value of the `lyrics` property with the correct lyrics. Make sure to keep the lyrics as a JSON string (meaning special characters like newlines should be escaped as `\n` if you're editing it raw, or just paste as a multi-line string if your editor supports that for JSON).

**Note:** After editing `db.json`, simply refresh the website in your browser to see the changes.
