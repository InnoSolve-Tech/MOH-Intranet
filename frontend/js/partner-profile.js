// Partner Profile Management
let currentPartner = null;
let contactsGrid = null;
let supportYearsGrid = null;
let documentsGrid = null;

// Declare the $ variable
const $ = window.jQuery;
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize grids first
  initializeGrids();

  // Load Partner Profile
  const partner_uuid = getCookie("user_uuid");
  if (partner_uuid) {
    await loadPartnerProfile(partner_uuid);
  } else {
    showNotification("User UUID not found in cookies", "error");
  }
});

// Initialize partner profile page

// Load partner profile data
async function loadPartnerProfile(partneruuid) {
  try {
    const response = await fetch(`/api/v1/users/${partneruuid}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const res = await response.json();
    const partner = res.partner;
    currentPartner = partner;
    console.log(partner);

    if (res.user.roles.role_name == "admin") {
      $(".back-btn").css("display", "inline-block");
    }

    populatePartnerInfo(partner);
    loadContactsData(partner.partner_contacts || []);
    loadSupportYearsData(partner.partner_support_years || []);
    loadDocumentsData(partner.documents || []);
  } catch (error) {
    console.error("Error loading partner profile:", error);
    showNotification("Failed to load partner profile", "error");
  }
}

// Populate partner information
function populatePartnerInfo(partner) {
  // Header information
  $("#partnerName").text(partner.partner_name || "Unknown Partner");
  $("#partnerType").text(partner.partner_type || "-");
  $("#partnerStatus").text(partner.status || "Active");

  // Overview section
  $("#overviewPartnerName").text(partner.partner_name || "-");
  $("#overviewAcronym").text(partner.acronym || "-");
  $("#overviewType").text(partner.partner_type || "-");
  $("#overviewCategory").text(partner.partner_category || "-");
  $("#overviewPhone").text(partner.official_phone || "-");
  $("#overviewEmail").text(partner.official_email || "-");

  // Addresses
  const addressesList = $("#addressesList");
  addressesList.empty();

  if (partner.partner_address && partner.partner_address.length > 0) {
    partner.partner_address.forEach((address) => {
      addressesList.append(`
                <div class="address-item">
                    ${address.address || address}
                </div>
            `);
    });
  } else {
    addressesList.append(
      '<div class="address-item">No addresses available</div>',
    );
  }

  // MoU Information
  $("#overviewHasMou").text(partner.has_mou ? "Yes" : "No");
  $("#overviewSignedBy").text(partner.mou?.signedBy || "-");
  $("#overviewWhoTitle").text(partner.mou?.whoTitle || "-");
  $("#overviewSignedDate").text(partner.mou?.signedDate || "-");
  $("#overviewExpiryDate").text(partner.mou?.expiryDate || "-");

  if (partner.mou_link) {
    $("#overviewMouFile").html(`
            <a href="${partner.mou_link}" target="_blank" class="file-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                View MoU Document
            </a>
        `);
  } else {
    $("#overviewMouFile").text("No document available");
  }
}

// Initialize grids
function initializeGrids() {
  initializeContactsGrid();
  initializeSupportYearsGrid();
  initializeDocumentsGrid();
}

// Initialize contacts grid
function initializeContactsGrid() {
  const gridOptions = {
    columnDefs: [
      { headerName: "Name", field: "names", flex: 1 },
      { headerName: "Position", field: "title", flex: 1 },
      { headerName: "Phone", field: "phone_number", flex: 1 },
      { headerName: "Email", field: "official_email", flex: 1 },
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        cellRenderer: (params) => `
                        <button class="btn-icon" onclick="editContact(${params.node.rowIndex})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteContact(${params.node.rowIndex})" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    `,
      },
    ],
    rowData: [],
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 50,
  };

  const gridDiv = document.querySelector("#contactsGrid");
  if (gridDiv && window.agGrid) {
    contactsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }
}

// Initialize support years grid
function initializeSupportYearsGrid() {
  const gridOptions = {
    columnDefs: [
      { headerName: "Year", field: "year", width: 100 },
      { headerName: "Level", field: "level", flex: 1 },
      { headerName: "Thematic Areas", field: "thematicAreas", flex: 1 },
      {
        headerName: "Districts",
        field: "districts",
        flex: 1,
        valueFormatter: (params) =>
          Array.isArray(params.value) ? params.value.join(", ") : params.value,
      },
      {
        headerName: "Coverage",
        field: "coverage",
        flex: 1,
        valueFormatter: (params) => {
          if (typeof params.value === "object" && params.value !== null) {
            return Object.entries(params.value)
              .map(([district, coverage]) => `${district}: ${coverage}`)
              .join(", ");
          }
          return params.value || "-";
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        cellRenderer: (params) => `
                        <button class="btn-icon" onclick="editSupportYear(${params.node.rowIndex})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteSupportYear(${params.node.rowIndex})" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    `,
      },
    ],
    rowData: [],
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 50,
  };

  const gridDiv = document.querySelector("#supportYearsGrid");
  if (gridDiv && window.agGrid) {
    supportYearsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }
}

// Initialize documents grid
function initializeDocumentsGrid() {
  const gridOptions = {
    columnDefs: [
      { headerName: "Document Name", field: "name", flex: 1 },
      { headerName: "Type", field: "type", width: 120 },
      { headerName: "Upload Date", field: "uploadDate", width: 150 },
      { headerName: "Size", field: "size", width: 100 },
      {
        headerName: "Actions",
        field: "actions",
        width: 150,
        cellRenderer: (params) => `
                        <button class="btn-icon" onclick="downloadDocument('${params.data.id}')" title="Download">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteDocument('${params.data.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    `,
      },
    ],
    rowData: [],
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 50,
  };

  const gridDiv = document.querySelector("#documentsGrid");
  if (gridDiv && window.agGrid) {
    documentsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }
}

// Load data into grids
function loadSupportYearsData(supportYears) {
  const normalized = supportYears.map((sy) => ({
    year: sy.year,
    level: sy.level,
    thematicAreas: Array.isArray(sy.thematic_areas)
      ? sy.thematic_areas.join(", ")
      : "-",
    districts: Array.isArray(sy.districts)
      ? sy.districts.map((d) => d.district).join(", ")
      : "-",
    coverage: Array.isArray(sy.districts)
      ? sy.districts.reduce((acc, d) => {
          acc[d.district] = d.subcounties?.length || 0;
          return acc;
        }, {})
      : "-",
  }));

  if (supportYearsGrid) {
    supportYearsGrid.setGridOption("rowData", normalized);
  }
}

function loadContactsData(contacts) {
  const normalized = contacts.map((c) => ({
    ...c,
    official_email: c.official_email || "-", // fix typo mismatch
  }));

  if (contactsGrid) {
    contactsGrid.setGridOption("rowData", normalized);
  }
}

function loadDocumentsData(documents) {
  if (documentsGrid) {
    documentsGrid.setGridOption("rowData", documents);
  }
}

// Profile section navigation
function showProfileSection(sectionName) {
  // Hide all sections
  $(".profile-section").removeClass("active");
  $(".profile-nav .nav-btn").removeClass("active");

  // Show selected section
  $(`#${sectionName}-section`).addClass("active");
  $(
    `.profile-nav .nav-btn[onclick="showProfileSection('${sectionName}')"]`,
  ).addClass("active");
}

// Action functions (placeholders for now)
function editPartner() {
  showNotification("Edit partner functionality coming soon", "info");
}

function addContact() {
  showNotification("Add contact functionality coming soon", "info");
}

function editContact(index) {
  showNotification("Edit contact functionality coming soon", "info");
}

function deleteContact(index) {
  showNotification("Delete contact functionality coming soon", "info");
}

function addSupportYear() {
  showNotification("Add support year functionality coming soon", "info");
}

function editSupportYear(index) {
  showNotification("Edit support year functionality coming soon", "info");
}

function deleteSupportYear(index) {
  showNotification("Delete support year functionality coming soon", "info");
}

function uploadDocument() {
  showNotification("Upload document functionality coming soon", "info");
}

function downloadDocument(id) {
  showNotification("Download document functionality coming soon", "info");
}

function deleteDocument(id) {
  showNotification("Delete document functionality coming soon", "info");
}

// Utility function for notifications
function showNotification(message, type = "info") {
  // Create notification element
  const notification = $(`
        <div class="notification ${type}">
            <span>${message}</span>
        </div>
    `);

  // Add to page
  $("body").append(notification);

  // Show and auto-hide
  setTimeout(() => notification.addClass("show"), 100);
  setTimeout(() => {
    notification.removeClass("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Make functions globally accessible
window.showProfileSection = showProfileSection;
window.editPartner = editPartner;
window.addContact = addContact;
window.editContact = editContact;
window.deleteContact = deleteContact;
window.addSupportYear = addSupportYear;
window.editSupportYear = editSupportYear;
window.deleteSupportYear = deleteSupportYear;
window.uploadDocument = uploadDocument;
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;
