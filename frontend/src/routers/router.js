import { createBrowserRouter, Outlet } from "react-router-dom";
import Home from "../pages/home/Home.component";
import About from "../pages/About/About";
import Header from "../components/Header/Header.component";
import Footer from "../components/Footer/Footer.component";
import Login from "../pages/Login/Login.component";
import Signup from "../pages/Signup/Signup.component";
import ManageKoi from "../pages/Manage Koi/ManageKoi.component";
import Profile from "../pages/Profile/Profile.component";
import MyKoi from "../pages/My Koi/MyKoi.component";
import MyPond from "../pages/My Pond/MyPond.component";
import WaterParameters from "../pages/Water Parameters/WaterParameters.component";
import PondProfile from "../pages/Pond Profile/PondProfile.component";
import ManageHome from "../pages/ManageAccount/ManageHome";
import MyKoiProfile from "../pages/My Koi Profile/MyKoiProfile.component";
import Shop from "../pages/Shop/Shop";
import RecommendationsList from "../pages/Recommendations/RecommendationsList.component";
import RecommendationsProducts from "../pages/Recommendations/RecommendationsProducts.component";
import ProtectedRoute from "./ProtectedRoute";
import BlogManagement from "../pages/Blog/BlogManagement.component";
import BlogList from "../pages/Blog/Blog List/BlogList.component";
import ProductDetails from "../pages/Product/ProductDetails";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.component";
import ResetPassword from "../pages/ResetPassword/ResetPassword.component";
import BlogDetail from "../pages/Blog/Blog List/BlogDetail.component";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        {/* <Header /> */}
        <Outlet />
        {/* <Footer /> */}
      </div>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/manage-koi",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer"]}
          >
            <ManageKoi />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/my-koi",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer"]}
          >
            <MyKoi />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/my-koi/:id",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer", "Admin", "Manager", "Staff"]}
          >
            <MyKoiProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/my-pond",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer", "Admin", "Manager", "Staff"]}
          >
            <MyPond />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/water-parameters",
        element: (
          <ProtectedRoute allowedRoles={["Customer", "Admin", "Manager"]}>
            <WaterParameters />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer", "Admin", "Manager", "Staff"]}
          >
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ShopCenter",
        element: <Shop />,
      },
      {
        path: "/pond-profile/:id",
        element: (
          <ProtectedRoute
            allowedRoles={["Customer", "Admin", "Manager", "Staff"]}
          >
            <PondProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ManageWorkplace",
        element: (
          <ProtectedRoute allowedRoles={["Admin", "Manager", "Staff"]}>
            <ManageHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/recommendations",
        element: (
          <ProtectedRoute allowedRoles={["Customer", "Manager", "Staff"]}>
            <RecommendationsList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manage-koi/recommendations/:id",
        element: (
          <ProtectedRoute allowedRoles={["Customer", "Manager", "staff"]}>
            <RecommendationsProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/BlogManagement",
        element: (
          <ProtectedRoute allowedRoles={["Admin", "Manager", "Staff"]}>
            <BlogManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/blog",
        element: <BlogList />,
      },
      {
        path: "/blog/:id",
        element: <BlogDetail />,
      },
      {
        path: "/productDetails/:id",
        element: (
          <ProtectedRoute allowedRoles={["Manager", "Staff"]}>
            <ProductDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },

  {
    path: "/Sign-in",
    element: <Signup />,
  },
]);
