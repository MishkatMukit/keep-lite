import { Link, NavLink } from "react-router";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            📝
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
              `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            Notes
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            Categories
          </NavLink>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm shadow-amber-500/20 transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
