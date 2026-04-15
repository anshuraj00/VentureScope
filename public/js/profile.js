console.log('profile.js loaded ✅');

const token = localStorage.getItem('token');

function ensureAuth() {
    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

if (ensureAuth()) {
    fetchProfile();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

const editSection = document.getElementById('editSection');
const editProfileBtn = document.getElementById('editProfileBtn');
const avatarEditBtn = document.getElementById('avatarEditBtn');
const profileImageFile = document.getElementById('profileImageFile');

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (!editSection) return;
        const isHidden = editSection.style.display === 'none' || getComputedStyle(editSection).display === 'none';
        editSection.style.display = isHidden ? 'block' : 'none';
        editProfileBtn.textContent = isHidden ? 'Close Edit' : 'Edit Profile';
    });
}

if (avatarEditBtn) {
    avatarEditBtn.addEventListener('click', () => {
        profileImageFile.click();
    });
}

if (profileImageFile) {
    profileImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const res = await fetch('http://localhost:5000/api/users/profile/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            let data = {};
            if (res.headers.get('content-type')?.includes('application/json')) {
                data = await res.json();
            }

            if (res.ok) {
                document.getElementById('profileAvatar').src = data.profileImage;
                document.getElementById('profileImage').value = data.profileImage; // Update the hidden field too
                alert('Profile picture updated successfully! ✅');
            } else {
                alert(data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('IMAGE UPLOAD ERROR:', error);
            alert('Server connection error');
        }
    });
}

function setValueIfExists(id, value) {
    const el = document.getElementById(id);
    if (el) {
        if ("value" in el) el.value = value;
        else el.innerText = value;
    }
}

function getGenderAvatar(gender) {
    if (gender === 'female') {
        return 'https://cdn-icons-png.flaticon.com/512/1946/1946315.png';
    } else if (gender === 'other') {
        return 'https://cdn-icons-png.flaticon.com/512/1946/1946363.png';
    }
    return 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchProfile() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        let isOwnProfile = !userId;
        let isFollowing = false;

        let res, data;
        if (userId) {
            res = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
        } else {
            res = await fetch('http://localhost:5000/api/users/profile', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
        }

        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (!res.ok) {
            alert(data.message || 'Could not load profile');
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
            return;
        }

        const user = data.user;
        if (data.isFollowing !== undefined) isFollowing = data.isFollowing;

        // Hide edit button and avatar edit if not own profile
        const editBtn = document.getElementById('editProfileBtn');
        const avatarEditBtn = document.getElementById('avatarEditBtn');
        const followBtn = document.getElementById('followBtn');
        const chatBtn = document.getElementById('chatBtn');

        if (!isOwnProfile) {
            if (editBtn) editBtn.style.display = 'none';
            if (avatarEditBtn) avatarEditBtn.style.display = 'none';
            if (followBtn) {
                followBtn.style.display = 'inline-block';
                followBtn.innerText = isFollowing ? 'Unfollow' : 'Follow';
                followBtn.onclick = () => toggleFollow(userId, isFollowing);
            }
            if (chatBtn) {
                chatBtn.style.display = 'inline-block';
                chatBtn.onclick = () => {
                    window.location.href = `dashboard.html?chatWith=${userId}`;
                };
            }
        } else {
            if (followBtn) followBtn.style.display = 'none';
            if (chatBtn) chatBtn.style.display = 'none';
        }

        setValueIfExists('name', user.name || '');
        setValueIfExists('email', user.email || '');
        setValueIfExists('bio', user.bio || '');
        setValueIfExists('company', user.company || '');
        setValueIfExists('location', user.location || '');
        setValueIfExists('phone', user.phone || '');
        setValueIfExists('skills', (user.skills || []).join(', '));
        const gender = user.gender || 'male';

        setValueIfExists('profileImage', user.profileImage || '');

        const avatarUrl = user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://127.0.0.1:5000${user.profileImage}`) : getGenderAvatar(gender);
        const profileAvatarEl = document.getElementById('profileAvatar');
        if (profileAvatarEl) profileAvatarEl.src = avatarUrl;

        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl) profileNameEl.innerText = user.name || 'Your Name';

        const profileUsernameEl = document.getElementById('profileUsername');
        if (profileUsernameEl) profileUsernameEl.innerText = user.username ? '@' + user.username : '@yourusername';

        const profileBioEl = document.getElementById('profileBio');
        if (profileBioEl) profileBioEl.innerText = user.bio || 'Add a short bio to tell people about yourself.';

        const genderInput = document.getElementById('gender' + capitalize(gender));
        if (genderInput) genderInput.checked = true;

        setValueIfExists('twitter', (user.socialLinks && user.socialLinks.twitter) || '');
        setValueIfExists('linkedin', (user.socialLinks && user.socialLinks.linkedin) || '');
        setValueIfExists('github', (user.socialLinks && user.socialLinks.github) || '');

        const followersEl = document.getElementById('followersCount');
        if (followersEl) followersEl.innerText = (user.followers || []).length;
        const followingEl = document.getElementById('followingCount');
        if (followingEl) followingEl.innerText = (user.following || []).length;

        loadProfilePosts();

    } catch (error) {
        console.error('PROFILE LOAD ERROR:', error);
        alert('Server connection error');
    }
}

function buildProfileImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? imagePath : `http://127.0.0.1:5000/${imagePath}`;
}

async function toggleFollow(userId, currentlyFollowing) {
    try {
        const endpoint = currentlyFollowing ? `http://localhost:5000/api/users/unfollow/${userId}` : `http://localhost:5000/api/users/follow/${userId}`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            const followBtn = document.getElementById('followBtn');
            if (followBtn) {
                followBtn.innerText = currentlyFollowing ? 'Follow' : 'Unfollow';
                followBtn.onclick = () => toggleFollow(userId, !currentlyFollowing);
            }
            // Update followers count
            const followersEl = document.getElementById('followersCount');
            if (followersEl) {
                const currentCount = parseInt(followersEl.innerText);
                followersEl.innerText = currentlyFollowing ? currentCount - 1 : currentCount + 1;
            }
            alert(data.message);
        } else {
            alert(data.message || 'Failed to update follow status');
        }
    } catch (error) {
        console.error('FOLLOW ERROR:', error);
        alert('Server connection error');
    }
}

async function loadProfilePosts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        const endpoint = userId ? `http://localhost:5000/api/ideas/my?userId=${userId}` : 'http://localhost:5000/api/ideas/my';

        const res = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (!res.ok) {
            console.error('Failed to load posts', data);
            return;
        }

        const approvedIdeas = (data || []).filter(idea => idea.status === 'approved');
        const postsEl = document.getElementById('postsCount');
        if (postsEl) postsEl.innerText = approvedIdeas.length;

        renderProfileGallery(approvedIdeas);
    } catch (error) {
        console.error('PROFILE POSTS LOAD ERROR:', error);
    }
}

function renderProfileGallery(ideas) {
    const gallery = document.getElementById('profileGallery');
    if (!gallery) return;

    if (!ideas || ideas.length === 0) {
        gallery.innerHTML = `
            <div class="gallery-item">No posts yet</div>
            <div class="gallery-item">Add your first idea</div>
            <div class="gallery-item">Stay creative</div>
        `;
        return;
    }

    gallery.innerHTML = ideas.map(idea => {
        const imageUrl = idea.image && idea.image.length ? buildProfileImageUrl(idea.image[0]) : '';
        return `
            <div class="gallery-item" title="${idea.title}" onclick="openProfileIdeaModal('${idea._id}')">
                ${imageUrl ? `<img src="${imageUrl}" alt="${idea.title}" style="width:100%; height:100%; object-fit:cover; border-radius: 10px;">` : `<span>${idea.title}</span>`}
            </div>
        `;
    }).join('');
}

async function openProfileIdeaModal(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/ideas/${id}`);
        const idea = await res.json();
        if (!res.ok) {
            console.error('Failed to load idea', idea);
            return;
        }

        const imagesEl = document.getElementById('postModalImages');
        const titleEl = document.getElementById('postModalTitle');
        const categoryEl = document.getElementById('postModalCategory');
        const descriptionEl = document.getElementById('postModalDescription');
        const dateEl = document.getElementById('postModalDate');

        if (!imagesEl || !titleEl || !categoryEl || !descriptionEl || !dateEl) return;

        titleEl.innerText = idea.title || 'Untitled';
        categoryEl.innerText = idea.category || 'General';
        descriptionEl.innerText = idea.description || '';
        dateEl.innerText = `Posted on ${new Date(idea.createdAt).toLocaleDateString()}`;

        if (idea.image && idea.image.length > 0) {
            imagesEl.innerHTML = idea.image.map(imagePath => `
                <div class="post-modal-image-item">
                    <img src="${buildProfileImageUrl(imagePath)}" alt="${idea.title}">
                </div>
            `).join('');
        } else {
            imagesEl.innerHTML = `<div class="post-modal-image-item no-image">No image available</div>`;
        }

        document.getElementById('postModal').style.display = 'block';
    } catch (error) {
        console.error('OPEN POST ERROR:', error);
    }
}

function closeProfileIdeaModal() {
    const modal = document.getElementById('postModal');
    if (modal) modal.style.display = 'none';
}

async function saveProfile() {
    if (!ensureAuth()) return;

    const selectedGender = document.querySelector('input[name="gender"]:checked');

    const profileImageValue = document.getElementById('profileImage').value.trim();
    const profileImageUrl = profileImageValue ? (profileImageValue.startsWith('http') ? profileImageValue : `http://127.0.0.1:5000${profileImageValue}`) : '';

    const payload = {
        name: document.getElementById('name').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        company: document.getElementById('company').value.trim(),
        location: document.getElementById('location').value.trim(),
        gender: selectedGender ? selectedGender.value : 'other',
        phone: document.getElementById('phone').value.trim(),
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        profileImage: profileImageUrl,
        twitter: document.getElementById('twitter').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        github: document.getElementById('github').value.trim()
    };

    try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        const messageEl = document.getElementById('message');

        if (!res.ok) {
            if (messageEl) {
                messageEl.innerText = data.message || 'Update failed';
                messageEl.classList.add('error');
            } else {
                alert(data.message || 'Update failed');
            }
            return;
        }

        if (messageEl) {
            messageEl.innerText = data.message || 'Profile updated';
            messageEl.classList.remove('error');
            messageEl.classList.add('success');
        }


        // Update the displayed profile avatar with the saved image
        if (profileImageUrl) {
            document.getElementById('profileAvatar').src = profileImageUrl;
        }

        // Update profile display info
        document.getElementById('profileName').innerText = payload.name || 'Your Name';
        document.getElementById('profileBio').innerText = payload.bio || 'Add a short bio to tell people about yourself.';

    } catch (error) {
        console.error('PROFILE SAVE ERROR:', error);
        alert('Server connection error');
    }
}
