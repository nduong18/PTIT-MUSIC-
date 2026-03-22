const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Multer storage setup for artist profiling images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'artist-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all artists (Admin primarily, but could be public)
router.get('/', async (req, res) => {
    try {
        const [artists] = await pool.query(`
            SELECT a.id, a.name, a.bio, a.profile_image_url, a.created_at,
                   COUNT(s.id) as total_songs
            FROM artists a
            LEFT JOIN songs s ON a.id = s.artist_id
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `);
        res.json(artists);
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ message: "Error fetching artists" });
    }
});

// Create a new artist (Admin only)
router.post('/', [verifyToken, isAdmin, upload.single('profile_image')], async (req, res) => {
    try {
        const { name, bio } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Artist name is required" });
        }
        
        let profile_image_url = null;
        if (req.file) {
            profile_image_url = '/uploads/' + req.file.filename;
        }
        
        const [result] = await pool.query(
            'INSERT INTO artists (name, bio, profile_image_url) VALUES (?, ?, ?)',
            [name.trim(), bio ? bio.trim() : null, profile_image_url]
        );
        res.status(201).json({ message: "Artist created successfully", id: result.insertId });
    } catch (error) {
        console.error('Error creating artist:', error);
        res.status(500).json({ message: "Error creating artist" });
    }
});

// Update an artist (Admin only)
router.put('/:id', [verifyToken, isAdmin, upload.single('profile_image')], async (req, res) => {
    try {
        const artistId = req.params.id;
        const { name, bio } = req.body;
        
        let updateQuery = 'UPDATE artists SET ';
        let updateParams = [];
        
        if (name !== undefined) {
            updateQuery += 'name = ?, ';
            updateParams.push(name.trim());
        }
        if (bio !== undefined) {
            updateQuery += 'bio = ?, ';
            updateParams.push(bio.trim());
        }
        
        if (req.file) {
            updateQuery += 'profile_image_url = ?, ';
            updateParams.push('/uploads/' + req.file.filename);
        }
        
        // Remove trailing comma and space
        if (updateParams.length > 0) {
            updateQuery = updateQuery.slice(0, -2);
            updateQuery += ' WHERE id = ?';
            updateParams.push(artistId);
            
            await pool.query(updateQuery, updateParams);
        }

        res.json({ message: "Artist updated successfully" });
    } catch (error) {
        console.error('Error updating artist:', error);
        res.status(500).json({ message: "Error updating artist" });
    }
});

// Delete an artist (Admin only)
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
    try {
        const artistId = req.params.id;
        // Due to ON DELETE SET NULL in songs table, songs will keep their records but artist_id will be NULL
        await pool.query('DELETE FROM artists WHERE id = ?', [artistId]);
        res.json({ message: "Artist deleted successfully" });
    } catch (error) {
        console.error('Error deleting artist:', error);
        res.status(500).json({ message: "Error deleting artist" });
    }
});

// Get songs by an artist
router.get('/:id/songs', async (req, res) => {
    try {
        const artistId = req.params.id;
        const [songs] = await pool.query(`
            SELECT s.id, s.title, s.mp3_url, s.cover_url, s.duration, s.play_count, s.created_at
            FROM songs s
            WHERE s.artist_id = ?
            ORDER BY s.created_at DESC
        `, [artistId]);
        
        res.json(songs);
    } catch (error) {
        console.error('Error fetching artist songs:', error);
        res.status(500).json({ message: "Error fetching artist songs" });
    }
});

module.exports = router;
