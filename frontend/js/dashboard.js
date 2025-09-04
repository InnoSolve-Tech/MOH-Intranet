// Dashboard functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dashboard
  initializeDashboard();

  // Add event listeners
  setupEventListeners();
});

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
  // Inject navigation first
  injectNavigation();

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
  if (confirm("Are you sure you want to logout?")) {
    // Clear local/session storage
    localStorage.removeItem("userSession");
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "") // trim leading spaces
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });

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

function filterMenuItems(user) {
  // Define all available menu items
  const allMenuItems = [
    {
      key: "admin-dashboard",
      page: "admin-dashboard",
      href: "admin-dashboard.html",
      icon: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>`,
      title: "Admin Dashboard",
    },
    {
      key: "user-dashboard",
      page: "user-dashboard",
      href: "user-dashboard.html",
      icon: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>`,
      title: "Dashboard",
    },
    {
      key: "partners",
      page: "partners",
      href: "partners.html",
      icon: `<path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 7c-.8 0-1.54.5-1.85 1.26l-1.92 5.77c-.24.71.11 1.49.81 1.73.71.24 1.49-.11 1.73-.81L16.5 12H18v10h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-2C3.57 8 2.5 9.57 2.5 11.5V22h2v-6h2v6h2v-10.5C8.5 9.57 7.43 8 6 8z"/>`,
      title: "Partners",
    },
    {
      key: "partner-profile",
      page: "partner-profile",
      href: "partner-profile.html",
      icon: `<path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>`,
      title: "Partner Profile",
    },
    {
      key: "users",
      page: "users",
      href: "users.html",
      icon: `<path d="M16 13c1.66 0 2.99-1.34 2.99-3S17.66 7 16 7s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 7 8 7 5 8.34 5 10s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-1.5c0-2.33-4.67-3.5-7-3.5z"/>`,
      title: "Users",
    },
    {
      key: "user-profile",
      page: "user-profile",
      href: "user-profile.html",
      icon: `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>`,
      title: "User Profile",
    },
    {
      key: "settings",
      page: "settings",
      href: "settings.html",
      icon: `<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>`,
      title: "Settings",
    },
  ];

  // Return filtered menu items based on user permissions
  if (!user) {
    // If no user data, show minimal access
    return allMenuItems.filter((item) =>
      ["user-dashboard", "partner-profile", "user-profile"].includes(item.key),
    );
  }

  // Check if user is admin (can see everything)
  if (user.roles && user.roles.role_name === "admin") {
    return allMenuItems.filter(
      (item) => !["partner-profile", "user-dashboard"].includes(item.key),
    );
  }

  // Check scope-based filtering
  if (user.scope === "individual") {
    return allMenuItems.filter((item) =>
      ["user-dashboard", "partner-profile", "user-profile"].includes(item.key),
    );
  }

  // For other roles, filter based on role functions if available
  if (user.roles && user.roles.function && Array.isArray(user.roles.function)) {
    const allowedFunctions = user.roles.function;
    const filteredItems = allMenuItems.filter((item) => {
      // Always allow profile pages
      if (["user-profile"].includes(item.key)) {
        return true;
      }
      // Check if the menu item key is in allowed functions
      return allowedFunctions.includes(item.key);
    });
    return filteredItems;
  }

  // Default fallback - show only profile pages
  return allMenuItems.filter((item) =>
    ["partner-profile", "user-profile"].includes(item.key),
  );
}

function generateSidebarNavigation(user) {
  const filteredMenuItems = filterMenuItems(user);

  const menuItemsHtml = filteredMenuItems
    .map(
      (item) => `
    <li class="menu-item" data-page="${item.page}">
      <a href="${item.href}">
        <span class="menu-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            ${item.icon}
          </svg>
        </span>
        <span class="menu-text">${item.title}</span>
      </a>
    </li>
  `,
    )
    .join("");

  return `
    <nav class="sidebar">
      <div class="sidebar-header">
        <center>
          <img
            src="../images/logo.png"
            width="100"
            height="100"
            alt="MoH logo"
          />
        </center>
      </div>
      <ul class="sidebar-menu">
        ${menuItemsHtml}
      </ul>

      <div class="sidebar-footer">
        <button class="logout-btn" onclick="logout()">
          <span class="menu-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 
          2.58L17 17l5-5zM4 5h8V3H4c-1.1 
          0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
              />
            </svg>
          </span>
          <span class="menu-text">Logout</span>
        </button>
      </div>
    </nav>
  `;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function injectNavigation() {
  let user;
  try {
    const user_uuid = getCookie("user_uuid");
    const response = await fetch(`/api/v1/users/${user_uuid}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    user = res.user;
  } catch (e) {
    console.error("Error fetching user data:", e);
    // Continue with null user - will show minimal navigation
  }

  const navContainer = document.getElementById("sidebar-container");
  if (navContainer) {
    navContainer.innerHTML = generateSidebarNavigation(user);

    // Set active menu item based on current page
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");
    setActiveMenuItem(currentPage);
  }
}
