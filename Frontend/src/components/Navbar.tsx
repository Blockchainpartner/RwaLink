import { NavLink } from "react-router-dom";

const links = [
  { name: "Link 1", to: "/" },
  { name: "Link 2", to: "/page2" },
  { name: "Link 3", to: "/page3" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg px-6 py-3 flex gap-6 border border-white/20">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `text-white font-medium px-4 py-1 rounded-xl transition duration-300 ${
              isActive
                ? "bg-white/30 backdrop-blur-md"
                : "hover:bg-white/10 hover:scale-105"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}
