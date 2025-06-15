const Sidebar = ({
  isMobile,
  sidebarOpen,
  menuItems,
  handleMenuClick,
  openSubmenus,
  activeMenu,
  toggleSubmenu,
}) => {
  return (
    <div
      className="position-fixed h-100 bg-white shadow-lg d-flex flex-column"
      style={{
        width: "280px",
        top: isMobile ? "0" : "70px",
        left: 0,
        zIndex: 1040,
        transform: isMobile
          ? sidebarOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "translateX(0)",
        transition: "transform 0.3s ease",
        visibility: isMobile && !sidebarOpen ? "hidden" : "visible",
      }}
    >
      {/* Sidebar Content */}
      <div
        className="flex-grow-1 overflow-auto"
        style={{ paddingTop: "20px", paddingBottom: "20px" }}
      >
        <nav className="px-3">
          {/* Menu Items */}
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {/* Main Menu Item */}
              <a
                href={item.href || "#"}
                className={`nav-link d-flex align-items-center justify-content-between text-decoration-none px-3 py-3 rounded-2 position-relative ${
                  activeMenu === item.id ? "active-menu" : ""
                }`}
                style={{
                  backgroundColor: "transparent",
                  color: activeMenu === item.id ? "#4facfe" : "#6b7280",
                  fontWeight: activeMenu === item.id ? "600" : "500",
                  transition: "all 0.2s ease",
                  marginBottom: "4px",
                  borderRight:
                    activeMenu === item.id
                      ? "3px solid #4facfe"
                      : "3px solid transparent",
                }}
                onClick={(e) => {
                  if (item.submenu) {
                    e.preventDefault();
                    toggleSubmenu(item.id);
                  } else {
                    // Clear any existing hover styles before setting active
                    const allMenus = document.querySelectorAll(".nav-link");
                    allMenus.forEach((menu) => {
                      if (!menu.classList.contains("active-menu")) {
                        menu.style.backgroundColor = "transparent";
                      }
                    });
                    handleMenuClick(item.id);
                  }
                }}
                onMouseEnter={(e) => {
                  if (activeMenu !== item.id) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMenu !== item.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="me-3 d-flex align-items-center justify-content-center"
                    style={{ width: "18px" }}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      color: activeMenu === item.id ? "#4facfe" : "#9ca3af",
                      transition: "transform 0.2s ease",
                      transform: openSubmenus.includes(item.id)
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                )}
              </a>

              {/* Submenu */}
              {item.submenu && openSubmenus.includes(item.id) && (
                <div className="ms-4 mt-2">
                  {item.submenu.map((subItem) => (
                    <a
                      key={subItem.id}
                      href={subItem.href}
                      className={`nav-link d-flex align-items-center text-decoration-none px-3 py-2 rounded-2 ${
                        activeMenu === subItem.id ? "active" : ""
                      }`}
                      style={{
                        backgroundColor: "transparent",
                        color:
                          activeMenu === subItem.id ? "#4facfe" : "#9ca3af",
                        fontSize: "14px",
                        fontWeight: activeMenu === subItem.id ? "600" : "400",
                        transition: "all 0.2s ease",
                        marginBottom: "2px",
                        borderRight:
                          activeMenu === subItem.id
                            ? "2px solid #4facfe"
                            : "2px solid transparent",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        const allSubmenus =
                          document.querySelectorAll(".nav-link");
                        allSubmenus.forEach((menu) => {
                          if (!menu.classList.contains("active-menu")) {
                            menu.style.backgroundColor = "transparent";
                          }
                        });
                        handleMenuClick(subItem.id);
                      }}
                      onMouseEnter={(e) => {
                        if (activeMenu !== subItem.id) {
                          e.currentTarget.style.backgroundColor = "#f1f5f9";
                          e.currentTarget.style.color = "#64748b";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeMenu !== subItem.id) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#9ca3af";
                        }
                      }}
                    >
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{ width: "18px" }}
                      >
                        <svg
                          width="6"
                          height="6"
                          viewBox="0 0 6 6"
                          fill="currentColor"
                        >
                          <circle cx="3" cy="3" r="3" />
                        </svg>
                      </div>
                      <span>{subItem.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
