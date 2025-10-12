import React, { useState } from "react";
import "./Cell.css";

const Cell = (props) => {
  const { value, input, setInput } = props;
  const [isInputting, setIsInputting] = useState(false);
  const [inputValue, setInputValue] = useState(input || "");

  const handleDoubleClick = () => {
    setIsInputting(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
    if (e.key === "Escape") {
      setIsInputting(false);
      setInputValue(input);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = (e) => {
    setInput(e.target.value);
    setIsInputting(false);
  };

  return (
    <td className="Cell" onDoubleClick={handleDoubleClick}>
      {!isInputting && <span className="Cell__Value">{value}</span>}
      {isInputting && (
        <input
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          value={inputValue}
          className="Cell__Input"
          autoFocus
        />
      )}
    </td>
  );
};

export default Cell;
