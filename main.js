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
    const iconBar = document.getElementById("iconBar");
    const navigation = document.getElementById("navigation");
    
    iconBar.style.display = "none";
    navigation.classList.remove("hide");
    // Thêm một chút độ trễ để animation hoạt động mượt mà hơn
    setTimeout(() => {
        navigation.style.opacity = "1";
    }, 50);
}

function showIconBar() {
    const iconBar = document.getElementById("iconBar");
    const navigation = document.getElementById("navigation");
    
    navigation.style.opacity = "0";
    setTimeout(() => {
        navigation.classList.add("hide");
        iconBar.style.display = "block";
    }, 300);
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
    sessionStorage.removeItem("userId");
    
    // Chuyển hướng về trang forums.html sau khi đăng xuất
    window.location.href = "forums.html";
    
    // Lưu ý: updateUIAfterLogout() không cần thiết ở đây vì trang sẽ được tải lại
}

function updateUIAfterLogin() {
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");

    if (username) {
        const usernameElement = document.getElementById("top-right-username");
        // Tạo avatar với chữ cái đầu tiên của username
        const avatarLetter = username.charAt(0);
        usernameElement.innerHTML = `
            <div class="user-avatar">${avatarLetter}</div>
            <span>${username}</span>
        `;
        usernameElement.classList.remove("hide");
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

    // Thay đổi nút Login thành Logout
    const loginItem = document.querySelector('.nav-item a[href="login.html"]').parentElement;
    loginItem.innerHTML = '<a href="#" onclick="logout()">Logout</a>';

    const createThreadSection = document.getElementById("create-thread-section");
    if (createThreadSection) {
        createThreadSection.classList.remove("hide");
    }

    fetchCategories(); // Refresh categories after login
}

function updateUIAfterLogout() {
    document.getElementById("top-right-username").classList.add("hide");
    document.getElementById("top-right-username").innerText = "";

    // Thay đổi nút Logout thành Login
    const logoutItem = document.querySelector('.nav-item a[onclick="logout()"]').parentElement;
    logoutItem.innerHTML = '<a href="login.html">Login</a>';

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
        threadElement.setAttribute('data-thread-id', thread.threadId);
        
        // Add click event to navigate to thread detail page
        threadElement.addEventListener('click', function() {
            window.location.href = `thread-detail.html?id=${thread.threadId}`;
        });
        
        const createdDate = new Date(thread.createdAt);
        const formattedDate = `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`;
        
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
    fetch(`${api_key}User/GetAll`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            // Store users in a global variable for filtering
            window.allUsers = users;
            displayUsers(users);
        })
        .catch(error => console.error("Error fetching users:", error));
}

function displayUsers(users) {
    const userTableBody = document.getElementById("user-table-body");
    if (!userTableBody) return;

    userTableBody.innerHTML = "";
    
    users.forEach(user => {
        const row = document.createElement("tr");
        const roleClass = `role-${user.role.toLowerCase()}`; // Thêm class cho role
        const statusClass = `status-${user.status.toLowerCase()}`; // Class cho status
        
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <select class="role-select ${roleClass}" data-user-id="${user.userId}" onchange="handleRoleChange(this)">
                    <option value="User" ${user.role === 'User' ? 'selected' : ''} class="role-user">User</option>
                    <option value="Moderator" ${user.role === 'Moderator' ? 'selected' : ''} class="role-moderator">Moderator</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''} class="role-admin">Admin</option>
                </select>
            </td>
            <td>
                <select class="status-select ${statusClass}" data-user-id="${user.userId}" onchange="handleStatusChange(this)">
                    <option value="Active" ${user.status === 'Active' ? 'selected' : ''} class="status-active">Active</option>
                    <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''} class="status-inactive">Inactive</option>
                    <option value="Ban" ${user.status === 'Ban' ? 'selected' : ''} class="status-ban">Ban</option>
                </select>
            </td>
            <td class="action-buttons">
                <button onclick="saveChanges(${user.userId})" class="action-btn save-btn">
                    <i class="fa fa-save"></i> Save
                </button>
                <button onclick="deleteUser(${user.userId})" class="action-btn delete-btn">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Lưu trữ các thay đổi tạm thời
const pendingChanges = new Map();

async function saveChanges(userId) {
    const changes = pendingChanges.get(userId);
    if (!changes) {
        alert('Không có thay đổi nào để lưu');
        return;
    }

    const button = document.querySelector(`button[onclick="saveChanges(${userId})"]`);
    if (!button) {
        console.error(`Không tìm thấy nút save cho user ${userId}`);
        return;
    }
    
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
        }

        // Log để debug
        console.log('Đang cập nhật user:', userId);
        console.log('Dữ liệu thay đổi:', changes);

        const response = await fetch(`${api_key}User/UpdateUser/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(changes)
        });

        const responseData = await response.text();
        console.log('Server response:', responseData);

        if (!response.ok) {
            throw new Error(responseData || 'Không thể cập nhật người dùng');
        }

        // Thêm class để kích hoạt animation
        button.classList.add('save-success');
        
        // Xóa class sau khi animation kết thúc
        setTimeout(() => {
            button.classList.remove('save-success');
        }, 1000);

        alert('Lưu thay đổi thành công!');
        pendingChanges.delete(userId);
        await refreshTable();
    } catch (error) {
        console.error('Lỗi khi lưu thay đổi:', error);
        alert(`Lỗi: ${error.message}`);
        // Khôi phục trạng thái ban đầu nếu có lỗi
        await refreshTable();
    }
}

async function saveAllChanges() {
    try {
        const token = sessionStorage.getItem("token");
        const promises = [];

        for (const [userId, changes] of pendingChanges) {
            const promise = fetch(`${api_key}User/UpdateUser/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(changes)
            });
            promises.push(promise);
        }

        await Promise.all(promises);
        alert('All changes saved successfully!');
        pendingChanges.clear();
        await refreshTable();
    } catch (error) {
        alert('Error saving changes: ' + error.message);
    }
}

async function refreshTable() {
    const refreshBtn = document.querySelector('.refresh-btn i');
    refreshBtn.classList.add('spinning');
    
    try {
        await fetchUsers();
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 1000);
    } catch (error) {
        alert('Error refreshing table: ' + error.message);
        refreshBtn.classList.remove('spinning');
    }
}

function filterUsers(role) {
    if (!window.allUsers) return;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter users
    const filteredUsers = role === 'all' 
        ? window.allUsers 
        : window.allUsers.filter(user => user.role === role);

    displayUsers(filteredUsers);
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

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${api_key}User/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            
            const data = await response.json();
            console.log("Login response data:", data);

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
            sessionStorage.setItem("userId", userId.toString());
            
            // Redirect to community page
            window.location.href = 'community.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login: ' + error.message);
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${api_key}User/Register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message); });
            }
            
            alert('Registration successful! You can now log in.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration: ' + error.message);
        }
    });
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation to elements when they come into view
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .section-title, .feature-item').forEach(el => {
    observer.observe(el);
});

// Add this to your existing DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
    // ... existing code ...
    
    // Set initial active state for "All Users" button
    const allUsersBtn = document.querySelector('.filter-btn');
    if (allUsersBtn) {
        allUsersBtn.classList.add('active');
    }
});

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const icon = event.target;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

function handleRoleChange(selectElement) {
    try {
        const userId = selectElement.dataset.userId;
        const newRole = selectElement.value;
        const currentUserRole = sessionStorage.getItem("role");
        
        // Kiểm tra quyền
        if (currentUserRole !== 'Admin' && currentUserRole !== 'admin') {
            alert('Bạn không có quyền thay đổi role');
            refreshTable(); // Khôi phục trạng thái
            return;
        }

        // Kiểm tra dữ liệu đầu vào
        if (!userId || !newRole) {
            console.error('Thiếu thông tin userId hoặc role');
            return;
        }

        if (!pendingChanges.has(userId)) {
            pendingChanges.set(userId, {});
        }
        pendingChanges.get(userId).role = newRole;
        
        // Cập nhật class cho select box
        selectElement.className = `role-select role-${newRole.toLowerCase()}`;
        
        // Thêm hiệu ứng highlight
        const row = selectElement.closest('tr');
        if (row) {
            row.classList.add('role-changed');
            setTimeout(() => {
                row.classList.remove('role-changed');
            }, 1500);
        }

        console.log(`Role change pending for user ${userId}: ${newRole}`);
    } catch (error) {
        console.error('Lỗi khi thay đổi role:', error);
        alert('Có lỗi xảy ra khi thay đổi role. Vui lòng thử lại.');
        refreshTable();
    }
}

// Thêm hàm kiểm tra user
async function checkUserExists(userId) {
    try {
        const response = await fetch(`${api_key}User/${userId}`);
        if (!response.ok) {
            throw new Error('Không tìm thấy người dùng');
        }
        return true;
    } catch (error) {
        console.error(`Lỗi khi kiểm tra user ${userId}:`, error);
        return false;
    }
}

// Thêm hàm xóa user
async function deleteUser(userId) {
    try {
        // Kiểm tra xem có phải đang xóa chính mình không
        const currentUserId = sessionStorage.getItem("userId");
        if (userId === parseInt(currentUserId)) {
            alert("Bạn không thể xóa tài khoản của chính mình!");
            return;
        }

        // Xác nhận xóa
        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            return;
        }

        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
        }

        const response = await fetch(`${api_key}User/Delete/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể xóa người dùng');
        }

        alert('Xóa người dùng thành công!');
        await refreshTable();
    } catch (error) {
        console.error('Lỗi khi xóa user:', error);
        alert(`Lỗi: ${error.message}`);
    }
}

// ===== THREAD DETAIL FUNCTIONS =====

// Load thread details based on ID
async function loadThreadDetails(threadId) {
    try {
        const response = await fetch(`${api_key}Thread/${threadId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch thread details');
        }
        
        const thread = await response.json();
        
        // Kiểm tra các phần tử trước khi cập nhật
        const titleElement = document.getElementById('thread-title');
        const authorElement = document.getElementById('thread-author');
        const dateElement = document.getElementById('thread-date');
        const contentElement = document.getElementById('thread-content');
        
        if (titleElement) titleElement.textContent = thread.title;
        if (authorElement) authorElement.textContent = thread.username || 'Unknown User';
        
        if (dateElement) {
            const createdDate = new Date(thread.createdAt);
            dateElement.textContent = `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`;
        }
        
        if (contentElement) contentElement.textContent = thread.content;
        
        document.title = `${thread.title} - Forum`;
        
    } catch (error) {
        console.error('Error loading thread details:', error);
        const contentElement = document.getElementById('thread-content');
        if (contentElement) {
            contentElement.innerHTML = '<p class="error-message">Failed to load thread details. Please try again later.</p>';
        }
    }
}

// Load posts for a specific thread
async function loadPosts(threadId) {
    try {
        const response = await fetch(`${api_key}Post/ByThread/${threadId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        const posts = await response.json();
        displayPosts(posts);
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('comments-container').innerHTML = '<p class="error-message">Failed to load posts. Please try again later.</p>';
    }
}

// Display posts in the UI
function displayPosts(posts) {
    const container = document.getElementById('comments-container');
    const commentCount = document.getElementById('comment-count');
    if (!container || !commentCount) return;

    container.innerHTML = '';
    commentCount.textContent = `${posts.length} comments`;

    if (posts.length === 0) {
        container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

// Create a post element for the UI
function createPostElement(post) {
    const template = document.getElementById("post-template");
    if (!template) {
        console.error('Post template not found');
        return null;
    }
    
    const postElement = template.content.cloneNode(true).querySelector(".post");
    if (!postElement) {
        console.error('Post element not found in template');
        return null;
    }
    
    const currentUserId = parseInt(sessionStorage.getItem("userId"));
    const isAuthor = currentUserId === post.userId;
    
    // Set post data
    postElement.setAttribute("data-post-id", post.postId);
    
    const authorElement = postElement.querySelector(".post-author");
    if (authorElement) authorElement.textContent = post.username || 'Unknown';
    
    const dateElement = postElement.querySelector(".post-date");
    if (dateElement) dateElement.textContent = formatDate(post.createdAt);
    
    const contentElement = postElement.querySelector(".post-content");
    if (contentElement) contentElement.textContent = post.content;
    
    // Show/hide edit and delete buttons
    const editButton = postElement.querySelector(".edit-post");
    const deleteButton = postElement.querySelector(".delete-post");
    if (isAuthor && editButton && deleteButton) {
        editButton.classList.remove("hide");
        deleteButton.classList.remove("hide");
        
        editButton.onclick = () => editPost(post.postId);
        deleteButton.onclick = () => deletePost(post.postId);
    }
    
    // Set up comment form
    const commentForm = postElement.querySelector(".comment-form");
    if (commentForm) {
        const commentButton = commentForm.querySelector("button");
        if (commentButton) {
            commentButton.onclick = function() {
                submitComment(this);
            };
        }
    }
    
    // Load comments for this post
    const commentsContainer = postElement.querySelector(".comments-container");
    if (commentsContainer) {
        loadComments(post.postId, commentsContainer);
    }
    
    return postElement;
}

// Toggle reply form visibility
function toggleReplyForm(button) {
    // Check if user is logged in
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to reply to posts.");
        return;
    }
    
    const form = button.nextElementSibling;
    form.classList.toggle('active');
}

// Submit a new post (comment)
async function submitPost() {
    // Check if user is logged in
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to post comments.");
        return;
    }
    
    const threadId = getCurrentThreadId();
    if (!threadId) {
        console.error('No thread ID found');
        return;
    }
    
    const commentInput = document.getElementById('comment-input');
    const content = commentInput.value.trim();
    
    if (!content) {
        return;
    }
    
    try {
        const response = await fetch(`${api_key}Post/Insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({
                threadId: threadId,
                content: content,
                userId: parseInt(sessionStorage.getItem("userId"))
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit post');
        }
        
        // Clear input and reload posts
        commentInput.value = '';
        loadPosts(threadId);
        
    } catch (error) {
        console.error('Error submitting post:', error);
        alert('Failed to submit post. Please try again later.');
    }
}

// Submit a reply to a post
async function submitReply(button, parentPostId) {
    // Check if user is logged in
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to reply to posts.");
        return;
    }
    
    const threadId = getCurrentThreadId();
    if (!threadId) {
        console.error('No thread ID found');
        return;
    }
    
    const form = button.parentElement;
    const content = form.querySelector('textarea').value.trim();
    
    if (!content) {
        return;
    }
    
    try {
        const response = await fetch(`${api_key}Post/Insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({
                threadId: threadId,
                content: content,
                userId: parseInt(sessionStorage.getItem("userId"))
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit reply');
        }
        
        // Clear input, hide form and reload posts
        form.querySelector('textarea').value = '';
        form.classList.remove('active');
        loadPosts(threadId);
        
    } catch (error) {
        console.error('Error submitting reply:', error);
        alert('Failed to submit reply. Please try again later.');
    }
}

// Helper function to get current thread ID from URL
function getCurrentThreadId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Initialize thread detail page
function initThreadDetailPage() {
    const threadId = getCurrentThreadId();
    
    if (threadId) {
        loadThreadDetails(threadId);
        loadPosts(threadId);
    } else {
        window.location.href = 'community.html';
    }
}

// Check if we're on the thread detail page and initialize
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('thread-detail.html')) {
        initThreadDetailPage();
    }
});

// Update sidebar information
function updateSidebarInfo(thread) {
    document.getElementById('thread-category').textContent = thread.category || 'General';
    document.getElementById('thread-posted-date').textContent = formatDate(thread.createdAt);
    document.getElementById('sidebar-comment-count').textContent = thread.commentCount || '0';
    document.getElementById('thread-views').textContent = thread.views || '0';
}

// Load and display related threads
async function loadRelatedThreads(currentThreadId) {
    try {
        const response = await fetch(`${api_key}Thread/Related/${currentThreadId}`);
        if (!response.ok) throw new Error('Failed to fetch related threads');
        
        const relatedThreads = await response.json();
        displayRelatedThreads(relatedThreads);
    } catch (error) {
        console.error('Error loading related threads:', error);
    }
}

// Display related threads in sidebar
function displayRelatedThreads(threads) {
    const container = document.getElementById('related-threads');
    container.innerHTML = '';

    if (!threads || threads.length === 0) {
        container.innerHTML = '<li class="no-threads">No related threads found</li>';
        return;
    }

    threads.forEach(thread => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="thread-detail.html?id=${thread.id}">
                ${thread.title}
            </a>
        `;
        container.appendChild(li);
    });
}

// Update the loadThreadDetail function to include sidebar updates
async function loadThreadDetail(threadId) {
    try {
        const response = await fetch(`${api_key}Thread/${threadId}`);
        if (!response.ok) throw new Error('Failed to fetch thread details');
        
        const thread = await response.json();
        
        // Update main thread content
        document.getElementById('thread-title').textContent = thread.title;
        document.getElementById('thread-author').textContent = thread.username || 'Unknown User';
        document.getElementById('thread-date').textContent = formatDate(thread.createdAt);
        document.getElementById('thread-content').innerHTML = thread.content;
        
        // Update sidebar information
        updateSidebarInfo(thread);
        
        // Load related threads
        loadRelatedThreads(threadId);
        
        // Load comments/posts
        loadPosts(threadId);
    } catch (error) {
        console.error('Error loading thread details:', error);
        showError('Failed to load thread details. Please try again later.');
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== POST & COMMENT FUNCTIONS =====

// Create a new post
async function submitPost() {
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to create a post.");
        return;
    }

    const content = document.getElementById("post-input").value.trim();
    if (!content) {
        alert("Please write something in your post.");
        return;
    }

    const threadId = getCurrentThreadId();
    const userId = parseInt(sessionStorage.getItem("userId"));

    try {
        const response = await fetch(`${api_key}Post/Insert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({
                content: content,
                threadId: threadId,
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create post");
        }

        // Clear input and reload posts
        document.getElementById("post-input").value = "";
        loadPosts(threadId);
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again.");
    }
}

// Load posts for a thread
async function loadPosts(threadId) {
    try {
        const response = await fetch(`${api_key}Post/ByThread/${threadId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }

        const posts = await response.json();
        displayPosts(posts);
        updatePostCount(posts.length);
    } catch (error) {
        console.error("Error loading posts:", error);
        document.getElementById("posts-container").innerHTML = 
            '<p class="error-message">Failed to load posts. Please try again later.</p>';
    }
}

// Display posts in the UI
function displayPosts(posts) {
    const container = document.getElementById("posts-container");
    if (!container) {
        console.error('Posts container not found');
        return;
    }

    container.innerHTML = "";
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="no-posts">No posts yet. Be the first to post!</p>';
        return;
    }

    // Sort posts by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    posts.forEach(post => {
        if (post) {  // Kiểm tra post trước khi tạo element
            const postElement = createPostElement(post);
            if (postElement) {  // Kiểm tra postElement không null
                container.appendChild(postElement);
            }
        }
    });
}

// Create a post element
function createPostElement(post) {
    const template = document.getElementById("post-template");
    const postElement = template.content.cloneNode(true).querySelector(".post");
    
    const currentUserId = parseInt(sessionStorage.getItem("userId"));
    const isAuthor = currentUserId === post.userId;
    
    // Set post data
    postElement.setAttribute("data-post-id", post.postId);
    postElement.querySelector(".post-author").textContent = post.username;
    postElement.querySelector(".post-date").textContent = formatDate(post.createdAt);
    postElement.querySelector(".post-content").textContent = post.content;
    
    // Show/hide edit and delete buttons
    const editButton = postElement.querySelector(".edit-post");
    const deleteButton = postElement.querySelector(".delete-post");
    if (isAuthor) {
        editButton.classList.remove("hide");
        deleteButton.classList.remove("hide");
        
        editButton.onclick = () => editPost(post.postId);
        deleteButton.onclick = () => deletePost(post.postId);
    }
    
    // Set up comment form
    const commentForm = postElement.querySelector(".comment-form");
    const commentButton = commentForm.querySelector("button");
    commentButton.onclick = function() {
        submitComment(this);
    };
    
    // Load comments for this post
    loadComments(post.postId, postElement.querySelector(".comments-container"));
    
    return postElement;
}

// Toggle comment form visibility
function toggleCommentForm(button) {
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to comment.");
        return;
    }
    
    const form = button.closest(".post").querySelector(".comment-form");
    form.classList.toggle("hide");
    
    if (!form.classList.contains("hide")) {
        form.querySelector("textarea").focus();
    }
}

// Submit a comment
async function submitComment(button) {
    if (!sessionStorage.getItem('token')) {
        alert('Please log in to comment.');
        return;
    }

    // Đảm bảo button là phần tử DOM
    if (!(button instanceof Element)) {
        console.error('Invalid button parameter:', button);
        return;
    }

    const post = button.closest('.post');
    if (!post) {
        console.error('Post element not found');
        return;
    }

    const postId = parseInt(post.getAttribute('data-post-id'));
    const commentForm = post.querySelector('.comment-form');
    const textarea = commentForm.querySelector('textarea');
    const content = textarea.value.trim();

    if (!content) {
        alert('Please write something in your comment.');
        return;
    }

    try {
        const response = await fetch(`${api_key}Comment/Insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                content: content,
                postId: postId,
                userId: parseInt(sessionStorage.getItem('userId'))
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to create comment');
        }

        // Clear form and reload comments
        textarea.value = '';
        commentForm.classList.add('hide');
        
        // Reload comments
        const commentsContainer = post.querySelector('.comments-container');
        await loadComments(postId, commentsContainer);

    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Failed to submit comment. Please try again.');
    }
}

// Load comments for a post
async function loadComments(postId, container) {
    if (!container) {
        console.error('Comment container is missing');
        return;
    }
    
    try {
        const response = await fetch(`${api_key}Comment/ByPost/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        
        const comments = await response.json();
        displayComments(comments, container);
        
        // Update comment count in the post
        const post = container.closest('.post');
        if (post) {
            const commentCountElement = post.querySelector('.comment-count');
            if (commentCountElement) {
                commentCountElement.textContent = comments.length;
            }
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = '<p class="error-message">Failed to load comments. Please try again later.</p>';
    }
}

// Display comments in the UI
function displayComments(comments, container) {
    if (!container) {
        console.error('Comments container not found');
        return;
    }

    container.innerHTML = '';
    
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }

    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        if (commentElement) {
            container.appendChild(commentElement);
        }
    });
}

// Create a comment element
function createCommentElement(comment) {
    const template = document.getElementById('comment-template');
    if (!template) {
        console.error('Comment template not found');
        return null;
    }

    const commentElement = template.content.cloneNode(true).querySelector('.comment');
    
    // Set comment data
    commentElement.setAttribute('data-comment-id', comment.commentId);
    commentElement.querySelector('.comment-author').textContent = comment.username;
    commentElement.querySelector('.comment-date').textContent = formatDate(comment.createdAt);
    commentElement.querySelector('.comment-content').textContent = comment.content;
    
    // Show edit/delete buttons for comment author
    const currentUserId = parseInt(sessionStorage.getItem('userId'));
    if (currentUserId === comment.userId) {
        const editButton = commentElement.querySelector('.edit-comment');
        const deleteButton = commentElement.querySelector('.delete-comment');
        
        editButton.classList.remove('hide');
        deleteButton.classList.remove('hide');
        
        editButton.onclick = () => editComment(comment.commentId);
        deleteButton.onclick = () => deleteComment(comment.commentId);
    }
    
    return commentElement;
}

// Edit a comment
async function editComment(commentId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Comment element not found');
        return;
    }

    const contentElement = commentElement.querySelector('.comment-content');
    const currentContent = contentElement.textContent;
    
    const newContent = prompt('Edit your comment:', currentContent);
    if (!newContent || newContent === currentContent) {
        return;
    }

    try {
        const response = await fetch(`${api_key}Comment/Update/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                content: newContent
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update comment');
        }

        contentElement.textContent = newContent;

    } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment. Please try again.');
    }
}

// Delete a comment
async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        const response = await fetch(`${api_key}Comment/Delete/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }

        // Remove comment from UI
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        const post = commentElement.closest('.post');
        commentElement.remove();

        // Update comment count
        const commentCount = post.querySelector('.comment-count');
        if (commentCount) {
            const currentCount = parseInt(commentCount.textContent) || 0;
            commentCount.textContent = Math.max(0, currentCount - 1);
        }

    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment. Please try again.');
    }
}

// Toggle comment form visibility
function toggleCommentForm(button) {
    if (!sessionStorage.getItem('token')) {
        alert('Please log in to comment.');
        return;
    }
    
    const post = button.closest('.post');
    if (!post) {
        console.error('Post element not found');
        return;
    }

    const form = post.querySelector('.comment-form');
    if (!form) {
        console.error('Comment form not found');
        return;
    }
    
    if (form.classList.contains('hide')) {
        form.classList.remove('hide');
        form.querySelector('textarea').focus();
    } else {
        form.classList.add('hide');
    }
}

// Helper functions
function updatePostCount(count) {
    document.getElementById("post-count").textContent = count;
}

function updateCommentCount(postId, count) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    if (post) {
        post.querySelector(".comment-count").textContent = `${count || 0} comments`;
    }
}

function getPostIdFromComment(commentElement) {
    const post = commentElement.closest(".post");
    return parseInt(post.getAttribute("data-post-id"));
}



