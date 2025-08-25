let partnersData = [];
let filteredPartners = [];
let gridApi = null;
let editingPartnerId = null;
let selectedContact = null;
let editingContactIndex = null;
let treeFilters = {
  type: null,
  category: null,
  acronym: null,
};

const agGrid = window.agGrid;
const $ = window.jQuery;

$(document).ready(() => {
  initializePartnersPage();
  loadPartners();
  initializeGrid();
  setupPartnersEventListeners();
});

function initializePartnersPage() {
  setActiveMenuItem("partners");
}

function setupPartnersEventListeners() {
  $(window).on("click", (event) => {
    if ($(event.target).hasClass("modal")) {
      closePartnerModal();
      closeContactsModal();
      closeContactToUserModal();
      closeSupportYearsModal();
    }
  });

  $("#partnerForm").on("submit", (e) => {
    e.preventDefault();
    savePartner();
  });

  $("#contactToUserForm").on("submit", (e) => {
    e.preventDefault();
    convertContactToUser();
  });
}

async function loadPartners() {
  try {
    const res = await fetch("/api/v1/partners");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const apiPartners = await res.json();

    partnersData = apiPartners.map((partner) => ({
      id: partner.ID,
      uuid: partner.uuid,
      name: partner.partner_name, // Using acronym as name since API doesn't have separate name field
      acronym: partner.acronym,
      type: partner.partner_type,
      category: partner.partner_category,
      phone: partner.official_phone,
      email: partner.official_email,
      addresses: partner.partner_address || [],
      address:
        partner.partner_address && partner.partner_address.length > 0
          ? partner.partner_address
              .map((addr) => addr.address || addr.official_phone)
              .join(", ")
          : "",
      status: "active", // Default status since API doesn't provide this
      has_mou: partner.has_mou,
      mou_link: partner.mou_link,
      contacts: partner.partner_contacts
        ? partner.partner_contacts.map((contact) => ({
            name: contact.names,
            position: contact.title,
            phone: contact.phone_number,
            email: contact.offical_email,
            address: contact.address,
            user_id: contact.user_id,
          }))
        : [],
      support_years: partner.partner_support_years || [],
    }));

    filteredPartners = [...partnersData];
    buildTreeView();
    applyTreeFilters();

    showNotification(
      `Loaded ${partnersData.length} partners successfully!`,
      "success",
    );
  } catch (error) {
    console.error("Error loading partners:", error);
    showNotification("Failed to load partners. Please try again.", "error");

    partnersData = [];
    filteredPartners = [];
    buildTreeView();
    applyTreeFilters();
  }
}

function initializeGrid() {
  const columnDefs = [
    {
      headerName: "Partner",
      field: "name",
      width: 200,
      flex: 1,
      cellRenderer: (params) => `
        <div style="font-weight: 500; font-size: 0.8rem;">${params.value}</div>
        <div style="font-size: 0.7rem; color: #6c757d;">${params.data.acronym}</div>
      `,
    },
    {
      headerName: "Type",
      field: "type",
      width: 80,
      flex: 1,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Category",
      field: "category",
      width: 90,
      flex: 1,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Contact",
      field: "phone",
      width: 140,
      flex: 1,
      cellRenderer: (params) => `
        <div style="font-size: 0.7rem;">${params.value}</div>
        <div style="font-size: 0.65rem; color: #6c757d;">${params.data.email}</div>
      `,
    },
    {
      headerName: "MOU",
      field: "has_mou",
      width: 80,
      flex: 1,
      cellRenderer: (params) => {
        if (params.data.has_mou && params.data.mou_link) {
          return `<a href="${params.data.mou_link}" target="_blank" class="mou-link" title="View MOU">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </a>`;
        }
        return params.data.has_mou ? "Yes" : "No";
      },
    },
    {
      headerName: "Contacts",
      field: "contacts",
      width: 100,
      flex: 1,
      cellRenderer: (params) => {
        return `
          <button class="action-btn btn-contacts" onclick="showContactsDialog(${params.data.id})" title="View Contacts">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13c1.66 0 2.99-1.34 2.99-3S17.66 7 16 7s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 7 8 7 5 8.34 5 10s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-1.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            ${params.value.length}
          </button>
        `;
      },
    },
    {
      headerName: "Support Years",
      field: "support_years",
      width: 100,
      flex: 1,
      cellRenderer: (params) => {
        return `
          <button class="action-btn btn-support-years" onclick="showSupportYearsDialog(${params.data.id})" title="View Support Years">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            ${params.value.length}
          </button>
        `;
      },
    },
    {
      headerName: "Status",
      field: "status",
      width: 70,
      flex: 1,
      cellRenderer: (params) => `
        <span class="status-badge status-${params.value}">${params.value}</span>
      `,
    },
    {
      headerName: "Actions",
      width: 120,
      flex: 1.5,
      cellRenderer: (params) => `
        <div class="action-buttons">
          <button class="action-btn btn-view" onclick="openPartnerModal(${params.data.id})" title="View">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
          </button>
          <button class="action-btn btn-edit" onclick="editPartner(${params.data.id})" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="action-btn btn-delete" onclick="deletePartner(${params.data.id})" title="Delete">
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
    rowData: filteredPartners,
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

  const gridDiv = $("#partnersGrid")[0];
  if (gridDiv) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
  }
}

function showContactsDialog(partnerId) {
  const partner = partnersData.find((p) => p.id === partnerId);
  if (!partner || !partner.contacts) {
    showNotification("Partner or contacts not found", "error");
    return;
  }

  $("#contactsModalTitle").text(`${partner.name} - Contacts`);

  const contactsHtml = partner.contacts
    .map(
      (contact, index) => `
    <div class="contact-card" id="contact-${partnerId}-${index}">
      <div class="contact-details">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-position">${contact.position}</div>
        <div class="contact-info-line">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          ${contact.phone} | 
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin: 0 4px;">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          ${contact.email}
        </div>
      </div>
      <div class="contact-actions">
        <button class="btn btn-edit" onclick="editContact(${partnerId}, ${index})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Edit
        </button>
        <button class="btn btn-convert" onclick="openContactToUserModal(${partnerId}, ${index})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Convert to User
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  $("#contactsList").html(contactsHtml);
  $("#contactsModal").addClass("show");
}

async function savePartner() {
  const form = $("#partnerForm")[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);

  const partnerData = {
    acronym: formData.get("acronym"),
    partner_type: formData.get("partnerType"),
    partner_category: formData.get("category"),
    official_phone: formData.get("phone"),
    official_email: formData.get("email"),
    has_mou: formData.get("hasMou") === "on",
    mou_link: formData.get("mouLink") || "",
    partner_address: formData
      .getAll("addresses")
      .map((addr) => ({ address: addr })),
    partner_contacts: [], // Will be managed separately
    partner_support_years: [], // Will be managed separately
  };

  const mouFile = formData.get("mouFile");
  if (mouFile && mouFile.size > 0) {
    // In a real implementation, you would upload the file first
    // and get back a URL to store in mou_link
    console.log("MOU file to upload:", mouFile);
    partnerData.mou_link = `uploads/mou/${mouFile.name}`; // Placeholder
  }

  try {
    let response;
    if (editingPartnerId) {
      response = await fetch(`/partners/${editingPartnerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partnerData),
      });
    } else {
      response = await fetch("/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partnerData),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Partner saved:", result);

    showNotification(
      editingPartnerId
        ? "Partner updated successfully!"
        : "Partner added successfully!",
      "success",
    );

    await loadPartners();
    closePartnerModal();
  } catch (error) {
    console.error("Error saving partner:", error);
    showNotification("Failed to save partner. Please try again.", "error");
  }
}

async function openPartnerModal(id) {
  const val = partnersData.find((p) => p.id === id);
  const res = await fetch(`/api/v1/partners/${val.uuid}`);
  const data = await res.json();
  const partner = data.partner;
  console.log(partner);
  const modal = document.getElementById("viewPartnerModal");
  const $modal = $("#viewPartnerModal");

  // Fill tab content
  document.getElementById("overview").innerHTML = `
    <p><strong>Name:</strong> ${partner.partner_name}</p>
    <p><strong>Acronym:</strong> ${partner.acronym}</p>
    <p><strong>Type:</strong> ${partner.partner_type}</p>
    <p><strong>Category:</strong> ${partner.partner_category}</p>
    <p><strong>Phone:</strong> ${partner.official_phone}</p>
    <p><strong>Email:</strong> ${partner.official_email}</p>
  `;

  document.getElementById("addresses").innerHTML = partner.partner_address
    .map((a) => `<p>${a.address}</p>`)
    .join("");

  document.getElementById("contacts").innerHTML = partner.partner_contacts
    .map(
      (c) => `
      <div>
        <p><strong>${c.names}</strong> (${c.title})</p>
        <p>Phone: ${c.phone_number}</p>
        <p>Email: ${c.official_email}</p>
      </div>
    `,
    )
    .join("");

  document.getElementById("support").innerHTML = partner.partner_support_years
    .map(
      (s) => `
      <div class="support-item">
        <p><strong>Year:</strong> ${s.year}</p>
        <p><strong>Level:</strong> ${s.level_of_support}</p>
        <p><strong>Thematic Areas:</strong> ${s.thematic_areas}</p>
        <p><strong>District:</strong> ${s.district} (${s.district_support_type})</p>
      </div>
    `,
    )
    .join("");

  document.getElementById("mou").innerHTML = partner.partner_mou
    ? `
      <p><strong>Signed By:</strong> ${partner.partner_mou.signed_by} (${partner.partner_mou.who_title})</p>
      <p><strong>Signed Date:</strong> ${new Date(partner.partner_mou.signed_date).toLocaleDateString()}</p>
      <p><strong>Expiry Date:</strong> ${new Date(partner.partner_mou.expiry_date).toLocaleDateString()}</p>
      <p><a href="${partner.partner_mou.file_path}" target="_blank">Download MoU</a></p>
    `
    : "<p>No MoU available</p>";

  // Show modal
  $modal.addClass("show");

  // Close button
  modal.querySelector(".close").onclick = () => {
    $modal.removeClass("show");
  };

  // Click outside closes
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };

  // Tab switching
  const tabs = modal.querySelectorAll(".tab-btn");
  const panes = modal.querySelectorAll(".tab-pane");
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      modal.querySelector(`#${tab.dataset.tab}`).classList.add("active");
    };
  });
}

async function deletePartner(id) {
  const partner = partnersData.find((p) => p.id === id);
  if (!partner) return;

  if (confirm(`Are you sure you want to delete ${partner.name}?`)) {
    try {
      const response = await fetch(`/partners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      showNotification("Partner deleted successfully!", "success");

      await loadPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      showNotification("Failed to delete partner. Please try again.", "error");
    }
  }
}

function convertContactToUser() {
  if (!selectedContact) return;

  const form = $("#contactToUserForm")[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const userData = {
    firstName: selectedContact.contact.name.split(" ")[0],
    lastName: selectedContact.contact.name.split(" ").slice(1).join(" "),
    email: selectedContact.contact.email,
    phone: selectedContact.contact.phone,
    role: formData.get("userRole"),
    department: formData.get("userDepartment"),
    password: formData.get("tempPassword"),
    sendWelcomeEmail: formData.get("sendWelcomeEmail") === "on",
    status: "active",
    createdFrom: "contact_conversion",
    partnerId: selectedContact.partnerId,
  };

  console.log("Converting contact to user:", userData);
  showNotification(
    `Successfully converted ${selectedContact.contact.name} to user account!`,
    "success",
  );
  closeContactToUserModal();
}

function buildTreeView() {
  const $treeContainer = $("#partnerTree");
  if (!$treeContainer.length) return;

  const treeData = buildTreeData();
  $treeContainer.empty();

  Object.keys(treeData).forEach((type) => {
    const typeNode = createTreeNode(type, "type", treeData[type]);
    $treeContainer.append(typeNode);
  });
}

function buildTreeData() {
  const tree = {};

  partnersData.forEach((partner) => {
    if (!tree[partner.type]) {
      tree[partner.type] = {};
    }
    if (!tree[partner.type][partner.category]) {
      tree[partner.type][partner.category] = [];
    }
    tree[partner.type][partner.category].push(partner);
  });

  return tree;
}

function createTreeNode(label, level, children) {
  const $nodeDiv = $("<div>").addClass("tree-node");
  const $headerDiv = $("<div>").addClass("tree-node-header");

  $headerDiv.on("click", () => toggleTreeNode($headerDiv[0], level, label));

  const hasChildren = level !== "acronym" && Object.keys(children).length > 0;

  $headerDiv.html(`
    <span class="tree-toggle">${hasChildren ? "▶" : ""}</span>
    <span>${label} ${level === "type" ? `(${Object.values(children).flat().length})` : level === "category" ? `(${children.length})` : ""}</span>
  `);

  $nodeDiv.append($headerDiv);

  if (hasChildren) {
    const $childrenDiv = $("<div>").addClass("tree-children");

    if (level === "type") {
      Object.keys(children).forEach((category) => {
        const categoryNode = createTreeNode(
          category,
          "category",
          children[category],
        );
        $childrenDiv.append(categoryNode);
      });
    } else if (level === "category") {
      children.forEach((partner) => {
        const $nameDiv = $("<div>").addClass("tree-leaf").text(partner.name);
        $nameDiv.on("click", () =>
          selectTreeLeaf($nameDiv[0], "name", partner.name),
        );
        $childrenDiv.append($nameDiv);
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

  if (level === "type") {
    treeFilters.type = treeFilters.type === value ? null : value;
    treeFilters.category = null;
    treeFilters.acronym = null;
  } else if (level === "category") {
    treeFilters.category = treeFilters.category === value ? null : value;
    treeFilters.acronym = null;
  }

  updateTreeSelection();
  applyTreeFilters();
}

function selectTreeLeaf(leaf, level, value) {
  $(".tree-leaf.selected").removeClass("selected");

  if (treeFilters.name === value) {
    treeFilters.name = null;
  } else {
    $(leaf).addClass("selected");
    treeFilters.name = value;
  }

  applyTreeFilters();
}

function updateTreeSelection() {
  $(".tree-node-header").removeClass("active");

  if (treeFilters.type) {
    $(".tree-node-header").each(function () {
      if ($(this).text().includes(treeFilters.type)) {
        $(this).addClass("active");
      }
    });
  }
}

function applyTreeFilters() {
  filteredPartners = partnersData.filter((partner) => {
    if (treeFilters.type && partner.type !== treeFilters.type) return false;
    if (treeFilters.category && partner.category !== treeFilters.category)
      return false;
    if (treeFilters.acronym && partner.acronym !== treeFilters.acronym)
      return false;
    return true;
  });

  if (gridApi) {
    gridApi.setGridOption("rowData", filteredPartners);
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
  treeFilters = { type: null, category: null, name: null };
  $(".tree-node-header.active").removeClass("active");
  $(".tree-leaf.selected").removeClass("selected");
  $("#treeSearch").val("");
  searchTree();
  applyTreeFilters();
}

function editContact(partnerId, contactIndex) {
  const partner = partnersData.find((p) => p.id === partnerId);
  const contact = partner.contacts[contactIndex];
  const $contactCard = $(`#contact-${partnerId}-${contactIndex}`);

  editingContactIndex = contactIndex;

  $contactCard.html(`
    <div class="contact-details">
      <div class="contact-edit-form">
        <input type="text" id="editContactName" value="${contact.name}" placeholder="Name">
        <input type="text" id="editContactPosition" value="${contact.position}" placeholder="Position">
        <input type="tel" id="editContactPhone" value="${contact.phone}" placeholder="Phone">
        <input type="email" id="editContactEmail" value="${contact.email}" placeholder="Email">
        <div class="contact-edit-actions">
          <button class="btn btn-save-contact" onclick="saveContactEdit(${partnerId}, ${contactIndex})">Save</button>
          <button class="btn btn-cancel-contact" onclick="cancelContactEdit(${partnerId})">Cancel</button>
        </div>
      </div>
    </div>
  `);
}

function saveContactEdit(partnerId, contactIndex) {
  const partner = partnersData.find((p) => p.id === partnerId);

  const updatedContact = {
    name: $("#editContactName").val(),
    position: $("#editContactPosition").val(),
    phone: $("#editContactPhone").val(),
    email: $("#editContactEmail").val(),
  };

  partner.contacts[contactIndex] = updatedContact;
  editingContactIndex = null;

  showNotification("Contact updated successfully!", "success");
  showContactsDialog(partnerId);
}

function cancelContactEdit(partnerId) {
  editingContactIndex = null;
  showContactsDialog(partnerId);
}

function closeContactsModal() {
  $("#contactsModal").removeClass("show");
  editingContactIndex = null;
}

function openContactToUserModal(partnerId, contactIndex) {
  const partner = partnersData.find((p) => p.id === partnerId);
  const contact = partner.contacts[contactIndex];

  selectedContact = { partnerId, contactIndex, contact };

  $("#contactDetails").html(`
    <strong>${contact.name}</strong><br>
    Position: ${contact.position}<br>
    Phone: ${contact.phone}<br>
    Email: ${contact.email}<br>
    Partner: ${partner.name}
  `);

  $("#contactToUserForm")[0].reset();
  $("#contactToUserModal").addClass("show");
  closeContactsModal();
}

function closeContactToUserModal() {
  $("#contactToUserModal").removeClass("show");
  selectedContact = null;
}

function openAddPartnerModal() {
  editingPartnerId = null;
  $("#modalTitle").text("Add New Partner");
  $("#partnerForm")[0].reset();
  $("#partnerModal").addClass("show");
}

function editPartner(id) {
  const partner = partnersData.find((p) => p.id === id);
  if (!partner) return;

  editingPartnerId = id;
  $("#modalTitle").text("Edit Partner");
  $("#partnerName").val(partner.name);
  $("#acronym").val(partner.acronym);
  $("#partnerType").val(partner.type);
  $("#category").val(partner.category);
  $("#phone").val(partner.phone);
  $("#email").val(partner.email);

  if (partner.addresses && partner.addresses.length > 0) {
    partner.addresses.forEach((addr, index) => {
      if (index === 0) {
        $("#address").val(addr.address || addr.official_phone || "");
      } else {
        // Add additional address fields dynamically
        addAddressField(addr.address || addr.official_phone || "");
      }
    });
  }

  $("#hasMou").prop("checked", partner.has_mou);
  $("#mouLink").val(partner.mou_link || "");

  $("#partnerModal").addClass("show");
}

function closePartnerModal() {
  $("#partnerModal").removeClass("show");
  editingPartnerId = null;
}

function viewPartner(id) {
  const partner = partnersData.find((p) => p.id === id);
  if (!partner) return;

  const contactsList = partner.contacts
    .map((c) => `${c.name} (${c.position}) - ${c.phone}`)
    .join("\n");
  const addressesList = partner.addresses
    ? partner.addresses
        .map((addr) => addr.address || addr.official_phone)
        .join("\n")
    : "Not provided";
  const supportYearsList =
    partner.support_years.length > 0
      ? partner.support_years
          .map((sy) => `${sy.year}: ${sy.level} - ${sy.districts}`)
          .join("\n")
      : "No support years recorded";

  alert(
    `Partner Details:\n\nName: ${partner.name}\nAcronym: ${partner.acronym}\nType: ${partner.type}\nCategory: ${partner.category}\nPhone: ${partner.phone}\nEmail: ${partner.email}\n\nAddresses:\n${addressesList}\n\nMOU: ${partner.has_mou ? "Yes" : "No"}${partner.mou_link ? ` (${partner.mou_link})` : ""}\nStatus: ${partner.status}\n\nContacts:\n${contactsList}\n\nSupport Years:\n${supportYearsList}`,
  );
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

function showSupportYearsDialog(partnerId) {
  const partner = partnersData.find((p) => p.id === partnerId);
  if (!partner) {
    showNotification("Partner not found", "error");
    return;
  }

  $("#supportYearsModalTitle").text(`${partner.name} - Support Years`);

  const supportYearsHtml =
    partner.support_years.length > 0
      ? partner.support_years
          .map(
            (supportYear, index) => `
        <div class="support-year-card" id="support-year-${partnerId}-${index}">
          <div class="support-year-details">
            <div class="support-year-year">Year: ${supportYear.year || "N/A"}</div>
            <div class="support-year-level">Level: ${supportYear.level || "N/A"}</div>
            <div class="support-year-districts">Districts: ${supportYear.districts || "N/A"}</div>
            <div class="support-year-thematic">Thematic Areas: ${supportYear.thematic_areas || "N/A"}</div>
          </div>
          <div class="support-year-actions">
            <button class="btn btn-edit" onclick="editSupportYear(${partnerId}, ${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>
      `,
          )
          .join("")
      : '<div class="no-support-years">No support years recorded</div>';

  $("#supportYearsList").html(supportYearsHtml);
  $("#supportYearsModal").addClass("show");
}

function closeSupportYearsModal() {
  $("#supportYearsModal").removeClass("show");
}

function addAddressField(value) {
  const $addressContainer = $("#addressContainer");
  const $newAddressField = $("<input>")
    .attr({
      type: "text",
      class: "form-control",
      id: `address-${$addressContainer.children().length}`,
      name: "addresses",
      placeholder: "Address",
    })
    .val(value);

  $addressContainer.append($newAddressField);
}
