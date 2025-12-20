const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Request a loan
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { gameId } = req.body;

        // Check availability
        const [game] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
        if (game.length === 0) return res.status(404).json({ message: 'Game not found' });
        if (game[0].status !== 'available') return res.status(400).json({ message: 'Game not available' });
        if (game[0].owner_id === req.user.id) return res.status(400).json({ message: 'Cannot borrow your own game' });

        // Create loan
        await pool.query('INSERT INTO loans (game_id, borrower_id) VALUES (?, ?)', [gameId, req.user.id]);

        // Update game status
        await pool.query('UPDATE games SET status = "loaned" WHERE id = ?', [gameId]);

        res.status(201).json({ message: 'Loan requested successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Return a game by gameId (convenience for owners)
router.put('/game/:gameId/return', authenticateToken, async (req, res) => {
    try {
        const gameId = req.params.gameId;

        // Find active loan for this game
        const [loan] = await pool.query(`
            SELECT loans.*, games.owner_id 
            FROM loans 
            JOIN games ON loans.game_id = games.id 
            WHERE loans.game_id = ? AND loans.status = 'active'
        `, [gameId]);

        if (loan.length === 0) return res.status(404).json({ message: 'Active loan not found for this game' });

        // Check permission (Only owner)
        if (loan[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Only the owner can mark as returned' });
        }

        // Update loan
        await pool.query('UPDATE loans SET status = "returned", return_date = CURRENT_TIMESTAMP WHERE id = ?', [loan[0].id]);

        // Update game status
        await pool.query('UPDATE games SET status = "available" WHERE id = ?', [gameId]);

        res.json({ message: 'Game returned' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Return a game by loanId
router.put('/:id/return', authenticateToken, async (req, res) => {
    try {
        const loanId = req.params.id;

        // Verify loan exists and user is involved (borrower or owner)
        // For simplicity, let's say only the owner can mark as returned for now, or borrower?
        // Let's allow the owner to mark as returned.

        const [loan] = await pool.query(`
            SELECT loans.*, games.owner_id 
            FROM loans 
            JOIN games ON loans.game_id = games.id 
            WHERE loans.id = ?
        `, [loanId]);

        if (loan.length === 0) return res.status(404).json({ message: 'Loan not found' });

        // Check permission (Owner or Borrower should be able to say "I returned it"? Ideally Owner confirms)
        // Access control: Only owner for now to keep it safe.
        if (loan[0].owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Only the owner can mark as returned' });
        }

        // Update loan
        await pool.query('UPDATE loans SET status = "returned", return_date = CURRENT_TIMESTAMP WHERE id = ?', [loanId]);

        // Update game status
        await pool.query('UPDATE games SET status = "available" WHERE id = ?', [loan[0].game_id]);

        res.json({ message: 'Game returned' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my loans (borrowed)
router.get('/borrowed', authenticateToken, async (req, res) => {
    try {
        const [loans] = await pool.query(`
            SELECT loans.*, games.title, users.username as owner_name 
            FROM loans 
            JOIN games ON loans.game_id = games.id 
            JOIN users ON games.owner_id = users.id 
            WHERE loans.borrower_id = ?
        `, [req.user.id]);
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get loans of my games (lent)
router.get('/lent', authenticateToken, async (req, res) => {
    try {
        const [loans] = await pool.query(`
            SELECT loans.*, games.title, users.username as borrower_name
            FROM loans 
            JOIN games ON loans.game_id = games.id 
            JOIN users ON loans.borrower_id = users.id
            WHERE games.owner_id = ?
        `, [req.user.id]);
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Owner lends a game directly
router.post('/lend', authenticateToken, async (req, res) => {
    try {
        const { gameId, borrowerId, days } = req.body;

        // Check ownership and availability
        const [game] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
        if (game.length === 0) return res.status(404).json({ message: 'Game not found' });
        if (game[0].owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        if (game[0].status !== 'available') return res.status(400).json({ message: 'Game is not available' });

        // Calculate return date
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + parseInt(days));

        // Create loan
        await pool.query(
            'INSERT INTO loans (game_id, borrower_id, return_date) VALUES (?, ?, ?)',
            [gameId, borrowerId, returnDate]
        );

        // Update game status
        await pool.query('UPDATE games SET status = "loaned" WHERE id = ?', [gameId]);

        res.status(201).json({ message: 'Game lent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
