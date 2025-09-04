// user-dashboard.js

let currentPartner = null;
const charts = {};
let partnersReportGrid = null;

// Use jQuery from window object
const $ = window.jQuery;

// Initialize dashboard on document ready
$(document).ready(() => {
  initializeCharts();
  initializeAnalyticsCharts();
  initializeTrendsCharts();

  // Get current user partner UUID (adjust retrieval as per your auth/context)
  const partnerUUID =
    getCookie("user_uuid") || "9a451d17-db9c-4274-a99c-e4b860d4c40d";

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

// Chart initialization functions based on admin dashboard.js logic

function initializeCharts() {
  initializeOverviewCharts();
}

function initializeOverviewCharts() {
  const partnerTypesCtx = document.getElementById("partnerTypesChart");
  if (partnerTypesCtx) {
    charts.partnerTypes = new Chart(partnerTypesCtx, {
      type: "pie",
      data: {
        labels: ["Local", "International"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ["#28a745", "#007bff"],
            borderWidth: 2,
            borderColor: "#fff",
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

  const thematicAreasCtx = document.getElementById("thematicAreasChart");
  if (thematicAreasCtx) {
    charts.thematicAreas = new Chart(thematicAreasCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Partners",
            data: [],
            backgroundColor: "#28a745",
            borderColor: "#1e7e34",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const geographicCtx = document.getElementById("geographicChart");
  if (geographicCtx) {
    charts.geographic = new Chart(geographicCtx, {
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
            borderWidth: 2,
            borderColor: "#fff",
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

  const trendsCtx = document.getElementById("trendsChart");
  if (trendsCtx) {
    charts.trends = new Chart(trendsCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "New Registrations",
            data: [],
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}

function initializeAnalyticsCharts() {
  const growthCtx = document.getElementById("growthChart");
  if (growthCtx) {
    charts.growth = new Chart(growthCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Cumulative Partners",
            data: [],
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const mouStatusCtx = document.getElementById("mouStatusChart");
  if (mouStatusCtx) {
    charts.mouStatus = new Chart(mouStatusCtx, {
      type: "pie",
      data: {
        labels: ["Signed", "Pending", "Expired"],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
            borderWidth: 2,
            borderColor: "#fff",
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

  const supportYearsCtx = document.getElementById("supportYearsChart");
  if (supportYearsCtx) {
    charts.supportYears = new Chart(supportYearsCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Number of Partners",
            data: [],
            backgroundColor: "#007bff",
            borderColor: "#0056b3",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const districtHeatmapCtx = document.getElementById("districtHeatmapChart");
  if (districtHeatmapCtx) {
    charts.districtHeatmap = new Chart(districtHeatmapCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Partners by District",
            data: [],
            backgroundColor: "#28a745",
            borderColor: "#19692c",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}

function initializeTrendsCharts() {
  const regTrendsCtx = document.getElementById("registrationTrendsChart");
  if (regTrendsCtx) {
    charts.registrationTrends = new Chart(regTrendsCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "New Partners",
            data: [],
            backgroundColor: "#007bff",
            borderColor: "#0056b3",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const thematicTrendsCtx = document.getElementById("thematicTrendsChart");
  if (thematicTrendsCtx) {
    charts.thematicTrends = new Chart(thematicTrendsCtx, {
      type: "line",
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const geographicTrendsCtx = document.getElementById("geographicTrendsChart");
  if (geographicTrendsCtx) {
    charts.geographicTrends = new Chart(geographicTrendsCtx, {
      type: "bar",
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  const durationTrendsCtx = document.getElementById("durationTrendsChart");
  if (durationTrendsCtx) {
    charts.durationTrends = new Chart(durationTrendsCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Average Partnership Duration (Years)",
            data: [],
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, suggestedMax: 10 } },
      },
    });
  }
}

// Update all relevant charts (partnersData is single partner in an array here)
function updateAllCharts() {
  updatePartnerTypesChart();
  updateThematicAreasChart();
  updateGeographicChart();
  updateTrendsChart();
  updateGrowthChart();
  updateMoUStatusChart();
  updateSupportYearsChart();
}

// Functions for each update chart are adapted from admin-dashboard.js, customized to handle single currentPartner wrapped in array for compatibility:

function updatePartnerTypesChart() {
  if (!charts.partnerTypes || !currentPartner) return;
  const data = currentPartner.type === "Local" ? [1, 0] : [0, 1];
  charts.partnerTypes.data.labels = ["Local", "International"];
  charts.partnerTypes.data.datasets[0].data = data;
  charts.partnerTypes.update();
}

function updateThematicAreasChart() {
  if (!charts.thematicAreas || !currentPartner) return;
  const areas = new Set();
  (currentPartner.supportYears || []).forEach((sy) => {
    (sy.thematic_areas || []).forEach((a) => areas.add(a));
  });
  const labels = Array.from(areas);
  const data = labels.map(() => 1);
  charts.thematicAreas.data.labels = labels.length ? labels : ["None"];
  charts.thematicAreas.data.datasets[0].data = data.length ? data : [1];
  charts.thematicAreas.update();
}

function updateGeographicChart() {
  if (!charts.geographic || !currentPartner) return;
  const categories = new Map();
  const cat = currentPartner.category || "Unknown";
  categories.set(cat, 1);
  charts.geographic.data.labels = Array.from(categories.keys());
  charts.geographic.data.datasets[0].data = Array.from(categories.values());
  charts.geographic.update();
}

function updateTrendsChart() {
  if (!charts.trends || !currentPartner) return;

  // For single partner, let's simulate a trend for their registration month
  const date = new Date(currentPartner.registrationDate);
  if (isNaN(date)) return;

  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  // Set labels and data for single month with count 1
  charts.trends.data.labels = [monthKey];
  charts.trends.data.datasets[0].data = [1];
  charts.trends.update();
}

function updateGrowthChart() {
  if (!charts.growth || !currentPartner) return;

  // Use a single partner wrapped in array for compatibility
  const partnerArray = [currentPartner];

  const monthlyCounts = {};
  partnerArray.forEach((partner) => {
    const date = new Date(partner.registrationDate);
    if (!isNaN(date)) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthlyCounts).sort();

  let cumulativeSum = 0;
  const cumulativeData = sortedMonths.map((month) => {
    cumulativeSum += monthlyCounts[month];
    return cumulativeSum;
  });

  charts.growth.data.labels = sortedMonths;
  charts.growth.data.datasets[0].data = cumulativeData;
  charts.growth.update();
}

function updateMoUStatusChart() {
  if (!charts.mouStatus || !currentPartner) return;

  // For one partner, simple count: signed = 1 if hasMoU yes, else pending =1
  const signed = currentPartner.hasMou === "Yes" ? 1 : 0;
  const pending = currentPartner.hasMou !== "Yes" ? 1 : 0;
  const expired = 0; // Modify if you have expiration info

  charts.mouStatus.data.datasets[0].data = [signed, pending, expired];
  charts.mouStatus.update();
}

function populateStatCards(partner) {
  $("#contactsCount").text((partner.contacts || []).length);

  $("#supportYearsCount").text((partner.supportYears || []).length);

  $("#hasMouStatus").text(partner.hasMou === "Yes" ? "Yes" : "No");

  const districtsSet = new Set();
  (partner.supportYears || []).forEach((sy) => {
    (sy.districts || []).forEach((d) => districtsSet.add(d.district));
  });
  $("#districtsCoveredCount").text(districtsSet.size);
}

function updateSupportYearsChart() {
  if (!charts.supportYears || !currentPartner) return;

  const supportYears = currentPartner.supportYears || [];
  const countMap = {};

  // Count how many partners have each number of support years (here one partner so count will be 1 for their years)
  const yearsCount = supportYears.length;
  countMap[yearsCount] = (countMap[yearsCount] || 0) + 1;

  const sortedKeys = Object.keys(countMap).sort((a, b) => a - b);

  charts.supportYears.data.labels = sortedKeys.map(
    (k) => `${k} year${k === "1" ? "" : "s"}`,
  );
  charts.supportYears.data.datasets[0].data = sortedKeys.map(
    (k) => countMap[k],
  );

  charts.supportYears.update();
}
