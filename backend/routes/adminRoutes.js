const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(verifyToken, isAdmin);

// 1. Get Dashboard Statistics
router.get('/stats', async (req, res) => {
    try {
        const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
        const [[{ total_songs, total_plays }]] = await pool.query('SELECT COUNT(*) as total_songs, SUM(play_count) as total_plays FROM songs');
        
        res.json({
            total_users,
            total_songs,
            total_plays: total_plays || 0
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: "Error fetching statistics" });
    }
});

// 2. Get All Users
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Error fetching users" });
    }
});

// 3. Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Don't allow an admin to delete themselves directly or prevent deleting the main admin
        if(userId == req.userId) {
            return res.status(403).json({ message: "You cannot delete yourself." });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Error deleting user" });
    }
});

// 4. Update User Role
router.put('/users/:id/role', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }
        
        if(userId == req.userId) {
            return res.status(403).json({ message: "You cannot change your own role here." });
        }

        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        res.json({ message: `User role updated to ${role}` });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: "Error updating user role" });
    }
});

module.exports = router;
