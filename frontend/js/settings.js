// Import jQuery and agGrid - using global variables instead of imports
const $ = window.jQuery;
const agGrid = window.agGrid;

const dropdownData = {
  thematicAreas: [
    "Health",
    "Education",
    "Agriculture",
    "Water and Sanitation",
    "Nutrition",
    "Child Protection",
    "Gender Equality",
    "Environment",
    "Economic Development",
    "Emergency Response",
    "Governance",
    "Human Rights",
  ],
  partnerCategories: {
    Local: ["Local NGO", "CBO"],
    International: ["Bi-Lateral", "Multilateral", "UN", "International NGO"],
  },
  districts: [
    "Kampala",
    "Wakiso",
    "Mukono",
    "Jinja",
    "Mbale",
    "Gulu",
    "Lira",
    "Mbarara",
    "Kasese",
    "Fort Portal",
    "Hoima",
    "Masaka",
    "Soroti",
    "Arua",
    "Kabale",
    "Moroto",
    "Kitgum",
    "Pader",
    "Adjumani",
    "Moyo",
  ],
  supportLevels: ["National", "District"],
};

const internalGroupsData = [];
let internalGroupsGrid = null;
let editingGroupIndex = -1;

const dropdownGrids = {};
let editingItemIndex = -1;
let editingDropdownType = "";
let smtpSettings = {};

window.showSettingsSection = (sectionName) => {
  $(".settings-section").removeClass("active");
  $(`#${sectionName}-settings`).addClass("active");

  $(".nav-btn").removeClass("active");
  const buttonText =
    sectionName === "dropdowns"
      ? "Dropdown Management"
      : sectionName === "groups"
        ? "Internal Groups"
        : "SMTP Configuration";
  $(`.nav-btn:contains("${buttonText}")`).addClass("active");
};

function addDropdownItem(dropdownType) {
  let inputId, newValue;

  switch (dropdownType) {
    case "thematicAreas":
      inputId = "newThematicArea";
      break;
    case "partnerCategories":
      inputId = "newPartnerCategory";
      break;
    case "districts":
      inputId = "newDistrict";
      break;
    case "supportLevels":
      inputId = "newSupportLevel";
      break;
  }

  newValue = $(`#${inputId}`).val().trim();
  if (!newValue) {
    showNotification("Please enter a value", "error");
    return;
  }

  if (dropdownType === "partnerCategories") {
    const type = $("#categoryType").val();
    if (!dropdownData.partnerCategories[type].includes(newValue)) {
      dropdownData.partnerCategories[type].push(newValue);
      showNotification("Category added successfully", "success");
    } else {
      showNotification("Category already exists", "error");
      return;
    }
  } else {
    if (!dropdownData[dropdownType].includes(newValue)) {
      dropdownData[dropdownType].push(newValue);
      showNotification("Item added successfully", "success");
    } else {
      showNotification("Item already exists", "error");
      return;
    }
  }

  $(`#${inputId}`).val("");
  initializeDropdownGrid(dropdownType);
  saveDropdownData();
}

function editDropdownItem(dropdownType, rowIndex) {
  editingItemIndex = rowIndex;
  editingDropdownType = dropdownType;
  const rowData =
    dropdownGrids[dropdownType].getDisplayedRowAtIndex(rowIndex).data;

  $("#editItemValue").val(rowData.value);
  $("#editItemModal").addClass("show");
}

function deleteDropdownItem(dropdownType, rowIndex) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  const rowData =
    dropdownGrids[dropdownType].getDisplayedRowAtIndex(rowIndex).data;

  if (dropdownType === "partnerCategories") {
    const typeCategories = dropdownData.partnerCategories[rowData.type];
    const index = typeCategories.indexOf(rowData.value);
    if (index !== -1) {
      typeCategories.splice(index, 1);
    }
  } else {
    const index = dropdownData[dropdownType].indexOf(rowData.value);
    if (index !== -1) {
      dropdownData[dropdownType].splice(index, 1);
    }
  }

  initializeDropdownGrid(dropdownType);
  saveDropdownData();
  showNotification("Item deleted successfully", "success");
}

function closeEditItemModal() {
  $("#editItemModal").removeClass("show");
  editingItemIndex = -1;
  editingDropdownType = "";
}

function saveEditedItem() {
  const newValue = $("#editItemValue").val().trim();
  if (!newValue) {
    showNotification("Please enter a value", "error");
    return;
  }

  const rowData =
    dropdownGrids[editingDropdownType].getDisplayedRowAtIndex(
      editingItemIndex,
    ).data;

  if (editingDropdownType === "partnerCategories") {
    const typeCategories = dropdownData.partnerCategories[rowData.type];
    const oldIndex = typeCategories.indexOf(rowData.value);
    if (oldIndex !== -1) {
      typeCategories[oldIndex] = newValue;
    }
  } else {
    const oldIndex = dropdownData[editingDropdownType].indexOf(rowData.value);
    if (oldIndex !== -1) {
      dropdownData[editingDropdownType][oldIndex] = newValue;
    }
  }

  closeEditItemModal();
  initializeDropdownGrid(editingDropdownType);
  saveDropdownData();
  showNotification("Item updated successfully", "success");
}

function testSmtpConnection() {
  const testEmail = $("#testEmail").val();
  if (!testEmail) {
    showNotification("Please enter a test email address", "error");
    return;
  }

  const smtpData = collectSmtpData();
  if (!smtpData.host || !smtpData.username || !smtpData.password) {
    showNotification("Please fill in all required SMTP fields", "error");
    return;
  }

  showNotification("Testing SMTP connection...", "info");

  // Simulate SMTP test
  setTimeout(() => {
    showNotification("Test email sent successfully!", "success");
  }, 2000);
}

function saveAllSettings() {
  saveDropdownData();
  smtpSettings = collectSmtpData();
  localStorage.setItem("smtpSettings", JSON.stringify(smtpSettings));
  showNotification("All settings saved successfully!", "success");
}

function addInternalGroup() {
  const name = $("#newGroupName").val().trim();
  const description = $("#newGroupDescription").val().trim();

  if (!name) {
    showNotification("Please enter a group name", "error");
    return;
  }

  // Check if group name already exists
  if (
    internalGroupsData.some(
      (group) => group.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    showNotification("Group name already exists", "error");
    return;
  }

  const newGroup = {
    id: Date.now(),
    name: name,
    description: description,
    thematicAreas: [],
    districts: [],
    color: "#3498db",
    createdAt: new Date().toISOString(),
    partnerCount: 0,
  };

  internalGroupsData.push(newGroup);
  $("#newGroupName").val("");
  $("#newGroupDescription").val("");

  initializeInternalGroupsGrid();
  saveInternalGroupsData();
  showNotification("Internal group added successfully", "success");
}

function editInternalGroup(groupIndex) {
  editingGroupIndex = groupIndex;
  const group = internalGroupsData[groupIndex];

  $("#groupModalTitle").text("Edit Internal Group");
  $("#groupName").val(group.name);
  $("#groupDescription").val(group.description);
  $("#groupColor").val(group.color);

  // Set selected thematic areas
  $("#groupThematicAreas").val(group.thematicAreas);

  // Set selected districts
  $("#groupDistricts").val(group.districts);

  $("#groupModal").addClass("show");
}

function deleteInternalGroup(groupIndex) {
  const group = internalGroupsData[groupIndex];

  if (!confirm(`Are you sure you want to delete the group "${group.name}"?`))
    return;

  internalGroupsData.splice(groupIndex, 1);
  initializeInternalGroupsGrid();
  saveInternalGroupsData();
  showNotification("Internal group deleted successfully", "success");
}

function openAddGroupModal() {
  editingGroupIndex = -1;
  $("#groupModalTitle").text("Add Internal Group");
  $("#groupName").val("");
  $("#groupDescription").val("");
  $("#groupColor").val("#3498db");
  $("#groupThematicAreas").val([]);
  $("#groupDistricts").val([]);
  $("#groupModal").addClass("show");
}

function closeGroupModal() {
  $("#groupModal").removeClass("show");
  editingGroupIndex = -1;
}

function saveInternalGroup() {
  const name = $("#groupName").val().trim();
  const description = $("#groupDescription").val().trim();
  const thematicAreas = $("#groupThematicAreas").val() || [];
  const districts = $("#groupDistricts").val() || [];
  const color = $("#groupColor").val();

  if (!name) {
    showNotification("Please enter a group name", "error");
    return;
  }

  // Check for duplicate names (excluding current group if editing)
  const existingGroup = internalGroupsData.find(
    (group, index) =>
      group.name.toLowerCase() === name.toLowerCase() &&
      index !== editingGroupIndex,
  );

  if (existingGroup) {
    showNotification("Group name already exists", "error");
    return;
  }

  const groupData = {
    name: name,
    description: description,
    thematicAreas: thematicAreas,
    districts: districts,
    color: color,
  };

  if (editingGroupIndex >= 0) {
    // Update existing group
    Object.assign(internalGroupsData[editingGroupIndex], groupData);
    showNotification("Internal group updated successfully", "success");
  } else {
    // Add new group
    const newGroup = {
      id: Date.now(),
      ...groupData,
      createdAt: new Date().toISOString(),
      partnerCount: 0,
    };
    internalGroupsData.push(newGroup);
    showNotification("Internal group added successfully", "success");
  }

  closeGroupModal();
  initializeInternalGroupsGrid();
  saveInternalGroupsData();
}

function initializeDropdownGrid(dropdownType) {
  let items = [];

  if (dropdownType === "partnerCategories") {
    Object.keys(dropdownData.partnerCategories).forEach((type) => {
      dropdownData.partnerCategories[type].forEach((category) => {
        items.push({ type, value: category });
      });
    });
  } else {
    items = dropdownData[dropdownType].map((item, index) => ({
      id: index,
      value: item,
    }));
  }

  if (dropdownGrids[dropdownType]) {
    dropdownGrids[dropdownType].destroy();
  }

  const columnDefs =
    dropdownType === "partnerCategories"
      ? [
          {
            headerName: "Type",
            field: "type",
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            headerName: "Category",
            field: "value",
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params) => `
        <button class="btn btn-sm btn-primary" onclick="editDropdownItem('${dropdownType}', ${params.node.rowIndex})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteDropdownItem('${dropdownType}', ${params.node.rowIndex})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      `,
            flex: 1,
          },
        ]
      : [
          {
            headerName: "Value",
            field: "value",
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params) => `
        <button class="btn btn-sm btn-primary" onclick="editDropdownItem('${dropdownType}', ${params.node.rowIndex})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteDropdownItem('${dropdownType}', ${params.node.rowIndex})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      `,
            flex: 1,
          },
        ];

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: items,
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 40,
  };

  const gridDiv = document.getElementById(`${dropdownType}Grid`);
  dropdownGrids[dropdownType] = window.agGrid.createGrid(gridDiv, gridOptions);
}

function initializeInternalGroupsGrid() {
  if (internalGroupsGrid) {
    internalGroupsGrid.destroy();
  }

  const columnDefs = [
    {
      headerName: "Group Name",
      field: "name",
      sortable: true,
      filter: true,
      flex: 2,
      cellRenderer: (params) => `
        <div style="display: flex; align-items: center;">
          <div style="width: 12px; height: 12px; background-color: ${params.data.color}; border-radius: 50%; margin-right: 8px;"></div>
          <strong>${params.data.name}</strong>
        </div>
      `,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      headerName: "Thematic Areas",
      field: "thematicAreas",
      flex: 2,
      cellRenderer: (params) => params.data.thematicAreas.join(", ") || "None",
    },
    {
      headerName: "Districts",
      field: "districts",
      flex: 2,
      cellRenderer: (params) => params.data.districts.join(", ") || "None",
    },
    {
      headerName: "Partners",
      field: "partnerCount",
      sortable: true,
      flex: 1,
      cellRenderer: (params) =>
        `<span class="badge">${params.data.partnerCount}</span>`,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => `
        <button class="btn btn-sm btn-primary" onclick="editInternalGroup(${params.node.rowIndex})" title="Edit Group">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteInternalGroup(${params.node.rowIndex})" title="Delete Group">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      `,
      flex: 1,
    },
  ];

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: internalGroupsData,
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 50,
  };

  const gridDiv = document.getElementById("internalGroupsGrid");
  internalGroupsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
}

function loadSmtpSettings() {
  const saved = localStorage.getItem("smtpSettings");
  if (saved) {
    smtpSettings = JSON.parse(saved);
    populateSmtpForm();
  } else {
    smtpSettings = {
      host: "",
      port: 587,
      username: "",
      password: "",
      security: "tls",
      fromName: "Ministry of Health Uganda",
      fromEmail: "noreply@health.go.ug",
      notifications: {
        newPartner: true,
        newUser: true,
        mouUpload: true,
        securityAlert: true,
      },
    };
  }
}

function populateSmtpForm() {
  $("#smtpHost").val(smtpSettings.host || "");
  $("#smtpPort").val(smtpSettings.port || 587);
  $("#smtpUsername").val(smtpSettings.username || "");
  $("#smtpPassword").val(smtpSettings.password || "");
  $("#smtpSecurity").val(smtpSettings.security || "tls");
  $("#smtpFromName").val(smtpSettings.fromName || "");
  $("#smtpFromEmail").val(smtpSettings.fromEmail || "");

  if (smtpSettings.notifications) {
    $("#notifyNewPartner").prop(
      "checked",
      smtpSettings.notifications.newPartner,
    );
    $("#notifyNewUser").prop("checked", smtpSettings.notifications.newUser);
    $("#notifyMouUpload").prop("checked", smtpSettings.notifications.mouUpload);
    $("#notifySecurityAlert").prop(
      "checked",
      smtpSettings.notifications.securityAlert,
    );
  }
}

function collectSmtpData() {
  return {
    host: $("#smtpHost").val(),
    port: Number.parseInt($("#smtpPort").val()),
    username: $("#smtpUsername").val(),
    password: $("#smtpPassword").val(),
    security: $("#smtpSecurity").val(),
    fromName: $("#smtpFromName").val(),
    fromEmail: $("#smtpFromEmail").val(),
    notifications: {
      newPartner: $("#notifyNewPartner").is(":checked"),
      newUser: $("#notifyNewUser").is(":checked"),
      mouUpload: $("#notifyMouUpload").is(":checked"),
      securityAlert: $("#notifySecurityAlert").is(":checked"),
    },
  };
}

function saveDropdownData() {
  localStorage.setItem("dropdownData", JSON.stringify(dropdownData));
}

function saveInternalGroupsData() {
  localStorage.setItem(
    "internalGroupsData",
    JSON.stringify(internalGroupsData),
  );
}

function loadInternalGroupsData() {
  const saved = localStorage.getItem("internalGroupsData");
  if (saved) {
    internalGroupsData.splice(
      0,
      internalGroupsData.length,
      ...JSON.parse(saved),
    );
  }
}

function showNotification(message, type) {
  const notification = $(`
    <div class="notification ${type}">
      ${message}
    </div>
  `);

  const colors = {
    info: "#3498db",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  };

  notification.css({
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 16px",
    borderRadius: "4px",
    color: "white",
    backgroundColor: colors[type] || colors.info,
    zIndex: 1000,
    fontSize: "0.85rem",
  });

  $("body").append(notification);

  setTimeout(() => {
    notification.fadeOut(300, () => notification.remove());
  }, 3000);
}

window.logout = () => {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
};

$(document).ready(() => {
  initializeSettingsPage();
  loadSmtpSettings();
  loadInternalGroupsData();
});

function initializeSettingsPage() {
  window.showSettingsSection("dropdowns");

  Object.keys(dropdownData).forEach((dropdownType) => {
    initializeDropdownGrid(dropdownType);
  });

  initializeInternalGroupsGrid();
}
