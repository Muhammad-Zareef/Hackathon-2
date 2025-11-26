
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    getBlogsData();
    renderLikes();
    initSearch();
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

const renderBlogs = (blogs, order = "latest") => {
    let blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";
    let hasPosts = false;
    let start, end, step;
    if (order === "latest") {
        start = blogs.length - 1;
        end = -1;
        step = -1;
    } else {
        start = 0;
        end = blogs.length;
        step = 1;
    }
    for (let i = start; i !== end; i += step) {
        hasPosts = true;
        blogPostsContainer.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card blog-card">
                    <img src="${blogs[i].imgURL}" class="card-img-top" alt="Blog Image" style="height: 230px; border-top-left-radius: 7px; border-top-right-radius: 7px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title mb-3">${blogs[i].title}</h5>
                        <p class="text-muted"><i class="fas fa-user me-2"></i>By ${blogs[i].author}</p>
                        <p class="card-text">${blogs[i].desc}</p>
                    </div>
                    <div class="card-footer bg-white">
                        <div class="d-flex justify-content-between">
                            <small class="text-muted"><i class="fas fa-clock me-1"></i>${timeAgo(blogs[i].createdAt)}</small>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-1" id="like-btn-${blogs[i].id}" onclick="likePost(${blogs[i].id})"><i class="fas fa-thumbs-up"></i></button>
                                <span id="like-count-${blogs[i].id}"></span>
                                <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-comment"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    if (!hasPosts) {
        blogPostsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <h4 class="text-muted">Welcome! There are no blogs yet. Create one and start sharing</h4>
            </div>
        `;
    }
}

const filterBlogs = () => {
    let filter = document.getElementById("filter").value;
    if (filter === "latest") {
        renderBlogs(blogs);
        renderLikes();
    }
    else if (filter === "oldest") {
        renderBlogs(blogs, filter);
        renderLikes();
    } else {
        showMostLikedBlog();
        renderLikes();
    }
}

const searchBlog = () =>  {
    let input = document.getElementById('searchInput');
    if (input.value.trim() == "") {
        input.value = "";
        renderBlogs(blogs);
        renderLikes();
        return;
    }
    let blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";
    let blog = [];
    let isFound = false;
    for (let i = 0; i < blogs.length; i++) {
        if ((blogs[i].title).toLowerCase() == input.value.toLowerCase()) {
            blog.push(blogs[i]);
            isFound = true;
        }
    }
    if (!isFound) {
        blogPostsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <h4 class="text-muted">No blog posts found for your search</h4>
            </div>
        `;
        return;
    }
    renderBlogs(blog);
    renderLikes();
}

function initSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchBlog();
        }
    });
    btn.addEventListener("click", searchBlog);
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
    localStorage.setItem("likes", JSON.stringify(likes));
    updateLikeUI(blogId);
}

function updateLikeUI(blogId) {
    let likes = JSON.parse(localStorage.getItem("likes")) || {};
    const likeBtn = document.querySelector(`button[onclick="likePost(${blogId})"]`);
    const countSpan = document.getElementById(`like-count-${blogId}`);
    if (!countSpan) {
        return;
    }
    if (!likeBtn) {
        return;
    }
    const count = likes[blogId] ? likes[blogId].length : 0;
    if (!count) {
        countSpan.innerText = "";
        likeBtn.classList.remove("btn-primary");
        likeBtn.classList.add("btn-outline-primary");
        return;
    }
    countSpan.innerText = count;
    if (likes[blogId] && likes[blogId].includes(currentUser.id)) {
        likeBtn.classList.remove("btn-outline-primary");
        likeBtn.classList.add("btn-primary");
    } else {
        likeBtn.classList.remove("btn-primary");
        likeBtn.classList.add("btn-outline-primary");
    }
}

function renderLikes () {
    for (let i = 0; i < blogs.length; i++) {
        updateLikeUI(blogs[i].id);
    }
}

function showMostLikedBlog() {
    const mostLikedId = getMostLikedBlogId();
    if (!mostLikedId) {
        let blogPostsContainer = document.getElementById("blogPosts");
        blogPostsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <h4 class="text-muted">No likes yet!</h4>
            </div>
        `;
        return;
    }
    const blog = getBlogById(mostLikedId, blogs);
    if (!blog) return alert("Blog not found!");

    renderBlogs([blog]);  // send as single-blog array
    renderLikes();
}

function getMostLikedBlogId() {
    let likes = JSON.parse(localStorage.getItem("likes")) || {};
    let topBlogId = null;
    let maxLikes = -1;
    for (let blogId in likes) {
        let count = likes[blogId].length;
        if (count > maxLikes) {
            maxLikes = count;
            topBlogId = blogId;
        }
    }
    return topBlogId;
}

function getBlogById(blogId, blogs) {
    return blogs.find(blog => blog.id == blogId);
}

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    for (let key in intervals) {
        const value = intervals[key];
        if (seconds >= value) {
            const count = Math.floor(seconds / value);
            return `${count}${key[0]} ago`; // "1m ago", "2h ago"
        }
    }
    return "just now";
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
