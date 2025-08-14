let currentStep = 1;
let addressCount = 1;
let contactCount = 1;
let supportYearCount = 1;

// Step navigation
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < 3) {
      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.remove("active");
      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.add("completed");
      document
        .querySelector(`.form-step[data-step="${currentStep}"]`)
        .classList.remove("active");

      currentStep++;

      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.add("active");
      document
        .querySelector(`.form-step[data-step="${currentStep}"]`)
        .classList.add("active");

      updateNavigationButtons();
      scrollToTop();
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.remove("active");
    document
      .querySelector(`.form-step[data-step="${currentStep}"]`)
      .classList.remove("active");

    currentStep--;

    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.remove("completed");
    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.add("active");
    document
      .querySelector(`.form-step[data-step="${currentStep}"]`)
      .classList.add("active");

    updateNavigationButtons();
    scrollToTop();
  }
}

function scrollToTop() {
  document.querySelector(".registration-container").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function updateNavigationButtons() {
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const submitBtn = document.querySelector(".submit-btn");

  prevBtn.style.display = currentStep > 1 ? "block" : "none";
  nextBtn.style.display = currentStep < 3 ? "block" : "none";
  submitBtn.style.display = currentStep === 3 ? "block" : "none";
}

function addAddress() {
  const container = document.getElementById("addressesContainer");
  const addressItem = document.createElement("div");
  addressItem.className = "address-item";
  addressItem.innerHTML = `
    <input type="text" name="addresses[${addressCount}]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    <button type="button" class="remove-btn" onclick="removeAddress(this)">×</button>
  `;
  container.appendChild(addressItem);
  addressCount++;
}

function removeAddress(button) {
  const addressItem = button.closest(".address-item");
  if (document.querySelectorAll(".address-item").length > 1) {
    addressItem.remove();
  } else {
    showNotification("At least one address is required", "error");
  }
}

function addContact() {
  const container = document.getElementById("contactsContainer");
  const contactItem = document.createElement("div");
  contactItem.className = "contact-item";
  contactItem.innerHTML = `
    <button type="button" class="remove-btn" onclick="removeContact(this)">×</button>
    <div class="form-row">
      <div class="form-group">
        <input type="text" name="contacts[${contactCount}][name]" placeholder="Contact Name *" required>
      </div>
      <div class="form-group">
        <input type="text" name="contacts[${contactCount}][position]" placeholder="Position *" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <input type="tel" name="contacts[${contactCount}][phone]" placeholder="Phone Number *" required>
      </div>
      <div class="form-group">
        <input type="email" name="contacts[${contactCount}][email]" placeholder="Email Address *" required>
      </div>
    </div>
  `;
  container.appendChild(contactItem);
  contactCount++;
}

function removeContact(button) {
  const contactItem = button.closest(".contact-item");
  if (document.querySelectorAll(".contact-item").length > 1) {
    contactItem.remove();
  } else {
    showNotification("At least one contact is required", "error");
  }
}

function addSupportYear() {
  const container = document.getElementById("supportYearsContainer");
  const supportDiv = document.createElement("div");
  supportDiv.className = "dynamic-item";
  supportDiv.innerHTML = `
    <button type="button" class="remove-btn" onclick="removeSupportYear(this)">×</button>
    <div class="form-row">
      <div class="form-group">
        <label>Year *</label>
        <input type="number" name="supportYears[${supportYearCount}][year]" min="2020" max="2030" required>
      </div>
      <div class="form-group">
        <label>Level of Support *</label>
        <select name="supportYears[${supportYearCount}][level]" required>
          <option value="">Select Level</option>
          <option value="Primary">Primary</option>
          <option value="Secondary">Secondary</option>
          <option value="Tertiary">Tertiary</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Thematic Areas Supported *</label>
      <input type="text" name="supportYears[${supportYearCount}][thematicAreas]" placeholder="e.g., Health, Education, Agriculture" required>
    </div>
    <div class="form-group">
      <label>Districts Supported *</label>
      <select name="supportYears[${supportYearCount}][districts]" multiple class="districts-select" required>
        <option value="Kampala">Kampala</option>
        <option value="Wakiso">Wakiso</option>
        <option value="Mukono">Mukono</option>
        <option value="Jinja">Jinja</option>
        <option value="Mbale">Mbale</option>
        <option value="Gulu">Gulu</option>
        <option value="Lira">Lira</option>
        <option value="Mbarara">Mbarara</option>
        <option value="Kasese">Kasese</option>
        <option value="Fort Portal">Fort Portal</option>
        <option value="Hoima">Hoima</option>
        <option value="Masaka">Masaka</option>
        <option value="Soroti">Soroti</option>
        <option value="Arua">Arua</option>
        <option value="Kabale">Kabale</option>
        <option value="Moroto">Moroto</option>
        <option value="Kitgum">Kitgum</option>
        <option value="Pader">Pader</option>
        <option value="Adjumani">Adjumani</option>
        <option value="Moyo">Moyo</option>
      </select>
      <small>Hold Ctrl/Cmd to select multiple districts</small>
    </div>
  `;
  container.appendChild(supportDiv);
  supportYearCount++;
}

function removeSupportYear(button) {
  button.parentElement.remove();
}

// MoU checkbox functionality
document.getElementById("hasMou").addEventListener("change", function () {
  const mouUpload = document.getElementById("mouUpload");
  mouUpload.style.display = this.checked ? "block" : "none";
});

function validateCurrentStep() {
  const currentStepElement = document.querySelector(
    `.form-step[data-step="${currentStep}"]`,
  );

  if (!currentStepElement) {
    console.error(`Step element not found for step ${currentStep}`);
    return false;
  }

  let isValid = true;
  let firstErrorField = null;

  if (currentStep === 1) {
    // Validate basic form fields
    const requiredFields = currentStepElement.querySelectorAll(
      "input[required], select[required]",
    );

    // Clear previous validation states
    const formGroups = currentStepElement.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      if (group && group.classList) {
        group.classList.remove("error", "success");
        const errorMsg = group.querySelector(".error-message");
        if (errorMsg && errorMsg.classList) {
          errorMsg.classList.remove("show");
        }
      }
    });

    requiredFields.forEach((field) => {
      if (!field) return;

      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      let fieldValid = true;
      let errorMessage = "";

      if (!field.value.trim()) {
        fieldValid = false;
        errorMessage = "This field is required";
      } else {
        // Specific validation based on field type
        if (field.type === "email" && !isValidEmail(field.value)) {
          fieldValid = false;
          errorMessage = "Please enter a valid email address";
        } else if (field.type === "tel" && !isValidPhone(field.value)) {
          fieldValid = false;
          errorMessage = "Please enter a valid phone number";
        }
      }

      if (!fieldValid) {
        formGroup.classList.add("error");
        showErrorMessage(formGroup, errorMessage);
        if (!firstErrorField) firstErrorField = field;
        isValid = false;
      } else {
        formGroup.classList.add("success");
      }
    });

    const addressItems = document.querySelectorAll(".address-item");
    let validAddresses = 0;
    addressItems.forEach((item) => {
      if (!item) return;
      const addressInput = item.querySelector('input[name*="addresses"]');
      if (addressInput && addressInput.value.trim()) {
        validAddresses++;
      }
    });

    if (validAddresses === 0) {
      showNotification("Please enter at least one address", "error");
      isValid = false;
    }
  } else if (currentStep === 2) {
    const contactItems = document.querySelectorAll(".contact-item");
    let validContacts = 0;
    contactItems.forEach((item) => {
      if (!item) return;

      const nameInput = item.querySelector('input[name*="[name]"]');
      const positionInput = item.querySelector('input[name*="[position]"]');
      const phoneInput = item.querySelector('input[name*="[phone]"]');
      const emailInput = item.querySelector('input[name*="[email]"]');

      if (
        nameInput &&
        nameInput.value.trim() &&
        positionInput &&
        positionInput.value.trim() &&
        phoneInput &&
        phoneInput.value.trim() &&
        emailInput &&
        emailInput.value.trim() &&
        isValidEmail(emailInput.value) &&
        isValidPhone(phoneInput.value)
      ) {
        validContacts++;
      }
    });

    if (validContacts === 0) {
      showNotification(
        "Please complete at least one contact with valid email and phone",
        "error",
      );
      isValid = false;
    }
  } else if (currentStep === 3) {
    const requiredFields = currentStepElement.querySelectorAll(
      "input[required], select[required]",
    );

    // Clear previous validation states
    const formGroups = currentStepElement.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      if (group && group.classList) {
        group.classList.remove("error", "success");
        const errorMsg = group.querySelector(".error-message");
        if (errorMsg && errorMsg.classList) {
          errorMsg.classList.remove("show");
        }
      }
    });

    requiredFields.forEach((field) => {
      if (!field || !field.offsetParent) return;

      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      let fieldValid = true;
      let errorMessage = "";

      if (field.multiple && field.classList.contains("districts-select")) {
        // Multi-select validation
        if (field.selectedOptions.length === 0) {
          fieldValid = false;
          errorMessage = "Please select at least one district";
        }
      } else if (!field.value || !field.value.toString().trim()) {
        fieldValid = false;
        errorMessage = "This field is required";
      } else if (field.type === "number") {
        const year = Number.parseInt(field.value);
        if (year < 2020 || year > 2030) {
          fieldValid = false;
          errorMessage = "Year must be between 2020 and 2030";
        }
      }

      if (!fieldValid) {
        formGroup.classList.add("error");
        showErrorMessage(formGroup, errorMessage);
        if (!firstErrorField) firstErrorField = field;
        isValid = false;
      } else {
        formGroup.classList.add("success");
      }
    });
  }

  if (!isValid && firstErrorField) {
    firstErrorField.focus();
    showNotification("Please correct the highlighted errors", "error");
  } else if (isValid) {
    showNotification("Step validated successfully!", "success");
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""));
}

function showErrorMessage(formGroup, message) {
  let errorMsg = formGroup.querySelector(".error-message");
  if (!errorMsg) {
    errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    formGroup.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
  errorMsg.classList.add("show");
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === "success" ? "background: #28a745;" : ""}
    ${type === "error" ? "background: #dc3545;" : ""}
    ${type === "info" ? "background: #007bff;" : ""}
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

document.getElementById("registrationForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (currentStep !== 3) {
    showNotification("Please complete all steps before submitting", "error");
    return;
  }

  if (validateCurrentStep()) {
    const formData = collectFormData();

    // Log structured data
    console.log("=== PARTNER REGISTRATION DATA ===");
    console.log("Basic Information:", formData.basicInfo);
    console.log("Addresses:", formData.addresses);
    console.log("Contacts:", formData.contacts);
    console.log("MoU Information:", formData.mou);
    console.log("Support Years:", formData.supportYears);
    console.log("=== END REGISTRATION DATA ===");

    // Simulate API submission
    submitRegistration(formData);
  }
});

function collectFormData() {
  const form = document.getElementById("registrationForm");
  const formData = new FormData(form);

  const data = {
    basicInfo: {
      partnerName: formData.get("partnerName"),
      acronym: formData.get("acronym"),
      partnerType: formData.get("partnerType"),
      category: formData.get("category"),
      officialPhone: formData.get("officialPhone"),
      officialEmail: formData.get("officialEmail"),
    },
    addresses: [],
    contacts: [],
    mou: {
      hasMou: formData.get("hasMou") === "on",
      file: formData.get("mouFile"),
    },
    supportYears: [],
  };

  const addressInputs = form.querySelectorAll('input[name*="addresses"]');
  addressInputs.forEach((input) => {
    if (input.value.trim()) {
      data.addresses.push(input.value.trim());
    }
  });

  const contactInputs = form.querySelectorAll('input[name*="contacts"]');
  const contactGroups = {};
  contactInputs.forEach((input) => {
    const match = input.name.match(/contacts\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!contactGroups[index]) contactGroups[index] = {};
      contactGroups[index][field] = input.value;
    }
  });
  data.contacts = Object.values(contactGroups).filter(
    (contact) =>
      contact.name && contact.position && contact.phone && contact.email,
  );

  const supportInputs = form.querySelectorAll(
    'input[name*="supportYears"], select[name*="supportYears"]',
  );
  const supportGroups = {};
  supportInputs.forEach((input) => {
    const match = input.name.match(/supportYears\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!supportGroups[index]) supportGroups[index] = {};

      if (field === "districts" && input.multiple) {
        // Handle multi-select districts
        supportGroups[index][field] = Array.from(input.selectedOptions).map(
          (option) => option.value,
        );
      } else {
        supportGroups[index][field] = input.value;
      }
    }
  });
  data.supportYears = Object.values(supportGroups);

  return data;
}

function submitRegistration(data) {
  showNotification("Submitting registration...", "info");

  // Simulate API call
  setTimeout(() => {
    showNotification("Registration submitted successfully!", "success");

    // Reset form after successful submission
    setTimeout(() => {
      if (
        confirm(
          "Registration completed! Would you like to submit another registration?",
        )
      ) {
        resetForm();
      } else {
        window.location.href = "login.html";
      }
    }, 2000);
  }, 1500);
}

function resetForm() {
  document.getElementById("registrationForm").reset();
  currentStep = 1;
  addressCount = 1;
  contactCount = 1;
  supportYearCount = 1;

  // Reset stepper
  document.querySelectorAll(".step").forEach((step) => {
    step.classList.remove("active", "completed");
  });
  document.querySelector('[data-step="1"]').classList.add("active");

  // Reset form steps
  document.querySelectorAll(".form-step").forEach((step) => {
    step.classList.remove("active");
  });
  document.querySelector('.form-step[data-step="1"]').classList.add("active");

  const addressContainer = document.getElementById("addressesContainer");
  addressContainer.innerHTML = `
    <div class="address-item">
      <input type="text" name="addresses[0]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    </div>
  `;

  const contactContainer = document.getElementById("contactsContainer");
  contactContainer.innerHTML = `
    <div class="contact-item">
      <div class="form-row">
        <div class="form-group">
          <input type="text" name="contacts[0][name]" placeholder="Contact Name *" required>
        </div>
        <div class="form-group">
          <input type="text" name="contacts[0][position]" placeholder="Position *" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <input type="tel" name="contacts[0][phone]" placeholder="Phone Number *" required>
        </div>
        <div class="form-group">
          <input type="email" name="contacts[0][email]" placeholder="Email Address *" required>
        </div>
      </div>
    </div>
  `;

  // Reset dynamic containers
  resetDynamicContainers();
  updateNavigationButtons();
}

function resetDynamicContainers() {
  // Reset support years (keep first one)
  const supportContainer = document.getElementById("supportYearsContainer");
  const firstSupport = supportContainer.querySelector(".dynamic-item");
  supportContainer.innerHTML = "";
  supportContainer.appendChild(firstSupport);
  firstSupport
    .querySelectorAll("input, select")
    .forEach((input) => (input.value = ""));
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
