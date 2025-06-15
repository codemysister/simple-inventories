import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import AuthServices from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginErrors] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data, e) => {
    e.preventDefault();
    setIsLoading((prev) => (prev = true));
    try {
      const response = await AuthServices.login(data.email, data.password);
      login(response.token);
      localStorage.setItem("activeMenu", "dashboard");
      navigate("/dashboard");
    } catch (err) {
      setLoginErrors((prev) => (prev = err.response.data.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div
              className="card border-0 shadow-lg overflow-hidden"
              style={{
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Card Header */}
              <div className="card-header bg-transparent border-0 text-center pt-5 pb-2">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: "72px",
                    height: "72px",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    borderRadius: "18px",
                    boxShadow: "0 8px 32px rgba(79, 172, 254, 0.3)",
                  }}
                >
                  <i className="fas fa-user-circle text-white fs-3"></i>
                </div>
                <h1 className="h3 fw-bold text-dark mb-2">Welcome Back</h1>
                <p className="text-muted small mb-0">
                  Sign in to continue to your dashboard
                </p>

                {loginError && (
                  <p className="text-danger small mt-2 mb-0">{loginError}</p>
                )}
              </div>

              {/* Card Body */}
              <div className="card-body px-5 pb-5 pt-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="form-label text-start fw-semibold text-dark small mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control border-2"
                      id="email"
                      name="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      placeholder="Enter your email"
                      style={{
                        borderColor: "#e2e8f0",
                        fontSize: "15px",
                        height: "50px",
                      }}
                    />
                    {errors.email && (
                      <div className="text-danger mt-2 d-flex align-items-center small">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-dark small mb-2"
                    >
                      Password
                    </label>
                    <input
                      type={"password"}
                      className="form-control border-2"
                      id="password"
                      name="password"
                      {...register("password", {
                        required: "Password is required",
                      })}
                      placeholder="Enter your password"
                      style={{
                        borderColor: "#e2e8f0",
                        fontSize: "15px",
                        height: "50px",
                      }}
                    />
                    {errors.password && (
                      <div className="text-danger mt-2 d-flex align-items-center small">
                        <i className="bi bi-exclamation-circle-fill me-1"></i>
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  {/* Login Button */}
                  <div className="d-grid gap-2 mb-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn text-white fw-semibold border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        height: "50px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 15px rgba(79, 172, 254, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(79, 172, 254, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(79, 172, 254, 0.3)";
                      }}
                    >
                      {isLoading ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
