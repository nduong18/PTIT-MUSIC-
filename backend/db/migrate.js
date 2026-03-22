const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ptit_music_db'
        });

        console.log('Running database migration for play_count...');
        
        try {
            await connection.query('ALTER TABLE songs ADD COLUMN play_count INT DEFAULT 0');
            console.log('Successfully added play_count column to songs table.');
        } catch (err) {
            // Error code ER_DUP_FIELDNAME (1060) means column already exists
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('play_count column already exists in songs table.');
            } else {
                console.error('Migration failed:', err.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

migrate();
