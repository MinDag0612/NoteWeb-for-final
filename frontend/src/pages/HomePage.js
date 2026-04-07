import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePageStyle.css";
import HeaderCom from "../components/HeaderCom";
import NotesPage from "./NotesPage";

export default function HomePage() {
  const navigator = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const curToken = sessionStorage.getItem("access_token");

    if (!storedUser) {
      sessionStorage.setItem("error", "Please login before !");
      navigator("/");
      return
    }

    if (!curToken) {
      sessionStorage.setItem("error", "Something went wrong, token not found");
      navigator("/");
      return
    }

    setUser(JSON.parse(storedUser));
    setToken(curToken)
  }, [navigator]);

  if (!user || !token) return null;

  return (
    <>
      <div className="container-fluid full-page d-flex flex-column p-3">
        <HeaderCom userName={user["full_name"]}/>

        <div className="d-flex flex-grow-1 container-fluid p-0 min-h-0 middle-row">
          <div className=" d-flex w-100 flex-grow-1 min-h-0">
            <div className="main-content col-10 p-0 d-flex flex-column min-h-0 flex-grow-1">
              <div className="outlet-wrapper d-flex flex-column flex-grow-1 min-h-0">
                <NotesPage token={token} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
