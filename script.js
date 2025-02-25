function togglePopup(id) {
    const popup = document.getElementById(id);
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    document.body.style.overflow = popup.style.display === 'block' ? 'hidden' : 'auto';
}

function closePopup(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('https://localhost:7125/api/RegisteredUser/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        if (!response.ok) {
            Swal.fire({ title: 'Login Failed', text: 'Invalid credentials.', icon: 'error' });
            return;
        }

        const data = await response.json();
        if (data.isAuthenticated) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('username', data.username);
            updateNavBar();
            showContent('home.html'); 
            closePopup('loginPopup');
        } else {
            Swal.fire({ title: 'Login Failed', text: 'Invalid credentials.', icon: 'error' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire({ title: 'Network Error', text: 'A network error occurred.', icon: 'error' });
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('https://localhost:7125/api/RegisteredUser/Insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                status: 'Active'
            })
        });

        if (!response.ok) {
            Swal.fire({ title: 'Registration Failed', text: 'An error occurred.', icon: 'error' });
            return;
        }

        Swal.fire({ title: 'Success!', text: 'You have registered.', icon: 'success' })
            .then(() => closePopup('registerPopup'));
    } catch (error) {
        Swal.fire({ title: 'Network Error', text: 'A network error occurred.', icon: 'error' });
    }
}

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

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    updateNavBar();
    showContent('home.html');
}

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