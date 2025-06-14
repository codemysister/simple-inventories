import { Children } from "react";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

const routes = [
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ],
  },
];

export default routes;
