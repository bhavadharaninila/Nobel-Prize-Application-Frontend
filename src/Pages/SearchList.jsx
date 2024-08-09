import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, Paper, MenuItem } from "@mui/material";
import "./styles.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function SearchList(props) {
  const { displayList, setDisplayList, activeSearch } = props;
  const handleUpdate = (category, year, id) => {
    axios
      .post(`http://localhost:5000/api/data/${category}/${year}/${id}/like`)
      .then((response) => {
        console.log("Laureate updated:", response.data);
        setDisplayList((prevPrizes) =>
          prevPrizes.map((prize) =>{
            debugger
           return prize.category === category && prize.year === year
              ? prize.laureates
                ? {
                    ...prize,
                    laureates: prize.laureates.map((laureate) =>
                      laureate.id === id ? response.data : laureate
                    )
                  }
                : { ...prize, ...response.data }
              : prize
      })
      );
      })
      .catch((error) => {
        console.error("Error updating laureate:", error);
      });
  };
  return (
    <>
      <ul>
        {displayList &&
          displayList.map((item) => {
            if (item.laureates) {
              return item.laureates?.map((laureate) => (
                <li className="card">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h4>
                      {laureate.firstname} {laureate.surname}
                    </h4>
                    <span style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                      
                      -
                    </span>
                   <span>{laureate.motivation}</span> 
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {item.category}, {item.year}
                    <span style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                      {" "}
                    </span>
                    <div className="like-section">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`heart-icon ${laureate.like ? "liked" : ""}`}
                        onClick={() =>
                          handleUpdate(item.category, item.year, laureate.id)
                        }
                      />
                      <span className="like-count">{laureate.like || 0}</span>
                    </div>
                  </div>
                </li>
              ));
            } else {
              return (
                <li className="card">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h4>
                      {item.firstname} {item.surname}
                    </h4>
                    <span style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                      {" "}
                      -{" "}
                    </span>
                   <span>{item.motivation}</span> 
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {item.category}, {item.year}
                    <span style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                      {" "}
                    </span>
                    <div className="like-section">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`heart-icon ${item.like ? "liked" : ""}`}
                        onClick={() =>
                          handleUpdate(item.category, item.year, item.id)
                        }
                      />
                      <span className="like-count">{item.like || 0}</span>
                    </div>
                  </div>
                </li>
              );
            }
          })}
      </ul>
    </>
  );
}

export default SearchList;