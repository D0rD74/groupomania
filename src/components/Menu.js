import { NavLink } from "../../node_modules/react-router-dom/index";
import logo from "../img/logo.png";
import useAuth from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import useLogout from "../hooks/useLogout";

export default function Menu() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();

  const signOut = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand navbar-light">
      <ul className="navbar-nav menu w-100">
        <li className="nav-item home">
          <NavLink to="/" title="Accueil">
            <img
              src={logo}
              className="App-logo"
              alt="Social network Groupomania"
            />
          </NavLink>
        </li>
        {!auth?.accessToken ? (
          <>
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "current" : undefined)}
              >
                Connexion
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? "current" : undefined)}
              >
                Inscription
              </NavLink>
            </li>
          </>
        ) : (
          <li className="nav-item">
            <Link to="/" onClick={signOut}>
              Déconnexion
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
