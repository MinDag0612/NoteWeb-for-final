import React, { useEffect, useState } from "react";
import "./LoginPageStyle.css";
import ButtonCom from "../components/ButtonCom";
import { useNavigate } from "react-router-dom";
import GoogleLogin from "../components/GoogleLogin";

export default function LoginPage() {
  const navigator = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const err = sessionStorage.getItem("error");
    if (err) {
      setError(err);
      sessionStorage.removeItem("error");
    }
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(process.env.REACT_APP_API_PROCESS_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        password: password,
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
        sessionStorage.setItem("access_token", data.access_token);
        // console.log(JSON.stringify(data.user))
        navigator("/home");
      })
      .catch((error) => {
        alert(error.message);
      });
  }


  return (
    <>
      <div className="page-body min-vw-100 vh-100 d-flex justify-content-center align-items-center container-fluid">
        <div className="row justify-content-center w-100">
          <div className="col-6 d-flex flex-column">
            <div className="main-form d-flex w-100">
              <div className="logo-box col-5 d-flex align-items-center justify-content-center">
                <p>Logo here</p>
              </div>
              <div className="main-box m-0 row col-7 p-4">
                <div className="title-box d-flex flex-column justify-content-center align-items-center flex-column">
                  <h2>
                    <b>Login</b>
                  </h2>
                  <p>
                    First time you here ?{" "}
                    <a href="">
                      <b>Signup</b>
                    </a>
                  </p>
                </div>
                <form onSubmit={onSubmit}>
                  <div class="form-group mb-3">
                    <label className="" for="formGroupExampleInput">
                      Email
                    </label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label className="mb-1" for="formGroupExampleInput2">
                      Password
                    </label>
                    <input type="password" class="form-control" id="password" />
                  </div>
                  <div className="text-end">
                    <a href="">
                      <b>Forgot password ?</b>
                    </a>
                  </div>
                  <ButtonCom name={"Login"} type={"submit"} />
                </form>
                <div className="d-flex justify-content-center align-items-center flex-column text-center">
                  <p className="m-1">-- or --</p>
                  <GoogleLogin />
                </div>
              </div>
            </div>
            {error ? (
              <button type="button" class="btn btn-outline-warning w-100 mt-2">
                {" "}
                {error}{" "}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
