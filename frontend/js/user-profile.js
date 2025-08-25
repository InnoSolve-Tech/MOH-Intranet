// User Profile Management
let currentUser = null;

// Declare the $ variable
const $ = window.jQuery;

// Initialize user profile page
$(document).ready(() => {
  loadUserProfile();
  loadActivityLog();
});

// Get cookie utility function
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Load current user profile data
async function loadUserProfile() {
  try {
    const user_uuid = getCookie("user_uuid");
    if (!user_uuid) {
      throw new Error("User UUID not found in cookies");
    }

    const response = await fetch(`/api/v1/users/${user_uuid}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    currentUser = res.user;

    populateUserInfo(currentUser);
  } catch (error) {
    console.error("Error loading user profile:", error);
    showNotification("Failed to load user profile", "error");

    // Set loading indicators to show error state
    $("#userName").text("Error loading profile");
    $("#userRole").text("Error");
  }
}

// Populate user information in the form
function populateUserInfo(user) {
  // Header information - using only available fields
  $("#userName").text(user.username || "Unknown User");
  $("#userRole").text(user.roles ? user.roles.role_name : "User");

  // Account information form - only map available fields
  $("#firstName").val(""); // Not available in user object
  $("#lastName").val(""); // Not available in user object
  $("#username").val(user.username || "");
  $("#email").val(""); // Not available in user object
  $("#phone").val(""); // Not available in user object
  $("#department").val(user.scope || "");
  $("#bio").val(""); // Not available in user object

  // Set user status
  $("#userStatus").text("Active");

  // Display user info in a read-only manner since most fields aren't available
  showUserLimitations();
}

// Show limitations message for unavailable fields
function showUserLimitations() {
  // Add placeholder text to unavailable fields
  $("#firstName").attr("placeholder", "Not available in current user data");
  $("#lastName").attr("placeholder", "Not available in current user data");
  $("#email").attr("placeholder", "Not available in current user data");
  $("#phone").attr("placeholder", "Not available in current user data");
  $("#bio").attr("placeholder", "Not available in current user data");

  // Make unavailable fields readonly
  $("#firstName, #lastName, #email, #phone, #bio").prop("readonly", true);
}

// Load activity log - simplified since no specific activity endpoint mentioned
async function loadActivityLog() {
  try {
    // Since there's no specific activity endpoint mentioned,
    // we'll show a message or try a generic endpoint
    const response = await fetch("/api/v1/user/activity");
    if (!response.ok) {
      // If activity endpoint doesn't exist, show empty state
      populateActivityLog([]);
      return;
    }

    const activities = await response.json();
    populateActivityLog(activities);
  } catch (error) {
    console.error("Activity log not available:", error);
    // Show empty activity log instead of mock data
    populateActivityLog([]);
  }
}

// Populate activity log
function populateActivityLog(activities) {
  const activityList = $("#activityList");
  activityList.empty();

  if (activities.length === 0) {
    activityList.append(`
      <div class="activity-item">
        <div class="activity-content">
          <div class="activity-title">No activity found</div>
          <div class="activity-description">Your recent activity will appear here when available</div>
        </div>
      </div>
    `);
    return;
  }

  activities.forEach((activity) => {
    const timeAgo = getTimeAgo(
      new Date(activity.timestamp || activity.CreatedAt),
    );
    const activityItem = $(`
      <div class="activity-item" data-type="${activity.type || "general"}">
        <div class="activity-icon">${activity.icon || "📝"}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title || "Activity"}</div>
          <div class="activity-description">${activity.description || "Activity description"}</div>
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

// Save profile changes - only save available fields
async function saveProfile() {
  if (!currentUser) {
    showNotification("User data not loaded", "error");
    return;
  }

  // Only include fields that are actually available in the user object
  const profileData = {
    username: $("#username").val(), // Available but likely shouldn't be changed
    scope: $("#department").val(), // Available field
    // Note: Most other fields are not available in the current user object
  };

  // Show warning about limited updateable fields
  if (
    $("#firstName").val() ||
    $("#lastName").val() ||
    $("#email").val() ||
    $("#phone").val() ||
    $("#bio").val()
  ) {
    showNotification(
      "Note: Only username and scope can be updated with current user data structure",
      "warning",
    );
  }

  try {
    const user_uuid = getCookie("user_uuid");
    const response = await fetch(`/api/v1/users/${user_uuid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`,
      );
    }

    const updatedUser = await response.json();
    currentUser = updatedUser.user || updatedUser;

    showNotification(
      "Profile updated successfully (limited fields)",
      "success",
    );

    // Update header display with available data
    $("#userName").text(currentUser.username);
  } catch (error) {
    console.error("Error saving profile:", error);
    showNotification(error.message || "Failed to update profile", "error");
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
    const user_uuid = getCookie("user_uuid");
    const response = await fetch(`/api/v1/users/${user_uuid}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`,
      );
    }

    showNotification("Password changed successfully", "success");

    // Clear password fields
    $("#currentPassword").val("");
    $("#newPassword").val("");
    $("#confirmPassword").val("");
  } catch (error) {
    console.error("Error changing password:", error);
    showNotification(error.message || "Failed to change password", "error");
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

    // Date filter implementation would need actual timestamps
    // For now, just show all items when "all" is selected
    if (dateFilter === "all") {
      // Show all items regardless of other filters if "all time" is selected
      if (typeFilter === "all") {
        showItem = true;
      }
    }

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
    <div class="notification ${type}" style="
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      z-index: 1000;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateX(100%);
    ">
      <span>${message}</span>
    </div>
  `);

  // Set background color based on type
  const colors = {
    info: "#3498db",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  };
  notification.css("background-color", colors[type] || colors.info);

  // Add to page
  $("body").append(notification);

  // Show notification
  setTimeout(() => {
    notification.css({
      opacity: "1",
      transform: "translateX(0)",
    });
  }, 100);

  // Auto-hide after 4 seconds for warnings, 3 seconds for others
  const hideDelay = type === "warning" ? 4000 : 3000;
  setTimeout(() => {
    notification.css({
      opacity: "0",
      transform: "translateX(100%)",
    });
    setTimeout(() => notification.remove(), 300);
  }, hideDelay);
}

// Make functions globally accessible
window.showProfileSection = showProfileSection;
window.saveProfile = saveProfile;
window.changePassword = changePassword;
window.filterActivity = filterActivity;
