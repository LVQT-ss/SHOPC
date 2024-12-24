import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { login } from "../Utils/ApiFunctions";
import OAuth from "../components/OAuth";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    // Validate form inputs
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      dispatch(signInStart()); // Set loading to true
      const data = await login({
        username: formData.email,
        password: formData.password,
      });
      dispatch(signInSuccess(data)); // Set loading to false and update user data
      navigate("/");
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with an error
        dispatch(
          signInFailure(error.response.data.message || "Invalid credentials")
        );
        setError(error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        // No response received
        dispatch(signInFailure("Network error. Please try again."));
        setError("Network error. Please try again.");
      } else {
        // Something else went wrong
        dispatch(signInFailure("An unexpected error occurred"));
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              anhempc
            </span>
            PRO
          </Link>
          <p className="text-sm mt-5">ĐĂNG NHẬP</p>
        </div>

        <div className="flex-1">
          {error && (
            <Alert
              className="mb-4"
              color="failure"
              onDismiss={() => setError(null)}
            >
              <span className="font-medium">Error!</span> {error}
            </Alert>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Username" />
              <TextInput
                type="text"
                placeholder="Tên đăng nhập hoặc số điện thoại"
                id="email"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                type="password"
                placeholder="**********"
                id="password"
                onChange={handleChange}
                autoComplete="on"
                disabled={loading}
              />
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Dont Have an account?</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
