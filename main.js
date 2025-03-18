document.addEventListener("DOMContentLoaded", function () {
    fetchCategories();
    initializePage();
    fetchAndDisplayThreads();
    fetchUsers();
    if (sessionStorage.getItem("token")) {
        updateUIAfterLogin();
    } else {
        updateUIAfterLogout();
    }
});

function initializePage() {
    document.querySelectorAll('.nav-bar .nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showContent(this.getAttribute('href'));
        });
    });
}

// API
const api_key = "http://localhost:5083/api/";

// NavBar
function hideIconBar() {
    document.getElementById("iconBar").style.display = "none";
    document.getElementById("navigation").classList.remove("hide");
}

function showIconBar() {
    document.getElementById("iconBar").style.display = "block";
    document.getElementById("navigation").classList.add("hide");
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

function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-password2").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const userData = { username, email, password };

    fetch(`${api_key}User/Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.text();
    })
    .then(() => {
        alert("Registration successful! You can now log in.");
        closePopup("register-popup");
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const loginData = { email, password };

    fetch(`${api_key}User/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        console.log("Login response data:", data); // Debugging step

        // Decode the token to extract userId
        const token = data.token;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.UserId;

        if (!userId) {
            throw new Error("Invalid user data received from the server.");
        }

        alert("Login successful!");
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("role", data.user.role);
        sessionStorage.setItem("userId", userId.toString()); // Store userId in session storage as a string
        updateUIAfterLogin();
        closePopup("login-popup");
    })
    .catch(error => {
        console.error("Login error:", error); // Debugging step
        alert("Error: " + error.message);
    });
}


function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    updateUIAfterLogout();
}

function updateUIAfterLogin() {
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");

    if (username) {
        document.getElementById("top-right-username").innerText = username;
        document.getElementById("top-right-username").classList.remove("hide");
    }

    const categoryBox = document.getElementById("add-category-box");

    if (role === "admin" || role === "Admin") {
        if (categoryBox) {
            categoryBox.style.display = "block";
            categoryBox.classList.remove("hide");
        }
        // Show Modctrl link for Admin
        document.querySelector('.nav-item a[href="Modctrl.html"]').parentElement.classList.remove("hide");
    } else {
        // Hide Modctrl link for non-Admin
        document.querySelector('.nav-item a[href="Modctrl.html"]').parentElement.classList.add("hide");
    }

    document.querySelector(".login-link").classList.add("hide");
    document.querySelector(".logout-link").classList.remove("hide");

    const createThreadSection = document.getElementById("create-thread-section");
    if (createThreadSection) {
        createThreadSection.classList.remove("hide");
    }

    fetchCategories(); // Refresh categories after login
}

function updateUIAfterLogout() {
    document.getElementById("top-right-username").classList.add("hide");
    document.getElementById("top-right-username").innerText = "";

    document.querySelector(".login-link").classList.remove("hide");
    document.querySelector(".logout-link").classList.add("hide");

    const addCategoryBox = document.getElementById("add-category-box");
    if (addCategoryBox) {
        addCategoryBox.classList.add("hide");
    }

    const createThreadSection = document.getElementById("create-thread-section");
    if (createThreadSection) {
        createThreadSection.classList.add("hide");
    }

    fetchCategories(); // Refresh categories after logout
}

function createCategory() {
    const categoryName = document.getElementById("category-name").value.trim();
    if (!categoryName) {
        alert("Please enter a category name.");
        return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to create a category.");
        return;
    }

    fetch(`${api_key}Category/Insert?name=${encodeURIComponent(categoryName)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        alert("Category created successfully!");
        document.getElementById("category-name").value = ""; // Clear input field
        fetchCategories(); // Refresh category list and dropdown
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

function fetchCategories() {
    fetch(`${api_key}Category`)
        .then(response => response.json())
        .then(categories => {
            // Update the dropdown
            updateCategoryDropdown(categories);

            // Update the category list (if applicable)
            updateCategoryList(categories);
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
        });
}

function updateCategoryDropdown(categories) {
    const categoryDropdown = document.getElementById("thread-category");

    if (!categoryDropdown) {
        console.warn("Dropdown element not found.");
        return;
    }

    // Clear only the dropdown options
    categoryDropdown.innerHTML = `<option value="" disabled selected>Select Category</option>`;

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.categoryId; // Use ID as value
        option.textContent = category.name; // Display name
        categoryDropdown.appendChild(option);
    });
}

function updateCategoryList(categories) {
    const categoryList = document.getElementById("categories-list"); // Changed from categoriesList to categories-list

    if (!categoryList) {
        console.warn("Category list element not found.");
        return;
    }

    // Clear and repopulate the list
    categoryList.innerHTML = "";
    
    categories.forEach(category => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "category-item";
        categoryDiv.textContent = category.name;
        
        // Add delete button for admins
        if (sessionStorage.getItem("role") === "admin" || sessionStorage.getItem("role") === "Admin") {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-category-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteCategory(category.categoryId);
            categoryDiv.appendChild(deleteBtn);
        }
        
        categoryList.appendChild(categoryDiv);
    });
}

// Call the function to fetch categories
fetchCategories();


function deleteCategory(categoryId) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in as Admin to delete categories.");
        return;
    }

    if (!confirm("Are you sure you want to delete this category?")) {
        return;
    }

    fetch(`${api_key}Category/Delete/${categoryId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(() => {
        alert("Category deleted successfully!");
        fetchCategories(); // Refresh the list and dropdown
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

async function createThread() {
    const title = document.getElementById('thread-title').value;
    const content = document.getElementById('thread-content').value;
    const categorySelect = document.getElementById('thread-category');
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    
    if (!title || !content || !categoryId) {
        alert('Please fill in all fields including selecting a category.');
        return;
    }

    // Get the current user's ID and username from the session
    const userId = parseInt(sessionStorage.getItem('userId'), 10); // Ensure userId is parsed as an integer
    const username = sessionStorage.getItem('username');

    console.log("Retrieved userId:", userId);
    console.log("Retrieved username:", username);

    try {
        const response = await fetch(`${api_key}Thread/Insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                title: title, 
                content: content, 
                categoryId: parseInt(categoryId, 10), // Ensure categoryId is parsed as an integer
                userId: userId, // Use the actual user ID from session storage
                categoryName: categoryName,
                username: username, // Add username here
                threadId: 0,
                createdAt: new Date().toISOString() // Ensure the date is in ISO format
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Thread created successfully:', data);
            alert('Thread created successfully!');
            clearThreadForm();
            fetchAndDisplayThreads(); // Refresh threads after creating a new one
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            try {
                const errorData = JSON.parse(errorText);
                alert(`Error: ${errorData.title || 'Could not create thread'}`);
            } catch (e) {
                alert(`Error: ${errorText || 'Could not create thread'}`);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Function to clear the thread form
function clearThreadForm() {
    document.getElementById('thread-title').value = '';
    document.getElementById('thread-content').value = '';
    document.getElementById('thread-category').value = '';
}

async function fetchAndDisplayThreads() {
    try {
        // Fetch all threads
        const threadsResponse = await fetch(`${api_key}Thread`);
        
        if (!threadsResponse.ok) {
            throw new Error('Failed to fetch threads');
        }
        
        const threads = await threadsResponse.json();
        displayThreads(threads);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('threads-display').innerHTML = 
            '<p class="error-message">Failed to load threads. Please try again later.</p>';
    }
}

// Updated to accept userMap parameter
function displayThreads(threads) {
    const threadsContainer = document.getElementById('threads-display');

    if (!threadsContainer) {
        console.warn('Threads display container not found');
        return;
    }

    threadsContainer.innerHTML = '';

    threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (threads.length === 0) {
        threadsContainer.innerHTML = '<p class="no-threads">No threads yet. Be the first to create one!</p>';
        return;
    }

    threads.forEach(thread => {
        const threadElement = document.createElement('div');
        threadElement.className = 'thread-item';

        const createdDate = new Date(thread.createdAt);
        const formattedDate = `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`;

        // ✅ Ensure username is correctly displayed
        const username = thread.username || "Unknown User";

        threadElement.innerHTML = `
            <div class="thread-header">
                <h3 class="thread-title">${thread.title}</h3>
                <div class="thread-meta">
                    <span class="thread-category">${thread.categoryName}</span>
                </div>
            </div>
            <div class="thread-content">${thread.content}</div>
            <div class="thread-footer">
                <span class="thread-date">Posted on ${formattedDate}</span>
                <span class="thread-author">by: ${username}</span> <!-- ✅ Display Correct Username -->
            </div>
        `;

        threadsContainer.appendChild(threadElement);
    });
}

function fetchUsers() {
    fetch("http://localhost:5083/api/User/GetAll")
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            const userTableBody = document.getElementById("user-table-body");
            userTableBody.innerHTML = ""; // Clear table before adding new rows

            // Filter users with roles "Moderator" or "User"
            const filteredUsers = users.filter(user => user.role === "Moderator" || user.role === "User");

            filteredUsers.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.userId}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        ${user.role}
                        <button onclick="assignRole(${user.userId})">Assign</button>
                    </td>
                    <td>${user.status}</td>
                `;
                userTableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching users:", error));
}

function assignRole(userId) {
    const newRole = prompt("Enter new role for the user (e.g., Admin, Moderator, User):");
    if (!newRole) {
        alert("Role cannot be empty.");
        return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to assign roles.");
        return;
    }

    fetch(`${api_key}User/UpdateRole/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(() => {
        alert("Role assigned successfully!");
        fetchUsers(); // Refresh the user list
    })
    .catch(error => {
        alert("Error: " + error.message);
    });
}

