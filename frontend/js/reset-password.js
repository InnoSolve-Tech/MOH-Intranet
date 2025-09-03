// reset-password.js

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function showPasswordStrength(password, strengthElementId) {
  const strengthElement = document.getElementById(strengthElementId);
  if (!strengthElement) return;

  const validation = validatePassword(password);
  let strength = "Weak";
  let color = "#dc3545";

  if (validation.isValid) {
    strength = "Strong";
    color = "#28a745";
  } else if (password.length >= 6 && validation.errors.length <= 2) {
    strength = "Medium";
    color = "#ffc107";
  }

  strengthElement.innerHTML = `<span style="color: ${color}; font-weight: bold;">${strength}</span>`;

  if (validation.errors.length > 0) {
    const errorList = validation.errors
      .map((err) => `<li>${err}</li>`)
      .join("");
    strengthElement.innerHTML += `<ul style="margin: 5px 0; padding-left: 20px; color: #dc3545; font-size: 12px;">${errorList}</ul>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newPasswordForm");
  const newPasswordInput = form.newPassword;
  const confirmPasswordInput = form.confirmPassword;
  const strengthDisplayId = "passwordStrength";

  // Insert strength display element below newPassword input
  const strengthDisplay = document.createElement("div");
  strengthDisplay.id = strengthDisplayId;
  newPasswordInput.parentNode.appendChild(strengthDisplay);

  // Create message display element for submit errors/success
  let messageElem = document.createElement("p");
  messageElem.style.marginTop = "0.5em";
  form.appendChild(messageElem);

  // Extract token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  // Show password strength dynamically as user types
  newPasswordInput.addEventListener("input", () => {
    showPasswordStrength(newPasswordInput.value, strengthDisplayId);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageElem.textContent = "";
    messageElem.style.color = "red";

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!token) {
      messageElem.textContent = "Reset token is missing from URL.";
      return;
    }
    if (!newPassword || !confirmPassword) {
      messageElem.textContent = "Please fill out both password fields.";
      return;
    }
    if (newPassword !== confirmPassword) {
      messageElem.textContent = "Passwords do not match.";
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      // Show all password validation errors before submit
      messageElem.innerHTML = passwordValidation.errors
        .map((err) => `<li>${err}</li>`)
        .join("");
      return;
    }

    try {
      const response = await fetch("/api/v1/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        messageElem.textContent =
          data.error || "An error occurred. Please try again.";
      } else {
        messageElem.style.color = "green";
        messageElem.textContent =
          "Password successfully reset. You may now log in.";
        form.reset();
        strengthDisplay.innerHTML = "";
      }
    } catch (error) {
      messageElem.textContent =
        "Request failed. Please check your network connection.";
    }
  });
});
