const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware to verify JWT (simplified for now, ideally strictly typed)
const authenticateToken = require('../middleware/auth');

// Get all games (optional filter by status)
router.get('/', async (req, res) => {
    try {
        const [games] = await pool.query('SELECT games.id, games.title, games.platform, games.status, games.image_url, games.owner_id, users.username as owner_name FROM games JOIN users ON games.owner_id = users.id');
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a game
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, platform, image_url } = req.body;
        const [result] = await pool.query(
            'INSERT INTO games (title, platform, owner_id, image_url) VALUES (?, ?, ?, ?)',
            [title, platform || 'Nintendo Switch', req.user.id, image_url || null]
        );
        res.status(201).json({ message: 'Game added', gameId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a game
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [game] = await pool.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
        if (game.length === 0) return res.status(404).json({ message: 'Game not found' });

        if (game[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM games WHERE id = ?', [req.params.id]);
        res.json({ message: 'Game deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
