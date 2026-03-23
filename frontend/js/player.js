const player = {
    audio: document.getElementById('audio-element'),
    currentSong: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const btn = document.getElementById('player-shuffle-btn');
        if (btn) {
            if (this.isShuffle) btn.classList.add('text-primary');
            else btn.classList.remove('text-primary');
        }
    },

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const btn = document.getElementById('player-repeat-btn');
        if (btn) {
            if (this.isRepeat) btn.classList.add('text-primary');
            else btn.classList.remove('text-primary');
        }
    },

    playSong(id, title, artist, coverUrl, mp3Url, indexInQueue = 0, queueContext = []) {
        if (!app.currentUser) {
            app.showToast('Vui lòng đăng nhập để nghe nhạc!', true);
            const modalEl = document.getElementById('loginModal');
            let instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            instance.show();
            return;
        }

        this.currentSong = { id, title, artist, coverUrl, mp3Url };
        this.queue = queueContext;
        this.currentIndex = indexInQueue;
        
        // Update UI
        document.getElementById('player-cover').src = coverUrl;
        document.getElementById('player-cover').classList.remove('d-none');
        document.getElementById('player-title').textContent = title;
        document.getElementById('player-artist').textContent = artist;
        
        // Play
        this.audio.src = mp3Url;
        this.audio.play();
        api.recordPlay(id).catch(err => console.error('Failed to record play', err));
        this.isPlaying = true;
        this.updatePlayBtnUI();
        
        // Check like status
        if (app.currentUser) {
            document.getElementById('player-like-btn').classList.remove('d-none');
            document.getElementById('player-like-btn').innerHTML = '<i class="fa-regular fa-heart"></i>'; // Default
        }
    },

    togglePlay() {
        if (!this.currentSong) return;
        
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayBtnUI();
    },

    updatePlayBtnUI() {
        const btn = document.getElementById('player-play-btn');
        if (this.isPlaying) {
            btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        }
    },

    next() {
        if (this.queue.length > 0) {
            let nextIdx;
            if (this.isShuffle && this.queue.length > 1) {
                do {
                    nextIdx = Math.floor(Math.random() * this.queue.length);
                } while (nextIdx === this.currentIndex);
            } else {
                nextIdx = this.currentIndex + 1;
                if (nextIdx >= this.queue.length) {
                    if (this.isRepeat) {
                        nextIdx = 0;
                    } else {
                        this.audio.pause();
                        this.isPlaying = false;
                        this.updatePlayBtnUI();
                        return;
                    }
                }
            }
            
            const song = this.queue[nextIdx];
            
            const coverUrl = song.cover_url ? `http://localhost:3000${song.cover_url}` : 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            const fullSongUrl = `http://localhost:3000${song.mp3_url}`;
            
            this.playSong(song.id, song.title, song.artist_name || 'Various Artists', coverUrl, fullSongUrl, nextIdx, this.queue);
        }
    },

    prev() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        if (this.queue.length > 0) {
            let prevIdx;
            if (this.isShuffle && this.queue.length > 1) {
                do {
                    prevIdx = Math.floor(Math.random() * this.queue.length);
                } while (prevIdx === this.currentIndex);
            } else {
                prevIdx = this.currentIndex - 1;
                if (prevIdx < 0) {
                    if (this.isRepeat) {
                        prevIdx = this.queue.length - 1;
                    } else {
                        this.audio.currentTime = 0;
                        return;
                    }
                }
            }
            const song = this.queue[prevIdx];
            
            const coverUrl = song.cover_url ? `http://localhost:3000${song.cover_url}` : 'https://images.unsplash.com/photo-1621360811013-c76831f1f3b0?q=80&w=400&auto=format&fit=crop';
            const fullSongUrl = `http://localhost:3000${song.mp3_url}`;
            
            this.playSong(song.id, song.title, song.artist_name || 'Various Artists', coverUrl, fullSongUrl, prevIdx, this.queue);
        }
    },

    seek(e) {
        if (!this.currentSong) return;
        const bg = document.getElementById('player-progress-bg');
        const rect = bg.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    },
    
    async toggleLike() {
        if (!this.currentSong || !app.currentUser) return;
        try {
            const res = await api.toggleLike(this.currentSong.id);
            const btn = document.getElementById('player-like-btn');
            if (res.liked) {
                btn.innerHTML = '<i class="fa-solid fa-heart align-middle text-primary"></i>';
                app.showToast('Đã lưu bài hát');
            } else {
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
                app.showToast('Đã bỏ lưu bài hát');
            }
        } catch(e) { app.showToast('Lỗi !', true); }
    }
};

// Listeners
player.audio.addEventListener('timeupdate', () => {
    const current = player.audio.currentTime;
    const duration = player.audio.duration;
    
    if (isNaN(duration)) return;
    
    document.getElementById('player-time-current').textContent = formatTime(current);
    document.getElementById('player-time-total').textContent = formatTime(duration);
    
    const percent = (current / duration) * 100;
    document.getElementById('player-progress-fill').style.width = `${percent}%`;
});

document.getElementById('player-volume').addEventListener('input', (e) => {
    player.audio.volume = e.target.value;
});

player.audio.addEventListener('ended', () => {
    if (player.isRepeat) {
        player.audio.currentTime = 0;
        player.audio.play();
    } else {
        player.next();
    }
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
