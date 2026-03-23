const app = {
    currentUser: null,
    playlists: [],
    allSongs: [],
    currentPlaylistId: null,
    currentSongToAdd: null,

    async init() {
        this.checkAuth();
        await this.loadHomeSongs();
        
        // ended listener is now handled exclusively in player.js
    },

    showToast(message, isError = false) {
        const toastEl = document.getElementById('liveToast');
        const toastBody = document.getElementById('toast-message');
        toastBody.textContent = message;
        
        if (isError) {
            toastEl.classList.remove('text-bg-success');
            toastEl.classList.add('text-bg-danger');
        } else {
            toastEl.classList.remove('text-bg-danger');
            toastEl.classList.add('text-bg-success');
        }
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    },

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                this.currentUser = await api.getProfile();
                this.updateUIForAuth();
                await this.loadPlaylists();
            } catch (e) {
                this.logout();
            }
        } else {
            this.updateUIForAuth();
        }
    },

    updateUIForAuth() {
        const guestEls = document.querySelectorAll('.guest-only');
        const authEls = document.querySelectorAll('.auth-only');
        const adminEls = document.querySelectorAll('.admin-only');

        if (this.currentUser) {
            guestEls.forEach(el => el.classList.add('d-none-important'));
            guestEls.forEach(el => el.classList.remove('d-block', 'd-flex'));
            authEls.forEach(el => el.classList.remove('d-none', 'd-none-important'));
            
            const nameEl = document.getElementById('user-display-name-top');
            if (nameEl) nameEl.textContent = this.currentUser.username;
            
            if (this.currentUser.role === 'admin') {
                adminEls.forEach(el => el.classList.remove('d-none', 'd-none-important'));
            } else {
                adminEls.forEach(el => el.classList.add('d-none-important'));
            }
        } else {
            guestEls.forEach(el => el.classList.remove('d-none', 'd-none-important'));
            authEls.forEach(el => el.classList.add('d-none-important'));
            adminEls.forEach(el => el.classList.add('d-none-important'));
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await api.login({ username, password });
            localStorage.setItem('token', res.token);
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            
            if (res.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }
            
            this.showToast('Đăng nhập thành công!');
            this.checkAuth();
            document.getElementById('loginForm').reset();
        } catch (error) {
            this.showToast(error.message, true);
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            await api.register({ email, username, password });
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            this.showToast('Đăng ký thành công! Hãy đăng nhập.');
            document.getElementById('registerForm').reset();
            new bootstrap.Modal(document.getElementById('loginModal')).show();
        } catch (error) {
            this.showToast(error.message, true);
        }
    },

    logout() {
        localStorage.removeItem('token');
        this.currentUser = null;
        this.playlists = [];
        this.updateUIForAuth();
        this.loadPlaylistsUI();
        this.loadView('home');
    },

    async loadPlaylists() {
        try {
            this.playlists = await api.getPlaylists();
            this.loadPlaylistsUI();
        } catch(e) { console.error(e); }
    },

    loadPlaylistsUI() {
        const container = document.getElementById('sidebar-playlists');
        container.innerHTML = '';
        this.playlists.forEach(pl => {
            const a = document.createElement('a');
            a.className = 'nav-link text-truncate';
            a.href = '#';
            a.innerHTML = `<i class="fa-solid fa-music text-secondary"></i> ${pl.name}`;
            a.onclick = () => this.loadPlaylistDetail(pl.id, pl.name);
            container.appendChild(a);
        });
    },

    async handleCreatePlaylist(event) {
        event.preventDefault();
        const nameInput = document.getElementById('playlist-name-input');
        const name = nameInput.value.trim();
        if (name) {
            try {
                await api.createPlaylist(name);
                this.showToast('Đã tạo playlist!');
                this.loadPlaylists();
                const modal = bootstrap.Modal.getInstance(document.getElementById('createPlaylistModal'));
                if (modal) modal.hide();
                nameInput.value = '';
                document.getElementById('createPlaylistForm').reset();
            } catch(e) { this.showToast('Lỗi tạo playlist: ' + e.message, true); }
        }
    },

    async handleRenamePlaylist(event) {
        event.preventDefault();
        if (!this.currentPlaylistId) return;
        const nameInput = document.getElementById('rename-playlist-name-input');
        const newName = nameInput.value.trim();
        if (newName) {
            try {
                await api.renamePlaylist(this.currentPlaylistId, newName);
                this.showToast('Đã đổi tên playlist!');
                this.loadPlaylists(); // update sidebar
                const modal = bootstrap.Modal.getInstance(document.getElementById('renamePlaylistModal'));
                if (modal) modal.hide();
                // Update UI title immediately
                document.getElementById('library-title').textContent = "Playlist: " + newName;
                
                // Update the onclick for renameBtn so next click has the new name
                const renameBtn = document.getElementById('btn-rename-playlist');
                if (renameBtn) {
                    renameBtn.onclick = () => {
                        document.getElementById('rename-playlist-name-input').value = newName;
                    };
                }
            } catch(e) { this.showToast('Lỗi đổi tên: ' + e.message, true); }
        }
    },

    loadView(viewId) {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        if(document.getElementById(`nav-${viewId}`)) {
            document.getElementById(`nav-${viewId}`).classList.add('active');
        }

        document.getElementById('view-home').classList.add('d-none');
        document.getElementById('view-search').classList.add('d-none');
        document.getElementById('view-library').classList.add('d-none');
        const viewLeaderboard = document.getElementById('view-leaderboard');
        if (viewLeaderboard) viewLeaderboard.classList.add('d-none');

        if(viewId === 'home') document.getElementById('view-home').classList.remove('d-none');
        if(viewId === 'search') document.getElementById('view-search').classList.remove('d-none');
        if(viewId === 'leaderboard') {
            if (viewLeaderboard) viewLeaderboard.classList.remove('d-none');
            this.renderLeaderboard();
        }
        if(viewId === 'library' || viewId === 'liked-songs' || viewId.startsWith('playlist-')) {
            document.getElementById('view-library').classList.remove('d-none');
            
            if (viewId === 'library') {
                this.renderLibrary();
            } else if (viewId === 'liked-songs') {
                this.renderLikedSongs();
            }
        }
    },

    async loadHomeSongs() {
        try {
            let songs = await api.getSongs();
            
            // Mock data if DB is empty to show Spotify UI
            if (songs.length === 0) {
                songs = [
                    { id: 901, title: 'Starboy', artist_name: 'The Weeknd', cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                    { id: 902, title: 'Blinding Lights', artist_name: 'The Weeknd', cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                    { id: 903, title: 'Shape of You', artist_name: 'Ed Sheeran', cover_url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5761a?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                    { id: 904, title: 'Levitating', artist_name: 'Dua Lipa', cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
                    { id: 905, title: 'Peaches', artist_name: 'Justin Bieber', cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
                    { id: 906, title: 'As It Was', artist_name: 'Harry Styles', cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
                    { id: 907, title: 'Stay', artist_name: 'The Kid LAROI', cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
                    { id: 908, title: 'Good 4 U', artist_name: 'Olivia Rodrigo', cover_url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5761a?q=80&w=400', mp3_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
                ];
            }
            this.allSongs = songs;

            this.updateGreeting();
            this.renderQuickPicks(songs.slice(0, 6));
            this.renderSongGrid(songs, 'home-songs-container');
            this.renderSongGrid([...songs].reverse(), 'home-charts-container');
        } catch(e) { console.error(e); }
    },

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Chào buổi sáng';
        if (hour >= 12 && hour < 18) greeting = 'Chào buổi chiều';
        else if (hour >= 18) greeting = 'Chào buổi tối';
        
        const el = document.getElementById('greeting-text');
        if (el) el.textContent = greeting;
    },

    renderQuickPicks(songs) {
        const container = document.getElementById('quick-picks-container');
        if(!container) return;
        container.innerHTML = '';
        songs.forEach((song, i) => {
            const defaultCover = 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            let coverUrl = song.cover_url ? song.cover_url : defaultCover;
            if(!coverUrl.startsWith('http')) coverUrl = `http://localhost:3000${coverUrl}`;
            let fullSongUrl = song.mp3_url;
            if(!fullSongUrl.startsWith('http') && fullSongUrl !== '#') fullSongUrl = `http://localhost:3000${fullSongUrl}`;
            
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="quick-pick-card" onclick="player.playSong(${song.id}, '${song.title.replace(/'/g,"\\'").replace(/"/g,"&quot;")}', '${(song.artist_name || 'Various Artists').replace(/'/g,"\\'")}', '${coverUrl}', '${fullSongUrl}', ${i}, ${JSON.stringify(songs).replace(/"/g, '&quot;').replace(/'/g, '&#39;')})">
                    <img src="${coverUrl}" alt="${song.title}">
                    <h6 class="text-truncate flex-grow-1">${song.title}</h6>
                    <div class="play-btn-overlay shadow-lg" onclick="event.stopPropagation(); player.playSong(${song.id}, '${song.title.replace(/'/g,"\\'").replace(/"/g,"&quot;")}', '${(song.artist_name || 'Various Artists').replace(/'/g,"\\'")}', '${coverUrl}', '${fullSongUrl}', ${i}, ${JSON.stringify(songs).replace(/"/g, '&quot;').replace(/'/g, '&#39;')})">
                        <i class="fa-solid fa-play" style="margin-left: 4px; color: black;"></i>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    },

    renderSongGrid(songs, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if(songs.length === 0){
            container.innerHTML = '<p class="text-secondary w-100">Không có bài hát nào.</p>';
            return;
        }

        songs.forEach((song, index) => {
            const defaultCover = 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            const coverUrl = song.cover_url ? `http://localhost:3000${song.cover_url}` : defaultCover;
            const fullSongUrl = `http://localhost:3000${song.mp3_url}`;
            
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="music-card">
                    <img src="${coverUrl}" alt="${song.title}" onclick="player.playSong(${song.id}, '${song.title.replace(/'/g,"\\'").replace(/"/g,"&quot;")}', '${(song.artist_name || 'Various Artists').replace(/'/g,"\\'")}', '${coverUrl}', '${fullSongUrl}', ${index}, ${JSON.stringify(songs).replace(/"/g, '&quot;').replace(/'/g, '&#39;')})">
                    <h5 class="mt-2">${song.title}</h5>
                    <p class="mb-2">${song.artist_name || 'Unknown Artist'}</p>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-danger auth-only d-none opacity-75" onclick="app.showAddToPlaylistModal(${song.id})" title="Thêm vào Playlist"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <div class="play-btn-overlay" onclick="player.playSong(${song.id}, '${song.title.replace(/'/g,"\\'").replace(/"/g,"&quot;")}', '${(song.artist_name || 'Various Artists').replace(/'/g,"\\'")}', '${coverUrl}', '${fullSongUrl}', ${index}, ${JSON.stringify(songs).replace(/"/g, '&quot;').replace(/'/g, '&#39;')})">
                        <i class="fa-solid fa-play" style="margin-left: 4px;"></i>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
        this.updateUIForAuth(); // Re-check auth for new dom elements
    },

    handleSearch() {
        const query = document.getElementById('search-input').value.toLowerCase();
        if(!query) {
            document.getElementById('search-results-container').innerHTML = '';
            return;
        }
        const filtered = this.allSongs.filter(s => 
            s.title.toLowerCase().includes(query) || 
            (s.artist_name && s.artist_name.toLowerCase().includes(query))
        );
        this.renderSongGrid(filtered, 'search-results-container');
    },

    renderLibrary() {
        this.currentPlaylistId = null;
        document.getElementById('library-title').textContent = "Thư viện của bạn";
        document.getElementById('btn-rename-playlist')?.classList.add('d-none');
        document.getElementById('btn-delete-playlist')?.classList.add('d-none');
        document.getElementById('playlist-add-songs-section')?.classList.add('d-none');
        document.getElementById('library-content-container').innerHTML = '';
    },

    async renderLikedSongs() {
        this.currentPlaylistId = null;
        document.getElementById('library-title').textContent = "Bài hát đã thích";
        document.getElementById('btn-rename-playlist')?.classList.add('d-none');
        document.getElementById('btn-delete-playlist')?.classList.add('d-none');
        document.getElementById('playlist-add-songs-section')?.classList.add('d-none');
        try {
            const songs = await api.getLikedSongs();
            this.renderSongGrid(songs, 'library-content-container');
        } catch(e) { this.showToast('Lỗi tải bài hát đã thích', true); }
    },

    async loadPlaylistDetail(id, name) {
        this.currentPlaylistId = id;
        document.getElementById('library-title').textContent = "Playlist: " + name;
        
        const renameBtn = document.getElementById('btn-rename-playlist');
        if (renameBtn) {
            renameBtn.classList.remove('d-none');
            renameBtn.onclick = () => {
                document.getElementById('rename-playlist-name-input').value = name;
            };
        }

        const deleteBtn = document.getElementById('btn-delete-playlist');
        if (deleteBtn) {
            deleteBtn.classList.remove('d-none');
            deleteBtn.onclick = () => this.deletePlaylist(id);
        }

        const addSection = document.getElementById('playlist-add-songs-section');
        if (addSection) addSection.classList.remove('d-none');
        
        const searchInput = document.getElementById('playlist-search-input');
        if (searchInput) searchInput.value = '';
        const searchResults = document.getElementById('playlist-search-results');
        if (searchResults) searchResults.innerHTML = '';

        this.loadView(`playlist-${id}`);
        try {
            const songs = await api.getPlaylistSongs(id);
            this.renderSongGrid(songs, 'library-content-container');
        } catch(e) { this.showToast('Lỗi tải playlist', true); }
    },

    async deletePlaylist(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa Playlist này? Số lượng bài hát trong Playlist không bị ảnh hưởng, chỉ có Playlist bị xóa.')) return;
        try {
            await api.deletePlaylist(id);
            this.showToast('Đã xóa Playlist!');
            this.loadPlaylists();
            this.loadView('home');
        } catch(e) {
            this.showToast('Lỗi xóa playlist: ' + e.message, true);
        }
    },

    searchAndAddToPlaylist() {
        if (!this.currentPlaylistId) return;
        const query = document.getElementById('playlist-search-input').value.toLowerCase();
        const resultsContainer = document.getElementById('playlist-search-results');
        resultsContainer.innerHTML = '';
        if(!query) return;

        const filtered = this.allSongs.filter(s => 
            s.title.toLowerCase().includes(query) || 
            (s.artist_name && s.artist_name.toLowerCase().includes(query))
        ).slice(0, 5);

        filtered.forEach(song => {
            const defaultCover = 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            let coverUrl = song.cover_url ? song.cover_url : defaultCover;
            if(!coverUrl.startsWith('http')) coverUrl = `http://localhost:3000${coverUrl}`;

            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action bg-dark text-white d-flex align-items-center justify-content-between border-secondary py-2 px-3 rounded-2';
            item.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <img src="${coverUrl}" alt="${song.title}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <h6 class="m-0 text-white">${song.title}</h6>
                        <small class="text-white-50">${song.artist_name || 'Unknown Artist'}</small>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-light rounded-pill px-3" onclick="app.addSongToCurrentPlaylist(${song.id})">Thêm</button>
            `;
            resultsContainer.appendChild(item);
        });
    },

    async addSongToCurrentPlaylist(songId) {
        if (!this.currentPlaylistId) return;
        try {
            await api.addSongToPlaylist(this.currentPlaylistId, songId);
            this.showToast('Đã thêm bài hát vào playlist');
            const searchInput = document.getElementById('playlist-search-input');
            if(searchInput) searchInput.value = '';
            const searchResults = document.getElementById('playlist-search-results');
            if(searchResults) searchResults.innerHTML = '';
            
            const currentPlaylistMatch = this.playlists.find(p => p.id === this.currentPlaylistId);
            if (currentPlaylistMatch) {
                this.loadPlaylistDetail(this.currentPlaylistId, currentPlaylistMatch.name);
            }
        } catch(e) {
            this.showToast('Lỗi thêm bài hát: ' + e.message, true);
        }
    },

    showAddToPlaylistModal(songId) {
        this.currentSongToAdd = songId;
        const listContainer = document.getElementById('addToPlaylist-list');
        listContainer.innerHTML = '';
        
        if (this.playlists.length === 0) {
            listContainer.innerHTML = '<p class="text-secondary small m-0">Bạn chưa có playlist nào.</p>';
        } else {
            this.playlists.forEach(pl => {
                const item = document.createElement('div');
                item.className = 'list-group-item list-group-item-action bg-dark text-white d-flex justify-content-between align-items-center border-secondary rounded-2 cursor-pointer py-2 px-3 mb-1';
                item.style.transition = "background-color 0.2s";
                item.onmouseover = () => item.style.backgroundColor = "rgba(255,255,255,0.1)";
                item.onmouseout = () => item.style.backgroundColor = "";
                item.innerHTML = `
                    <span class="text-truncate flex-grow-1"><i class="fa-solid fa-music text-secondary me-2"></i> ${pl.name}</span>
                    <button class="btn btn-sm btn-outline-light rounded-pill px-3 ms-2" onclick="event.stopPropagation(); app.addCurrentSongToPlaylist(${pl.id})">Thêm</button>
                `;
                item.onclick = () => app.addCurrentSongToPlaylist(pl.id);
                listContainer.appendChild(item);
            });
        }
        
        document.getElementById('new-playlist-name-input').value = '';
        new bootstrap.Modal(document.getElementById('addToPlaylistModal')).show();
    },

    async addCurrentSongToPlaylist(playlistId) {
        if (!this.currentSongToAdd) return;
        try {
            await api.addSongToPlaylist(playlistId, this.currentSongToAdd);
            this.showToast('Đã thêm bài hát vào playlist');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addToPlaylistModal'));
            if(modal) modal.hide();
        } catch(e) {
            this.showToast('Lỗi thêm bài hát: ' + e.message, true);
        }
    },

    async createPlaylistAndAddSong(event) {
        event.preventDefault();
        if (!this.currentSongToAdd) return;
        
        const nameInput = document.getElementById('new-playlist-name-input');
        const name = nameInput.value.trim();
        if (name) {
            try {
                const result = await api.createPlaylist(name);
                await api.addSongToPlaylist(result.id, this.currentSongToAdd);
                this.showToast('Đã tạo playlist và thêm bài hát!');
                this.loadPlaylists(); // Refresh playlist sidebar
                const modal = bootstrap.Modal.getInstance(document.getElementById('addToPlaylistModal'));
                if(modal) modal.hide();
                nameInput.value = '';
            } catch(e) {
                this.showToast('Lỗi: ' + e.message, true);
            }
        }
    },

    renderLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;
        container.innerHTML = '';

        const sortedSongs = [...this.allSongs].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 20);

        if (sortedSongs.length === 0) {
            container.innerHTML = '<p class="text-secondary">Chưa có dữ liệu bảng xếp hạng.</p>';
            return;
        }

        sortedSongs.forEach((song, index) => {
            const defaultCover = 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            let coverUrl = song.cover_url ? song.cover_url : defaultCover;
            if(!coverUrl.startsWith('http')) coverUrl = `http://localhost:3000${coverUrl}`;
            let fullSongUrl = song.mp3_url;
            if(!fullSongUrl.startsWith('http') && fullSongUrl !== '#') fullSongUrl = `http://localhost:3000${fullSongUrl}`;

            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action bg-dark text-white d-flex align-items-center gap-3 border-secondary py-2 px-3 rounded-2 cursor-pointer';
            item.style.transition = "background-color 0.2s";
            item.onmouseover = () => item.style.backgroundColor = "rgba(255,255,255,0.1)";
            item.onmouseout = () => item.style.backgroundColor = "";
            item.onclick = () => player.playSong(song.id, song.title.replace(/'/g,"\\'").replace(/"/g,"&quot;"), (song.artist_name || 'Various Artists').replace(/'/g,"\\'"), coverUrl, fullSongUrl, index, JSON.stringify(sortedSongs).replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
            
            let rankColor = 'text-secondary';
            if (index === 0) rankColor = 'text-warning'; 
            else if (index === 1) rankColor = 'text-info'; 
            else if (index === 2) rankColor = 'text-danger';

            item.innerHTML = `
                <div class="fw-bold fs-5 ${rankColor}" style="width: 30px; text-align: center;">${index + 1}</div>
                <img src="${coverUrl}" alt="${song.title}" class="rounded shadow-sm" style="width: 50px; height: 50px; object-fit: cover;">
                <div class="flex-grow-1 text-truncate pe-2">
                    <h6 class="m-0 text-white fw-bold text-truncate">${song.title}</h6>
                    <small class="text-white-50 text-truncate d-block">${song.artist_name || 'Unknown Artist'}</small>
                </div>
                <div class="text-secondary d-flex align-items-center gap-2 me-3">
                    <i class="fa-solid fa-headphones fa-sm"></i>
                    <small class="fw-medium">${song.play_count || 0}</small>
                </div>
                <button class="btn btn-sm btn-outline-light rounded-circle shadow-sm d-none d-md-block" style="width: 35px; height: 35px; min-width: 35px; border-color: rgba(255,255,255,0.2);">
                   <i class="fa-solid fa-play" style="margin-left: 2px;"></i>
                </button>
            `;
            container.appendChild(item);
        });
    }
};

window.onload = () => app.init();
