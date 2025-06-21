# RageMP Authentication System

Modern authentication system for RageMP server with beautiful UI and full functionality.

## 🚀 Features

### Client-side
- **Modern UI** - Beautiful and responsive login and registration interface
- **Form validation** - Real-time validation of entered data
- **Show/hide password** - Convenient function to check entered password
- **Responsive design** - Works on all devices

### Server-side
- **MySQL integration** - Reliable user storage in database
- **Password hashing** - Secure storage using bcrypt
- **Data validation** - Validation of all incoming data on server
- **Role system** - Support for administrators and regular users
- **Admin commands** - User management through console

## 📁 File Structure

```
├── client_packages/
│   ├── auth.js              # Client authentication logic
│   ├── index.js             # Main client file
│   └── login-ui/
│       ├── index.html       # HTML interface
│       ├── style.css        # UI styles
│       └── script.js        # JavaScript for UI
├── packages/
│   └── auth/
│       └── index.js         # Server authentication logic
├── database/
│   ├── config.js            # Database configuration
│   └── setup.sql            # SQL script for creating tables
├── server.cfg               # Server configuration
├── conf.json                # Main settings
└── package.json             # Node.js dependencies
```

## ⚙️ Installation

### 1. Database Setup
1. Create MySQL database
2. Execute SQL script `database/setup.sql`
3. Configure connection in `database/config.js`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configuration Setup
1. Edit `database/config.js` - specify database connection data
2. Configure `conf.json` - ports and main parameters
3. Check `server.cfg` - make sure all files are connected

### 4. Start Server
```bash
.\ragemp-server.exe
```

## 🎮 Usage

### For Players
- Login window opens automatically when connecting to server
- New players can register by providing:
  - Username (3-20 characters)
  - Email (correct format)
  - Phone (10 digits)
  - Password (minimum 6 characters)

### For Administrators
Available commands in server console:
- `/admin users` - list all users
- `/admin delete <username>` - delete user
- `/admin stats` - user statistics
- `/admin setadmin <username>` - assign administrator

## 🔧 Configuration

### Changing Ports
In `conf.json` file:
```json
{
  "port": 22005,
  "http_port": 22006
}
```

### Database Configuration
In `database/config.js` file:
```javascript
module.exports = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'ragemp_auth'
};
```

## 📦 Files for GitHub

For publishing on GitHub, upload the following files and folders:

**Required files:**
- `client_packages/` (entire folder)
- `packages/auth/index.js`
- `database/config.js`
- `database/setup.sql`
- `server.cfg`
- `conf.json`
- `package.json`
- `README.md`

**Do not upload:**
- `node_modules/`
- `ragemp-server.exe`
- `dotnet/`
- `bin/`
- `temp/`
- `maps/`
- `plugins/`
- `linux_x64.tar.gz`
- `BugTrap-x64.dll`

## 🛡️ Security

- All passwords are hashed using bcrypt
- Data validation on client and server
- Protection against SQL injection
- Secure configuration storage
