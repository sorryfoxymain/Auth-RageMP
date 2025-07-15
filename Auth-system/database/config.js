const mysql = require('mysql2/promise');


const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123123123123', 
    database: 'ragemp_server',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: false,
    multipleStatements: false
};


const pool = mysql.createPool(dbConfig);


async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('[Database] Query execution error:', error);
        throw error;
    }
}


async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('[Database] Successfully connected to MySQL database');
        connection.release();
        return true;
    } catch (error) {
        console.error('[Database] Failed to connect to MySQL database:', error);
        return false;
    }
}


async function closePool() {
    try {
        await pool.end();
        console.log('[Database] Connection pool closed');
    } catch (error) {
        console.error('[Database] Error closing connection pool:', error);
    }
}

module.exports = {
    pool,
    executeQuery,
    testConnection,
    closePool
}; 
