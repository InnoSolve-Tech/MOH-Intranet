// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication first
  // Initialize dashboard
  initializeDashboard();

  // Add event listeners
  setupEventListeners();
});

function checkAuthentication() {
  const userSession = localStorage.getItem("userSession");

  if (userSession) {
    // No session found, redirect to login
    window.location.href = "/";
    return false;
  }

  try {
    const session = JSON.parse(userSession);

    // Check if session is still valid (optional: implement session timeout)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const sessionDuration = (now - loginTime) / (1000 * 60); // minutes

    if (sessionDuration > 480) {
      // 8 hours session timeout
      localStorage.removeItem("userSession");
      alert("Your session has expired. Please login again.");
      window.location.href = "/";
      return false;
    }

    // Update user info in header
    updateUserInfo(session);
    return true;
  } catch (error) {
    console.error("Invalid session data:", error);
    localStorage.removeItem("userSession");
    window.location.href = "/";
    return false;
  }
}

function updateUserInfo(session) {
  const userInfoElement = document.querySelector(".user-info");
  if (userInfoElement) {
    userInfoElement.innerHTML = `
      <span>Welcome, ${session.name}</span>
      <small style="display: block; font-size: 0.8rem; color: #95a5a6;">${session.role}</small>
    `;
  }
}

function initializeDashboard() {
  // Load dashboard data
  loadDashboardStats();

  // Set active menu item
  setActiveMenuItem();
}

function setupEventListeners() {
  // Menu item clicks
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      if (this.dataset.page === "overview") {
        e.preventDefault();
        setActiveMenuItem("overview");
      }
    });
  });

  // Mobile menu toggle (for responsive design)
  setupMobileMenu();
}

function setActiveMenuItem(page = "overview") {
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });
}

function loadDashboardStats() {
  // Simulate loading dashboard statistics
  // In a real application, this would fetch data from an API
  const stats = {
    totalPartners: 24,
    systemUsers: 12,
    recentRegistrations: 5,
    activeMous: 18,
  };

  // Update the dashboard cards with real data
  updateDashboardCards(stats);
}

function updateDashboardCards(stats) {
  const cards = document.querySelectorAll(".card-number");
  if (cards.length >= 4) {
    cards[0].textContent = stats.totalPartners;
    cards[1].textContent = stats.systemUsers;
    cards[2].textContent = stats.recentRegistrations;
    cards[3].textContent = stats.activeMous;
  }
}

function setupMobileMenu() {
  // Add mobile menu toggle functionality
  const sidebar = document.querySelector(".sidebar");

  // Create mobile menu button
  if (window.innerWidth <= 480) {
    createMobileMenuButton();
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    if (
      window.innerWidth <= 480 &&
      !document.querySelector(".mobile-menu-btn")
    ) {
      createMobileMenuButton();
    } else if (window.innerWidth > 480) {
      const mobileBtn = document.querySelector(".mobile-menu-btn");
      if (mobileBtn) {
        mobileBtn.remove();
      }
      sidebar.classList.remove("open");
    }
  });
}

function createMobileMenuButton() {
  const header = document.querySelector(".content-header");
  const mobileBtn = document.createElement("button");
  mobileBtn.className = "mobile-menu-btn";
  mobileBtn.innerHTML = "☰";
  mobileBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px;
        color: #2c3e50;
    `;

  mobileBtn.addEventListener("click", () => {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("open");
  });

  header.insertBefore(mobileBtn, header.firstChild);
}

function logout() {
  // Handle logout functionality
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("userSession");
    sessionStorage.clear();

    // Show logout message
    alert("You have been logged out successfully.");

    // Redirect to login page
    window.location.href = "/";
  }
}

// Utility functions for other pages to use
function showNotification(message, type = "info") {
  // Create and show notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        transition: all 0.3s ease;
    `;

  // Set background color based on type
  const colors = {
    info: "#3498db",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  };
  notification.style.backgroundColor = colors[type] || colors.info;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 300);
}
