let currentStep = 1
let addressCount = 1
let contactCount = 1
let supportYearCount = 1
let lastSupportYearData = null // Store last filled support year data for prefilling
let editingRowIndex = null // Store the row index for editing

let supportYearsGrid = null
const supportYearsData = []

const categoryMapping = {
  Local: ["Local NGO", "CBO"],
  International: ["Bi-Lateral", "Multilateral", "UN", "International NGO"],
}

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category")

  // Handle changes from any partnerType radio
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches('input[name="partnerType"]')) {
      updateCategoryOptions(e.target.value, categorySelect)
      categorySelect.disabled = false
    }
  })

  // Initialize if one is pre-checked
  const checked = document.querySelector('input[name="partnerType"]:checked')
  if (checked) {
    updateCategoryOptions(checked.value, categorySelect)
    categorySelect.disabled = false
  } else {
    categorySelect.innerHTML = '<option value="">Select Category</option>'
    categorySelect.disabled = true
  }

  initializeSupportYearsGrid()
})

function updateCategoryOptions(partnerType, categorySelect) {
  categorySelect.innerHTML = '<option value="">Select Category</option>'

  if (partnerType && categoryMapping[partnerType]) {
    categoryMapping[partnerType].forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      categorySelect.appendChild(option)
    })
  }

  categorySelect.value = ""
}

function initializeSupportYearsGrid() {
  if (supportYearsGrid) {
    console.log("[v0] Support years grid already initialized")
    return
  }

  const gridOptions = {
    columnDefs: [
      { field: "year", headerName: "Year", width: 80, sortable: true },
      { field: "level", headerName: "Level", width: 100, sortable: true },
      { field: "thematicAreas", headerName: "Thematic Area", width: 150, sortable: true },
      {
        field: "districts",
        headerName: "Districts",
        width: 200,
        valueFormatter: (params) => {
          if (Array.isArray(params.value)) {
            return params.value.join(", ")
          }
          return params.value || ""
        },
      },
      {
        field: "coverage",
        headerName: "Coverage",
        width: 150,
        valueFormatter: (params) => {
          if (params.value && typeof params.value === "object") {
            return Object.entries(params.value)
              .map(([district, coverage]) => `${district}: ${coverage}`)
              .join(", ")
          }
          return ""
        },
      },
      {
        headerName: "Actions",
        width: 120,
        cellRenderer: (params) => {
          return `
            <button class="grid-btn edit-btn" onclick="editSupportYear(${params.node.rowIndex})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="grid-btn delete-btn" onclick="deleteSupportYear(${params.node.rowIndex})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          `
        },
      },
    ],
    rowData: supportYearsData,
    defaultColDef: {
      resizable: true,
      sortable: false,
      filter: false,
    },
    rowHeight: 40,
    headerHeight: 35,
    suppressRowClickSelection: true,
    suppressCellSelection: true,
  }

  const gridDiv = document.querySelector("#supportYearsGrid")
  if (gridDiv && window.agGrid) {
    try {
      supportYearsGrid = window.agGrid.createGrid(gridDiv, gridOptions)
      console.log("[v0] Support years grid initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize support years grid:", error)
      supportYearsGrid = null
    }
  } else {
    console.warn("[v0] Grid container or agGrid library not available")
    setTimeout(() => {
      if (document.querySelector("#supportYearsGrid") && window.agGrid && !supportYearsGrid) {
        initializeSupportYearsGrid()
      }
    }, 1000)
  }
}

function openAddSupportYearModal() {
  document.getElementById("addSupportYearModal").classList.add("show")

  if (lastSupportYearData && supportYearsData.length > 0) {
    document.getElementById("supportYear").value = lastSupportYearData.year + 1 // Increment year
    document.getElementById("supportLevel").value = lastSupportYearData.level
    document.getElementById("supportThematic").value = lastSupportYearData.thematicAreas

    // Trigger level change to set up districts properly
    handleModalLevelChange()

    // If not National level, prefill districts
    if (lastSupportYearData.level !== "National") {
      const districtsSelect = document.getElementById("supportDistricts")
      setTimeout(() => {
        Array.from(districtsSelect.options).forEach((option) => {
          option.selected = lastSupportYearData.districts.includes(option.value)
        })
        handleModalDistrictChange()

        // Prefill coverage
        setTimeout(() => {
          if (lastSupportYearData.coverage) {
            Object.entries(lastSupportYearData.coverage).forEach(([district, coverage]) => {
              const coverageInput = document.querySelector(
                `input[name="modalCoverage[${district}]"][value="${coverage}"]`,
              )
              if (coverageInput) {
                coverageInput.checked = true
              }
            })
          }
        }, 100)
      }, 100)
    }
  } else {
    resetSupportYearForm()
  }
}

function closeAddSupportYearModal() {
  document.getElementById("addSupportYearModal").classList.remove("show")
  document.querySelector("#addSupportYearModal .modal-header h3").textContent = "Add Support Year"
  document.querySelector("#addSupportYearModal .modal-footer button:last-child").textContent = "Add Support Year"
  editingRowIndex = null
  resetSupportYearForm()
}

function resetSupportYearForm() {
  document.getElementById("supportYearForm").reset()
  document.getElementById("supportDistricts").multiple = false
  document.getElementById("modalDistrictCoverage").style.display = "none"
  document.getElementById("modalCoverageOptions").innerHTML = ""
}

function handleModalLevelChange() {
  const levelSelect = document.getElementById("supportLevel")
  const districtsSelect = document.getElementById("supportDistricts")
  const helpText = document.querySelector("#addSupportYearModal .district-help-text")
  const coverageContainer = document.getElementById("modalDistrictCoverage")

  if (levelSelect.value === "National") {
    // National level - disable districts since it's nationwide
    districtsSelect.disabled = true
    districtsSelect.multiple = false
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Districts not required for National level support"
  } else if (levelSelect.value === "District") {
    // District level - enable multi-select for districts
    districtsSelect.disabled = false
    districtsSelect.multiple = true
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Hold Ctrl/Cmd to select multiple districts"
  } else {
    // Reset if no level selected
    districtsSelect.disabled = true
    districtsSelect.multiple = false
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Select level of support first"
  }

  if (coverageContainer) {
    coverageContainer.style.display = "none"
    document.getElementById("modalCoverageOptions").innerHTML = ""
  }
}

function handleModalDistrictChange() {
  const districtsSelect = document.getElementById("supportDistricts")
  const coverageContainer = document.getElementById("modalDistrictCoverage")
  const coverageOptions = document.getElementById("modalCoverageOptions")

  if (!coverageContainer || !coverageOptions || districtsSelect.disabled) return

  const selectedDistricts = Array.from(districtsSelect.selectedOptions).map((option) => option.value)

  if (selectedDistricts.length > 0) {
    coverageContainer.style.display = "block"
    coverageOptions.innerHTML = selectedDistricts
      .map(
        (district) => `
        <div class="coverage-item">
          <label class="coverage-label">${district}:</label>
          <div class="coverage-radios">
            <label class="radio-option">
              <input type="radio" name="modalCoverage[${district}]" value="Whole" required>
              <span>Whole</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="modalCoverage[${district}]" value="Partial" required>
              <span>Partial</span>
            </label>
          </div>
        </div>
      `,
      )
      .join("")
  } else {
    coverageContainer.style.display = "none"
    coverageOptions.innerHTML = ""
  }
}

function saveSupportYear() {
  const form = document.getElementById("supportYearForm")
  const formData = new FormData(form)

  const yearElement = document.getElementById("supportYear")
  const levelElement = document.getElementById("supportLevel")
  const thematicElement = document.getElementById("supportThematic")
  const districtsSelect = document.getElementById("supportDistricts")

  if (!yearElement || !levelElement || !thematicElement || !districtsSelect) {
    showNotification("Form elements not found. Please refresh the page.", "error")
    return
  }

  const year = yearElement.value
  const level = levelElement.value
  const thematicAreas = thematicElement.value

  if (!year || !level || !thematicAreas) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  let selectedDistricts = []
  let coverage = {}

  if (level === "National") {
    selectedDistricts = ["National"]
    coverage = { National: "Whole" }
  } else {
    if (districtsSelect.selectedOptions.length === 0) {
      showNotification("Please select at least one district", "error")
      return
    }

    selectedDistricts = Array.from(districtsSelect.selectedOptions).map((option) => option.value)

    // Collect coverage data
    selectedDistricts.forEach((district) => {
      const coverageInput = document.querySelector(`input[name="modalCoverage[${district}]"]:checked`)
      if (coverageInput) {
        coverage[district] = coverageInput.value
      }
    })

    // Check if coverage is complete
    if (Object.keys(coverage).length !== selectedDistricts.length) {
      showNotification("Please select coverage type for all districts", "error")
      return
    }
  }

  const supportYearData = {
    year: Number.parseInt(year),
    level: level,
    thematicAreas: thematicAreas,
    districts: selectedDistricts,
    coverage: coverage,
  }

  console.log("[v0] Adding support year data:", supportYearData)

  lastSupportYearData = { ...supportYearData }

  if (typeof editingRowIndex !== "undefined" && editingRowIndex !== null) {
    // Update existing entry
    supportYearsData[editingRowIndex] = supportYearData
    editingRowIndex = null
  } else {
    // Add new entry
    supportYearsData.push(supportYearData)
  }

  console.log("[v0] Current supportYearsData array:", supportYearsData)

  if (supportYearsGrid) {
    try {
      // Use the grid API directly to set row data
      supportYearsGrid.setGridOption("rowData", supportYearsData)
      console.log("[v0] Grid updated successfully with new data")
    } catch (error) {
      console.error("[v0] Error updating grid:", error)
      // Force grid refresh by destroying and recreating
      if (supportYearsGrid.destroy) {
        supportYearsGrid.destroy()
      }
      supportYearsGrid = null
      initializeSupportYearsGrid()
    }
  } else {
    console.warn("[v0] Support years grid not initialized, initializing now...")
    initializeSupportYearsGrid()
  }

  closeAddSupportYearModal()
  showNotification("Support year added successfully!", "success")
}

function editSupportYear(rowIndex) {
  const data = supportYearsData[rowIndex]
  if (!data) return

  editingRowIndex = rowIndex

  // Populate modal with existing data
  document.getElementById("supportYear").value = data.year
  document.getElementById("supportLevel").value = data.level
  document.getElementById("supportThematic").value = data.thematicAreas

  handleModalLevelChange()

  setTimeout(() => {
    const districtsSelect = document.getElementById("supportDistricts")

    // Select districts based on the data
    Array.from(districtsSelect.options).forEach((option) => {
      option.selected = data.districts.includes(option.value)
    })

    // Trigger district change to show coverage options
    handleModalDistrictChange()

    setTimeout(() => {
      if (data.coverage) {
        Object.entries(data.coverage).forEach(([district, coverage]) => {
          const coverageInput = document.querySelector(`input[name="modalCoverage[${district}]"][value="${coverage}"]`)
          if (coverageInput) {
            coverageInput.checked = true
          }
        })
      }
    }, 100)
  }, 100)

  document.querySelector("#addSupportYearModal .modal-header h3").textContent = "Edit Support Year"
  document.querySelector("#addSupportYearModal .modal-footer button:last-child").textContent = "Update Support Year"

  document.getElementById("addSupportYearModal").classList.add("show")
}

function deleteSupportYear(index) {
  if (confirm("Are you sure you want to delete this support year?")) {
    supportYearsData.splice(index, 1)

    if (supportYearsGrid && supportYearsGrid.gridOptions) {
      try {
        if (supportYearsGrid.gridOptions.api) {
          supportYearsGrid.gridOptions.api.setRowData(supportYearsData)
          console.log("[v0] Grid updated after deletion")
        } else {
          supportYearsGrid.setGridOption("rowData", supportYearsData)
          console.log("[v0] Grid updated after deletion with setGridOption")
        }
      } catch (error) {
        console.error("[v0] Error updating grid after deletion:", error)
        if (supportYearsGrid.destroy) {
          supportYearsGrid.destroy()
        }
        supportYearsGrid = null
        initializeSupportYearsGrid()
      }
    }

    showNotification("Support year deleted successfully!", "success")
  }
}

// Step navigation
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < 4) {
      document.querySelector(`[data-step="${currentStep}"]`).classList.remove("active")
      document.querySelector(`[data-step="${currentStep}"]`).classList.add("completed")
      document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove("active")

      currentStep++

      document.querySelector(`[data-step="${currentStep}"]`).classList.add("active")
      document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add("active")

      updateNavigationButtons()
      scrollToTop()
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove("active")
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove("active")

    currentStep--

    document.querySelector(`[data-step="${currentStep}"]`).classList.remove("completed")
    document.querySelector(`[data-step="${currentStep}"]`).classList.add("active")
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add("active")

    updateNavigationButtons()
    scrollToTop()
  }
}

function scrollToTop() {
  document.querySelector(".registration-container").scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

function updateNavigationButtons() {
  const prevBtn = document.querySelector(".prev-btn")
  const nextBtn = document.querySelector(".next-btn")
  const submitBtn = document.querySelector(".submit-btn")

  prevBtn.style.display = currentStep > 1 ? "block" : "none"
  nextBtn.style.display = currentStep < 4 ? "block" : "none" // Updated to 4 steps
  submitBtn.style.display = currentStep === 4 ? "block" : "none" // Updated to 4 steps
}

function addAddress() {
  const container = document.getElementById("addressesContainer")
  const addressItem = document.createElement("div")
  addressItem.className = "address-item"
  addressItem.innerHTML = `
    <input type="text" name="addresses[${addressCount}]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    <button type="button" class="remove-btn" onclick="removeAddress(this)">×</button>
  `
  container.appendChild(addressItem)
  addressCount++
}

function removeAddress(button) {
  const addressItem = button.closest(".address-item")
  if (document.querySelectorAll(".address-item").length > 1) {
    addressItem.remove()
  } else {
    showNotification("At least one address is required", "error")
  }
}

function addContact() {
  const container = document.getElementById("contactsContainer")
  const contactItem = document.createElement("div")
  contactItem.className = "contact-item"
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
  `
  container.appendChild(contactItem)
  contactCount++
}

function removeContact(button) {
  const contactItem = button.closest(".contact-item")
  if (document.querySelectorAll(".contact-item").length > 1) {
    contactItem.remove()
  } else {
    showNotification("At least one contact is required", "error")
  }
}

function addSupportYear() {
  openAddSupportYearModal()
}

function removeSupportYear(button) {
  button.parentElement.remove()
}

document.addEventListener("DOMContentLoaded", () => {
  const hasMouCheckbox = document.getElementById("hasMou")
  if (hasMouCheckbox) {
    hasMouCheckbox.addEventListener("change", function () {
      const mouDetails = document.getElementById("mouDetails")
      if (mouDetails) {
        mouDetails.style.display = this.checked ? "block" : "none"

        // Toggle required attribute on MoU fields
        const mouFields = mouDetails.querySelectorAll("input[required]")
        mouFields.forEach((field) => {
          if (this.checked) {
            field.setAttribute("required", "")
          } else {
            field.removeAttribute("required")
            field.value = ""
          }
        })
      }
    })
  }
})

function validateCurrentStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`)

  if (!currentStepElement) {
    console.error(`Step element not found for step ${currentStep}`)
    return false
  }

  let isValid = true
  let firstErrorField = null

  if (currentStep === 1) {
    // Validate basic form fields
    const requiredFields = currentStepElement.querySelectorAll("input[required], select[required]")

    // Clear previous validation states
    const formGroups = currentStepElement.querySelectorAll(".form-group")
    formGroups.forEach((group) => {
      if (group && group.classList) {
        group.classList.remove("error", "success")
        const errorMsg = group.querySelector(".error-message")
        if (errorMsg && errorMsg.classList) {
          errorMsg.classList.remove("show")
        }
      }
    })

    requiredFields.forEach((field) => {
      if (!field) return

      const formGroup = field.closest(".form-group")
      if (!formGroup) return

      let fieldValid = true
      let errorMessage = ""

      if (!field.value.trim()) {
        fieldValid = false
        errorMessage = "This field is required"
      } else {
        // Specific validation based on field type
        if (field.type === "email" && !isValidEmail(field.value)) {
          fieldValid = false
          errorMessage = "Please enter a valid email address"
        } else if (field.type === "tel" && !isValidPhone(field.value)) {
          fieldValid = false
          errorMessage = "Please enter a valid phone number"
        }
      }

      if (!fieldValid) {
        formGroup.classList.add("error")
        showErrorMessage(formGroup, errorMessage)
        if (!firstErrorField) firstErrorField = field
        isValid = false
      } else {
        formGroup.classList.add("success")
      }
    })

    const addressItems = document.querySelectorAll(".address-item")
    let validAddresses = 0
    addressItems.forEach((item) => {
      if (!item) return
      const addressInput = item.querySelector('input[name*="addresses"]')
      if (addressInput && addressInput.value.trim()) {
        validAddresses++
      }
    })

    if (validAddresses === 0) {
      showNotification("Please enter at least one address", "error")
      isValid = false
    }
  } else if (currentStep === 2) {
    const contactItems = document.querySelectorAll(".contact-item")
    let validContacts = 0
    contactItems.forEach((item) => {
      if (!item) return

      const nameInput = item.querySelector('input[name*="[name]"]')
      const positionInput = item.querySelector('input[name*="[position]"]')
      const phoneInput = item.querySelector('input[name*="[phone]"]')
      const emailInput = item.querySelector('input[name*="[email]"]')

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
        validContacts++
      }
    })

    if (validContacts === 0) {
      showNotification("Please complete at least one contact with valid email and phone", "error")
      isValid = false
    }
  } else if (currentStep === 3) {
    const hasMouCheckbox = document.getElementById("hasMou")

    if (hasMouCheckbox && hasMouCheckbox.checked) {
      // If MoU is checked, validate the required fields
      const requiredFields = currentStepElement.querySelectorAll("input[required]")

      // Clear previous validation states
      const formGroups = currentStepElement.querySelectorAll(".form-group")
      formGroups.forEach((group) => {
        if (group && group.classList) {
          group.classList.remove("error", "success")
          const errorMsg = group.querySelector(".error-message")
          if (errorMsg && errorMsg.classList) {
            errorMsg.classList.remove("show")
          }
        }
      })

      requiredFields.forEach((field) => {
        if (!field) return

        const formGroup = field.closest(".form-group")
        if (!formGroup) return

        let fieldValid = true
        let errorMessage = ""

        if (!field.value.trim()) {
          fieldValid = false
          errorMessage = "This field is required"
        } else if (field.type === "date") {
          // Additional date validation if needed
          const date = new Date(field.value)
          if (isNaN(date.getTime())) {
            fieldValid = false
            errorMessage = "Please enter a valid date"
          }
        }

        if (!fieldValid) {
          formGroup.classList.add("error")
          showErrorMessage(formGroup, errorMessage)
          if (!firstErrorField) firstErrorField = field
          isValid = false
        } else {
          formGroup.classList.add("success")
        }
      })
    }
    // If MoU is not checked, step is automatically valid
  } else if (currentStep === 4) {
    if (supportYearsData.length === 0) {
      showNotification("Please add at least one support year", "error")
      isValid = false
    }
  }

  if (!isValid && firstErrorField) {
    firstErrorField.focus()
    showNotification("Please correct the highlighted errors", "error")
  } else if (isValid) {
    showNotification("Step validated successfully!", "success")
  }

  return isValid
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
}

function showErrorMessage(formGroup, message) {
  let errorMsg = formGroup.querySelector(".error-message")
  if (!errorMsg) {
    errorMsg = document.createElement("div")
    errorMsg.className = "error-message"
    formGroup.appendChild(errorMsg)
  }
  errorMsg.textContent = message
  errorMsg.classList.add("show")
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
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
  `
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function showUserCreationModal(formData) {
  const modal = document.createElement("div")
  modal.className = "modal show"
  modal.id = "userCreationModal"
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h3>Create User Accounts</h3>
        <button type="button" class="close" onclick="closeUserCreationModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Select contacts to create user accounts for:</p>
        <div id="contactUserList">
          ${formData.contacts
            .map(
              (contact, index) => `
            <div class="contact-user-item">
              <div class="contact-info">
                <strong>${contact.name}</strong> - ${contact.position}<br>
                <small>${contact.email} | ${contact.phone}</small>
              </div>
              <div class="user-creation-fields">
                <label>
                  <input type="checkbox" name="createUser[${index}]" value="true" onchange="toggleUserFields(${index})">
                  Create User Account
                </label>
                <div class="user-fields" id="userFields${index}" style="display: none;">
                  <div class="form-row">
                    <div class="form-group">
                      <input type="text" name="username[${index}]" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                      <input type="password" name="password[${index}]" placeholder="Password" required>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeUserCreationModal()">Skip</button>
        <button type="button" class="btn btn-primary" onclick="finalSubmitRegistration()">Submit Registration</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

function toggleUserFields(index) {
  const checkbox = document.querySelector(`input[name="createUser[${index}]"]`)
  const userFields = document.getElementById(`userFields${index}`)

  if (checkbox.checked) {
    userFields.style.display = "block"
    userFields.querySelectorAll("input, select").forEach((field) => (field.required = true))
  } else {
    userFields.style.display = "none"
    userFields.querySelectorAll("input, select").forEach((field) => {
      field.required = false
      field.value = ""
    })
  }
}

function closeUserCreationModal() {
  const modal = document.getElementById("userCreationModal")
  if (modal) {
    modal.remove()
  }
}

function finalSubmitRegistration() {
  const modal = document.getElementById("userCreationModal")
  const userCreationData = []

  // Collect user creation data
  const checkboxes = modal.querySelectorAll('input[name^="createUser"]:checked')
  checkboxes.forEach((checkbox) => {
    const index = checkbox.name.match(/\[(\d+)\]/)[1]
    const username = modal.querySelector(`input[name="username[${index}]"]`).value
    const password = modal.querySelector(`input[name="password[${index}]"]`).value

    if (username && password) {
      userCreationData.push({
        contactIndex: index,
        username,
        password,
      })
    }
  })

  // Get the original form data
  const formData = collectFormData()
  formData.userAccounts = userCreationData

  console.log("=== COMPLETE REGISTRATION DATA ===")
  console.log("Form Data:", formData)
  console.log("User Accounts:", userCreationData)
  console.log("=== END COMPLETE DATA ===")

  closeUserCreationModal()
  submitRegistration(formData)
}


async function submitRegistration(data) {
  showNotification("Submitting registration...", "info")

   const form = document.getElementById("registrationForm")
  const rf = new FormData(form)

  try {
    // Format data according to the required JSON structure

    const submitData = {
      basicInfo: {
        partnerName: data.basicInfo.partnerName || "",
        acronym: data.basicInfo.acronym || "",
        partnerType: data.basicInfo.partnerType || "",
        category: data.basicInfo.category || "",
        officialPhone: data.basicInfo.officialPhone || "",
        officialEmail: data.basicInfo.officialEmail || "",
      },
      addresses: data.addresses || [],
      contacts: data.contacts.map((contact) => ({
        name: contact.name || "",
        position: contact.position || "",
        phone: contact.phone || "",
        email: contact.email || "",
      })),
      mou: {
        hasMou: data.mou.hasMou || false,
        signedBy: data.mou.signedBy || "",
        whoTitle: data.mou.whoTitle || "",
        signedDate: data.mou.signedDate || "",
        expiryDate: data.mou.expiryDate || "",
      },
      supportYears: data.supportYears.map((supportYear) => ({
        year: Number.parseInt(supportYear.year) || 0,
        level: supportYear.level || "",
        thematicAreas: supportYear.thematicAreas || "",
        districts: supportYear.districts || [],
        coverage: supportYear.coverage || {},
      })),
      userAccounts: data.userAccounts || [],
    }

   const formData = new FormData()
    
    // Add the JSON data as a string
    formData.append("data", JSON.stringify(submitData))
    
    // Add the file if it exists
    const fileInput = form.querySelector('input[name="mouFile"]')
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append("mouFile", fileInput.files[0])
    }

    const response = await fetch("/api/v1/partners", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || result.details || "Failed to submit registration")
    }

    showNotification("Registration submitted successfully!", "success")

    // Reset form after successful submission
    setTimeout(() => {
      if (confirm("Registration completed! Would you like to submit another registration?")) {
        resetForm()
      } else {
        window.location.href = "/"
      }
    }, 2000)
  } catch (error) {
    console.error("Registration submission error:", error)
    showNotification(`Failed to submit partner details: ${error.message}`, "error")
  }
}

function collectFormData() {
  const form = document.getElementById("registrationForm")
  const formData = new FormData(form)

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
      signedBy: formData.get("signedBy"),
      whoTitle: formData.get("whoTitle"),
      signedDate: formData.get("signedDate"),
      expiryDate: formData.get("expiryDate"),
      file: formData.get("mouFile"),
    },
    supportYears: supportYearsData, // Use ag-grid data instead of form parsing
  }

  // Collect addresses
  const addressInputs = form.querySelectorAll('input[name*="addresses"]')
  addressInputs.forEach((input) => {
    if (input.value.trim()) {
      data.addresses.push(input.value.trim())
    }
  })

  // Collect contacts
  const contactInputs = form.querySelectorAll('input[name*="contacts"]')
  const contactGroups = {}
  contactInputs.forEach((input) => {
    const match = input.name.match(/contacts\[(\d+)\]\[(\w+)\]/)
    if (match) {
      const index = match[1]
      const field = match[2]
      if (!contactGroups[index]) contactGroups[index] = {}
      contactGroups[index][field] = input.value
    }
  })
  data.contacts = Object.values(contactGroups).filter(
    (contact) => contact.name && contact.position && contact.phone && contact.email,
  )

  return data
}

document.getElementById("registrationForm").addEventListener("submit", (e) => {
  e.preventDefault()

  if (currentStep !== 4) {
    showNotification("Please complete all steps before submitting", "error")
    return
  }

  if (validateCurrentStep()) {
    const formData = collectFormData()

    // Show user creation modal instead of direct submission
    showUserCreationModal(formData)
  }
})

function resetForm() {
  document.getElementById("registrationForm").reset()
  currentStep = 1
  addressCount = 1
  contactCount = 1
  supportYearCount = 1
  lastSupportYearData = null
  editingRowIndex = null

  // Reset stepper
  document.querySelectorAll(".step").forEach((step) => {
    step.classList.remove("active", "completed")
  })
  document.querySelector('[data-step="1"]').classList.add("active")

  // Reset form steps
  document.querySelectorAll(".form-step").forEach((step) => {
    step.classList.remove("active")
  })
  document.querySelector('.form-step[data-step="1"]').classList.add("active")

  const addressContainer = document.getElementById("addressesContainer")
  addressContainer.innerHTML = `
    <div class="address-item">
      <input type="text" name="addresses[0]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    </div>
  `

  const contactContainer = document.getElementById("contactsContainer")
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
  `

  // Reset dynamic containers
  resetDynamicContainers()
  updateNavigationButtons()
}

function resetDynamicContainers() {
  // Reset support years (keep first one)
  const supportContainer = document.getElementById("supportYearsContainer")
  const firstSupport = supportContainer.querySelector(".dynamic-item")
  supportContainer.innerHTML = ""
  supportContainer.appendChild(firstSupport)
  firstSupport.querySelectorAll("input, select").forEach((input) => (input.value = ""))
}

function handleLevelChange(levelSelect, index) {
  const districtsSelect = document.querySelector(`select[name="supportYears[${index}][districts]"]`)
  const helpText = levelSelect.closest(".form-group").nextElementSibling.querySelector(".district-help-text")
  const coverageContainer = document.getElementById(`districtCoverage${index}`)

  if (levelSelect.value === "National") {
    // National level - disable districts since it's nationwide
    districtsSelect.disabled = true
    districtsSelect.multiple = false
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Districts not required for National level support"
  } else if (levelSelect.value === "District") {
    // District level - enable multi-select for districts
    districtsSelect.disabled = false
    districtsSelect.multiple = true
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Hold Ctrl/Cmd to select multiple districts"
  } else {
    // Reset if no level selected
    districtsSelect.disabled = true
    districtsSelect.multiple = false
    districtsSelect.selectedIndex = -1
    helpText.textContent = "Select level of support first"
  }

  // Hide coverage options when level changes
  if (coverageContainer) {
    coverageContainer.style.display = "none"
    coverageContainer.querySelector(".coverage-options").innerHTML = ""
  }
}

function handleDistrictChange(districtsSelect, index) {
  const coverageContainer = document.getElementById(`districtCoverage${index}`)
  const coverageOptions = document.getElementById(`coverageOptions${index}`)

  if (!coverageContainer || !coverageOptions) return

  const selectedDistricts = Array.from(districtsSelect.selectedOptions).map((option) => option.value)

  if (selectedDistricts.length > 0) {
    // Show coverage options
    coverageContainer.style.display = "block"

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
      .join("")
  } else {
    // Hide coverage options if no districts selected
    coverageContainer.style.display = "none"
    coverageOptions.innerHTML = ""
  }
}

const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`
document.head.appendChild(style)
