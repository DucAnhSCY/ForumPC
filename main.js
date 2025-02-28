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
        showSuccessPopup(`Welcome, ${username}!`);
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

    // Email validation using Regex
    let emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
        showErrorPopup('Invalid email format.');
        return;
    }

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

        const result = await response.json();

        if (!response.ok) {
            showErrorPopup(result.message);
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

    const loginLink = document.querySelector('.login-link');
    const logoutLink = document.querySelector('.logout-link');
    const topRightUser = document.getElementById('top-right-username');

    if (isAuthenticated === 'true') {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.classList.remove('hide');

        if (topRightUser) {
            topRightUser.textContent = `${username}`;
            topRightUser.classList.remove('hide');
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.classList.add('hide');

        if (topRightUser) topRightUser.classList.add('hide');
    }
}

// Logout function
function logout() {
    sessionStorage.clear();
    updateNavBar();
    alert("You have logged out.");
    // Redirect user to login popup
    showLogin();
}

// Ensure NavBar updates on page load
document.addEventListener('DOMContentLoaded', updateNavBar);

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

// Show Create Thread Section for Logged-In Users
function showThreadButton() {
    let isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
        document.getElementById("create-thread-section").classList.remove("hide");
    }
}
// Show Thread Creation Box
function showThreadBox() {
    document.getElementById("thread-box").classList.remove("hide");
}
// Close Thread Box
function closeThreadBox() {
    document.getElementById("thread-box").classList.add("hide");
}
// Submit Thread (Dummy Function for Now)
function submitThread() {
    let title = document.getElementById("thread-title").value;
    let content = document.getElementById("thread-content").value;

    if (!title || !content) {
        alert("Please enter both a title and content.");
        return;
    }

    alert(`Thread Created!\nTitle: ${title}\nContent: ${content}`);
    closeThreadBox();
}
// Ensure Create Thread Button Appears for Logged-In Users
document.addEventListener('DOMContentLoaded', showThreadButton);

const API_BASE_URL = "http://localhost:5195/api/Thread"; // Change if your backend is on a different port

// Load existing threads when the page loads
document.addEventListener("DOMContentLoaded", function () {
    updateNavBar();
    showThreadButton();
    loadThreads();
});

// Function to show the Create Thread section only if the user is logged in
function showThreadButton() {
    let isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
        document.getElementById("create-thread-section").classList.remove("hide");
    }
}

// Show the Thread Creation Box
function showThreadBox() {
    document.getElementById("thread-box").classList.remove("hide");
}

// Close Thread Box
function closeThreadBox() {
    document.getElementById("thread-box").classList.add("hide");
}

// Load existing threads from the API
async function loadThreads() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch threads");

        const threads = await response.json();
        displayThreads(threads);
    } catch (error) {
        console.error("Error loading threads:", error);
    }
}

// Display threads inside the posts section
function displayThreads(threads) {
    const postsContainer = document.querySelector(".posts-table");

    // Clear existing threads before adding new ones
    postsContainer.innerHTML = `
        <div class="table-head">
            <div class="status">Status</div>
            <div class="subjects">Subjects</div>
            <div class="replies">Replies/Views</div>
            <div class="last-reply">Last Reply</div>
        </div>
    `;

    threads.forEach(thread => {
        postsContainer.innerHTML += `
            <div class="table-row">
                <div class="status"><i class="fa fa-comment"></i></div>
                <div class="subjects">
                    <a href="detail.html?id=${thread.id}">${thread.title}</a>
                    <br>
                    <span>Started by <b>${thread.regUserId ? `User ${thread.regUserId}` : `Moderator ${thread.modId}`}</b></span>
                </div>
                <div class="replies">0 replies <br> 0 views</div>
                <div class="last-reply">Just now</div>
            </div>
        `;
    });
}

// Submit a new thread
async function submitThread() {
    let title = document.getElementById("thread-title").value;
    let content = document.getElementById("thread-content").value;
    let userId = sessionStorage.getItem("userId"); // Get logged-in user's ID
    let username = sessionStorage.getItem("username");
    let categoryId = 1; // Default category (Change as needed)

    if (!title || !content) {
        alert("Please enter both a title and content.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Insert?title=${title}&content=${content}&categoryId=${categoryId}&regUserId=${userId}`, {
            method: "POST"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const result = await response.json();
        alert("Thread created successfully!");

        // Add the new thread to the list dynamically
        const postsContainer = document.querySelector(".posts-table");
        postsContainer.innerHTML += `
            <div class="table-row">
                <div class="status"><i class="fa fa-comment"></i></div>
                <div class="subjects">
                    <a href="detail.html?id=${result.thread.id}">${result.thread.title}</a>
                    <br>
                    <span>Started by <b>${username}</b></span>
                </div>
                <div class="replies">0 replies <br> 0 views</div>
                <div class="last-reply">Just now</div>
            </div>
        `;

        closeThreadBox();
    } catch (error) {
        console.error("Error creating thread:", error);
        alert("Failed to create thread.");
    }
}


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
