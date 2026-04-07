import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function checkAcc(idToken, navigator) {
  fetch(process.env.REACT_APP_API_PROCESS_LOGIN_GG, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        credential: idToken
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          console.log(response.status);
          console.log(response.headers.get("content-type"));

          const err = await response.json();
          throw new Error(err.detail || "Login failed");
        }
        return response.json();
      })
      .then((data) => {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("access_token", data.access_token)
        console.log(JSON.stringify(data.user))
        console.log("token: ", data.access_token)
        navigator("/home");
      })
      .catch((error) => {
        sessionStorage.setItem("error", "User not found please register first")
        window.location.reload();
        
      });
}

function GoogleLogin() {
  const navigator = useNavigate();

  const handleCredentialResponse = (response) => {
    const idToken = response.credential;
    console.log(idToken)

    // sessionStorage.setItem("user", JSON.stringify(idToken));
    
    checkAcc(idToken, navigator)

  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id:
            process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          { theme: "outline", size: "large" },
        );

        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts) return;

    localStorage.removeItem("gg-key");
    window.google.accounts.id.disableAutoSelect();
    window.google.accounts.id.prompt();
  };

  return <div id="google-btn"></div>;
}

export default GoogleLogin;
