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
    updateViewModeIndicator();

    document.querySelectorAll('.nav-bar .nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            showContent(this.getAttribute('href'));
        });
    });
}

// Function to update the view mode indicator
function updateViewModeIndicator() {
    console.log("Updating view mode indicator");
    
    const viewingAsUser = sessionStorage.getItem("viewingAsUser") === "true";
    const originalIsAdmin = sessionStorage.getItem("originalIsAdmin") === "true";
    const isAdmin = sessionStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("username") === "admin";
    
    console.log("viewingAsUser:", viewingAsUser, "isAdmin:", isAdmin, "originalIsAdmin:", originalIsAdmin);
    
    // Update dropdown items visibility based on view mode
    const viewAsUserDropdownItem = document.getElementById("view-as-user-dropdown-item");
    const viewAsAdminDropdownItem = document.getElementById("view-as-admin-dropdown-item");
    
    if (!isAdmin && !originalIsAdmin) {
        // Non-admin users don't see any of these elements
        if (viewAsUserDropdownItem) viewAsUserDropdownItem.classList.add("hide");
        if (viewAsAdminDropdownItem) viewAsAdminDropdownItem.classList.add("hide");
        return;
    }
    
    // For admin users or users who were originally admins
    if (viewAsUserDropdownItem && viewAsAdminDropdownItem) {
        if (viewingAsUser && originalIsAdmin) {
            // When viewing as user but originally admin
            viewAsUserDropdownItem.classList.add("hide");
            viewAsAdminDropdownItem.classList.remove("hide");
        } else if (isAdmin && !viewingAsUser) {
            // When in admin mode
            viewAsUserDropdownItem.classList.remove("hide");
            viewAsAdminDropdownItem.classList.add("hide");
        } else {
            // Default state
            viewAsUserDropdownItem.classList.add("hide");
            viewAsAdminDropdownItem.classList.add("hide");
        }
    }
}

//API
const api_key ="http://localhost:5195/api/"
console.log("API base URL:", api_key);
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
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

        if (!email || !password) {
        showErrorPopup("Email và mật khẩu không được để trống");
            return;
        }

    try {
        // Show loading popup
        Swal.fire({
            title: 'Đang kiểm tra...',
            text: 'Vui lòng đợi trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        // 1. Thử đăng nhập với tài khoản người dùng thông thường trước
        const userResponse = await fetch(`${api_key}RegisteredUser/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        // Nếu đăng nhập người dùng thành công
        if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Lưu thông tin phiên làm việc
            sessionStorage.setItem("isAuthenticated", "true");
            sessionStorage.setItem("userId", userData.userId);
            sessionStorage.setItem("username", userData.username);
            sessionStorage.setItem("email", userData.email);
            sessionStorage.setItem("isAdmin", "false");
            sessionStorage.setItem("isModerator", "false");
            
            // Đóng popup loading
            Swal.close();
            
            // Hiển thị thông báo thành công
            showSuccessPopup("Đăng nhập thành công!");
            
            // Chuyển hướng đến trang chính
            setTimeout(() => {
                window.location.href = "forums.html";
            }, 1500);
            
            return;
        }
        /*
        // 2. Nếu không phải người dùng thông thường, thử đăng nhập với tài khoản Moderator
        await new Promise(resolve => setTimeout(resolve, 300));
        const moderatorResponse = await fetch(`${api_key}Moderator/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        // Nếu đăng nhập Moderator thành công
        if (moderatorResponse.ok) {
            const moderatorData = await moderatorResponse.json();
            
            // Lưu thông tin phiên làm việc
            sessionStorage.setItem("isAuthenticated", "true");
            sessionStorage.setItem("userId", moderatorData.userId);
            sessionStorage.setItem("username", moderatorData.username);
            sessionStorage.setItem("email", moderatorData.email);
            sessionStorage.setItem("isAdmin", "false");
            sessionStorage.setItem("isModerator", "true");
            
            // Đóng popup loading
            Swal.close();
            await new Promise(resolve => setTimeout(resolve, 300));
            // Hiển thị thông báo thành công
            showSuccessPopup("Đăng nhập thành công với quyền Moderator!");
            
            // Chuyển hướng đến trang moderator
            setTimeout(() => {
                window.location.href = "moderator.html";
            }, 700);
            
            return;
        }
        */
        // 3. Nếu không phải người dùng thông thường hoặc Moderator, thử đăng nhập với tài khoản Admin
        await new Promise(resolve => setTimeout(resolve, 300));
        const adminResponse = await fetch(`${api_key}Admin/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                adminEmail: email,
                adminPassword: password
            })
        });
        
        // Nếu đăng nhập Admin thành công
        if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            
            // Lưu thông tin phiên làm việc
            sessionStorage.setItem("isAuthenticated", "true");
            sessionStorage.setItem("userId", adminData.userId || adminData.admin.adminId);
            sessionStorage.setItem("username", adminData.username || adminData.admin.username);
            sessionStorage.setItem("email", adminData.email || adminData.admin.email);
            sessionStorage.setItem("isAdmin", "true");
            sessionStorage.setItem("isModerator", "false");
            
            // Đóng popup loading
            Swal.close();
            
            // Hiển thị thông báo thành công
            showSuccessPopup("Đăng nhập thành công với quyền Admin!");
            
            // Chuyển hướng đến trang admin
        setTimeout(() => {
                window.location.href = "admin.html";
            }, 700);
            
            return;
        }
        
        // Nếu tất cả các loại đăng nhập đều thất bại
        Swal.close();
        showErrorPopup("Email hoặc mật khẩu không đúng");

    } catch (error) {
        console.error("Error during login:", error);
        Swal.close();
        showErrorPopup("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
    }
}

// Function to verify admin access
function verifyAdminAccess() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const username = sessionStorage.getItem('username');
    
    if (!isAdmin && username !== 'admin') {
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
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    let isModerator = sessionStorage.getItem('isModerator') === 'true';

    const loginItem = document.getElementById('login-item');
    const logoutItem = document.getElementById('logout-item');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = userProfile ? userProfile.querySelector('.username-display') : null;
    const adminDashboardItem = document.getElementById('admin-dashboard-item');
    const moderatorDashboardItem = document.getElementById('moderator-dashboard-item');

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
        
        // Show admin elements if user is admin
        if (isAdmin) {
            showAdminElements();
            if (adminDashboardItem) adminDashboardItem.classList.remove('hide');
            if (moderatorDashboardItem) moderatorDashboardItem.classList.add('hide');
        } 
        // Show moderator elements if user is moderator
        else if (isModerator) {
            showModeratorElements();
            if (adminDashboardItem) adminDashboardItem.classList.add('hide');
            if (moderatorDashboardItem) moderatorDashboardItem.classList.remove('hide');
        }
        // Regular user
        else {
            if (adminDashboardItem) adminDashboardItem.classList.add('hide');
            if (moderatorDashboardItem) moderatorDashboardItem.classList.add('hide');
        }
    } else {
        // Hiện nút login và ẩn nút logout
        if (loginItem) loginItem.classList.remove('hide');
        if (logoutItem) logoutItem.classList.add('hide');

        // Ẩn user profile
        if (userProfile) {
            userProfile.classList.add('hide');
        }
        
        // Ẩn admin và moderator dashboard
        if (adminDashboardItem) adminDashboardItem.classList.add('hide');
        if (moderatorDashboardItem) moderatorDashboardItem.classList.add('hide');
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
        showErrorPopup("Please fill in all fields.");
        return;
    }

    if (!userId) {
        showErrorPopup("You must be logged in to create a thread.");
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
            const errorData = await response.json();
            console.error("Thread submission failed:", errorData);
            showErrorPopup(errorData.message || "Failed to create thread");
            return;
        }

        const result = await response.json();
        console.log("Thread created successfully:", result);

        // Clear input fields after successful submission
        document.getElementById("thread-title").value = "";
        document.getElementById("thread-content").value = "";

        showSuccessPopup("Thread created successfully!");

        // Immediately update UI with correct username
        addThreadToUI({
            title,
            content,
            categoryName,
            creatorName: username
        });

        // Reload threads to show the new one
        setTimeout(() => {
            fetchThreads();
        }, 1000);

    } catch (error) {
        console.error("Error submitting thread:", error);
        showErrorPopup("A network error occurred. Please try again.");
    }
}

function addThreadToUI(thread) {
    const threadList = document.getElementById("thread-list");
    if (!threadList) {
        console.error("Thread list element not found");
        return;
    }

    const threadElement = document.createElement("div");
    threadElement.classList.add("thread-box");
    threadElement.innerHTML = `
        <h3 class="thread-title">${thread.title}</h3>
        <p class="thread-content">${thread.content}</p>
        <div class="thread-footer">
            <small class="category-name">Category: <strong>${thread.categoryName || "Unknown"}</strong></small>
            <small class="thread-creator">Created by: <strong>${thread.creatorName || "Unknown"}</strong></small>
            ${thread.createdAt ? `<small class="thread-date">Date: <strong>${thread.createdAt}</strong></small>` : ''}
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
        console.log("Fetching threads...");
        const response = await fetch(`${api_key}Thread`);

        if (!response.ok) {
            throw new Error("Failed to fetch threads");
        }

        const threads = await response.json();
        console.log("Threads loaded:", threads);
        
        const threadList = document.getElementById("thread-list");
        if (!threadList) {
            console.error("Thread list element not found");
            return;
        }
        
        threadList.innerHTML = ""; // Clear previous threads

        threads.forEach(thread => {
            addThreadToUI({
                title: thread.title,
                content: thread.content,
                categoryName: thread.categoryName,
                creatorName: thread.creatorName || "Unknown",
                createdAt: new Date(thread.createdAt).toLocaleString()
            });
        });
    } catch (error) {
        console.error("Error loading threads:", error);
        showErrorPopup("Failed to load threads. Please try again later.");
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
    console.log("Checking if user is admin for category button...");
    let isAdmin = sessionStorage.getItem("isAdmin") === "true";
    let username = sessionStorage.getItem("username");
    
    console.log("Current user:", username, "isAdmin:", isAdmin);
    
    const addCategorySection = document.getElementById("add-category-section");
    if (!addCategorySection) {
        console.error("Add category section element not found");
        return;
    }
    
    if (isAdmin || username === "admin") {
        console.log("User is admin, showing category button");
        addCategorySection.classList.remove("hide");
    } else {
        console.log("User is not admin, hiding category button");
        addCategorySection.classList.add("hide");
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
        console.log("Loading categories...");
        const response = await fetch(`${api_key}Category`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        const categories = await response.json();
        console.log("Categories loaded:", categories);
        
        // Update the category list on the Categories page
        const categoryList = document.getElementById("category-list");
        const categoryContainer = document.getElementById("category-container");
        
        // Check if we're on the categories page
        if (categoryList) {
            categoryList.innerHTML = ""; // Clear list before adding
            
            // Check if user is admin
            const isAdmin = sessionStorage.getItem("isAdmin") === "true" || 
                           sessionStorage.getItem("username") === "admin";
            
            categories.forEach(category => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="category-name">${category.name}</span>
                    ${isAdmin ? 
                        `<button class="delete-btn" onclick="deleteCategory(${category.categoryId})">Delete</button>` : 
                        ''}
                `;
                categoryList.appendChild(li);
            });
        }
        
        // If there's a category container (for displaying in a grid or other format)
        if (categoryContainer) {
            categoryContainer.innerHTML = ""; // Clear container
            
            categories.forEach(category => {
                const categoryBox = document.createElement("div");
                categoryBox.classList.add("category-box");
                categoryBox.innerHTML = `
                    <h3>${category.name}</h3>
                    <button onclick="viewCategory(${category.categoryId})">View Threads</button>
                `;
                categoryContainer.appendChild(categoryBox);
            });
        }
        
        console.log("Categories displayed successfully");
    } catch (error) {
        console.error("❌ Error loading categories:", error);
        showErrorPopup("Failed to load categories. Please try again later.");
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
    let isAdmin = sessionStorage.getItem("isAdmin") === "true";
    let username = sessionStorage.getItem("username");

    if (!isAdmin && username !== "admin") {
        showErrorPopup("Only Admin can create categories.");
        return;
    }

    if (!categoryName) {
        showErrorPopup("Category name cannot be empty.");
        return;
    }

    try {
        console.log(`🆕 Attempting to add category: ${categoryName}`);
        
        const response = await fetch(`${api_key}Category/Insert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: categoryName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to create category:", errorData);
            showErrorPopup(errorData.message || "Failed to create category");
            return;
        }

        const data = await response.json();
        console.log("Category created successfully:", data);

        showSuccessPopup(data.message || "Category created successfully!");
        
        // Clear input field
        document.getElementById("category-name").value = "";
        
        // Reload categories
        await loadCategories();
        await loadCategoryDropdown();

        closeCategoryBox();
    } catch (error) {
        console.error("Error creating category:", error);
        showErrorPopup("Failed to create category. Please try again.");
    }
}

// Delete category
function deleteCategory(categoryId) {
    Swal.fire({
        title: 'Delete Category',
        text: 'Are you sure you want to delete this category? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        background: '#111314',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const deleteResponse = await fetch(`${api_key}Category/Delete/${categoryId}`, {
            method: "DELETE"
        });

                if (!deleteResponse.ok) {
                    const errorData = await deleteResponse.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${deleteResponse.status}`);
                }
                
                showSuccessPopup("Category deleted successfully");
                
                // Reload categories based on current page
                if (window.location.href.includes('admin.html')) {
                    loadCategoriesForAdmin();
                } else {
                    loadCategories();
                }
    } catch (error) {
                console.error("Error deleting category:", error);
                showErrorPopup(`Failed to delete category: ${error.message}`);
    }
        }
    });
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

        // Add categories to dropdown
        categories.forEach(category => {
            if (category.categoryId && category.name) {
                console.log(`📌 Adding category: ID=${category.categoryId}, Name=${category.name}`);
                const option = document.createElement("option");
                option.value = category.categoryId;
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

// Function to show admin elements
function showAdminElements() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const viewingAsUser = sessionStorage.getItem('viewingAsUser') === 'true';
    
    // Get all admin-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    const adminDashboardItem = document.getElementById('admin-dashboard-item');
    const adminDashboardDropdown = document.getElementById('admin-dashboard-dropdown');
    const moderatorPanelItem = document.getElementById('moderator-panel-item');
    const moderatorPanelDropdown = document.getElementById('moderator-panel-dropdown');
    const adminPanelItem = document.getElementById('admin-panel-item');
    const adminPanelDropdown = document.getElementById('admin-panel-dropdown');
    const viewAsUserMenuItem = document.getElementById('view-as-user-menu-item');
    const viewAsUserDropdown = document.getElementById('view-as-user-dropdown-item');
    const viewAsAdminMenuItem = document.getElementById('view-as-admin-menu-item');
    const viewAsAdminDropdown = document.getElementById('view-as-admin-dropdown-item');

    // Check if we're on the moderator page
    const isModeratorPage = window.location.href.includes('moderator.html');
    // Check if we're on the admin page
    const isAdminPage = window.location.href.includes('admin.html');

    if (isAdmin && !viewingAsUser) {
        // Show admin elements
        adminElements.forEach(element => element.classList.remove('hide'));
        
        // Show/hide navigation items based on current page
        if (adminDashboardItem) adminDashboardItem.classList.toggle('hide', isAdminPage);
        if (adminDashboardDropdown) adminDashboardDropdown.classList.toggle('hide', isAdminPage);
        if (moderatorPanelItem) moderatorPanelItem.classList.toggle('hide', isModeratorPage);
        if (moderatorPanelDropdown) moderatorPanelDropdown.classList.toggle('hide', isModeratorPage);
        if (adminPanelItem) adminPanelItem.classList.toggle('hide', !isModeratorPage);
        if (adminPanelDropdown) adminPanelDropdown.classList.toggle('hide', !isModeratorPage);
        
        // Always show view as user options for admin
        if (viewAsUserMenuItem) viewAsUserMenuItem.classList.remove('hide');
        if (viewAsUserDropdown) viewAsUserDropdown.classList.remove('hide');
        if (viewAsAdminMenuItem) viewAsAdminMenuItem.classList.add('hide');
        if (viewAsAdminDropdown) viewAsAdminDropdown.classList.add('hide');
    } else if (viewingAsUser && (sessionStorage.getItem("originalIsAdmin") === "true")) {
        // Hide admin elements when viewing as user
        adminElements.forEach(element => element.classList.add('hide'));
        if (adminDashboardItem) adminDashboardItem.classList.add('hide');
        if (adminDashboardDropdown) adminDashboardDropdown.classList.add('hide');
        if (moderatorPanelItem) moderatorPanelItem.classList.add('hide');
        if (moderatorPanelDropdown) moderatorPanelDropdown.classList.add('hide');
        if (adminPanelItem) adminPanelItem.classList.add('hide');
        if (adminPanelDropdown) adminPanelDropdown.classList.add('hide');
        if (viewAsUserMenuItem) viewAsUserMenuItem.classList.add('hide');
        if (viewAsUserDropdown) viewAsUserDropdown.classList.add('hide');
        
        // Show view as admin options
        if (viewAsAdminMenuItem) viewAsAdminMenuItem.classList.remove('hide');
        if (viewAsAdminDropdown) viewAsAdminDropdown.classList.remove('hide');
    } else {
        // Hide all admin elements for non-admin users
        adminElements.forEach(element => element.classList.add('hide'));
        if (adminDashboardItem) adminDashboardItem.classList.add('hide');
        if (adminDashboardDropdown) adminDashboardDropdown.classList.add('hide');
        if (moderatorPanelItem) moderatorPanelItem.classList.add('hide');
        if (moderatorPanelDropdown) moderatorPanelDropdown.classList.add('hide');
        if (adminPanelItem) adminPanelItem.classList.add('hide');
        if (adminPanelDropdown) adminPanelDropdown.classList.add('hide');
        if (viewAsUserMenuItem) viewAsUserMenuItem.classList.add('hide');
        if (viewAsUserDropdown) viewAsUserDropdown.classList.add('hide');
        if (viewAsAdminMenuItem) viewAsAdminMenuItem.classList.add('hide');
        if (viewAsAdminDropdown) viewAsAdminDropdown.classList.add('hide');
    }
}

// Function to view site as a regular user (for admins and moderators)
function viewAsUser() {
    console.log("Switching to user view mode");
    
    // Store original status
    if (sessionStorage.getItem("isAdmin") === "true") {
        sessionStorage.setItem("originalIsAdmin", "true");
    }
    if (sessionStorage.getItem("isModerator") === "true") {
        sessionStorage.setItem("originalIsModerator", "true");
    }
    
    // Set viewing as user flag
    sessionStorage.setItem("viewingAsUser", "true");
    
    // Temporarily set admin and moderator status to false
    sessionStorage.setItem("isAdmin", "false");
    sessionStorage.setItem("isModerator", "false");
    
    // Show success message
    showSuccessPopup("Now viewing site as a regular user");
    
    // Check if we're on the admin or moderator page
    const isAdminPage = window.location.href.includes("admin.html");
    const isModeratorPage = window.location.href.includes("moderator.html");
    
    if (isAdminPage || isModeratorPage) {
        // If on admin or moderator page, redirect to forums
        setTimeout(() => {
            window.location.href = "forums.html";
        }, 1000);
        return;
    }

    // Update UI without reloading
    updateNavBar();
    showCategoryButton();
    
    if (sessionStorage.getItem("originalIsAdmin") === "true") {
        showAdminElements();
    } else if (sessionStorage.getItem("originalIsModerator") === "true") {
        showModeratorElements();
    }
    
    updateViewModeIndicator();
    
    // Hide admin-only and moderator-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.classList.add('hide');
    });
    
    const moderatorElements = document.querySelectorAll('.moderator-only');
    moderatorElements.forEach(element => {
        element.classList.add('hide');
    });
}

// Function to switch back to moderator view
function viewAsModerator() {
    console.log("Switching back to moderator view mode");
    
    // Restore original moderator status
    sessionStorage.setItem("isModerator", sessionStorage.getItem("originalIsModerator"));
    sessionStorage.setItem("isAdmin", "false");
    
    // Remove viewing as user flag
    sessionStorage.removeItem("viewingAsUser");
    
    // Show success message
    showSuccessPopup("Returned to moderator view");
    
    // Update UI without reloading
    updateNavBar();
    showCategoryButton();
    showModeratorElements();
    updateViewModeIndicator();
    
    // Show moderator-only elements
    const moderatorElements = document.querySelectorAll('.moderator-only');
    moderatorElements.forEach(element => {
        element.classList.remove('hide');
    });
}

// Function to switch back to admin view
function viewAsAdmin() {
    console.log("Switching back to admin view mode");
    
    // Check if user was originally a moderator
    if (sessionStorage.getItem("originalIsModerator") === "true" && 
        sessionStorage.getItem("originalIsAdmin") !== "true") {
        viewAsModerator();
        return;
    }
    
    // Restore original admin status
    sessionStorage.setItem("isAdmin", sessionStorage.getItem("originalIsAdmin") || "true");
    
    // Remove viewing as user flag
    sessionStorage.removeItem("viewingAsUser");
    
    // Show success message
    showSuccessPopup("Returned to admin view");
    
    // Check if we're already on the admin page
    const isAdminPage = window.location.href.includes("admin.html");
    
    if (!isAdminPage) {
        // Redirect to admin page after a short delay
        setTimeout(() => {
            window.location.href = "admin.html";
        }, 1000);
        return;
    }
    
    // Update UI without reloading if already on admin page
    updateNavBar();
    showCategoryButton();
    showAdminElements();
    updateViewModeIndicator();
    
    // Show admin-only elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.classList.remove('hide');
    });
}

// Admin Panel Functions
async function loadCategoriesForAdmin() {
    try {
        console.log("Loading categories for admin...");
        const response = await fetch(`${api_key}Category`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log("Categories loaded:", categories);
        
        const categoriesList = document.getElementById("categories-list");
        if (!categoriesList) {
            console.error("Categories list element not found");
            return;
        }
        
        categoriesList.innerHTML = "";
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <tr>
                    <td colspan="3" class="no-results">
                        <i class="fa fa-info-circle"></i> No categories found
                    </td>
                </tr>
            `;
            return;
        }
        
        categories.forEach(category => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.categoryId}</td>
                <td>${category.name}</td>
                <td>
                    <button class="edit-btn" onclick="editCategory(${category.categoryId}, '${category.name}')">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteCategory(${category.categoryId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            categoriesList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        showErrorPopup("Failed to load categories. Please try again later.");
    }
}

// Load categories for moderator panel
async function loadCategoriesForModerator() {
    try {
        console.log("Loading categories for moderator...");
        const response = await fetch(`${api_key}Category`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log("Categories loaded for moderator:", categories);
        
        const categoriesList = document.getElementById("moderator-categories-list");
        if (!categoriesList) {
            console.error("Moderator categories list element not found");
            return;
        }
        
        categoriesList.innerHTML = "";
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <tr>
                    <td colspan="3" class="no-results">
                        <i class="fa fa-info-circle"></i> No categories found
                    </td>
                </tr>
            `;
            return;
        }
        
        categories.forEach(category => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.categoryId}</td>
                <td>${category.name}</td>
                <td>
                    <button class="edit-btn" onclick="showEditCategoryForm(${category.categoryId}, '${category.name.replace(/'/g, "\\'")}')">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteCategoryFromModerator(${category.categoryId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            categoriesList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading categories for moderator:", error);
        showErrorPopup("Failed to load categories. Please try again later.");
    }
}

// Load regular users for moderator panel
async function loadRegularUsersForModerator() {
    console.log("Loading regular users for moderator panel...");
    
    try {
        const regularUsersList = document.getElementById("regular-users-list");
        if (!regularUsersList) {
            console.error("Regular users list element not found");
            return;
        }
        
        regularUsersList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Loading users...</p>
                </td>
            </tr>
        `;
        
        // In a real application, you would fetch users from your API
        // For this example, we'll simulate a delay and show sample data
        setTimeout(() => {
            regularUsersList.innerHTML = `
                <tr>
                    <td>3</td>
                    <td>user1</td>
                    <td>user1@example.com</td>
                    <td>2023-03-10</td>
                    <td>15</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editRegularUserFromModerator(3)">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteRegularUserFromModerator(3)">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
                <tr>
                    <td>6</td>
                    <td>user2</td>
                    <td>user2@example.com</td>
                    <td>2023-04-22</td>
                    <td>7</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editRegularUserFromModerator(6)">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteRegularUserFromModerator(6)">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
                <tr>
                    <td>7</td>
                    <td>user3</td>
                    <td>user3@example.com</td>
                    <td>2023-05-15</td>
                    <td>3</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editRegularUserFromModerator(7)">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteRegularUserFromModerator(7)">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        }, 800);
    } catch (error) {
        console.error("Error loading regular users for moderator:", error);
        showErrorPopup("Failed to load users. Please try again later.");
    }
}

// Load posts for moderator panel
async function loadPostsForModerator() {
    try {
        console.log("Loading posts for moderator...");
        
        // Lấy danh sách bài viết
        const postsResponse = await fetch(`${api_key}Post`);
        if (!postsResponse.ok) {
            throw new Error(`HTTP error! Status: ${postsResponse.status}`);
        }
        const posts = await postsResponse.json();
        
        // Lấy danh sách người dùng để hiển thị tên
        const usersResponse = await fetch(`${api_key}RegisteredUser`);
        if (!usersResponse.ok) {
            throw new Error(`HTTP error! Status: ${usersResponse.status}`);
        }
        const users = await usersResponse.json();
        
        // Lấy danh sách moderator
        const moderatorsResponse = await fetch(`${api_key}Moderator`);
        if (!moderatorsResponse.ok) {
            throw new Error(`HTTP error! Status: ${moderatorsResponse.status}`);
        }
        const moderators = await moderatorsResponse.json();
        
        // Tạo map để tra cứu nhanh
        const userMap = {};
        users.forEach(user => {
            userMap[user.regUserId] = user;
        });
        
        const moderatorMap = {};
        moderators.forEach(mod => {
            moderatorMap[mod.modId] = mod;
        });
        
        console.log("Posts loaded:", posts);
        
        const postsList = document.getElementById("moderator-posts-list");
        if (!postsList) {
            console.error("Moderator posts list element not found");
            return;
        }
        
        postsList.innerHTML = "";
        
        if (posts.length === 0) {
            postsList.innerHTML = `
                <tr>
                    <td colspan="5" class="no-results">
                        <i class="fa fa-info-circle"></i> No posts found
                    </td>
                </tr>
            `;
            return;
        }
        
        posts.forEach(post => {
            // Xác định tác giả của bài viết
            let authorName = "Unknown";
            let authorType = "";
            
            if (post.regUserId && userMap[post.regUserId]) {
                authorName = userMap[post.regUserId].username;
                authorType = "User";
            } else if (post.modId && moderatorMap[post.modId]) {
                authorName = moderatorMap[post.modId].username;
                authorType = "Moderator";
            }
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${post.postId}</td>
                <td>${post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}</td>
                <td>
                    ${authorName}
                    <small>(${authorType})</small>
                </td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" onclick="editPostFromModerator(${post.postId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deletePostFromModerator(${post.postId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            postsList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading posts for moderator:", error);
        showErrorPopup("Failed to load posts. Please try again later.");
    }
}

// Delete category from moderator panel
async function deleteCategoryFromModerator(categoryId) {
    // Confirm deletion
    const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        background: '#111314',
        color: '#fff'
    });

    if (!confirmDelete.isConfirmed) {
        return;
    }

    try {
        // Show loading
        Swal.fire({
            title: 'Deleting category...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#111314',
            color: '#fff'
        });
        
        const response = await fetch(`${api_key}Category/Delete/${categoryId}`, {
            method: "DELETE"
        });
        
        // Close loading
        Swal.close();

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to delete category:", errorText);
            showErrorPopup("Failed to delete category. It may be in use by threads.");
            return;
        }
        
        const result = await response.json();
        console.log("Category deleted successfully:", result);
        
        showSuccessPopup(result.message || "Category deleted successfully");
        
        // Reload categories
        await loadCategoriesForModerator();
    } catch (error) {
        Swal.close();
        console.error("Error deleting category:", error);
        showErrorPopup("Failed to delete category. Please try again.");
    }
}

// Edit regular user from moderator panel
function editRegularUserFromModerator(userId) {
    // Get user data (in a real app, you would fetch this from the server)
    let userData = {
        id: userId,
        username: `user${userId - 2}`,
        email: `user${userId - 2}@example.com`
    };
    
    Swal.fire({
        title: 'Edit User',
        html: `
            <input id="edit-user-username" class="swal2-input" value="${userData.username}" placeholder="Username">
            <input id="edit-user-email" class="swal2-input" value="${userData.email}" placeholder="Email">
            <input id="edit-user-password" type="password" class="swal2-input" placeholder="New Password (leave empty to keep current)">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        cancelButtonText: 'Cancel',
        background: '#111314',
        color: '#fff',
        preConfirm: () => {
            const username = document.getElementById('edit-user-username').value;
            const email = document.getElementById('edit-user-email').value;
            
            if (!username || !email) {
                Swal.showValidationMessage('Username and email are required');
                return false;
            }
            
            return { username, email };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Simulate updating user
            showSuccessPopup('User updated successfully!');
            loadRegularUsersForModerator();
        }
    });
}

// Delete regular user from moderator panel
function deleteRegularUserFromModerator(userId) {
    Swal.fire({
        title: 'Delete User',
        text: 'Are you sure you want to delete this user? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        background: '#111314',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            // Simulate deleting user
            showSuccessPopup('User deleted successfully!');
            loadRegularUsersForModerator();
        }
    });
}

// Edit post from moderator panel
function editPostFromModerator(postId) {
    // Get post data (in a real app, you would fetch this from the server)
    let postData = {
        id: postId,
        title: postId === 1 ? 'Welcome to the Forum' : (postId === 2 ? 'How to use the forum' : 'My first post'),
        content: 'This is the post content...',
        category: postId === 1 ? 'General' : (postId === 2 ? 'Help' : 'Introductions')
    };
    
    Swal.fire({
        title: 'Edit Post',
        html: `
            <input id="edit-post-title" class="swal2-input" value="${postData.title}" placeholder="Post Title">
            <textarea id="edit-post-content" class="swal2-textarea" placeholder="Post Content">${postData.content}</textarea>
            <select id="edit-post-category" class="swal2-select">
                <option value="1" ${postData.category === 'General' ? 'selected' : ''}>General</option>
                <option value="2" ${postData.category === 'Help' ? 'selected' : ''}>Help</option>
                <option value="3" ${postData.category === 'Introductions' ? 'selected' : ''}>Introductions</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        cancelButtonText: 'Cancel',
        background: '#111314',
        color: '#fff',
        preConfirm: () => {
            const title = document.getElementById('edit-post-title').value;
            const content = document.getElementById('edit-post-content').value;
            
            if (!title || !content) {
                Swal.showValidationMessage('Title and content are required');
                return false;
            }
            
            return { title, content };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Simulate updating post
            showSuccessPopup('Post updated successfully!');
            loadPostsForModerator();
        }
    });
}

// Delete post from moderator panel
function deletePostFromModerator(postId) {
    Swal.fire({
        title: 'Delete Post',
        text: 'Are you sure you want to delete this post? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        background: '#111314',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            // Simulate deleting post
            showSuccessPopup('Post deleted successfully!');
            loadPostsForModerator();
        }
    });
}

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

// Load admins for admin panel
async function loadAdminsForAdmin(statusFilter = "all") {
    try {
        console.log(`Loading admins with status filter: ${statusFilter}...`);
        const response = await fetch(`${api_key}Admin/GetList`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const admins = await response.json();
        console.log("Admins loaded:", admins);
        
        const adminsList = document.getElementById("admins-list");
        if (!adminsList) {
            console.error("Admin list element not found");
            return;
        }
        
        adminsList.innerHTML = "";
        
        // Lọc admin theo trạng thái nếu cần
        let filteredAdmins = admins;
        if (statusFilter !== "all") {
            filteredAdmins = admins.filter(admin => 
                (statusFilter === "active" && admin.status === "Active") || 
                (statusFilter === "inactive" && admin.status === "Inactive")
            );
        }
        
        if (filteredAdmins.length === 0) {
            adminsList.innerHTML = `
                <tr>
                    <td colspan="5" class="no-results">
                        <i class="fa fa-info-circle"></i> No admins found with status: ${statusFilter}
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredAdmins.forEach(admin => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${admin.adminId}</td>
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td>${new Date(admin.joinDate).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" onclick="editAdmin(${admin.adminId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteAdmin(${admin.adminId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                    <span class="status-badge ${admin.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        ${admin.status || 'Active'}
                    </span>
                </td>
            `;
            adminsList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading admins:", error);
        showErrorPopup("Failed to load admins. Please try again later.");
    }
}

// Show add admin form
function showAddAdminForm() {
    Swal.fire({
        title: 'Add New Admin',
        html: `
            <div class="swal2-input-container">
                <input id="add-admin-username" class="swal2-input" placeholder="Username">
                <input id="add-admin-email" class="swal2-input" placeholder="Email">
                <input id="add-admin-password" class="swal2-input" type="text" placeholder="Password">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add',
        cancelButtonText: 'Cancel',
        background: '#111314',
        color: '#fff',
        preConfirm: () => {
            const username = document.getElementById('add-admin-username').value;
            const email = document.getElementById('add-admin-email').value;
            const password = document.getElementById('add-admin-password').value;
            
            if (!username || !email || !password) {
                Swal.showValidationMessage('All fields are required');
                return false;
            }
            
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            submitAdmin();
        }
    });
}

// Submit new admin
async function submitAdmin() {
    try {
        // Lấy giá trị từ form
        const username = document.getElementById('add-admin-username').value;
        const email = document.getElementById('add-admin-email').value;
        const password = document.getElementById('add-admin-password').value;
        const status = "Active"; // Mặc định là Active

        // Kiểm tra dữ liệu
        if (!username || !email || !password) {
            showErrorPopup("All fields are required");
            return;
        }

        // Hiển thị loading
        Swal.fire({
            title: 'Adding admin...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Tạo URL với query parameters thay vì gửi JSON body
        const url = new URL(`${api_key}Admin/Insert`);
        url.searchParams.append('adminUsername', username);
        url.searchParams.append('adminEmail', email);
        url.searchParams.append('adminPassword', password);
        url.searchParams.append('adminStatus', status);

        // Gửi request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Đóng loading
        Swal.close();

        // Xử lý kết quả
        if (response.ok) {
            const data = await response.json();
            showSuccessPopup("Admin added successfully");
            // Không cần gọi closeForm vì form đã được đóng bởi SweetAlert2
            loadAdminsForAdmin();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error adding admin:", error);
        showErrorPopup(`Failed to add admin: ${error.message}`);
    }
}

// Edit admin
async function editAdmin(adminId) {
    try {
        // Lấy thông tin admin hiện tại
        const response = await fetch(`${api_key}Admin/GetById/${adminId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const admin = await response.json();
        
        // Hiển thị form chỉnh sửa với SweetAlert2
        Swal.fire({
            title: 'Edit Admin',
            html: `
                <div class="swal2-input-container">
                    <input id="edit-admin-username" class="swal2-input" placeholder="Username" value="${admin.username || ''}">
                    <input id="edit-admin-email" class="swal2-input" placeholder="Email" value="${admin.email || ''}">
                    <input id="edit-admin-password" class="swal2-input" type="text" placeholder="Password" value="${admin.password || ''}">
                    <select id="edit-admin-status" class="swal2-select">
                        <option value="Active" ${admin.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${admin.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel',
            background: '#111314',
            color: '#fff',
            preConfirm: () => {
                const username = document.getElementById('edit-admin-username').value;
                const email = document.getElementById('edit-admin-email').value;
                const password = document.getElementById('edit-admin-password').value;
                const status = document.getElementById('edit-admin-status').value;
                
                if (!username || !email || !password) {
                    Swal.showValidationMessage('All fields are required');
                    return false;
                }
                
                return true;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Lấy giá trị từ form
                const username = document.getElementById('edit-admin-username').value;
                const email = document.getElementById('edit-admin-email').value;
                const password = document.getElementById('edit-admin-password').value;
                const status = document.getElementById('edit-admin-status').value;
                
                // Hiển thị loading
                Swal.fire({
                    title: 'Updating admin...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                try {
                    // Tạo URL với query parameters
                    const url = new URL(`${api_key}Admin/Update/${adminId}`);
                    url.searchParams.append('adminUsername', username);
                    url.searchParams.append('adminEmail', email);
                    url.searchParams.append('adminPassword', password);
                    url.searchParams.append('adminStatus', status);
                    
                    // Gửi request
                    const updateResponse = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    // Đóng loading
                    Swal.close();
                    
                    // Xử lý kết quả
                    if (updateResponse.ok) {
                        showSuccessPopup("Admin updated successfully");
                        loadAdminsForAdmin();
                    } else {
                        const errorData = await updateResponse.json();
                        throw new Error(errorData.message || `HTTP error! Status: ${updateResponse.status}`);
                    }
                } catch (error) {
                    console.error("Error updating admin:", error);
                    showErrorPopup(`Failed to update admin: ${error.message}`);
                }
            }
        });
    } catch (error) {
        console.error("Error fetching admin details:", error);
        showErrorPopup(`Failed to fetch admin details: ${error.message}`);
    }
}

// Delete admin
async function deleteAdmin(adminId) {
    try {
        // Confirm deletion
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (!result.isConfirmed) return;
        
        // Show loading
        Swal.fire({
            title: 'Deleting admin...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const response = await fetch(`${api_key}Admin/Delete/${adminId}`, {
            method: 'DELETE'
        });
        
        // Close loading
        Swal.close();

        // Handle 404 Not Found specifically for when admin doesn't exist
        if (response.status === 404) {
            Swal.fire({
                icon: 'error',
                title: 'Admin Not Found',
                text: 'The admin you are trying to delete does not exist or has already been deleted.',
                confirmButtonText: 'OK'
            });
            // Reload admins list to refresh the data
            loadAdminsForAdmin();
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! Status: ${response.status}`);
        }
        
        console.log("Admin deleted successfully");
        
        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Admin has been deleted.',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Reload admins list
        loadAdminsForAdmin();
        
    } catch (error) {
        console.error("Error deleting admin:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to delete admin: ${error.message}`
        });
    }
}

// ==================== ADMIN PANEL SEARCH FUNCTIONS ====================

// Search categories
async function searchCategories() {
    try {
        const searchTerm = document.getElementById('category-search').value.trim();
        const categoriesList = document.getElementById('categories-list');
        
        if (!categoriesList) {
            console.error("Categories list element not found");
            return;
        }
        
        // Show loading indicator
        categoriesList.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Searching categories...</p>
                </td>
            </tr>
        `;
        
        // If search term is empty, load all categories
        if (searchTerm === '') {
            loadCategoriesForAdmin();
            return;
        }
        
        // Call the search API endpoint
        const response = await fetch(`${api_key}Category/Search?term=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const categories = await response.json();
        
        // Clear loading indicator
        categoriesList.innerHTML = "";
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <tr id="no-results-categories">
                    <td colspan="3" class="no-results">
                        <i class="fa fa-search"></i> No categories found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display the search results
        categories.forEach(category => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.categoryId}</td>
                <td>${category.name}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editCategoryFromAdmin(${category.categoryId}, '${category.name}')">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCategoryFromAdmin(${category.categoryId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            categoriesList.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error searching categories:", error);
        const categoriesList = document.getElementById('categories-list');
        if (categoriesList) {
            categoriesList.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px;">
                        <p>Error searching categories: ${error.message}</p>
                        <button onclick="searchCategories()">Try Again</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Search admins
async function searchAdmins() {
    try {
        const searchInput = document.getElementById('admin-search');
        if (!searchInput) {
            console.error("Admin search input not found");
            return;
        }
        
        const searchTerm = searchInput.value.trim();
        const adminsList = document.getElementById('admins-list');
        
        if (!adminsList) {
            console.error("Admins list element not found");
            return;
        }
        
        // Show loading indicator
        adminsList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Searching admins...</p>
                </td>
            </tr>
        `;
        
        // If search term is empty, load all admins
        if (searchTerm === '') {
            loadAdminsForAdmin();
            return;
        }
        
        // Add a delay of 0.3 seconds before sending the request
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Call the search API endpoint
        const response = await fetch(`${api_key}Admin/GetByName/${encodeURIComponent(searchTerm)}`);
        
        // Handle 404 Not Found specifically for when admin doesn't exist
        if (response.status === 404) {
            adminsList.innerHTML = `
                <tr id="no-results-admins">
                    <td colspan="5" class="no-results">
                        <i class="fa fa-search"></i> Admin not found!
                    </td>
                </tr>
            `;
            return;
        }
        
        // Handle other error responses
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        let admins = await response.json();
        
        // Clear loading indicator
        adminsList.innerHTML = "";
        
        // Check if the response is null, undefined, or empty object
        if (!admins || Object.keys(admins).length === 0) {
            adminsList.innerHTML = `
                <tr id="no-results-admins">
                    <td colspan="5" class="no-results">
                        <i class="fa fa-search"></i> Admin not found!
                    </td>
                </tr>
            `;
            return;
        }
        
        // Check if the response is a single object (not an array)
        if (admins && !Array.isArray(admins)) {
            // Convert single object to array
            admins = [admins];
        }
        
        // Check if admins array is empty
        if (admins.length === 0) {
            adminsList.innerHTML = `
                <tr id="no-results-admins">
                    <td colspan="5" class="no-results">
                        <i class="fa fa-search"></i> Admin not found!
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display the admins
        admins.forEach(admin => {
            const formattedDate = new Date(admin.dateAdded).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            adminsList.innerHTML += `
                <tr>
                    <td>${admin.adminId}</td>
                    <td>${admin.username}</td>
                    <td>${admin.email}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editAdmin(${admin.adminId})">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteAdmin(${admin.adminId})">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error searching admins:", error);
        
        const adminsList = document.getElementById('admins-list');
        if (adminsList) {
            adminsList.innerHTML = `
                <tr>
                    <td colspan="5" class="error-message">
                        <i class="fa fa-exclamation-triangle"></i>
                        Error searching admins: ${error.message}
                        <button onclick="searchAdmins()">Try Again</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Search moderators
async function searchModerators() {
    try {
        const searchTerm = document.getElementById('moderator-search').value.trim();
        const moderatorsList = document.getElementById('moderators-list');
        
        if (!moderatorsList) {
            console.error("Moderators list element not found");
            return;
        }
        
        // Show loading indicator
        moderatorsList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Searching moderators...</p>
                </td>
            </tr>
        `;
        
        // If search term is empty, load all moderators
        if (searchTerm === '') {
            loadModeratorsForAdmin();
            return;
        }
        
        // Call the search API endpoint
        const response = await fetch(`${api_key}Moderator/Search?term=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const moderators = await response.json();
        
        // Clear loading indicator
        moderatorsList.innerHTML = "";
        
        if (moderators.length === 0) {
            moderatorsList.innerHTML = `
                <tr id="no-results-moderators">
                    <td colspan="5" class="no-results">
                        <i class="fa fa-search"></i> No moderators found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display the search results
        moderators.forEach(moderator => {
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${moderator.moderatorId}</td>
                <td>${moderator.username}</td>
                <td>${moderator.email}</td>
                <td>${moderator.assignedCategories || 'None'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editModerator(${moderator.moderatorId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteModerator(${moderator.moderatorId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            moderatorsList.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error searching moderators:", error);
        const moderatorsList = document.getElementById('moderators-list');
        if (moderatorsList) {
            moderatorsList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        <p>Error searching moderators: ${error.message}</p>
                        <button onclick="searchModerators()">Try Again</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Search users
async function searchUsers() {
    try {
        const searchTerm = document.getElementById('user-search').value.trim();
        const usersList = document.getElementById('regular-users-list');
        
        if (!usersList) {
            console.error("Users list element not found");
            return;
        }
        
        // Show loading indicator
        usersList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Searching users...</p>
                </td>
            </tr>
        `;
        
        // If search term is empty, load all users
        if (searchTerm === '') {
            loadRegularUsersForAdmin();
            return;
        }
        
        // Call the search API endpoint
        const response = await fetch(`${api_key}User/Search?term=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const users = await response.json();
        
        // Clear loading indicator
        usersList.innerHTML = "";
        
        if (users.length === 0) {
            usersList.innerHTML = `
                <tr id="no-results-users">
                    <td colspan="6" class="no-results">
                        <i class="fa fa-search"></i> No users found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display the search results
        users.forEach(user => {
            const row = document.createElement("tr");
            
            // Format date
            const joinDate = new Date(user.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${user.userId}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${joinDate}</td>
                <td>${user.postCount || 0}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editUser(${user.userId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteUser(${user.userId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                    <button class="action-btn promote-btn" onclick="promoteUser(${user.userId})">
                        <i class="fa fa-arrow-up"></i> Promote
                    </button>
                </td>
            `;
            usersList.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error searching users:", error);
        const usersList = document.getElementById('regular-users-list');
        if (usersList) {
            usersList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        <p>Error searching users: ${error.message}</p>
                        <button onclick="searchUsers()">Try Again</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Search posts
async function searchPosts() {
    try {
        const searchTerm = document.getElementById('post-search').value.trim();
        const postsList = document.getElementById('posts-list');
        
        if (!postsList) {
            console.error("Posts list element not found");
            return;
        }
        
        // Show loading indicator
        postsList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner"></div>
                    <p>Searching posts...</p>
                </td>
            </tr>
        `;
        
        // If search term is empty, load all posts
        if (searchTerm === '') {
            loadPostsForAdmin();
            return;
        }
        
        // Call the search API endpoint
        const response = await fetch(`${api_key}Post/Search?term=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // Clear loading indicator
        postsList.innerHTML = "";
        
        if (posts.length === 0) {
            postsList.innerHTML = `
                <tr id="no-results-posts">
                    <td colspan="6" class="no-results">
                        <i class="fa fa-search"></i> No posts found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }
        
        // Display the search results
        posts.forEach(post => {
            const row = document.createElement("tr");
            
            // Format date
            const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            row.innerHTML = `
                <td>${post.postId}</td>
                <td>${post.title}</td>
                <td>${post.authorName}</td>
                <td>${post.categoryName}</td>
                <td>${postDate}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editPost(${post.postId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePost(${post.postId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            postsList.appendChild(row);
        });
        
    } catch (error) {
        console.error("Error searching posts:", error);
        const postsList = document.getElementById('posts-list');
        if (postsList) {
            postsList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        <p>Error searching posts: ${error.message}</p>
                        <button onclick="searchPosts()">Try Again</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Add event listeners for search input fields
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for Enter key on search inputs
    const searchInputs = document.querySelectorAll('.admin-search input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // Trigger the corresponding search function
                const inputId = this.id;
                if (inputId === 'category-search') searchCategories();
                else if (inputId === 'admin-search') searchAdmins();
                else if (inputId === 'moderator-search') searchModerators();
                else if (inputId === 'user-search') searchUsers();
                else if (inputId === 'post-search') searchPosts();
            }
        });
    });
});

// Cập nhật hàm loadPostsForAdmin để hiển thị tên người dùng
async function loadPostsForAdmin() {
    try {
        console.log("Loading posts for admin...");
        
        // Lấy danh sách bài viết
        const postsResponse = await fetch(`${api_key}Post`);
        if (!postsResponse.ok) {
            throw new Error(`HTTP error! Status: ${postsResponse.status}`);
        }
        const posts = await postsResponse.json();
        
        // Lấy danh sách người dùng để hiển thị tên
        const usersResponse = await fetch(`${api_key}RegisteredUser`);
        if (!usersResponse.ok) {
            throw new Error(`HTTP error! Status: ${usersResponse.status}`);
        }
        const users = await usersResponse.json();
        
        // Lấy danh sách moderator
        const moderatorsResponse = await fetch(`${api_key}Moderator`);
        if (!moderatorsResponse.ok) {
            throw new Error(`HTTP error! Status: ${moderatorsResponse.status}`);
        }
        const moderators = await moderatorsResponse.json();
        
        // Lấy danh sách thread để hiển thị tiêu đề
        const threadsResponse = await fetch(`${api_key}Thread`);
        let threads = [];
        if (threadsResponse.ok) {
            threads = await threadsResponse.json();
        }
        
        // Lấy danh sách category để hiển thị tên danh mục
        const categoriesResponse = await fetch(`${api_key}Category`);
        let categories = [];
        if (categoriesResponse.ok) {
            categories = await categoriesResponse.json();
        }
        
        // Tạo map để tra cứu nhanh
        const userMap = {};
        users.forEach(user => {
            userMap[user.regUserId] = user;
        });
        
        const moderatorMap = {};
        moderators.forEach(mod => {
            moderatorMap[mod.modId] = mod;
        });
        
        const threadMap = {};
        threads.forEach(thread => {
            threadMap[thread.threadId] = thread;
        });
        
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.categoryId] = category;
        });
        
        console.log("Posts loaded:", posts);
        
        const postsList = document.getElementById("posts-list");
        if (!postsList) {
            console.error("Admin posts list element not found");
            return;
        }
        
        postsList.innerHTML = "";
        
        if (posts.length === 0) {
            postsList.innerHTML = `
                <tr>
                    <td colspan="6" class="no-results">
                        <i class="fa fa-info-circle"></i> No posts found
                    </td>
                </tr>
            `;
            return;
        }
        
        posts.forEach(post => {
            // Xác định tác giả của bài viết
            let authorName = "Unknown";
            let authorType = "";
            
            if (post.regUserId && userMap[post.regUserId]) {
                authorName = userMap[post.regUserId].username;
                authorType = "User";
            } else if (post.modId && moderatorMap[post.modId]) {
                authorName = moderatorMap[post.modId].username;
                authorType = "Moderator";
            }
            
            // Xác định tiêu đề thread và danh mục
            let threadTitle = "Unknown Thread";
            let categoryName = "Unknown Category";
            
            if (post.threadId && threadMap[post.threadId]) {
                const thread = threadMap[post.threadId];
                threadTitle = thread.title || "Untitled";
                
                if (thread.categoryId && categoryMap[thread.categoryId]) {
                    categoryName = categoryMap[thread.categoryId].name;
                }
            }
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${post.postId}</td>
                <td>${threadTitle}</td>
                <td>
                    ${authorName}
                    <small>(${authorType})</small>
                </td>
                <td>${categoryName}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" onclick="editPost(${post.postId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deletePost(${post.postId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;
            postsList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading posts for admin:", error);
        showErrorPopup("Failed to load posts. Please try again later.");
    }
}

// Thêm hàm để lấy thông tin chi tiết của một bài viết
async function getPostDetails(postId) {
    try {
        const response = await fetch(`${api_key}Post/${postId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error getting post details for ID ${postId}:`, error);
        throw error;
    }
}

// Cập nhật hàm editPostFromModerator để hiển thị thông tin người dùng
async function editPostFromModerator(postId) {
    try {
        // Lấy thông tin bài viết
        const post = await getPostDetails(postId);
        
        // Lấy thông tin người dùng nếu có
        let authorName = "Unknown";
        if (post.regUserId) {
            try {
                const userResponse = await fetch(`${api_key}RegisteredUser/${post.regUserId}`);
                if (userResponse.ok) {
                    const user = await userResponse.json();
                    authorName = user.username;
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        } else if (post.modId) {
            try {
                const modResponse = await fetch(`${api_key}Moderator/${post.modId}`);
                if (modResponse.ok) {
                    const mod = await modResponse.json();
                    authorName = mod.username;
                }
            } catch (error) {
                console.error("Error fetching moderator details:", error);
            }
        }
        
        // Hiển thị form chỉnh sửa
        Swal.fire({
            title: 'Edit Post',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <p><strong>Author:</strong> ${authorName}</p>
                    <p><strong>Date:</strong> ${new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <textarea id="edit-post-content" class="swal2-textarea" placeholder="Post content">${post.content}</textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel',
            background: '#111314',
            color: '#fff',
            preConfirm: () => {
                const content = document.getElementById('edit-post-content').value;
                if (!content.trim()) {
                    Swal.showValidationMessage('Post content cannot be empty');
                    return false;
                }
                return { content };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Cập nhật bài viết (giả lập)
                showSuccessPopup('Post updated successfully!');
                loadPostsForModerator();
            }
        });
    } catch (error) {
        console.error("Error editing post:", error);
        showErrorPopup("Failed to edit post. Please try again later.");
    }
}

// Cập nhật hàm loadRegularUsersForAdmin để hiển thị đơn giản hơn
async function loadRegularUsersForAdmin(statusFilter = "all") {
    try {
        console.log(`Loading regular users with status filter: ${statusFilter}...`);
        const response = await fetch(`${api_key}RegisteredUser`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const users = await response.json();
        console.log("Regular users loaded:", users);
        
        const usersList = document.getElementById("regular-users-list");
        if (!usersList) {
            console.error("Regular users list element not found");
            return;
        }
        
        usersList.innerHTML = "";
        
        // Lọc người dùng theo trạng thái nếu cần
        let filteredUsers = users;
        if (statusFilter !== "all") {
            filteredUsers = users.filter(user => 
                (statusFilter === "active" && user.status === "Active") || 
                (statusFilter === "inactive" && user.status === "Inactive")
            );
        }
        
        if (filteredUsers.length === 0) {
            usersList.innerHTML = `
                <tr>
                    <td colspan="6" class="no-results">
                        <i class="fa fa-info-circle"></i> No users found with status: ${statusFilter}
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredUsers.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.regUserId}</td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="edit-btn" onclick="editRegularUser(${user.regUserId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteRegularUser(${user.regUserId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                    <span class="status-badge ${user.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        ${user.status || 'Active'}
                    </span>
                </td>
            `;
            usersList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading regular users:", error);
        showErrorPopup("Failed to load regular users. Please try again later.");
    }
}

// Cập nhật hàm loadRegularUsersForModerator để hiển thị đơn giản hơn
async function loadRegularUsersForModerator(statusFilter = "all") {
    try {
        console.log(`Loading regular users for moderator with status filter: ${statusFilter}...`);
        const response = await fetch(`${api_key}RegisteredUser`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const users = await response.json();
        console.log("Regular users loaded for moderator:", users);
        
        const usersList = document.getElementById("moderator-users-list");
        if (!usersList) {
            console.error("Moderator users list element not found");
            return;
        }
        
        usersList.innerHTML = "";
        
        // Lọc người dùng theo trạng thái nếu cần
        let filteredUsers = users;
        if (statusFilter !== "all") {
            filteredUsers = users.filter(user => 
                (statusFilter === "active" && user.status === "Active") || 
                (statusFilter === "inactive" && user.status === "Inactive")
            );
        }
        
        if (filteredUsers.length === 0) {
            usersList.innerHTML = `
                <tr>
                    <td colspan="5" class="no-results">
                        <i class="fa fa-info-circle"></i> No users found with status: ${statusFilter}
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredUsers.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.regUserId}</td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>
                    <button class="edit-btn" onclick="editRegularUserFromModerator(${user.regUserId})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteRegularUserFromModerator(${user.regUserId})">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                    <span class="status-badge ${user.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        ${user.status || 'Active'}
                    </span>
                </td>
            `;
            usersList.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading regular users for moderator:", error);
        showErrorPopup("Failed to load regular users. Please try again later.");
    }
}

// Cập nhật hàm editRegularUser để hiển thị đúng thông tin người dùng
async function editRegularUser(userId) {
    try {
        const response = await fetch(`${api_key}RegisteredUser/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Hiển thị form chỉnh sửa với dữ liệu hiện tại
        Swal.fire({
            title: 'Edit User',
            html: `
                <input id="edit-user-username" class="swal2-input" placeholder="Username" value="${user.username || ''}">
                <input id="edit-user-email" class="swal2-input" placeholder="Email" value="${user.email || ''}">
                <input id="edit-user-password" class="swal2-input" placeholder="Password" type="password" value="${user.password || ''}">
                <select id="edit-user-status" class="swal2-select">
                    <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const username = document.getElementById('edit-user-username').value;
                const email = document.getElementById('edit-user-email').value;
                const password = document.getElementById('edit-user-password').value;
                const status = document.getElementById('edit-user-status').value;
                
                if (!username || !email || !password) {
                    Swal.showValidationMessage('Please fill in all fields');
                    return false;
                }
                
                return { username, email, password, status };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { username, email, password, status } = result.value;
                
                const userData = {
                    regUserId: userId,
                    username: username,
                    email: email,
                    password: password,
                    status: status,
                    joinDate: user.joinDate
                };
                
                const updateResponse = await fetch(`${api_key}RegisteredUser/Update/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${updateResponse.status}`);
                }
                
                showSuccessPopup("User updated successfully");
                loadRegularUsersForAdmin();
            }
        }).catch(error => {
            console.error("Error updating user:", error);
            showErrorPopup(`Failed to update user: ${error.message}`);
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        showErrorPopup(`Failed to get user details: ${error.message}`);
    }
}

// Cập nhật hàm editRegularUserFromModerator để hiển thị đúng thông tin người dùng
async function editRegularUserFromModerator(userId) {
    try {
        const response = await fetch(`${api_key}RegisteredUser/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Hiển thị form chỉnh sửa với dữ liệu hiện tại
        Swal.fire({
            title: 'Edit User',
            html: `
                <div style="text-align: left; margin-bottom: 15px;">
                    <p><strong>User ID:</strong> ${user.regUserId}</p>
                    <p><strong>Join Date:</strong> ${new Date(user.joinDate).toLocaleString()}</p>
                </div>
                <input id="edit-user-username" class="swal2-input" placeholder="Username" value="${user.username || ''}">
                <input id="edit-user-email" class="swal2-input" placeholder="Email" value="${user.email || ''}">
                <input id="edit-user-password" class="swal2-input" placeholder="Password" type="password" value="${user.password || ''}">
                <select id="edit-user-status" class="swal2-select">
                    <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            showLoaderOnConfirm: true,
            background: '#111314',
            color: '#fff',
            preConfirm: () => {
                const username = document.getElementById('edit-user-username').value;
                const email = document.getElementById('edit-user-email').value;
                const password = document.getElementById('edit-user-password').value;
                const status = document.getElementById('edit-user-status').value;
                
                if (!username || !email || !password) {
                    Swal.showValidationMessage('Please fill in all fields');
                    return false;
                }
                
                return { username, email, password, status };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { username, email, password, status } = result.value;
                
                const userData = {
                    regUserId: userId,
                    username: username,
                    email: email,
                    password: password,
                    status: status,
                    joinDate: user.joinDate
                };
                
                const updateResponse = await fetch(`${api_key}RegisteredUser/Update/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${updateResponse.status}`);
                }
                
                showSuccessPopup("User updated successfully");
                loadRegularUsersForModerator();
            }
        }).catch(error => {
            console.error("Error updating user:", error);
            showErrorPopup(`Failed to update user: ${error.message}`);
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        showErrorPopup(`Failed to get user details: ${error.message}`);
    }
}

// Edit category
function editCategory(categoryId, categoryName) {
    Swal.fire({
        title: 'Edit Category',
        html: `
            <input id="edit-category-name" class="swal2-input" placeholder="Category Name" value="${categoryName || ''}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Update',
        showLoaderOnConfirm: true,
        background: '#111314',
        color: '#fff',
        preConfirm: () => {
            const name = document.getElementById('edit-category-name').value;
            
            if (!name) {
                Swal.showValidationMessage('Category name cannot be empty');
                return false;
            }
            
            return { name };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { name } = result.value;
            
            try {
                const updateResponse = await fetch(`${api_key}Category/Update/${categoryId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ categoryId, name })
                });
                
                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${updateResponse.status}`);
                }
                
                showSuccessPopup("Category updated successfully");
                
                // Reload categories based on current page
                if (window.location.href.includes('admin.html')) {
                    loadCategoriesForAdmin();
                } else if (window.location.href.includes('moderator.html')) {
                    loadCategoriesForModerator();
                } else {
                    loadCategories();
                }
            } catch (error) {
                console.error("Error updating category:", error);
                showErrorPopup(`Failed to update category: ${error.message}`);
            }
        }
    });
}

// Show add category form
function showAddCategoryForm() {
    Swal.fire({
        title: 'Add New Category',
        html: `
            <input id="add-category-name" class="swal2-input" placeholder="Category Name">
        `,
        showCancelButton: true,
        confirmButtonText: 'Add',
        showLoaderOnConfirm: true,
        background: '#111314',
        color: '#fff',
        preConfirm: () => {
            const name = document.getElementById('add-category-name').value;
            
            if (!name) {
                Swal.showValidationMessage('Category name cannot be empty');
                return false;
            }
            
            return { name };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { name } = result.value;
            
            try {
                const addResponse = await fetch(`${api_key}Category/Insert`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name })
                });
                
                if (!addResponse.ok) {
                    const errorData = await addResponse.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${addResponse.status}`);
                }
                
                showSuccessPopup("Category added successfully");
                
                // Reload categories based on current page
                if (window.location.href.includes('admin.html')) {
                    loadCategoriesForAdmin();
                } else if (window.location.href.includes('moderator.html')) {
                    loadCategoriesForModerator();
                } else {
                    loadCategories();
                }
            } catch (error) {
                console.error("Error adding category:", error);
                showErrorPopup(`Failed to add category: ${error.message}`);
            }
        }
    });
}

// Submit category from admin panel
async function submitCategoryFromAdmin() {
    try {
        const categoryName = document.getElementById('new-category-name').value.trim();
        
        if (!categoryName) {
            showErrorPopup("Category name cannot be empty");
            return;
        }
        
        // Hiển thị loading
        Swal.fire({
            title: 'Adding category...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const response = await fetch(`${api_key}Category/Insert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: categoryName })
        });
        
        // Đóng loading
        Swal.close();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        showSuccessPopup(data.message || "Category added successfully");
        
        // Đóng form và tải lại danh sách
        closeForm('add-category-form');
        loadCategoriesForAdmin();
    } catch (error) {
        console.error("Error adding category:", error);
        showErrorPopup(`Failed to add category: ${error.message}`);
    }
}

// Close form
function closeForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.classList.add('hide');
    } else {
        console.error(`Form with ID ${formId} not found`);
    }
}