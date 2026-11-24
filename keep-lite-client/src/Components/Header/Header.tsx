import { Link, NavLink } from "react-router";
import { FiEdit3, FiFileText, FiFolder, FiLogIn, FiUserPlus } from "react-icons/fi";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <FiEdit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Keep<span className="text-amber-500">Lite</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            <FiFileText className="w-4 h-4" />
            <span>Notes</span>
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            <FiFolder className="w-4 h-4" />
            <span>Categories</span>
          </NavLink>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiLogIn className="w-4 h-4 text-slate-500" />
            <span>Login</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm shadow-amber-500/20 transition-all"
          >
            <FiUserPlus className="w-4 h-4" />
            <span>Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
