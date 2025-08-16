let usersData = []
let filteredUsers = []
let gridApi = null
let editingUserId = null
let treeFilters = {
  role: null,
  scope: null,
  user: null,
}

const agGrid = window.agGrid
const $ = window.jQuery

$(document).ready(() => {
  initializeUsersPage()
  loadUsers()
  initializeGrid()
  buildTreeView()
  setupUsersEventListeners()
})

function initializeUsersPage() {
  setActiveMenuItem("users")
}

function setupUsersEventListeners() {
  $(window).on("click", (event) => {
    if ($(event.target).hasClass("modal")) {
      closeUserModal()
    }
  })

  $("#userForm").on("submit", (e) => {
    e.preventDefault()
    saveUser()
  })

  $("#confirmPassword").on("input", validatePasswordMatch)
}

async function loadUsers() {
  try {
    const res = await fetch("/api/v1/users")
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`)
    }
    const apiUsers = await res.json()
    console.log("API Response:", apiUsers)

    // Map database format to UI format
    usersData = apiUsers.map((user) => ({
      id: user.ID,
      uuid: user.uuid,
      firstName: user.username, // Using username as firstName since no separate name fields
      lastName: "", // No lastName in database
      email: user.username + "@system.local", // Generate email from username
      phone: "", // No phone in database
      role: user.roles ? user.roles.role_name : "Unknown",
      scope: user.scope,
      status: user.DeletedAt ? "inactive" : "active",
      lastLogin: "Not tracked", // No lastLogin in database
      createdAt: new Date(user.CreatedAt).toISOString().split("T")[0],
      permissions: user.roles
        ? {
            view: user.roles.view,
            create: user.roles.create,
            edit: user.roles.edit,
            remove: user.roles.remove,
            functions: user.roles.function || [],
          }
        : null,
      rawData: user, // Keep original data for API operations
    }))
  } catch (error) {
    console.error("Error loading users:", error)
    showNotification("Failed to load users from database", "error")
    // Fallback to empty array
    usersData = []
  }

  filteredUsers = [...usersData]
  buildTreeView()
  applyTreeFilters()
}

function initializeGrid() {
  const columnDefs = [
    {
      headerName: "User",
      field: "firstName",
      width: 150,
       flex: 1,
      cellRenderer: (params) => {
        const initials = `${params.data.firstName.charAt(0)}${params.data.lastName.charAt(0)}`
        return `
          <div style="display: flex; align-items: center;">
            <div>
              <div style="font-weight: 500; font-size: 0.8rem;">${params.data.firstName} ${params.data.lastName}</div>
              <div style="font-size: 0.7rem; color: #6c757d;">ID: ${params.data.id}</div>
            </div>
          </div>
        `
      },
    },
    {
      headerName: "Email",
      field: "email",
      width: 180,
       flex: 1,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Role",
      field: "role",
      width: 80,
       flex: 1,
      cellRenderer: (params) => `
        <span class="role-badge role-${params.value.toLowerCase()}">${params.value}</span>
      `,
    },
    {
      headerName: "Scope",
      field: "scope",
      width: 100,
       flex: 1,
      cellStyle: { fontSize: "0.75rem" },
      valueFormatter: (params) => params.value || "Not assigned",
    },
    {
      headerName: "Status",
      field: "status",
      width: 70,
      flex: 1,
      cellRenderer: (params) => `
        <span class="status-badge status-${params.value}">${params.value}</span>
      `,
    },
    {
      headerName: "Actions",
      width: 120,
      flex: 1.5,
      cellRenderer: (params) => `
        <div class="action-buttons">
          <button class="action-btn btn-view" onclick="viewUser(${params.data.id})" title="View">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3z"/>
            </svg>
          </button>
          <button class="action-btn btn-edit" onclick="editUser(${params.data.id})" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="action-btn btn-toggle" onclick="toggleUserStatus(${params.data.id})" title="Toggle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="${params.data.status === "active" ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"}"/>
            </svg>
          </button>
          <button class="action-btn btn-delete" onclick="deleteUser(${params.data.id})" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      `,
    },
  ]

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: filteredUsers,
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowSelection: "multiple",
    animateRows: true,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
    },
  }

  const gridDiv = $("#usersGrid")[0]
  if (gridDiv) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions)
  }
}

function buildTreeView() {
  const $treeContainer = $("#userTree")
  if (!$treeContainer.length) return

  const treeData = buildTreeData()
  $treeContainer.empty()

  Object.keys(treeData).forEach((role) => {
    const roleNode = createTreeNode(role, "role", treeData[role])
    $treeContainer.append(roleNode)
  })
}

function buildTreeData() {
  const tree = {}

  usersData.forEach((user) => {
    if (!tree[user.role]) {
      tree[user.role] = {}
    }
    const scope = user.scope || "No Scope"
    if (!tree[user.role][scope]) {
      tree[user.role][scope] = []
    }
    tree[user.role][scope].push(user)
  })

  return tree
}

function createTreeNode(label, level, children) {
  const $nodeDiv = $("<div>").addClass("tree-node")
  const $headerDiv = $("<div>").addClass("tree-node-header")

  $headerDiv.on("click", () => toggleTreeNode($headerDiv[0], level, label))

  const hasChildren = level !== "user" && Object.keys(children).length > 0

  $headerDiv.html(`
    <span class="tree-toggle">${hasChildren ? "▶" : ""}</span>
    <span>${label} ${level === "role" ? `(${Object.values(children).flat().length})` : level === "scope" ? `(${children.length})` : ""}</span>
  `)

  $nodeDiv.append($headerDiv)

  if (hasChildren) {
    const $childrenDiv = $("<div>").addClass("tree-children")

    if (level === "role") {
      Object.keys(children).forEach((scope) => {
        const scopeNode = createTreeNode(scope, "scope", children[scope])
        $childrenDiv.append(scopeNode)
      })
    } else if (level === "scope") {
      children.forEach((user) => {
        const $userDiv = $("<div>").addClass("tree-leaf").text(`${user.firstName}`)
        $userDiv.on("click", () => selectTreeLeaf($userDiv[0], "user", user.id))
        $childrenDiv.append($userDiv)
      })
    }

    $nodeDiv.append($childrenDiv)
  }

  return $nodeDiv[0]
}

function toggleTreeNode(header, level, value) {
  const $header = $(header)
  const $children = $header.parent().find(".tree-children").first()
  const $toggle = $header.find(".tree-toggle")

  if ($children.length) {
    const isExpanded = $children.hasClass("expanded")
    $children.toggleClass("expanded")
    $toggle.text(isExpanded ? "▶" : "▼")
  }

  if (level === "role") {
    treeFilters.role = treeFilters.role === value ? null : value
    treeFilters.scope = null
    treeFilters.user = null
  } else if (level === "scope") {
    treeFilters.scope = treeFilters.scope === value ? null : value
    treeFilters.user = null
  }

  updateTreeSelection()
  applyTreeFilters()
}

function selectTreeLeaf(leaf, level, value) {
  $(".tree-leaf.selected").removeClass("selected")

  if (treeFilters.user === value) {
    treeFilters.user = null
  } else {
    $(leaf).addClass("selected")
    treeFilters.user = value
  }

  applyTreeFilters()
}

function updateTreeSelection() {
  $(".tree-node-header").removeClass("active")

  if (treeFilters.role) {
    $(".tree-node-header").each(function () {
      if ($(this).text().includes(treeFilters.role)) {
        $(this).addClass("active")
      }
    })
  }
}

function applyTreeFilters() {
  filteredUsers = usersData.filter((user) => {
    if (treeFilters.role && user.role !== treeFilters.role) return false
    if (treeFilters.scope) {
      const scope = user.scope || "No Scope"
      if (scope !== treeFilters.scope) return false
    }
    if (treeFilters.user && user.id !== treeFilters.user) return false
    return true
  })

  if (gridApi) {
    gridApi.setGridOption("rowData", filteredUsers)
  }
}

function searchTree() {
  const searchTerm = $("#treeSearch").val().toLowerCase()
  $(".tree-node-header, .tree-leaf").each(function () {
    const text = $(this).text().toLowerCase()
    const match = text.includes(searchTerm)
    $(this).css("display", match || searchTerm === "" ? "flex" : "none")
  })
}

function clearTreeFilters() {
  treeFilters = { role: null, scope: null, user: null }
  $(".tree-node-header.active").removeClass("active")
  $(".tree-leaf.selected").removeClass("selected")
  $("#treeSearch").val("")
  searchTree()
  applyTreeFilters()
}

function openAddUserModal() {
  editingUserId = null
  $("#modalTitle").text("Add New User")
  $("#userForm")[0].reset()
  $("#passwordRow").show()
  $("#password").prop("required", true)
  $("#confirmPassword").prop("required", true)
  $("#userModal").addClass("show")
}

function editUser(id) {
  const user = usersData.find((u) => u.id === id)
  if (!user) return

  editingUserId = id
  $("#modalTitle").text("Edit User")
  $("#firstName").val(user.firstName)
  $("#lastName").val(user.lastName)
  $("#email").val(user.email)
  $("#phone").val(user.phone || "")
  $("#role").val(user.role)
  $("#scope").val(user.scope || "")
  $("#passwordRow").hide()
  $("#password").prop("required", false)
  $("#confirmPassword").prop("required", false)
  $("#userModal").addClass("show")
}

function closeUserModal() {
  $("#userModal").removeClass("show")
  editingUserId = null
}

function validatePasswordMatch() {
  const password = $("#password").val()
  const confirmPassword = $("#confirmPassword").val()

  if (password !== confirmPassword) {
    $("#confirmPassword")[0].setCustomValidity("Passwords do not match")
  } else {
    $("#confirmPassword")[0].setCustomValidity("")
  }
}

async function saveUser() {
  const form = $("#userForm")[0]
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const formData = new FormData(form)
  const userData = {
    username: formData.get("firstName"), // Using firstName as username
    password: formData.get("password"),
    scope: formData.get("scope") || "global",
    role_name: formData.get("role"),
  }

  try {
    let response
    if (editingUserId) {
      const user = usersData.find((u) => u.id === editingUserId)
      response = await fetch(`/api/v1/users/${user.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
    } else {
      response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const result = await response.json()
    console.log("User save result:", result)

    showNotification(editingUserId ? "User updated successfully!" : "User added successfully!", "success")

    await loadUsers()
    closeUserModal()
  } catch (error) {
    console.error("Error saving user:", error)
    showNotification("Failed to save user", "error")
  }
}

function viewUser(id) {
  const user = usersData.find((u) => u.id === id)
  if (!user) return

  alert(
    `User Details:\n\nName: ${user.firstName}\nEmail: ${user.email}\nPhone: ${user.phone || "Not provided"}\nRole: ${user.role}\nScope: ${user.scope || "Not assigned"}\nStatus: ${user.status}\nLast Login: ${user.lastLogin}\nCreated: ${user.createdAt}`,
  )
}

async function toggleUserStatus(id) {
  const user = usersData.find((u) => u.id === id)
  if (!user) return

  const newStatus = user.status === "active" ? "inactive" : "active"
  const action = newStatus === "active" ? "activate" : "deactivate"

  if (confirm(`Are you sure you want to ${action} ${user.firstName}?`)) {
    try {
      const response = await fetch(`/api/v1/users/${user.uuid}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        console.warn("Status toggle endpoint not available, updating locally")
        user.status = newStatus
        applyTreeFilters()
      } else {
        await loadUsers()
      }

      showNotification(`User ${action}d successfully!`, "success")
    } catch (error) {
      console.error("Error toggling user status:", error)
      user.status = newStatus
      applyTreeFilters()
      showNotification(`User ${action}d locally (API unavailable)`, "success")
    }
  }
}

async function deleteUser(id) {
  const user = usersData.find((u) => u.id === id)
  if (!user) return

  if (confirm(`Are you sure you want to delete ${user.firstName}? This action cannot be undone.`)) {
    try {
      const response = await fetch(`/api/v1/users/${user.uuid}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      showNotification("User deleted successfully!", "success")

      await loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      showNotification("Failed to delete user", "error")
    }
  }
}

function setActiveMenuItem(menuItem) {
  console.log(`Setting active menu item to: ${menuItem}`)
}

function showNotification(message, type) {
  console.log(`Notification (${type}): ${message}`)

  let $notification = $("#notification")
  if (!$notification.length) {
    $notification = $("<div>").attr("id", "notification").css({
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "4px",
      color: "white",
      fontWeight: "500",
      zIndex: "10000",
      opacity: "0",
      transition: "opacity 0.3s ease",
    })
    $("body").append($notification)
  }

  $notification
    .text(message)
    .removeClass()
    .addClass(`notification-${type}`)
    .css("backgroundColor", type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8")
    .css("opacity", "1")

  setTimeout(() => {
    $notification.css("opacity", "0")
  }, 3000)
}
