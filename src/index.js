import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Sheet from "./Components/Sheet";

ReactDOM.render(
  <React.StrictMode>
    <Sheet numCols={10} numRows={30} />
  </React.StrictMode>,
  document.getElementById("root")
);
