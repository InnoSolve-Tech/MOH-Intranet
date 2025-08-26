document.addEventListener("DOMContentLoaded", function () {
  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const userid = document.getElementById("userid").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!userid || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch("/api/v1/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userid, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || "Login failed");
      return;
    }

    // Redirect on success
    window.location.href = "/menu/user-profile.html";
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred. Please try again.");
  }
}
