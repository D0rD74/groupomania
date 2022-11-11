import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { NavLink } from "../../node_modules/react-router-dom/index";

function Article({
  id,
  imageUrl,
  message,
  authorName,
  authorId,
  nbLikes,
  usersLikedArray,
  handleDelete,
}) {
  const { auth } = useAuth();
  const [likes, setNbLikes] = useState("");
  const [usersLiked, setUsersLiked] = useState("");

  useEffect(() => {
    setUsersLiked(usersLikedArray);
  }, []);

  useEffect(() => {
    setNbLikes(nbLikes);
  }, []);

  async function handleLikes() {
    let likesIndex = usersLiked.indexOf(auth._id);
    const like = likesIndex !== -1 ? 0 : 1;
    let xsrfToken = localStorage.getItem("xsrfToken");
    if (!xsrfToken) {
      /* Traitement dans le cas où le token CSRF n'existe dans le localStorage */
    }
    xsrfToken = JSON.parse(xsrfToken);

    await fetch(`https://localhost:8443/api/posts/${id}/like`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "x-xsrf-token": xsrfToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ like: like }),
    }).then((response) =>
      response.json().then(({ data }) => {
        switch (response.status) {
          case 401:
            alert("Connectez vous pour pouvoir liker");
            break;
          case 200:
            setNbLikes(data.likes);
            setUsersLiked(data.usersLiked);
            break;
          default:
            break;
        }
      })
    );
  }

  return (
    <article className="post">
      <p>
        <strong>{authorName}</strong>
        <br />
        {message}
      </p>
      {imageUrl !== "" ? <img alt="" src={imageUrl} /> : ""}

      <div className="likeBox">
        <button className="link" onClick={handleLikes}>
          J'aime {!likes ? "(0) " : "(" + likes + ") "}
        </button>

        {authorId === auth._id || auth.roles >= 50 ? (
          <>
            <NavLink className="edit" to={`posts/${id}/edit`}>
              Modifier
            </NavLink>
            <button className="link delete" onClick={() => handleDelete(id)}>
              - Supprimer
            </button>
          </>
        ) : (
          ""
        )}
      </div>
    </article>
  );
}

Article.propTypes = {
  message: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  id: PropTypes.string,
  authorName: PropTypes.string.isRequired,
};

Article.defaultProps = {
  label: "",
  imageUrl: "",
  id: "",
  authorName: "",
};

export default Article;
