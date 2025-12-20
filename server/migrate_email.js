const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Modifying users table...');
        // Make email nullable
        await connection.query('ALTER TABLE users MODIFY email VARCHAR(100) NULL');
        // Drop unique constraint on email if it exists (it might be problematic if multiple nulls allowed? Standard SQL allows multiple NULLs in UNIQUE, but good to check. MySQL does allow multiple NULLs in UNIQUE index).
        // But if user wants NO email, we might just not insert it.
        // Let's keep it unique but nullable.

        console.log('Migration successful.');
        await connection.end();
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

main();
