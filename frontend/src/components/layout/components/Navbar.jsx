import { useAuth } from "../../../contexts/AuthContext";
import AuthServices from "../../../services/AuthServices";

const Navbar = ({
  isMobile,
  toggleSidebar,
  toggleProfileDropdown,
  profileDropdownOpen,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await AuthServices.logout();
    logout();
  };

  return (
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
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <i
                className="fas fa-user text-white"
                style={{ fontSize: "14px" }}
              ></i>
            </div>
            <span className="fw-semibold me-2">{user?.name ?? "-"}</span>
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
                    <div className="fw-semibold text-dark">
                      {user?.name ?? "-"}
                    </div>
                    <div className="small text-muted">{user?.email ?? "-"}</div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleLogout}
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
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
