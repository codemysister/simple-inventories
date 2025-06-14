import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import menuItems from "../../constants/SidebarMenu";
import { Outlet } from "react-router-dom";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [openSubmenus, setOpenSubmenus] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  React.useEffect(() => {
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
      <nav
        className="navbar navbar-expand-lg fixed-top bg-white shadow-sm"
        style={{
          height: "70px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="container-fluid px-4">
          {/* Sidebar Toggle */}
          <button
            className={`btn ${isMobile ? "d-block" : "d-none"} me-3`}
            type="button"
            onClick={toggleSidebar}
            style={{
              fontSize: "18px",
              color: "#6b7280",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>{" "}
          </button>

          {/* Brand */}
          <a
            className="navbar-brand text-dark fw-bold d-flex align-items-center gap-2"
            href="#"
            style={{ fontSize: "22px" }}
          >
            Dashboard
          </a>

          {/* Spacer */}
          <div className="flex-grow-1"></div>

          {/* Profile Dropdown */}
          <div className="position-relative profile-dropdown">
            <button
              className="btn d-flex align-items-center border-0 bg-transparent"
              type="button"
              onClick={toggleProfileDropdown}
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                transition: "all 0.2s ease",
                color: "#6b7280",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "32px",
                  height: "32px",
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                }}
              >
                <i
                  className="fas fa-user text-white"
                  style={{ fontSize: "14px" }}
                ></i>
              </div>
              <span className="fw-semibold me-2">John Doe</span>
              <i
                className={`fas fa-chevron-${
                  profileDropdownOpen ? "up" : "down"
                }`}
                style={{ fontSize: "12px" }}
              ></i>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border-0"
                style={{
                  minWidth: "200px",
                  zIndex: 1050,
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div className="p-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      }}
                    >
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">John Doe</div>
                      <div className="small text-muted">john@example.com</div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <a
                    href="#"
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-decoration-none"
                    style={{ transition: "all 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <i
                      className="fas fa-user-edit me-3"
                      style={{ color: "#6b7280", width: "16px" }}
                    ></i>
                    <span className="text-dark">Edit Profile</span>
                  </a>
                  <a
                    href="#"
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-decoration-none"
                    style={{ transition: "all 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <i
                      className="fas fa-cog me-3"
                      style={{ color: "#6b7280", width: "16px" }}
                    ></i>
                    <span className="text-dark">Account Settings</span>
                  </a>
                  <hr className="my-2" />
                  <a
                    href="#"
                    className="dropdown-item d-flex align-items-center px-3 py-2 text-decoration-none"
                    style={{ transition: "all 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#fef2f2")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <i
                      className="fas fa-sign-out-alt me-3"
                      style={{ color: "#ef4444", width: "16px" }}
                    ></i>
                    <span style={{ color: "#ef4444" }}>Logout</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

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
