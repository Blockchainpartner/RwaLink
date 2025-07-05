import { NavLink } from "react-router-dom";

const links = [
  { name: "Overview", to: "/" },
  { name: "Bank", to: "/bank" },
  { name: "Account", to: "/account" },
];
export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg px-6 py-2 flex gap-6 border border-white/20">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `text-blue-900 font-medium text-sm px-4 py-1.5 rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/30"
                : "hover:bg-white/10 hover:ring-1 hover:ring-inset hover:ring-white/20"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}
