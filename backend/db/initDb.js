const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const schemaFile = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaFile, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(sql);
        console.log('Database initialized successfully!');
        
        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDb();
