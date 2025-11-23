
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    getBlogsData();
});

let currentUser = "";

function checkAuth() {
    let user = JSON.parse(localStorage.getItem("currentUser")) || false;
    if (!user) {
        window.location.href = "../index.html";
        return;
    }
    renderUserName(user);
    currentUser = user;
}

const renderUserName = (user) => {
    let span = document.getElementsByClassName('user-welcome');
    span[0].innerHTML = `<i class="fas fa-user-circle me-1"></i>Welcome, ${user.fullName}!`;
}

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

const getBlogsData = () => {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];
    renderBlogs(blogs);
}

const renderBlogs = (blogs) => {
    let blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";
    for (let i = blogs.length-1; i >= 0; i--) {
        blogPostsContainer.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card blog-card">
                    <div class="card-header">
                        <h5 class="card-title text-white mb-0">${blogs[i].title}</h5>
                    </div>
                    <div>
                        <img src="${blogs[i].imgURL}" class="card-img-top" alt="Blog Image" style="height: 200px; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <p class="text-muted"><i class="fas fa-user me-2"></i>By ${blogs[i].author}</p>
                        <p class="card-text">${blogs[i].desc}</p>
                    </div>
                    <div class="card-footer bg-white">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted"><i class="fas fa-clock me-1"></i>${new Date(blogs[i].createdAt).toLocaleString()}</small>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-1" id="like-btn-${blogs[i].id}" onclick="likePost(${blogs[i].id})"><i class="fas fa-thumbs-up"></i></button>
                                <span id="like-count-${blogs[i].id}">0</span>
                                <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-comment"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

const filterBlogs = () => {
    let filter = document.getElementById("filter").value;
    if (filter === "latest") {
        renderBlogs(blogs);
    }
    else if (filter === "oldest") {
        renderOldest(blogs);
    }
}

const renderOldest = (blogs) => {
    let blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";
    for (let i = 0; i < blogs.length; i++) {
        blogPostsContainer.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card blog-card">
                    <div class="card-header">
                        <h5 class="card-title text-white mb-0">${blogs[i].title}</h5>
                    </div>
                    <div>
                        <img src="${blogs[i].imgURL}" class="card-img-top" alt="Blog Image" style="height: 200px; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <p class="text-muted"><i class="fas fa-user me-2"></i>By ${blogs[i].author}</p>
                        <p class="card-text">${blogs[i].desc}</p>
                    </div>
                    <div class="card-footer bg-white">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted"><i class="fas fa-clock me-1"></i>${new Date(blogs[i].createdAt).toLocaleString()}</small>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-1" id="like-btn-${blogs[i].id}" onclick="likePost(${blogs[i].id})"><i class="fas fa-thumbs-up"></i></button>
                                <span id="like-count-${blogs[i].id}">0</span>
                                <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-comment"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

const searchBlog = () =>  {
    let btn = document.getElementById('searchBtn');
    let input = document.getElementById('searchInput').value;
    let blog = []
    for (let i = 0; i < blogs.length; i++) {
        if ((blogs[i].title).toLowerCase() == input.toLowerCase()) {
            blog.push(blogs[i]);
        }
    }
    renderBlogs(blog);
}

let likes = JSON.parse(localStorage.getItem("likes")) || {};

const likePost = (blogId) => {
    if (!likes[blogId]) {
        likes[blogId] = [];
    }
    if (likes[blogId].includes(currentUser.id)) {
        let updatedLikes = [];
        for (let i = 0; i < likes[blogId].length; i++) {
            if (likes[blogId][i] !== currentUser.id) {
                updatedLikes.push(likes[blogId][i]);
            }
        }
        likes[blogId] = updatedLikes;
    } else {
        likes[blogId].push(currentUser.id);
    }
    console.log("done");
    localStorage.setItem("likes", JSON.stringify(likes));
    updateLikeUI(blogId);
}

function updateLikeUI(blogId) {
    let likes = JSON.parse(localStorage.getItem("likes")) || {};
    const likeBtn = document.querySelector(`button[onclick="likePost(${blogId})"]`);
    const countSpan = document.getElementById(`like-count-${blogId}`);
    const count = likes[blogId] ? likes[blogId].length : 0;
    countSpan.innerText = count;
    if (likes[blogId] && likes[blogId].includes(currentUser.id)) {
        console.log("inside")
        likeBtn.classList.remove("btn-outline-primary");
        likeBtn.classList.add("btn-primary");
    }
}

const logout = () => {
    Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        showConfirmButton: false,
        timer: 1250
    });
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 1000);
    localStorage.removeItem("currentUser");
}
