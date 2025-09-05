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

    // Properly map partner data
    partnersData = partners.map((partner) => ({
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
    }));

    updateReportsGrid();
    updateAllCharts();
    updateStatistics();

    // Update new analytics and trends charts
    updateAnalytics();
    updateTrends();
  } catch (error) {
    console.error("Error loading partners data:", error);
  }
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
            fill: false,
            tension: 0,
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
            data: [0, 0, 0], // initially zeros
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

  // Support Years Chart (Bar Chart)
  const supportYearsCtx = document.getElementById("supportYearsChart");
  if (supportYearsCtx) {
    charts.supportYears = new window.Chart(supportYearsCtx, {
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
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // District Coverage Heatmap approximation (Bar Chart)
  const districtHeatmapCtx = document.getElementById("districtHeatmapChart");
  if (districtHeatmapCtx) {
    charts.districtHeatmap = new window.Chart(districtHeatmapCtx, {
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
        scales: {
          y: { beginAtZero: true },
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
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // Thematic Focus Shifts (Line Chart)
  const thematicTrendsCtx = document.getElementById("thematicTrendsChart");
  if (thematicTrendsCtx) {
    charts.thematicTrends = new window.Chart(thematicTrendsCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // Geographic Expansion (Bar Chart)
  const geographicTrendsCtx = document.getElementById("geographicTrendsChart");
  if (geographicTrendsCtx) {
    charts.geographicTrends = new window.Chart(geographicTrendsCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  // Partnership Duration (Line Chart)
  const durationTrendsCtx = document.getElementById("durationTrendsChart");
  if (durationTrendsCtx) {
    charts.durationTrends = new window.Chart(durationTrendsCtx, {
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
        scales: {
          y: { beginAtZero: true, suggestedMax: 10 },
        },
      },
    });
  }
}

// Update all overview charts with current data
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
    if (Array.isArray(partner.supportYears)) {
      partner.supportYears.forEach((sy) => {
        if (Array.isArray(sy.thematic_areas)) {
          sy.thematic_areas.forEach((area) => {
            thematicCounts[area] = (thematicCounts[area] || 0) + 1;
          });
        }
      });
    }
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

// Update registration trends chart (overview)
function updateTrendsChart() {
  if (!charts.trends || !partnersData) return;

  const monthCounts = {};
  partnersData.forEach((partner) => {
    const date = new Date(partner.registrationDate);
    if (!isNaN(date)) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthCounts).sort();
  charts.trends.data.labels = sortedMonths;
  charts.trends.data.datasets[0].data = sortedMonths.map(
    (month) => monthCounts[month],
  );
  charts.trends.update();
}

// Update statistics in overview
function updateStatistics() {
  if (!partnersData) return;

  $("#totalPartners").text(partnersData.length);
  $("#activePartners").text(
    partnersData.filter((p) => p.status === "Active").length,
  );
  $("#signedMous").text(partnersData.filter((p) => p.hasMou === "Yes").length);

  const uniqueThematicAreas = new Set();
  partnersData.forEach((partner) => {
    if (Array.isArray(partner.supportYears)) {
      partner.supportYears.forEach((sy) => {
        if (Array.isArray(sy.thematic_areas)) {
          sy.thematic_areas.forEach((area) => {
            uniqueThematicAreas.add(area);
          });
        }
      });
    }
  });
  $("#thematicAreas").text(uniqueThematicAreas.size);
}

// Export and filter functions stay unchanged
function showReportSection(sectionName) {
  $(".report-section").removeClass("active");
  $(".reports-nav .nav-btn").removeClass("active");

  $(`#${sectionName}-section`).addClass("active");
  $(
    `.reports-nav .nav-btn[onclick="showReportSection('${sectionName}')"]`,
  ).addClass("active");
}

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
      p.supportYears.some((sy) => sy.thematic_areas.includes(thematicFilter)),
    );
  }

  if (partnersReportGrid) {
    partnersReportGrid.setGridOption("rowData", filteredData);
  }
}

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

function refreshData() {
  loadPartnersData();
  showNotification("Data refreshed successfully", "success");
}

// ============ NEW: Analytics Tab Updates ============

// Update Partner Growth Over Time (cumulative by month)
function updateGrowthChart() {
  if (!charts.growth || !partnersData) return;

  const monthlyCounts = {};
  partnersData.forEach((partner) => {
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

// Update MoU Status Distribution chart dynamically
function updateMoUStatusChart() {
  if (!charts.mouStatus || !partnersData) return;

  const count = { Signed: 0, Pending: 0, Expired: 0 };
  partnersData.forEach((p) => {
    if (p.hasMou === "Yes") count.Signed++;
    else count.Pending++; // Simple fallback; expand if you have status info
  });

  charts.mouStatus.data.datasets[0].data = [
    count.Signed,
    count.Pending,
    count.Expired,
  ];
  charts.mouStatus.update();
}

// Update Support Years Chart
function updateSupportYearsChart() {
  if (!charts.supportYears || !partnersData) return;

  const counts = {};
  partnersData.forEach((partner) => {
    const yearsCount = Array.isArray(partner.supportYears)
      ? partner.supportYears.length
      : 0;
    counts[yearsCount] = (counts[yearsCount] || 0) + 1;
  });

  const sortedKeys = Object.keys(counts).sort((a, b) => a - b);

  charts.supportYears.data.labels = sortedKeys.map(
    (k) => `${k} year${k === "1" ? "" : "s"}`,
  );
  charts.supportYears.data.datasets[0].data = sortedKeys.map((k) => counts[k]);
  charts.supportYears.update();
}

// Update District Coverage Heatmap (Bar Chart approximation)
function updateDistrictHeatmapChart() {
  if (!charts.districtHeatmap || !partnersData) return;

  const districtCounts = {};
  partnersData.forEach((partner) => {
    const addresses = partner.addresses || [];
    addresses.forEach((addr) => {
      const district = addr.district || "Unknown";
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
  });

  const sortedDistricts = Object.keys(districtCounts).sort();
  charts.districtHeatmap.data.labels = sortedDistricts;
  charts.districtHeatmap.data.datasets[0].data = sortedDistricts.map(
    (d) => districtCounts[d],
  );
  charts.districtHeatmap.update();
}

// ============ NEW: Trends Tab Updates ============

// Update Thematic Focus Shifts Chart
function updateThematicTrendsChart() {
  if (!charts.thematicTrends || !partnersData) return;

  const thematicYearCounts = {};

  partnersData.forEach((partner) => {
    (partner.supportYears || []).forEach((sy) => {
      const year = sy.year || "Unknown";
      (sy.thematic_areas || []).forEach((area) => {
        if (!thematicYearCounts[area]) thematicYearCounts[area] = {};
        thematicYearCounts[area][year] =
          (thematicYearCounts[area][year] || 0) + 1;
      });
    });
  });

  const allYearsSet = new Set();
  Object.values(thematicYearCounts).forEach((yearsData) => {
    Object.keys(yearsData).forEach((y) => {
      if (y !== "Unknown") allYearsSet.add(y);
    });
  });
  const allYears = Array.from(allYearsSet).sort().slice(-5);

  const labels = allYears;
  const datasets = Object.entries(thematicYearCounts).map(
    ([area, yearsData], idx) => ({
      label: area,
      data: labels.map((year) => yearsData[year] || 0),
      borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.2)`,
      tension: 0.3,
      fill: true,
    }),
  );

  charts.thematicTrends.data.labels = labels;
  charts.thematicTrends.data.datasets = datasets;
  charts.thematicTrends.update();
}

// Update Geographic Expansion Chart
function updateGeographicTrendsChart() {
  if (!charts.geographicTrends || !partnersData) return;

  const categoryYearCounts = {};
  partnersData.forEach((p) => {
    const year = new Date(p.registrationDate).getFullYear();
    const cat = p.category || "Unknown";

    if (!categoryYearCounts[cat]) categoryYearCounts[cat] = {};
    categoryYearCounts[cat][year] = (categoryYearCounts[cat][year] || 0) + 1;
  });

  const yearsSet = new Set();
  Object.values(categoryYearCounts).forEach((yearData) =>
    Object.keys(yearData).forEach((y) => yearsSet.add(Number(y))),
  );
  const years = Array.from(yearsSet).sort();
  const recentYears = years.slice(-5);
  const labels = recentYears.map(String);

  const datasets = Object.entries(categoryYearCounts).map(
    ([cat, yearData], idx) => ({
      label: cat,
      data: labels.map((year) => yearData[year] || 0),
      backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
    }),
  );

  charts.geographicTrends.data.labels = labels;
  charts.geographicTrends.data.datasets = datasets;
  charts.geographicTrends.update();
}

// Update Partnership Duration Trends Chart
function updateDurationTrendsChart() {
  if (!charts.durationTrends || !partnersData) return;

  const durationSums = {};
  const counts = {};
  const currentYear = new Date().getFullYear();

  partnersData.forEach((p) => {
    const regDate = new Date(p.registrationDate);
    if (!isNaN(regDate)) {
      const year = regDate.getFullYear();
      const duration = currentYear - year;
      durationSums[year] = (durationSums[year] || 0) + duration;
      counts[year] = (counts[year] || 0) + 1;
    }
  });

  const years = Object.keys(durationSums).map(Number).sort();
  const avgDurations = years.map((y) =>
    counts[y] ? durationSums[y] / counts[y] : 0,
  );

  charts.durationTrends.data.labels = years.map(String);
  charts.durationTrends.data.datasets[0].data = avgDurations;
  charts.durationTrends.update();
}

// Update Analytics based on date range filter
function updateAnalytics() {
  const startDateVal = $("#startDate").val();
  const endDateVal = $("#endDate").val();

  let filteredData = partnersData;
  if (startDateVal && endDateVal) {
    const startDate = new Date(startDateVal);
    const endDate = new Date(endDateVal);
    filteredData = partnersData.filter((p) => {
      const d = new Date(p.registrationDate);
      return d >= startDate && d <= endDate;
    });
  }

  const originalData = partnersData;
  partnersData = filteredData;

  updateGrowthChart();
  updateMoUStatusChart();
  updateSupportYearsChart();
  updateDistrictHeatmapChart();

  partnersData = originalData;

  showNotification("Analytics updated for selected date range", "success");
}

// Update Trends based on selected period (simplified - monthly only here)
function updateTrends() {
  const period = $("#trendPeriod").val();

  // TODO: Implement aggregation by quarterly or yearly if needed

  updateTrendsChart();
  updateThematicTrendsChart();
  updateGeographicTrendsChart();
  updateDurationTrendsChart();

  showNotification(`Trends updated for ${period} view`, "success");
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
