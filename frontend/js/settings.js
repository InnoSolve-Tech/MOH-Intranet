// Import jQuery and agGrid - using global variables instead of imports
const $ = window.jQuery;
const agGrid = window.agGrid;

let dropdownData = {};
let emailHistory = [];
let emailHistoryGrid = null;

$(document).ready(async () => {
  try {
    // Fetch all async data in parallel
    const [thematicAreasRes, partnerCategoriesRes] = await Promise.all([
      fetch("/api/v1/thematic-areas"),
      fetch("/api/v1/partner-categories"),
      // add more fetches later...
    ]);

    // Parse all responses in parallel
    const [thematicAreasJson, partnerCategoriesJson] = await Promise.all([
      thematicAreasRes.json(),
      partnerCategoriesRes.json(),
    ]);

    dropdownData = {
      thematicAreas: thematicAreasJson.map((v) => ({
        ...v,
        name: v.area,
        ID: v.ID,
      })),
      partnerCategories: partnerCategoriesJson.map((v) => ({ ...v, ID: v.ID })),
    };

    initializeSettingsPage();
    loadSmtpSettings();
    loadInternalGroupsData();
    loadEmailHistory();
    populateThematicAreasDropdowns();
  } catch (err) {
    console.error("Error loading dropdown data:", err);
  }
});

const internalGroupsData = [];
let internalGroupsGrid = null;
let editingGroupIndex = -1;

const dropdownGrids = {};
let editingItemIndex = -1;
let editingDropdownType = "";
let smtpSettings = {};

// Email templates
const emailTemplates = {
  survey: {
    subject: "Partnership Survey - Your Input Needed",
    content: `Dear Partner,

We hope this message finds you well. As part of our ongoing commitment to strengthening our partnerships and improving our collaborative efforts, we are conducting a brief survey to gather your valuable feedback.

Your insights will help us:
- Better understand your needs and priorities
- Improve our support and communication
- Plan future initiatives more effectively

The survey will take approximately 10-15 minutes to complete. Please click the link below to begin:

[Survey Link]

Thank you for your continued partnership and support.

Best regards,
Ministry of Health Uganda`,
  },
  update: {
    subject: "Important Program Updates - Please Review",
    content: `Dear Partner,

We hope you are doing well. We wanted to share some important updates regarding our ongoing programs and initiatives.

Key Updates:
- [Update 1]
- [Update 2]
- [Update 3]

These changes may impact your current activities, so please review them carefully and reach out if you have any questions or concerns.

We appreciate your continued collaboration and look forward to working together on these exciting developments.

Warm regards,
Ministry of Health Uganda`,
  },
  meeting: {
    subject: "Partnership Meeting Invitation - Your Attendance Requested",
    content: `Dear Partner,

You are cordially invited to attend our upcoming partnership meeting to discuss important matters and plan future activities.

Meeting Details:
- Date: [Date]
- Time: [Time]
- Location: [Location/Virtual Link]
- Duration: [Duration]

Agenda:
- Review of current partnerships
- Discussion of upcoming initiatives
- Q&A session
- Next steps planning

Please confirm your attendance by [RSVP Date]. If you cannot attend, please let us know if you would like to nominate a representative.

Looking forward to seeing you there.

Best regards,
Ministry of Health Uganda`,
  },
  reminder: {
    subject: "Document Submission Reminder - Action Required",
    content: `Dear Partner,

This is a friendly reminder regarding outstanding document submissions that require your attention.

Outstanding Documents:
- [Document 1] - Due: [Date]
- [Document 2] - Due: [Date]
- [Document 3] - Due: [Date]

Please ensure these documents are submitted by the specified deadlines to avoid any delays in processing or compliance issues.

If you have any questions or need assistance with the submission process, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.

Best regards,
Ministry of Health Uganda`,
  },
};

window.showSettingsSection = (sectionName) => {
  $(".settings-section").removeClass("active");
  $(`#${sectionName}-settings`).addClass("active");

  $(".nav-btn").removeClass("active");
  const buttonText =
    sectionName === "dropdowns"
      ? "Dropdown Management"
      : sectionName === "groups"
        ? "Internal Groups"
        : sectionName === "bulk-email"
          ? "Bulk Email"
          : "SMTP Configuration";
  $(`.nav-btn:contains("${buttonText}")`).addClass("active");
};

// Populate thematic areas in all relevant dropdowns
function populateThematicAreasDropdowns() {
  const thematicOptions = dropdownData.thematicAreas
    .map((area) => `<option value="${area.name}">${area.name}</option>`)
    .join("");

  // Update Internal Groups modal
  $("#groupThematicAreas").html(thematicOptions);

  // Update bulk email targeting when thematic is selected
  updateThematicAreasInBulkEmail();
}

function updateThematicAreasInBulkEmail() {
  if ($("#emailTargetType").val() === "thematic") {
    const thematicOptions = dropdownData.thematicAreas
      .map((area) => `<option value="${area.name}">${area.name}</option>`)
      .join("");
    $("#emailTargetSelection").html(thematicOptions);
  }
}

// Bulk Email Functions
window.updateEmailTargets = () => {
  const targetType = $("#emailTargetType").val();
  const targetGroup = $("#emailTargetSelectionGroup");
  const targetSelection = $("#emailTargetSelection");
  const targetLabel = $("#emailTargetSelectionLabel");

  if (targetType === "") {
    targetGroup.hide();
    updateRecipientSummary(0, "No target selected");
    return;
  }

  if (targetType === "all") {
    targetGroup.hide();
    updateRecipientSummary(125, "All Partners"); // Mock count
    return;
  }

  targetGroup.show();

  if (targetType === "thematic") {
    targetLabel.text("Select Thematic Areas");
    const thematicOptions = dropdownData.thematicAreas
      .map((area) => `<option value="${area.name}">${area.name}</option>`)
      .join("");
    targetSelection.html(thematicOptions);
  } else if (targetType === "group") {
    targetLabel.text("Select Internal Groups");
    const groupOptions = internalGroupsData
      .map((group) => `<option value="${group.id}">${group.name}</option>`)
      .join("");
    targetSelection.html(groupOptions);
  }

  targetSelection.off("change").on("change", updateRecipientCount);
  updateRecipientCount();
};

function updateRecipientCount() {
  const targetType = $("#emailTargetType").val();
  const selectedTargets = $("#emailTargetSelection").val() || [];

  let count = 0;
  let description = "";

  if (targetType === "thematic") {
    // Mock calculation based on selected thematic areas
    count = selectedTargets.length * 15; // Assume 15 partners per thematic area
    description =
      selectedTargets.length > 0
        ? `Partners in: ${selectedTargets.join(", ")}`
        : "No thematic areas selected";
  } else if (targetType === "group") {
    // Calculate based on selected internal groups
    selectedTargets.forEach((groupId) => {
      const group = internalGroupsData.find((g) => g.id == groupId);
      if (group) {
        count += group.partnerCount;
      }
    });
    const groupNames = selectedTargets
      .map((groupId) => {
        const group = internalGroupsData.find((g) => g.id == groupId);
        return group ? group.name : "";
      })
      .filter(Boolean);
    description =
      groupNames.length > 0
        ? `Groups: ${groupNames.join(", ")}`
        : "No groups selected";
  }

  updateRecipientSummary(count, description);
}

function updateRecipientSummary(count, description) {
  $("#recipientSummary").html(`
    <div class="recipient-info">
      <div class="recipient-count">
        <strong>${count}</strong> recipients
      </div>
      <div class="recipient-description">
        ${description}
      </div>
    </div>
  `);
}

window.loadEmailTemplate = (templateName) => {
  const template = emailTemplates[templateName];
  if (template) {
    $("#emailSubject").val(template.subject);
    $("#emailContent").val(template.content);
    previewEmail();
  }
};

window.previewEmail = () => {
  const subject = $("#emailSubject").val();
  const content = $("#emailContent").val();

  if (!subject || !content) {
    showNotification(
      "Please enter both subject and content to preview",
      "error",
    );
    return;
  }

  const previewHtml = `
    <div class="email-preview-content">
      <div class="email-header">
        <div class="email-subject"><strong>Subject:</strong> ${subject}</div>
        <div class="email-from"><strong>From:</strong> ${smtpSettings.fromName || "Ministry of Health Uganda"} &lt;${smtpSettings.fromEmail || "noreply@health.go.ug"}&gt;</div>
      </div>
      <div class="email-body">
        ${content.replace(/\n/g, "<br>")}
      </div>
    </div>
  `;

  $("#previewContent").html(previewHtml);
};

window.sendBulkEmail = () => {
  const targetType = $("#emailTargetType").val();
  const subject = $("#emailSubject").val();
  const content = $("#emailContent").val();
  const priority = $("#emailPriority").val();
  const sendTest = $("#sendTestFirst").is(":checked");
  const testEmail = $("#testEmailAddress").val();

  // Validation
  if (!targetType) {
    showNotification("Please select a target audience", "error");
    return;
  }

  if (!subject || !content) {
    showNotification("Please enter both subject and email content", "error");
    return;
  }

  if (sendTest && !testEmail) {
    showNotification("Please enter a test email address", "error");
    return;
  }

  const recipientCount = parseInt($(".recipient-count strong").text()) || 0;
  if (recipientCount === 0) {
    showNotification("No recipients selected for this email", "error");
    return;
  }

  // Confirm before sending
  const confirmMessage = sendTest
    ? `Send test email to ${testEmail} first?`
    : `Send email to ${recipientCount} recipients?`;

  if (!confirm(confirmMessage)) return;

  // Simulate email sending
  showNotification("Sending email...", "info");

  setTimeout(() => {
    // Add to email history
    const emailRecord = {
      id: Date.now(),
      subject: subject,
      targetType: targetType,
      targetDetails: getTargetDetails(),
      recipientCount: recipientCount,
      sentDate: new Date().toISOString(),
      status: "Sent",
      priority: priority,
    };

    emailHistory.unshift(emailRecord);
    saveEmailHistory();
    initializeEmailHistoryGrid();

    // Reset form
    $("#emailSubject").val("");
    $("#emailContent").val("");
    $("#emailTargetType").val("");
    updateEmailTargets();
    $("#previewContent").html(
      '<div class="preview-placeholder">Email preview will appear here...</div>',
    );

    const message = sendTest
      ? "Test email sent successfully!"
      : `Bulk email sent to ${recipientCount} recipients successfully!`;
    showNotification(message, "success");
  }, 2000);
};

function getTargetDetails() {
  const targetType = $("#emailTargetType").val();
  const selectedTargets = $("#emailTargetSelection").val() || [];

  if (targetType === "all") return "All Partners";
  if (targetType === "thematic") return selectedTargets.join(", ");
  if (targetType === "group") {
    return selectedTargets
      .map((groupId) => {
        const group = internalGroupsData.find((g) => g.id == groupId);
        return group ? group.name : "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function initializeEmailHistoryGrid() {
  if (emailHistoryGrid) {
    emailHistoryGrid.destroy();
  }

  const columnDefs = [
    {
      headerName: "Subject",
      field: "subject",
      sortable: true,
      filter: true,
      flex: 2,
      cellRenderer: (params) => `
        <div>
          <strong>${params.data.subject}</strong>
          <br><small style="color: #666;">${params.data.targetDetails}</small>
        </div>
      `,
    },
    {
      headerName: "Target Type",
      field: "targetType",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params) => {
        const badges = {
          thematic: '<span class="badge badge-info">Thematic</span>',
          group: '<span class="badge badge-success">Group</span>',
          all: '<span class="badge badge-primary">All Partners</span>',
        };
        return badges[params.data.targetType] || params.data.targetType;
      },
    },
    {
      headerName: "Recipients",
      field: "recipientCount",
      sortable: true,
      flex: 1,
      cellRenderer: (params) =>
        `<strong>${params.data.recipientCount}</strong>`,
    },
    {
      headerName: "Sent Date",
      field: "sentDate",
      sortable: true,
      flex: 1,
      cellRenderer: (params) =>
        new Date(params.data.sentDate).toLocaleDateString(),
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      flex: 1,
      cellRenderer: (params) =>
        `<span class="badge badge-success">${params.data.status}</span>`,
    },
  ];

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: emailHistory,
    getRowId: (params) => params.data.id || params.data.ID,
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 60,
  };

  const gridDiv = document.getElementById("emailHistoryGrid");
  emailHistoryGrid = window.agGrid.createGrid(gridDiv, gridOptions);
}

function loadEmailHistory() {
  const saved = localStorage.getItem("emailHistory");
  if (saved) {
    emailHistory.splice(0, emailHistory.length, ...JSON.parse(saved));
  }
}

function saveEmailHistory() {
  localStorage.setItem("emailHistory", JSON.stringify(emailHistory));
}

async function addDropdownItem(dropdownType) {
  let inputId, newValue, type;

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

  switch (dropdownType) {
    case "thematicAreas":
      await fetch(`/api/v1/thematic-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: newValue }),
      });
      break;

    case "partnerCategories":
      type = $("#categoryType").val();
      await fetch(`/api/v1/partner-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, value: newValue }),
      });
      break;
    case "districts":
      break;
    case "supportLevels":
      break;
  }

  if (dropdownType === "partnerCategories") {
    const exists = dropdownData.partnerCategories.some(
      (c) => c.type === type && c.value === newValue,
    );
    if (!exists) {
      dropdownData.partnerCategories.push({
        type: type,
        value: newValue,
        ID: Date.now(), // ideally get this from server response
      });
      showNotification("Category added successfully", "success");
    } else {
      showNotification("Category already exists", "error");
      return;
    }
  } else {
    if (!dropdownData[dropdownType].some((item) => item.name === newValue)) {
      dropdownData[dropdownType].push({ name: newValue, ID: Date.now() });
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

async function deleteDropdownItem(dropdownType, rowIndex, itemId) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  switch (dropdownType) {
    case "thematicAreas":
      await fetch(`/api/v1/thematic-areas/${itemId}`, { method: "DELETE" });
      break;
    case "partnerCategories":
      await fetch(`/api/v1/partner-categories/${itemId}`, { method: "DELETE" });
      break;
    case "districts":
      break;
    case "supportLevels":
      break;
  }

  const gridApi = dropdownGrids[dropdownType];
  if (!gridApi) {
    console.error("Grid API not found for type:", dropdownType);
    return;
  }

  const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
  if (!rowNode) {
    console.error("Row node not found for index", rowIndex);
    return;
  }
  const rowData = rowNode.data;

  gridApi.applyTransaction({ remove: [rowData] });

  if (dropdownType === "partnerCategories") {
    dropdownData.partnerCategories = dropdownData.partnerCategories.filter(
      (cat) => cat.ID !== itemId,
    );
  } else {
    dropdownData[dropdownType] = dropdownData[dropdownType].filter(
      (item) => item.ID !== itemId,
    );
  }

  grid.api.applyTransaction({ remove: [rowData] });

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
    dropdownData.partnerCategories.map(({ type, value, ID }) => {
      items.push({ type, value, id: ID });
    });
  } else {
    items = dropdownData[dropdownType].map((item, index) => ({
      id: item.ID,
      value: item.name,
    }));
  }

  if (dropdownGrids[dropdownType]) {
    dropdownGrids[dropdownType].destroy();
  }

  const columnDefs =
    dropdownType === "partnerCategories"
      ? [
          {
            headerName: "ID",
            field: "id",
            hide: true,
            flex: 1,
          },
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
        <button class="btn btn-sm btn-danger" onclick="deleteDropdownItem('${dropdownType}', ${params.node.rowIndex}, ${params.data.id} )">
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
            headerName: "ID",
            field: "id",
            hide: true,
            flex: 1,
          },
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
        <button class="btn btn-sm btn-danger" onclick="deleteDropdownItem('${dropdownType}', ${params.node.rowIndex}, ${params.data.id} )">
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
    getRowId: (params) => params.data.id || params.data.ID,
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
    getRowId: (params) => params.data.id || params.data.ID,
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

function initializeSettingsPage() {
  window.showSettingsSection("dropdowns");

  Object.keys(dropdownData).forEach((dropdownType) => {
    initializeDropdownGrid(dropdownType);
  });

  initializeInternalGroupsGrid();
}
