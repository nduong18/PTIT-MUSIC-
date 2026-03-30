const API_URL = 'http://localhost:3000/api';

const api = {
    getToken: () => localStorage.getItem('token'),
    
    headers(auth = false) {
        const h = { 'Content-Type': 'application/json' };
        if (auth && this.getToken()) {
            h['Authorization'] = `Bearer ${this.getToken()}`;
        }
        return h;
    },

    async request(endpoint, method = 'GET', data = null, auth = false, isFormData = false) {
        const options = { method };
        options.headers = isFormData ? {} : this.headers(auth);
        
        if (auth && this.getToken() && isFormData) {
            options.headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        if (data) {
            options.body = isFormData ? data : JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Lỗi kết nối API');
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth
    login: (data) => api.request('/auth/login', 'POST', data),
    register: (data) => api.request('/auth/register', 'POST', data),
    getProfile: () => api.request('/auth/me', 'GET', null, true),

    // Songs
    getSongs: (page = null, limit = 10) => api.request('/songs' + (page ? `?page=${page}&limit=${limit}` : ''), 'GET'),
    searchSongs: (query, page = null, limit = 10) => api.request(`/songs/search?q=${encodeURIComponent(query)}` + (page ? `&page=${page}&limit=${limit}` : ''), 'GET'),
    uploadSong: (formData) => api.request('/songs', 'POST', formData, true, true),
    deleteSong: (id) => api.request(`/songs/${id}`, 'DELETE', null, true),

    // Playlists
    getPlaylists: () => api.request('/playlists', 'GET', null, true),
    createPlaylist: (name) => api.request('/playlists', 'POST', { name }, true),
    renamePlaylist: (id, name) => api.request(`/playlists/${id}`, 'PUT', { name }, true),
    deletePlaylist: (id) => api.request(`/playlists/${id}`, 'DELETE', null, true),
    addSongToPlaylist: (playlistId, songId) => api.request(`/playlists/${playlistId}/songs`, 'POST', { song_id: songId }, true),
    getPlaylistSongs: (playlistId, page = null, limit = 10) => api.request(`/playlists/${playlistId}/songs` + (page ? `?page=${page}&limit=${limit}` : ''), 'GET', null, true),

    // Artists
    getArtists: (page = null, limit = 10) => api.request('/artists' + (page ? `?page=${page}&limit=${limit}` : ''), 'GET', null, true),
    createArtist: (formData) => api.request('/artists', 'POST', formData, true, true),
    updateArtist: (id, formData) => api.request(`/artists/${id}`, 'PUT', formData, true, true),
    deleteArtist: (id) => api.request(`/artists/${id}`, 'DELETE', null, true),
    getArtistSongs: (id, page = null, limit = 10) => api.request(`/artists/${id}/songs` + (page ? `?page=${page}&limit=${limit}` : ''), 'GET', null, true),

    // Liked Songs
    getLikedSongs: (page = null, limit = 10) => api.request('/liked' + (page ? `?page=${page}&limit=${limit}` : ''), 'GET', null, true),
    toggleLike: (songId) => api.request(`/liked/${songId}`, 'POST', null, true),

    // Admin & Plays
    getAdminStats: () => api.request('/admin/stats', 'GET', null, true),
    getUsers: (page = null, limit = 10) => api.request('/admin/users' + (page ? `?page=${page}&limit=${limit}` : ''), 'GET', null, true),
    deleteUser: (id) => api.request(`/admin/users/${id}`, 'DELETE', null, true),
    updateUserRole: (id, role) => api.request(`/admin/users/${id}/role`, 'PUT', { role }, true),
    recordPlay: (id) => api.request(`/songs/${id}/play`, 'POST')
};
