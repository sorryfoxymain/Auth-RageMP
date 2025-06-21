const mysql = require('mysql2/promise');

// Конфигурация подключения к базе данных
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'asdHJbghu2i3123kaBhASDIU12', // Пароль MySQL
    database: 'ragemp_server',
    charset: 'utf8mb4',
    // Pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Connection settings
    ssl: false,
    multipleStatements: false
};

// Создание пула соединений
const pool = mysql.createPool(dbConfig);

// Функция для выполнения SQL-запросов
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('[Database] Query execution error:', error);
        throw error;
    }
}

// Функция для проверки подключения к базе данных
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

// Функция для закрытия пула соединений
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