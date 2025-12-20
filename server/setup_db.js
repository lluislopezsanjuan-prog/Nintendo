const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// --- ZONA DE CONFIGURACIÓN (Rellena esto con tus datos de Railway) ---
const dbConfig = {
    host: 'VIENE_DE_RAILWAY_MYSQLHOST',      // Ej: roundhouse.proxy.rlwy.net
    user: 'VIENE_DE_RAILWAY_MYSQLUSER',      // Ej: root
    password: 'VIENE_DE_RAILWAY_MYSQLPASSWORD', // Ej: XyZ123...
    database: 'VIENE_DE_RAILWAY_MYSQLDATABASE', // Ej: railway
    port: 3306, // VIENE_DE_RAILWAY_MYSQLPORT (Suele ser 5 dígitos, ej: 12345)
    multipleStatements: true
};
// ---------------------------------------------------------------------

async function initDB() {
    console.log('🔌 Conectando a la base de datos de Railway...');

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ ¡Conectado!');

        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Leyendo archivo SQL...');

        // Remove CREATE DATABASE and USE lines to avoid permissions errors on some managed DBs
        // or just run it. Usually Railway DB name is fixed. 
        // We will split queries or run as bulk.

        console.log('🚀 Ejecutando consultas...');
        await connection.query(sql);

        console.log('✨ Tablas creadas con éxito. ¡Ya puedes registrarte en tu app!');
        await connection.end();
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('Revisa que hayas puesto bien HOST, USER, PASSWORD y PORT.');
    }
}

initDB();
