import { ALPHABET } from "./constants";

const columnIdToHeader = (columnId) => {
  if (columnId < 26) {
    return ALPHABET[columnId];
  }

  const nstr = columnId.toString(26);
  let name = "";
  Array.from(nstr).forEach((c) => {
    const i = parseInt(c, 26);
    if (name.length === 0) {
      name += ALPHABET[i - 1];
    } else {
      name += ALPHABET[i];
    }
  });

  return name;
};

export default columnIdToHeader;
