import { useState, useEffect } from "react";
import Article from "../components/Article";
import "../css/pages/home.scss";
import "../css/components/article.scss";

export default function Home() {
  const [postsList, setPostsList] = useState([]);
  const [isDataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDelete = (id) => {
    let xsrfToken = localStorage.getItem("xsrfToken");
    if (!xsrfToken) {
      /* Traitement dans le cas où le token CSRF n'existe dans le localStorage */
    }
    xsrfToken = JSON.parse(xsrfToken);
    fetch(`https://localhost:8443/api/posts/${id}/delete`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
      headers: {
        "x-xsrf-token": xsrfToken,
      },
    }).then((response) =>
      response.json().then(({ data }) => {
        switch (response.status) {
          case 500:
            alert("Erreur pendant la suppression de ce post");
            break;
          case 200:
            alert("Post supprimé !");
            fetchPosts();
            break;
          case 401:
            alert("Vous n'êtes pas autorisé à supprimer ce post");
            break;
          default:
            break;
        }
      })
    );
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setDataLoading(true);
    try {
      let xsrfToken = localStorage.getItem("xsrfToken");
      if (!xsrfToken) {
        /* Traitement dans le cas où le token CSRF n'existe pas dans le localStorage */
      }
      xsrfToken = JSON.parse(xsrfToken);
      const getPosts = await fetch(`https://localhost:8443/api/posts`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-xsrf-token": xsrfToken,
        },
      });

      const postsList = await getPosts.json();
      setPostsList(postsList);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setDataLoading(false);
    }
  }

  if (error) {
    return <span>Oups il y a eu un problème</span>;
  }

  return (
    <div className="home">
      <h1 className="text-center mt-0">
        Une entreprise connect<span className="primary">ée</span>, où que vous
        soy<span className="primary">ez</span>.
      </h1>
      {isDataLoading ? (
        "Loading..."
      ) : (
        <>
          {postsList.map((post, index) => (
            <Article
              key={`${post.title}-${index}`}
              id={post._id}
              title={post.title}
              message={post.message}
              imageUrl={post.imageUrl}
              authorName={post.author.firstName + " " + post.author.lastName}
              authorId={post.author._id}
              nbLikes={post.likes}
              usersLikedArray={post.usersLiked}
              handleDelete={handleDelete}
            />
          ))}
        </>
      )}
    </div>
  );
}
