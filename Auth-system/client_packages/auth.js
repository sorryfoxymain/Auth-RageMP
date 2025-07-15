let browser = null;
let cursorVisible = false;


function toggleCursor() {
    cursorVisible = !cursorVisible;
    mp.gui.cursor.show(cursorVisible, cursorVisible);
    mp.console.logInfo(`Cursor visibility toggled: ${cursorVisible}`);
}

mp.events.add('playerReady', () => {
    mp.console.logInfo('Player ready event triggered');
    try {
        browser = mp.browsers.new('package://login-ui/index.html');
        cursorVisible = true;
        mp.gui.cursor.show(true, true);
        mp.console.logInfo('Browser created successfully');
    } catch (error) {
        mp.console.logError('Error creating browser:', error);
    }
});


mp.keys.bind(0x71, false, () => { 
    toggleCursor();
});


mp.events.add('auth:login', (login, password) => {
    mp.console.logInfo(`Login attempt: ${login}`);
    try {
        mp.events.callRemote('auth:login', login, password);
    } catch (error) {
        mp.console.logError('Error sending login event:', error);
    }
});

mp.events.add('auth:register', (username, email, phone, password) => {
    mp.console.logInfo(`Register attempt: ${username}, ${email}, ${phone}`);
    try {
        mp.events.callRemote('auth:register', username, email, phone, password);
    } catch (error) {
        mp.console.logError('Error sending register event:', error);
    }
});


mp.events.add('callToServer', (eventName, ...args) => {
    mp.console.logInfo(`Calling server event: ${eventName}, args count: ${args.length}`);
    
    if (eventName === 'auth:login') {
        mp.console.logInfo(`Auth login event details: login: ${args[0]}, password provided: ${args[1] ? 'yes' : 'no'}`);
    } else if (eventName === 'auth:register') {
        mp.console.logInfo(`Auth register event details: username: ${args[0]}, email: ${args[1]}, phone: ${args[2]}, password provided: ${args[3] ? 'yes' : 'no'}`);
    }
    
    try {
        mp.events.callRemote(eventName, ...args);
        mp.console.logInfo(`Successfully sent event: ${eventName}`);
    } catch (error) {
        mp.console.logError(`Error sending event ${eventName}:`, error);
    }
});

mp.events.add('auth:success', () => {
    try {
        
        if (browser && browser.url) {
            browser.destroy();
            browser = null;
        } else if (mp.browsers.exists('package://login-ui/index.html')) {
            mp.browsers.at('package://login-ui/index.html').destroy();
        }
        
        
        mp.gui.cursor.show(false, false);
        cursorVisible = false;
        
        
        mp.players.local.setVariable('loggedIn', true);
        
        mp.console.logInfo('Auth success, login UI closed');
        mp.game.ui.displayRadar(true);
        mp.game.ui.displayHud(true);
    } catch (error) {
        mp.console.logError('Error handling auth success:', error);
    }
});

mp.events.add('auth:error', (message) => {
    try {
        if (browser && browser.url) {
            
            const safeMessage = message.replace(/'/g, "\\'").replace(/"/g, '\\"');
            browser.execute(`showError('${safeMessage}')`);
        } else if (mp.browsers.exists('package://login-ui/index.html')) {
            const safeMessage = message.replace(/'/g, "\\'").replace(/"/g, '\\"');
            mp.browsers.at('package://login-ui/index.html').execute(`showError('${safeMessage}')`);
        }
        mp.console.logWarning('Auth error:', message);
    } catch (error) {
        mp.console.logError('Error handling auth error:', error);
    }
});


mp.events.add('playerSpawn', () => {
    mp.console.logInfo('Player spawn event triggered');
    
    
    const isLoggedIn = mp.players.local.getVariable('loggedIn');
    
    if (!isLoggedIn && !browser) {
        try {
            browser = mp.browsers.new('package://login-ui/index.html');
            cursorVisible = true;
            mp.gui.cursor.show(true, true);
            mp.game.ui.displayRadar(false);
            mp.game.ui.displayHud(false);
            mp.console.logInfo('Browser created on spawn');
        } catch (error) {
            mp.console.logError('Error creating browser on spawn:', error);
        }
    } else if (isLoggedIn) {
        mp.console.logInfo('Player already logged in, showing HUD');
        mp.game.ui.displayRadar(true);
        mp.game.ui.displayHud(true);
    }
});


mp.events.add('auth:showLogin', () => {
    mp.console.logInfo('Show login event triggered');
    if (browser) {
        browser.destroy();
    }
    try {
        browser = mp.browsers.new('package://login-ui/index.html');
        cursorVisible = true;
        mp.gui.cursor.show(true, true);
        mp.game.ui.displayRadar(false);
        mp.game.ui.displayHud(false);
        mp.console.logInfo('Browser recreated for login');
    } catch (error) {
        mp.console.logError('Error recreating browser:', error);
    }
});


mp.events.add('playerQuit', () => {
    
    mp.players.local.setVariable('loggedIn', false);
}); 
