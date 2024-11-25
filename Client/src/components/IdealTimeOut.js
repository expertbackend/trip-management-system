import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IdleTimeout = ({ children }) => {
  const navigate = useNavigate();
  let logoutTimer;

  useEffect(() => {
    const handleActivity = () => {
      // Reset the timer on any activity
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    const handleLogout = () => {
      alert("You have been logged out due to inactivity.");
      localStorage.clear(); // Clear all session data
      navigate("/login"); // Redirect to login page
    };

    // Add event listeners to detect activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Set the initial timer
    handleActivity();

    return () => {
      // Cleanup event listeners and timers
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [navigate]);

  return children;
};

export default IdleTimeout;
