import spreadsheetEval from "./spreadsheetEval";

it("returns existing and updated cells", () => {
  expect(
    spreadsheetEval("0,0", "123", { "0,1": { input: "456", value: "456" } })
  ).toEqual({
    "0,0": {
      input: "123",
      value: "123",
    },
    "0,1": {
      input: "456",
      value: "456",
    },
  });
});
