let dropdownData = {};

// Uganda districts and their subcounties data
const ugandaDistrictsSubcounties = {
  Kampala: [
    "Central Division",
    "Kawempe Division",
    "Makindye Division",
    "Nakawa Division",
    "Rubaga Division",
  ],
  Wakiso: [
    "Busukuma",
    "Kakiri",
    "Kasangati",
    "Katabi",
    "Kyadondo",
    "Kyengera",
    "Makongo",
    "Namayumba",
    "Nangabo",
    "Nsangi",
    "Ssisa",
  ],
  Mukono: [
    "Bamunanika",
    "Buikwe",
    "Goma",
    "Kasawo",
    "Kimenyedde",
    "Mukono",
    "Nagojje",
    "Nakisunga",
    "Ntenjeru",
    "Yiffer",
  ],
  Jinja: [
    "Budondo",
    "Bugembe",
    "Buwenge",
    "Jinja",
    "Kakira",
    "Mafubira",
    "Mpumudde",
  ],
  Mbale: [
    "Bufumbo",
    "Bungokho",
    "Butaleja",
    "Lwangoli",
    "Malaba",
    "Manafwa",
    "Mbale",
    "Nabumali",
    "Namanyonyi",
    "Namisindwa",
    "Wanale",
  ],
  Gulu: [
    "Aswa",
    "Awach",
    "Bardege",
    "Bungatira",
    "Gulu",
    "Koro",
    "Lalogi",
    "Layibi",
    "Lukole",
    "Ongako",
    "Palaro",
    "Patiko",
    "Pece",
    "Unyama",
  ],
  Lira: [
    "Adekokwok",
    "Agweng",
    "Aloi",
    "Amach",
    "Amolator",
    "Aromo",
    "Barr",
    "Dokolo",
    "Kwania",
    "Lira",
    "Otuke",
  ],
  Mbarara: [
    "Biharwe",
    "Bubaare",
    "Bukanga",
    "Bunyaruguru",
    "Gwakisa",
    "Ibanda",
    "Isingiro",
    "Kashaari",
    "Kashari",
    "Kenshunga",
    "Kikagate",
    "Kinoni",
    "Masha",
    "Mbarara",
    "Nyabushozi",
    "Rubaya",
    "Rubindi",
    "Rukiri",
    "Rwampara",
    "Rwanyamahembe",
  ],
  Kasese: [
    "Buhuhira",
    "Bukonzo East",
    "Bukonzo West",
    "Bulembia",
    "Bwesumbu",
    "Hima",
    "Ibanda",
    "Kabatoro",
    "Kahokya",
    "Kasese",
    "Katebwa",
    "Karusandara",
    "Kisinga",
    "Kitswamba",
    "Kyarumba",
    "Kyondo",
    "Mahango",
    "Maliba",
    "Munkunyu",
    "Nyakatonzi",
    "Rukoki",
  ],
  "Fort Portal": [
    "Bundibugyo",
    "Fort Portal",
    "Hakibale",
    "Kabwoya",
    "Kabarole",
    "Rwebisengo",
  ],
  Hoima: [
    "Buhaguzi",
    "Bugambe",
    "Bulima",
    "Busiisi",
    "Hoima",
    "Kabwoya",
    "Kigorobya",
    "Kyabigambire",
    "Kyangwali",
  ],
  Masaka: [
    "Bukomansimbi",
    "Buwunga",
    "Kabonera",
    "Kalungu",
    "Kyanamukaka",
    "Kyesiiga",
    "Lwengo",
    "Masaka",
    "Mukungwe",
    "Villa Maria",
  ],
  Soroti: [
    "Arapai",
    "Gweri",
    "Katakwi",
    "Kyere",
    "Pingire",
    "Serere",
    "Soroti",
    "Tubur",
  ],
  Arua: [
    "Arua",
    "Ayivu",
    "Logiri",
    "Maracha",
    "Omugo",
    "Rigbo",
    "Terego",
    "Vura",
  ],
  Kabale: [
    "Bukinda",
    "Bunyangabu",
    "Hamurwa",
    "Kaharo",
    "Kamuganguzi",
    "Kamwezi",
    "Katuna",
    "Kitumba",
    "Maziba",
    "Ndorwa East",
    "Ndorwa West",
  ],
  Moroto: [
    "Katikekile",
    "Kotido",
    "Moroto",
    "Nadunget",
    "Nakapiripirit",
    "Rupa",
    "Tapac",
  ],
  Kitgum: [
    "Akwang",
    "Kitgum",
    "Lagoro",
    "Lamwo",
    "Mucwini",
    "Namokora",
    "Palabek Gem",
  ],
  Pader: ["Aromo", "Atanga", "Kilak", "Pader", "Pajule", "Purongo"],
  Adjumani: ["Adjumani", "Dzaipi", "Elegu", "Itirikwa", "Ofua", "Pakele"],
  Moyo: ["Aliba", "Dufile", "Gimara", "Itula", "Lefori", "Moyo", "Obongi"],
  Apac: [
    "Akokoro",
    "Apac",
    "Chegere",
    "Ibuje",
    "Inomo",
    "Kole",
    "Maruzi",
    "Oyam",
  ],
  Tororo: [
    "Mulanda",
    "Nagongera",
    "Paya",
    "Rubongi",
    "Tororo",
    "West Budama North",
    "West Budama South",
  ],
  Busia: ["Busia", "Buteba", "Dabani", "Lumino", "Masafu", "Mundika", "Sikuda"],
  Iganga: [
    "Bulamogi",
    "Buyende",
    "Iganga",
    "Kigulu",
    "Makuutu",
    "Namayingo",
    "Namungalwe",
  ],
  Kamuli: [
    "Balawoli",
    "Bugulumbya",
    "Butansi",
    "Gadumire",
    "Kamuli",
    "Namasagali",
  ],
  Pallisa: [
    "Budaka",
    "Butebo",
    "Gogonyo",
    "Kamuge",
    "Kasilo",
    "Kibale",
    "Pallisa",
    "Petete",
  ],
  Kumi: ["Ongino", "Atutur", "Kachumbala", "Kumi", "Ngora", "Serere"],
  Kapchorwa: ["Chepsukunya", "Kapchorwa", "Kaptum", "Tegeres"],
  Kotido: ["Kotido", "Nakapelimoru", "Rengen"],
  Bundibugyo: ["Bundibugyo", "Bubandi", "Busaru", "Harugongo", "Ntoroko"],
  Kisoro: [
    "Bufumbira",
    "Busanza",
    "Chahi",
    "Kirundo",
    "Kisoro",
    "Murora",
    "Nyakabande",
    "Nyarubuye",
  ],
};

$(document).ready(async () => {
  try {
    // Fetch thematic areas + partner categories
    const [thematicAreasRes, partnerCategoriesRes] = await Promise.all([
      fetch("/api/v1/thematic-areas"),
      fetch("/api/v1/partner-categories"),
    ]);

    // Parse JSON responses
    const [thematicAreasJson, partnerCategoriesJson] = await Promise.all([
      thematicAreasRes.json(),
      partnerCategoriesRes.json(),
    ]);

    // Transform data
    dropdownData = {
      thematicAreas: thematicAreasJson.map((v) => ({ ...v, name: v.area })),
      partnerCategories: partnerCategoriesJson.reduce((acc, curr) => {
        if (!acc[curr.type]) {
          acc[curr.type] = [];
        }
        acc[curr.type].push(curr.value);
        return acc;
      }, {}),
    };

    // Populate thematic areas as checkboxes
    populateThematicAreasCheckboxes();

    // Populate districts dropdown
    populateDistrictsDropdown();
  } catch (e) {
    console.error("Error loading dropdown data:", e);
  }
});

function populateThematicAreasCheckboxes() {
  const container = document.getElementById("supportThematic");
  if (!container) return;

  // Clear existing content and convert to checkbox container
  container.innerHTML = "";
  container.style.display = "block";
  container.style.maxHeight = "200px";
  container.style.overflowY = "auto";
  container.style.border = "1px solid #ced4da";
  container.style.borderRadius = "4px";
  container.style.padding = "10px";
  container.style.backgroundColor = "#f8f9fa";

  dropdownData.thematicAreas.forEach((area, index) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox-item";
    checkboxDiv.style.marginBottom = "8px";
    checkboxDiv.style.display = "flex";
    checkboxDiv.style.alignItems = "center";
    checkboxDiv.style.gap = "8px";

    checkboxDiv.innerHTML = `
      <input type="checkbox" id="thematic_${index}" name="thematicAreas" value="${area.name}" 
             style="width: 16px; height: 16px; accent-color: #007bff;">
      <label for="thematic_${index}" style="margin: 0; cursor: pointer; font-size: 14px;">${area.name}</label>
    `;
    container.appendChild(checkboxDiv);
  });
}

function populateDistrictsDropdown() {
  const container = document.getElementById("supportDistricts");
  if (!container) return;

  // Clear existing content
  container.innerHTML = "";
  container.style.display = "block";
  container.style.maxHeight = "200px";
  container.style.overflowY = "auto";
  container.style.border = "1px solid #ced4da";
  container.style.borderRadius = "4px";
  container.style.padding = "10px";
  container.style.backgroundColor = "#f8f9fa";

  // Add Uganda districts as checkboxes
  Object.keys(ugandaDistrictsSubcounties).forEach((district, index) => {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox-item";
    checkboxDiv.style.marginBottom = "8px";
    checkboxDiv.style.display = "flex";
    checkboxDiv.style.alignItems = "center";
    checkboxDiv.style.gap = "8px";

    checkboxDiv.innerHTML = `
      <input type="checkbox" id="district_${index}" name="districts" value="${district}" 
             style="width: 16px; height: 16px; accent-color: #007bff;" onchange="handleModalDistrictChange()">
      <label for="district_${index}" style="margin: 0; cursor: pointer; font-size: 14px;">${district}</label>
    `;
    container.appendChild(checkboxDiv);
  });
}

function handleModalDistrictChange() {
  const subcountiesContainer = document.getElementById("modalSubcounties");
  const subcountiesCheckboxes = document.getElementById(
    "subcountiesCheckboxes",
  );
  if (!subcountiesContainer || !subcountiesCheckboxes) return;

  // Find all checked district checkboxes
  const selectedDistricts = Array.from(
    document.querySelectorAll(
      '#supportDistricts input[name="districts"]:checked',
    ),
  ).map((cb) => cb.value);

  // Clear old subcounties
  subcountiesCheckboxes.innerHTML = "";

  if (selectedDistricts.length > 0) {
    subcountiesContainer.style.display = "block";

    // Add subcounties for each selected district
    selectedDistricts.forEach((district) => {
      if (ugandaDistrictsSubcounties[district]) {
        const groupLabel = document.createElement("div");
        groupLabel.innerHTML = `<strong>${district}</strong>`;
        subcountiesCheckboxes.appendChild(groupLabel);

        ugandaDistrictsSubcounties[district].forEach((subcounty, index) => {
          const checkboxDiv = document.createElement("div");
          checkboxDiv.className = "checkbox-item";
          checkboxDiv.innerHTML = `
            <input type="checkbox" id="${district}_subcounty_${index}" 
                   name="subcounties" value="${subcounty}">
            <label for="${district}_subcounty_${index}">${subcounty}</label>
          `;
          subcountiesCheckboxes.appendChild(checkboxDiv);
        });
      }
    });
  } else {
    subcountiesContainer.style.display = "none";
  }
}

// Password validation functions
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function showPasswordStrength(password, strengthElementId) {
  const strengthElement = document.getElementById(strengthElementId);
  if (!strengthElement) return;

  const validation = validatePassword(password);
  let strength = "Weak";
  let color = "#dc3545";

  if (validation.isValid) {
    strength = "Strong";
    color = "#28a745";
  } else if (password.length >= 6 && validation.errors.length <= 2) {
    strength = "Medium";
    color = "#ffc107";
  }

  strengthElement.innerHTML = `<span style="color: ${color}; font-weight: bold;">${strength}</span>`;

  if (validation.errors.length > 0) {
    const errorList = validation.errors
      .map((err) => `<li>${err}</li>`)
      .join("");
    strengthElement.innerHTML += `<ul style="margin: 5px 0; padding-left: 20px; color: #dc3545; font-size: 12px;">${errorList}</ul>`;
  }
}

let currentStep = 1;
let addressCount = 1;
let contactCount = 1;
let supportYearCount = 1;
let lastSupportYearData = null;
let editingRowIndex = null;

let supportYearsGrid = null;
const supportYearsData = [];

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");

  // Handle changes from any partnerType radio
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches('input[name="partnerType"]')) {
      updateCategoryOptions(e.target.value, categorySelect);
      categorySelect.disabled = false;
    }
  });

  // Initialize if one is pre-checked
  const checked = document.querySelector('input[name="partnerType"]:checked');
  if (checked) {
    updateCategoryOptions(checked.value, categorySelect);
    categorySelect.disabled = false;
  } else {
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categorySelect.disabled = true;
  }

  initializeSupportYearsGrid();

  // Add event listeners for subcounty changes
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches('input[name="subcounties"]')) {
      handleSubcountyChange();
    }
  });
});

function updateCategoryOptions(partnerType, categorySelect) {
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  if (partnerType && dropdownData.partnerCategories[partnerType]) {
    dropdownData.partnerCategories[partnerType].forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  categorySelect.value = "";
}

function initializeSupportYearsGrid() {
  if (supportYearsGrid) {
    console.log("[v0] Support years grid already initialized");
    return;
  }

  const gridOptions = {
    columnDefs: [
      { field: "year", headerName: "Year", width: 80, flex: 1, sortable: true },
      {
        field: "quarter",
        headerName: "Quarter",
        width: 100,
        flex: 1,
        sortable: true,
      },
      {
        field: "level",
        headerName: "Level",
        width: 100,
        flex: 1,
        sortable: true,
      },
      {
        field: "thematicAreas",
        headerName: "Thematic Areas",
        width: 200,
        flex: 1,
        valueFormatter: (params) => {
          if (Array.isArray(params.value)) {
            return params.value.join(", ");
          }
          return params.value || "";
        },
      },
      {
        field: "district",
        headerName: "District",
        width: 120,
        flex: 1,
        sortable: true,
      },
      {
        field: "subcounties",
        headerName: "Subcounties",
        width: 200,
        flex: 1,
        valueFormatter: (params) => {
          if (Array.isArray(params.value)) {
            return params.value.join(", ");
          }
          return params.value || "";
        },
      },
      {
        headerName: "Actions",
        width: 120,
        flex: 1.5,
        cellRenderer: (params) => {
          return `
            <button class="grid-btn edit-btn" onclick="editSupportYear(${params.node.rowIndex})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="grid-btn delete-btn" onclick="deleteSupportYear(${params.node.rowIndex})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          `;
        },
      },
    ],
    rowData: supportYearsData,
    defaultColDef: {
      resizable: true,
      sortable: false,
      filter: false,
    },
    rowHeight: 40,
    headerHeight: 35,
    suppressRowClickSelection: true,
    suppressCellSelection: true,
  };

  const gridDiv = document.querySelector("#supportYearsGrid");
  if (gridDiv && window.agGrid) {
    try {
      supportYearsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
      console.log("[v0] Support years grid initialized successfully");
    } catch (error) {
      console.error("[v0] Failed to initialize support years grid:", error);
      supportYearsGrid = null;
    }
  } else {
    console.warn("[v0] Grid container or agGrid library not available");
    setTimeout(() => {
      if (
        document.querySelector("#supportYearsGrid") &&
        window.agGrid &&
        !supportYearsGrid
      ) {
        initializeSupportYearsGrid();
      }
    }, 1000);
  }
}

function openAddSupportYearModal() {
  document.getElementById("addSupportYearModal").classList.add("show");

  if (lastSupportYearData && supportYearsData.length > 0) {
    document.getElementById("supportYear").value = lastSupportYearData.year + 1;
    document.getElementById("quarter").value = lastSupportYearData.quarter;
    document.getElementById("supportLevel").value = lastSupportYearData.level;

    // Pre-select thematic areas
    if (lastSupportYearData.thematicAreas) {
      const thematicCheckboxes = document.querySelectorAll(
        'input[name="thematicAreas"]',
      );
      thematicCheckboxes.forEach((cb) => {
        cb.checked = lastSupportYearData.thematicAreas.includes(cb.value);
      });
    }

    handleModalLevelChange();

    if (lastSupportYearData.level !== "National") {
      const districtSelect = document.getElementById("supportDistricts");
      setTimeout(() => {
        districtSelect.value = lastSupportYearData.district || "";
        handleModalDistrictChange();

        setTimeout(() => {
          // Pre-select subcounties
          if (lastSupportYearData.subcounties) {
            lastSupportYearData.subcounties.forEach((subcounty) => {
              const checkbox = document.querySelector(
                `input[name="subcounties"][value="${subcounty}"]`,
              );
              if (checkbox) checkbox.checked = true;
            });
            handleSubcountyChange();
          }
        }, 100);
      }, 100);
    }
  } else {
    resetSupportYearForm();
  }
}

function closeAddSupportYearModal() {
  document.getElementById("addSupportYearModal").classList.remove("show");
  document.querySelector("#addSupportYearModal .modal-header h3").textContent =
    "Add Support Year";
  document.querySelector(
    "#addSupportYearModal .modal-footer button:last-child",
  ).textContent = "Add Support Year";
  editingRowIndex = null;
  resetSupportYearForm();
}

function resetSupportYearForm() {
  document.getElementById("supportYearForm").reset();

  // Clear thematic area checkboxes
  document
    .querySelectorAll('input[name="thematicAreas"]')
    .forEach((cb) => (cb.checked = false));

  // Clear subcounties
  document.getElementById("modalSubcounties").style.display = "none";
  document.getElementById("subcountiesCheckboxes").innerHTML = "";

  document.getElementById("modalDistrictCoverage").style.display = "none";
}

function handleModalLevelChange() {
  const levelSelect = document.getElementById("supportLevel");
  const districtsContainer = document.getElementById("supportDistricts");
  const helpText = document.querySelector(
    "#addSupportYearModal .district-help-text",
  );
  const subcountiesContainer = document.getElementById("modalSubcounties");

  if (levelSelect.value === "National") {
    // Hide districts + subcounties when national
    districtsContainer.style.display = "none";
    if (subcountiesContainer) subcountiesContainer.style.display = "none";
    helpText.textContent = "Districts not required for National level support";
  } else if (levelSelect.value === "District") {
    // Show districts
    districtsContainer.style.display = "block";
    helpText.textContent = "Select districts to choose subcounties";
  } else {
    // Reset
    districtsContainer.style.display = "none";
    if (subcountiesContainer) subcountiesContainer.style.display = "none";
    helpText.textContent = "Select level of support first";
  }
}

function saveSupportYear() {
  const year = document.getElementById("supportYear").value;
  const quarter = document.getElementById("quarter").value;
  const level = document.getElementById("supportLevel").value;

  if (!year || !quarter || !level) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  // Thematic areas check
  const selectedThematicAreas = Array.from(
    document.querySelectorAll('input[name="thematicAreas"]:checked'),
  ).map((cb) => cb.value);
  if (selectedThematicAreas.length === 0) {
    showNotification("Please select at least one thematic area", "error");
    return;
  }

  let selectedDistricts = [];
  let selectedSubcounties = [];

  if (level === "National") {
    selectedDistricts = ["National"];
    selectedSubcounties = ["National"];
  } else {
    // ✅ Collect all checked district checkboxes
    selectedDistricts = Array.from(
      document.querySelectorAll(
        '#supportDistricts input[name="districts"]:checked',
      ),
    ).map((cb) => cb.value);

    if (selectedDistricts.length === 0) {
      showNotification("Please select at least one district", "error");
      return;
    }

    // ✅ Collect subcounties
    selectedSubcounties = Array.from(
      document.querySelectorAll('input[name="subcounties"]:checked'),
    ).map((cb) => cb.value);

    if (selectedSubcounties.length === 0) {
      showNotification("Please select at least one subcounty", "error");
      return;
    }
  }

  const supportYearData = {
    year: Number.parseInt(year),
    quarter,
    level,
    thematicAreas: selectedThematicAreas,
    district: selectedDistricts.join(", "), // allow multiple
    subcounties: selectedSubcounties,
  };

  console.log("[v0] Adding support year data:", supportYearData);

  lastSupportYearData = { ...supportYearData };

  if (typeof editingRowIndex !== "undefined" && editingRowIndex !== null) {
    supportYearsData[editingRowIndex] = supportYearData;
    editingRowIndex = null;
  } else {
    supportYearsData.push(supportYearData);
  }

  console.log("[v0] Current supportYearsData array:", supportYearsData);

  if (supportYearsGrid) {
    try {
      supportYearsGrid.setGridOption("rowData", supportYearsData);
      console.log("[v0] Grid updated successfully with new data");
    } catch (error) {
      console.error("[v0] Error updating grid:", error);
      if (supportYearsGrid.destroy) {
        supportYearsGrid.destroy();
      }
      supportYearsGrid = null;
      initializeSupportYearsGrid();
    }
  } else {
    console.warn(
      "[v0] Support years grid not initialized, initializing now...",
    );
    initializeSupportYearsGrid();
  }

  closeAddSupportYearModal();
  showNotification("Support year added successfully!", "success");
}

function editSupportYear(rowIndex) {
  const data = supportYearsData[rowIndex];
  if (!data) return;

  editingRowIndex = rowIndex;

  // Populate modal with existing data
  document.getElementById("supportYear").value = data.year;
  document.getElementById("quarter").value = data.quarter;
  document.getElementById("supportLevel").value = data.level;

  // Select thematic areas
  document.querySelectorAll('input[name="thematicAreas"]').forEach((cb) => {
    cb.checked = data.thematicAreas.includes(cb.value);
  });

  handleModalLevelChange();

  setTimeout(() => {
    if (data.level !== "National") {
      const districtSelect = document.getElementById("supportDistricts");
      districtSelect.value = data.district;
      handleModalDistrictChange();

      setTimeout(() => {
        // Select subcounties
        if (data.subcounties) {
          data.subcounties.forEach((subcounty) => {
            const checkbox = document.querySelector(
              `input[name="subcounties"][value="${subcounty}"]`,
            );
            if (checkbox) checkbox.checked = true;
          });
          handleSubcountyChange();
        }
      }, 100);
    }
  }, 100);

  document.querySelector("#addSupportYearModal .modal-header h3").textContent =
    "Edit Support Year";
  document.querySelector(
    "#addSupportYearModal .modal-footer button:last-child",
  ).textContent = "Update Support Year";

  document.getElementById("addSupportYearModal").classList.add("show");
}

function deleteSupportYear(index) {
  if (confirm("Are you sure you want to delete this support year?")) {
    supportYearsData.splice(index, 1);

    if (supportYearsGrid && supportYearsGrid.gridOptions) {
      try {
        if (supportYearsGrid.gridOptions.api) {
          supportYearsGrid.gridOptions.api.setRowData(supportYearsData);
          console.log("[v0] Grid updated after deletion");
        } else {
          supportYearsGrid.setGridOption("rowData", supportYearsData);
          console.log("[v0] Grid updated after deletion with setGridOption");
        }
      } catch (error) {
        console.error("[v0] Error updating grid after deletion:", error);
        if (supportYearsGrid.destroy) {
          supportYearsGrid.destroy();
        }
        supportYearsGrid = null;
        initializeSupportYearsGrid();
      }
    }

    showNotification("Support year deleted successfully!", "success");
  }
}

// Step navigation
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < 4) {
      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.remove("active");
      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.add("completed");
      document
        .querySelector(`.form-step[data-step="${currentStep}"]`)
        .classList.remove("active");

      currentStep++;

      document
        .querySelector(`[data-step="${currentStep}"]`)
        .classList.add("active");
      document
        .querySelector(`.form-step[data-step="${currentStep}"]`)
        .classList.add("active");

      updateNavigationButtons();
      scrollToTop();
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.remove("active");
    document
      .querySelector(`.form-step[data-step="${currentStep}"]`)
      .classList.remove("active");

    currentStep--;

    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.remove("completed");
    document
      .querySelector(`[data-step="${currentStep}"]`)
      .classList.add("active");
    document
      .querySelector(`.form-step[data-step="${currentStep}"]`)
      .classList.add("active");

    updateNavigationButtons();
    scrollToTop();
  }
}

function scrollToTop() {
  document.querySelector(".registration-container").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function updateNavigationButtons() {
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const submitBtn = document.querySelector(".submit-btn");

  prevBtn.style.display = currentStep > 1 ? "block" : "none";
  nextBtn.style.display = currentStep < 4 ? "block" : "none";
  submitBtn.style.display = currentStep === 4 ? "block" : "none";
}

function addAddress() {
  const container = document.getElementById("addressesContainer");
  const addressItem = document.createElement("div");
  addressItem.className = "address-item";
  addressItem.innerHTML = `
    <input type="text" name="addresses[${addressCount}]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    <button type="button" class="remove-btn" onclick="removeAddress(this)">×</button>
  `;
  container.appendChild(addressItem);
  addressCount++;
}

function removeAddress(button) {
  const addressItem = button.closest(".address-item");
  if (document.querySelectorAll(".address-item").length > 1) {
    addressItem.remove();
  } else {
    showNotification("At least one address is required", "error");
  }
}

function addContact() {
  const container = document.getElementById("contactsContainer");
  const contactItem = document.createElement("div");
  contactItem.className = "contact-item";
  contactItem.innerHTML = `
    <button type="button" class="remove-btn" onclick="removeContact(this)">×</button>
    <div class="form-row">
      <div class="form-group">
        <input type="text" name="contacts[${contactCount}][name]" placeholder="Contact Name *" required>
      </div>
      <div class="form-group">
        <input type="text" name="contacts[${contactCount}][position]" placeholder="Position *" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <input type="tel" name="contacts[${contactCount}][phone]" placeholder="Phone Number *" required>
      </div>
      <div class="form-group">
        <input type="email" name="contacts[${contactCount}][email]" placeholder="Email Address *" required>
      </div>
    </div>
  `;
  container.appendChild(contactItem);
  contactCount++;
}

function removeContact(button) {
  const contactItem = button.closest(".contact-item");
  if (document.querySelectorAll(".contact-item").length > 1) {
    contactItem.remove();
  } else {
    showNotification("At least one contact is required", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = [
    { box: "hasMouMoH", details: "mouDetailsMoH" },
    { box: "hasMouURSB", details: "mouDetailsURSB" },
    { box: "hasMouNGO", details: "mouDetailsNGO" },
  ];

  checkboxes.forEach(({ box, details }) => {
    const checkbox = document.getElementById(box);
    const section = document.getElementById(details);

    checkbox.addEventListener("change", () => {
      section.style.display = checkbox.checked ? "block" : "none";
    });
  });
});

function validateCurrentStep() {
  const currentStepElement = document.querySelector(
    `.form-step[data-step="${currentStep}"]`,
  );

  if (!currentStepElement) {
    console.error(`Step element not found for step ${currentStep}`);
    return false;
  }

  let isValid = true;
  let firstErrorField = null;

  if (currentStep === 1) {
    const requiredFields = currentStepElement.querySelectorAll(
      "input[required], select[required]",
    );

    const formGroups = currentStepElement.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      if (group && group.classList) {
        group.classList.remove("error", "success");
        const errorMsg = group.querySelector(".error-message");
        if (errorMsg && errorMsg.classList) {
          errorMsg.classList.remove("show");
        }
      }
    });

    requiredFields.forEach((field) => {
      if (!field) return;

      const formGroup = field.closest(".form-group");
      if (!formGroup) return;

      let fieldValid = true;
      let errorMessage = "";

      if (!field.value.trim()) {
        fieldValid = false;
        errorMessage = "This field is required";
      } else {
        if (field.type === "email" && !isValidEmail(field.value)) {
          fieldValid = false;
          errorMessage = "Please enter a valid email address";
        } else if (field.type === "tel" && !isValidPhone(field.value)) {
          fieldValid = false;
          errorMessage = "Please enter a valid phone number";
        }
      }

      if (!fieldValid) {
        formGroup.classList.add("error");
        showErrorMessage(formGroup, errorMessage);
        if (!firstErrorField) firstErrorField = field;
        isValid = false;
      } else {
        formGroup.classList.add("success");
      }
    });

    const addressItems = document.querySelectorAll(".address-item");
    let validAddresses = 0;
    addressItems.forEach((item) => {
      if (!item) return;
      const addressInput = item.querySelector('input[name*="addresses"]');
      if (addressInput && addressInput.value.trim()) {
        validAddresses++;
      }
    });

    if (validAddresses === 0) {
      showNotification("Please enter at least one address", "error");
      isValid = false;
    }
  } else if (currentStep === 2) {
    const contactItems = document.querySelectorAll(".contact-item");
    let validContacts = 0;
    contactItems.forEach((item) => {
      if (!item) return;

      const nameInput = item.querySelector('input[name*="[name]"]');
      const positionInput = item.querySelector('input[name*="[position]"]');
      const phoneInput = item.querySelector('input[name*="[phone]"]');
      const emailInput = item.querySelector('input[name*="[email]"]');

      if (
        nameInput &&
        nameInput.value.trim() &&
        positionInput &&
        positionInput.value.trim() &&
        phoneInput &&
        phoneInput.value.trim() &&
        emailInput &&
        emailInput.value.trim() &&
        isValidEmail(emailInput.value) &&
        isValidPhone(phoneInput.value)
      ) {
        validContacts++;
      }
    });

    if (validContacts === 0) {
      showNotification(
        "Please complete at least one contact with valid email and phone",
        "error",
      );
      isValid = false;
    }
  } else if (currentStep === 3) {
    const hasMouCheckbox = document.getElementById("hasMou");

    if (hasMouCheckbox && hasMouCheckbox.checked) {
      const requiredFields =
        currentStepElement.querySelectorAll("input[required]");

      const formGroups = currentStepElement.querySelectorAll(".form-group");
      formGroups.forEach((group) => {
        if (group && group.classList) {
          group.classList.remove("error", "success");
          const errorMsg = group.querySelector(".error-message");
          if (errorMsg && errorMsg.classList) {
            errorMsg.classList.remove("show");
          }
        }
      });

      requiredFields.forEach((field) => {
        if (!field) return;

        const formGroup = field.closest(".form-group");
        if (!formGroup) return;

        let fieldValid = true;
        let errorMessage = "";

        if (!field.value.trim()) {
          fieldValid = false;
          errorMessage = "This field is required";
        } else if (field.type === "date") {
          const date = new Date(field.value);
          if (isNaN(date.getTime())) {
            fieldValid = false;
            errorMessage = "Please enter a valid date";
          }
        }

        if (!fieldValid) {
          formGroup.classList.add("error");
          showErrorMessage(formGroup, errorMessage);
          if (!firstErrorField) firstErrorField = field;
          isValid = false;
        } else {
          formGroup.classList.add("success");
        }
      });

      const fileField = document.getElementById("mouFile");
      if (fileField) {
        const formGroup = fileField.closest(".form-group");
        const file = fileField.files[0];
        if (file) {
          const validType =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");
          if (!validType) {
            let errorMessage = "Only PDF files are allowed";
            formGroup.classList.add("error");
            showErrorMessage(formGroup, errorMessage);
            if (!firstErrorField) firstErrorField = fileField;
            isValid = false;
          } else {
            formGroup.classList.add("success");
          }
        }
      }
    }
  } else if (currentStep === 4) {
    if (supportYearsData.length === 0) {
      showNotification("Please add at least one support year", "error");
      isValid = false;
    }
  }

  if (!isValid && firstErrorField) {
    firstErrorField.focus();
    showNotification("Please correct the highlighted errors", "error");
  } else if (isValid) {
    showNotification("Step validated successfully!", "success");
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""));
}

function showErrorMessage(formGroup, message) {
  let errorMsg = formGroup.querySelector(".error-message");
  if (!errorMsg) {
    errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    formGroup.appendChild(errorMsg);
  }
  errorMsg.textContent = message;
  errorMsg.classList.add("show");
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === "success" ? "background: #28a745;" : ""}
    ${type === "error" ? "background: #dc3545;" : ""}
    ${type === "info" ? "background: #007bff;" : ""}
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showUserCreationModal(formData) {
  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "userCreationModal";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h3>Create User Accounts</h3>
        <button type="button" class="close" onclick="closeUserCreationModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p>Select contacts to create user accounts for:</p>
        <div id="contactUserList">
          ${formData.contacts
            .map(
              (contact, index) => `
            <div class="contact-user-item">
              <div class="contact-info">
                <strong>${contact.name}</strong> - ${contact.position}<br>
                <small>${contact.email} | ${contact.phone}</small>
              </div>
              <div class="user-creation-fields">
                <label>
                  <input type="checkbox" name="createUser[${index}]" value="true" onchange="toggleUserFields(${index})">
                  Create User Account
                </label>
                <div class="user-fields" id="userFields${index}" style="display: none;">
                  <div class="form-row">
                    <div class="form-group">
                      <input type="text" name="username[${index}]" value="${contact.email}" disabled="${true}" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                      <input type="password" name="password[${index}]" placeholder="Password" required 
                             oninput="showPasswordStrength(this.value, 'passwordStrength${index}')">
                    </div>
                  </div>
                  <div id="passwordStrength${index}" class="password-strength"></div>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeUserCreationModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="finalSubmitRegistration()">Submit Registration</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function toggleUserFields(selectedIndex) {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][name^="createUser"]',
  );
  const userFieldsAll = document.querySelectorAll(".user-fields");

  const selectedCheckbox = checkboxes[selectedIndex];

  if (selectedCheckbox.checked) {
    // Disable all other checkboxes and hide their fields
    checkboxes.forEach((cb, idx) => {
      if (idx !== selectedIndex) {
        cb.checked = false;
        cb.disabled = true;
        const uf = document.getElementById(`userFields${idx}`);
        if (uf) {
          uf.style.display = "none";
          uf.querySelectorAll("input, select").forEach((field) => {
            field.required = false;
            field.value = "";
          });
        }
      }
    });

    // Show and require fields for currently selected
    const currentUserFields = document.getElementById(
      `userFields${selectedIndex}`,
    );
    currentUserFields.style.display = "block";
    currentUserFields.querySelectorAll("input, select").forEach((field) => {
      field.required = true;
    });
  } else {
    // When unchecked, enable all checkboxes and hide fields
    checkboxes.forEach((cb, idx) => {
      cb.disabled = false;
      const uf = document.getElementById(`userFields${idx}`);
      if (uf) {
        uf.style.display = "none";
        uf.querySelectorAll("input, select").forEach((field) => {
          field.required = false;
          field.value = "";
        });
      }
    });
  }
}

function closeUserCreationModal() {
  const modal = document.getElementById("userCreationModal");
  if (modal) {
    modal.remove();
  }
}

function finalSubmitRegistration() {
  const modal = document.getElementById("userCreationModal");
  const userCreationData = [];
  let allPasswordsValid = true;

  // Collect and validate user creation data
  const checkboxes = modal.querySelectorAll(
    'input[name^="createUser"]:checked',
  );

  checkboxes.forEach((checkbox) => {
    const index = checkbox.name.match(/\[(\d+)\]/)[1];
    const usernameInput = modal.querySelector(
      `input[name="username[${index}]"]`,
    );
    const passwordInput = modal.querySelector(
      `input[name="password[${index}]"]`,
    );

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (username && password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        showNotification(
          `Invalid password for user ${username}: ${passwordValidation.errors.join(", ")}`,
          "error",
        );
        allPasswordsValid = false;
        passwordInput.focus();
        return;
      }

      userCreationData.push({
        contactIndex: index,
        username,
        password,
      });
    }
  });

  if (!allPasswordsValid) {
    return;
  }

  // Get the original form data
  const formData = collectFormData();
  formData.userAccounts = userCreationData;

  closeUserCreationModal();
  submitRegistration(formData);
}

async function submitRegistration(data) {
  showNotification("Submitting registration...", "info");

  const form = document.getElementById("registrationForm");

  try {
    const submitData = {
      basicInfo: {
        partnerName: data.basicInfo.partnerName || "",
        acronym: data.basicInfo.acronym || "",
        partnerType: data.basicInfo.partnerType || "",
        category: data.basicInfo.category || "",
        officialPhone: data.basicInfo.officialPhone || "",
        officialEmail: data.basicInfo.officialEmail || "",
      },
      addresses: data.addresses || [],
      contacts: (data.contacts || []).map((contact) => ({
        name: contact.name || "",
        position: contact.position || "",
        phone: contact.phone || "",
        email: contact.email || "",
      })),
      mou: {
        moh: {
          hasMou: data.moh?.hasMou || false,
          signedBy: data.moh?.signedBy || "",
          whoTitle: data.moh?.whoTitle || "",
          signedDate: data.moh?.signedDate || "",
          expiryDate: data.moh?.expiryDate || "",
        },
        ursb: {
          hasMou: data.ursb?.hasMou || false,
          signedDate: data.ursb?.signedDate || "",
          expiryDate: data.ursb?.expiryDate || "",
        },
        ngo: {
          hasMou: data.ngo?.hasMou || false,
          signedDate: data.ngo?.signedDate || "",
          expiryDate: data.ngo?.expiryDate || "",
        },
      },
      supportYears: (data.supportYears || []).map((supportYear) => ({
        year: Number.parseInt(supportYear.year) || 0,
        quarter: supportYear.quarter || "",
        level: supportYear.level || "",
        thematicAreas: supportYear.thematicAreas || [],
        districts:
          supportYear.level === "National"
            ? []
            : supportYear.district
                .split(",")
                .map((district) => district.trim())
                .map((district) => {
                  const subcounties =
                    ugandaDistrictsSubcounties[district] || [];
                  return { district, subcounties };
                }),
      })),
      userAccounts: data.userAccounts || [],
    };

    // Build multipart form
    const formData = new FormData();
    formData.append("data", JSON.stringify(submitData));

    // Attach files if present
    const mohFileInput = form.querySelector('input[name="mouFileMoH"]');
    if (mohFileInput?.files?.[0]) {
      formData.append("mouFileMoH", mohFileInput.files[0]);
    }

    const ursbFileInput = form.querySelector('input[name="mouFileURSB"]');
    if (ursbFileInput?.files?.[0]) {
      formData.append("mouFileURSB", ursbFileInput.files[0]);
    }

    const ngoFileInput = form.querySelector('input[name="mouFileNGO"]');
    if (ngoFileInput?.files?.[0]) {
      formData.append("mouFileNGO", ngoFileInput.files[0]);
    }

    // Submit to API
    const response = await fetch("/api/v1/partners", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || result.details || "Failed to submit registration",
      );
    }

    showNotification("Registration submitted successfully!", "success");

    setTimeout(() => {
      alert("Registration completed! Please check your email to confirm.");
      window.location.href = "/";
    }, 2000);
  } catch (error) {
    console.error("Registration submission error:", error);
    showNotification(
      `Failed to submit partner details: ${error.message}`,
      "error",
    );
  }
}

function collectFormData() {
  const form = document.getElementById("registrationForm");
  const formData = new FormData(form);

  const data = {
    basicInfo: {
      partnerName: formData.get("partnerName"),
      acronym: formData.get("acronym"),
      partnerType: formData.get("partnerType"),
      category: formData.get("category"),
      officialPhone: formData.get("officialPhone"),
      officialEmail: formData.get("officialEmail"),
    },
    addresses: [],
    contacts: [],
    moh: {
      hasMou: formData.get("hasMouMoH") === "on",
      signedBy: formData.get("signedByMoH"),
      whoTitle: formData.get("whoTitleMoH"),
      signedDate: formData.get("signedDateMoH"),
      expiryDate: formData.get("expiryDateMoH"),
      file: formData.get("mouFileMoH"),
    },
    ursb: {
      hasMou: formData.get("hasMouURSB") === "on",
      signedDate: formData.get("signedDateURSB"),
      expiryDate: formData.get("expiryDateURSB"),
      file: formData.get("mouFileURSB"),
    },
    ngo: {
      hasMou: formData.get("hasMouNGO") === "on",
      signedDate: formData.get("signedDateNGO"),
      expiryDate: formData.get("expiryDateNGO"),
      file: formData.get("mouFileNGO"),
    },
    supportYears: supportYearsData,
  };

  // Collect addresses
  const addressInputs = form.querySelectorAll('input[name*="addresses"]');
  addressInputs.forEach((input) => {
    if (input.value.trim()) {
      data.addresses.push(input.value.trim());
    }
  });

  // Collect contacts
  const contactInputs = form.querySelectorAll('input[name*="contacts"]');
  const contactGroups = {};
  contactInputs.forEach((input) => {
    const match = input.name.match(/contacts\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];
      if (!contactGroups[index]) contactGroups[index] = {};
      contactGroups[index][field] = input.value;
    }
  });
  data.contacts = Object.values(contactGroups).filter(
    (contact) =>
      contact.name && contact.position && contact.phone && contact.email,
  );

  return data;
}

document.getElementById("registrationForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (currentStep !== 4) {
    showNotification("Please complete all steps before submitting", "error");
    return;
  }

  if (validateCurrentStep()) {
    const formData = collectFormData();
    showUserCreationModal(formData);
  }
});

function resetForm() {
  document.getElementById("registrationForm").reset();
  currentStep = 1;
  addressCount = 1;
  contactCount = 1;
  supportYearCount = 1;
  lastSupportYearData = null;
  editingRowIndex = null;
  supportYearsData.length = 0;

  // Reset stepper
  document.querySelectorAll(".step").forEach((step) => {
    step.classList.remove("active", "completed");
  });
  document.querySelector('[data-step="1"]').classList.add("active");

  // Reset form steps
  document.querySelectorAll(".form-step").forEach((step) => {
    step.classList.remove("active");
  });
  document.querySelector('.form-step[data-step="1"]').classList.add("active");

  // Reset containers
  const addressContainer = document.getElementById("addressesContainer");
  addressContainer.innerHTML = `
    <div class="address-item">
      <input type="text" name="addresses[0]" placeholder="Enter full address (e.g., 123 Main St, Kampala, Uganda)" required>
    </div>
  `;

  const contactContainer = document.getElementById("contactsContainer");
  contactContainer.innerHTML = `
    <div class="contact-item">
      <div class="form-row">
        <div class="form-group">
          <input type="text" name="contacts[0][name]" placeholder="Contact Name *" required>
        </div>
        <div class="form-group">
          <input type="text" name="contacts[0][position]" placeholder="Position *" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <input type="tel" name="contacts[0][phone]" placeholder="Phone Number *" required>
        </div>
        <div class="form-group">
          <input type="email" name="contacts[0][email]" placeholder="Email Address *" required>
        </div>
      </div>
    </div>
  `;

  updateNavigationButtons();

  // Reset grid
  if (supportYearsGrid) {
    supportYearsGrid.setGridOption("rowData", []);
  }
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .checkbox-item {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkbox-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #007bff;
  }

  .checkbox-item label {
    margin: 0;
    cursor: pointer;
    font-size: 14px;
  }

  .password-strength {
    margin-top: 8px;
    padding: 8px;
    border-radius: 4px;
    background-color: #f8f9fa;
    font-size: 12px;
  }
`;
document.head.appendChild(style);
