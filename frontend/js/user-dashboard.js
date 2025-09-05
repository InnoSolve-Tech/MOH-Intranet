// user-dashboard.js

let currentPartner = null;
const charts = {};
let partnersReportGrid = null;

// Use jQuery from window object
const $ = window.jQuery;

// Initialize dashboard on document ready
$(document).ready(() => {
  initializeCharts();

  // Get current user partner UUID (adjust retrieval as per your auth/context)
  const partnerUUID = getCookie("user_uuid");

  // Load profile and dashboard data
  loadPartnerProfile(partnerUUID);
});

// Load single partner profile by UUID
async function loadPartnerProfile(partneruuid) {
  try {
    const response = await fetch(`/api/v1/users/${partneruuid}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const res = await response.json();
    currentPartner = mapPartnerData(res.partner);
    updateReportsGrid();
    updateAllCharts();
    console.log(currentPartner);
    populateStatCards(currentPartner);
  } catch (error) {
    console.error("Error loading partner data:", error);
  }
}

// Map single partner data to structure similar to partnersData array entries
function mapPartnerData(partner) {
  return {
    id: partner.ID,
    name: partner.partner_name || "Unknown",
    acronym: partner.acronym || "-",
    type: partner.partner_type || "Unknown",
    category: partner.partner_category || "Unknown",
    phone: partner.official_phone || "-",
    email: partner.official_email || "-",
    status: partner.status || "Active",
    hasMou: partner.has_mou_moh ? "Yes" : "No",
    mouLink: partner.mou_link || null,
    addresses: partner.partner_address || [],
    contacts: partner.partner_contacts || [],
    supportYears: partner.partner_support_years || [],
    registrationDate: partner.CreatedAt || new Date().toISOString(),
  };
}

// Initialize (dummy) grid to display the single partner in reports grid UI
function initializeReportsGrid() {
  const gridOptions = {
    columnDefs: [
      { headerName: "Partner Name", field: "name", flex: 2, minWidth: 200 },
      { headerName: "Acronym", field: "acronym", width: 100 },
      { headerName: "Type", field: "type", width: 120 },
      { headerName: "Category", field: "category", width: 150 },
      { headerName: "Phone", field: "phone", width: 150 },
      { headerName: "Email", field: "email", flex: 1, minWidth: 200 },
      {
        headerName: "Status",
        field: "status",
        width: 100,
        cellRenderer: (params) => {
          const status = params.value;
          const className =
            status === "Active"
              ? "status-active"
              : status === "Inactive"
                ? "status-inactive"
                : "status-pending";
          return `<span class="status-badge ${className}">${status}</span>`;
        },
      },
      { headerName: "Has MoU", field: "hasMou", width: 100 },
      {
        headerName: "Contacts",
        field: "contacts",
        width: 100,
        valueFormatter: (params) =>
          Array.isArray(params.value) ? params.value.length : 0,
      },
      {
        headerName: "Support Years",
        field: "supportYears",
        width: 120,
        valueFormatter: (params) =>
          Array.isArray(params.value) ? params.value.length : 0,
      },
    ],
    rowData: [],
    domLayout: "normal",
    suppressRowClickSelection: true,
    rowHeight: 50,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
    },
  };

  const gridDiv = document.querySelector("#partnersReportGrid");
  if (gridDiv && window.agGrid) {
    partnersReportGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }
}

// Update grid data with current partner
function updateReportsGrid() {
  if (partnersReportGrid && currentPartner) {
    partnersReportGrid.setGridOption("rowData", [currentPartner]);
  }
}

function initializeCharts() {
  // 1. Thematic Areas Coverage
  const thematicAreasCtx = document.getElementById("thematicAreasChart");
  if (thematicAreasCtx) {
    charts.thematicAreas = new Chart(thematicAreasCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{ label: "Coverage", data: [], backgroundColor: "#28a745" }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // 2. Support Years Timeline
  const supportYearsCtx = document.getElementById("supportYearsChart");
  if (supportYearsCtx) {
    charts.supportYears = new Chart(supportYearsCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          { label: "Support Years", data: [], backgroundColor: "#007bff" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, stepSize: 1 } },
      },
    });
  }

  // 3. District Coverage
  const districtCtx = document.getElementById("districtsChart");
  if (districtCtx) {
    charts.districts = new Chart(districtCtx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#007bff",
              "#28a745",
              "#ffc107",
              "#dc3545",
              "#6c757d",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  // 4. Subcounty Coverage (Top 10)
  const subcountyCtx = document.getElementById("subcountiesChart");
  if (subcountyCtx) {
    charts.subcounties = new Chart(subcountyCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          { label: "Subcounties", data: [], backgroundColor: "#17a2b8" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: { x: { beginAtZero: true } },
      },
    });
  }

  // 5. Contacts by Title
  const contactsCtx = document.getElementById("contactsChart");
  if (contactsCtx) {
    charts.contacts = new Chart(contactsCtx, {
      type: "pie",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#007bff",
              "#28a745",
              "#ffc107",
              "#dc3545",
              "#6f42c1",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  // 6. MoU Status
  const mouStatusCtx = document.getElementById("mouStatusChart");
  if (mouStatusCtx) {
    charts.mouStatus = new Chart(mouStatusCtx, {
      type: "pie",
      data: {
        labels: ["Signed", "Not Signed"],
        datasets: [{ data: [0, 0], backgroundColor: ["#28a745", "#dc3545"] }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}

// --- Update functions ---
function updateAllCharts() {
  updateThematicAreasChart();
  updateSupportYearsChart();
  updateDistrictsChart();
  updateSubcountiesChart();
  updateContactsChart();
  updateMoUStatusChart();
}

function updateThematicAreasChart() {
  if (!charts.thematicAreas || !currentPartner) return;
  const counts = {};
  (currentPartner.supportYears || []).forEach((sy) => {
    (sy.thematic_areas || []).forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
  });
  charts.thematicAreas.data.labels = Object.keys(counts);
  charts.thematicAreas.data.datasets[0].data = Object.values(counts);
  charts.thematicAreas.update();
}

function updateSupportYearsChart() {
  if (!charts.supportYears || !currentPartner) return;
  const years = {};
  (currentPartner.supportYears || []).forEach((sy) => {
    years[sy.year] = (years[sy.year] || 0) + 1;
  });
  charts.supportYears.data.labels = Object.keys(years);
  charts.supportYears.data.datasets[0].data = Object.values(years);
  charts.supportYears.update();
}

function updateDistrictsChart() {
  if (!charts.districts || !currentPartner) return;
  const districts = {};
  (currentPartner.supportYears || []).forEach((sy) => {
    (sy.districts || []).forEach((d) => {
      districts[d.district] = (districts[d.district] || 0) + 1;
    });
  });
  charts.districts.data.labels = Object.keys(districts);
  charts.districts.data.datasets[0].data = Object.values(districts);
  charts.districts.update();
}

function updateSubcountiesChart() {
  if (!charts.subcounties || !currentPartner) return;
  const subcounties = {};
  (currentPartner.supportYears || []).forEach((sy) => {
    (sy.districts || []).forEach((d) => {
      (d.subcounties || []).forEach((s) => {
        subcounties[s] = (subcounties[s] || 0) + 1;
      });
    });
  });
  const sorted = Object.entries(subcounties)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  charts.subcounties.data.labels = sorted.map((x) => x[0]);
  charts.subcounties.data.datasets[0].data = sorted.map((x) => x[1]);
  charts.subcounties.update();
}

function updateContactsChart() {
  if (!charts.contacts || !currentPartner) return;
  const titles = {};
  (currentPartner.contacts || []).forEach((c) => {
    titles[c.title] = (titles[c.title] || 0) + 1;
  });
  charts.contacts.data.labels = Object.keys(titles);
  charts.contacts.data.datasets[0].data = Object.values(titles);
  charts.contacts.update();
}

function updateMoUStatusChart() {
  if (!charts.mouStatus || !currentPartner) return;
  const signed = currentPartner.hasMou === "Yes" ? 1 : 0;
  const notSigned = currentPartner.hasMou !== "Yes" ? 1 : 0;
  charts.mouStatus.data.datasets[0].data = [signed, notSigned];
  charts.mouStatus.update();
}
