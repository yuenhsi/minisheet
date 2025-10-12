import referenceParser from "./referenceParser";

it("parses references to coordaintes", () => {
  expect(referenceParser("A1")).toEqual("0,0");
});

it("parsers longer references to coordiantes", () => {
  expect(referenceParser("AA20")).toEqual("26,19");
});
