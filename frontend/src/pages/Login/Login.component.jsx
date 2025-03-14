import React, { useState } from "react";
import "./Login.scss";
import api from "../../config/axios";
import koiLogo from "../../assets/koilogo.png";
import koiBackground from "../../assets/koibackground.jpg";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });
      console.log(response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usertype", response.data.user.usertype);
        localStorage.setItem("userId", response.data.user.userId);
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));

        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Login failed. Token not found.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your username or password.";
      toast.error(message); // Display the error message from the backend
      console.error("Error during login:", message);
    } finally {
      setPassword(""); // Clear the password field
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${koiBackground})` }}
    >
      <div className="login-box">
        <div className="logo-section">
          <img src={koiLogo} alt="Koi Logo" className="logo" />
        </div>
        <div className="form-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <p>Login to access your account</p>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*********"
                required
              />
            </div>
            <div className="login-options">
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
            <div className="alternative-login">
              <p>Or</p>
              <button className="google-login">Login with Google</button>
            </div>
            <div className="signup">
              <p>
                Don't have an account? <Link to="/Sign-in">Register!</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
