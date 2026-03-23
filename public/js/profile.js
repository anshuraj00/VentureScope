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
                    'Authorization': token
                },
                body: formData
            });

            const data = await res.json();

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
        const res = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Could not load profile');
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
            return;
        }

        const user = data.user;

        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('company').value = user.company || '';
        document.getElementById('location').value = user.location || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('skills').value = (user.skills || []).join(', ');
        const gender = user.gender || 'male';

        document.getElementById('profileImage').value = user.profileImage || '';
        const avatarUrl = user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://127.0.0.1:5000${user.profileImage}`) : getGenderAvatar(gender);
        document.getElementById('profileAvatar').src = avatarUrl;
        document.getElementById('profileName').innerText = user.name || 'Your Name';
        document.getElementById('profileUsername').innerText = user.username ? '@' + user.username : '@yourusername';
        document.getElementById('profileBio').innerText = user.bio || 'Add a short bio to tell people about yourself.';

        document.getElementById('gender' + capitalize(gender)).checked = true;

        // if API has socials and counts, set here
        document.getElementById('twitter').value = (user.socialLinks && user.socialLinks.twitter) || '';
        document.getElementById('linkedin').value = (user.socialLinks && user.socialLinks.linkedin) || '';
        document.getElementById('github').value = (user.socialLinks && user.socialLinks.github) || '';

        document.getElementById('postsCount').innerText = user.postsCount || 0;
        document.getElementById('followersCount').innerText = user.followersCount || 0;
        document.getElementById('followingCount').innerText = user.followingCount || 0;

    } catch (error) {
        console.error('PROFILE LOAD ERROR:', error);
        alert('Server connection error');
    }
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
                'Authorization': token
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        const messageEl = document.getElementById('message');

        if (!res.ok) {
            messageEl.innerText = data.message || 'Update failed';
            messageEl.classList.add('error');
            return;
        }

        messageEl.innerText = data.message || 'Profile updated';
        messageEl.classList.remove('error');
        messageEl.classList.add('success');

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
