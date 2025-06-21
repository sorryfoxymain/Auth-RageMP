console.log('Login UI script loaded');

// Регулярные выражения для валидации
const VALIDATION_PATTERNS = {
    username: /^[A-Za-z]+$/,
    password: /^(?=.*[A-Z]).{6,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+\d{10,15}$/
};

// Функция для переключения видимости пароля
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁';
    }
}

// Функция для показа ошибки в поле
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.className = 'error-field';
    }
    if (inputElement) {
        inputElement.classList.remove('valid');
        inputElement.classList.add('error');
    }
}

// Функция для показа успеха в поле
function showFieldSuccess(fieldId, message = '') {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.className = 'success-field';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
        inputElement.classList.add('valid');
    }
}

// Функция для очистки ошибок поля
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('error', 'valid');
    }
}

// Валидация имени пользователя
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

// Валидация пароля
function validatePassword(password) {
    if (!password) {
        return 'Пароль не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.password.test(password)) {
        return 'Пароль должен содержать минимум 6 символов и хотя бы одну заглавную букву';
    }
    return null;
}

// Валидация email
function validateEmail(email) {
    if (!email) {
        return 'Email не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.email.test(email)) {
        return 'Введите корректный email адрес';
    }
    return null;
}

// Валидация телефона
function validatePhone(phone) {
    if (!phone) {
        return 'Телефон не может быть пустым';
    }
    if (!VALIDATION_PATTERNS.phone.test(phone)) {
        return 'Телефон должен быть в формате +48123456789';
    }
    return null;
}

// Определение типа логина (username или email)
function getLoginType(login) {
    return login.includes('@') ? 'email' : 'username';
}

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (!loginForm || !registerForm) {
        return;
    }
    
    const loginVisible = loginForm.style.display !== 'none';
    
    if (loginVisible) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    } else {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    }
    
    // Очищаем все ошибки при переключении форм
    clearAllErrors();
    showError('');
}

function clearAllErrors() {
    const errorFields = ['login-user', 'login-pass', 'reg-user', 'reg-email', 'reg-phone', 'reg-pass', 'reg-pass-confirm'];
    errorFields.forEach(fieldId => clearFieldError(fieldId));
}

function handleLogin() {
    clearAllErrors();
    
    const login = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    
    let hasErrors = false;
    
    // Валидация логина
    if (!login) {
        showFieldError('login-user', 'Введите логин или email');
        hasErrors = true;
    } else {
        const loginType = getLoginType(login);
        if (loginType === 'email') {
            const emailError = validateEmail(login);
            if (emailError) {
                showFieldError('login-user', emailError);
                hasErrors = true;
            } else {
                showFieldSuccess('login-user');
            }
        } else {
            const usernameError = validateUsername(login);
            if (usernameError) {
                showFieldError('login-user', usernameError);
                hasErrors = true;
            } else {
                showFieldSuccess('login-user');
            }
        }
    }
    
    // Валидация пароля
    if (!password) {
        showFieldError('login-pass', 'Введите пароль');
        hasErrors = true;
    } else {
        showFieldSuccess('login-pass');
    }
    
    if (hasErrors) {
        return;
    }
    
    if (typeof mp !== 'undefined') {
        mp.trigger('auth:login', login, password);
    } else {
        showError('Ошибка связи с сервером');
    }
}

function handleRegister() {
    clearAllErrors();
    
    const username = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-pass').value;
    const confirmPassword = document.getElementById('reg-pass-confirm').value;
    
    let hasErrors = false;
    
    // Валидация имени пользователя
    const usernameError = validateUsername(username);
    if (usernameError) {
        showFieldError('reg-user', usernameError);
        hasErrors = true;
    } else {
        showFieldSuccess('reg-user');
    }
    
    // Валидация email
    const emailError = validateEmail(email);
    if (emailError) {
        showFieldError('reg-email', emailError);
        hasErrors = true;
    } else {
        showFieldSuccess('reg-email');
    }
    
    // Валидация телефона
    const phoneError = validatePhone(phone);
    if (phoneError) {
        showFieldError('reg-phone', phoneError);
        hasErrors = true;
    } else {
        showFieldSuccess('reg-phone');
    }
    
    // Валидация пароля
    const passwordError = validatePassword(password);
    if (passwordError) {
        showFieldError('reg-pass', passwordError);
        hasErrors = true;
    } else {
        showFieldSuccess('reg-pass');
    }
    
    // Валидация подтверждения пароля
    if (!confirmPassword) {
        showFieldError('reg-pass-confirm', 'Подтвердите пароль');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showFieldError('reg-pass-confirm', 'Пароли не совпадают');
        hasErrors = true;
    } else {
        showFieldSuccess('reg-pass-confirm');
    }
    
    if (hasErrors) {
        return;
    }
    
    if (typeof mp !== 'undefined') {
        mp.trigger('auth:register', username, email, phone, password);
    } else {
        showError('Ошибка связи с сервером');
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Экспорт функций в глобальную область
window.togglePassword = togglePassword;
window.toggleForms = toggleForms;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showError = showError;

// Добавляем валидацию в реальном времени
function addRealTimeValidation() {
    // Валидация для логина
    const loginUser = document.getElementById('login-user');
    if (loginUser) {
        loginUser.addEventListener('blur', function() {
            const login = this.value.trim();
            if (login) {
                const loginType = getLoginType(login);
                const error = loginType === 'email' ? validateEmail(login) : validateUsername(login);
                if (error) {
                    showFieldError('login-user', error);
                } else {
                    showFieldSuccess('login-user');
                }
            } else {
                clearFieldError('login-user');
            }
        });
    }
    
    // Валидация для полей регистрации
    const regUser = document.getElementById('reg-user');
    if (regUser) {
        regUser.addEventListener('blur', function() {
            const error = validateUsername(this.value.trim());
            if (error && this.value.trim()) {
                showFieldError('reg-user', error);
            } else if (this.value.trim()) {
                showFieldSuccess('reg-user');
            } else {
                clearFieldError('reg-user');
            }
        });
    }
    
    const regEmail = document.getElementById('reg-email');
    if (regEmail) {
        regEmail.addEventListener('blur', function() {
            const error = validateEmail(this.value.trim());
            if (error && this.value.trim()) {
                showFieldError('reg-email', error);
            } else if (this.value.trim()) {
                showFieldSuccess('reg-email');
            } else {
                clearFieldError('reg-email');
            }
        });
    }
    
    const regPhone = document.getElementById('reg-phone');
    if (regPhone) {
        regPhone.addEventListener('blur', function() {
            const error = validatePhone(this.value.trim());
            if (error && this.value.trim()) {
                showFieldError('reg-phone', error);
            } else if (this.value.trim()) {
                showFieldSuccess('reg-phone');
            } else {
                clearFieldError('reg-phone');
            }
        });
    }
    
    const regPass = document.getElementById('reg-pass');
    if (regPass) {
        regPass.addEventListener('blur', function() {
            const error = validatePassword(this.value);
            if (error && this.value) {
                showFieldError('reg-pass', error);
            } else if (this.value) {
                showFieldSuccess('reg-pass');
            } else {
                clearFieldError('reg-pass');
            }
        });
    }
    
    const regPassConfirm = document.getElementById('reg-pass-confirm');
    if (regPassConfirm) {
        regPassConfirm.addEventListener('blur', function() {
            const password = document.getElementById('reg-pass').value;
            if (this.value && password && this.value !== password) {
                showFieldError('reg-pass-confirm', 'Пароли не совпадают');
            } else if (this.value && password) {
                showFieldSuccess('reg-pass-confirm');
            } else {
                clearFieldError('reg-pass-confirm');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm && registerForm) {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
    }
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
    
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleForms();
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleForms();
        });
    }
    
    // Добавляем валидацию в реальном времени
    addRealTimeValidation();
});

console.log('Login UI script fully loaded'); 