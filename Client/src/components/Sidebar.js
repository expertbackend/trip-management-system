import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaUser, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate, } from 'react-router-dom';
import pic from '../assets/IMG-20231205-WA0001.jpg';

function Sidebar({ role, notifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');


  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleProfileClick = () => {
   navigate('/profile'); // Navigate to the profile page on click
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeLink');
    navigate('/login'); 
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
    <div className={`${isOpen ? 'w-64' : 'w-16'} h-screen bg-cover bg-center bg-no-repeat bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5R6qWLHvgMjxwlGPThnutOtUc0liQqoWZo49KdLrUKp_e5NPZL5iVAbiO9umJvJ_ruD0&usqp=CAU')] text-white transition-all duration-400 ease-in-out flex flex-col`}>
      {/* Header Section */}
      <div className="flex justify-between items-center p-4">
        <button onClick={toggleSidebar} className='text-2xl text-[#340034] p-2 rounded shadow-md'>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="flex items-center p-3 rounded-lg transition-colors text-white hover:bg-white hover:text-black"
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
      <ul className='flex flex-col space-y-2 mt-4'>
        <li>
          <Link 
            to='/details' 
            className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'home' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
            onClick={() => handleLinkClick('home')}
          >
            <FaHome className="text-xl"/>
            {isOpen && <span className='ml-4'>Home</span>}
          </Link>
        </li>
        {/* Role-specific Links */}
        {role === 'owner' && (
  <li>
    <Link 
      to='/owner-dashboard' 
      className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'owner' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
      onClick={() => handleLinkClick('owner')}
    >
      <FaUser className="text-xl"/>
      {isOpen && <span className='ml-4'>Owner Dashboard</span>}
    </Link>
  </li>
)}

{role === 'owner' && (
  <li>
    <Link 
      to='/vehicle' 
      className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'vehicle' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
      onClick={() => handleLinkClick('vehicle')}
    >
      <FaUser className="text-xl"/>
      {isOpen && <span className='ml-4'>Vehicle</span>}
    </Link>
  </li>
)}

{role === 'owner' && (
  <li>
    <Link 
      to='/user' 
      className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'user' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
      onClick={() => handleLinkClick('user')}
    >
      <FaUser className="text-xl"/>
      {isOpen && <span className='ml-4'>User</span>}
    </Link>
  </li>
)}

{role === 'owner' && (
  <li>
    <Link 
      to='/booking' 
      className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'booking' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
      onClick={() => handleLinkClick('booking')}
    >
      <FaUser className="text-xl"/>
      {isOpen && <span className='ml-4'>Booking</span>}
    </Link>
  </li>
)}
        {role === 'driver' && (
          <li>
            <Link 
              to='/driver-dashboard' 
              className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'driver' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
              onClick={() => handleLinkClick('driver')}
            >
              <FaUser className="text-xl"/>
              {isOpen && <span className='ml-4'>Driver Dashboard</span>}
            </Link>
          </li>
        )}
        {role === 'operator' && (
          <li>
            <Link 
              to='/operator-dashboard' 
              className={`flex items-center p-3 rounded-lg transition-colors ${activeLink === 'operator' ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
              onClick={() => handleLinkClick('operator')}
            >
              <FaUser className="text-xl"/>
              {isOpen && <span className='ml-4'>Operator Dashboard</span>}
            </Link>
          </li>
        )}
      </ul>

      <div className="flex items-center p-4 mt-auto border-t border-white">
        <img className="w-12 h-12 rounded-full mr-4" src={pic} alt="Profile" 
        onClick={handleProfileClick} />
        {isOpen && (
          <div>
            <p className="text-lg font-semibold">Kavya Balla</p>
            <p className="text-sm">{role}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2 mt-4">
        <button 
          onClick={handleLogout} 
          className="flex items-center p-3 rounded-lg transition-colors text-white hover:bg-white hover:text-black"
        >
          <FaSignOutAlt className="text-xl"/>
          {isOpen && <span className='ml-4'>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
