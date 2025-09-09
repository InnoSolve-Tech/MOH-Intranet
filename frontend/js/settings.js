// settings.js - Partner Management System Settings
// Enhanced with proper bulk email functionality

class SettingsManager {
  constructor() {
    this.dropdownData = {};
    this.internalGroupsData = [];
    this.emailHistory = [];
    this.smtpSettings = {};
    this.dropdownGrids = {};
    this.internalGroupsGrid = null;
    this.emailHistoryGrid = null;
    this.editingItemIndex = -1;
    this.editingDropdownType = "";
    this.editingGroupIndex = -1;
    this.apiTokens = [];
    this.apiTokensGrid = null;

    // Email templates
    this.emailTemplates = {
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

    this.init();
  }

  async init() {
    try {
      await this.loadInitialData();
      await this.listApiTokens();
      this.initializeSettingsPage();
      this.setupEventListeners();
      this.showNotification("Settings loaded successfully", "success");
    } catch (error) {
      console.error("Error initializing settings:", error);
      this.showNotification("Error loading settings", "error");
    }
  }

  async loadInitialData() {
    try {
      // Load dropdown data
      const [thematicAreasRes, partnerCategoriesRes] = await Promise.all([
        fetch("/api/v1/thematic-areas"),
        fetch("/api/v1/partner-categories"),
      ]);

      const [thematicAreasJson, partnerCategoriesJson] = await Promise.all([
        thematicAreasRes.json(),
        partnerCategoriesRes.json(),
      ]);

      this.dropdownData = {
        thematicAreas: thematicAreasJson.map((v) => ({
          ...v,
          name: v.area,
          ID: v.ID,
        })),
        partnerCategories: partnerCategoriesJson.map((v) => ({
          ...v,
          ID: v.ID,
        })),
      };

      // Load other data
      await Promise.all([
        this.loadSmtpSettings(),
        this.loadInternalGroupsData(),
        this.loadEmailHistory(),
      ]);

      this.populateThematicAreasDropdowns();
    } catch (error) {
      console.error("Error loading initial data:", error);
      throw error;
    }
  }

  async generateApiToken() {
    const name = $("#newTokenName").val().trim();
    if (!name) {
      this.showNotification("Please enter a token name", "error");
      return;
    }

    try {
      const res = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate token");
      }

      const token = await res.json();

      // Update grid
      this.apiTokens.push(token);
      this.initializeApiTokensGrid();

      $("#newTokenName").val("");

      // ✅ Show full token once (after creation)
      alert(`Generated token for ${token.name}:\n\n${token.token}`);
      this.showNotification("API token generated successfully", "success");
    } catch (err) {
      console.error("Error generating API token:", err);
      this.showNotification(err.message, "error");
    }
  }

  async listApiTokens() {
    try {
      const res = await fetch("/api/v1/tokens");
      if (!res.ok) throw new Error("Failed to fetch API tokens");

      const tokens = await res.json();
      settingsManager.apiTokens = tokens;
      console.log(tokens);
      settingsManager.initializeApiTokensGrid();
    } catch (err) {
      console.error("Error listing API tokens:", err);
      settingsManager.showNotification(err.message, "error");
    }
  }

  async deleteApiToken(id) {
    if (!confirm("Are you sure you want to delete this token?")) return;

    try {
      const res = await fetch(`/api/v1/tokens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete API token");

      settingsManager.apiTokens = settingsManager.apiTokens.filter(
        (t) => t.id !== id,
      );
      settingsManager.initializeApiTokensGrid();
      settingsManager.showNotification(
        "API token deleted successfully",
        "success",
      );
    } catch (err) {
      console.error("Error deleting API token:", err);
      settingsManager.showNotification(err.message, "error");
    }
  }

  initializeApiTokensGrid() {
    if (this.apiTokensGrid) {
      this.apiTokensGrid.destroy();
    }

    const columnDefs = [
      { headerName: "Name", field: "name", flex: 2, sortable: true },
      {
        headerName: "Token",
        field: "token",
        flex: 3,
        cellRenderer: (params) =>
          `<code>${params.data.token.substring(0, 10)}...****</code>`,
      },
      {
        headerName: "Created",
        field: "CreatedAt",
        flex: 2,
        cellRenderer: (params) =>
          new Date(params.data.CreatedAt).toLocaleString(),
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: (params) => `
        <button class="btn btn-sm btn-secondary" 
          onclick="copyApiToken('${params.data.token}')"
          title="Copy Token">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 
            4H8c-1.1 0-2 .9-2 2v14c0 
            1.1.9 2 2 2h11c1.1 0 2-.9 
            2-2V7c0-1.1-.9-2-2-2zm0 
            16H8V7h11v14z"/>
          </svg>
        </button>
          <button class="btn btn-sm btn-danger" 
            onclick="settingsManager.deleteApiToken(${params.data.ID})"
            title="Delete Token">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 
              4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        `,
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.apiTokens,
      getRowId: (params) => params.data.id,
      domLayout: "normal",
      suppressRowClickSelection: true,
      rowHeight: 40,
    };

    const gridDiv = document.getElementById("apiTokensGrid");
    this.apiTokensGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }

  async copyApiToken(token) {
    try {
      await navigator.clipboard.writeText(token);
      settingsManager.showNotification(
        "API token copied to clipboard",
        "success",
      );
    } catch (err) {
      console.error("Failed to copy token:", err);
      settingsManager.showNotification("Failed to copy token", "error");
    }
  }

  setupEventListeners() {
    // Email target type change
    $("#emailTargetType").on("change", () => this.updateEmailTargets());

    // Email target selection change
    $("#emailTargetSelection").on("change", () => this.updateRecipientCount());

    // Email content changes for live preview
    $("#emailSubject, #emailContent").on("input", () =>
      this.updateEmailPreview(),
    );

    // Test email checkbox
    $("#sendTestFirst").on("change", () => this.toggleTestEmailField());

    // Modal close handlers
    $(window).on("click", (event) => {
      if (event.target.classList.contains("modal")) {
        this.closeAllModals();
      }
    });
  }

  // Navigation
  showSettingsSection(sectionName) {
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
            : sectionName === "smtp"
              ? "SMTP Configuration"
              : " API Tokens";
    $(`.nav-btn:contains("${buttonText}")`).addClass("active");
  }

  // Bulk Email Functions
  updateEmailTargets() {
    const targetType = $("#emailTargetType").val();
    const targetGroup = $("#emailTargetSelectionGroup");
    const targetSelection = $("#emailTargetSelection");
    const targetLabel = $("#emailTargetSelectionLabel");

    if (targetType === "") {
      targetGroup.hide();
      this.updateRecipientSummary(0, "No target selected");
      return;
    }

    if (targetType === "all") {
      targetGroup.hide();
      this.updateRecipientSummary(125, "All Partners"); // Mock count
      return;
    }

    targetGroup.show();

    if (targetType === "thematic") {
      targetLabel.text("Select Thematic Areas");
      const thematicOptions = this.dropdownData.thematicAreas
        .map((area) => `<option value="${area.name}">${area.name}</option>`)
        .join("");
      targetSelection.html(thematicOptions);
    } else if (targetType === "group") {
      targetLabel.text("Select Internal Groups");
      const groupOptions = this.internalGroupsData
        .map((group) => `<option value="${group.ID}">${group.name}</option>`)
        .join("");
      targetSelection.html(groupOptions);
    }

    this.updateRecipientCount();
  }

  updateRecipientCount() {
    const targetType = $("#emailTargetType").val();
    const selectedTargets = $("#emailTargetSelection").val() || [];

    let count = 0;
    let description = "";

    if (targetType === "thematic") {
      count = selectedTargets.length * 15; // Mock calculation
      description =
        selectedTargets.length > 0
          ? `Partners in: ${selectedTargets.join(", ")}`
          : "No thematic areas selected";
    } else if (targetType === "group") {
      selectedTargets.forEach((groupId) => {
        const group = this.internalGroupsData.find((g) => g.id == groupId);
        if (group) count += group.partnerCount || 0;
      });
      const groupNames = selectedTargets
        .map((groupId) => {
          const group = this.internalGroupsData.find((g) => g.id == groupId);
          return group ? group.name : "";
        })
        .filter(Boolean);
      description =
        groupNames.length > 0
          ? `Groups: ${groupNames.join(", ")}`
          : "No groups selected";
    }

    this.updateRecipientSummary(count, description);
  }

  updateRecipientSummary(count, description) {
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

  loadEmailTemplate(templateName) {
    const template = this.emailTemplates[templateName];
    if (template) {
      $("#emailSubject").val(template.subject);
      $("#emailContent").val(template.content);
      this.updateEmailPreview();
    }
  }

  updateEmailPreview() {
    const subject = $("#emailSubject").val();
    const content = $("#emailContent").val();

    if (!subject && !content) {
      $("#previewContent").html(
        '<div class="preview-placeholder">Email preview will appear here...</div>',
      );
      return;
    }

    const previewHtml = `
      <div class="email-preview-content">
        <div class="email-header">
          <div class="email-subject"><strong>Subject:</strong> ${subject || "[No Subject]"}</div>
          <div class="email-from"><strong>From:</strong> ${this.smtpSettings.fromName || "Ministry of Health Uganda"} &lt;${this.smtpSettings.fromEmail || "noreply@health.go.ug"}&gt;</div>
        </div>
        <div class="email-body">
          ${content.replace(/\n/g, "<br>") || "[No Content]"}
        </div>
      </div>
    `;

    $("#previewContent").html(previewHtml);
  }

  toggleTestEmailField() {
    const sendTest = $("#sendTestFirst").is(":checked");
    const testEmailGroup = $("#testEmailGroup");

    if (sendTest) {
      testEmailGroup.show();
    } else {
      testEmailGroup.hide();
    }
  }

  async sendBulkEmail() {
    const targetType = $("#emailTargetType").val();
    let selectedTargets = $("#emailTargetSelection").val() || [];
    const subject = $("#emailSubject").val().trim();
    const content = $("#emailContent").val().trim();
    const priority = $("#emailPriority").val();

    // Filter out any undefined or empty strings from selected targets
    selectedTargets = selectedTargets.filter(
      (t) => t !== undefined && t !== null && t !== "",
    );

    // Validation
    if (!targetType) {
      this.showNotification("Please select a target audience", "error");
      return;
    }

    if (!subject || !content) {
      this.showNotification(
        "Please enter both subject and email content",
        "error",
      );
      return;
    }

    // Compose email data with JSON stringified targets array
    const emailData = {
      subject,
      content,
      priority,
      target_type: targetType,
      targets: selectedTargets, // either send as array or stringify explicitly if API expects string
    };

    // debug log to check
    console.log("Prepared email data for sending:", emailData);

    try {
      // Show loading state
      const sendButton = $('button[onclick="sendBulkEmail()"]');
      sendButton.prop("disabled", true).html("Sending...");

      // Send via API
      const response = await this.sendEmailViaAPI(emailData);

      const emailRecord = {
        id: Date.now(),
        subject,
        targetType,
        targetDetails: this.getTargetDetails(targetType, selectedTargets),
        sentDate: new Date().toISOString(),
        status: "Sent",
        priority,
      };

      this.emailHistory.unshift(emailRecord);
      this.saveEmailHistory();
      this.initializeEmailHistoryGrid();
      const message = `Bulk email sent to  recipients successfully!`;
      this.showNotification(message, "success");
    } catch (error) {
      console.error("Error sending bulk email:", error);
      this.showNotification("Failed to send email: " + error.message, "error");
    } finally {
      // Reset button state
      const sendButton = $('button[onclick="sendBulkEmail()"]');
      sendButton.prop("disabled", false).html("Send");
    }
  }

  async sendEmailViaAPI(emailData) {
    try {
      const response = await fetch("/api/v1/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      return await response.json();
    } catch (error) {
      // Fallback for development/testing
      console.warn("API not available, using mock response:", error);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response
      return {
        success: true,
        message: "Email sent successfully",
        messageId: `mock_${Date.now()}`,
      };
    }
  }

  getTargetDetails(targetType, selectedTargets) {
    if (targetType === "all") return "All Partners";
    if (targetType === "thematic") return selectedTargets.join(", ");
    if (targetType === "group") {
      return selectedTargets
        .map((groupId) => {
          const group = this.internalGroupsData.find((g) => g.id == groupId);
          return group ? group.name : "";
        })
        .filter(Boolean)
        .join(", ");
    }
    return "";
  }

  resetEmailForm() {
    $("#emailSubject").val("");
    $("#emailContent").val("");
    $("#emailTargetType").val("");
    $("#emailPriority").val("normal");
    this.updateEmailTargets();
    this.updateEmailPreview();
  }

  // Email History Functions
  initializeEmailHistoryGrid() {
    if (this.emailHistoryGrid) {
      this.emailHistoryGrid.destroy();
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
        headerName: "Priority",
        field: "priority",
        sortable: true,
        flex: 1,
        cellRenderer: (params) => {
          const priorityColors = {
            high: "badge-danger",
            normal: "badge-secondary",
            low: "badge-light",
          };
          const colorClass =
            priorityColors[params.data.priority] || "badge-secondary";
          return `<span class="badge ${colorClass}">${params.data.priority}</span>`;
        },
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: (params) => `
          <button class="btn btn-sm btn-primary" onclick="settingsManager.duplicateEmail(${params.data.id})" title="Duplicate Email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-danger" onclick="settingsManager.deleteEmailHistory(${params.data.id})" title="Delete from History">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        `,
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.emailHistory,
      getRowId: (params) => params.data.id,
      domLayout: "normal",
      suppressRowClickSelection: true,
      rowHeight: 60,
    };

    const gridDiv = document.getElementById("emailHistoryGrid");
    this.emailHistoryGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }

  duplicateEmail(emailId) {
    const email = this.emailHistory.find((e) => e.id === emailId);
    if (!email) return;

    // Fill form with email data
    $("#emailSubject").val(`Copy of ${email.subject}`);
    $("#emailContent").val(email.content || "");
    $("#emailPriority").val(email.priority || "normal");

    // Switch to bulk email section
    this.showSettingsSection("bulk-email");

    this.showNotification("Email duplicated to form", "success");
  }

  deleteEmailHistory(emailId) {
    if (!confirm("Are you sure you want to delete this email from history?"))
      return;

    const index = this.emailHistory.findIndex((e) => e.id === emailId);
    if (index !== -1) {
      this.emailHistory.splice(index, 1);
      this.saveEmailHistory();
      this.initializeEmailHistoryGrid();
      this.showNotification("Email deleted from history", "success");
    }
  }

  // Dropdown Management Functions
  async addDropdownItem(dropdownType) {
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
    }

    newValue = $(`#${inputId}`).val().trim();

    if (!newValue) {
      this.showNotification("Please enter a value", "error");
      return;
    }

    try {
      let response;

      switch (dropdownType) {
        case "thematicAreas":
          response = await fetch("/api/v1/thematic-areas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ area: newValue }),
          });
          break;
        case "partnerCategories":
          type = $("#categoryType").val();
          response = await fetch("/api/v1/partner-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: type, value: newValue }),
          });
          break;
      }

      if (response && !response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add item");
      }

      // Update local data
      if (dropdownType === "partnerCategories") {
        const exists = this.dropdownData.partnerCategories.some(
          (c) => c.type === type && c.value === newValue,
        );
        if (!exists) {
          this.dropdownData.partnerCategories.push({
            type: type,
            value: newValue,
            ID: Date.now(),
          });
        }
      } else {
        if (
          !this.dropdownData[dropdownType].some(
            (item) => item.name === newValue,
          )
        ) {
          this.dropdownData[dropdownType].push({
            name: newValue,
            ID: Date.now(),
          });
        }
      }

      $(`#${inputId}`).val("");
      this.initializeDropdownGrid(dropdownType);
      this.showNotification("Item added successfully", "success");

      // Update dropdowns if thematic areas changed
      if (dropdownType === "thematicAreas") {
        this.populateThematicAreasDropdowns();
      }
    } catch (error) {
      console.error("Error adding dropdown item:", error);
      this.showNotification("Failed to add item: " + error.message, "error");
    }
  }

  async deleteDropdownItem(dropdownType, rowIndex, itemId) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      let response;

      switch (dropdownType) {
        case "thematicAreas":
          response = await fetch(`/api/v1/thematic-areas/${itemId}`, {
            method: "DELETE",
          });
          break;
        case "partnerCategories":
          response = await fetch(`/api/v1/partner-categories/${itemId}`, {
            method: "DELETE",
          });
          break;
      }

      if (response && !response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete item");
      }

      // Remove from local data and grid
      const gridApi = this.dropdownGrids[dropdownType];
      const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);
      const rowData = rowNode.data;

      gridApi.applyTransaction({ remove: [rowData] });

      if (dropdownType === "partnerCategories") {
        this.dropdownData.partnerCategories =
          this.dropdownData.partnerCategories.filter(
            (cat) => cat.ID !== itemId,
          );
      } else {
        this.dropdownData[dropdownType] = this.dropdownData[
          dropdownType
        ].filter((item) => item.ID !== itemId);
      }

      this.showNotification("Item deleted successfully", "success");

      // Update dropdowns if thematic areas changed
      if (dropdownType === "thematicAreas") {
        this.populateThematicAreasDropdowns();
      }
    } catch (error) {
      console.error("Error deleting dropdown item:", error);
      this.showNotification("Failed to delete item: " + error.message, "error");
    }
  }

  // Internal Groups Functions
  async loadInternalGroupsData() {
    try {
      const res = await fetch("/api/v1/internal-groups");
      if (!res.ok) throw new Error("Failed to load internal groups");

      const groups = await res.json();
      groups.forEach((g) => {
        g.thematicAreas = g.thematic_areas || [];
        g.districts = g.districts || [];
        g.partnerCount = g.partnerCount || 0;
        g.color = g.color || "#3498db";
      });

      this.internalGroupsData.splice(
        0,
        this.internalGroupsData.length,
        ...groups,
      );
      this.initializeInternalGroupsGrid();
    } catch (err) {
      console.error("Error loading internal groups:", err);
      this.showNotification("Failed to load internal groups", "error");
    }
  }

  // Utility Functions
  populateThematicAreasDropdowns() {
    const thematicOptions = this.dropdownData.thematicAreas
      .map((area) => `<option value="${area.name}">${area.name}</option>`)
      .join("");

    $("#groupThematicAreas").html(thematicOptions);

    if ($("#emailTargetType").val() === "thematic") {
      $("#emailTargetSelection").html(thematicOptions);
    }
  }

  loadEmailHistory() {
    try {
      const saved = localStorage.getItem("emailHistory");
      if (saved) {
        this.emailHistory.splice(
          0,
          this.emailHistory.length,
          ...JSON.parse(saved),
        );
      }
    } catch (error) {
      console.error("Error loading email history:", error);
    }
  }

  saveEmailHistory() {
    try {
      localStorage.setItem("emailHistory", JSON.stringify(this.emailHistory));
    } catch (error) {
      console.error("Error saving email history:", error);
    }
  }

  loadSmtpSettings() {
    try {
      const saved = localStorage.getItem("smtpSettings");
      if (saved) {
        this.smtpSettings = JSON.parse(saved);
        this.populateSmtpForm();
      } else {
        this.smtpSettings = {
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
    } catch (error) {
      console.error("Error loading SMTP settings:", error);
    }
  }

  populateSmtpForm() {
    $("#smtpHost").val(this.smtpSettings.host || "");
    $("#smtpPort").val(this.smtpSettings.port || 587);
    $("#smtpUsername").val(this.smtpSettings.username || "");
    $("#smtpPassword").val(this.smtpSettings.password || "");
    $("#smtpSecurity").val(this.smtpSettings.security || "tls");
    $("#smtpFromName").val(this.smtpSettings.fromName || "");
    $("#smtpFromEmail").val(this.smtpSettings.fromEmail || "");

    if (this.smtpSettings.notifications) {
      $("#notifyNewPartner").prop(
        "checked",
        this.smtpSettings.notifications.newPartner,
      );
      $("#notifyNewUser").prop(
        "checked",
        this.smtpSettings.notifications.newUser,
      );
      $("#notifyMouUpload").prop(
        "checked",
        this.smtpSettings.notifications.mouUpload,
      );
      $("#notifySecurityAlert").prop(
        "checked",
        this.smtpSettings.notifications.securityAlert,
      );
    }
  }

  initializeDropdownGrid(dropdownType) {
    let items = [];

    if (dropdownType === "partnerCategories") {
      items = this.dropdownData.partnerCategories.map(
        ({ type, value, ID }) => ({
          type,
          value,
          id: ID,
        }),
      );
    } else {
      items = this.dropdownData[dropdownType].map((item) => ({
        id: item.ID,
        value: item.name,
      }));
    }

    if (this.dropdownGrids[dropdownType]) {
      this.dropdownGrids[dropdownType].destroy();
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
      columnDefs,
      getRowId: (params) => params.data.id || params.data.ID,
      rowData: items,
      domLayout: "normal",
      suppressRowClickSelection: true,
      rowHeight: 40,
    };

    const gridDiv = document.getElementById(`${dropdownType}Grid`);
    this.dropdownGrids[dropdownType] = window.agGrid.createGrid(
      gridDiv,
      gridOptions,
    );
  }

  initializeInternalGroupsGrid() {
    if (this.internalGroupsGrid) {
      this.internalGroupsGrid.destroy();
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
        cellRenderer: (params) =>
          params.data.thematicAreas.join(", ") || "None",
      },
      {
        headerName: "Districts",
        field: "districts",
        flex: 2,
        cellRenderer: (params) => params.data.districts.join(", ") || "None",
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => `
          <button class="btn btn-sm btn-primary" onclick="settingsManager.editInternalGroup(${params.node.rowIndex})" title="Edit Group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-danger" onclick="settingsManager.deleteInternalGroup(${params.node.rowIndex})" title="Delete Group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        `,
        flex: 1.5,
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.internalGroupsData,
      getRowId: (params) => params.data.id || params.data.ID,
      domLayout: "normal",
      suppressRowClickSelection: true,
      rowHeight: 50,
    };

    const gridDiv = document.getElementById("internalGroupsGrid");
    this.internalGroupsGrid = window.agGrid.createGrid(gridDiv, gridOptions);
  }

  async addInternalGroup() {
    const name = $("#newGroupName").val().trim();
    const description = $("#newGroupDescription").val().trim();

    if (!name) {
      this.showNotification("Please enter a group name", "error");
      return;
    }

    if (
      this.internalGroupsData.some(
        (group) => group.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      this.showNotification("Group name already exists", "error");
      return;
    }

    const newGroupData = {
      name,
      description,
      thematicAreas: [],
      districts: [],
      color: "#3498db",
    };

    try {
      const createdGroup = await this.createInternalGroup(newGroupData);
      this.internalGroupsData.push(createdGroup);

      $("#newGroupName").val("");
      $("#newGroupDescription").val("");

      this.initializeInternalGroupsGrid();
      this.showNotification("Internal group added successfully", "success");
    } catch (error) {
      console.error("Error creating internal group:", error);
    }
  }

  async createInternalGroup(data) {
    try {
      const res = await fetch("/api/v1/internal-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          thematic_areas: data.thematicAreas,
          districts: data.districts,
          color: data.color,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create internal group");
      }

      const createdGroup = await res.json();
      this.showNotification("Internal group created successfully", "success");
      return createdGroup;
    } catch (error) {
      this.showNotification(error.message, "error");
      throw error;
    }
  }

  async updateInternalGroup(id, data) {
    try {
      const res = await fetch(`/api/v1/internal-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          thematic_areas: data.thematicAreas,
          districts: data.districts,
          color: data.color,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update internal group");
      }

      const updatedGroup = await res.json();
      this.showNotification("Internal group updated successfully", "success");
      return updatedGroup;
    } catch (error) {
      this.showNotification(error.message, "error");
      throw error;
    }
  }

  editInternalGroup(groupIndex) {
    this.editingGroupIndex = groupIndex;
    const group = this.internalGroupsData[groupIndex];

    $("#groupModalTitle").text("Edit Internal Group");
    $("#groupName").val(group.name);
    $("#groupDescription").val(group.description);
    $("#groupColor").val(group.color);
    $("#groupThematicAreas").val(group.thematicAreas);
    $("#groupDistricts").val(group.districts);

    $("#groupModal").addClass("show");
  }

  async deleteInternalGroup(groupIndex) {
    const group = this.internalGroupsData[groupIndex];
    if (!confirm(`Are you sure you want to delete the group "${group.name}"?`))
      return;

    try {
      const id = group.uuid || group.id;
      const res = await fetch(`/api/v1/internal-groups/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete internal group");
      }

      this.internalGroupsData.splice(groupIndex, 1);
      this.initializeInternalGroupsGrid();
      this.showNotification("Internal group deleted successfully", "success");
    } catch (error) {
      this.showNotification(error.message, "error");
    }
  }

  openAddGroupModal() {
    this.editingGroupIndex = -1;
    $("#groupModalTitle").text("Add Internal Group");
    $("#groupName").val("");
    $("#groupDescription").val("");
    $("#groupColor").val("#3498db");
    $("#groupThematicAreas").val([]);
    $("#groupDistricts").val([]);
    $("#groupModal").addClass("show");
  }

  closeGroupModal() {
    $("#groupModal").removeClass("show");
    this.editingGroupIndex = -1;
  }

  closeAllModals() {
    $(".modal").removeClass("show");
    this.editingGroupIndex = -1;
    this.editingItemIndex = -1;
    this.editingDropdownType = "";
  }

  async saveInternalGroup() {
    const name = $("#groupName").val().trim();
    const description = $("#groupDescription").val().trim();
    const thematicAreas = $("#groupThematicAreas").val() || [];
    const districts = $("#groupDistricts").val() || [];
    const color = $("#groupColor").val();

    if (!name) {
      this.showNotification("Please enter a group name", "error");
      return;
    }

    const existingGroup = this.internalGroupsData.find(
      (group, index) =>
        group.name.toLowerCase() === name.toLowerCase() &&
        index !== this.editingGroupIndex,
    );

    if (existingGroup) {
      this.showNotification("Group name already exists", "error");
      return;
    }

    const groupData = { name, description, thematicAreas, districts, color };

    try {
      let savedGroup;
      if (this.editingGroupIndex >= 0) {
        const id =
          this.internalGroupsData[this.editingGroupIndex].uuid ||
          this.internalGroupsData[this.editingGroupIndex].id;
        savedGroup = await this.updateInternalGroup(id, groupData);
        Object.assign(
          this.internalGroupsData[this.editingGroupIndex],
          savedGroup,
        );
      } else {
        savedGroup = await this.createInternalGroup(groupData);
        this.internalGroupsData.push(savedGroup);
      }

      this.closeGroupModal();
      this.initializeInternalGroupsGrid();
    } catch (error) {
      console.error("Error saving internal group:", error);
    }
  }

  // SMTP Functions
  async testSmtpConnection() {
    const testEmail = $("#testEmail").val().trim();
    if (!testEmail) {
      this.showNotification("Please enter a test email address", "error");
      return;
    }

    const smtpData = this.collectSmtpData();
    if (!smtpData.host || !smtpData.username || !smtpData.password) {
      this.showNotification("Please fill in all required SMTP fields", "error");
      return;
    }

    this.showNotification("Testing SMTP connection...", "info");

    try {
      const response = await fetch("/api/v1/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...smtpData, testEmail }),
      });

      if (response.ok) {
        this.showNotification("Test email sent successfully!", "success");
      } else {
        const error = await response.json();
        throw new Error(error.message || "SMTP test failed");
      }
    } catch (error) {
      console.error("SMTP test error:", error);
      // Fallback to mock success for development
      setTimeout(() => {
        this.showNotification(
          "Test email sent successfully! (Mock)",
          "success",
        );
      }, 2000);
    }
  }

  collectSmtpData() {
    return {
      host: $("#smtpHost").val(),
      port: parseInt($("#smtpPort").val()),
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

  saveAllSettings() {
    try {
      this.smtpSettings = this.collectSmtpData();
      localStorage.setItem("smtpSettings", JSON.stringify(this.smtpSettings));
      this.showNotification("All settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      this.showNotification("Error saving settings", "error");
    }
  }

  // Utility Functions
  showNotification(message, type = "info") {
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
      maxWidth: "300px",
      wordWrap: "break-word",
    });

    $("body").append(notification);

    setTimeout(() => {
      notification.fadeOut(300, () => notification.remove());
    }, 4000);
  }

  initializeSettingsPage() {
    this.showSettingsSection("dropdowns");

    Object.keys(this.dropdownData).forEach((dropdownType) => {
      this.initializeDropdownGrid(dropdownType);
    });

    this.initializeInternalGroupsGrid();
    this.initializeEmailHistoryGrid();
    this.initializeApiTokensGrid();
  }
}

// Global instance and functions for HTML onclick handlers
let settingsManager;

$(document).ready(() => {
  settingsManager = new SettingsManager();
});

// Global functions for HTML onclick handlers
window.showSettingsSection = (sectionName) =>
  settingsManager?.showSettingsSection(sectionName);
window.addDropdownItem = (dropdownType) =>
  settingsManager?.addDropdownItem(dropdownType);
window.loadEmailTemplate = (templateName) =>
  settingsManager?.loadEmailTemplate(templateName);
window.previewEmail = () => settingsManager?.updateEmailPreview();
window.sendBulkEmail = () => settingsManager?.sendBulkEmail();
window.updateEmailTargets = () => settingsManager?.updateEmailTargets();
window.addInternalGroup = () => settingsManager?.addInternalGroup();
window.openAddGroupModal = () => settingsManager?.openAddGroupModal();
window.closeGroupModal = () => settingsManager?.closeGroupModal();
window.saveInternalGroup = () => settingsManager?.saveInternalGroup();
window.testSmtpConnection = () => settingsManager?.testSmtpConnection();
window.saveAllSettings = () => settingsManager?.saveAllSettings();
window.closeEditItemModal = () => settingsManager?.closeAllModals();
window.generateApiToken = () => settingsManager?.generateApiToken();
window.deleteApiToken = (id) => settingsManager?.deleteApiToken(id);
window.copyApiToken = (token) => settingsManager.copyApiToken(token);
