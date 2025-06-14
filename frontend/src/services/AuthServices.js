import apiInterceptor from "./ApiInterceptor";

const login = async (email, password) => {
  const response = await apiInterceptor.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

const getUser = async () => {
  const response = await apiInterceptor.get("/user");
  return response.data;
};

const logout = async () => {
  const response = await apiInterceptor.post("/auth/logout");
  return response.data;
};

export default {
  login,
  logout,
  getUser,
};
