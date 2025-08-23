// User Profile Management
let currentUser = null;

// Declare the $ variable
const $ = window.jQuery;

// Initialize user profile page
$(document).ready(() => {
  loadUserProfile();
  loadActivityLog();
});

// Load current user profile data
async function loadUserProfile() {
  try {
    const response = await fetch("/api/v1/user/profile");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const user = await response.json();
    currentUser = user;

    populateUserInfo(user);
  } catch (error) {
    console.error("Error loading user profile:", error);
    // Fallback to session storage or mock data
    loadMockUserData();
  }
}

// Load mock user data as fallback
function loadMockUserData() {
  const mockUser = {
    username: sessionStorage.getItem("username") || "admin",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@health.go.ug",
    phone: "+256 700 123456",
    department: "Health Systems",
    role: "Administrator",
    bio: "System administrator for the Partner Management System",
  };

  currentUser = mockUser;
  populateUserInfo(mockUser);
}

// Populate user information in the form
function populateUserInfo(user) {
  // Header information
  $("#userName").text(
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
  );
  $("#userRole").text(user.role || "User");

  // Account information form
  $("#firstName").val(user.firstName || "");
  $("#lastName").val(user.lastName || "");
  $("#username").val(user.username || "");
  $("#email").val(user.email || "");
  $("#phone").val(user.phone || "");
  $("#department").val(user.department || user.scope || "");
  $("#bio").val(user.bio || "");
}

// Load activity log
async function loadActivityLog() {
  try {
    const response = await fetch("/api/v1/user/activity");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const activities = await response.json();
    populateActivityLog(activities);
  } catch (error) {
    console.error("Error loading activity log:", error);
    // Load mock activity data
    loadMockActivityData();
  }
}

// Load mock activity data
function loadMockActivityData() {
  const mockActivities = [
    {
      type: "login",
      title: "Successful Login",
      description: "Logged in from IP: 192.168.1.100",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: "🔐",
    },
    {
      type: "profile",
      title: "Profile Updated",
      description: "Updated email address and phone number",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "👤",
    },
    {
      type: "partners",
      title: "Partner Created",
      description: "Added new partner: UNICEF Uganda",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "🤝",
    },
    {
      type: "settings",
      title: "Settings Changed",
      description: "Updated notification preferences",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "⚙️",
    },
    {
      type: "login",
      title: "Password Changed",
      description: "Successfully changed account password",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      icon: "🔒",
    },
  ];

  populateActivityLog(mockActivities);
}

// Populate activity log
function populateActivityLog(activities) {
  const activityList = $("#activityList");
  activityList.empty();

  if (activities.length === 0) {
    activityList.append(
      '<div class="activity-item"><p>No activity found</p></div>',
    );
    return;
  }

  activities.forEach((activity) => {
    const timeAgo = getTimeAgo(new Date(activity.timestamp));
    const activityItem = $(`
            <div class="activity-item" data-type="${activity.type}">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `);

    activityList.append(activityItem);
  });
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

// Save profile changes
async function saveProfile() {
  const profileData = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    email: $("#email").val(),
    phone: $("#phone").val(),
    department: $("#department").val(),
    bio: $("#bio").val(),
    preferences: {
      theme: $("#theme").val(),
      language: $("#language").val(),
      timezone: $("#timezone").val(),
      notifications: {
        newPartner: $("#notifyNewPartner").is(":checked"),
        mouUpdates: $("#notifyMouUpdates").is(":checked"),
        systemUpdates: $("#notifySystemUpdates").is(":checked"),
        weeklyReport: $("#notifyWeeklyReport").is(":checked"),
      },
      dashboard: {
        showWelcomeMessage: $("#showWelcomeMessage").is(":checked"),
        autoRefreshData: $("#autoRefreshData").is(":checked"),
      },
    },
    security: {
      enable2FA: $("#enable2FA").is(":checked"),
      emailNotifications: $("#emailNotifications").is(":checked"),
      suspiciousActivity: $("#suspiciousActivity").is(":checked"),
    },
  };

  try {
    const response = await fetch("/api/v1/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    showNotification("Profile updated successfully", "success");

    // Update header display
    $("#userName").text(
      `${profileData.firstName} ${profileData.lastName}`.trim(),
    );
  } catch (error) {
    console.error("Error saving profile:", error);
    showNotification("Failed to update profile", "error");
  }
}

// Change password
async function changePassword() {
  const currentPassword = $("#currentPassword").val();
  const newPassword = $("#newPassword").val();
  const confirmPassword = $("#confirmPassword").val();

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification("Please fill in all password fields", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification("New passwords do not match", "error");
    return;
  }

  if (newPassword.length < 8) {
    showNotification("Password must be at least 8 characters long", "error");
    return;
  }

  try {
    const response = await fetch("/api/v1/user/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    showNotification("Password changed successfully", "success");

    // Clear password fields
    $("#currentPassword").val("");
    $("#newPassword").val("");
    $("#confirmPassword").val("");
  } catch (error) {
    console.error("Error changing password:", error);
    showNotification("Failed to change password", "error");
  }
}

// Filter activity log
function filterActivity() {
  const typeFilter = $("#activityType").val();
  const dateFilter = $("#activityDate").val();

  $(".activity-item").each(function () {
    const item = $(this);
    const itemType = item.data("type");
    let showItem = true;

    // Type filter
    if (typeFilter !== "all" && itemType !== typeFilter) {
      showItem = false;
    }

    // Date filter (simplified - in real implementation, you'd filter by actual dates)
    // For now, just show/hide based on selection

    if (showItem) {
      item.show();
    } else {
      item.hide();
    }
  });
}

// Utility function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
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
window.saveProfile = saveProfile;
window.changePassword = changePassword;
window.filterActivity = filterActivity;
