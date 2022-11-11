import { useRef, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/pages/login.scss";

export default function Login() {
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const emailRef = useRef();
  const errRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch(`https://localhost:8443/api/auth/login`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then((response) =>
      response
        .json()
        .then(({ data }) => {
          switch (response.status) {
            case 200:
              localStorage.setItem("xsrfToken", JSON.stringify(data.xsrfToken));
              const roles = data.roles;
              const _id = data._id;
              const accessToken = data.accessToken;
              setAuth({ _id, email, password, roles, accessToken });
              setEmail("");
              setPassword("");
              // Remove the console.log before deployment
              console.log(data);
              navigate(from, { replace: true });
              break;
            case 401:
              setErrMsg("Your Email or your password is wrong.");
              errRef.current.focus();
              // Remove the console.log before deployment
              console.log(data);
              break;
            case 500:
              setErrMsg("500");
              console.log(data);
              break;
            default:
          }
        })
        .catch((error) => {
          errRef.current.focus();
          console.log(error);
        })
    );
  }

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <div className="login">
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "d-none"}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="email"
          id="email"
          ref={emailRef}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          required
        />
        <br />
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Mot de passe"
          required
        />
        <br />
        <input type="submit" value="Connexion" />
        <div className="persistCheck">
          <input
            type="checkbox"
            id="persist"
            onChange={togglePersist}
            checked={persist}
          />
          <label htmlFor="persist"> Se souvenir de moi</label>
        </div>
      </form>
    </div>
  );
}
