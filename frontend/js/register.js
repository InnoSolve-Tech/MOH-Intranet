let currentStep = 1
let addressCount = 1
let contactCount = 1
let supportYearCount = 1

// Declare agGrid variable
const agGrid = window.agGrid

let addressesGrid = null
let contactsGrid = null

// Initialize grids when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeAddressesGrid()
  initializeContactsGrid()
})

function initializeAddressesGrid() {
  const columnDefs = [
    { headerName: "Street Address", field: "street", editable: true, flex: 1 },
    { headerName: "City", field: "city", editable: true, flex: 1 },
    { headerName: "State/Province", field: "state", editable: true, flex: 1 },
    { headerName: "Country", field: "country", editable: true, flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) =>
           "<button class='remove-btn text-red-500' onclick='removeAddressRow("+ params.node.rowIndex +")'><i class='fas fa-trash'></i></button>",
      width: 80,
      suppressSizeToFit: true,
    },
  ]

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: [{ street: "", city: "", state: "", country: "" }],
    defaultColDef: {
      sortable: false,
      filter: false,
      resizable: true,
    },
    suppressRowClickSelection: true,
    rowHeight: 40,
    headerHeight: 40,
  }

  const gridDiv = document.querySelector("#addressesGrid")
  addressesGrid = agGrid.createGrid(gridDiv, gridOptions)
}

function initializeContactsGrid() {
  const columnDefs = [
    { headerName: "Contact Name", field: "name", editable: true, flex: 1 },
    { headerName: "Position", field: "position", editable: true, flex: 1 },
    { headerName: "Phone", field: "phone", editable: true, flex: 1 },
    { headerName: "Email", field: "email", editable: true, flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) =>
         "<button class='remove-btn text-red-500' onclick='removeContactRow("+ params.node.rowIndex +")'><i class='fas fa-trash'></i></button>",
      width: 80,
      suppressSizeToFit: true,
    },
  ]

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: [{ name: "", position: "", phone: "", email: "" }],
    defaultColDef: {
      sortable: false,
      filter: false,
      resizable: true,
    },
    suppressRowClickSelection: true,
    rowHeight: 40,
    headerHeight: 40,
  }

  const gridDiv = document.querySelector("#contactsGrid")
  contactsGrid = agGrid.createGrid(gridDiv, gridOptions)
}

function addAddressRow() {
  const newRow = { street: "", city: "", state: "", country: "" }
  addressesGrid.applyTransaction({ add: [newRow] })
}

function removeAddressRow(rowIndex) {
  const rowNode = addressesGrid.getRowNode(rowIndex)
  if (rowNode) {
    addressesGrid.applyTransaction({ remove: [rowNode.data] })
  }
}

function addContactRow() {
  const newRow = { name: "", position: "", phone: "", email: "" }
  contactsGrid.applyTransaction({ add: [newRow] })
}

function removeContactRow(rowIndex) {
  const rowNode = contactsGrid.getRowNode(rowIndex)
  if (rowNode) {
    contactsGrid.applyTransaction({ remove: [rowNode.data] })
  }
}

// Step navigation
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < 3) {
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
  nextBtn.style.display = currentStep < 3 ? "block" : "none"
  submitBtn.style.display = currentStep === 3 ? "block" : "none"
}

function addSupportYear() {
  const container = document.getElementById("supportYearsContainer")
  const supportDiv = document.createElement("div")
  supportDiv.className = "dynamic-item"
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
    `
  container.appendChild(supportDiv)
  supportYearCount++
}

function removeSupportYear(button) {
  button.parentElement.remove()
}

// MoU checkbox functionality
document.getElementById("hasMou").addEventListener("change", function () {
  const mouUpload = document.getElementById("mouUpload")
  mouUpload.style.display = this.checked ? "block" : "none"
})

function validateCurrentStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`)
  let isValid = true
  let firstErrorField = null

  if (currentStep === 1) {
    // Validate basic form fields
    const requiredFields = currentStepElement.querySelectorAll("input[required], select[required]")

    // Clear previous validation states
    currentStepElement.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("error", "success")
      const errorMsg = group.querySelector(".error-message")
      if (errorMsg) errorMsg.classList.remove("show")
    })

    requiredFields.forEach((field) => {
      const formGroup = field.closest(".form-group")
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

    // Validate addresses grid
    const addressData = []
    addressesGrid.forEachNode((node) => addressData.push(node.data))
    const validAddresses = addressData.filter(
      (addr) =>
        addr.street && addr.street.trim() && addr.city && addr.city.trim() && addr.country && addr.country.trim(),
    )

    if (validAddresses.length === 0) {
      showNotification("Please add at least one complete address", "error")
      isValid = false
    }
  } else if (currentStep === 2) {
    // Validate contacts grid
    const contactData = []
    contactsGrid.forEachNode((node) => contactData.push(node.data))
    const validContacts = contactData.filter(
      (contact) =>
        contact.name &&
        contact.name.trim() &&
        contact.phone &&
        contact.phone.trim() &&
        contact.email &&
        contact.email.trim() &&
        isValidEmail(contact.email) &&
        isValidPhone(contact.phone),
    )

    if (validContacts.length === 0) {
      showNotification("Please add at least one complete contact with valid email and phone", "error")
      isValid = false
    }
  } else if (currentStep === 3) {
    // Validate support years (traditional form validation)
    const requiredFields = currentStepElement.querySelectorAll("input[required], select[required]")

    // Clear previous validation states
    currentStepElement.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("error", "success")
      const errorMsg = group.querySelector(".error-message")
      if (errorMsg) errorMsg.classList.remove("show")
    })

    requiredFields.forEach((field) => {
      const formGroup = field.closest(".form-group")
      let fieldValid = true
      let errorMessage = ""

      if (field.multiple && field.classList.contains("districts-select")) {
        // Multi-select validation
        if (field.selectedOptions.length === 0) {
          fieldValid = false
          errorMessage = "Please select at least one district"
        }
      } else if (!field.value.trim()) {
        fieldValid = false
        errorMessage = "This field is required"
      } else if (field.type === "number") {
        const year = Number.parseInt(field.value)
        if (year < 2020 || year > 2030) {
          fieldValid = false
          errorMessage = "Year must be between 2020 and 2030"
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

document.getElementById("registrationForm").addEventListener("submit", (e) => {
  e.preventDefault()

  if (validateCurrentStep()) {
    const formData = collectFormData()

    // Log structured data
    console.log("=== PARTNER REGISTRATION DATA ===")
    console.log("Basic Information:", formData.basicInfo)
    console.log("Addresses:", formData.addresses)
    console.log("Contacts:", formData.contacts)
    console.log("MoU Information:", formData.mou)
    console.log("Support Years:", formData.supportYears)
    console.log("=== END REGISTRATION DATA ===")

    // Simulate API submission
    submitRegistration(formData)
  }
})

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
      file: formData.get("mouFile"),
    },
    supportYears: [],
  }

  // Collect addresses from ag-grid
  addressesGrid.forEachNode((node) => {
    if (node.data.street || node.data.city || node.data.state || node.data.country) {
      data.addresses.push(node.data)
    }
  })

  // Collect contacts from ag-grid
  contactsGrid.forEachNode((node) => {
    if (node.data.name || node.data.position || node.data.phone || node.data.email) {
      data.contacts.push(node.data)
    }
  })

  const supportInputs = form.querySelectorAll('input[name*="supportYears"], select[name*="supportYears"]')
  const supportGroups = {}
  supportInputs.forEach((input) => {
    const match = input.name.match(/supportYears\[(\d+)\]\[(\w+)\]/)
    if (match) {
      const index = match[1]
      const field = match[2]
      if (!supportGroups[index]) supportGroups[index] = {}

      if (field === "districts" && input.multiple) {
        // Handle multi-select districts
        supportGroups[index][field] = Array.from(input.selectedOptions).map((option) => option.value)
      } else {
        supportGroups[index][field] = input.value
      }
    }
  })
  data.supportYears = Object.values(supportGroups)

  return data
}

function submitRegistration(data) {
  showNotification("Submitting registration...", "info")

  // Simulate API call
  setTimeout(() => {
    showNotification("Registration submitted successfully!", "success")

    // Reset form after successful submission
    setTimeout(() => {
      if (confirm("Registration completed! Would you like to submit another registration?")) {
        resetForm()
      } else {
        window.location.href = "login.html"
      }
    }, 2000)
  }, 1500)
}

function resetForm() {
  document.getElementById("registrationForm").reset()
  currentStep = 1
  addressCount = 1
  contactCount = 1
  supportYearCount = 1

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

  // Reset grids
  if (addressesGrid) {
    addressesGrid.setRowData([{ street: "", city: "", state: "", country: "" }])
  }
  if (contactsGrid) {
    contactsGrid.setRowData([{ name: "", position: "", phone: "", email: "" }])
  }

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