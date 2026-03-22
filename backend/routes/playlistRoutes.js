const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const { verifyToken } = require('../middleware/auth');

// Get all playlists for current user
router.get('/', verifyToken, async (req, res) => {
    try {
        const [playlists] = await pool.query('SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
        res.json(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching playlists" });
    }
});

// Create a new playlist
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Playlist name required" });

        const [result] = await pool.query('INSERT INTO playlists (name, user_id) VALUES (?, ?)', [name, req.userId]);
        res.status(201).json({ message: "Playlist created", id: result.insertId, name: name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating playlist" });
    }
});

// Add a song to a playlist
router.post('/:id/songs', verifyToken, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const { song_id } = req.body;

        const [playlist] = await pool.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.userId]);
        if (playlist.length === 0) return res.status(403).json({ message: "Unauthorized or not found" });

        await pool.query('INSERT IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)', [playlistId, song_id]);
        res.json({ message: "Song added to playlist" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding song to playlist" });
    }
});

// Get songs in a playlist
router.get('/:id/songs', verifyToken, async (req, res) => {
    try {
        const playlistId = req.params.id;
        
        const [playlist] = await pool.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.userId]);
        if (playlist.length === 0) return res.status(403).json({ message: "Unauthorized or not found" });

        const [songs] = await pool.query(`
            SELECT s.*, a.name as artist_name 
            FROM songs s
            JOIN playlist_songs ps ON s.id = ps.song_id
            LEFT JOIN artists a ON s.artist_id = a.id
            WHERE ps.playlist_id = ?
            ORDER BY ps.added_at DESC
        `, [playlistId]);

        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching songs from playlist" });
    }
});

// Delete a playlist
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const playlistId = req.params.id;
        
        const [playlist] = await pool.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.userId]);
        if (playlist.length === 0) return res.status(403).json({ message: "Unauthorized or not found" });

        await pool.query('DELETE FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.userId]);
        res.json({ message: "Playlist deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting playlist" });
    }
});

// Rename a playlist
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const { name } = req.body;
        
        if (!name || !name.trim()) return res.status(400).json({ message: "Playlist name is required" });

        const [playlist] = await pool.query('SELECT id FROM playlists WHERE id = ? AND user_id = ?', [playlistId, req.userId]);
        if (playlist.length === 0) return res.status(403).json({ message: "Unauthorized or not found" });

        await pool.query('UPDATE playlists SET name = ? WHERE id = ? AND user_id = ?', [name.trim(), playlistId, req.userId]);
        res.json({ message: "Playlist renamed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error renaming playlist" });
    }
});

module.exports = router;
