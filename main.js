// NavBar
function hideIconBar() {
    var iconBar = document.getElementById("iconBar");
    var navigation = document.getElementById("navigation");
    iconBar.setAttribute("style", "display:none;");
    navigation.classList.remove("hide");
}

function showIconBar() {
    var iconBar = document.getElementById("iconBar");
    var navigation = document.getElementById("navigation");
    iconBar.setAttribute("style", "display:block;");
    navigation.classList.add("hide");
}

// Comment
function showComment() {
    var commentArea = document.getElementById("comment-area");
    commentArea.classList.remove("hide");
}

// Reply
function showReply() {
    var replyArea = document.getElementById("reply-area");
    replyArea.classList.remove("hide");
}

// Function to show Login Popup
function showLogin() {
    document.getElementById("login-popup").classList.remove("hide");
}

// Function to switch from Login to Register Popup
function switchToRegister() {
    closePopup("login-popup");
    document.getElementById("register-popup").classList.remove("hide");
}

// Function to close popups
function closePopup(id) {
    document.getElementById(id).classList.add("hide");
}

// Function to toggle popups
function togglePopup(id) {
    const popup = document.getElementById(id);
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    document.body.style.overflow = popup.style.display === 'block' ? 'hidden' : 'auto';
}

// Login Function
async function login() {
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    if (email === "" || password === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter both email and password!',
        });
        return;
    }

    try {
        const response = await fetch('https://localhost:7125/api/RegisteredUser/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Login failed: Invalid credentials.',
            });
            return;
        }

        const data = await response.json();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Welcome, ${data.username}!`,
        });
        closePopup("login-popup");
    } catch (error) {
        console.error("Login error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'A network error occurred.',
        });
    }
}

// Register Function
async function register() {
    let username = document.getElementById("register-username").value;
    let email = document.getElementById("register-email").value;
    let password = document.getElementById("register-password").value;
    let password2 = document.getElementById("register-password2").value;

    if (username === "" || email === "" || password === "" || password2 === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all fields!',
        });
        return;
    }

    if (password !== password2) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Passwords do not match!',
        });
        return;
    }

    try {
        const response = await fetch('https://localhost:7125/api/RegisteredUser/Insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Error:", errorText);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Registration failed: ' + errorText,
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Registration successful! Please log in.',
        });
        closePopup("register-popup");
    } catch (error) {
        console.error("Registration error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'A network error occurred.',
        });
    }
}

// Update NavBar based on authentication status
function updateNavBar() {
    let isAuthenticated = sessionStorage.getItem('isAuthenticated');
    let username = sessionStorage.getItem('username');

    const loginLink = document.querySelector('.login-link');
    const logoutLink = document.querySelector('.logout-link');
    const usernameDisplay = document.querySelector('.username-display');

    if (isAuthenticated === 'true') {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        usernameDisplay.textContent = username;
        usernameDisplay.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        usernameDisplay.style.display = 'none';
    }
}

// Show content based on the selected page
function showContent(page) {
    const contentDivs = document.querySelectorAll('.content-section');
    contentDivs.forEach(div => div.style.display = 'none');

    const targetDivId = page.replace('.html', '-content');
    let targetDiv = document.getElementById(targetDivId);

    if (targetDiv) {
        targetDiv.style.display = 'block';
    } else {
        fetch(page)
            .then(response => response.text())
            .then(html => {
                const newDiv = document.createElement('div');
                newDiv.id = targetDivId;
                newDiv.classList.add('content-section');
                newDiv.innerHTML = html;
                document.getElementById('content').appendChild(newDiv);
                newDiv.style.display = 'block';
            })
            .catch(error => {
                Swal.fire({ title: 'Error', text: 'Failed to load content.', icon: 'error' });
            });
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    updateNavBar();
    showContent('home.html');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateNavBar();
    showContent('home.html');

    document.querySelectorAll('.nav-bar .nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showContent(this.getAttribute('href'));
        });
    });
});