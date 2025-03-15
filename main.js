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
//API
const api_key ="http://localhost:5195/api/"
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

// Popup Message Functions
function showSuccessPopup(message) {
    Swal.fire({
        title: 'Success!',
        text: message,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#111314',
        color: '#fff',
        iconColor: '#4CAF50'
    });
}

function showErrorPopup(message) {
    Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#111314',
        color: '#fff',
        iconColor: '#f44336'
    });
}

// Login Functions
async function login(email, password) {
    try {
        // Lấy giá trị từ form
        email = document.getElementById('email').value;
        password = document.getElementById('password').value;

        if (!email || !password) {
            showErrorPopup("Please enter both email and password!");
            return;
        }

        // Hiển thị loading
        Swal.fire({
            title: 'Checking credentials...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#111314',
            color: '#fff'
        });

        // Đợi 0.3 giây trước khi thực hiện request
        await new Promise(resolve => setTimeout(resolve, 300));

        // Kiểm tra admin trước
        const adminResponse = await fetch(`${api_key}Admin/Login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // Nếu là admin
        if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            
            // Store admin session data
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('email', adminData.email);
            sessionStorage.setItem('token', adminData.token);
            sessionStorage.setItem('userId', adminData.userId);
            sessionStorage.setItem('username', 'admin');

            // Update navbar
            updateNavBar();

            Swal.close();
            showSuccessPopup(`Welcome, Administrator!`);
            
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 1500);
            return;
        }

        // Nếu không phải admin, kiểm tra user thường
        const userResponse = await fetch(`${api_key}RegisteredUser/Login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // Đóng loading
        Swal.close();

        if (userResponse.status === 401) {
            showErrorPopup("Invalid email or password.");
            return;
        }

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error("Login failed:", errorText);
            showErrorPopup("Login failed: " + errorText);
            return;
        }

        const userData = await userResponse.json();

        if (!userData.userId) {
            console.error("Error: API response does not contain userId!");
            showErrorPopup("Login failed: Invalid response from server");
            return;
        }

        // Store user session data
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('isAdmin', 'false');
        sessionStorage.setItem('email', userData.email);
        sessionStorage.setItem('token', userData.token);
        sessionStorage.setItem('userId', userData.userId);
        sessionStorage.setItem('username', userData.username || email.split('@')[0]);

        // Cập nhật navbar
        updateNavBar();

        showSuccessPopup(`Welcome, ${userData.username || email.split('@')[0]}!`);
        
        setTimeout(() => {
            window.location.href = "forums.html";
        }, 1500);

    } catch (error) {
        console.error("Login error:", error);
        showErrorPopup("A network error occurred. Please try again.");
    }
}

// Function to verify admin access
function verifyAdminAccess() {
    const isAdmin = sessionStorage.getItem('username') === 'admin';
    if (!isAdmin) {
        showErrorPopup("Access denied. Admin privileges required.");
        setTimeout(() => {
            window.location.href = "forums.html";
        }, 1500);
        return false;
    }
    return true;
}

// Register Functions
async function register() {
    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const password2 = document.getElementById('password2').value;

        let emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailPattern.test(email)) {
            showErrorPopup('Invalid email format.');
            return;
        }

        if (password !== password2) {
            showErrorPopup('Passwords do not match!');
            return;
        }

        // Hiển thị loading
        Swal.fire({
            title: 'Creating account...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#111314',
            color: '#fff'
        });

        // Đợi 0.3 giây trước khi thực hiện request
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch(`${api_key}RegisteredUser/Insert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        // Đóng loading
        Swal.close();

        const result = await response.json();

        if (!response.ok) {
            showErrorPopup(result.message);
            return;
        }

        // Hiển thị thông báo thành công với timer
        await Swal.fire({
            icon: 'success',
            title: 'Registration successful!',
            text: 'Redirecting to login page...',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#111314',
            color: '#fff'
        });

        clearRegisterForm();
        window.location.href = 'login.html';

    } catch (error) {
        showErrorPopup('A network error occurred.');
    }
}

// Helper Functions
function clearRegisterForm() {
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password2').value = '';
}

// Authentication check
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
        window.location.href = 'forums.html';
    }
}

// Update NavBar based on authentication status
function updateNavBar() {
    let isAuthenticated = sessionStorage.getItem('isAuthenticated');
    let username = sessionStorage.getItem('username');

    const loginItem = document.getElementById('login-item');
    const logoutItem = document.getElementById('logout-item');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = userProfile ? userProfile.querySelector('.username-display') : null;

    if (isAuthenticated === 'true') {
        // Ẩn nút login và hiện nút logout
        if (loginItem) loginItem.classList.add('hide');
        if (logoutItem) logoutItem.classList.remove('hide');

        // Hiển thị user profile
        if (userProfile) {
            userProfile.classList.remove('hide');
            if (usernameDisplay) {
                usernameDisplay.textContent = username;
            }
        }
    } else {
        // Hiện nút login và ẩn nút logout
        if (loginItem) loginItem.classList.remove('hide');
        if (logoutItem) logoutItem.classList.add('hide');

        // Ẩn user profile
        if (userProfile) {
            userProfile.classList.add('hide');
        }
    }
}

// Logout function
function logout() {
    // Hiển thị thông báo đang đăng xuất
    Swal.fire({
        title: 'Logging out...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#111314',
        color: '#fff'
    });

    // Xóa tất cả dữ liệu session
    sessionStorage.clear();
    
    // Hiển thị thông báo thành công và reload trang
    Swal.fire({
        title: 'Success!',
        text: 'You have been logged out successfully',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        background: '#111314',
        color: '#fff'
    }).then(() => {
        // Chuyển về trang forums và reload
        window.location.href = "forums.html";
        window.location.reload(true); // Force reload from server
    });
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

// Submit a new thread
async function submitThread() {
    console.log("Submitting thread...");

    const title = document.getElementById("thread-title").value.trim();
    const content = document.getElementById("thread-content").value.trim();
    const categoryDropdown = document.getElementById("category-dropdown");
    const categoryId = categoryDropdown.value;
    const categoryName = categoryDropdown.options[categoryDropdown.selectedIndex].text;
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username"); // Get stored username

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
        regUserId: parseInt(userId)
    };

    try {
        const response = await fetch(`${api_key}Thread/Insert`, {
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
            categoryName, // Use category name instead of ID
            creatorName: username // Use stored username instead of waiting for API
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
        const response = await fetch(`${api_key}RegisteredUser`);
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

        const response = await fetch(`${api_key}/Thread`);
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
        const response = await fetch(`${api_key}Category`);
        if (!response.ok) throw new Error("Failed to fetch categories");

        const categories = await response.json();
        
        // Update the category list on the Categories page
        const categoryList = document.getElementById("category-list");
        if (categoryList) {
            categoryList.innerHTML = ""; // Clear list before adding
            categories.forEach(category => {
                categoryList.innerHTML += `<li>${category.name}</li>`;
            });
        }
    } catch (error) {
        console.error("❌ Error loading categories:", error);
    }
}

function displayCategories(categories) {
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML = ""; // Clear list before adding

    categories.forEach(category => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${category.name} 
            <button class="delete-btn" onclick="deleteCategory(${category.categoryId})">Delete</button>
        `;
        categoryList.appendChild(li);
    });
}

function displayCategories(categories) {
    const categoryContainer = document.getElementById("category-container");
    categoryContainer.innerHTML = ""; // Clear previous content

    let username = sessionStorage.getItem("username");

    categories.forEach(category => {
        categoryList.innerHTML += `<li>${category.name}</li>`;
    });
}

// Placeholder function for future interactions
function viewCategory(categoryId) {
    alert(`Category ID: ${categoryId} clicked! Future feature here.`);
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
        
        const url = `${api_key}Category/Insert?name=${encodeURIComponent(categoryName)}`;
        const response = await fetch(url, { method: "POST" });

        if (!response.ok) {
            alert("Error: " + data.message);
            return;
        }

        alert("Category created successfully!");

        console.log("✅ Category added! Reloading dropdown...");

        await loadCategories(); // Reload categories list
        await loadCategoryDropdown(); // Reload dropdown

        closeCategoryBox();
    } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category. Check console for details.");
    }
}


async function deleteCategory(categoryId) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
        const response = await fetch(`${api_key}Category/Delete/${categoryId}`, {
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
        const response = await fetch(`${api_key}Category`);

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


async function deleteCategory(categoryId) {
    let username = sessionStorage.getItem("username");
    
    if (username !== "admin") {
        alert("Only Admin can delete categories.");
        return;
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
        const response = await fetch(`${api_key}Category/Delete/${categoryId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        alert("Category deleted successfully!");
        loadCategories(); // Refresh the list
    } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category.");
    }
}

// Thêm event listener để cập nhật navbar khi trang load
document.addEventListener("DOMContentLoaded", function() {
    updateNavBar();
});

// Toggle Profile Dropdown
function toggleProfileDropdown(event) {
    if (event) {
        event.stopPropagation(); // Prevent event from bubbling up
    }
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('profile-dropdown');
    const userProfile = document.getElementById('user-profile');
    
    if (dropdown && dropdown.classList.contains('show') && !userProfile.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});
