let currentStep = 1;
let addressCount = 1;
let contactCount = 1;
let supportYearCount = 1;

const categoryMapping = {
  Local: ["Local NGO", "CBO"],
  International: ["Bi-Lateral", "Multilateral", "UN", "International NGO"],
};

document.addEventListener("DOMContentLoaded", () => {
  const partnerTypeSelect = document.getElementById("partnerType");
  const categorySelect = document.getElementById("category");

  partnerTypeSelect.addEventListener("change", function () {
    updateCategoryOptions(this.value, categorySelect);
  });
});

function updateCategoryOptions(partnerType, categorySelect) {
  // Clear existing options except the first one
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  if (partnerType && categoryMapping[partnerType]) {
    categoryMapping[partnerType].forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Reset category selection
  categorySelect.value = "";
}

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
        <select name="supportYears[${supportYearCount}][level]" class="level-select" required onchange="handleLevelChange(this, ${supportYearCount})">
          <option value="">Select Level</option>
          <option value="National">National</option>
          <option value="District">District</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Thematic Areas Supported *</label>
      <select name="supportYears[${supportYearCount}][thematicAreas]" required>
        <option value="">Select Thematic Area</option>
        <option value="Health">Health</option>
        <option value="Education">Education</option>
        <option value="Agriculture">Agriculture</option>
        <option value="Water and Sanitation">Water and Sanitation</option>
        <option value="Nutrition">Nutrition</option>
        <option value="Child Protection">Child Protection</option>
        <option value="Gender Equality">Gender Equality</option>
        <option value="Environment">Environment</option>
        <option value="Economic Development">Economic Development</option>
        <option value="Emergency Response">Emergency Response</option>
        <option value="Governance">Governance</option>
        <option value="Human Rights">Human Rights</option>
      </select>
    </div>
    <div class="form-group">
      <label>Districts Supported *</label>
      <select name="supportYears[${supportYearCount}][districts]" class="districts-select" required onchange="handleDistrictChange(this, ${supportYearCount})">
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
      <small class="district-help-text">Select districts based on level of support</small>
      
      <div class="district-coverage-container" id="districtCoverage${supportYearCount}" style="display: none;">
        <h5>District Coverage</h5>
        <div class="coverage-options" id="coverageOptions${supportYearCount}"></div>
      </div>
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

  // Collect addresses
  const addressInputs = form.querySelectorAll('input[name*="addresses"]');
  addressInputs.forEach((input) => {
    if (input.value.trim()) {
      data.addresses.push(input.value.trim());
    }
  });

  // Collect contacts
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

  // Collect support years with coverage data
  const supportInputs = form.querySelectorAll(
    'input[name*="supportYears"], select[name*="supportYears"]',
  );
  const supportGroups = {};

  supportInputs.forEach((input) => {
    const match = input.name.match(
      /supportYears\[(\d+)\]\[(\w+)\](?:\[(\w+)\])?/,
    );
    if (match) {
      const index = match[1];
      const field = match[2];
      const subfield = match[3]; // For coverage data

      if (!supportGroups[index]) supportGroups[index] = {};

      if (field === "districts" && input.multiple) {
        // Handle multi-select districts
        supportGroups[index][field] = Array.from(input.selectedOptions).map(
          (option) => option.value,
        );
      } else if (field === "coverage" && subfield) {
        // Handle coverage radio buttons
        if (input.checked) {
          if (!supportGroups[index][field]) supportGroups[index][field] = {};
          supportGroups[index][field][subfield] = input.value;
        }
      } else if (field === "districts" && !input.multiple) {
        // Handle single district selection
        supportGroups[index][field] = input.value ? [input.value] : [];
      } else {
        supportGroups[index][field] = input.value;
      }
    }
  });

  data.supportYears = Object.values(supportGroups);

  return data;
}

async function submitRegistration(formData) {
  showNotification("Submitting registration...", "info");

  try {
    // Convert the collected form data to FormData for multipart submission
    const submitData = new FormData();

    // Add basic info
    submitData.append("acronym", formData.basicInfo.acronym);
    submitData.append("partnerType", formData.basicInfo.partnerType);
    submitData.append("category", formData.basicInfo.category);
    submitData.append("officialPhone", formData.basicInfo.officialPhone);
    submitData.append("officialEmail", formData.basicInfo.officialEmail);

    // Add MoU info
    if (formData.mou.hasMou) {
      submitData.append("hasMoU", "on");
      if (formData.mou.file && formData.mou.file instanceof File) {
        submitData.append("mouFile", formData.mou.file);
      }
    }

    // Add addresses
    formData.addresses.forEach((address, index) => {
      submitData.append(`addresses[${index}]`, address);
    });

    // Add contacts - match the field names from collectFormData
    formData.contacts.forEach((contact, index) => {
      submitData.append(`contacts[${index}][name]`, contact.name || "");
      submitData.append(`contacts[${index}][position]`, contact.position || "");
      submitData.append(`contacts[${index}][phone]`, contact.phone || "");
      submitData.append(
        `contacts[${index}][alternatePhone]`,
        contact.alternatePhone || "",
      );
      submitData.append(`contacts[${index}][email]`, contact.email || "");
      submitData.append(`contacts[${index}][address]`, contact.address || "");
    });

    // Add support years - match the field names from collectFormData
    formData.supportYears.forEach((supportYear, index) => {
      submitData.append(`supportYears[${index}][year]`, supportYear.year || "");
      submitData.append(
        `supportYears[${index}][level]`,
        supportYear.level || "",
      );
      submitData.append(
        `supportYears[${index}][thematic]`,
        supportYear.thematic || "",
      );

      // Handle districts (multiple values)
      if (supportYear.districts && Array.isArray(supportYear.districts)) {
        supportYear.districts.forEach((district) => {
          submitData.append(`supportYears[${index}][districts]`, district);
        });
      }

      // Handle coverage data
      if (supportYear.coverage) {
        for (const [key, value] of Object.entries(supportYear.coverage)) {
          submitData.append(`supportYears[${index}][coverage][${key}]`, value);
        }
      }
    });

    const response = await fetch("/api/v1/partners", {
      method: "POST",
      body: submitData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || result.details || "Failed to submit registration",
      );
    }

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
        window.location.href = "/";
      }
    }, 2000);
  } catch (error) {
    console.error("Registration submission error:", error);
    showNotification(
      `Failed to submit partner details: ${error.message}`,
      "error",
    );
  }
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

function handleLevelChange(levelSelect, index) {
  const districtsSelect = document.querySelector(
    `select[name="supportYears[${index}][districts]"]`,
  );
  const helpText = levelSelect
    .closest(".form-group")
    .nextElementSibling.querySelector(".district-help-text");
  const coverageContainer = document.getElementById(`districtCoverage${index}`);

  if (levelSelect.value === "National") {
    // Enable multi-select for National level
    districtsSelect.multiple = true;
    helpText.textContent = "Hold Ctrl/Cmd to select multiple districts";
  } else if (levelSelect.value === "District") {
    // Disable multi-select for District level
    districtsSelect.multiple = false;
    districtsSelect.selectedIndex = -1; // Clear selections
    helpText.textContent = "Select a single district";
  } else {
    // Reset if no level selected
    districtsSelect.multiple = false;
    districtsSelect.selectedIndex = -1;
    helpText.textContent = "Select districts based on level of support";
  }

  // Hide coverage options when level changes
  if (coverageContainer) {
    coverageContainer.style.display = "none";
    coverageContainer.querySelector(".coverage-options").innerHTML = "";
  }
}

function handleDistrictChange(districtsSelect, index) {
  const coverageContainer = document.getElementById(`districtCoverage${index}`);
  const coverageOptions = document.getElementById(`coverageOptions${index}`);

  if (!coverageContainer || !coverageOptions) return;

  const selectedDistricts = Array.from(districtsSelect.selectedOptions).map(
    (option) => option.value,
  );

  if (selectedDistricts.length > 0) {
    // Show coverage options
    coverageContainer.style.display = "block";

    // Generate coverage options for each selected district
    coverageOptions.innerHTML = selectedDistricts
      .map(
        (district) => `
      <div class="coverage-item">
        <label class="coverage-label">${district}:</label>
        <div class="coverage-radios">
          <label class="radio-option">
            <input type="radio" name="supportYears[${index}][coverage][${district}]" value="Whole" required>
            <span>Whole</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="supportYears[${index}][coverage][${district}]" value="Partial" required>
            <span>Partial</span>
          </label>
        </div>
      </div>
    `,
      )
      .join("");
  } else {
    // Hide coverage options if no districts selected
    coverageContainer.style.display = "none";
    coverageOptions.innerHTML = "";
  }
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
