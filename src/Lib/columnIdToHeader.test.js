import columnIdToHeader from "./columnIdToHeader";

it("converts small numbers to headers", () => {
  expect(columnIdToHeader(10)).toEqual("k");
});

it("converts big numbers to headers", () => {
  expect(columnIdToHeader(100)).toEqual("cw");
});
