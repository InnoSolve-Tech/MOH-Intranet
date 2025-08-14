let usersData = [];
let filteredUsers = [];
let gridApi = null;
let editingUserId = null;
let treeFilters = {
  role: null,
  department: null,
  user: null,
};

const agGrid = window.agGrid;
const $ = window.jQuery;

$(document).ready(() => {
  initializeUsersPage();
  loadUsers();
  initializeGrid();
  buildTreeView();
  setupUsersEventListeners();
});

function initializeUsersPage() {
  setActiveMenuItem("users");
}

function setupUsersEventListeners() {
  $(window).on("click", (event) => {
    if ($(event.target).hasClass("modal")) {
      closeUserModal();
    }
  });

  $("#userForm").on("submit", (e) => {
    e.preventDefault();
    saveUser();
  });

  $("#confirmPassword").on("input", validatePasswordMatch);
}

function loadUsers() {
  usersData = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+256-700-123456",
      role: "Admin",
      department: "IT",
      status: "active",
      lastLogin: "2024-01-15 10:30 AM",
      createdAt: "2023-06-15",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+256-700-234567",
      role: "Manager",
      department: "HR",
      status: "active",
      lastLogin: "2024-01-14 02:15 PM",
      createdAt: "2023-07-20",
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      phone: "+256-700-345678",
      role: "User",
      department: "Operations",
      status: "active",
      lastLogin: "2024-01-13 09:45 AM",
      createdAt: "2023-08-10",
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@example.com",
      phone: "+256-700-456789",
      role: "Viewer",
      department: "Finance",
      status: "pending",
      lastLogin: "Never",
      createdAt: "2024-01-10",
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      phone: "+256-700-567890",
      role: "User",
      department: "Operations",
      status: "inactive",
      lastLogin: "2023-12-20 04:20 PM",
      createdAt: "2023-05-15",
    },
  ];

  filteredUsers = [...usersData];
  buildTreeView();
  applyTreeFilters();
}

function initializeGrid() {
  const columnDefs = [
    {
      headerName: "User",
      field: "firstName",
      width: 150,
      cellRenderer: (params) => {
        const initials = `${params.data.firstName.charAt(0)}${params.data.lastName.charAt(0)}`;
        return `
          <div style="display: flex; align-items: center;">
            <div class="user-avatar">${initials}</div>
            <div>
              <div style="font-weight: 500; font-size: 0.8rem;">${params.data.firstName} ${params.data.lastName}</div>
              <div style="font-size: 0.7rem; color: #6c757d;">ID: ${params.data.id}</div>
            </div>
          </div>
        `;
      },
    },
    {
      headerName: "Email",
      field: "email",
      width: 180,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Role",
      field: "role",
      width: 80,
      cellRenderer: (params) => `
        <span class="role-badge role-${params.value.toLowerCase()}">${params.value}</span>
      `,
    },
    {
      headerName: "Department",
      field: "department",
      width: 100,
      cellStyle: { fontSize: "0.75rem" },
      valueFormatter: (params) => params.value || "Not assigned",
    },
    {
      headerName: "Last Login",
      field: "lastLogin",
      width: 120,
      cellStyle: { fontSize: "0.7rem", color: "#6c757d" },
    },
    {
      headerName: "Status",
      field: "status",
      width: 70,
      cellRenderer: (params) => `
        <span class="status-badge status-${params.value}">${params.value}</span>
      `,
    },
    {
      headerName: "Actions",
      width: 120,
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
  ];

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
  };

  const gridDiv = $("#usersGrid")[0];
  if (gridDiv) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
  }
}

function buildTreeView() {
  const $treeContainer = $("#userTree");
  if (!$treeContainer.length) return;

  const treeData = buildTreeData();
  $treeContainer.empty();

  Object.keys(treeData).forEach((role) => {
    const roleNode = createTreeNode(role, "role", treeData[role]);
    $treeContainer.append(roleNode);
  });
}

function buildTreeData() {
  const tree = {};

  usersData.forEach((user) => {
    if (!tree[user.role]) {
      tree[user.role] = {};
    }
    const dept = user.department || "No Department";
    if (!tree[user.role][dept]) {
      tree[user.role][dept] = [];
    }
    tree[user.role][dept].push(user);
  });

  return tree;
}

function createTreeNode(label, level, children) {
  const $nodeDiv = $("<div>").addClass("tree-node");
  const $headerDiv = $("<div>").addClass("tree-node-header");

  $headerDiv.on("click", () => toggleTreeNode($headerDiv[0], level, label));

  const hasChildren = level !== "user" && Object.keys(children).length > 0;

  $headerDiv.html(`
    <span class="tree-toggle">${hasChildren ? "▶" : ""}</span>
    <span>${label} ${level === "role" ? `(${Object.values(children).flat().length})` : level === "department" ? `(${children.length})` : ""}</span>
  `);

  $nodeDiv.append($headerDiv);

  if (hasChildren) {
    const $childrenDiv = $("<div>").addClass("tree-children");

    if (level === "role") {
      Object.keys(children).forEach((department) => {
        const deptNode = createTreeNode(
          department,
          "department",
          children[department],
        );
        $childrenDiv.append(deptNode);
      });
    } else if (level === "department") {
      children.forEach((user) => {
        const $userDiv = $("<div>")
          .addClass("tree-leaf")
          .text(`${user.firstName} ${user.lastName}`);
        $userDiv.on("click", () =>
          selectTreeLeaf($userDiv[0], "user", user.id),
        );
        $childrenDiv.append($userDiv);
      });
    }

    $nodeDiv.append($childrenDiv);
  }

  return $nodeDiv[0];
}

function toggleTreeNode(header, level, value) {
  const $header = $(header);
  const $children = $header.parent().find(".tree-children").first();
  const $toggle = $header.find(".tree-toggle");

  if ($children.length) {
    const isExpanded = $children.hasClass("expanded");
    $children.toggleClass("expanded");
    $toggle.text(isExpanded ? "▶" : "▼");
  }

  if (level === "role") {
    treeFilters.role = treeFilters.role === value ? null : value;
    treeFilters.department = null;
    treeFilters.user = null;
  } else if (level === "department") {
    treeFilters.department = treeFilters.department === value ? null : value;
    treeFilters.user = null;
  }

  updateTreeSelection();
  applyTreeFilters();
}

function selectTreeLeaf(leaf, level, value) {
  $(".tree-leaf.selected").removeClass("selected");

  if (treeFilters.user === value) {
    treeFilters.user = null;
  } else {
    $(leaf).addClass("selected");
    treeFilters.user = value;
  }

  applyTreeFilters();
}

function updateTreeSelection() {
  $(".tree-node-header").removeClass("active");

  if (treeFilters.role) {
    $(".tree-node-header").each(function () {
      if ($(this).text().includes(treeFilters.role)) {
        $(this).addClass("active");
      }
    });
  }
}

function applyTreeFilters() {
  filteredUsers = usersData.filter((user) => {
    if (treeFilters.role && user.role !== treeFilters.role) return false;
    if (treeFilters.department) {
      const dept = user.department || "No Department";
      if (dept !== treeFilters.department) return false;
    }
    if (treeFilters.user && user.id !== treeFilters.user) return false;
    return true;
  });

  if (gridApi) {
    gridApi.setGridOption("rowData", filteredUsers);
  }
}

function searchTree() {
  const searchTerm = $("#treeSearch").val().toLowerCase();
  $(".tree-node-header, .tree-leaf").each(function () {
    const text = $(this).text().toLowerCase();
    const match = text.includes(searchTerm);
    $(this).css("display", match || searchTerm === "" ? "flex" : "none");
  });
}

function clearTreeFilters() {
  treeFilters = { role: null, department: null, user: null };
  $(".tree-node-header.active").removeClass("active");
  $(".tree-leaf.selected").removeClass("selected");
  $("#treeSearch").val("");
  searchTree();
  applyTreeFilters();
}

function openAddUserModal() {
  editingUserId = null;
  $("#modalTitle").text("Add New User");
  $("#userForm")[0].reset();
  $("#passwordRow").show();
  $("#password").prop("required", true);
  $("#confirmPassword").prop("required", true);
  $("#userModal").addClass("show");
}

function editUser(id) {
  const user = usersData.find((u) => u.id === id);
  if (!user) return;

  editingUserId = id;
  $("#modalTitle").text("Edit User");
  $("#firstName").val(user.firstName);
  $("#lastName").val(user.lastName);
  $("#email").val(user.email);
  $("#phone").val(user.phone || "");
  $("#role").val(user.role);
  $("#department").val(user.department || "");
  $("#passwordRow").hide();
  $("#password").prop("required", false);
  $("#confirmPassword").prop("required", false);
  $("#userModal").addClass("show");
}

function closeUserModal() {
  $("#userModal").removeClass("show");
  editingUserId = null;
}

function validatePasswordMatch() {
  const password = $("#password").val();
  const confirmPassword = $("#confirmPassword").val();

  if (password !== confirmPassword) {
    $("#confirmPassword")[0].setCustomValidity("Passwords do not match");
  } else {
    $("#confirmPassword")[0].setCustomValidity("");
  }
}

function saveUser() {
  const form = $("#userForm")[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    department: formData.get("department"),
    status: "active",
    lastLogin: "Never",
    createdAt: new Date().toISOString().split("T")[0],
  };

  if (editingUserId) {
    const index = usersData.findIndex((u) => u.id === editingUserId);
    if (index !== -1) {
      usersData[index] = { ...usersData[index], ...userData };
      showNotification("User updated successfully!", "success");
    }
  } else {
    const newId = Math.max(...usersData.map((u) => u.id), 0) + 1;
    const newUser = { id: newId, ...userData };
    usersData.push(newUser);
    showNotification("User added successfully!", "success");
  }

  buildTreeView();
  applyTreeFilters();
  closeUserModal();
}

function viewUser(id) {
  const user = usersData.find((u) => u.id === id);
  if (!user) return;

  alert(
    `User Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone || "Not provided"}\nRole: ${user.role}\nDepartment: ${user.department || "Not assigned"}\nStatus: ${user.status}\nLast Login: ${user.lastLogin}\nCreated: ${user.createdAt}`,
  );
}

function toggleUserStatus(id) {
  const user = usersData.find((u) => u.id === id);
  if (!user) return;

  const newStatus = user.status === "active" ? "inactive" : "active";
  const action = newStatus === "active" ? "activate" : "deactivate";

  if (
    confirm(
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
    )
  ) {
    user.status = newStatus;
    applyTreeFilters();
    showNotification(`User ${action}d successfully!`, "success");
  }
}

function deleteUser(id) {
  const user = usersData.find((u) => u.id === id);
  if (!user) return;

  if (
    confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
    )
  ) {
    usersData = usersData.filter((u) => u.id !== id);
    buildTreeView();
    applyTreeFilters();
    showNotification("User deleted successfully!", "success");
  }
}

function setActiveMenuItem(menuItem) {
  console.log(`Setting active menu item to: ${menuItem}`);
}

function showNotification(message, type) {
  console.log(`Notification (${type}): ${message}`);

  let $notification = $("#notification");
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
    });
    $("body").append($notification);
  }

  $notification
    .text(message)
    .removeClass()
    .addClass(`notification-${type}`)
    .css(
      "backgroundColor",
      type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8",
    )
    .css("opacity", "1");

  setTimeout(() => {
    $notification.css("opacity", "0");
  }, 3000);
}
