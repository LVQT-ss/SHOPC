import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

import SignUp from "./pages/SignUp.jsx";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard.jsx";
import Header from "./components/Header.jsx";
import FooterCom from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute.jsx";
import UpdaetPost from "./pages/UpdatePost.jsx";
import PostPage from "./pages/PostPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Search from "./pages/Search.jsx";
import SignIn from './pages/SignIn.jsx';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:postId" element={<UpdaetPost />} />
        </Route>

        <Route path="/projects" element={<Projects />} />
        <Route path="/post/:postSlug" element={<PostPage />} />
      </Routes>
      <FooterCom />
    </BrowserRouter>
  );
}

export default App;
