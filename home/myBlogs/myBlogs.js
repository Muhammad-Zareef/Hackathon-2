
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    getBlogsData();
    initSearch();
});

let currentUser = undefined;

function checkAuth() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        window.location.href = "../../index.html";
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

const openUpdateModal = (id, title, author, description) => {
    document.getElementById('postId').value = id;
    document.getElementById('postTitle').value = title;
    document.getElementById('postAuthor').value = author;
    document.getElementById('postDescription').value = description;
    const updateModal = new bootstrap.Modal(document.getElementById('updatePostModal'));
    updateModal.show();
}

const updateBlog = () => {
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.closest('#updatePostModal')) {
        focusedElement.blur();
    }
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('postAuthor').value;
    const desc = document.getElementById('postDescription').value;
    let img = document.querySelector("#updateBlogImage");
    if (title.trim() == "" || author.trim() == "" || desc.trim() == "") {
        Swal.fire({
            icon: "error",
            title: "Missing Information!",
            text: "Please fill in all required fields"
        });
        return;
    }
    const updateModal = bootstrap.Modal.getInstance(document.getElementById('updatePostModal'));
    updateModal.hide();
    Swal.fire({
        title: "Updated Successfully",
        text: "Your changes have been saved",
        icon: "success",
        showConfirmButton: false,
        timer: 2000
    });
    if (img.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(img.files[0]);
        reader.onload = function (e) {
            img = e.target.result;
            for (let i = 0; i < blogs.length; i++) {
                if (blogs[i].id == id) {
                    blogs[i].title = title;
                    blogs[i].author = author;
                    blogs[i].desc = desc;
                    blogs[i].imgURL = img;
                    break;
                }
            }
            localStorage.setItem("blogs", JSON.stringify(blogs));
            getBlogsData();
        }
    } else {
        for (let i = 0; i < blogs.length; i++) {
            if (blogs[i].id == id) {
                blogs[i].title = title;
                blogs[i].author = author;
                blogs[i].desc = desc;
                break;
            }
        }
        localStorage.setItem("blogs", JSON.stringify(blogs));
        getBlogsData();
    }
}

const deleteBlog = (id) => {
    Swal.fire({
        title: "Are you sure?",
        text: "This blog post will be permanently deleted",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Deleted!",
                text: "The blog post has been successfully deleted",
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
            for (let i = 0; i < blogs.length; i++) {
                if (blogs[i].id === id) {
                    blogs.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem("blogs", JSON.stringify(blogs));
            getBlogsData();
        }
    });
}

function renderBlogs(blogs, order = "latest") {
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
        if (blogs[i].uid === currentUser.id) {
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
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openUpdateModal('${blogs[i].id}', '${blogs[i].title}', '${blogs[i].author}', '${blogs[i].desc}', '${blogs[i].imgURL}')"><i class="fas fa-edit" title="Edit"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog(${blogs[i].id})"><i class="fas fa-trash delete-btn" title="Delete"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    if (!hasPosts) {
        blogPostsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <h4 class="text-muted">You haven’t published any blog posts yet</h4>
            </div>
        `;
    }
}

const searchBlog = () =>  {
    let input = document.getElementById('searchInput');
    if (input.value.trim() == "") {
        input.value = "";
        renderBlogs(blogs);
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

const filterBlogs = () => {
    let filter = document.getElementById("filter").value;
    if (filter === "latest") {
        renderBlogs(blogs);
    }
    else if (filter === "oldest") {
        renderBlogs(blogs, filter);
    }
}

document.getElementById('blogForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const uid = currentUser.id;
    let title = document.getElementById("blogTitle").value;
    let author = document.getElementById("blogAuthor").value;
    let desc = document.getElementById("blogDescription").value;
    let img = document.querySelector('#blogImage').files[0];
    if (title.trim() == "" || author.trim() == "" || desc.trim() == "" || !img) {
        Swal.fire({
            icon: "error",
            title: "Missing Information!",
            text: "Please fill in all required fields"
        });
        this.reset();
        return;
    }
    if (img) {
        const reader = new FileReader();
        reader.readAsDataURL(img);
        reader.onload = function(e) {
            const imgURL = e.target.result;
            blogs.push({ title, author, desc, id: Date.now(), uid, imgURL, createdAt: Date.now() });
            Swal.fire({
                title: "Blog Published!",
                text: "Your blog post has been published successfully",
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
            localStorage.setItem("blogs", JSON.stringify(blogs));
            getBlogsData();
        }
    }
    this.reset();
});

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
        window.location.href = "../../index.html";
    }, 1000);
    localStorage.removeItem("currentUser");
}
