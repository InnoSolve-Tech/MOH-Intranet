document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
})

function handleLogin(e) {
    e.preventDefault(); // stop GET submission

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Mock validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Simulate login success
    alert('Mock login successful');
    window.location.href = '/menu/partners.html';
}