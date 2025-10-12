import { ALPHABET, NUMBERS, OPERATORS, PARENS, RANGE_CHAR } from "./constants";

const tokenizer = (formula) => {
  if (formula.charAt(0) !== "=") {
    throw new Error("Can't tokenize non formula");
  }

  let scannerIndex = 1; // start at 1 to skip the = char
  let buffer = "";
  let tokens = [];

  const getCharType = (char) => {
    if (ALPHABET.includes(char.toLowerCase())) {
      return "letter";
    }
    if (NUMBERS.includes(char)) {
      return "number";
    }
    if (OPERATORS.includes(char)) {
      return "operator";
    }
    if (PARENS.includes(char)) {
      return "parens";
    }
    if (RANGE_CHAR === char) {
      return "range";
    }
    return "noop";
  };

  const currentChar = () => formula[scannerIndex];

  const currentCharType = () => getCharType(currentChar());

  const nextChar = () => formula[scannerIndex + 1];

  const nextCharType = () => getCharType(nextChar());

  const currentWordType = () => {
    if (nextChar() === PARENS[0]) {
      return "function";
    }
    const chars = Array.from(buffer);
    const hasLetters = chars.some((c) => ALPHABET.includes(c.toLowerCase()));
    const hasNumbers = chars.some((c) => NUMBERS.includes(c));
    const hasRange = chars.some((c) => c === RANGE_CHAR);
    if (hasLetters && hasNumbers && hasRange) {
      return "range";
    }
    if (hasLetters && hasNumbers) {
      return "reference";
    }
    return "noop";
  };

  const scanForward = () => {
    scannerIndex += 1;
    buffer += currentChar();
  };

  const scanForwardWhile = (...charTypes) => {
    while (nextChar() && charTypes.includes(nextCharType())) {
      scanForward();
    }
  };

  const tokenize = (type) => {
    tokens.push({
      type,
      value: buffer,
    });
  };

  buffer += currentChar();
  while (currentChar() !== undefined) {
    switch (currentCharType()) {
      case "number":
        scanForwardWhile("number");
        tokenize("number");
        break;
      case "parens":
        tokenize("parens");
        break;
      case "letter":
        scanForwardWhile("letter", "number", "range");
        tokenize(currentWordType());
        break;
      case "operator":
        scanForwardWhile("operator");
        tokenize("operator");
        break;
      case "noop":
        scanForwardWhile("noop");
        break;
      default:
        break;
    }
    buffer = "";
    scanForward();
  }

  return tokens;
};

export default tokenizer;
