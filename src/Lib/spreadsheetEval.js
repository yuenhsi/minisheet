import tokenizer from "./tokenizer";
import referenceParser from "./referenceParser";

const spreadsheetEval = (cellId, cellInput, cells) => {
  cells[cellId] = {
    input: cellInput,
    value: cellInput,
  };
  return cells;
};

export default spreadsheetEval;
