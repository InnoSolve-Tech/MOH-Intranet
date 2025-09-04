// Partner Profile Management
let currentPartner = null;
let contactsGrid = null;
let supportYearsGrid = null;
let documentsGrid = null;
let dropdownData = {};

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
// Declare the $ variable
const $ = window.jQuery;
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function loadInitialData() {
  try {
    // Load dropdown data
    const [thematicAreasRes, partnerCategoriesRes, supportDocumentsRes] =
      await Promise.all([
        fetch("/api/v1/thematic-areas"),
        fetch("/api/v1/partner-categories"),
        fetch("/api/v1/partners/support-documents"),
      ]);

    const [thematicAreasJson, partnerCategoriesJson, supportDocumentsJson] =
      await Promise.all([
        thematicAreasRes.json(),
        partnerCategoriesRes.json(),
        supportDocumentsRes.json(),
      ]);

    dropdownData = {
      thematicAreas: thematicAreasJson.map((v) => ({
        ...v,
        name: v.area,
        ID: v.ID,
      })),
      partnerCategories: partnerCategoriesJson.map((v) => ({
        ...v,
        ID: v.ID,
      })),
      supportDocuments: supportDocumentsJson,
    };

    loadDocumentsData(dropdownData.supportDocuments.documents);

    populateSupportYearThematicAreas();
  } catch (error) {
    console.error("Error loading initial data:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize grids first
  initializeGrids();

  // Load Partner Profile
  const partner_uuid = getCookie("user_uuid");
  if (partner_uuid) {
    await loadPartnerProfile(partner_uuid);
    await loadInitialData();
  } else {
    showNotification("User UUID not found in cookies", "error");
  }
});

function populateSupportYearThematicAreas() {
  const container = document.getElementById("supportYearThematicCheckboxes");
  container.innerHTML = "";

  if (!dropdownData.thematicAreas) return;

  dropdownData.thematicAreas.forEach((area, index) => {
    const div = document.createElement("div");
    div.className = "checkbox-item";
    div.innerHTML = `
      <input type="checkbox" id="syThematic_${index}" name="syThematicAreas" value="${area.name}">
      <label for="syThematic_${index}">${area.name}</label>
    `;
    container.appendChild(div);
  });
}

function populateSupportYearDistricts() {
  const container = document.getElementById("supportYearDistrictsCheckboxes");
  container.innerHTML = "";

  Object.keys(ugandaDistrictsSubcounties).forEach((district, index) => {
    const div = document.createElement("div");
    div.className = "checkbox-item";
    div.innerHTML = `
      <input type="checkbox" id="syDistrict_${index}" name="syDistricts" value="${district}" onchange="handleSupportYearDistrictChange()">
      <label for="syDistrict_${index}">${district}</label>
    `;
    container.appendChild(div);
  });
}

function handleSupportYearDistrictChange() {
  const subcountyContainer = document.getElementById(
    "supportYearSubcountiesContainer",
  );
  const subcountiesCheckboxes = document.getElementById(
    "supportYearSubcountiesCheckboxes",
  );
  const selectedDistricts = Array.from(
    document.querySelectorAll(
      '#supportYearDistrictsCheckboxes input[name="syDistricts"]:checked',
    ),
  ).map((cb) => cb.value);

  subcountiesCheckboxes.innerHTML = "";

  if (selectedDistricts.length === 0) {
    subcountyContainer.style.display = "none";
    return;
  }

  subcountyContainer.style.display = "block";

  selectedDistricts.forEach((district) => {
    if (ugandaDistrictsSubcounties[district]) {
      const groupLabel = document.createElement("div");
      groupLabel.innerHTML = `<strong>${district}</strong>`;
      subcountiesCheckboxes.appendChild(groupLabel);

      ugandaDistrictsSubcounties[district].forEach((subcounty, index) => {
        const div = document.createElement("div");
        div.className = "checkbox-item";
        div.innerHTML = `
          <input type="checkbox" name="sySubcounties" value="${subcounty}" id="sySubcounty_${district}_${index}">
          <label for="sySubcounty_${district}_${index}">${subcounty}</label>
        `;
        subcountiesCheckboxes.appendChild(div);
      });
    }
  });
}

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

  // MoH MoU Information
  const mohMou = partner.support_documents?.find(
    (doc) => doc.document_type === "MoH MoU",
  );

  $("#overviewHasMou").text(partner.has_mou_moh ? "Yes" : "No");
  $("#overviewSignedBy").text(mohMou?.signed_by || "-");
  $("#overviewWhoTitle").text(mohMou?.who_title || "-");
  $("#overviewSignedDate").text(mohMou?.signed_date || "-");
  $("#overviewExpiryDate").text(mohMou?.expiry_date || "-");

  if (mohMou?.file_link) {
    $("#overviewMouFile").html(`
      <a href="${mohMou.file_link}" target="_blank" class="file-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          View MoH MoU Document
      </a>
    `);
  } else {
    $("#overviewMouFile").html("No MoH MoU document available");
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
      { headerName: "Size", field: "size", width: 100 },
      { headerName: "File Link", field: "file_link", width: 100, hide: true },
      {
        headerName: "Actions",
        field: "actions",
        width: 150,
        cellRenderer: (params) => `
                        <button class="btn-icon" onclick="downloadDocument('${params.data.file_link}')" title="Download">
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
  if (!documentsGrid || !Array.isArray(documents)) return;

  const normalized = documents.map((doc) => ({
    id: doc.ID,
    name: doc.document_type || "Unknown",
    type: doc.document_type || "-",
    uploadDate: new Date(doc.CreatedAt).toLocaleDateString(),
    size: "-", // optional, if you have file size info
    file_link: doc.file_link || "#",
  }));

  documentsGrid.setGridOption("rowData", normalized);
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

let editingContactIndex = null;

function addContact() {
  editingContactIndex = null;
  resetContactModalForm();
  document.getElementById("contactModalTitle").textContent = "Add Contact";
  document.getElementById("contactModal").classList.add("show");
}

function editContact(index) {
  editingContactIndex = index;
  const contact = currentPartner.partner_contacts[index];
  if (!contact) return;
  document.getElementById("contactModalTitle").textContent = "Edit Contact";

  document.getElementById("contactName").value = contact.names || "";
  document.getElementById("contactPosition").value = contact.title || "";
  document.getElementById("contactPhone").value = contact.phone_number || "";
  document.getElementById("contactEmail").value = contact.official_email || "";

  document.getElementById("contactModal").classList.add("show");
}

function resetContactModalForm() {
  const form = document.getElementById("contactForm");
  form.reset();
}

function closeContactModal() {
  document.getElementById("contactModal").classList.remove("show");
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""));
}

async function saveContact() {
  const name = document.getElementById("contactName").value.trim();
  const position = document.getElementById("contactPosition").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();

  if (!name || !position || !phone || !email) {
    showNotification("Please fill all contact fields", "error");
    return;
  }

  // Basic email and phone validation could be reused here
  if (!isValidEmail(email)) {
    showNotification("Invalid email address", "error");
    return;
  }
  if (!isValidPhone(phone)) {
    showNotification("Invalid phone number", "error");
    return;
  }

  const newContact = {
    id: 0,
    names: name,
    title: position,
    phone_number: phone,
    official_email: email,
  };

  if (editingContactIndex !== null) {
    newContact.id = currentPartner.partner_contacts[editingContactIndex].ID;
    let response = await fetch("/api/v1/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    let res = await response.json();
    currentPartner.partner_contacts[editingContactIndex] = res.contact;
  } else {
    await fetch("/api/v1/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    currentPartner.partner_contacts.push(newContact);
  }

  loadContactsData(currentPartner.partner_contacts);
  closeContactModal();
  showNotification("Contact saved successfully", "success");
}

function deleteSupportYear(index) {
  if (confirm("Are you sure you want to delete this support year?")) {
    currentPartner.partner_support_years.splice(index, 1);
    loadSupportYearsData(currentPartner.partner_support_years);
    showNotification("Support year deleted successfully", "success");
  }
}

function deleteContact(index) {
  if (confirm("Are you sure you want to delete this contact?")) {
    currentPartner.partner_contacts.splice(index, 1);
    loadContactsData(currentPartner.partner_contacts);
    showNotification("Contact deleted successfully", "success");
  }
}

let editingSupportYearIndex = null;

function addSupportYear() {
  editingSupportYearIndex = null;
  document.getElementById("supportYearModalTitle").textContent =
    "Add Support Year";
  resetSupportYearModalForm();
  populateSupportYearThematicAreas();
  populateSupportYearDistricts();

  document.getElementById("supportYearModal").classList.add("show");
}

function editSupportYear(index) {
  editingSupportYearIndex = index;
  const sy = currentPartner.partner_support_years[index];
  if (!sy) return;
  document.getElementById("supportYearModalTitle").textContent =
    "Edit Support Year";

  populateSupportYearThematicAreas();
  populateSupportYearDistricts();

  setTimeout(() => {
    document.getElementById("syYear").value = sy.year || "";
    document.getElementById("syLevel").value = sy.level || "";
    handleSupportYearDistrictChange();

    // Set thematic areas
    if (Array.isArray(sy.thematic_areas)) {
      sy.thematic_areas.forEach((area) => {
        const cb = document.querySelector(
          `#supportYearThematicCheckboxes input[value="${area}"]`,
        );
        if (cb) cb.checked = true;
      });
    }

    // Set districts and subcounties if not national
    if (sy.level !== "National" && Array.isArray(sy.districts)) {
      sy.districts.forEach((districtObj) => {
        const districtCb = document.querySelector(
          `#supportYearDistrictsCheckboxes input[value="${districtObj.district}"]`,
        );
        if (districtCb) districtCb.checked = true;
      });
      handleSupportYearDistrictChange();

      setTimeout(() => {
        sy.districts.forEach((districtObj) => {
          if (Array.isArray(districtObj.subcounties)) {
            districtObj.subcounties.forEach((subcounty) => {
              const subcountyCb = document.querySelector(
                `#supportYearSubcountiesCheckboxes input[value="${subcounty}"]`,
              );
              if (subcountyCb) subcountyCb.checked = true;
            });
          }
        });
      }, 100);
    }
  }, 100);

  document.getElementById("supportYearModal").classList.add("show");
}

function resetSupportYearModalForm() {
  const form = document.getElementById("supportYearForm");
  form.reset();
  document.getElementById("supportYearDistrictsContainer").style.display =
    "none";
  document.getElementById("supportYearSubcountiesContainer").style.display =
    "none";
}

function closeSupportYearModal() {
  document.getElementById("supportYearModal").classList.remove("show");
}

function saveSupportYear() {
  const year = Number(document.getElementById("syYear").value);
  const level = document.getElementById("syLevel").value;
  const thematicAreas = Array.from(
    document.querySelectorAll(
      '#supportYearThematicCheckboxes input[type="checkbox"]:checked',
    ),
  ).map((cb) => cb.value);

  if (!year || !level || thematicAreas.length === 0) {
    showNotification(
      "Please fill all required fields and select at least one thematic area",
      "error",
    );
    return;
  }

  let districts = [];
  if (level === "District") {
    districts = Array.from(
      document.querySelectorAll(
        '#supportYearDistrictsCheckboxes input[type="checkbox"]:checked',
      ),
    ).map((cb) => cb.value);
    if (districts.length === 0) {
      showNotification("Please select at least one district", "error");
      return;
    }
  }

  let districtsWithSubcounties = [];
  if (level === "District") {
    districtsWithSubcounties = districts.map((district) => {
      const subcounties = Array.from(
        document.querySelectorAll(
          '#supportYearSubcountiesCheckboxes input[type="checkbox"]:checked',
        ),
      )
        .filter((cb) => {
          // Only include subcounties that belong to this district
          // We assume checkbox id format sySubcounty_<district>_<index>
          return cb.id.startsWith(`sySubcounty_${district}_`);
        })
        .map((cb) => cb.value);

      if (subcounties.length === 0) {
        showNotification(
          `Please select at least one subcounty for district ${district}`,
          "error",
        );
        throw new Error("Subcounty validation failed");
      }

      return { district, subcounties };
    });
  }

  let supportYearObj = {
    year,
    level,
    thematic_areas: thematicAreas,
    districts: level === "National" ? [] : districtsWithSubcounties,
  };

  try {
    if (editingSupportYearIndex !== null) {
      currentPartner.partner_support_years[editingSupportYearIndex] =
        supportYearObj;
    } else {
      currentPartner.partner_support_years.push(supportYearObj);
    }
  } catch (e) {
    if (e.message === "Subcounty validation failed") {
      return;
    }
    console.error(e);
  }

  loadSupportYearsData(currentPartner.partner_support_years);
  closeSupportYearModal();
  showNotification("Support year saved successfully", "success");
}

function uploadDocument() {
  showNotification("Upload document functionality coming soon", "info");
}

function downloadDocument(link) {
  window.open(link, "_blank");
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
