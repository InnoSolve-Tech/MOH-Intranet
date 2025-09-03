// forgot-password.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotPasswordForm");
  const emailInput = form.email;

  // Create an element to display error messages if not in HTML already
  let errorMessage = document.createElement("p");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "0.5em";
  form.appendChild(errorMessage);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = ""; // Clear previous error

    const email = emailInput.value.trim();
    if (!email) {
      errorMessage.textContent = "Please enter your email address.";
      return;
    }

    try {
      const response = await fetch("/api/v1/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error message returned from server or generic
        errorMessage.textContent =
          data.error || "An error occurred, please try again.";
      } else {
        // Success scenario: Show confirmation message or redirect
        errorMessage.style.color = "green";
        errorMessage.textContent =
          "If that email address is registered, a reset link has been sent.";
        form.reset();
      }
    } catch (error) {
      errorMessage.textContent =
        "Failed to send request. Please check your internet connection.";
    }
  });
});
