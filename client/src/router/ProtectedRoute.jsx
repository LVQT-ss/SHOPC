import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { currentUser } = useSelector((state) => state.user);

  // If no user is logged in, redirect to sign-in
  if (!currentUser || !currentUser.user) {
    return <Navigate to="/sign-in" />;
  }

  // Check if user's type matches allowed roles
  if (!allowedRoles.includes(currentUser.user.usertype)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
