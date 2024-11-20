import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaUser, FaSignOutAlt, FaEnvelope, FaCar, FaUsers,FaDollarSign,FaFileAlt,FaClipboardList,FaCheckCircle, FaCalendarAlt, FaGasPump, FaTaxi, FaCarAlt, FaChevronDown, FaChevronUp, FaTruckPickup } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
    <div className={`${isOpen ? 'w-64' : 'w-16'} h-screen bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg overflow-y-auto max-h-[100vh]`}>
      {/* Header Section */}
      <div className="flex justify-between items-center p-4">
        <button onClick={toggleSidebar} className="text-2xl text-[#340034] p-2 rounded-full shadow-md transition-transform transform hover:scale-110">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="relative">
          <button
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
          </button>

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
                    <small className="text-xs text-gray-500">{notification.timestamp}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col space-y-2 mt-4">
        <li>
          <Link
            to='/details'
            className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'home' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
            onClick={() => handleLinkClick('home')}
          >
            <FaHome className="text-xl" />
            {isOpen && <span className="ml-4">Home</span>}
          </Link>
        </li>

        {/* Role-specific Links */}
        {(role === 'owner' || role === 'operator') && (
          <>
            <li>
              <Link
                to='/owner-dashboard'
                className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'owner' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                onClick={() => handleLinkClick('owner')}
              >
                <FaUser className="text-xl" />
                {isOpen && <span className="ml-4">Owner Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to='/trip-report'
                className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'trip-report' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                onClick={() => handleLinkClick('trip-report')}
              >
                <FaTruckPickup className="text-xl" />
                {isOpen && <span className="ml-4">Trip Report</span>}
              </Link>
            </li>
            <li>
              <Link
                to='/vehicle'
                className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'vehicle' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                onClick={() => handleLinkClick('vehicle')}
              >
                <FaCar className="text-xl" />
                {isOpen && <span className="ml-4">Vehicle</span>}
              </Link>
            </li>
            <li>
              <Link
                to='/user'
                className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'user' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                onClick={() => handleLinkClick('user')}
              >
                <FaUsers className="text-xl" />
                {isOpen && <span className="ml-4">User</span>}
              </Link>
            </li>
          </>
        )}

        {/* Expenses Section - Visible for owner/operator */}
        {(role === 'owner' || role === 'operator') && (
          <div className="mt-4">
            <h3
              onClick={toggleExpenses} // Toggle for "Expenses" submenu
              className={`flex items-center justify-between text-lg font-semibold text-white mb-2 cursor-pointer ${isExpensesOpen ? 'bg-gray-600' : ''}`}
            >
              <span>{isOpen && 'Expenses'}</span>
              {isExpensesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </h3>

            {isExpensesOpen && (
              <ul className="space-y-2">
                <li>
                  <Link
                    to='/add-expense'
                    className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'create-expense' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                    onClick={() => handleLinkClick('create-expense')}
                  >
                    <FaDollarSign className="text-xl" />
                    {isOpen && <span className="ml-4">Create Expense</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/view-expense'
                    className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'view-expense' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                    onClick={() => handleLinkClick('view-expense')}
                  >
                    <FaFileAlt className="text-xl" />
                    {isOpen && <span className="ml-4">View Expense</span>}
                  </Link>
                </li>
                
              </ul>
            )}
          </div>
        )}
{role === 'driver' && (
          <li>
            <Link
              to='/driver-dashboard'
              className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'driver-dashboard' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
              onClick={() => handleLinkClick('driver-dashboard')}
            >
              <FaCar className="text-xl" />
              {isOpen && <span className="ml-4">Driver Dashboard</span>}
            </Link>
          </li>)}
          {role === 'superadmin' && (
          <li>
            <Link
              to='/SuperAdmin'
              className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'SuperAdmin' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
              onClick={() => handleLinkClick('SuperAdmin')}
            >
              <FaCar className="text-xl" />
              {isOpen && <span className="ml-4">Super Admin Dashboard</span>}
            </Link>
          </li>)}
        {/* Booking Section - Visible for owner/operator */}
        {(role === 'owner' || role === 'operator') && (
          <div className="mt-4">
            <h3
              onClick={toggleBooking} // Toggle for "Booking" submenu
              className={`flex items-center justify-between text-lg font-semibold text-white mb-2 cursor-pointer ${isBookingOpen ? 'bg-gray-600' : ''}`}
            >
              <span>{isOpen && 'Booking'}</span>
              {isBookingOpen ? <FaChevronUp /> : <FaChevronDown />}
            </h3>

            {isBookingOpen && (
              <ul className="space-y-2">
                <li>
                  <Link
                    to='/create-booking'
                    className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'create-booking' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                    onClick={() => handleLinkClick('create-booking')}
                  >
                    <FaTaxi className="text-xl" />
                    {isOpen && <span className="ml-4">Create Booking</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/view-booking'
                    className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'view-booking' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                    onClick={() => handleLinkClick('view-booking')}
                  >
                    <FaCarAlt className="text-xl" />
                    {isOpen && <span className="ml-4">View Booking</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/assign-booking'
                    className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'assign-booking' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                    onClick={() => handleLinkClick('assign-booking')}
                  >
                    <FaClipboardList className="text-xl" />
                    {isOpen && <span className="ml-4">Assign Booking</span>}
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}
<li 
  className="flex items-center space-x-4 p-3 bg-gray-100 rounded-lg"
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
            className="flex items-center p-3 rounded-lg transition-colors hover:bg-white hover:text-black w-full"
          >
            <FaSignOutAlt className="text-xl" />
            {isOpen && <span className="ml-4">Logout</span>}
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;

