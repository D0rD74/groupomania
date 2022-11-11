import { useRef, useState, useEffect } from "react";
import Security from "../utils/security";
import "../css/pages/signup.scss";

export default function Signup() {
  const emailRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const errRef = useRef();

  const [firstName, setFirstName] = useState("");
  const [validFirstName, setValidFirstName] = useState(false);
  const [firstNameFocus, setFirstNameFocus] = useState(false);

  const [lastName, setLastName] = useState("");
  const [validLastName, setValidLastName] = useState(false);
  const [lastNameFocus, setLastNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    firstNameRef.current.focus();
  }, []);

  useEffect(() => {
    setValidEmail(Security.mail(email));
  }, [email]);

  useEffect(() => {
    setValidFirstName(Security.onlyAlpha(firstName));
  }, [firstName]);

  useEffect(() => {
    setValidLastName(Security.onlyAlpha(lastName));
  }, [lastName]);

  useEffect(() => {
    setValidPassword(Security.password(password));
  }, [password]);

  useEffect(() => {
    setErrMsg("");
  }, [firstName, lastName, email, password]);

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch(`https://localhost:8443/api/auth/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    }).then((response) =>
      response
        .json()
        .then(({ message }) => {
          // Remove the console.log before deployment
          console.log(message);

          switch (response.status) {
            case 201:
              //clear state and controlled inputs
              setFirstName("");
              setLastName("");
              setEmail("");
              setPassword("");
              setSuccess(true);
              break;
            case 409:
              setErrMsg("Cet email est déjà enregistré.");
              errRef.current.focus();
              break;
            case 500:
              setErrMsg("Un problème a été détecté sur votre mot de passe.");
              errRef.current.focus();
              break;
            default:
              break;
          }
        })
        .catch((error) => {
          // Remove the console.log before deployment
          console.log(error);
        })
    );
  }

  return (
    <>
      {success ? (
        <div className="signup">
          <h1>Inscription validée !</h1>
          <p>
            <a href="login">Se connecter</a>
          </p>
        </div>
      ) : (
        <div className="signup">
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
              name="firstName"
              id="firstName"
              ref={firstNameRef}
              autoComplete="off"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              required
              aria-invalid={validFirstName ? "false" : "true"}
              aria-describedby="firstNameMessage"
              placeholder="Prénom"
              onFocus={() => setFirstNameFocus(true)}
              onBlur={() => setFirstNameFocus(false)}
            />
            <p
              id="firstNameMessage"
              className={
                firstNameFocus && firstName && !validFirstName
                  ? "instructions"
                  : "d-none"
              }
            >
              Votre prénom ne doit comporter que des lettres.
            </p>

            <input
              type="text"
              name="lastName"
              id="lastName"
              ref={lastNameRef}
              autoComplete="off"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              required
              aria-invalid={validLastName ? "false" : "true"}
              aria-describedby="lastNameMessage"
              placeholder="Nom"
              onFocus={() => setLastNameFocus(true)}
              onBlur={() => setLastNameFocus(false)}
            />
            <p
              id="firstNameMessage"
              className={
                lastNameFocus && lastName && !validLastName
                  ? "instructions"
                  : "d-none"
              }
            >
              Votre nom ne doit comporter que des lettres.
            </p>

            <input
              type="text"
              name="email"
              id="email"
              ref={emailRef}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="emailMessage"
              placeholder="Email"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />

            <p
              id="emailMessage"
              className={
                emailFocus && email && !validEmail ? "instructions" : "d-none"
              }
            >
              Valid Email exemple : test@test.fr
            </p>
            <br />
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              aria-invalid={validPassword ? "false" : "true"}
              aria-describedby="passwordMessage"
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              placeholder="Mot de passe"
            />
            <p
              id="passwordMessage"
              className={
                passwordFocus && !validPassword ? "instructions" : "d-none"
              }
            >
              Votre mot de passe doit avoir au minimum 1 chiffre, 6 caractères,
              une majuscule, pas d'espaces et un maximum de 100 caractères.
            </p>
            <br />
            <input
              type="submit"
              value="Inscription"
              className={
                validFirstName && validLastName && validEmail && validPassword
                  ? ""
                  : "disabled"
              }
              disabled={
                validFirstName && validLastName && validEmail && validPassword
                  ? false
                  : true
              }
            />
          </form>
        </div>
      )}
    </>
  );
}
