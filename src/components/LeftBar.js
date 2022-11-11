import { NavLink } from "../../node_modules/react-router-dom/index";
import useAuth from "../hooks/useAuth";

export default function LeftBar() {
  const { auth } = useAuth();
  return (
    <div id="LeftBar">
      <h2>Mon compte</h2>
      <i className="fa-solid fa-plus"></i>
      <NavLink
        className={({ isActive }) => (isActive ? "current" : undefined)}
        to="/create"
      >
        Créer un post
      </NavLink>

      {auth.roles >= 50 ? (
        <div id="admin">
          <h2>Administration</h2>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
