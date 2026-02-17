import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
          <span className="text-2xl">🎫</span>
          EventHub
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/events" className="text-gray-600 hover:text-primary-600">
            Events
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-primary-600">
            About
          </Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="hidden sm:inline">{user.name}</span>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {user.role}
                </span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdown(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdown(false)}
                    >
                      My Bookings
                    </Link>
                    {(user.role === 'organizer' || user.role === 'admin') && (
                      <Link
                        to="/events/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdown(false)}
                      >
                        Create Event
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <Link to="/events" className="block py-2" onClick={() => setOpen(false)}>
            Events
          </Link>
          <Link to="/about" className="block py-2" onClick={() => setOpen(false)}>
            About
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link to="/profile" className="block py-2" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Link to="/bookings" className="block py-2" onClick={() => setOpen(false)}>
                My Bookings
              </Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/events/create" className="block py-2" onClick={() => setOpen(false)}>
                  Create Event
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="block py-2" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block py-2 text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="block py-2" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
