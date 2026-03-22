const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const { verifyToken } = require('../middleware/auth');

// Get all liked songs for current user
router.get('/', verifyToken, async (req, res) => {
    try {
        const [songs] = await pool.query(`
            SELECT s.*, a.name as artist_name 
            FROM songs s
            JOIN liked_songs ls ON s.id = ls.song_id
            LEFT JOIN artists a ON s.artist_id = a.id
            WHERE ls.user_id = ?
            ORDER BY ls.liked_at DESC
        `, [req.userId]);

        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching liked songs" });
    }
});

// Like/Unlike a song
router.post('/:id', verifyToken, async (req, res) => {
    try {
        const songId = req.params.id;
        const [existing] = await pool.query('SELECT * FROM liked_songs WHERE user_id = ? AND song_id = ?', [req.userId, songId]);
        
        if (existing.length > 0) {
            // Unlike
            await pool.query('DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?', [req.userId, songId]);
            res.json({ message: "Song unliked", liked: false });
        } else {
            // Like
            await pool.query('INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)', [req.userId, songId]);
            res.json({ message: "Song liked", liked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error toggling liked song" });
    }
});

module.exports = router;
