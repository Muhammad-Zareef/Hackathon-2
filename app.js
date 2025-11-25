
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});

function checkAuth() {
    let user = JSON.parse(localStorage.getItem("currentUser")) || false;
    if (user) {
        window.location.href = "./home/home.html";
    }
}

let notyf = new Notyf({
    position: {
        x: 'left',
        y: 'bottom'
    }
});

let users = JSON.parse(localStorage.getItem("users")) || [];

const signup = () => {
    let fullName = document.getElementById("fullName").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (fullName.trim() == "" || email.trim() == "" || password.trim() == "") {
        notyf.error("Please fill out fields");
        return;
    }
    if (password.length < 5) {
        notyf.error("Password must be at least 5 characters long");
        return;
    }
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            notyf.error("Email already exist.");
            return;
        }
    }
    users.push({ fullName, email, password, id: Date.now() });
    setTimeout(() => {
        showForm('login');
    }, 1000);
    notyf.success("Account created successfully");
    localStorage.setItem("users", JSON.stringify(users));
}

const login = () => {
    let loginEmail = document.getElementById("loginEmail").value;
    let loginPassword = document.getElementById("loginPassword").value;
    let isValid = false;
    let currentUser = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === loginEmail && users[i].password === loginPassword) {
            isValid = true;
            currentUser = users[i];
            break;
        }
    }
    if (isValid) {
        setTimeout(() => {
            window.location.href = "./home/home.html";
        }, 1000);
        notyf.success("User Login successfully");
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
        notyf.error("Invalid credentials");
    }
}
