// server/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'optiplus_customer_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Handle connection errors
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database');
});

// Handle errors after connection
db.on('error', (err) => {
    console.error('MySQL database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed. Attempting to reconnect...');
        db.connect();
    } else {
        throw err;
    }
});

module.exports = db;