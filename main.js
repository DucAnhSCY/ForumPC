document.addEventListener("DOMContentLoaded", function () {
    fetchCategories();
    initializePage();
    fetchAndDisplayThreads();
    fetchUsers();
    if (sessionStorage.getItem("token")) {
        updateUIAfterLogin();
        
        // Show category creation box for admins
        if (sessionStorage.getItem("role") === "Admin" || sessionStorage.getItem("role") === "admin") {
            showCategoryForm();
        } else {
            hideCategoryForm(); // Hide the category form for non-admin users
        }
        
    } else {
        updateUIAfterLogout();
        hideCreateThreadSection();
        hideCategoryForm(); // Hide the category form for non-logged-in users
    }
});

function hideCreateThreadSection() {
    const createThreadBtn = document.getElementById("create-thread-btn");
    const createThreadSection = document.getElementById("create-thread-section");
    if (createThreadBtn) createThreadBtn.style.display = "none";
    if (createThreadSection) createThreadSection.style.display = "none";
}
function hideCategoryForm() {
    const directCategoryForm = document.getElementById("direct-category-form");
    const addCategoryBox = document.getElementById("add-category-box");
    if (directCategoryForm) directCategoryForm.style.display = "none";
    if (addCategoryBox) addCategoryBox.style.display = "none";
}

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
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : document.getElementById("confirm-password").value;

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
        Swal.fire({
            title: 'Error',
            text: 'Please fill in all fields.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
            title: 'Error',
            text: 'Passwords do not match.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Send registration request
    fetch(`${api_key}User/Register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.message || 'Registration failed'); });
        }
        return response.text();
    })
    .then(data => {
        Swal.fire({
            title: 'Success',
            text: 'Registration successful! You can now log in.',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html";
            }
        });
    })
    .catch(error => {
        Swal.fire({
            title: 'Registration Failed',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}

function login() {
    // Get login form elements with fallbacks for different form IDs
    const emailInput = document.getElementById("email") || document.getElementById("login-email");
    const passwordInput = document.getElementById("password") || document.getElementById("login-password");
    
    if (!emailInput || !passwordInput) {
        console.error("Login form elements not found");
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        showCustomAlert("Login Error", "Please enter both email and password", "error");
        return;
    }

    const loginData = {
        email: email,
        password: password
    };

    fetch(`${api_key}User/Login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw { 
                    status: response.status,
                    data: data
                };
            });
        }
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem("token", data.token);
        
        // Parse the JWT token to get user information
        try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            const username = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const status = payload["status"]; // Store the user status from the token
            
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("status", status); // Save status to sessionStorage
            
            showCustomAlert("Success", "Login successful!", "success");
            
            // Close login popup if it exists
            const loginPopup = document.getElementById("login-popup");
            if (loginPopup) {
                loginPopup.classList.add("hide");
            }
            
            // Update UI after successful login
        updateUIAfterLogin();
            
            // Redirect to index page after successful login
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } catch (error) {
            console.error("Error parsing JWT token:", error);
            showCustomAlert("Error", "Error processing login response", "error");
        }
    })
    .catch(error => {
        console.error("Login error:", error);
        
        if (error.data && error.data.code) {
            switch (error.data.code) {
                case "invalid_credentials":
                    showCustomAlert("Login Failed", "Invalid email or password", "error");
                    break;
                case "account_inactive":
                    showCustomAlert("Account Inactive", "Your account is inactive. Please contact an administrator.", "warning");
                    break;
                case "account_banned":
                    showCustomAlert("Account Banned", "Your account has been banned. Please contact an administrator for more information.", "error");
                    break;
                default:
                    showCustomAlert("Login Error", error.data.message || "An error occurred during login", "error");
            }
        } else {
            showCustomAlert("Login Error", "Unable to connect to the server", "error");
        }
    });
}

// Utility function to show custom styled alerts
function showCustomAlert(title, message, type = "info") {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        confirmButtonText: 'OK'
    });
}

// Logout function to clear session data and update UI
function logout() {
    // Clear all session storage items
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("status");
    
    // Update UI after logout
    updateUIAfterLogout();
    
    // Redirect to homepage if not already there
    if (window.location.pathname !== "/forums.html" && 
        window.location.pathname !== "/" && 
        window.location.pathname !== "/ForumPC/forums.html") {
        window.location.href = "forums.html";
    }
}

// Update UI based on login status
function updateUIAfterLogin() {
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");
    
    // Display username in the top right corner
    const topRightUsername = document.getElementById("top-right-username");
    if (topRightUsername) {
        topRightUsername.textContent = username;
        topRightUsername.classList.remove("hide");
    }
    
    // Show logout links and hide login links
    const logoutLinks = document.querySelectorAll(".logout-link");
    const loginLinks = document.querySelectorAll("a[href='login.html']");
    
    logoutLinks.forEach(link => link.classList.remove("hide"));
    loginLinks.forEach(link => link.parentElement.classList.add("hide"));
    
    // Show/hide Mod Control based on role
    const modControlLinks = document.querySelectorAll("a[href='Modctrl.html']");
    modControlLinks.forEach(link => {
        if (role === "Admin" || role === "admin" || role === "Moderator" || role === "moderator") {
            link.parentElement.classList.remove("hide");
        } else {
            link.parentElement.classList.add("hide");
        }
    });
    
    // Show the create thread button for logged-in users
    const createThreadBtn = document.getElementById("create-thread-btn");
    const createThreadSection = document.getElementById("create-thread-section");
    if (createThreadBtn) createThreadBtn.style.display = "block";
    if (createThreadSection) createThreadSection.style.display = "block";
}

// Update UI after logout
function updateUIAfterLogout() {
    // Show login links, hide logout links
    document.querySelectorAll(".logout-link").forEach(el => el.classList.add("hide"));
    document.querySelectorAll("a[href='login.html']").forEach(el => el.parentElement.classList.remove("hide"));
    
    // Hide username in top right corner
    const usernameElement = document.getElementById("top-right-username");
    if (usernameElement) {
        usernameElement.textContent = "";
        usernameElement.classList.add("hide");
    }
    
    // Hide Mod Control link
    document.querySelectorAll("a[href='Modctrl.html']").forEach(el => el.parentElement.classList.add("hide"));
    
    // Hide post form if available
    const postForm = document.querySelector('.post-form');
    if (postForm) postForm.classList.add('hide');
}

function createCategory() {
    const categoryName = document.getElementById("category-name").value.trim();
    if (!categoryName) {
        Swal.fire({
            title: 'Error',
            text: 'Please enter a category name.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
        Swal.fire({
            title: 'Authentication Error',
            text: 'You must be logged in to create a category.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Check if user has admin role
    const role = sessionStorage.getItem('role');
    if (role !== 'Admin' && role !== 'admin') {
        Swal.fire({
            title: 'Permission Denied',
            text: 'Only administrators can create new categories.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Add animaton to the form container
    const formContainer = document.getElementById("add-category-box");
    if (formContainer) {
        formContainer.style.transition = "all 0.3s ease";
        formContainer.style.transform = "scale(0.98)";
        formContainer.style.opacity = "0.8";
    }
    
    // Also animate the direct form if it exists
    const directForm = document.getElementById("direct-category-form");
    if (directForm) {
        directForm.style.transition = "all 0.3s ease";
        directForm.style.transform = "scale(0.98)";
        directForm.style.opacity = "0.8";
    }
    
    // Show loading animation on whichever button was clicked
    const createButton = document.getElementById("create-category-btn");
    const directButton = document.getElementById("direct-create-category-btn");
    
    // Store original button text
    const originalText = createButton ? createButton.innerHTML : '';
    const originalDirectText = directButton ? directButton.innerHTML : '';
    
    // Update button states
    if (createButton) {
        createButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Creating...';
        createButton.disabled = true;
    }
    
    if (directButton) {
        directButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Creating...';
        directButton.disabled = true;
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
        Swal.fire({
            title: 'Success',
            text: 'Category created successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
        // Clear input fields
        document.getElementById("category-name").value = "";
        const directInput = document.getElementById("direct-category-name");
        if (directInput) {
            directInput.value = "";
        }
        
        // Save the new category ID to highlight it after refresh
        if (data && data.categoryId) {
            sessionStorage.setItem('newCategoryId', data.categoryId);
        }
        
        // Hide the form after successful creation
        if (formContainer) {
            formContainer.classList.add("hide");
        }
        
        // Add a 350ms delay before refreshing the category list
        setTimeout(() => {
        fetchCategories(); // Refresh category list and dropdown
        }, 350);
    })
    .catch(error => {
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to create category',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    })
    .finally(() => {
        // Restore button states
        if (createButton) {
            createButton.innerHTML = originalText;
            createButton.disabled = false;
        }
        
        if (directButton) {
            directButton.innerHTML = originalDirectText;
            directButton.disabled = false;
        }
        
        // Restore form container styles
        if (formContainer) {
            formContainer.style.transform = "";
            formContainer.style.opacity = "";
        }
        
        if (directForm) {
            directForm.style.transform = "";
            directForm.style.opacity = "";
        }
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
    const categoryList = document.getElementById("categories-list");

    if (!categoryList) {
        console.warn("Category list element not found.");
        return;
    }

    // Clear current list with fade-out effect
    const currentItems = categoryList.querySelectorAll('.category-item');
    if (currentItems.length > 0) {
        currentItems.forEach((item, index) => {
            // Add staggered fade-out effect
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
            }, index * 50);
        });
        
        // After all items have faded out, clear and add new items
        setTimeout(() => {
    categoryList.innerHTML = "";
            addCategoryItems(categories, categoryList);
        }, currentItems.length * 50 + 300);
    } else {
        // If no items exist, just add new ones
        categoryList.innerHTML = "";
        addCategoryItems(categories, categoryList);
    }
}

function addCategoryItems(categories, container) {
    if (categories.length === 0) {
        // Show empty state with message
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-categories';
        emptyState.innerHTML = `
            <i class="fa fa-folder-open"></i>
            <p>No categories found. Create a new one!</p>
        `;
        container.appendChild(emptyState);
        return;
    }

    const newCategoryId = sessionStorage.getItem('newCategoryId');
    
    categories.forEach((category, index) => {
        const delay = index * 0.1;
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.style.animationDelay = `${delay}s`;
        
        // If this is the newly created category, add the highlight class
        if (newCategoryId && category.categoryId.toString() === newCategoryId) {
            categoryItem.classList.add('new-item');
            // Clear the newCategoryId after highlighting
            setTimeout(() => {
                sessionStorage.removeItem('newCategoryId');
            }, 2000);
        }
        
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-content';
        
        // Create folder icon with the new purple color
        const folderIcon = document.createElement('i');
        folderIcon.className = 'fa fa-folder';
        folderIcon.style.color = 'var(--folder-color)';
        
        const categoryName = document.createElement('span');
        categoryName.textContent = category.name;
        
        categoryContent.appendChild(folderIcon);
        categoryContent.appendChild(categoryName);
        
        // Make clicking on the category go to its threads
        categoryItem.addEventListener('click', () => {
            window.location.href = `forums.html?category=${category.categoryId}`;
        });
        
        categoryItem.appendChild(categoryContent);
        
        // Add delete button for admins
        const role = sessionStorage.getItem('role');
        if (role === 'Admin' || role === 'admin') {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-category-btn';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent navigation to forum
                confirmDeleteCategory(category.categoryId, category.name);
            });
            categoryItem.appendChild(deleteButton);
        }
        
        container.appendChild(categoryItem);
    });
}

function confirmDeleteCategory(categoryId, categoryName) {
    Swal.fire({
        title: 'Delete Category',
        text: `Are you sure you want to delete the category "${categoryName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6a11cb',
        cancelButtonColor: '#2575fc',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        backdrop: true,
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            deleteCategory(categoryId);
        }
    });
}

// Call the function to fetch categories
fetchCategories();


function deleteCategory(categoryId) {
    const token = sessionStorage.getItem("token");
    if (!token) {
        Swal.fire({
            title: 'Authentication Error',
            text: 'You must be logged in to delete a category.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Find the category element to animate its removal
    const categoryElement = document.querySelector(`.category-item[data-id="${categoryId}"]`);
    if (categoryElement) {
        // Add deletion animation
        categoryElement.style.transition = "all 0.5s ease";
        categoryElement.style.transform = "scale(0.8)";
        categoryElement.style.opacity = "0";
    }

    fetch(`${api_key}Category/Delete/${categoryId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete category");
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            title: 'Deleted!',
            text: 'Category has been deleted successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        fetchCategories(); // Refresh category list and dropdown
    })
    .catch(error => {
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to delete category',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        
        // Restore the category element if deletion failed
        if (categoryElement) {
            categoryElement.style.transform = "scale(1)";
            categoryElement.style.opacity = "1";
        }
    });
}

// Đổi tên hàm clearThreadForm thành cancelThreadForm
function cancelThreadForm() {
    // Clear the form
    clearThreadForm();
    
    // Hide the form
    hideNewThreadForm();
}

// Thêm hàm showNewThreadForm nếu cần thiết
function showNewThreadForm() {
    const createThreadSection = document.getElementById('create-thread-section');
    createThreadSection.classList.remove('hide');
    createThreadSection.classList.add('show');
    
    // Scroll to the form with smooth animation
    setTimeout(() => {
        createThreadSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function hideNewThreadForm() {
    const createThreadSection = document.getElementById('create-thread-section');
    createThreadSection.classList.remove('show');
    createThreadSection.classList.add('hide');
    
    // Clean up any CKEditor instance if it exists
    if (CKEDITOR.instances['thread-content']) {
        CKEDITOR.instances['thread-content'].destroy();
    }
}

// Đảm bảo rằng hàm clearThreadForm hiện tại chuyển sang gọi cancelThreadForm
function clearThreadForm() {
    document.getElementById('thread-title').value = '';
    document.getElementById('thread-content').value = '';
    document.getElementById('thread-category').selectedIndex = 0;
}

// Sửa lại hàm createThread để sử dụng cancelThreadForm thay vì clearThreadForm
async function createThread() {
    const title = document.getElementById('thread-title').value;
    const content = document.getElementById('thread-content').value;
    
    const categorySelect = document.getElementById('thread-category');
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    
    // Basic validation
    if (!title.trim() || !content.trim() || !categoryId) {
        alert('Please fill all required fields.');
        return;
    }
    
    const userId = parseInt(sessionStorage.getItem('userId'));
    const username = sessionStorage.getItem('username');

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
                categoryId: parseInt(categoryId, 10),
                userId: userId,
                categoryName: categoryName,
                username: username,
                threadId: 0,
                createdAt: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Thread created successfully:', data);
            alert('Thread created successfully!');
            cancelThreadForm(); // Thay đổi ở đây
            
            // Chuyển hướng đến thread vừa tạo
            window.location.href = `thread-detail.html?id=${data.threadId}`;
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

async function fetchAndDisplayThreads() {
    try {
        // Hiển thị shimmer loading
        const threadsDisplay = document.getElementById('threads-display');
        threadsDisplay.innerHTML = '<div class="loading-shimmer">Loading threads...</div>';
        
        // Fetch all threads
        const threadsResponse = await fetch(`${api_key}Thread`);
        
        if (!threadsResponse.ok) {
            throw new Error('Failed to fetch threads');
        }
        
        const threads = await threadsResponse.json();
        
        // Cho mỗi thread, lấy thêm thông tin về lượt like
        for (let thread of threads) {
            try {
                // Lấy tổng số like cho mỗi thread (tổng hợp từ các bài post trong thread)
                thread = await getThreadTotalLikes(thread.threadId, thread);
            } catch (error) {
                console.error(`Error getting likes for thread ${thread.threadId}:`, error);
                thread.total_likes = 0;
            }
        }
        displayThreads(threads);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('threads-display').innerHTML = 
            '<p class="error-message">Failed to load threads. Please try again later.</p>';
    }
}

async function getThreadTotalLikes(threadId, thread) {
    try {
        // Lấy tất cả các bài post trong thread
        const postsResponse = await fetch(`${api_key}Post/ByThread/${threadId}`);
        
        if (!postsResponse.ok) {
            return thread;
        }
        
        const posts = await postsResponse.json();
        
        // Tổng hợp số like từ tất cả các bài post
        let totalLikes = 0;
        
        for (const post of posts) {
            const likesResponse = await fetch(`${api_key}Likes/Count/${post.postId}`);
            if (likesResponse.ok) {
                const likesCount = await likesResponse.json();
                totalLikes += likesCount;
            }
        }
        
        // Thêm thông tin vào đối tượng thread
        thread.total_likes = totalLikes;
        return thread;
    } catch (error) {
        console.error('Error getting thread total likes:', error);
        thread.total_likes = 0;
        return thread;
    }
}

function displayThreads(threads) {
    const threadsDisplay = document.getElementById('threads-display');
    if (!threadsDisplay) return;
    
    threadsDisplay.innerHTML = '';
    
    if (threads.length === 0) {
        threadsDisplay.innerHTML = `
            <div class="no-threads">
                <i class="fa fa-comments-o"></i>
                <p>No threads found. Be the first to create a thread!</p>
            </div>
        `;
        return;
    }
    
    threads.forEach(thread => {
        const threadElement = document.createElement('div');
        threadElement.className = 'thread-item';
        
        // Truncate content - Keep HTML structure but limit length
        const truncatedContent = truncateContent(thread.content, 150);
        
        threadElement.innerHTML = `
            <div class="thread-header">
                <h3 class="thread-title">${thread.title}</h3>
                <div class="thread-meta">
                    <span class="thread-author"><i class="fa fa-user"></i> ${thread.username || 'Unknown User'}</span>
                    <span class="thread-date"><i class="fa fa-calendar"></i> ${formatDate(thread.createdAt)}</span>
                </div>
            </div>
            <div class="thread-content">${truncatedContent}</div>
            <div class="thread-footer">
                <div class="thread-stats">
                    <span class="thread-views"><i class="fa fa-eye"></i> ${thread.views || 0} views</span>
                    <span class="thread-likes"><i class="fa fa-heart"></i> ${thread.likes || 0} likes</span>
                </div>
                <a href="thread-detail.html?id=${thread.threadId}" class="thread-read-more">Read More</a>
            </div>
        `;
        
        threadsDisplay.appendChild(threadElement);
    });
    
    addThreadHoverEffects();
}

function truncateContent(content, maxLength) {
    if (!content) return '';
    
    // Create a temporary div to handle HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get the text content
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    if (textContent.length <= maxLength) {
        return content;
    }
    
    // If content is too long, create a truncated version
    // First, remove any iframes (videos) from the truncated version
    const contentWithoutIframes = content.replace(/<iframe[^>]*>.*?<\/iframe>/ig, '[Video]');
    
    // Then limit the text length
    const tempDiv2 = document.createElement('div');
    tempDiv2.innerHTML = contentWithoutIframes;
    
    let truncated = '';
    let currentLength = 0;
    const children = Array.from(tempDiv2.childNodes);
    
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        
        if (node.nodeType === 3) { // Text node
            const text = node.textContent;
            if (currentLength + text.length > maxLength) {
                truncated += text.substr(0, maxLength - currentLength) + '...';
                break;
            } else {
                truncated += text;
                currentLength += text.length;
            }
        } else if (node.nodeType === 1) { // Element node
            // For images, just add a placeholder
            if (node.tagName === 'IMG') {
                truncated += '[Image]';
                currentLength += 7;
            } else {
                const clonedNode = node.cloneNode(true);
                truncated += clonedNode.outerHTML;
                currentLength += (clonedNode.textContent || clonedNode.innerText).length;
            }
        }
        
        if (currentLength >= maxLength) {
            truncated += '...';
            break;
        }
    }
    
    return truncated;
}

function addThreadHoverEffects() {
    const threadItems = document.querySelectorAll('.thread-item');
    threadItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px) scale(1.02)';
            item.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            item.style.zIndex = '1';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
            item.style.zIndex = '0';
        });
    });
}

// Hàm format thời gian
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Cùng ngày, hiển thị giờ
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `Today at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        // Format ngày đầy đủ cho các ngày cũ hơn
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
}

// Cập nhật cho incrementThreadViews để đảm bảo hiển thị cập nhật
async function incrementThreadViews(threadId) {
    try {
        const response = await fetch(`${api_key}Thread/IncrementViews/${threadId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.warn('Failed to increment view count:', response.status);
            return;
        }
        
        // Update views in the UI
        const viewsElement = document.getElementById('thread-views');
        if (viewsElement) {
            const currentViews = parseInt(viewsElement.textContent) || 0;
            viewsElement.textContent = (currentViews + 1).toString();
            
            // Cập nhật badge trạng thái dựa trên số lượt xem
            updateEngagementStatus();
        }
        
        console.log('View count incremented for thread', threadId);
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

// Hàm cập nhật trạng thái engagement
function updateEngagementStatus(views, likes) {
    const status = document.getElementById('thread-status');
    if (!status) return;
    
    // Xóa tất cả trạng thái hiện tại
    status.classList.remove('active', 'recent', 'archived');
    
    // Thiết lập trạng thái và tooltip dựa trên lượt xem và lượt thích
    if (views > 200 || likes > 50) {
        status.textContent = 'Nổi bật';
        status.classList.add('active');
        status.setAttribute('data-tooltip', 'Chủ đề có nhiều lượt xem và lượt thích');
    } else if (views > 50 || likes > 10) {
        status.textContent = 'Phổ biến';
        status.classList.add('recent');
        status.setAttribute('data-tooltip', 'Chủ đề đang thu hút sự quan tâm');
    } else {
        status.textContent = 'Mới';
        status.classList.add('archived');
        status.setAttribute('data-tooltip', 'Chủ đề mới được tạo');
    }
    
    // Kích hoạt rule-badge tương ứng
    updateRuleBadges(views, likes);
}

// Hàm khởi tạo trang thread detail
function initThreadDetailPage() {
    const threadId = getCurrentThreadId();
    if (threadId) {
        loadThreadDetails(threadId);
        loadPosts(threadId);
        incrementThreadViews(threadId);
        loadRelatedThreads(threadId);
        
        // Initialize CKEditor for post input
        if (document.getElementById('post-input') && !CKEDITOR.instances['post-input']) {
            CKEDITOR.replace('post-input');
        }
    }
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
        // Skip displaying admin users
        if (user.role === "Admin" || user.role === "admin") return;

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
    console.log('Full pendingChanges Map before saving:', pendingChanges); // Debugging log

    const changes = pendingChanges.get(userId);
    console.log(`Attempting to save changes for user ${userId}:`, changes); // Debugging log

    if (!changes || Object.keys(changes).length === 0) { 
        alert('No changes detected. Please modify the user before saving.');
        return;
    }

    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error('You must be logged in as an admin to perform this action.');
        }

        // Create an array to store promises for all API calls
        const promises = [];

        // Apply role changes if any
        if (changes.role) {
            const rolePromise = fetch(`${api_key}User/UpdateUser/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
                body: JSON.stringify({ role: changes.role })
            });
            promises.push(rolePromise);
        }

        // Apply status changes if any
        if (changes.status) {
            const statusPromise = fetch(`${api_key}User/UpdateStatus/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: changes.status })
            });
            promises.push(statusPromise);
        }

        // Wait for all API calls to complete
        const responses = await Promise.all(promises);
        
        // Check if any response was not ok
        for (const response of responses) {
        if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Could not update user');
            }
        }

        alert('Changes saved successfully!');
        pendingChanges.delete(userId);
        await refreshTable();
    } catch (error) {
        console.error('Error saving changes:', error);
        alert(`Error: ${error.message}`);
        await refreshTable();
    }
}


async function saveAllChanges() {
    try {
        const token = sessionStorage.getItem("token");
        const promises = [];

        for (const [userId, changes] of pendingChanges) {
            // Handle role changes
            if (changes.role) {
                const rolePromise = fetch(`${api_key}User/UpdateRole/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                    body: JSON.stringify({ role: changes.role })
                });
                promises.push(rolePromise);
            }
            
            // Handle status changes
            if (changes.status) {
                const statusPromise = fetch(`${api_key}User/UpdateStatus/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: changes.status })
                });
                promises.push(statusPromise);
            }
        }

        // Wait for all responses
        const responses = await Promise.all(promises);
        
        // Check if any request failed
        for (const response of responses) {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update one or more users');
            }
        }
        
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
        
        try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

            const response = await fetch(`${api_key}User/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData && errorData.code) {
                    // Handle specific error codes
                    switch(errorData.code) {
                        case 'account_inactive':
                            showCustomAlert("Account Inactive", errorData.message, "warning");
                            break;
                        case 'account_banned':
                            showCustomAlert("Account Banned", errorData.message, "error");
                            break;
                        case 'invalid_credentials':
                            showCustomAlert("Login Failed", "Invalid email or password", "error");
                            break;
                        default:
                            showCustomAlert("Login Error", errorData.message || "An error occurred", "error");
                    }
                } else {
                    throw new Error("Login failed: " + response.statusText);
                }
                return;
            }
            
            const data = await response.json();
            console.log("Login response data:", data);

            // Decode the token to extract claims
            const token = data.token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Get user information from standard JWT claims
            const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            const username = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const status = payload["status"];

            if (!userId || !username || !role) {
                console.error("Payload content:", payload);
                throw new Error("Invalid user data: required claims not found in token.");
            }

            // Store user info in session storage
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("status", status || "Active");
            
            // Display success message
            showCustomAlert("Success", "Login successful!", "success");
            
            // Update UI for logged in user
            updateUIAfterLogin();
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'forums.html';
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            showCustomAlert("Login Error", error.message || "An error occurred during login", "error");
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
    const userId = parseInt(selectElement.dataset.userId, 10); // Ensure correct ID format
    const newRole = selectElement.value;

    if (!userId || !newRole) {
        console.warn('Invalid userId or role:', userId, newRole);
        return;
    }

    if (!pendingChanges.has(userId)) {
        pendingChanges.set(userId, {}); // Initialize if not set
    }
    pendingChanges.get(userId).role = newRole;

    console.log(`Role change stored for user ${userId}:`, pendingChanges.get(userId)); // Debugging log
}


function handleStatusChange(selectElement) {
    const userId = parseInt(selectElement.dataset.userId, 10);
    const newStatus = selectElement.value;

    if (!userId || !newStatus) {
        console.warn('Invalid userId or status:', userId, newStatus);
        return;
    }

    if (!pendingChanges.has(userId)) {
        pendingChanges.set(userId, {});
    }
    pendingChanges.get(userId).status = newStatus;
    
    // Add "status-changed" class to indicate there's a pending change
    selectElement.classList.add('status-changed');

    console.log(`Status change stored for user ${userId}:`, pendingChanges.get(userId)); // Debugging log
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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch thread details');
        }
        
        const thread = await response.json();
        
        // Update thread details
        const titleElement = document.getElementById('thread-title');
        const authorElement = document.getElementById('thread-author');
        const dateElement = document.getElementById('thread-date');
        const contentElement = document.getElementById('thread-content');
        const categoryElement = document.getElementById('thread-category');
        const postedDateElement = document.getElementById('thread-posted-date');
        const likesElement = document.getElementById('thread-likes');
        const viewsElement = document.getElementById('thread-views');
        const deleteThreadBtn = document.getElementById('delete-thread-btn');
        
        if (titleElement) titleElement.textContent = thread.title;
        if (authorElement) authorElement.textContent = thread.username || 'Unknown User';
        
        if (dateElement) {
            const createdDate = new Date(thread.createdAt);
            dateElement.textContent = `${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`;
        }
        
        if (contentElement) contentElement.textContent = thread.content;
        if (categoryElement) categoryElement.textContent = thread.categoryName || 'Uncategorized';
        if (postedDateElement) {
            const createdDate = new Date(thread.createdAt);
            postedDateElement.textContent = createdDate.toLocaleDateString();
        }
        if (likesElement) likesElement.textContent = thread.likes || '0';
        if (viewsElement) viewsElement.textContent = thread.views || '0';
        
        // Check if current user is the thread creator and show delete button
        const currentUsername = sessionStorage.getItem('username');
        if (deleteThreadBtn && currentUsername && thread.username === currentUsername) {
            deleteThreadBtn.classList.remove('hide');
            // Store thread ID as data attribute for delete functionality
            deleteThreadBtn.setAttribute('data-thread-id', threadId);
        } else if (deleteThreadBtn) {
            deleteThreadBtn.classList.add('hide');
        }
        
        document.title = `${thread.title} - Forum`;
        
        // Load posts after thread details are loaded
        await loadPosts(threadId);
        
    } catch (error) {
        console.error('Error loading thread details:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to load thread details or posts. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            // Redirect to forums page on error
            window.location.href = 'forums.html';
        });
    }
}

// Initialize thread detail page
function initThreadDetailPage() {
    const threadId = getCurrentThreadId();
    if (threadId) {
        loadThreadDetails(threadId);
        loadPosts(threadId);
        incrementThreadViews(threadId);
        loadRelatedThreads(threadId);
        
        // Initialize CKEditor for post input
        if (document.getElementById('post-input') && !CKEDITOR.instances['post-input']) {
            CKEDITOR.replace('post-input');
        }
    }
}

// Get current thread ID from URL
function getCurrentThreadId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('thread-detail.html')) {
        initThreadDetailPage();
    }
    // ... existing code ...
});

// Load posts for a specific thread
async function loadPosts(threadId) {
    try {
        const postsContainer = document.getElementById('posts-container');
        
        // Hiển thị trạng thái loading
        postsContainer.innerHTML = '<div class="loading-shimmer">Loading posts...</div>';
        
        const response = await fetch(`${api_key}Post/ByThread/${threadId}`);
        if (!response.ok) {
            throw new Error('Failed to load posts');
        }
        
        const posts = await response.json();
        
        // Hiển thị các bài post
        displayPosts(posts);
        
        // Cập nhật số lượng post trong sidebar
        const postCount = document.getElementById('post-count');
        if (postCount) {
            postCount.textContent = posts.length.toString();
        }
        
        return posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-container').innerHTML = 
            '<div class="error-message">Failed to load posts. Please try again later.</div>';
        throw error;
    }
}

// Display posts in the UI
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fa fa-comment-o"></i>
                <p>No posts yet. Be the first to post!</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element for the UI with added animation
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.id = `post-${post.postId}`;
    
    // Format the post date
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString() + ' at ' + postDate.toLocaleTimeString();
    
    // Determine if the current user is the post author or admin
    const currentUserId = sessionStorage.getItem('userId');
    const isAuthor = currentUserId && parseInt(currentUserId) === post.userId;
    const isAdmin = sessionStorage.getItem('role') === 'Admin' || sessionStorage.getItem('role') === 'admin';
    const canModify = isAuthor || isAdmin;
    
    // Clean post content to remove unnecessary paragraph tags
    const cleanedContent = cleanHtmlContent(post.content);
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fa fa-user-circle"></i>
                </div>
                <div class="user-meta">
                    <div class="username">${post.username || 'Unknown User'}</div>
                    <div class="post-time">${formattedDate}</div>
                </div>
            </div>
            <div class="post-actions ${canModify ? '' : 'hide'}">
                <button class="edit-button" onclick="editPost(${post.postId})"><i class="fa fa-pencil"></i></button>
                <button class="delete-button" onclick="deletePost(${post.postId})"><i class="fa fa-trash"></i></button>
            </div>
        </div>
        <div class="post-content">${cleanedContent}</div>
        <div class="post-footer">
            <div class="post-stats">
                <span class="post-likes" id="likes-count-${post.postId}">${post.likes || 0} likes</span>
                <button class="like-button" id="like-button-${post.postId}" onclick="toggleLike(this)" data-post-id="${post.postId}">
                    <i class="fa fa-heart-o"></i> Like
                </button>
                <button class="report-button" onclick="showReportForm(this, 'post')" data-post-id="${post.postId}">
                    <i class="fa fa-flag"></i> Report
                </button>
            </div>
            <button class="reply-button" onclick="toggleReplyForm(this)">
                <i class="fa fa-reply"></i> Reply
            </button>
            <div class="reply-form">
                <textarea placeholder="Write your reply..."></textarea>
                <button onclick="submitReply(this, ${post.postId})">Post Reply</button>
            </div>
        </div>
        <div class="post-comments" id="comments-${post.postId}"></div>
    `;
    
    // Initialize the like status for this post
    if (sessionStorage.getItem('token')) {
        initializeLikeStatus(post.postId, postElement.querySelector(`#like-button-${post.postId}`));
    }
    
    // Load comments for this post
    loadComments(post.postId, postElement.querySelector(`#comments-${post.postId}`));
    
    return postElement;
}

// Sửa hàm initializeLikeStatus để sử dụng đúng endpoints
async function initializeLikeStatus(postId, likeButton) {
    if (!likeButton) return;
    
    try {
        // Lấy userID từ session storage
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
        
        // Kiểm tra xem người dùng đã like bài post chưa
        const response = await fetch(`${api_key}Likes/Check/${postId}/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to check like status');
        }
        
        const liked = await response.json();
        
        // Cập nhật UI dựa trên trạng thái like
        if (liked) {
            likeButton.classList.add('active', 'liked');
            const icon = likeButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-heart-o');
                icon.classList.add('fa-heart');
            }
        }
        
        // Lấy số lượng like
        getLikesCount(postId).then(count => {
            const countElement = likeButton.querySelector('.like-count');
            if (countElement) {
                countElement.textContent = count.toString();
            }
        });
    } catch (error) {
        console.error(`Error initializing like status for post ${postId}:`, error);
    }
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
    let content = form.querySelector('textarea').value.trim();
    
    // Clean the content by removing unnecessary paragraph tags
    content = cleanHtmlContent(content);
    
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

// Initialize thread detail page with animations
function initThreadDetailPage() {
    const threadId = getCurrentThreadId();
    if (threadId) {
        loadThreadDetails(threadId);
        loadPosts(threadId);
        incrementThreadViews(threadId);
        loadRelatedThreads(threadId);
        
        // Initialize CKEditor for post input
        if (document.getElementById('post-input') && !CKEDITOR.instances['post-input']) {
            CKEDITOR.replace('post-input');
        }
    }
}

// Check if we're on the thread detail page and initialize
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('thread-detail.html')) {
        initThreadDetailPage();
        
        // Đảm bảo modal ẩn đi khi tải trang
        const reportModal = document.getElementById('report-modal');
        if (reportModal) {
            reportModal.classList.add('hide');
        }
    }
});

// Update sidebar information
function updateSidebarInfo(thread) {
    // Cập nhật tên danh mục
    const categoryElement = document.getElementById('thread-category');
    if (categoryElement) {
        categoryElement.textContent = thread.categoryName;
        categoryElement.parentElement.classList.add('category');
    }
    
    // Cập nhật ngày tạo
    const postedDateElement = document.getElementById('thread-posted-date');
    if (postedDateElement) {
        postedDateElement.textContent = formatDate(thread.createdAt);
        postedDateElement.parentElement.classList.add('date');
    }
    
    // Cập nhật số lượng likes với highlight
    const likesElement = document.getElementById('thread-likes');
    if (likesElement) {
        likesElement.innerHTML = `<span class="highlight-number">${thread.likes || 0}</span>`;
        likesElement.parentElement.classList.add('likes');
    }
    
    // Cập nhật lượt xem với highlight
    const viewsElement = document.getElementById('thread-views');
    if (viewsElement) {
        viewsElement.innerHTML = `<span class="highlight-number">${thread.views || 0}</span>`;
        viewsElement.parentElement.classList.add('views');
    }
    
    // Cập nhật số lượng bài viết với highlight
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.innerHTML = `<span class="highlight-number">0</span>`;
        postCountElement.parentElement.classList.add('posts');
    }
    
    // Cập nhật trạng thái
    const statusElement = document.getElementById('thread-status');
    if (statusElement) {
        statusElement.parentElement.classList.add('status');
    }
    
    // Cập nhật trạng thái engagement dựa trên lượt xem và lượt thích
    updateEngagementStatus(
        parseInt(thread.views) || 0,
        parseInt(thread.likes) || 0
    );
}

// Hàm cập nhật trạng thái engagement
function updateEngagementStatus(views, likes) {
    const status = document.getElementById('thread-status');
    if (!status) return;
    
    // Xóa tất cả trạng thái hiện tại
    status.classList.remove('active', 'recent', 'archived');
    
    // Thiết lập trạng thái và tooltip dựa trên lượt xem và lượt thích
    if (views > 200 || likes > 50) {
        status.textContent = 'Nổi bật';
        status.classList.add('active');
        status.setAttribute('data-tooltip', 'Chủ đề có nhiều lượt xem và lượt thích');
    } else if (views > 50 || likes > 10) {
        status.textContent = 'Phổ biến';
        status.classList.add('recent');
        status.setAttribute('data-tooltip', 'Chủ đề đang thu hút sự quan tâm');
    } else {
        status.textContent = 'Mới';
        status.classList.add('archived');
        status.setAttribute('data-tooltip', 'Chủ đề mới được tạo');
    }
    
    // Kích hoạt rule-badge tương ứng
    updateRuleBadges(views, likes);
}

// Hàm tải threads liên quan
async function loadRelatedThreads(currentThreadId) {
    try {
        const response = await fetch(`${api_key}Thread`);
        if (!response.ok) {
            throw new Error('Failed to load related threads');
        }
        
        const threads = await response.json();
        
        // Lấy thread hiện tại để biết categoryId
        const currentThread = threads.find(t => t.threadId == currentThreadId);
        if (!currentThread) return;
        
        // Lọc các thread cùng category nhưng khác ID
        const relatedThreads = threads
            .filter(t => t.categoryId === currentThread.categoryId && t.threadId != currentThreadId)
            .slice(0, 5); // Chỉ lấy 5 thread liên quan
        
        displayRelatedThreads(relatedThreads);
    } catch (error) {
        console.error('Error loading related threads:', error);
        document.getElementById('related-threads').innerHTML = 
            '<li>Failed to load related threads</li>';
    }
}

// Hiển thị các thread liên quan
function displayRelatedThreads(threads) {
    const container = document.getElementById('related-threads');
    if (!container) return;

    if (threads.length === 0) {
        container.innerHTML = '<li>No related threads found</li>';
        return;
    }

    container.innerHTML = '';
    threads.forEach(thread => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="thread-detail.html?id=${thread.threadId}">
                ${thread.title}
                <small>(${formatDate(thread.createdAt)})</small>
            </a>
        `;
        container.appendChild(li);
    });
}

// Hàm tải chi tiết thread
async function loadThreadDetail(threadId) {
    try {
        const response = await fetch(`${api_key}Thread/${threadId}`);
        if (!response.ok) {
            throw new Error('Failed to load thread details');
        }
        
        const thread = await response.json();
        
        // Cập nhật tiêu đề trang
        document.title = `${thread.title} - Forum`;
        
        // Clean the thread content before displaying
        const cleanedContent = cleanHtmlContent(thread.content);
        
        // Cập nhật nội dung thread
        document.getElementById('thread-title').textContent = thread.title;
        document.getElementById('thread-author').textContent = thread.username;
        document.getElementById('thread-date').textContent = formatDate(thread.createdAt);
        document.getElementById('thread-content').innerHTML = cleanedContent;
        
        // Lấy và hiển thị tổng số lượt like
        const threadWithLikes = await getThreadTotalLikes(threadId, thread);
        document.getElementById('thread-likes').textContent = threadWithLikes.total_likes || '0';
        
        // Cập nhật sidebar
        updateSidebarInfo(thread);
        
        // Cập nhật badge engagement
        updateEngagementStatus(
            parseInt(document.getElementById('thread-views').textContent) || 0,
            parseInt(document.getElementById('thread-likes').textContent) || 0
        );
        
        return thread;
    } catch (error) {
        console.error('Error loading thread detail:', error);
        throw error;
    }
}

// ===== POST & COMMENT FUNCTIONS =====

// Create a new post
async function submitPost() {
    // Check if user is logged in
    if (!sessionStorage.getItem("token")) {
        alert("Please log in to create a post.");
        return;
    }

    // Get content from CKEditor
    let content = CKEDITOR.instances["post-input"].getData();
    
    // Clean the content by removing unnecessary paragraph tags
    content = cleanHtmlContent(content);
    
    if (!content.trim()) {
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
        CKEDITOR.instances["post-input"].setData("");
        loadPosts(threadId);
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again.");
    }
}

// Load posts for a thread
async function loadPosts(threadId) {
    try {
        const postsContainer = document.getElementById('posts-container');
        
        // Hiển thị trạng thái loading
        postsContainer.innerHTML = '<div class="loading-shimmer">Loading posts...</div>';
        
        const response = await fetch(`${api_key}Post/ByThread/${threadId}`);
        if (!response.ok) {
            throw new Error('Failed to load posts');
        }
        
        const posts = await response.json();
        
        // Hiển thị các bài post
        displayPosts(posts);
        
        // Cập nhật số lượng post trong sidebar
        const postCount = document.getElementById('post-count');
        if (postCount) {
            postCount.textContent = posts.length.toString();
        }
        
        return posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts-container').innerHTML = 
            '<div class="error-message">Failed to load posts. Please try again later.</div>';
        throw error;
    }
}

// Display posts in the UI
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fa fa-comment-o"></i>
                <p>No posts yet. Be the first to post!</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element
function createPostElement(post) {
    const template = document.getElementById("post-template");
    const postElement = document.importNode(template.content, true).querySelector('.post');
    
    // Thiết lập ID cho post element
    postElement.setAttribute('data-post-id', post.postId);
    
    const authorElement = postElement.querySelector(".post-author");
    if (authorElement) authorElement.textContent = post.username;
    
    const dateElement = postElement.querySelector(".post-date");
    if (dateElement) dateElement.textContent = formatDate(post.createdAt);
    
    const contentElement = postElement.querySelector(".post-content");
    if (contentElement) {
        // Clean the content and use innerHTML to preserve formatting
        contentElement.innerHTML = cleanHtmlContent(post.content);
    }
    
    // Tìm và thiết lập các buttons cho post actions
    const likeButton = postElement.querySelector('.like-button');
    const commentButton = postElement.querySelector('.comment-button');
    const editButton = postElement.querySelector('.edit-post');
    const deleteButton = postElement.querySelector('.delete-post');
    
    // Show/hide edit and delete buttons
    const isAuthor = parseInt(sessionStorage.getItem('userId')) === post.userId;
    if (isAuthor) {
        editButton.classList.remove("hide");
        deleteButton.classList.remove("hide");
        
        editButton.onclick = () => editPost(post.postId);
        deleteButton.onclick = () => deletePost(post.postId);
    }
    
    // Set up comment form
    const commentForm = postElement.querySelector(".comment-form");
    const submitCommentButton = commentForm.querySelector("button");
    submitCommentButton.onclick = function() {
        submitComment(this);
    };
    
    // Load comments for this post
    loadComments(post.postId, postElement.querySelector(".comments-container"));
    
    // Khởi tạo trạng thái like ngay sau khi tạo post element
    initializeLikeStatus(post.postId, likeButton);
    
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
    try {
        // Hiển thị loading state
        container.innerHTML = '<div class="loading-comments">Loading comments...</div>';
        
        const response = await fetch(`${api_key}Comment/ByPost/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to load comments');
        }
        
        const comments = await response.json();
        
        // Hiển thị comments
        displayComments(comments, container);
        
        // Cập nhật số lượng comments trên post
        updateCommentCount(postId, comments.length);
        
        return comments;
    } catch (error) {
        console.error(`Error loading comments for post ${postId}:`, error);
        container.innerHTML = '<div class="error-message">Failed to load comments</div>';
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

// Create a comment element with animation
function createCommentElement(comment) {
    const template = document.getElementById('comment-template');
    if (!template) {
        console.error('Comment template not found');
        return null;
    }

    const commentElement = template.content.cloneNode(true).querySelector('.comment');
    if (!commentElement) {
        console.error('Comment element not found in template');
        return null;
    }
    
    // Add new-comment class for entry animation
    commentElement.classList.add('new-comment');
    
    // Set comment data
    commentElement.setAttribute('data-comment-id', comment.commentId);
    commentElement.querySelector('.comment-author').textContent = comment.username;
    commentElement.querySelector('.comment-date').textContent = formatDate(comment.createdAt);
    commentElement.querySelector('.comment-content').textContent = comment.content;
    
    // Check permissions
    const currentUserId = parseInt(sessionStorage.getItem('userId'));
    const userRole = sessionStorage.getItem('role');
    const isAuthor = currentUserId === comment.userId;
    const isAdmin = userRole === 'Admin' || userRole === 'admin';
    
    // Edit button - only show for author
    const editButton = commentElement.querySelector('.edit-comment');
    if (editButton && isAuthor) {
        editButton.classList.remove('hide');
        editButton.onclick = () => editComment(comment.commentId);
    }
    
    // Delete button - show for author and admin
    const deleteButton = commentElement.querySelector('.delete-comment');
    if (deleteButton && (isAuthor || isAdmin)) {
        deleteButton.classList.remove('hide');
        deleteButton.onclick = () => deleteComment(comment.commentId);
    }
    
    // Remove the animation class after animation completes
    setTimeout(() => {
        commentElement.classList.remove('new-comment');
    }, 2000);
    
    return commentElement;
}

// Cập nhật hàm editComment để kết nối với CommentController
async function editComment(commentId) {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        alert('Vui lòng đăng nhập để chỉnh sửa bình luận.');
        return;
    }

    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentElement) {
        console.error('Không tìm thấy bình luận để chỉnh sửa');
        return;
    }

    const contentElement = commentElement.querySelector('.comment-content');
    const currentContent = contentElement.textContent;
    
    const newContent = prompt('Chỉnh sửa bình luận:', currentContent);
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
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể cập nhật bình luận');
        }

        contentElement.textContent = newContent;
        
        // Hiệu ứng thành công
        commentElement.classList.add('comment-updated');
        setTimeout(() => {
            commentElement.classList.remove('comment-updated');
        }, 1500);

        console.log('Bình luận đã được cập nhật thành công');

    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        alert('Không thể cập nhật bình luận. Vui lòng thử lại.');
    }
}

// Cập nhật hàm deleteComment để kết nối với CommentController
async function deleteComment(commentId) {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        alert('Vui lòng đăng nhập để xóa bình luận.');
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
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
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể xóa bình luận');
        }

        // Xóa bình luận khỏi UI
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) {
            console.error('Không tìm thấy bình luận để xóa khỏi UI');
            return;
        }
        
        const post = commentElement.closest('.post');
        
        // Hiệu ứng xóa
        commentElement.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            commentElement.remove();
            
            // Cập nhật số lượng bình luận
            if (post) {
                const commentContainer = post.querySelector('.comments-container');
                const remainingComments = commentContainer.querySelectorAll('.comment').length;
                const commentCountElement = post.querySelector('.comment-count');
                if (commentCountElement) {
                    commentCountElement.textContent = remainingComments;
                }
            }
        }, 500);

        console.log('Bình luận đã được xóa thành công');

    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        alert('Không thể xóa bình luận. Vui lòng thử lại.');
    }
}

// Helper functions
function updatePostCount(count) {
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.textContent = count;
    }
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

// Thêm chức năng toggleLike để kết nối với LikeController
async function toggleLike(button) {
    // Check if user is logged in
    if (!sessionStorage.getItem('token')) {
        Swal.fire({
            title: 'Authentication Required',
            text: 'Please log in to like posts',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6a11cb'
        });
        return;
    }

    const postElement = button.closest('.post');
    if (!postElement) {
        console.error('Post element not found');
        return;
    }

    const postId = parseInt(postElement.getAttribute('data-post-id'));
    const userId = parseInt(sessionStorage.getItem('userId'));
    
    if (isNaN(postId) || isNaN(userId)) {
        console.error(`Invalid postId (${postId}) or userId (${userId})`);
        Swal.fire({
            title: 'Error',
            text: 'Invalid data. Please reload the page.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6a11cb'
        });
        return;
    }
    
    const likeIcon = button.querySelector('i');
    const likeCount = button.querySelector('.like-count');
    const isCurrentlyLiked = likeIcon.classList.contains('fa-heart');

    // Add immediate visual feedback
    if (!isCurrentlyLiked) {
        // If not already liked, show animation and change icon
        likeIcon.className = 'fa fa-heart';
        button.classList.add('liked');
        
        // Temporarily increment like count for immediate feedback
        if (likeCount) {
            const currentLikes = parseInt(likeCount.textContent) || 0;
            likeCount.textContent = currentLikes + 1;
        }
    } else {
        // If already liked, remove heart
        likeIcon.className = 'fa fa-heart-o';
        button.classList.remove('liked');
        
        // Temporarily decrement like count
        if (likeCount) {
            const currentLikes = parseInt(likeCount.textContent) || 0;
            if (currentLikes > 0) {
                likeCount.textContent = currentLikes - 1;
            }
        }
    }
    
    try {
        console.log(`Toggling like for post ${postId} and user ${userId}`);
        
        // Send toggle like request to API
        const toggleResponse = await fetch(`${api_key}Likes/Toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                postId,
                userId
            })
        });

        if (!toggleResponse.ok) {
            const errorText = await toggleResponse.text();
            throw new Error(`Failed to toggle like: ${errorText}`);
        }
        
        // After successful toggle, update the like status and count from the server
        await initializeLikeStatus(postId, button);

    } catch (error) {
        console.error('Error toggling like:', error);
        
        // Revert visual changes if there was an error
        if (!isCurrentlyLiked) {
            likeIcon.className = 'fa fa-heart-o';
            button.classList.remove('liked');
        } else {
            likeIcon.className = 'fa fa-heart';
            button.classList.add('liked');
        }
        
        // Revert the like count
        await initializeLikeStatus(postId, button);
        
        Swal.fire({
            title: 'Error',
            text: 'Failed to update like status. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6a11cb'
        });
    }
}

// Thêm hàm kiểm tra trạng thái like của người dùng
async function checkUserLike(postId) {
    const userId = sessionStorage.getItem('userId');
    if (!userId || !postId) {
        console.log(`Skip checking like for post ${postId} - user not logged in`);
        return false;
    }

    try {
        console.log(`Checking if user ${userId} liked post ${postId}`);
        const response = await fetch(`${api_key}Likes/ByPost/${postId}`);
        
        if (!response.ok) {
            console.error(`Error response from Likes/ByPost: ${response.status}`);
            return false;
        }
        
        const likes = await response.json();
        const userLiked = likes.some(like => like.userId === parseInt(userId));
        console.log(`Like check result for post ${postId}: ${userLiked ? 'liked' : 'not liked'}`);
        return userLiked;
    } catch (error) {
        console.error('Error checking like status:', error);
        return false;
    }
}

// Cập nhật hàm getLikesCount để sử dụng API endpoint chính xác
async function getLikesCount(postId) {
    if (!postId) return 0;
    
    try {
        const response = await fetch(`${api_key}Likes/ByPost/${postId}`);
        if (!response.ok) {
            console.error(`Error fetching likes for post ${postId}: ${response.status}`);
            return 0;
        }
        
        const likesData = await response.json();
        return likesData.likeCount;
    } catch (error) {
        console.error('Error fetching likes count:', error);
        return 0;
    }
}

// Thêm hàm closeReportModal
function closeReportModal() {
    const reportModal = document.getElementById('report-modal');
    if (reportModal) {
        reportModal.classList.add('hide');
    }
    
    // Xóa dữ liệu trong form
    const reportReason = document.getElementById('report-reason');
    if (reportReason) {
        reportReason.value = '';
    }
}

// Thêm hàm showReportForm
function showReportForm(button, type = 'post') {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        Swal.fire({
            title: 'Authentication Required',
            text: 'Please log in to report content.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Get the modal element first
    const reportModal = document.getElementById('report-modal');
    
    // Xác định ID của bài viết hoặc bình luận
    let contentId, contentType;
    if (type === 'comment') {
        const comment = button.closest('.comment');
        const commentId = comment ? comment.getAttribute('data-comment-id') : null;
        contentType = 'comment';
        
        if (!commentId) {
            Swal.fire({
                title: 'Error',
                text: 'Could not determine comment ID to report',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // Tìm postId từ comment (từ phần tử cha .post)
        const post = comment.closest('.post');
        if (post) {
            const postId = post.getAttribute('data-post-id');
            if (postId) {
                // Lưu cả commentId và postId
                contentId = postId; // Sử dụng postId cho API
                // Lưu commentId vào thuộc tính khác để tham khảo nếu cần
                reportModal.setAttribute('data-related-comment-id', commentId);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Could not determine the parent post for this comment',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Could not determine the parent post for this comment',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
    } else {
        const post = button.closest('.post');
        contentId = post ? post.getAttribute('data-post-id') : null;
        contentType = 'post';
    }
    
    if (!contentId) {
        Swal.fire({
            title: 'Error',
            text: 'Could not determine content ID to report',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Lưu thông tin vào modal để sử dụng khi gửi báo cáo
    reportModal.setAttribute('data-content-id', contentId);
    reportModal.setAttribute('data-content-type', contentType);
    
    // Hiển thị modal
    reportModal.classList.remove('hide');
    
    // Focus vào textarea
    document.getElementById('report-reason').focus();
}

// Thêm hàm submitReport
function submitReport() {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        Swal.fire({
            title: 'Authentication Required',
            text: 'Please log in to report content.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        closeReportModal();
        return;
    }
    
    const reportModal = document.getElementById('report-modal');
    const contentId = reportModal.getAttribute('data-content-id');
    const contentType = reportModal.getAttribute('data-content-type');
    const reason = document.getElementById('report-reason').value.trim();
    
    if (!reason) {
        Swal.fire({
            title: 'Input Required',
            text: 'Please enter a reason for the report.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Gửi báo cáo đến server
    console.log('Submitting report:', {
        contentId,
        contentType,
        userId: sessionStorage.getItem('userId'),
        reason
    });
    
    // Determine if we're reporting a post or comment
    const apiEndpoint = `${api_key}Report/Insert`;
    const requestBody = {
        postId: parseInt(contentId),
        userId: parseInt(sessionStorage.getItem('userId')),
        reason: reason
    };
    
    // For debugging only
    console.log('Sending request to:', apiEndpoint);
    console.log('Request body:', requestBody);
    
    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error('Report submission error:', errorData);
                throw new Error(errorData.message || 'Could not send report');
            });
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            title: 'Report Submitted',
            text: 'Your report has been submitted. Thank you for helping to keep our community safe.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        closeReportModal();
    })
    .catch(error => {
        console.error('Error sending report:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while submitting your report. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}

async function debugLikeStatus() {
    if (!sessionStorage.getItem('userId')) {
        console.log('Không thể debug: Người dùng chưa đăng nhập');
        return;
    }
    
    const posts = document.querySelectorAll('.post');
    console.log(`Kiểm tra ${posts.length} bài viết`);
    
    posts.forEach(post => {
        const postId = post.getAttribute('data-post-id');
        const likeButton = post.querySelector('.like-button');
        const isLiked = likeButton.classList.contains('liked');
        
        console.log(`Bài viết ID ${postId}: UI hiển thị ${isLiked ? 'đã like' : 'chưa like'}`);
        
        // Kiểm tra trạng thái like thực tế từ server
        const userId = sessionStorage.getItem('userId');
        fetch(`${api_key}Likes/Check/${postId}/${userId}`)
            .then(response => response.json())
            .then(data => {
                console.log(`Bài viết ID ${postId}: Server trả về ${data.liked ? 'đã like' : 'chưa like'}`);
                
                // Kiểm tra nếu có sự khác biệt
                if (isLiked !== data.liked) {
                    console.error(`Không đồng bộ! Bài viết ${postId}: UI hiển thị ${isLiked ? 'đã like' : 'chưa like'} nhưng server trả về ${data.liked ? 'đã like' : 'chưa like'}`);
                }
            })
            .catch(error => {
                console.error(`Lỗi khi kiểm tra bài viết ${postId}:`, error);
                console.error(`Lỗi khi kiểm tra bài viết ${postId}:`, error.message);
            });
    });
}

// Thêm hàm editPost
async function editPost(postId) {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        alert('Vui lòng đăng nhập để chỉnh sửa bài viết.');
        return;
    }

    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) {
        console.error('Không tìm thấy bài viết để chỉnh sửa');
        return;
    }

    const contentElement = postElement.querySelector('.post-content');
    const currentContent = contentElement.textContent;
    
    const newContent = prompt('Chỉnh sửa bài viết:', currentContent);
    if (!newContent || newContent === currentContent) {
        return;
    }

    try {
        const response = await fetch(`${api_key}Post/Update/${postId}`, {
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
            throw new Error('Không thể cập nhật bài viết');
        }

        contentElement.textContent = newContent;
        
        // Hiệu ứng thành công
        postElement.classList.add('post-updated');
        setTimeout(() => {
            postElement.classList.remove('post-updated');
        }, 1500);

        console.log('Bài viết đã được cập nhật thành công');

    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
    }
}

// Thêm hàm deletePost
async function deletePost(postId) {
    // Kiểm tra đăng nhập
    if (!sessionStorage.getItem('token')) {
        alert('Vui lòng đăng nhập để xóa bài viết.');
        return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
        return;
    }

    try {
        const response = await fetch(`${api_key}Post/Delete/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể xóa bài viết');
        }

        // Xóa bài viết khỏi UI
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            // Hiệu ứng xóa
            postElement.style.animation = 'fadeOut 0.5s';
            setTimeout(() => {
                postElement.remove();
                // Cập nhật số lượng bài viết
                const postsContainer = document.getElementById('posts-container');
                const remainingPosts = postsContainer.querySelectorAll('.post').length;
                updatePostCount(remainingPosts);
            }, 500);
        }

        console.log('Bài viết đã được xóa thành công');

    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
}

// Helper function to show error messages in a popup
function showError(message) {
    // Create or get error popup
    let errorPopup = document.querySelector('.error-popup');
    if (!errorPopup) {
        errorPopup = document.createElement('div');
        errorPopup.className = 'error-popup';
        document.body.appendChild(errorPopup);
    }
    
    // Set error message
    errorPopup.textContent = message;
    
    // Show the popup
    errorPopup.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        errorPopup.style.display = 'none';
    }, 3000);
    
    // Also log the error to console
    console.error(message);
}

// Add styles for thread-content
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .thread-content {
            margin: 20px 0;
            padding: 15px;
            background-color: var(--light-bg);
            border-radius: 8px;
            box-shadow: var(--box-shadow);
            line-height: 1.6;
            color: var(--text-color);
            white-space: pre-line;
        }
    `;
    document.head.appendChild(style);
});

// Variables for report management
let currentReportId = null;
let allReports = [];

// Hàm để chuyển đổi tab trong Modctrl
function showTab(tabId) {
    const role = sessionStorage.getItem('role');
    
    // If user is a moderator and trying to access user-management, redirect to reports
    if ((role === 'Moderator' || role === 'moderator') && tabId === 'user-management') {
        tabId = 'reports-management';
    }
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show the selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Update active state for tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const buttons = document.querySelectorAll('.tab-button');
    for (let btn of buttons) {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
            break;
        }
    }
    
    // If reports tab is selected, fetch reports data
    if (tabId === 'reports-management') {
        fetchReports();
        fetchPendingReportsCount();
    }
}

// Fetch all reports
async function fetchReports() {
    try {
        const response = await fetch(`${api_key}Report`);
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }
        
        const reports = await response.json();
        allReports = reports;
        
        // Display all reports by default
        displayReports(reports);
        
        return reports;
    } catch (error) {
        console.error('Error fetching reports:', error);
        showError('Failed to load reports. Please try again later.');
    }
}

// Display reports in table
function displayReports(reports) {
    const reportTableBody = document.getElementById('report-table-body');
    if (!reportTableBody) return;
    
    reportTableBody.innerHTML = '';
    
    if (reports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">No reports found</td>`;
        reportTableBody.appendChild(emptyRow);
        return;
    }
    
    reports.forEach(report => {
        const row = document.createElement('tr');
        const statusClass = `status-${report.status.toLowerCase()}`;
        
        // Format date
        const formattedDate = formatDate(report.createdAt);
        
        row.innerHTML = `
            <td>${report.reportId}</td>
            <td>${report.username}</td>
            <td>${report.postId}</td>
            <td class="reason-cell">${truncateString(report.reason, 50)}</td>
            <td>${formattedDate}</td>
            <td class="${statusClass}">${capitalizeFirstLetter(report.status)}</td>
            <td class="report-actions">
                <button onclick="viewReportDetails(${report.reportId})" class="action-btn view-btn">
                    <i class="fa fa-eye"></i> View
                </button>
                ${report.status === 'pending' ? `
                <button onclick="updateReportStatus(${report.reportId}, 'resolved')" class="action-btn resolve-btn">
                    <i class="fa fa-check"></i> Resolve
                </button>
                <button onclick="updateReportStatus(${report.reportId}, 'rejected')" class="action-btn reject-btn">
                    <i class="fa fa-times"></i> Reject
                </button>
                ` : ''}
            </td>
        `;
        reportTableBody.appendChild(row);
    });
}

// Helper function to truncate strings
function truncateString(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Filter reports by status
function filterReports(status) {
    if (!allReports) return;
    
    // Update active button
    document.querySelectorAll('#reports-management .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter reports
    let filteredReports;
    if (status === 'all') {
        filteredReports = allReports;
    } else {
        filteredReports = allReports.filter(report => report.status.toLowerCase() === status.toLowerCase());
    }
    
    displayReports(filteredReports);
}

// Update report status (resolve or reject)
async function updateReportStatus(reportId, status) {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('You must be logged in as admin or moderator to perform this action.');
            return;
        }
        
        const response = await fetch(`${api_key}Report/UpdateStatus/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update report status');
        }
        
        await refreshReports();
        
        // If the report details modal is open, close it
        closeReportDetailsModal();
        
        // Show success message
        alert(`Report ${status === 'resolved' ? 'resolved' : 'rejected'} successfully.`);
    } catch (error) {
        console.error('Error updating report status:', error);
        showError('Failed to update report status. Please try again.');
    }
}

// Refresh reports table
async function refreshReports() {
    const refreshBtn = document.querySelector('#reports-management .refresh-btn i');
    refreshBtn.classList.add('spinning');
    
    try {
        await fetchReports();
        await fetchPendingReportsCount();
        
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 1000);
    } catch (error) {
        console.error('Error refreshing reports:', error);
        refreshBtn.classList.remove('spinning');
    }
}

// Fetch pending reports count
async function fetchPendingReportsCount() {
    try {
        const response = await fetch(`${api_key}Report/PendingCount`);
        if (!response.ok) {
            throw new Error('Failed to fetch pending reports count');
        }
        
        const count = await response.json();
        
        // Update badge
        const pendingBadge = document.getElementById('pending-reports-count');
        const pendingCount = document.querySelector('.pending-count');
        
        if (pendingBadge) {
            pendingBadge.textContent = count;
            pendingBadge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
        
        if (pendingCount) {
            pendingCount.textContent = `(${count})`;
        }
        
        return count;
    } catch (error) {
        console.error('Error fetching pending reports count:', error);
    }
}

// View report details
async function viewReportDetails(reportId) {
    try {
        currentReportId = reportId;
        
        // Find report in the cached reports
        const report = allReports.find(r => r.reportId === reportId);
        if (!report) {
            throw new Error('Report not found');
        }
        
        // Fetch post details
        const postResponse = await fetch(`${api_key}Post/${report.postId}`);
        if (!postResponse.ok) {
            throw new Error('Failed to fetch post details');
        }
        
        const post = await postResponse.json();
        
        // Update modal with report and post details
        document.getElementById('reported-post-content').innerHTML = post.content;
        document.getElementById('report-author').textContent = report.username;
        document.getElementById('report-reason-display').textContent = report.reason;
        document.getElementById('report-date').textContent = formatDate(report.createdAt);
        
        // Show or hide action buttons based on report status
        const resolveBtn = document.querySelector('.resolve-btn');
        const rejectBtn = document.querySelector('.reject-btn');
        
        if (report.status === 'pending') {
            resolveBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
        } else {
            resolveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }
        
        // Show modal
        const modal = document.getElementById('report-details-modal');
        modal.classList.remove('hide');
    } catch (error) {
        console.error('Error viewing report details:', error);
        showError('Failed to load report details. Please try again.');
    }
}

// Resolve current report
function resolveReport() {
    if (currentReportId) {
        updateReportStatus(currentReportId, 'resolved');
    }
}

// Reject current report
function rejectReport() {
    if (currentReportId) {
        updateReportStatus(currentReportId, 'rejected');
    }
}

// Close report details modal
function closeReportDetailsModal() {
    const modal = document.getElementById('report-details-modal');
    if (modal) {
        modal.classList.add('hide');
    }
    currentReportId = null;
}

// Add event listener to initialize reports on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ModCtrl page if we're on that page
    const modCtrlPage = document.getElementById('reports-management');
    if (modCtrlPage) {
        fetchPendingReportsCount();
    }
    
    // Add event listeners for Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeReportDetailsModal();
        }
    });
});

// Function to increment thread views
async function incrementThreadViews(threadId) {
    try {
        // Check if this thread has been viewed in this session
        const viewedThreads = JSON.parse(sessionStorage.getItem('viewedThreads') || '{}');
        
        // If already viewed in this session, don't increment
        if (viewedThreads[threadId]) {
            return;
        }
        
        // Mark as viewed in this session
        viewedThreads[threadId] = true;
        sessionStorage.setItem('viewedThreads', JSON.stringify(viewedThreads));
        
        // Send request to increment views
        const response = await fetch(`${api_key}Thread/IncrementViews/${threadId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.warn('Failed to increment view count:', response.status);
            return;
        }
        
        // Update views in the UI
        const viewsElement = document.getElementById('thread-views');
        if (viewsElement) {
            const currentViews = parseInt(viewsElement.textContent) || 0;
            viewsElement.textContent = (currentViews + 1).toString();
        }
        
        console.log('View count incremented for thread', threadId);
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

function setupPostActionButtons() {
    // Thiết lập các nút edit và delete cho người dùng là tác giả
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('role');
    
    // Nếu người dùng đã đăng nhập
    if (userId) {
        document.querySelectorAll('.post').forEach(post => {
            const postUserId = post.getAttribute('data-user-id');
            const editBtn = post.querySelector('.edit-post');
            const deleteBtn = post.querySelector('.delete-post');
            
            // Hiện nút chỉnh sửa và xóa nếu là người viết hoặc là admin/mod
            if (postUserId === userId || userRole === 'Admin' || userRole === 'Moderator') {
                if (editBtn) editBtn.classList.remove('hide');
                if (deleteBtn) deleteBtn.classList.remove('hide');
                
                // Thêm sự kiện cho nút edit
                if (editBtn) {
                    editBtn.addEventListener('click', function() {
                        const postId = post.getAttribute('data-post-id');
                        editPost(postId);
                    });
                }
                
                // Thêm sự kiện cho nút delete
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function() {
                        const postId = post.getAttribute('data-post-id');
                        deletePost(postId);
                    });
                }
            }
        });
    }
}

// Thêm event listener cho sự kiện DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem đang ở trang thread-detail.html không
    if (window.location.pathname.includes('thread-detail.html')) {
        initThreadDetailPage();
    }
});

function updateRuleBadges(views, likes) {
    // Reset tất cả badge
    document.querySelectorAll('.rule-badge').forEach(badge => {
        badge.classList.remove('active');
    });
    
    // Kích hoạt badge phù hợp dựa trên views và likes
    if (views > 500 && likes > 100) {
        document.getElementById('badge-platinum').classList.add('active');
    } else if (views > 200 && likes > 50) {
        document.getElementById('badge-gold').classList.add('active');
    } else if (views > 50 && likes > 10) {
        document.getElementById('badge-silver').classList.add('active');
    } else {
        document.getElementById('badge-bronze').classList.add('active');
    }
    
    // Thêm hiệu ứng chuyển động cho badge đang active
    const activeBadge = document.querySelector('.rule-badge.active');
    if (activeBadge) {
        activeBadge.classList.add('animate-pulse');
        setTimeout(() => {
            activeBadge.classList.remove('animate-pulse');
        }, 2000);
    }
}

// Delete thread function
async function deleteThread() {
    const deleteThreadBtn = document.getElementById('delete-thread-btn');
    const threadId = deleteThreadBtn.getAttribute('data-thread-id');
    
    if (!threadId) {
        Swal.fire({
            title: 'Error',
            text: 'Thread ID not found',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    // Confirm deletion
    const result = await Swal.fire({
        title: 'Delete Thread',
        text: 'Are you sure you want to delete this thread? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('You must be logged in to delete a thread');
        }
        
        const response = await fetch(`${api_key}Thread/Delete/${threadId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete thread');
        }
        
        Swal.fire({
            title: 'Success',
            text: 'Thread deleted successfully',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // Redirect to forums page after successful deletion
            window.location.href = 'forums.html';
        });
    } catch (error) {
        console.error('Error deleting thread:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to delete thread',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Function to hide CKEditor security notification
function hideCKEditorSecurityNotification() {
    // Wait for CKEditor instances to initialize
    setTimeout(() => {
        // Find all CKEditor notification elements
        const notifications = document.querySelectorAll('.cke_notification_warning');
        notifications.forEach(notification => {
            if (notification.textContent.includes('This CKEditor') && 
                notification.textContent.includes('is not secure')) {
                notification.style.display = 'none';
            }
        });
    }, 1000);
}

// Add event listener to hide notifications when instances are created
if (typeof CKEDITOR !== 'undefined') {
    CKEDITOR.on('instanceReady', function(evt) {
        hideCKEditorSecurityNotification();
    });
    
    // Call it directly for any existing instances
    hideCKEditorSecurityNotification();
}

// Function to clean HTML content by removing unnecessary paragraph tags
function cleanHtmlContent(html) {
    if (!html) return '';
    
    // Check if content is just a single paragraph
    if (html.startsWith('<p>') && html.endsWith('</p>')) {
        // Count number of <p> tags - if only one set, remove them
        const pTagsCount = (html.match(/<p>/g) || []).length;
        if (pTagsCount === 1) {
            // Strip outer paragraph tags
            return html.substring(3, html.length - 4);
        }
    }
    
    return html;
}