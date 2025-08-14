document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  // Validate required fields
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "subject",
    "message",
  ];
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    if (!field.value.trim()) {
      field.style.borderColor = "#dc3545";
      isValid = false;
    } else {
      field.style.borderColor = "#ddd";
    }
  });

  // Validate email format
  const emailField = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailField.value && !emailRegex.test(emailField.value)) {
    emailField.style.borderColor = "#dc3545";
    isValid = false;
  }

  if (!isValid) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  // Log the data (in a real application, this would be sent to a server)
  console.log("Contact Form Data:", data);

  // Show success message
  alert("Thank you for your message! We will get back to you soon.");

  // Reset form
  this.reset();
});

// Real-time validation feedback
document
  .querySelectorAll("input[required], select[required], textarea[required]")
  .forEach((field) => {
    field.addEventListener("blur", function () {
      if (this.value.trim()) {
        this.style.borderColor = "#ddd";
      }
    });
  });
