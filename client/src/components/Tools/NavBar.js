import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaBars, FaTimes, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Transfer", path: "/transfer" }
  ];

  const actionItems = [
    { 
      label: "Settings", 
      path: "/settings", 
      icon: <FaCog className="inline-block" />,
      className: "text-blue-600 hover:text-blue-800"
    },
    { 
      label: "Logout", 
      onClick: handleLogout, 
      icon: <FaSignOutAlt className="inline-block" />,
      className: "text-red-600 hover:text-red-800"
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <nav className="mx-auto px-6 py-4 max-w-7xl flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate("/dashboard")}
            aria-label="LuFunds Home"
          >
            LuFunds
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes className="text-gray-600" /> : <FaBars className="text-gray-600" />}
        </button>

        {/* Primary Navigation */}
        <div className={`md:flex items-center space-x-8 ${isMenuOpen ? "absolute top-full left-0 right-0 bg-white shadow-lg p-4" : "hidden"}`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMenuOpen(false);
              }}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm capitalize"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Secondary Navigation/Actions */}
        <div className="flex items-center space-x-6">
          {actionItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick || (() => navigate(item.path))}
              className={`flex items-center space-x-2 ${item.className} transition-colors duration-200`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

NavBar.propTypes = {
  // Add prop types if your component receives any props
};

export default NavBar;