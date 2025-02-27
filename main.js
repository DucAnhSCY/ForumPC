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
    console.log("Login function triggered"); 

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    if (email === "" || password === "") {
        alert("Please enter both email and password!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5195/api/RegisteredUser/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.status === 401) {
            alert("Invalid email or password.");
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed:", errorText);
            alert("Login failed: " + errorText);
            return;
        }

        const data = await response.json();
        console.log("Login successful:", data);

        // Store session data
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('email', data.email); 
        sessionStorage.setItem('token', data.token); 

        // Check if username exists in response, otherwise extract from email
        let username = data.username || email.split('@')[0]; // Fallback if API does not return username
        sessionStorage.setItem('username', username);

        // Update NavBar
        updateNavBar();

        // Show welcome message and close popup
        alert(`Welcome, ${username}!`);
        closePopup("login-popup");

    } catch (error) {
        console.error("Login error:", error);
        alert("A network error occurred. Please try again.");
    }
}




// Register Function
async function register() {
    let username = document.getElementById("register-username").value;
    let email = document.getElementById("register-email").value;
    let password = document.getElementById("register-password").value;
    let password2 = document.getElementById("register-password2").value;

    if (username === "" || email === "" || password === "" || password2 === "") {
        showErrorPopup('Please fill out all fields!');
        return;
    }

    if (password !== password2) {
        showErrorPopup('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:5195/api/RegisteredUser/Insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            showErrorPopup('Registration failed: ' + errorText);
            return;
        }

        showSuccessPopup('Registration successful! Please log in.');
        closePopup("register-popup");
    } catch (error) {
        showErrorPopup('A network error occurred.');
    }
}

// Update NavBar based on authentication status
function updateNavBar() {
    let isAuthenticated = sessionStorage.getItem('isAuthenticated');
    let username = sessionStorage.getItem('username');
    let email = sessionStorage.getItem('email');

    console.log("isAuthenticated:", isAuthenticated);
    console.log("username:", username);

    const loginLink = document.querySelector('.login-link');
    const logoutLink = document.querySelector('.logout-link');
    const userDisplay = document.querySelector('.username-display');
    const topRightUser = document.getElementById('top-right-username'); 

    if (isAuthenticated === 'true') {
        // Hide Login Button & Show Logout Button
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';

        // Hide username in navbar and show in top-right corner
        if (userDisplay) userDisplay.style.display = 'none';
        if (topRightUser) {
            topRightUser.textContent = username || email;
            topRightUser.classList.remove('hide');
        }
    } else {
        // Show Login Button & Hide Logout Button
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';

        // Hide top-right username
        if (topRightUser) topRightUser.classList.add('hide');
    }
}


// Logout function
function logout() {
    sessionStorage.clear();
    updateNavBar();
    showContent('home.html');
    alert("You have logged out.");
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

function showSuccessPopup(message) {
    let popup = document.createElement("div");
    popup.className = "popup success-popup";
    popup.innerHTML = `<div class="popup-content">
        <span class="close-icon" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <p>${message}</p>
    </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function showErrorPopup(message) {
    let popup = document.createElement("div");
    popup.className = "popup error-popup";
    popup.innerHTML = `<div class="popup-content">
        <span class="close-icon" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <p>${message}</p>
    </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}