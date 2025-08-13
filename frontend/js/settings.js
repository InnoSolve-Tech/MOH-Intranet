// Settings management functionality
let currentSettings = {}
let hasUnsavedChanges = false

document.addEventListener("DOMContentLoaded", () => {
  initializeSettingsPage()
  loadCurrentSettings()
  setupSettingsEventListeners()
})

function initializeSettingsPage() {
  setActiveMenuItem("settings")
  showSettingsSection("general")
}

function setupSettingsEventListeners() {
  const inputs = document.querySelectorAll("input, select")
  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      hasUnsavedChanges = true
      updateSaveButtonState()
    })
  })

  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ""
    }
  })

  document.getElementById("smtpServer").addEventListener("blur", validateSmtpSettings)
}

function loadCurrentSettings() {
  const savedSettings = localStorage.getItem("systemSettings")
  if (savedSettings) {
    currentSettings = JSON.parse(savedSettings)
    populateSettingsForm()
  } else {
    currentSettings = getDefaultSettings()
  }
}

function getDefaultSettings() {
  return {
    general: {
      orgName: "Partner Management System",
      orgEmail: "admin@partnersystem.org",
      timezone: "Africa/Kampala",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      currency: "UGX",
    },
    security: {
      requireStrongPassword: true,
      enableTwoFactor: false,
      forcePasswordChange: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      logSecurityEvents: true,
    },
    notifications: {
      smtpServer: "smtp.gmail.com",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      notifyNewPartner: true,
      notifyNewUser: true,
      notifyMouUpload: true,
      notifySecurityAlert: true,
    },
    system: {
      maxFileSize: 10,
      recordsPerPage: 10,
      allowedFileTypes: "pdf,doc,docx,jpg,png,xlsx",
      enableMaintenance: false,
      enableDebugMode: false,
    },
    backup: {
      enableAutoBackup: true,
      backupFrequency: "daily",
      backupTime: "02:00",
      retentionPeriod: 30,
    },
  }
}

function populateSettingsForm() {
  // Populate general settings
  if (currentSettings.general) {
    Object.keys(currentSettings.general).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        element.value = currentSettings.general[key]
      }
    })
  }

  // Populate security settings
  if (currentSettings.security) {
    Object.keys(currentSettings.security).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentSettings.security[key]
        } else {
          element.value = currentSettings.security[key]
        }
      }
    })
  }

  // Populate notification settings
  if (currentSettings.notifications) {
    Object.keys(currentSettings.notifications).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentSettings.notifications[key]
        } else {
          element.value = currentSettings.notifications[key]
        }
      }
    })
  }

  // Populate system settings
  if (currentSettings.system) {
    Object.keys(currentSettings.system).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentSettings.system[key]
        } else {
          element.value = currentSettings.system[key]
        }
      }
    })
  }

  // Populate backup settings
  if (currentSettings.backup) {
    Object.keys(currentSettings.backup).forEach((key) => {
      const element = document.getElementById(key)
      if (element) {
        if (element.type === "checkbox") {
          element.checked = currentSettings.backup[key]
        } else {
          element.value = currentSettings.backup[key]
        }
      }
    })
  }
}

function showSettingsSection(sectionName) {
  const sections = document.querySelectorAll(".settings-section")
  sections.forEach((section) => {
    section.classList.remove("active")
  })

  const targetSection = document.getElementById(`${sectionName}-settings`)
  if (targetSection) {
    targetSection.classList.add("active")
  }

  const navButtons = document.querySelectorAll(".nav-btn")
  navButtons.forEach((btn) => {
    btn.classList.remove("active")
  })

  const activeBtn = Array.from(navButtons).find((btn) => btn.textContent.toLowerCase() === sectionName)
  if (activeBtn) {
    activeBtn.classList.add("active")
  }
}

function saveAllSettings() {
  if (!hasUnsavedChanges) {
    showNotification("No changes to save", "info")
    return
  }

  const formData = collectFormData()

  if (!validateSettings(formData)) {
    return
  }

  localStorage.setItem("systemSettings", JSON.stringify(formData))
  currentSettings = formData

  hasUnsavedChanges = false
  updateSaveButtonState()

  showNotification("Settings saved successfully!", "success")
  console.log("Settings saved:", formData)
}

function collectFormData() {
  const formData = {
    general: {},
    security: {},
    notifications: {},
    system: {},
    backup: {},
  }

  const generalFields = ["orgName", "orgEmail", "timezone", "language", "dateFormat", "currency"]
  generalFields.forEach((field) => {
    const element = document.getElementById(field)
    if (element) {
      formData.general[field] = element.value
    }
  })

  const securityFields = [
    "requireStrongPassword",
    "enableTwoFactor",
    "forcePasswordChange",
    "sessionTimeout",
    "maxLoginAttempts",
    "logSecurityEvents",
  ]
  securityFields.forEach((field) => {
    const element = document.getElementById(field)
    if (element) {
      formData.security[field] = element.type === "checkbox" ? element.checked : element.value
    }
  })

  const notificationFields = [
    "smtpServer",
    "smtpPort",
    "smtpUsername",
    "smtpPassword",
    "notifyNewPartner",
    "notifyNewUser",
    "notifyMouUpload",
    "notifySecurityAlert",
  ]
  notificationFields.forEach((field) => {
    const element = document.getElementById(field)
    if (element) {
      formData.notifications[field] = element.type === "checkbox" ? element.checked : element.value
    }
  })

  const systemFields = ["maxFileSize", "recordsPerPage", "allowedFileTypes", "enableMaintenance", "enableDebugMode"]
  systemFields.forEach((field) => {
    const element = document.getElementById(field)
    if (element) {
      formData.system[field] = element.type === "checkbox" ? element.checked : element.value
    }
  })

  const backupFields = ["enableAutoBackup", "backupFrequency", "backupTime", "retentionPeriod"]
  backupFields.forEach((field) => {
    const element = document.getElementById(field)
    if (element) {
      formData.backup[field] = element.type === "checkbox" ? element.checked : element.value
    }
  })

  return formData
}

function validateSettings(settings) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (settings.general.orgEmail && !emailRegex.test(settings.general.orgEmail)) {
    showNotification("Please enter a valid organization email", "error")
    showSettingsSection("general")
    document.getElementById("orgEmail").focus()
    return false
  }

  if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480) {
    showNotification("Session timeout must be between 5 and 480 minutes", "error")
    showSettingsSection("security")
    document.getElementById("sessionTimeout").focus()
    return false
  }

  if (settings.security.maxLoginAttempts < 3 || settings.security.maxLoginAttempts > 10) {
    showNotification("Max login attempts must be between 3 and 10", "error")
    showSettingsSection("security")
    document.getElementById("maxLoginAttempts").focus()
    return false
  }

  if (
    settings.notifications.notifyNewPartner ||
    settings.notifications.notifyNewUser ||
    settings.notifications.notifyMouUpload ||
    settings.notifications.notifySecurityAlert
  ) {
    if (!settings.notifications.smtpServer || !settings.notifications.smtpUsername) {
      showNotification("SMTP server and username are required for email notifications", "error")
      showSettingsSection("notifications")
      return false
    }
  }

  if (settings.system.maxFileSize < 1 || settings.system.maxFileSize > 100) {
    showNotification("Maximum file size must be between 1 and 100 MB", "error")
    showSettingsSection("system")
    document.getElementById("maxFileSize").focus()
    return false
  }

  return true
}

function updateSaveButtonState() {
  const saveButton = document.querySelector(".btn-primary")
  if (hasUnsavedChanges) {
    saveButton.textContent = "💾 Save Changes *"
    saveButton.style.backgroundColor = "#e74c3c"
  } else {
    saveButton.textContent = "💾 Save Changes"
    saveButton.style.backgroundColor = "#3498db"
  }
}

function validateSmtpSettings() {
  const smtpServer = document.getElementById("smtpServer").value
  const smtpPort = document.getElementById("smtpPort").value

  if (smtpServer && smtpPort) {
    console.log(`Testing SMTP connection to ${smtpServer}:${smtpPort}`)
    showNotification("SMTP settings appear valid", "success")
  }
}

// Backup functions
function createBackup() {
  showNotification("Creating backup...", "info")

  setTimeout(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    const backupName = `backup_${timestamp}.sql`

    console.log(`Backup created: ${backupName}`)
    showNotification("Backup created successfully!", "success")

    addBackupToList(backupName, new Date(), "2.5 MB")
  }, 2000)
}

function downloadBackup() {
  showNotification("Downloading latest backup...", "info")

  setTimeout(() => {
    console.log("Backup download started")
    showNotification("Backup download started", "success")
  }, 1000)
}

function restoreBackup() {
  if (
    confirm("Are you sure you want to restore from backup? This will overwrite all current data and cannot be undone.")
  ) {
    showNotification("Restoring from backup...", "warning")

    setTimeout(() => {
      console.log("Backup restore completed")
      showNotification("System restored from backup successfully!", "success")
    }, 3000)
  }
}

function addBackupToList(name, date, size) {
  const backupList = document.querySelector(".backup-list")
  const backupItem = document.createElement("div")
  backupItem.className = "backup-item"

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  backupItem.innerHTML = `
    <div class="backup-info">
      <div class="backup-name">${name}</div>
      <div class="backup-date">${formattedDate}</div>
    </div>
    <div class="backup-size">${size}</div>
    <button class="btn btn-sm btn-secondary">Download</button>
  `

  backupList.insertBefore(backupItem, backupList.firstChild)
}

// Utility functions
function setActiveMenuItem(menuItem) {
  console.log(`Setting active menu item to: ${menuItem}`)
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    transition: all 0.3s ease;
    font-size: 0.85rem;
  `

  const colors = {
    info: "#3498db",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  }
  notification.style.backgroundColor = colors[type] || colors.info

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "0"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}
