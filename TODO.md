# TODO: minisheet

Minisheet is a mini spreadsheet application. You can change a cell's input by double clicking on a cell, entering a value, and pressing enter. A basic UI and architecture, a tokenizer, and a few other pieces have been built out already. Everything is stored client-side, in memory.

You task today is to complete the requirements of Minisheet's calculation engine. We are looking for the ability to write a lot of well considered, well tested code in a short amount of time.

## Calculation Engine: Requirements

The Minisheet calculation engine lives in `Lib/spreadsheetEval.js`.

Formula requirements:

1. Formulas always start with an "=" sign. An input without an "=" is a constant value and should still be evaluated in case another cell depends on it.

2. Formulas observe proper BEMDAS operator precedence. You can implement this however you'd like. The [Shunting Yard Algorithm](https://en.wikipedia.org/wiki/Shunting-yard_algorithm) is one way. The wikipedia page may be a helpful overview but it is unnesscearily complicated, see this [Stack Overflow](https://stackoverflow.com/questions/28256/equation-expression-parser-with-precedence/47717#47717) answer for a simpler description of how to use Shunting Yard.

3. Formulas evaluate parenthetical expressions. e.g. =2*(1+2) should evaluate to 6.

4. Formulas can reference other cells with an Excel-like syntax. e.g. =A1+A2, should evaluate to the sum of the values of A1 and A2

5. Formulas can use the SUM function to sum a range of cells. e.g. SUM(A1:A5) should sum cells A1 to A5.

Calculation engine requirements:

1. A cell's input is either a formula (starts with "=") or a constant value. A cell's value is either the evaluated formula or its constant value.

2. The calculation engine should return the entire cell store after processing an update. This will automatically update the rendered Cell components.

Some other notes...

- There is already a tokenizer which will convert a formula to easy to work with tokens. See `Lib/tokenizer.js` and `Lib/tokenizer.test.js`.
- There is also a pre-written `referenceParser` function which will convert a user reference (e.g. A1) to an internal `col,row` syntax.
- The tests use the [Jest](https://jestjs.io/docs/using-matchers) framework. You can run tests in the "shell" tab on the right with `yarn test`. Once you've started `yarn test` it'll stay running and watch for any changes and re-run the tests.
