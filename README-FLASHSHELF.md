# FlashShelf - Flash Game Playlist Maker

FlashShelf is a fork of the Flashpoint Database that transforms it into a flash game playlist maker and editor. Create, manage, and share collections of your favorite classic flash games!

## Features

### 🎮 Playlist Management
- **Create Playlists**: Build collections of your favorite flash games and animations
- **Edit Playlists**: Add, remove, and reorder games in your playlists
- **Local Storage**: All playlists are saved in your browser for easy access
- **Visual Interface**: Shelf-like UI for displaying your game collections

### 🔗 Sharing & Discovery
- **Share URLs**: Generate shareable links like `https://yoursite.com/?id=aaaa&id=bbbb`
- **Load Shared Playlists**: Import playlists from shared URLs
- **Screenshots**: View game logos and screenshots for better visual browsing

### 🎯 Game Browsing
- **Search Integration**: Browse the full Flashpoint database
- **Playlist Mode**: Select multiple games to add to playlists
- **Direct Play**: Launch games directly in new tabs via ooooooo.ooo

## How to Use

### Creating a Playlist
1. Click "Create New Playlist" on the homepage
2. Enter a name for your playlist
3. Click "Add Games" to browse and select games
4. Check the games you want to add
5. Click "Add Selected to Playlist"

### Sharing a Playlist
1. Open your playlist in the editor
2. Click "Share" to generate a shareable URL
3. The URL will be copied to your clipboard
4. Share the URL with friends!

### Loading a Shared Playlist
1. Click "Load Shared Playlist" on the homepage
2. Paste the shared playlist URL
3. Enter a name for the imported playlist
4. The playlist will be saved to your local storage

## URL Format

Shared playlists use a URL format that includes the playlist name:
```
https://yoursite.com/?name=My%20Awesome%20Playlist&id=game1&id=game2&id=game3
```

Where:
- `name` parameter contains the playlist name (URL encoded)
- Each `id` parameter contains a game ID from the Flashpoint database

The playlist name is automatically included when sharing, so recipients don't need to manually enter it.

## Technical Details

- **Static Site**: No server required, works entirely in the browser
- **Local Storage**: Playlists are saved using browser localStorage
- **Flashpoint API**: Uses the existing Flashpoint database API
- **Game Launching**: Integrates with ooooooo.ooo for game playback

## File Structure

- `index.html` - Homepage with playlist creation and sharing
- `playlist.html` - Playlist management interface
- `playlist.js` - Playlist functionality and local storage
- `search/` - Modified search page with playlist integration
- `statistics/` - Updated statistics page

## Browser Compatibility

FlashShelf works in all modern browsers that support:
- ES6 features (localStorage, fetch, etc.)
- CSS Grid and Flexbox
- HTML5 form elements

## Credits

Based on the [Flashpoint Database](https://github.com/FlashpointProject/flashpoint-database) by the Flashpoint Project team.
