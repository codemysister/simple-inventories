import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import menuItems from "../../constants/SidebarMenu";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "../../contexts/AuthContext";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("activeMenu") || "dashboard"
  );
  const [openSubmenus, setOpenSubmenus] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
      // Auto close sidebar when switching to mobile
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      // Close profile dropdown when clicking outside
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Close profile dropdown when sidebar is opened
    if (!sidebarOpen) {
      setProfileDropdownOpen(false);
    }
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    // Close sidebar when profile dropdown is opened on mobile
    if (!profileDropdownOpen && isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    localStorage.setItem("activeMenu", menuId);
    // Close sidebar on mobile when menu item is clicked
    if (isMobile) {
      setSidebarOpen(false);
    }

    // Reset any stuck hover styles
    setTimeout(() => {
      const allMenuItems = document.querySelectorAll(".nav-link");
      allMenuItems.forEach((item) => {
        if (!item.classList.contains("active-menu")) {
          item.style.backgroundColor = "transparent";
        }
      });
    }, 50);
  };

  // Reset all hover states when active menu changes
  useEffect(() => {
    const resetMenuStyles = () => {
      const allMenuLinks = document.querySelectorAll(".nav-link");
      allMenuLinks.forEach((link) => {
        const isActiveMenu =
          link.querySelector("span")?.textContent ===
            menuItems.find((item) => item.id === activeMenu)?.label ||
          menuItems
            .flatMap((item) => item.submenu || [])
            .find((sub) => sub.id === activeMenu)?.label;

        if (!isActiveMenu) {
          link.style.backgroundColor = "transparent";
          link.style.color = link.closest(".ms-4") ? "#9ca3af" : "#6b7280";
        }
      });
    };

    resetMenuStyles();
  }, [activeMenu, menuItems]);

  // Clear hover styles when activeMenu changes
  useEffect(() => {
    const allMenuItems = document.querySelectorAll(".nav-link");
    allMenuItems.forEach((item) => {
      if (!item.classList.contains("active-menu")) {
        item.style.backgroundColor = "transparent";
      }
    });
  }, [activeMenu]);

  const toggleSubmenu = (submenuId) => {
    if (openSubmenus.includes(submenuId)) {
      setOpenSubmenus(openSubmenus.filter((id) => id !== submenuId));
    } else {
      setOpenSubmenus([...openSubmenus, submenuId]);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8fafc" }}>
      {/* Navbar */}
      <Navbar
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        toggleProfileDropdown={toggleProfileDropdown}
        profileDropdownOpen={profileDropdownOpen}
      />

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && isMobile && (
        <div
          className="position-fixed w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
            top: 0,
            left: 0,
          }}
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        menuItems={menuItems}
        openSubmenus={openSubmenus}
        sidebarOpen={sidebarOpen}
        activeMenu={activeMenu}
        handleMenuClick={handleMenuClick}
        toggleSubmenu={toggleSubmenu}
      />

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: isMobile ? "0" : "280px",
          marginTop: "70px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="container-fluid p-4">
          {/* Content Area */}
          <div className="row">
            <div className="col-12">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
