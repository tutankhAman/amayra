import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaBars, FaUserCircle } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import SignUp from '../components/buttons/SignUp';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  // Profile Dropdown Component
  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
        <p className="font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>
      <Link
        to="/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setIsProfileOpen(false)}
      >
        Profile
      </Link>
      <Link
        to="/orders"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setIsProfileOpen(false)}
      >
        Orders
      </Link>
      <Link
        to="/wishlist"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setIsProfileOpen(false)}
      >
        Wishlist
      </Link>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );

  // Updated profile button render logic
  const renderProfileButton = () => {
    if (user) {
      return (
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors duration-300"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="h-8 w-8" />
          )}
        </button>
      );
    }
    return <SignUp />;
  };

  return (
    <nav className="bg-white fixed w-full top-0 z-50 border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-8 w-auto" src="src/assets/icons/logo.svg" alt="Amayra Logo" />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Shop
            </Link>
            <Link to="/men" className="text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Men
            </Link>
            <Link to="/women" className="text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Women
            </Link>
            <Link to="/kids" className="text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Kids
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Contact
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] h-10 pl-4 pr-10 py-1 bg-gray-300 text-gray-900 placeholder-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800" />
            </div>

            {/* Mobile Shop Link */}
            <Link to="/shop" className="md:hidden text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
              Shop
            </Link>

            {/* Mobile Search Icon */}
            <button 
              className="md:hidden text-gray-700 hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(true)}
            >
              <FaSearch className="h-6 w-6" />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="text-gray-700 hover:text-black relative transition-colors duration-300">
              <FaShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Profile/Signup Button - Desktop only */}
            <div className="hidden md:block relative">
              {renderProfileButton()}
              {isProfileOpen && user && <ProfileDropdown />}
            </div>

            {/* Hamburger Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        {/* Search Bar - Mobile */}
        <div className="px-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-4 pr-10 py-1 bg-[#9B9A9A] text-gray-800 placeholder-gray-800 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800" />
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/men" className="block px-3 py-2 text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
            Men
          </Link>
          <Link to="/women" className="block px-3 py-2 text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
            Women
          </Link>
          <Link to="/kids" className="block px-3 py-2 text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
            Kids
          </Link>
          <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-primary font-semibold transition-colors duration-300">
            Contact
          </Link>
          {/* Profile/Sign Up - Mobile */}
          {user ? (
            <>
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-gray-700" />
                  )}
                  <div>
                    <p className="font-medium text-gray-700">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" className="block py-2 text-gray-700 hover:text-primary">
                  Profile
                </Link>
                <Link to="/orders" className="block py-2 text-gray-700 hover:text-primary">
                  Orders
                </Link>
                <Link to="/wishlist" className="block py-2 text-gray-700 hover:text-primary">
                  Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-700 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="px-3 py-2">
              <SignUp />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;