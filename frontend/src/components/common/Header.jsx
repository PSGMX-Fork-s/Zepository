import { NavLink, useNavigate, Link } from "react-router-dom";

export default function Header({ userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItemClass = (isActive) =>
    isActive
      ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
      : "rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 shadow-sm">
            <span className="text-sm font-bold text-white">Z</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Zepository
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={({ isActive }) => navItemClass(isActive)}>
            Dashboard
          </NavLink>
          <NavLink to="/assets" className={({ isActive }) => navItemClass(isActive)}>
            Assets
          </NavLink>
          <NavLink to="/locations" className={({ isActive }) => navItemClass(isActive)}>
            Locations
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => navItemClass(isActive)}>
            Services
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {userName && (
            <span className="hidden text-sm font-medium text-slate-500 lg:block">
              {userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
