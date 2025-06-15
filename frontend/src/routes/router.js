import { Children } from "react";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import Product from "../pages/products/Product";
import StockMovement from "../pages/stock-movement/StockMovement";

const routes = [
  {
    path: "/auth/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <Product />,
      },
      {
        path: "stock-movements",
        element: <StockMovement />,
      },
    ],
  },
];

export default routes;
