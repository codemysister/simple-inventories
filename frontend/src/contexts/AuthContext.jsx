import React, { createContext, useContext, useState, useEffect } from "react";
import AuthServices from "../services/AuthServices";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setIsLoading((prev) => (prev = true));

        try {
          let response = await AuthServices.getUser();
          if (response) {
            setUser(response);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setIsLoading((prev) => (prev = false));
        }
      }
    };

    fetchUser();
  }, [token]);

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
