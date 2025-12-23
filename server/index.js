const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const pool = require('./db');

// DB Init Check
(async () => {
    try {
        await pool.query("ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url VARCHAR(2048)");
        console.log("DB: ensure image_url column exists");
    } catch (e) {
        console.log("DB Init Skipped/Error:", e.message);
    }
})();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/users', require('./routes/users'));


app.get('/', (req, res) => {
    res.send('Nintendo Loan Manager API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
