import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaUser, FaSignOutAlt, FaEnvelope, FaCar, FaUsers,FaDollarSign,FaFileAlt,FaClipboardList,FaCheckCircle, FaCalendarAlt, FaGasPump, FaTaxi, FaCarAlt, FaChevronDown, FaChevronUp, FaTruckPickup,FaCoins,FaEye,FaTicketAlt,FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import {AiOutlineFolderView} from 'react-icons/ai'
import Avatar from 'react-avatar';
function Sidebar({ role, notifications,username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false); // State for the "Expenses" submenu
  const [isBookingOpen, setIsBookingOpen] = useState(false); // State for the "Booking" submenu

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setActiveLink('profile')
  };
  useEffect(() => {
    // Check for token in localStorage when the sidebar loads
    const token = localStorage.getItem('token');
  
    if (!token) {
      // If no token, redirect to login page
      navigate('/login');
    } else {
      // If token exists, check for active link
      const savedLink = localStorage.getItem('activeLink');
      if (savedLink) {
        setActiveLink(savedLink);
      } else {
        setActiveLink('home');
      }
    }
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('activeLink');
    navigate('/login');
  };

  const toggleExpenses = () => {
    setIsExpensesOpen(!isExpensesOpen);
  };

  const toggleBooking = () => {
    setIsBookingOpen(!isBookingOpen); // Toggle for "Booking" submenu
  };

  useEffect(() => {
    const savedLink = localStorage.getItem('activeLink');
    if (savedLink) {
      setActiveLink(savedLink);
    } else {
      setActiveLink('home');
    }
  }, []);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    localStorage.setItem('activeLink', link);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div
    className={`${
      isOpen ? "w-64" : "w-20"
    } h-full bg-white text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg overflow-hidden border-r-2`}
  >
    <div className='h-full overflow-y-auto p-1'>
    {/* Header Section */}
    <div className="absolute top-0 left-0 right-0 bg-white flex justify-between items-center p-4">
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
                  <p className="text-sm text-gray-400">{notification.body}</p>
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
    <ul className="flex flex-col space-y-2 mt-20">
    {(role === 'owner' || role === 'operator') && (
        <>
      <li>
        <Link
          to="/details"
          className={`flex items-center p-3 rounded-lg transition-colors ${
            activeLink === "home"
              ? "bg-blue-600 text-white"
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
        <li>
            <Link
              to="/announcement"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                activeLink === "announcement"
                  ? "bg-blue-600 text-white"
              : "text-black hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleLinkClick("announcement")}
            >
              <FaTruckPickup className="text-xl" />
              {isOpen && <span className="ml-4">Announcement</span>}
            </Link>
          </li>
         <li>
            <Link
              to="/fms"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                activeLink === "fms"
                  ? "bg-blue-600 text-white"
              : "text-black hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleLinkClick("fms")}
            >
              <FaTruckPickup className="text-xl" />
              {isOpen && <span className="ml-4">fms</span>}
            </Link>
          </li>
          {/* owner dashboard menu */}
          <li>
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
          <li>
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
          <li>
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
              {isOpen && <span className="ml-4">Vehicle</span>}
            </Link>
          </li>
          <li>
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
        </>
      )}

      {/* Expenses Section - Visible for owner/operator */}
      {(role === "owner" || role === "operator") && (
        <div className="mt-4">
          <h3
            onClick={toggleExpenses} // Toggle for "Expenses" submenu
            className={`flex items-center justify-between text-center  text-lg font-semibold text-white mb-2 cursor-pointer ${
              isExpensesOpen ? "bg-transparent" : "<p></p>"
            }`}
          >
            <span className="p-2">
              {isOpen || isExpensesOpen ? (
                <span className="sm:text-[11px] md:text-[13px] text-[15px]">
                  Expenses
                </span>
              ) : (
                <FaCoins className="text-2xl" />
              )}
            </span>
            {isExpensesOpen ? (
              <FaChevronUp className="sm:text-[10px] text-[12px]" />
            ) : (
              <FaChevronDown className="text-[12px]" />
            )}
          </h3>

          {isExpensesOpen && (
            <ul className="space-y-2">
              <li>
                <Link
                  to="/add-expense"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeLink === "create-expense"
                      ? "bg-blue-600 text-white"
              : "text-black hover:bg-gray-300 hover:text-black"
                  }`}
                  onClick={() => handleLinkClick("create-expense")}
                >
                  <FaDollarSign className="text-xl" />
                  {isOpen && <span className="ml-4">Create Expense</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/view-expense"
                  className={`flex items-center p-3 rounded-lg transition-colors ${
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
      {/* Booking Section - Visible for owner/operator */}
      {(role === 'owner' || role === 'operator' ) && (
        <div className="mt-4">
          <h3
            onClick={toggleBooking} // Toggle for "Booking" submenu
            className={`flex items-center justify-between text-lg font-semibold text-white mb-2 cursor-pointer ${
              isBookingOpen ? "bg-transparent" : ""
            }`}
          >
            <span className="p-2">
              {isOpen || isBookingOpen ? (
                <span className="sm:text-[11px] md:text-[13px] text-[15px]">
                  Booking
                </span>
              ) : (
                <FaTicketAlt className="text-2xl " />
              )}
            </span>
            {isBookingOpen ? (
              <FaChevronUp className="sm:text-[10px] text-[12px]" />
            ) : (
              <FaChevronDown className="text-[12px]" />
            )}
          </h3>

          {isBookingOpen && (
            <ul className="space-y-2">
              <li>
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
                  {isOpen && <span className="ml-4">Create Booking</span>}
                </Link>
              </li>
              <li>
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
              <li>
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
                  {isOpen && <span className="ml-4">Assign Booking</span>}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
      {role === 'driver' && (
<li>
  <Link to='/create-booking' >
    <FaTaxi className="text-xl" />
    {isOpen && <span className="ml-4">Create Booking</span>}
  </Link>
</li>
)}

<li 
className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'profile' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}

onClick={handleProfileClick}
>
{/* Profile Section */}
<div className="flex items-center">
  {/* Avatar Image */}
  <Avatar 
    name={username} 
    size="40" 
    round="20px" 
    className="shadow-md" 
  />
  {/* Username and Role */}
  <div className="ml-4">
    <p className="font-semibold text-gray-700">{username}</p>
    <p className="text-sm text-gray-500">{role}</p>
  </div>
</div>
</li>

      {/* Other Links */}
      <li>
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

