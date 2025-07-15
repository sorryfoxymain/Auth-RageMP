const bcrypt = require('bcrypt');
const path = require('path');


let executeQuery, testConnection;
try {
    const dbConfig = require('../../database/config');
    executeQuery = dbConfig.executeQuery;
    testConnection = dbConfig.testConnection;
    console.log('[Auth] Database module loaded successfully');
} catch (error) {
    console.log('[Auth] Warning: Database module not available, using fallback mode');
    console.log('[Auth] Error:', error.message);
}


const SALT_ROUNDS = 12;


const VALIDATION_PATTERNS = {
    username: /^[A-Za-z]+$/,
    password: /^(?=.*[A-Z]).{6,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+\d{10,15}$/
};


function validateUsername(username) {
    if (!username) {
        return 'Имя пользователя не может быть пустым';
    }
    if (username.length < 3 || username.length > 20) {
        return 'Имя пользователя должно быть от 3 до 20 символов';
    }
    if (!VALIDATION_PATTERNS.username.test(username)) {
        return 'Имя пользователя может содержать только английские буквы';
    }
    return null;
}

function validatePassword(password) {
    if (!password) {
        return 'Пароль не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.password.test(password)) {
        return 'Пароль должен содержать минимум 6 символов и хотя бы одну заглавную букву';
    }
    return null;
}

function validateEmail(email) {
    if (!email) {
        return 'Email не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.email.test(email)) {
        return 'Введите корректный email адрес';
    }
    return null;
}

function validatePhone(phone) {
    if (!phone) {
        return 'Телефон не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.phone.test(phone)) {
        return 'Телефон должен быть в формате +48123456789';
    }
    return null;
}



async function findUserByLogin(login) {
    try {
        const isEmail = login.includes('@');
        let query, params;
        
        if (isEmail) {
            query = 'SELECT * FROM accounts WHERE email = ? LIMIT 1';
            params = [login];
        } else {
            query = 'SELECT * FROM accounts WHERE username = ? LIMIT 1';
            params = [login];
        }
        
        const result = await executeQuery(query, params);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('[Auth] Error finding user by login:', error);
        throw error;
    }
}


async function isUsernameUnique(username) {
    try {
        const query = 'SELECT COUNT(*) as count FROM accounts WHERE username = ?';
        const result = await executeQuery(query, [username]);
        return result[0].count === 0;
    } catch (error) {
        console.error('[Auth] Error checking username uniqueness:', error);
        throw error;
    }
}


async function isEmailUnique(email) {
    try {
        const query = 'SELECT COUNT(*) as count FROM accounts WHERE email = ?';
        const result = await executeQuery(query, [email]);
        return result[0].count === 0;
    } catch (error) {
        console.error('[Auth] Error checking email uniqueness:', error);
        throw error;
    }
}


async function createUser(username, email, phone, password) {
    try {
        
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const query = `
            INSERT INTO accounts (username, email, phone, password_hash, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        const params = [username, email, phone, passwordHash];
        
        const result = await executeQuery(query, params);
        console.log(`[Auth] User ${username} created successfully with ID: ${result.insertId}`);
        
        return {
            id: result.insertId,
            username: username,
            email: email,
            phone: phone,
            created_at: new Date()
        };
    } catch (error) {
        console.error('[Auth] Error creating user:', error);
        throw error;
    }
}


async function verifyPassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('[Auth] Error verifying password:', error);
        throw error;
    }
}


async function getUserStats() {
    try {
        const query = 'SELECT COUNT(*) as total_users FROM accounts';
        const result = await executeQuery(query);
        return result[0].total_users;
    } catch (error) {
        console.error('[Auth] Error getting user stats:', error);
        throw error;
    }
}


async function initializeDatabase() {
    if (!testConnection) {
        console.log('[Auth] Database functions not available, running in fallback mode');
        return;
    }
    
    try {
        const isConnected = await testConnection();
        if (isConnected) {
            const totalUsers = await getUserStats();
            console.log(`[Auth] Database initialized successfully. Total users: ${totalUsers}`);
        } else {
            console.error('[Auth] Failed to initialize database connection');
        }
    } catch (error) {
        console.error('[Auth] Database initialization error:', error);
    }
}


initializeDatabase();


mp.events.add('auth:register', (player, username, email, phone, password) => {
    console.log(`[Auth] Registration attempt: ${username}, ${email} from player ${player.name}`);
    handleRegister(player, username, email, phone, password);
});

mp.events.add('auth:login', (player, login, password) => {
    console.log(`[Auth] Login attempt: ${login} from player ${player.name}`);
    handleLogin(player, login, password);
});

mp.events.add('charMenu:save', (player, characterData) => {
    console.log(`[Auth] CharMenu save request from player ${player.name}`);
    if (typeof global.handleSaveCharacter === 'function') {
        global.handleSaveCharacter(player, characterData);
    } else {
        console.error('[Auth] Character menu handler not loaded');
    }
});

mp.events.add('charMenu:changeGender', (player, gender) => {
    console.log(`[Auth] CharMenu gender change request from player ${player.name}`);
    if (typeof global.handleChangeGender === 'function') {
        global.handleChangeGender(player, gender);
    } else {
        console.error('[Auth] Character menu handler not loaded');
    }
});

async function handleRegister(player, username, email, phone, password) {
    try {
        console.log(`[Auth] Registration attempt: ${username}, ${email}, ${phone}`);
        
        
        const usernameError = validateUsername(username);
        if (usernameError) {
            player.call('auth:error', [usernameError]);
            return;
        }
        
        const emailError = validateEmail(email);
        if (emailError) {
            player.call('auth:error', [emailError]);
            return;
        }
        
        const phoneError = validatePhone(phone);
        if (phoneError) {
            player.call('auth:error', [phoneError]);
        return;
    }
    
        const passwordError = validatePassword(password);
        if (passwordError) {
            player.call('auth:error', [passwordError]);
        return;
    }
    
       
        const isUsernameUniqueResult = await isUsernameUnique(username);
        if (!isUsernameUniqueResult) {
            player.call('auth:error', ['Это имя пользователя уже занято']);
        return;
    }

        
        const isEmailUniqueResult = await isEmailUnique(email);
        if (!isEmailUniqueResult) {
            player.call('auth:error', ['Этот email уже зарегистрирован']);
            return;
        }

        
        const newUser = await createUser(username, email, phone, password);
        
        
    player.setVariable('loggedIn', true);
        player.setVariable('userId', newUser.id);
        player.setVariable('username', username);
        player.setVariable('email', email);
        
        console.log(`[Auth] Player ${player.name} registered and logged in as ${username} (ID: ${newUser.id})`);
    player.call('auth:success');
        
    } catch (error) {
        console.error('[Auth] Registration error:', error);
        player.call('auth:error', ['Ошибка сервера при регистрации. Попробуйте позже.']);
    }
}

async function handleLogin(player, login, password) {
    try {
        console.log(`[Auth] Login attempt: ${login}`);
        
        const user = await findUserByLogin(login);
    
    if (!user) {
            const loginType = login.includes('@') ? 'email' : 'username';
            const message = loginType === 'email' 
                ? 'Пользователь с таким email не найден' 
                : 'Пользователь с таким именем не найден';
            
            console.log(`[Auth] User ${login} not found in database`);
            player.call('auth:error', [message]);
        return;
    }
    
        console.log(`[Auth] Found user: ${user.username} (ID: ${user.id}), checking password...`);
        
        
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            console.log(`[Auth] Password mismatch for user ${login}`);
            player.call('auth:error', ['Неверный пароль']);
        return;
    }

        
    player.setVariable('loggedIn', true);
        player.setVariable('userId', user.id);
        player.setVariable('username', user.username);
        player.setVariable('email', user.email);
        
        console.log(`[Auth] Player ${player.name} logged in successfully as ${user.username} (ID: ${user.id})`);
    player.call('auth:success');
        
    } catch (error) {
        console.error('[Auth] Login error:', error);
        player.call('auth:error', ['Ошибка сервера при входе. Попробуйте позже.']);
    }
}


mp.events.add('playerSpawn', (player) => {
    if (!player.getVariable('loggedIn')) {
        console.log(`[Auth] Player ${player.name} spawned without authentication`);
        
        player.call('auth:showLogin');
    } else {
        const username = player.getVariable('username');
        const userId = player.getVariable('userId');
        console.log(`[Auth] Player ${player.name} spawned with authentication as ${username} (ID: ${userId})`);
    }
});




mp.events.addCommand('listusers', async (player, args) => {
    if (player.name === 'Admin') { 
        try {
            const query = 'SELECT id, username, email, phone, created_at FROM accounts ORDER BY created_at DESC LIMIT 10';
            const users = await executeQuery(query);
            
            console.log('[Auth] Recent registered users:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}, ${user.username} (${user.email}) - ${user.phone}, Registered: ${user.created_at}`);
            });
            
            const totalUsers = await getUserStats();
            player.outputChatBox(`Показано последних 10 из ${totalUsers} пользователей. Полный список в консоли.`);
        } catch (error) {
            console.error('[Auth] Error listing users:', error);
            player.outputChatBox('Ошибка при получении списка пользователей');
        }
    }
});


mp.events.addCommand('userinfo', async (player, fullText) => {
    if (player.name === 'Admin') { 
        const args = fullText.split(' ');
        if (args.length < 1) {
            player.outputChatBox('Использование: /userinfo <username или email>');
            return;
        }
        
        try {
            const searchTerm = args[0];
            const user = await findUserByLogin(searchTerm);
            
            if (user) {
                player.outputChatBox(`Пользователь найден:`);
                player.outputChatBox(`ID: ${user.id}`);
                player.outputChatBox(`Username: ${user.username}`);
                player.outputChatBox(`Email: ${user.email}`);
                player.outputChatBox(`Phone: ${user.phone}`);
                player.outputChatBox(`Registered: ${user.created_at}`);
            } else {
                player.outputChatBox('Пользователь не найден');
            }
        } catch (error) {
            console.error('[Auth] Error getting user info:', error);
            player.outputChatBox('Ошибка при получении информации о пользователе');
        }
    }
});


mp.events.addCommand('authstats', async (player) => {
    if (player.name === 'Admin') { 
        try {
            const totalUsers = await getUserStats();
            const query = 'SELECT DATE(created_at) as date, COUNT(*) as count FROM accounts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date DESC';
            const recentRegistrations = await executeQuery(query);
            
            player.outputChatBox(`=== Статистика авторизации ===`);
            player.outputChatBox(`Всего пользователей: ${totalUsers}`);
            player.outputChatBox(`Регистрации за последние 7 дней:`);
            
            recentRegistrations.forEach(stat => {
                player.outputChatBox(`${stat.date}: ${stat.count} регистраций`);
            });
        } catch (error) {
            console.error('[Auth] Error getting auth stats:', error);
            player.outputChatBox('Ошибка при получении статистики');
        }
    }
});

console.log('[Auth] Enhanced MySQL authentication system loaded successfully!'); 
