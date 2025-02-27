//NavBar
function hideIconBar(){
    var iconBar = document.getElementById("iconBar");
    var navigation = document.getElementById("navigation");
    iconBar.setAttribute("style", "display:none;");
    navigation.classList.remove("hide");
}

function showIconBar(){
    var iconBar = document.getElementById("iconBar");
    var navigation = document.getElementById("navigation");
    iconBar.setAttribute("style", "display:block;");
    navigation.classList.add("hide");
}

//Comment
function showComment(){
    var commentArea = document.getElementById("comment-area");
    commentArea.classList.remove("hide");
}

//Reply
function showReply(){
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

// Login Function (Basic Example)
function login() {
    let username = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    if (username === "" || password === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter both username and password!',
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Logging in as ${username}`,
    });
    closePopup("login-popup");
}

// Register Function (Basic Example)
function register() {
    let username = document.getElementById("register-username").value;
    let password = document.getElementById("register-password").value;
    let password2 = document.getElementById("register-password2").value;
    let email = document.getElementById("register-email").value;

    if (username === "" || password === "" || password2 === "" || email === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill out all fields!',
        });
        return;
    }

    if (password !== password2) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Passwords do not match!',
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Registering ${username} with email ${email}`,
    });
    closePopup("register-popup");
}
