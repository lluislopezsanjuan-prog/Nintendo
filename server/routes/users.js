const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all users (except self)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username FROM users WHERE id != ?', [req.user.id]);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
