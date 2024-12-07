import React, { useState, useEffect, useRef } from "react";
import { FaBullhorn, FaSpeakerDeck, FaTruck, FaUserTie } from "react-icons/fa";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaEnvelope,
  FaCar,
  FaUsers,
  FaDollarSign,
  FaFileAlt,
  FaClipboardList,
  FaCheckCircle,
  FaCalendarAlt,
  FaGasPump,
  FaTaxi,
  FaCarAlt,
  FaChevronDown,
  FaChevronUp,
  FaTruckPickup,
  FaCoins,
  FaEye,
  FaTicketAlt,
  FaPlus,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { AiFillSetting, AiOutlineFolderView } from "react-icons/ai";
import Avatar from "react-avatar";
function Sidebar({ role, notifications, username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false); // State for the "Expenses" submenu
  const [isBookingOpen, setIsBookingOpen] = useState(false); // State for the "Booking" submenu

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setActiveLink("profile");
  };
  useEffect(() => {
    // Check for token in localStorage when the sidebar loads
    const token = localStorage.getItem("token");

    if (!token) {
      // If no token, redirect to login page
      navigate("/login");
    } else {
      // If token exists, check for active link
      const savedLink = localStorage.getItem("activeLink");
      if (savedLink) {
        setActiveLink(savedLink);
      } else {
        setActiveLink("home");
      }
    }
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("activeLink");
    navigate("/login");
  };

  const toggleExpenses = () => {
    setIsExpensesOpen(!isExpensesOpen);
  };

  const toggleBooking = () => {
    setIsBookingOpen(!isBookingOpen); // Toggle for "Booking" submenu
  };

  useEffect(() => {
    const savedLink = localStorage.getItem("activeLink");
    if (savedLink) {
      setActiveLink(savedLink);
    } else {
      setActiveLink("home");
    }
  }, []);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    localStorage.setItem("activeLink", link);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  // Setiting
  const [isSettingOpen, setSettingOpen] = useState(false);
  const handleSetting = () => {
    setSettingOpen(!isSettingOpen);
  };
  const dropdownRef = useRef(null);

  // const handleSetting = () => {
  //   setIsSettingOpen((prev) => !prev);
  // };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setSettingOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } relative z-10 h-full bg-white text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg  overflow-x-visible border-r-2 `}
    >
      {/* Header Section */}
      <div className="h-full overflow-y-auto p-1">
        <div className="absolute top-0 right-0 left-0 bg-white flex justify-between items-center p-4 z-10">
          <button
            onClick={toggleSidebar}
            className="text-2xl text-blue-800 p-2 rounded-full shadow-md transition-transform transform hover:scale-110"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="relative overflow-y-auto">
            {/* <button
          onClick={toggleNotifications}
          className="flex items-center p-3 rounded-lg transition-colors hover:bg-white hover:text-black"
        >
          <FaEnvelope className="text-xl" />
          {isOpen && <span className="ml-4">Notifications</span>}
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {notifications.length}
            </span>
          )}
        </button> */}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 w-48 bg-gray-800 text-white shadow-lg rounded-md mt-2 p-2 z-10">
                {notifications.length === 0 ? (
                  <p className="text-sm">No notifications</p>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-2 border-b border-gray-700">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-gray-400">
                        {notification.body}
                      </p>
                      <small className="text-xs text-gray-500">
                        {notification.timestamp}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <ul className=" flex flex-col space-y-2 mt-4 overflow-hidden overflow-x-visible">
          {/* Owner */}
          <li
            className={`relative flex items-center p-3 rounded-lg transition-colors ${
              activeLink === "profile"
                ? "bg-blue-600 text-white"
                : "text-black hover:bg-gray-300 hover:text-black"
            }`}
            onClick={handleProfileClick}
          >
            {/* Profile Section */}
            <div className="flex items-center mt-11  overflow-hidden">
              {/* Avatar Image */}
              <Avatar
                name={username}
                size="40"
                round="20px"
                className="shadow-md text-black"
              />
              {/* Username and Role */}
              <div className="ml-4">
                <p className="font-semibold text-black">{username}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
          </li>

          {(role === "owner" || role === "operator") && (
            <>
              <li className="relative group" title="home">
                <Link
                  to="/details"
                  className={`flex  items-center p-3 rounded-lg transition-colors ${
                    activeLink === "home"
                      ? "bg-blue-900 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("home")}
                >
                  <FaHome className="text-xl" />
                  {isOpen && <span className="ml-4">Home</span>}
                </Link>
              </li>
            </>
          )}
          {/* Role-specific Links */}
          {(role === "owner" || role === "operator") && (
            <>
              <li className="relative">
                <Link
                  to="/vehicle"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "vehicle"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("vehicle")}
                >
                  <FaCar className="text-xl" />
                  {isOpen && <span className="ml-4 ">Vehicle</span>}
                </Link>
              </li>
              <li className="relative">
                <Link
                  to="/user"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "user"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("user")}
                >
                  <FaUsers className="text-xl" />
                  {isOpen && <span className="ml-4">User</span>}
                </Link>
              </li>
              <li className="relative">
                <Link
                  to="/fms"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "fms"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("fms")}
                >
                  <FaTruck className="text-xl" />
                  {isOpen && <span className="ml-4">FMS</span>}
                </Link>
              </li>
              {/* Expenses Section - Visible for owner/operator */}
              {(role === "owner" || role === "operator") && (
                <div className="mt-4 border-b-2">
                  <div
                    onClick={toggleExpenses} // Toggle for "Expenses" submenu
                    className={`flex items-center justify-between pb-2  text-black  cursor-pointer   ${
                      isExpensesOpen
                        ? "bg-transparent border-b-2 border-gray-300"
                        : "<p></p>"
                    }`}
                  >
                    <span className="p-2 ">
                      {isOpen ? (
                        isExpensesOpen ? (
                          <span className="flex gap-2 text-base font-normal">
                            <FaCoins className="text-2xl" /> Expenses
                          </span>
                        ) : (
                          <span className="flex gap-2 text-base font-normal">
                            <FaCoins className="text-2xl" /> Expenses
                          </span>
                        )
                      ) : (
                        <FaCoins className="text-2xl" />
                      )}
                    </span>

                    <FaChevronDown
                      className={`text-sm transition-all  duration-300 ease-out ${
                        isExpensesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isExpensesOpen && (
                    <ul className=" overflow-hidden">
                      <li className="relative">
                        <Link
                          to="/add-expense"
                          className={`flex items-center p-3  transition-colors border-b-2 border- ${
                            activeLink === "create-expense"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("create-expense")}
                        >
                          <FaDollarSign className="text-xl" />
                          {isOpen && (
                            <span className="ml-4">Create Expense</span>
                          )}
                        </Link>
                      </li>
                      <li className="relative">
                        <Link
                          to="/view-expense"
                          className={`flex items-center p-3  transition-colors ${
                            activeLink === "view-expense"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("view-expense")}
                        >
                          <FaEye className="text-xl" />
                          {isOpen && <span className="ml-4">View Expense</span>}
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
              {/* Booking Section - Visible for owner/operator */}
              {(role === "owner" || role === "operator") && (
                <div className="mt-4 border-b-2">
                  <h3
                    onClick={toggleBooking} // Toggle for "Booking" submenu
                    className={`flex items-center justify-between text-lg font-semibold text-black mb-2 cursor-pointer ${
                      isBookingOpen ? "bg-transparent" : ""
                    }`}
                  >
                    <span className="p-2">
                      {isOpen ? (
                        isBookingOpen ? (
                          <span className=" flex text-base gap-2 font-normal">
                            <FaTicketAlt className="text-2xl " /> Booking
                          </span>
                        ) : (
                          <span className=" flex text-base gap-2 font-normal">
                            <FaTicketAlt className="text-2xl " /> Booking
                          </span>
                        )
                      ) : (
                        <FaTicketAlt className="text-2xl " />
                      )}
                    </span>
                    <FaChevronDown
                      className={`text-sm transition-all duration-300 ease-out ${
                        isBookingOpen ? "rotate-180" : ""
                      }`}
                    />
                  </h3>

                  {isBookingOpen && (
                    <ul className="space-y-2 overflow-hidden">
                      <li className="relative">
                        <Link
                          to="/create-booking"
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            activeLink === "create-booking"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("create-booking")}
                        >
                          <FaPlus className="text-xl" />
                          {isOpen && (
                            <span className="ml-4">Create Booking</span>
                          )}
                        </Link>
                      </li>
                      <li className="relative">
                        <Link
                          to="/create-loading"
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            activeLink === "create-loading"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("create-loading")}
                        >
                          <FaPlus className="text-xl" />
                          {isOpen && (
                            <span className="ml-4">Create Loading</span>
                          )}
                        </Link>
                      </li>
                      <li className="relative">
                        <Link
                          to="/view-booking"
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            activeLink === "view-booking"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("view-booking")}
                        >
                          <AiOutlineFolderView className="text-xl" />
                          {isOpen && <span className="ml-4">View Booking</span>}
                        </Link>
                      </li>
                      <li className="relative">
                        <Link
                          to="/assign-booking"
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            activeLink === "assign-booking"
                              ? "bg-blue-600 text-white"
                              : "text-black hover:bg-gray-300 hover:text-black"
                          }`}
                          onClick={() => handleLinkClick("assign-booking")}
                        >
                          <FaClipboardList className="text-xl" />
                          {isOpen && (
                            <span className="ml-4">Assign Booking</span>
                          )}
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
              {/* owner dashboard menu */}
              <li className="relative">
                <Link
                  to="/owner-dashboard"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "owner"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("owner")}
                >
                  <FaUser className="text-xl" />
                  {isOpen && <span className="ml-4">Owner Dashboard</span>}
                </Link>
              </li>
              <li className="relative">
                <Link
                  to="/trip-report"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "trip-report"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("trip-report")}
                >
                  <FaFileAlt className="text-xl" />
                  {isOpen && <span className="ml-4">Trip Report</span>}
                </Link>
              </li>

              <li className="relative">
                <Link
                  to="/announcement"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "announcement"
                      ? "bg-blue-600 text-white"
                      : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("announcement")}
                >
                  <FaBullhorn className="text-xl" />
                  {isOpen && <span className="ml-4">Announcement</span>}
                </Link>
              </li>
            </>
          )}

          {role === "driver" && (
            <li>
              <Link
                to="/driver-dashboard"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  activeLink === "driver-dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-black hover:bg-gray-300 hover:text-black"
                }`}
                onClick={() => handleLinkClick("driver-dashboard")}
              >
                <FaCar className="text-xl" />
                {isOpen && <span className="ml-4">Driver Dashboard</span>}
              </Link>
            </li>
          )}
          {role === "superadmin" && (
            <li>
              <Link
                to="/SuperAdmin"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  activeLink === "SuperAdmin"
                    ? "bg-blue-600 text-white"
                    : "text-black hover:bg-gray-300 hover:text-black"
                }`}
                onClick={() => handleLinkClick("SuperAdmin")}
              >
                <FaCar className="text-xl" />
                {isOpen && <span className="ml-4">Super Admin Dashboard</span>}
              </Link>
            </li>
          )}

          {role === "driver" && (
            <li>
              <Link to="/create-booking">
                <FaTaxi className="text-xl" />
                {isOpen && <span className="ml-4">Create Booking</span>}
              </Link>
            </li>
          )}
        </ul>
        <div className="" ref={dropdownRef}>
          <button
            onClick={handleSetting}
            className="flex items-center p-3 rounded-lg transition-colors text-black hover:bg-gray-300 hover:text-black w-full"
          >
            <AiFillSetting className="text-2xl fill-black" />
          </button>
          <div
            className={`absolute ${
              isSettingOpen ? "flex" : "hidden"
            } w-64 flex-col bottom-4 md:bottom-20 p-2 rounded-lg left-[calc(100%+8px)] z-50 bg-white shadow-lg shadow-gray-500 text-black text-sm font-medium`}
          >
            {/* Dropdown Content */}
            <Link to="/edit-profile">
            <div className="p-3 border-b-2 hover:bg-gray-300 hover:rounded-lg">
              Edit Profile
            </div>
            </Link>
            <Link to="/privacy-policy">
            <div className="p-3 border-b-2 hover:bg-gray-300 hover:rounded-lg">
              Privacy Policy
            </div>
            </Link>
            <Link to="/terms">
            <div className="p-3 border-b-2 hover:bg-gray-300 hover:rounded-lg">
             Terms and Conditions
            </div>
            </Link>
            <Link to="/help">
            <div className="p-3 border-b-2 hover:bg-gray-300 hover:rounded-lg">
              Help
            </div>
            </Link>
            <Link to="/about">
            <div className="p-3 hover:bg-gray-300 hover:rounded-lg">About Us</div>
            </Link>
          </div>
        </div>
        <ul className="">
          {/* Other Links */}
          <li className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center p-3 rounded-lg transition-colors text-black hover:bg-gray-300 hover:text-black w-full"
            >
              <FaSignOutAlt className="text-xl" />
              {isOpen && <span className="ml-4">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
