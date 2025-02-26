import { createBrowserRouter, Outlet } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import Projects from "../pages/Projects";
import Dashboard from "../pages/Dashboard";
import CreatePost from "../pages/CreatePost";
import UpdaetPost from "../pages/UpdatePost";
import PostPage from "../pages/PostPage";
import Search from "../pages/Search";
import Header from "../components/Header/Header";
import FooterCom from "../components/Footer/Footer";
import ScrollToTop from "../components/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import Checkout from "../pages/Checkout";
import GetAllProducts from "../pages/GetAllproduct";
import Test from "../pages/Test";
import ProductDetail from "../pages/ProductDetail";

import Blog from "../pages/Blog Page/Blog";

const Layout = () => {
  return (
    <div>
      <ScrollToTop />
      <div>
        <Header />
      </div>
      <div className="min-h-screen pt-16">
        <Outlet />
      </div>
      <FooterCom />
    </div>
  );
};

// Error boundary for route errors
const ErrorBoundary = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Oops!</h1>
      <p>Sorry, an unexpected error has occurred. 000 </p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-post",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <CreatePost />
          </ProtectedRoute>
        ),
      },
      {
        path: "update-post/:postId",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <UpdaetPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "post/:postSlug",
        element: <PostPage />,
      },
      {
        path: "product/:productId",
        element: <ProductDetail />,
      },
    ],
  },
  {
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "sign-up",
    element: <SignUp />,
  },
  {
    path: "test",
    element: <Test />,
  },
  {
    path: "getallproduct",
    element: <GetAllProducts />,
  },
  // {
  //   path: "payment/:orderId",
  //   element: <PaymentPage />,
  // },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
]);

export default router;
