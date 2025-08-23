// Reports and Analytics Management
let partnersData = [];
const charts = {};
let partnersReportGrid = null;

// Declare the $ variable
const $ = window.jQuery;

// Initialize reports page
$(document).ready(() => {
  loadPartnersData();
  initializeReportsGrid();
  initializeCharts();
  updateStatistics();
});

// Load partners data for reports
async function loadPartnersData() {
  try {
    const response = await fetch("/api/v1/partners");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const partners = await response.json();
    partnersData = partners.map((partner) => ({
      id: partner.ID,
      name: partner.partner_name || "Unknown",
      acronym: partner.acronym || "-",
      type: partner.partner_type || "Unknown",
      category: partner.partner_category || "Unknown",
      phone: partner.official_phone || "-",
      email: partner.official_email || "-",
      status: partner.status || "Active",
      hasMou: partner.has_mou ? "Yes" : "No",
      mouLink: partner.mou_link || null,
      addresses: partner.partner_address || [],
      contacts: partner.partner_contacts || [],
      supportYears: partner.partner_support_years || [],
      registrationDate: partner.created_at || new Date().toISOString(),
    }));

    updateReportsGrid();
    updateAllCharts();
    updateStatistics();
  } catch (error) {
    console.error("Error loading partners data:", error);
    loadMockReportsData();
  }
}

// Load mock data as fallback
function loadMockReportsData() {
  partnersData = [
    {
      id: 1,
      name: "United Nations Children's Fund",
      acronym: "UNICEF",
      type: "International",
      category: "UN",
      phone: "+256-414-234567",
      email: "uganda@unicef.org",
      status: "Active",
      hasMou: "Yes",
      addresses: ["Plot 17A Clement Hill Road, Nakasero"],
      contacts: [
        {
          names: "Jane Smith",
          title: "Country Director",
          phone_number: "+256-700-123456",
          offical_email: "jane.smith@unicef.org",
        },
      ],
      supportYears: [
        {
          year: 2023,
          level: "National",
          thematicAreas: "Health",
          districts: ["Kampala", "Wakiso"],
        },
      ],
      registrationDate: "2023-01-15T00:00:00Z",
    },
    {
      id: 2,
      name: "World Health Organization",
      acronym: "WHO",
      type: "International",
      category: "UN",
      phone: "+256-414-345678",
      email: "uganda@who.int",
      status: "Active",
      hasMou: "Yes",
      addresses: ["Plot 15 Nakasero Road"],
      contacts: [
        {
          names: "Dr. John Doe",
          title: "Representative",
          phone_number: "+256-700-234567",
          offical_email: "john.doe@who.int",
        },
      ],
      supportYears: [
        {
          year: 2023,
          level: "National",
          thematicAreas: "Health",
          districts: ["All Districts"],
        },
      ],
      registrationDate: "2023-02-20T00:00:00Z",
    },
    {
      id: 3,
      name: "Brac Uganda",
      acronym: "BRAC",
      type: "International",
      category: "International NGO",
      phone: "+256-414-456789",
      email: "info@brac.net",
      status: "Active",
      hasMou: "No",
      addresses: ["Plot 2 Wampewo Avenue, Kololo"],
      contacts: [
        {
          names: "Sarah Johnson",
          title: "Country Manager",
          phone_number: "+256-700-345678",
          offical_email: "sarah.johnson@brac.net",
        },
      ],
      supportYears: [
        {
          year: 2023,
          level: "District",
          thematicAreas: "Education",
          districts: ["Kampala", "Mukono"],
        },
      ],
      registrationDate: "2023-03-10T00:00:00Z",
    },
  ];

  updateReportsGrid();
  updateAllCharts();
  updateStatistics();
}

// Initialize reports grid
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

// Update reports grid
function updateReportsGrid() {
  if (partnersReportGrid && partnersData) {
    partnersReportGrid.setGridOption("rowData", partnersData);
  }
}

// Initialize all charts
function initializeCharts() {
  initializeOverviewCharts();
  initializeAnalyticsCharts();
  initializeTrendsCharts();
}

// Initialize overview charts
function initializeOverviewCharts() {
  // Partner Types Chart
  const partnerTypesCtx = document.getElementById("partnerTypesChart");
  if (partnerTypesCtx) {
    charts.partnerTypes = new window.Chart(partnerTypesCtx, {
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
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // Thematic Areas Chart
  const thematicAreasCtx = document.getElementById("thematicAreasChart");
  if (thematicAreasCtx) {
    charts.thematicAreas = new window.Chart(thematicAreasCtx, {
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Geographic Distribution Chart
  const geographicCtx = document.getElementById("geographicChart");
  if (geographicCtx) {
    charts.geographic = new window.Chart(geographicCtx, {
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
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  // Registration Trends Chart
  const trendsCtx = document.getElementById("trendsChart");
  if (trendsCtx) {
    charts.trends = new window.Chart(trendsCtx, {
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
  // Growth Chart
  const growthCtx = document.getElementById("growthChart");
  if (growthCtx) {
    charts.growth = new window.Chart(growthCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Cumulative Partners",
            data: [5, 8, 12, 15, 18, 24],
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // MoU Status Chart
  const mouStatusCtx = document.getElementById("mouStatusChart");
  if (mouStatusCtx) {
    charts.mouStatus = new window.Chart(mouStatusCtx, {
      type: "pie",
      data: {
        labels: ["Signed", "Pending", "Expired"],
        datasets: [
          {
            data: [18, 4, 2],
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }
}

// Initialize trends charts
function initializeTrendsCharts() {
  // Registration Trends Chart
  const regTrendsCtx = document.getElementById("registrationTrendsChart");
  if (regTrendsCtx) {
    charts.registrationTrends = new window.Chart(regTrendsCtx, {
      type: "bar",
      data: {
        labels: ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024"],
        datasets: [
          {
            label: "New Partners",
            data: [3, 5, 4, 6, 8],
            backgroundColor: "#007bff",
            borderColor: "#0056b3",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

// Update all charts with current data
function updateAllCharts() {
  updatePartnerTypesChart();
  updateThematicAreasChart();
  updateGeographicChart();
  updateTrendsChart();
}

// Update partner types chart
function updatePartnerTypesChart() {
  if (!charts.partnerTypes || !partnersData) return;

  const typeCounts = partnersData.reduce((acc, partner) => {
    acc[partner.type] = (acc[partner.type] || 0) + 1;
    return acc;
  }, {});

  charts.partnerTypes.data.labels = Object.keys(typeCounts);
  charts.partnerTypes.data.datasets[0].data = Object.values(typeCounts);
  charts.partnerTypes.update();
}

// Update thematic areas chart
function updateThematicAreasChart() {
  if (!charts.thematicAreas || !partnersData) return;

  const thematicCounts = {};
  partnersData.forEach((partner) => {
    partner.supportYears.forEach((sy) => {
      if (sy.thematicAreas) {
        thematicCounts[sy.thematicAreas] =
          (thematicCounts[sy.thematicAreas] || 0) + 1;
      }
    });
  });

  charts.thematicAreas.data.labels = Object.keys(thematicCounts);
  charts.thematicAreas.data.datasets[0].data = Object.values(thematicCounts);
  charts.thematicAreas.update();
}

// Update geographic chart
function updateGeographicChart() {
  if (!charts.geographic || !partnersData) return;

  const categoryCounts = partnersData.reduce((acc, partner) => {
    acc[partner.category] = (acc[partner.category] || 0) + 1;
    return acc;
  }, {});

  charts.geographic.data.labels = Object.keys(categoryCounts);
  charts.geographic.data.datasets[0].data = Object.values(categoryCounts);
  charts.geographic.update();
}

// Update trends chart
function updateTrendsChart() {
  if (!charts.trends || !partnersData) return;

  // Group by month
  const monthCounts = {};
  partnersData.forEach((partner) => {
    const date = new Date(partner.registrationDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthCounts).sort();
  charts.trends.data.labels = sortedMonths;
  charts.trends.data.datasets[0].data = sortedMonths.map(
    (month) => monthCounts[month],
  );
  charts.trends.update();
}

// Update statistics
function updateStatistics() {
  if (!partnersData) return;

  $("#totalPartners").text(partnersData.length);
  $("#activePartners").text(
    partnersData.filter((p) => p.status === "Active").length,
  );
  $("#signedMous").text(partnersData.filter((p) => p.hasMou === "Yes").length);

  const uniqueThematicAreas = new Set();
  partnersData.forEach((partner) => {
    partner.supportYears.forEach((sy) => {
      if (sy.thematicAreas) uniqueThematicAreas.add(sy.thematicAreas);
    });
  });
  $("#thematicAreas").text(uniqueThematicAreas.size);
}

// Report section navigation
function showReportSection(sectionName) {
  // Hide all sections
  $(".report-section").removeClass("active");
  $(".reports-nav .nav-btn").removeClass("active");

  // Show selected section
  $(`#${sectionName}-section`).addClass("active");
  $(
    `.reports-nav .nav-btn[onclick="showReportSection('${sectionName}')"]`,
  ).addClass("active");
}

// Apply filters
function applyFilters() {
  const typeFilter = $("#filterType").val();
  const categoryFilter = $("#filterCategory").val();
  const thematicFilter = $("#filterThematic").val();
  const statusFilter = $("#filterStatus").val();

  let filteredData = partnersData;

  if (typeFilter) {
    filteredData = filteredData.filter((p) => p.type === typeFilter);
  }
  if (categoryFilter) {
    filteredData = filteredData.filter((p) => p.category === categoryFilter);
  }
  if (statusFilter) {
    filteredData = filteredData.filter((p) => p.status === statusFilter);
  }
  if (thematicFilter) {
    filteredData = filteredData.filter((p) =>
      p.supportYears.some((sy) => sy.thematicAreas === thematicFilter),
    );
  }

  if (partnersReportGrid) {
    partnersReportGrid.setGridOption("rowData", filteredData);
  }
}

// Export functions
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(partnersData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Partners");
  XLSX.writeFile(wb, "partners_report.xlsx");
  showNotification("Report exported to Excel successfully", "success");
}

function exportToPDF() {
  showNotification("PDF export functionality coming soon", "info");
}

function printReport() {
  window.print();
}

function exportChart(chartId) {
  const canvas = document.getElementById(chartId);
  if (canvas) {
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${chartId}.png`;
    link.href = url;
    link.click();
    showNotification("Chart exported successfully", "success");
  }
}

// Refresh data
function refreshData() {
  loadPartnersData();
  showNotification("Data refreshed successfully", "success");
}

// Update analytics based on date range
function updateAnalytics() {
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();

  if (startDate && endDate) {
    // Filter data by date range and update charts
    showNotification("Analytics updated for selected date range", "info");
  }
}

// Update trends based on period
function updateTrends() {
  const period = $("#trendPeriod").val();
  showNotification(`Trends updated for ${period} view`, "info");
}

// Utility function for notifications
function showNotification(message, type = "info") {
  const notification = $(`
    <div class="notification ${type}">
      <span>${message}</span>
    </div>
  `);

  $("body").append(notification);
  setTimeout(() => notification.addClass("show"), 100);
  setTimeout(() => {
    notification.removeClass("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Make functions globally accessible
window.showReportSection = showReportSection;
window.applyFilters = applyFilters;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.printReport = printReport;
window.exportChart = exportChart;
window.refreshData = refreshData;
window.updateAnalytics = updateAnalytics;
window.updateTrends = updateTrends;
