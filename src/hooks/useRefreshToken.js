import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await fetch(`https://localhost:8443/api/refresh`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setAuth((prev) => {
      return {
        ...prev,
        roles: data.roles,
        _id: data._id,
        accessToken: data.accessToken,
      };
    });

    return data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
