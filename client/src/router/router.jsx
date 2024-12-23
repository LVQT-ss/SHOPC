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
import Header from "../components/Header";
import FooterCom from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";

const Layout = () => {
  return (
    <div>
      <ScrollToTop />
      <Header />
      <Outlet />
      <FooterCom />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
        path: "/search",
        element: <Search />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-post",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreatePost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/update-post/:postId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UpdaetPost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/projects",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "/post/:postSlug",
        element: <PostPage />,
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
]);

export default router;
