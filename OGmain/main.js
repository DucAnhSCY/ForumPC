document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

function initializePage() {
    updateNavBar();
    showCategoryButton();
    loadCategories();
    loadCategoryDropdown();
    showThreadButton();
    loadThreads();
    fetchThreads();
    showContent('home.html');

    document.querySelectorAll('.nav-bar .nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showContent(this.getAttribute('href'));
        });
    });
}

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
            showErrorPopup("Invalid email or password.");
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed:", errorText);
            showErrorPopup("Login failed: " + errorText);
            return;
        }

        const data = await response.json();
        console.log("Login successful:", data);

        if (!data.userId) {
            console.error("Error: API response does not contain userId!");
            return;
        }

        // Store session data
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('email', data.email); 
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userId', data.userId); // Ensure userId is stored

        let username = data.username || email.split('@')[0]; 
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
    showSuccessPopup("You have logged out.");

    // Redirect to forums.html after logout
    setTimeout(() => {
        window.location.href = "forums.html";
    }, 1500); // Wait 1.5 seconds before redirecting
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
    let username = sessionStorage.getItem('username'); 

    if (isAuthenticated === 'true' && username) {
        console.log("✅ User is logged in, showing Create Thread button.");  
        document.getElementById("create-thread-section").classList.remove("hide");
    } else {
        console.log("❌ User is NOT logged in, hiding Create Thread button.");
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

// Submit a new thread
async function submitThread() {
    console.log("Submitting thread...");

    const title = document.getElementById("thread-title").value.trim();
    const content = document.getElementById("thread-content").value.trim();
    const categoryDropdown = document.getElementById("category-dropdown");
    const categoryId = categoryDropdown.value;
    const categoryName = categoryDropdown.options[categoryDropdown.selectedIndex].text; 
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");

    if (!title || !content || categoryId === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (!userId) {
        alert("You must be logged in to create a thread.");
        return;
    }

    const threadData = {
        title: title,
        content: content,
        categoryId: parseInt(categoryId),
        regUserId: parseInt(userId) // Ensure userId is sent
    };

    try {
        const response = await fetch("http://localhost:5195/api/Thread/Insert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(threadData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Thread submission failed:", errorText);
            alert("Failed to create thread: " + errorText);
            return;
        }

        const newThread = await response.json();
        console.log("Thread created successfully:", newThread);

        // Clear input fields after successful submission
        document.getElementById("thread-title").value = "";
        document.getElementById("thread-content").value = "";

        // Immediately update UI with correct username
        addThreadToUI({
            title,
            content,
            categoryName, 
            creatorName: username 
        });

    } catch (error) {
        console.error("Error submitting thread:", error);
        alert("A network error occurred. Please try again.");
    }
}

function addThreadToUI(thread) {
    const threadList = document.getElementById("thread-list");

    const threadElement = document.createElement("div");
    threadElement.classList.add("thread-box");
    threadElement.innerHTML = `
        <h3 class="thread-title">${thread.title}</h3>
        <p class="thread-content">${thread.content}</p>
        <div class="thread-footer">
            <small class="category-name">Category: <strong>${thread.categoryName || "Unknown"}</strong></small>
            <small class="thread-creator">Created by: <strong>${thread.creatorName}</strong></small>
        </div>
    `;

    threadList.appendChild(threadElement);
}

function addThreadToDOM(thread, username) {
    const threadsContainer = document.getElementById('threads-container');
    const threadElement = document.createElement('div');
    threadElement.classList.add('thread');
    threadElement.innerHTML = `
        <h3>${thread.title}</h3>
        <p>${thread.content}</p>
        <small>Posted by ${username} on ${new Date(thread.createdAt).toLocaleString()}</small>
    `;
    threadsContainer.prepend(threadElement);
}

// Function to get the logged-in user's ID (implement this function)
function getLoggedInUserId() {
    // Assuming the user ID is stored in sessionStorage
    return sessionStorage.getItem('userId');
}

let userMap = {}; // Store user ID -> Username mapping
async function fetchUsers() {
    try {
        const response = await fetch("http://localhost:5195/api/RegisteredUser");
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const users = await response.json();
        users.forEach(user => {
            userMap[user.regUserId] = user.username; // Store in dictionary
        });

        console.log("✅ Users loaded:", userMap);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

async function fetchThreads() {
    try {
        await fetchUsers(); // Ensure users are loaded first

        const response = await fetch("http://localhost:5195/api/Thread");
        if (!response.ok) {
            throw new Error("Failed to fetch threads");
        }

        const threads = await response.json();
        const threadList = document.getElementById("thread-list");
        threadList.innerHTML = ""; // Clear previous threads

        threads.forEach(thread => {
            thread.creatorName = userMap[thread.regUserId] || "Unknown"; // Assign username
            addThreadToUI(thread);
        });
    } catch (error) {
        console.error("Error loading threads:", error);
    }
}



// Load threads when the page starts
document.addEventListener("DOMContentLoaded", fetchThreads);


// Display threads inside the posts section
function displayThreads(threads) {
    const threadsContainer = document.getElementById('threads-container');
    threadsContainer.innerHTML = ''; // Clear existing threads

    threads.forEach(thread => {
        const threadElement = document.createElement('div');
        threadElement.classList.add('thread');
        threadElement.innerHTML = `
            <h3>${thread.title}</h3>
            <p>${thread.content}</p>
            <small>Posted by User ID: ${thread.regUserId} on ${new Date(thread.createdAt).toLocaleString()}</small>
        `;
        threadsContainer.appendChild(threadElement);
    });
}

// Show "Add Category" button only for Admin
function showCategoryButton() {
    let username = sessionStorage.getItem("username");
    if (username === "admin") {
        document.getElementById("add-category-section").classList.remove("hide");
    }
}

// Show category creation box
function showCategoryBox() {
    document.getElementById("category-box").classList.remove("hide");
}

// Close category creation box
function closeCategoryBox() {
    document.getElementById("category-box").classList.add("hide");
}

async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5195/api/Category");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const categories = await response.json();
        const categoryList = document.getElementById("category-list");
        categoryList.innerHTML = ""; // Clear before adding new

        const username = sessionStorage.getItem("username"); // Get logged-in user

        categories.forEach(category => {
            const li = document.createElement("li");
            li.classList.add("category-card");

            const categoryName = document.createElement("p");
            categoryName.textContent = category.name;
            categoryName.classList.add("category-name");

            li.appendChild(categoryName);

            // Only show delete button for Admin
            if (username === "admin") {
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.classList.add("delete-btn");
                deleteBtn.onclick = () => deleteCategory(category.categoryId);
                li.appendChild(deleteBtn);
            }

            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error("❌ Error loading categories:", error);
    }
}

function displayCategories(categories) {
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML = ""; // Clear list before adding

    categories.forEach(category => {
        console.log("Category:", category);
        categoryList.innerHTML += `<li>${category.name}</li>`; // Use correct property name
    });
}

// Submit new category (Only for Admin)
async function submitCategory() {
    let categoryName = document.getElementById("category-name").value.trim();
    let username = sessionStorage.getItem("username");

    if (username !== "admin") {
        alert("Only Admin can create categories.");
        return;
    }

    if (!categoryName) {
        alert("Category name cannot be empty.");
        return;
    }

    try {
        console.log(`🆕 Attempting to add category: ${categoryName}`);

        const response = await fetch("http://localhost:5195/api/Category/Insert", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Name: categoryName })
        });

        if (!response.ok) throw new Error(await response.text());

        alert("Category created successfully!");

        console.log("✅ Category added! Reloading list...");

        await loadCategories(); // Reload categories after adding

        closeCategoryBox();
    } catch (error) {
        console.error("❌ Error creating category:", error);
        alert("Failed to create category.");
    }
}

async function deleteCategory(categoryId) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
        const response = await fetch(`http://localhost:5195/api/Category/Delete/${categoryId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete category");
        }

        alert("Category deleted successfully!");
        loadCategories(); // Refresh category list

    } catch (error) {
        console.error("❌ Error deleting category:", error);
        alert("Failed to delete category.");
    }
}

async function loadCategoryDropdown() {
    console.log("🔄 Loading categories...");

    try {
        const response = await fetch("http://localhost:5195/api/Category");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const categories = await response.json();
        console.log("✅ Categories fetched:", categories);

        const dropdown = document.getElementById("category-dropdown");

        if (!dropdown) {
            console.error("❌ Dropdown not found in the DOM!");
            return;
        }

        // Clear existing options
        dropdown.innerHTML = `<option value="">Select a category</option>`;

        // Fix: Use categoryId instead of id
        categories.forEach(category => {
            if (category.categoryId && category.name) {
                console.log(`📌 Adding category: ID=${category.categoryId}, Name=${category.name}`);
                const option = document.createElement("option");
                option.value = category.categoryId; // Corrected from `category.id`
                option.textContent = category.name;
                dropdown.appendChild(option);
            } else {
                console.warn("⚠️ Invalid category data:", category);
            }
        });

        console.log("✅ Dropdown updated successfully!");
    } catch (error) {
        console.error("❌ Error loading categories:", error);
    }
}


