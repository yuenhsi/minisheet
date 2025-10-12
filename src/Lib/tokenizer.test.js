import tokenizer from "./tokenizer";

it("tokenizes expressions", () => {
  const tokens = tokenizer("=100+200");
  expect(tokens.length).toBe(3);
  expect(tokens[0]).toEqual({ type: "number", value: "100" });
  expect(tokens[1]).toEqual({ type: "operator", value: "+" });
  expect(tokens[2]).toEqual({ type: "number", value: "200" });
});

it("tokenizes references", () => {
  const tokens = tokenizer("=A1+A2");
  expect(tokens.length).toBe(3);
  expect(tokens[0]).toEqual({ type: "reference", value: "A1" });
  expect(tokens[1]).toEqual({ type: "operator", value: "+" });
  expect(tokens[2]).toEqual({ type: "reference", value: "A2" });
});

it("tokenizes ranges", () => {
  const tokens = tokenizer("=A1:A2");
  expect(tokens.length).toBe(1);
  expect(tokens[0]).toEqual({ type: "range", value: "A1:A2" });
});

it("tokenizes functions and parens", () => {
  const tokens = tokenizer("=SUM(A1:A2)");
  expect(tokens.length).toBe(4);
  expect(tokens[0]).toEqual({ type: "function", value: "SUM" });
  expect(tokens[1]).toEqual({ type: "parens", value: "(" });
  expect(tokens[2]).toEqual({ type: "range", value: "A1:A2" });
  expect(tokens[3]).toEqual({ type: "parens", value: ")" });
});

it("does not tokenize spaces", () => {
  const tokens = tokenizer("=1 + 2");
  expect(tokens.length).toBe(3);
  expect(tokens[0].value).toEqual("1");
  expect(tokens[1].value).toEqual("+");
});
