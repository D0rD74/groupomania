import { useRef, useState, useEffect } from "react";
import "../css/pages/create.scss";
import Security from "../utils/security";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const navigate = useNavigate();
  const messageRef = useRef();
  const imageRef = useRef();
  const errRef = useRef();

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [validMessage, setValidMessage] = useState(false);
  const [messageFocus, setMessageFocus] = useState(false);

  const [image, setImage] = useState("");

  const [serverMsg, setServerMsg] = useState("");

  useEffect(() => {
    messageRef.current.focus();
  }, []);

  useEffect(() => {
    setServerMsg("");
  }, []);

  useEffect(() => {
    setSuccess("");
  }, []);

  function handleChange(e) {
    setImage(e.target.files[0]);
  }

  useEffect(() => {
    setValidMessage(message.length > 500 || message.length < 4 ? false : true);
  }, [message]);

  async function handleSubmit(e) {
    e.preventDefault();
    let xsrfToken = localStorage.getItem("xsrfToken");
    if (!xsrfToken) {
      /* Traitement dans le cas où le token CSRF n'existe dans le localStorage */
    }
    const formData = new FormData();

    formData.append("image", image);
    formData.append("message", message);
    xsrfToken = JSON.parse(xsrfToken);
    await fetch(`https://localhost:8443/api/posts/newP`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "x-xsrf-token": xsrfToken,
      },
      body: formData,
    }).then((response) =>
      response
        .json()
        .then(({ data }) => {
          switch (response.status) {
            case 201:
              setMessage("");
              setImage("");
              setSuccess("Post envoyé avec succès !");
              setTimeout(() => {
                navigate("/");
              }, 3000);
              break;
            case 422:
              setServerMsg(
                "Problème de sécurité avec la valeur de votre titre ou de votre message."
              );
              break;
            case 500:
              setServerMsg("Problème serveur. Essayez de vous reconnecter.");
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
  return (
    <div className="create">
      {success ? (
        <>
          <div className="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="success">{success}</p>
        </>
      ) : (
        <>
          <p
            ref={errRef}
            className={serverMsg ? "serverMsg" : "d-none"}
            aria-live="assertive"
          >
            {serverMsg}
          </p>
          <h2>Créer un nouveau post</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              name="image"
              id="image"
              ref={imageRef}
              onChange={handleChange}
            />
            <br />
            <textarea
              name="message"
              id="message"
              ref={messageRef}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setMessageFocus(true)}
              onBlur={() => setMessageFocus(false)}
              value={message}
              placeholder="Message"
            ></textarea>
            <p
              id="messageMessage"
              className={
                messageFocus && !validMessage ? "instructions" : "d-none"
              }
            >
              Votre message doit faire au minimum 4 caractères et au maximum 500
              caractères.
            </p>
            <br />
            <input
              type="submit"
              value="Envoyer !"
              className={validMessage ? "" : "disabled"}
              disabled={validMessage ? false : true}
            />
          </form>
        </>
      )}
    </div>
  );
}
