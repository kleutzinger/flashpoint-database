// FlashShelf Playlist Manager
let flashShelf = {
    playlists: JSON.parse(localStorage.getItem('flashShelfPlaylists') || '[]'),
    currentPlaylist: null,
    api: 'https://db-api.unstable.life',
    images: 'https://infinity.unstable.life/images'
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('id');
    
    // Check if this is a shared playlist URL (multiple id parameters or name parameter with multiple games)
    const gameIds = urlParams.getAll('id');
    const hasName = urlParams.has('name');
    
    if (gameIds.length > 1 || (hasName && gameIds.length > 1)) {
        // This is a shared playlist with multiple games
        loadSharedPlaylist(gameIds);
    } else if (playlistId) {
        // This is a single playlist ID for editing (even if it has a name parameter)
        loadPlaylist(playlistId);
    } else {
        showPlaylistList();
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('playlistCreateNew')?.addEventListener('click', createNewPlaylist);
    document.getElementById('addGamesBtn')?.addEventListener('click', addGames);
    document.getElementById('sharePlaylistBtn')?.addEventListener('click', sharePlaylist);
    document.getElementById('savePlaylistBtn')?.addEventListener('click', savePlaylist);
    document.getElementById('deletePlaylistBtn')?.addEventListener('click', deletePlaylist);
    document.getElementById('backToPlaylistsBtn')?.addEventListener('click', showPlaylistList);
    document.getElementById('playlistName')?.addEventListener('input', updatePlaylistName);
}

function showPlaylistList() {
    document.getElementById('playlistList').style.display = 'block';
    document.getElementById('playlistEditor').style.display = 'none';
    
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = '';
    
    if (flashShelf.playlists.length === 0) {
        playlistList.innerHTML = '<div class="no-playlists">No playlists yet. Create your first one!</div>';
        return;
    }
    
    flashShelf.playlists.forEach(playlist => {
        const playlistCard = createPlaylistCard(playlist);
        playlistList.appendChild(playlistCard);
    });
}

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    
    card.innerHTML = `
        <div class="playlist-card-header">
            <h3 class="playlist-card-name">${playlist.name}</h3>
            <div class="playlist-card-actions">
                <button class="playlist-edit-btn" data-id="${playlist.id}">Edit</button>
                <button class="playlist-delete-btn" data-id="${playlist.id}">Delete</button>
            </div>
        </div>
        <div class="playlist-card-info">
            <span class="playlist-game-count">${playlist.games.length} games</span>
            <span class="playlist-created">Created: ${new Date(playlist.created).toLocaleDateString()}</span>
        </div>
    `;
    
    // Add event listeners
    card.addEventListener('click', (e) => {
        // Don't open edit if clicking on buttons
        if (e.target.classList.contains('playlist-edit-btn') || e.target.classList.contains('playlist-delete-btn')) {
            return;
        }
        loadPlaylist(playlist.id);
    });
    
    card.querySelector('.playlist-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        loadPlaylist(playlist.id);
    });
    
    card.querySelector('.playlist-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete playlist "${playlist.name}"?`)) {
            deletePlaylistById(playlist.id);
        }
    });
    
    return card;
}

function loadPlaylist(playlistId) {
    const playlist = flashShelf.playlists.find(p => p.id === playlistId);
    if (!playlist) {
        alert('Playlist not found');
        showPlaylistList();
        return;
    }
    
    flashShelf.currentPlaylist = playlist;
    
    document.getElementById('playlistList').style.display = 'none';
    document.getElementById('playlistEditor').style.display = 'block';
    
    document.getElementById('playlistName').value = playlist.name;
    loadPlaylistGames();
}

function loadPlaylistGames() {
    const gamesContainer = document.getElementById('playlistGames');
    gamesContainer.innerHTML = '';
    
    if (flashShelf.currentPlaylist.games.length === 0) {
        gamesContainer.innerHTML = '<div class="no-games">No games in this playlist. Click "Add Games" to get started!</div>';
        return;
    }
    
    // Load game details for each game in playlist
    Promise.all(flashShelf.currentPlaylist.games.map(gameId => 
        fetch(`${flashShelf.api}/search?id=${gameId}&limit=1`)
            .then(r => r.json())
            .then(json => json[0])
    )).then(games => {
        games.forEach((game, index) => {
            if (game) {
                const gameCard = createGameCard(game, index);
                gamesContainer.appendChild(gameCard);
            }
        });
    });
}

function createGameCard(game, index) {
    const card = document.createElement('div');
    card.className = 'playlist-game-card';
    
    const logoUrl = `${flashShelf.images}/Logos/${game.id.substring(0, 2)}/${game.id.substring(2, 4)}/${game.id}.png`;
    
    card.innerHTML = `
        <div class="playlist-game-logo" data-id="${game.id}">
            <img src="${logoUrl}?type=jpg" alt="${game.title}" onerror="this.style.display='none'">
        </div>
        <div class="playlist-game-info">
            <h4 class="playlist-game-title">${game.title}</h4>
            <p class="playlist-game-developer">${game.developer || game.publisher || 'Unknown'}</p>
            <p class="playlist-game-tags">${game.tags.slice(0, 3).join(', ')}</p>
        </div>
        <div class="playlist-game-actions">
            <button class="playlist-game-play" data-id="${game.id}">Play</button>
            <button class="playlist-game-remove" data-index="${index}">Remove</button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.playlist-game-play').addEventListener('click', (e) => {
        e.stopPropagation();
        playGame(game.id);
    });
    
    card.querySelector('.playlist-game-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        removeGameFromPlaylist(index);
    });
    
    card.querySelector('.playlist-game-logo').addEventListener('click', (e) => {
        e.stopPropagation();
        playGame(game.id);
    });
    
    return card;
}

function playGame(gameId) {
    // Open game in new tab using the same logic as the original search page
    window.open(`https://ooooooooo.ooo/static/?${gameId}`, '_blank');
}

function removeGameFromPlaylist(index) {
    flashShelf.currentPlaylist.games.splice(index, 1);
    loadPlaylistGames();
}

function loadSharedPlaylist(gameIds) {
    // Get playlist name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const playlistName = urlParams.get('name') ? decodeURIComponent(urlParams.get('name')) : 'Shared Playlist';
    
    // Check if a playlist with the same name already exists
    const existingPlaylist = flashShelf.playlists.find(p => p.name === playlistName);
    
    if (existingPlaylist) {
        // Check if it's an exact match (same games)
        const isExactMatch = existingPlaylist.games.length === gameIds.length && 
                            existingPlaylist.games.every(gameId => gameIds.includes(gameId));
        
        if (isExactMatch) {
            // Load the existing playlist instead of creating a duplicate
            loadPlaylist(existingPlaylist.id);
            return;
        }
        
        // Check if the shared playlist has fewer games than existing
        if (gameIds.length < existingPlaylist.games.length) {
            const confirmMessage = `A playlist named "${playlistName}" already exists with ${existingPlaylist.games.length} games.\n\n` +
                                 `The shared playlist only has ${gameIds.length} games.\n\n` +
                                 `Do you want to replace your existing playlist with the shared one?\n` +
                                 `(This will lose your additional ${existingPlaylist.games.length - gameIds.length} games)`;
            
            if (!confirm(confirmMessage)) {
                // User chose not to replace, load the existing playlist instead
                loadPlaylist(existingPlaylist.id);
                return;
            }
        }
        
        // User confirmed replacement or shared playlist has more games
        // Update the existing playlist with the shared games
        existingPlaylist.games = gameIds;
        existingPlaylist.created = new Date().toISOString();
        localStorage.setItem('flashShelfPlaylists', JSON.stringify(flashShelf.playlists));
        loadPlaylist(existingPlaylist.id);
        return;
    }
    
    // Create a new playlist from shared IDs
    const newPlaylist = {
        id: Date.now().toString(),
        name: playlistName,
        games: gameIds,
        created: new Date().toISOString()
    };
    
    // Save to local storage
    flashShelf.playlists.push(newPlaylist);
    localStorage.setItem('flashShelfPlaylists', JSON.stringify(flashShelf.playlists));
    
    // Load the new playlist
    loadPlaylist(newPlaylist.id);
}

function createNewPlaylist() {
    const name = prompt('Enter playlist name:', 'My Playlist');
    if (name) {
        const newPlaylist = {
            id: Date.now().toString(),
            name: name,
            games: [],
            created: new Date().toISOString()
        };
        
        flashShelf.playlists.push(newPlaylist);
        localStorage.setItem('flashShelfPlaylists', JSON.stringify(flashShelf.playlists));
        loadPlaylist(newPlaylist.id);
    }
}

function addGames() {
    // Redirect to search page with playlist context
    localStorage.setItem('currentPlaylistId', flashShelf.currentPlaylist.id);
    location.href = 'search';
}

function sharePlaylist() {
    if (flashShelf.currentPlaylist.games.length === 0) {
        alert('Cannot share empty playlist');
        return;
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    const gameIds = flashShelf.currentPlaylist.games.map(id => `id=${id}`).join('&');
    const playlistName = encodeURIComponent(flashShelf.currentPlaylist.name);
    const shareUrl = `${baseUrl}?name=${playlistName}&${gameIds}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share URL copied to clipboard!\n\n' + shareUrl);
    }).catch(() => {
        // Fallback for older browsers
        prompt('Copy this URL to share your playlist:', shareUrl);
    });
}

function savePlaylist() {
    const playlistIndex = flashShelf.playlists.findIndex(p => p.id === flashShelf.currentPlaylist.id);
    if (playlistIndex !== -1) {
        flashShelf.playlists[playlistIndex] = { ...flashShelf.currentPlaylist };
        localStorage.setItem('flashShelfPlaylists', JSON.stringify(flashShelf.playlists));
        alert('Playlist saved!');
    }
}

function deletePlaylist() {
    if (confirm(`Delete playlist "${flashShelf.currentPlaylist.name}"?`)) {
        deletePlaylistById(flashShelf.currentPlaylist.id);
        showPlaylistList();
    }
}

function deletePlaylistById(playlistId) {
    flashShelf.playlists = flashShelf.playlists.filter(p => p.id !== playlistId);
    localStorage.setItem('flashShelfPlaylists', JSON.stringify(flashShelf.playlists));
    showPlaylistList();
}

function updatePlaylistName() {
    if (flashShelf.currentPlaylist) {
        flashShelf.currentPlaylist.name = document.getElementById('playlistName').value;
    }
}

// Check if we're returning from search page
window.addEventListener('storage', function(e) {
    if (e.key === 'flashShelfPlaylists' && e.newValue) {
        // Reload playlists from storage in case they were modified in search page
        flashShelf.playlists = JSON.parse(e.newValue);
        if (flashShelf.currentPlaylist) {
            flashShelf.currentPlaylist = flashShelf.playlists.find(p => p.id === flashShelf.currentPlaylist.id);
            loadPlaylistGames();
        }
    }
});
