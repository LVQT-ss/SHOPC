import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userType = localStorage.getItem("usertype");

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};

export default ProtectedRoute;
