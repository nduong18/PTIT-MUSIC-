const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all songs (Public)
router.get('/', async (req, res) => {
    try {
        const [songs] = await pool.query(`
            SELECT s.id, s.title, s.mp3_url, s.cover_url, s.duration, s.created_at, 
                   a.id as artist_id, a.name as artist_name 
            FROM songs s 
            LEFT JOIN artists a ON s.artist_id = a.id
            ORDER BY s.created_at DESC
        `);
        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching songs" });
    }
});

// Upload a new song (Admin only)
router.post('/', [verifyToken, isAdmin, upload.fields([{ name: 'mp3', maxCount: 1 }, { name: 'cover', maxCount: 1 }])], async (req, res) => {
    try {
        const { title, artist_id } = req.body;
        
        if (!title || !req.files['mp3']) {
            return res.status(400).json({ message: "Title and MP3 file are required" });
        }

        const mp3_url = '/uploads/' + req.files['mp3'][0].filename;
        let cover_url = null;
        
        if (req.files['cover']) {
            cover_url = '/uploads/' + req.files['cover'][0].filename;
        }

        const [result] = await pool.query(
            'INSERT INTO songs (title, mp3_url, cover_url, artist_id) VALUES (?, ?, ?, ?)',
            [title, mp3_url, cover_url, artist_id || null]
        );

        res.status(201).json({ message: "Song uploaded successfully", id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading song" });
    }
});

// Delete a song (Admin only)
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        await pool.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
        res.json({ message: "Song deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting song" });
    }
});

module.exports = router;
