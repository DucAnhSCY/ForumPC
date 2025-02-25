function togglePopup(id) {
    document.getElementById(id).style.display = 'block';
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang
}

function closePopup(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto'; // Cho phép cuộn trang
}

function handleLogin() {
    // Hiển thị thông báo đăng nhập thành công
    Swal.fire({
        title: 'Đăng nhập thành công!',
        text: 'Chào mừng bạn đến với DE_FORUMS!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
    closePopup('loginPopup'); // Đóng popup sau khi thông báo
}

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
        .catch(error => console.error('Error loading content:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadContent('Home.html'); // Load Home page by default
});