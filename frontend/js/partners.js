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

function loadPartners() {
  partnersData = [
    {
      id: 1,
      name: "United Nations Children's Fund",
      acronym: "UNICEF",
      type: "International",
      category: "Health",
      phone: "+256-414-234567",
      email: "uganda@unicef.org",
      address: "Plot 15, Yusuf Lule Road, Kampala",
      status: "active",
      contacts: [
        {
          name: "John Doe",
          position: "Country Director",
          phone: "+256-700-123456",
          email: "john.doe@unicef.org",
        },
        {
          name: "Jane Smith",
          position: "Program Manager",
          phone: "+256-700-234567",
          email: "jane.smith@unicef.org",
        },
      ],
    },
    {
      id: 2,
      name: "World Health Organization",
      acronym: "WHO",
      type: "International",
      category: "Health",
      phone: "+256-414-345678",
      email: "uganda@who.int",
      address: "Plot 20, Nakasero Road, Kampala",
      status: "active",
      contacts: [
        {
          name: "Dr. Michael Johnson",
          position: "WHO Representative",
          phone: "+256-700-345678",
          email: "m.johnson@who.int",
        },
      ],
    },
    {
      id: 3,
      name: "Ministry of Health",
      acronym: "MOH",
      type: "Government",
      category: "Health",
      phone: "+256-414-456789",
      email: "info@health.go.ug",
      address: "Plot 6, Lourdel Road, Kampala",
      status: "active",
      contacts: [
        {
          name: "Dr. Sarah Williams",
          position: "Permanent Secretary",
          phone: "+256-700-456789",
          email: "ps@health.go.ug",
        },
      ],
    },
    {
      id: 4,
      name: "Makerere University",
      acronym: "MAK",
      type: "Government",
      category: "Education",
      phone: "+256-414-567890",
      email: "info@mak.ac.ug",
      address: "University Road, Kampala",
      status: "pending",
      contacts: [
        {
          name: "Prof. David Brown",
          position: "Vice Chancellor",
          phone: "+256-700-567890",
          email: "vc@mak.ac.ug",
        },
      ],
    },
    {
      id: 5,
      name: "Uganda Red Cross Society",
      acronym: "URCS",
      type: "NGO",
      category: "Health",
      phone: "+256-414-678901",
      email: "info@redcrossug.org",
      address: "Plot 17, Buganda Road, Kampala",
      status: "active",
      contacts: [
        {
          name: "Mary Johnson",
          position: "Secretary General",
          phone: "+256-700-678901",
          email: "sg@redcrossug.org",
        },
      ],
    },
  ];

  filteredPartners = [...partnersData];
  buildTreeView();
  applyTreeFilters();
}

function initializeGrid() {
  const columnDefs = [
    {
      headerName: "Partner",
      field: "name",
      width: 200,
      cellRenderer: (params) => `
        <div style="font-weight: 500; font-size: 0.8rem;">${params.value}</div>
        <div style="font-size: 0.7rem; color: #6c757d;">${params.data.acronym}</div>
      `,
    },
    {
      headerName: "Type",
      field: "type",
      width: 80,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Category",
      field: "category",
      width: 90,
      cellStyle: { fontSize: "0.75rem" },
    },
    {
      headerName: "Contact",
      field: "phone",
      width: 140,
      cellRenderer: (params) => `
        <div style="font-size: 0.7rem;">${params.value}</div>
        <div style="font-size: 0.65rem; color: #6c757d;">${params.data.email}</div>
      `,
    },
    {
      headerName: "Contacts",
      field: "contacts",
      width: 100,
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
      headerName: "Status",
      field: "status",
      width: 70,
      cellRenderer: (params) => `
        <span class="status-badge status-${params.value}">${params.value}</span>
      `,
    },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: (params) => `
        <div class="action-buttons">
          <button class="action-btn btn-view" onclick="viewPartner(${params.data.id})" title="View">
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

function savePartner() {
  const form = $("#partnerForm")[0];
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const partnerData = {
    name: formData.get("partnerName"),
    acronym: formData.get("acronym"),
    type: formData.get("partnerType"),
    category: formData.get("category"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    status: "active",
    contacts: [],
  };

  if (editingPartnerId) {
    const index = partnersData.findIndex((p) => p.id === editingPartnerId);
    if (index !== -1) {
      partnersData[index] = { ...partnersData[index], ...partnerData };
      showNotification("Partner updated successfully!", "success");
    }
  } else {
    const newId = Math.max(...partnersData.map((p) => p.id), 0) + 1;
    const newPartner = { id: newId, ...partnerData };
    partnersData.push(newPartner);
    showNotification("Partner added successfully!", "success");
  }

  buildTreeView();
  applyTreeFilters();
  closePartnerModal();
}

function deletePartner(id) {
  const partner = partnersData.find((p) => p.id === id);
  if (!partner) return;

  if (confirm(`Are you sure you want to delete ${partner.name}?`)) {
    partnersData = partnersData.filter((p) => p.id !== id);
    buildTreeView();
    applyTreeFilters();
    showNotification("Partner deleted successfully!", "success");
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
        const $acronymDiv = $("<div>")
          .addClass("tree-leaf")
          .text(partner.acronym);
        $acronymDiv.on("click", () =>
          selectTreeLeaf($acronymDiv[0], "acronym", partner.acronym),
        );
        $childrenDiv.append($acronymDiv);
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

  if (treeFilters.acronym === value) {
    treeFilters.acronym = null;
  } else {
    $(leaf).addClass("selected");
    treeFilters.acronym = value;
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
  treeFilters = { type: null, category: null, acronym: null };
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
  showContactsDialog(partnerId); // Refresh the dialog
}

function cancelContactEdit(partnerId) {
  editingContactIndex = null;
  showContactsDialog(partnerId); // Refresh the dialog
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
  $("#address").val(partner.address || "");
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
  alert(
    `Partner Details:\n\nName: ${partner.name}\nAcronym: ${partner.acronym}\nType: ${partner.type}\nCategory: ${partner.category}\nPhone: ${partner.phone}\nEmail: ${partner.email}\nAddress: ${partner.address || "Not provided"}\nStatus: ${partner.status}\n\nContacts:\n${contactsList}`,
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
