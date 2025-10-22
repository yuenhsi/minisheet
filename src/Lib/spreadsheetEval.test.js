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

it("works with trivial =1", () => {
  expect(
    spreadsheetEval("0,0", "=1", { })
  ).toEqual({
    "0,0": {
      input: "=1",
      value: 1,
    },
  });
});

it("evaluates trivial expression", () => {
  expect(
    spreadsheetEval("0,0", "=1+2", { })
  ).toEqual({
    "0,0": {
      input: "=1+2",
      value: 3,
    },
  });
});

it("evaluates nontrivial expression", () => {
  expect(
    spreadsheetEval("0,0", "=1+2*3+10000-5^6", { })
  ).toEqual({
    "0,0": {
      input: "=1+2*3+10000-5^6",
      value: -5618,
    },
  });
});

it("evaluates parenthetical nontrivial expression", () => {
  expect(
    spreadsheetEval("0,0", "=1+2*(3+10000)-2*(1+1)^6+33", { })
  ).toEqual({
    "0,0": {
      input: "=1+2*(3+10000)-2*(1+1)^6+33",
      value: 19912,
    },
  });
});

it("cell references work", () => {
  expect(
    spreadsheetEval(
      "0,1",
      "=2*(3+A1)-2*(D4+1)^6+B3",
      { 
        "0,0": { input: "10000", value: "10000" },
        "3,3": { input: "1", value: "1" },
        "1,2": { input: "33", value: "3" },
      })
  ).toEqual({
    "0,1": {
      input: "=2*(3+A1)-2*(D4+1)^6+B3",
      value: 19881,
    },
    "0,0": { input: "10000", value: "10000" },
    "3,3": { input: "1", value: "1" },
    "1,2": { input: "33", value: "3" },
  });
});

it("SUM + range formula", () => {
  expect(
    spreadsheetEval(
      "5,5",
      "=2*SUM(A1:B3)+SUM(1,2,3)",
      { 
        "0,0": { input: "1", value: "1" },
        "0,1": { input: "1", value: "1" },
        "0,2": { input: "2", value: "2" },
        "1,0": { input: "33", value: "33" },
        "1,1": { input: "4", value: "4" },
        "1,2": { input: "1", value: "1" },
      })
  ).toEqual({
      "0,0": { input: "1", value: "1" },
      "0,1": { input: "1", value: "1" },
      "0,2": { input: "2", value: "2" },
      "1,0": { input: "33", value: "33" },
      "1,1": { input: "4", value: "4" },
      "1,2": { input: "1", value: "1" },
      "5,5": { input: "=2*SUM(A1:B3)+SUM(1,2,3)", value: 90 },
  });
});

// Updates dependent cells reactively
it("Updates dependent cells reactively", () => {
  expect(
    spreadsheetEval(
      "0,0",
      "100",
      { 
        "0,0": { input: "10", value: "10" },
        "1,0": { input: "=A1", value: 10 },
        "2,0": { input: "=B1", value: 10 },
        "3,0": { input: "=C1", value: 10 },
      })
  ).toEqual({
      "0,0": { input: "100", value: "100" },
      "1,0": { input: "=A1", value: 100 },
      "2,0": { input: "=B1", value: 100 },
      "3,0": { input: "=C1", value: 100 },
    });
});

it("throws with noop formula", () => {
  expect(
    spreadsheetEval("0,0", "=invalidOp", { })
  ).toEqual({
    "0,0": {
      input: "=invalidOp",
      value: "Invalid token: [\"invalidOp\"]",
    },
  });
});


it("reevaluates cells dependent on self after eval", () => {

});
