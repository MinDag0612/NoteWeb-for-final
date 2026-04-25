import { useCallback, useEffect } from "react";
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
          const err = await response.json();
          throw new Error(err.detail || "Login failed");
        }
        return response.json();
      })
      .then((data) => {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("access_token", data.access_token)
        navigator("/home");
      })
      .catch(() => {
        sessionStorage.setItem("error", "User not found please register first")
        window.location.reload();
        
      });
}

function GoogleLogin() {
  const navigator = useNavigate();

  const handleCredentialResponse = useCallback((response) => {
    const idToken = response.credential;
    
    checkAcc(idToken, navigator)

  }, [navigator]);

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
  }, [handleCredentialResponse]);

  return <div id="google-btn"></div>;
}

export default GoogleLogin;
