const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ptit_music_db',
        });

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
        console.log('Admin password successfully reset to admin123');
        await connection.end();
    } catch (error) {
        console.error('Error fixing admin password:', error);
    }
}

fixAdmin();
