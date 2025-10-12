import { ALPHABET, NUMBERS } from "./constants";

const findParts = (reference) => {
  const downcaseReference = reference.toLowerCase();
  let i = 0;
  while (i < downcaseReference.length) {
    if (NUMBERS.includes(downcaseReference[i])) {
      break;
    }
    i += 1;
  }
  const columnPart = downcaseReference.slice(0, i);
  const rowPart = downcaseReference.slice(i);
  return [columnPart, rowPart];
};

const columnPartToId = (columnPart) => {
  let num = "";
  Array.from(columnPart).forEach((c) => {
    if (num.length === 0) {
      num += (ALPHABET.indexOf(c) + 1).toString(26);
    } else {
      num += ALPHABET.indexOf(c).toString(26);
    }
  });
  const column = parseInt(num, 26);
  if (columnPart.length === 1) {
    return column - 1;
  }
  return column;
};

const rowPartToId = (rowPart) => Number(rowPart) - 1;

const referenceParser = (reference) => {
  const [columnPart, rowPart] = findParts(reference);
  const columnId = columnPartToId(columnPart);
  const rowId = rowPartToId(rowPart);
  return `${columnId},${rowId}`;
};

export default referenceParser;
