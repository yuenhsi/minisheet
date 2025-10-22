import tokenizer from "./tokenizer";
import referenceParser from "./referenceParser";

/*
 * currently all formulae get reevaluated once a new formula gets added. This 
 * can be further optimized to the extend where only dependent cells get computed,
 * but recursively calling spreadsheetEval can loop for circular references.
*/
const spreadsheetEval = (cellId, cellInput, cells) => {
  // set initial value
  cells[cellId] = {
    input: cellInput,
    value: cellInput,
  };

  let dCells = [];
  for (const [cellId, cellData] of Object.entries(cells)) {
    if (cellData["input"].length > 0) {
      const tokens = cellData["input"].charAt(0) === "=" ? tokenizer(cellData["input"]) : []
      dCells.push({
        cellId,
        formula: cellData["input"],
        tokens,
      })
    }
  };
  // depGraph is of shape {cellId: [dependentCellId]}
  const depGraph = constructDepGraph(dCells);
  const cellIdsInUpdateOrder = topologicalSort(depGraph);
  const invalidCells = dCells.filter(c => !cellIdsInUpdateOrder.includes(c.cellId));

  for (const invalidCell of invalidCells) {
    cells[invalidCell.cellId]['value'] = 'Circular reference';
  }

  for (const cellId of cellIdsInUpdateOrder) {
    let cell = dCells.find(dCell => dCell.cellId === cellId)
    let tokens = cell.tokens;
    if (tokens.length > 0) {
      try {
        // validate no noops and all functions are type SUM
        validateTokens(tokens);
        // resolve refs
        tokens = resolveTokenRefs(tokens, cells);
        // eval functions and ranges (range only supported within SUM)
        tokens = evalCellFormulae(tokens, cells, cellId);
        // eval arithmetic
        cells[cellId]['value'] = evalCell(tokens);
      } catch (e) {
        cells[cellId]['value'] = e.message;
      }
    }
  }
  
  return cells;
};

/*
 * Any formulae containing noop and unsupported function types are deemed invalid. 
 */
const validateTokens = (tokens) => {
  const noops = tokens.filter(token => token['type'] === "noop")
  if (noops.length > 0) {
    throw new Error(`Invalid token: ${JSON.stringify(noops.map(t => t['value']))}`);
  }

  const functions = tokens.filter(token => token['type'] === 'function')
  if (!functions.every(fn => fn['value'] === 'SUM')) {
    throw new Error(`Unsupported function: ${JSON.stringify(functions.map(fn => fn['value']))}`);
  }
}

/*
 * Change reference tokens to values if applicable. Deem invalid otherwise.
 */ 
const resolveTokenRefs = (tokens, cells) => {
  return tokens.map(token => {
    if (token['type'] === 'reference') {
      const ref = referenceParser(token['value']);
      if (!Object.keys(cells).includes(ref)) {
        throw new Error(`Reference error: Cell ${token['value']} doesn't exist.`);
      }
      const val = Number(cells[ref]['value'])
      if (Number.isNaN(val)) {
        throw new Error(`Reference error: ${token['value']} is NaN.`);
      } 
      return {
        'type': 'number',
        'value': val
      }
    } else {
      return token;
    }
  })
}

/*
 * Only SUM is currently supported.
 */
const evalCellFormulae = (tokens, cells, selfId) => {
  if (tokens.filter(token => token['type'] === 'function').length === 0) {
    return tokens;
  }
  const result = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'function' && token.value === 'SUM') {
      i++;

      // Expect opening parenthesis
      if (!(tokens[i] && tokens[i].type === 'parens' && tokens[i].value === '(')) {
        throw new Error(`SUM must be followed by '('`);
      }
      i++;

      let sum = 0;
      let expectArg = true;
      let foundClosingParen = false;
      // let tokens = []

      while (i < tokens.length) {
        const t = tokens[i];

        if (t.type === 'parens' && t.value === ')') {
          foundClosingParen = true;
          i++;
          break; // end of SUM
        } else if (t.type === 'operator') {

          if (t.value !== ',') throw new Error(`Only ',' allowed inside SUM`);
          if (expectArg) throw new Error(`Comma cannot appear before first argument`);
          expectArg = true;
        } else if (t.type === 'number') {
          if (!expectArg) throw new Error(`Missing comma between arguments in SUM`);
          const val = Number(t.value);
          if (Number.isNaN(val)) throw new Error(`Invalid value for SUM argument: ${t.value}`);
          sum += val;
          expectArg = false;
        } else if (t.type === 'range') {
          if (!expectArg) throw new Error(`Missing comma between arguments in SUM`);

          const [start, end] = t.value.split(":").map(c => referenceParser(c));
          const [startX, startY] = start.split(',').map(Number);
          const [endX, endY] = end.split(',').map(Number);
          let rangeSum = 0
          for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
              const coord = `${i},${j}`
              if (!Object.keys(cells).includes(coord)) {
                throw new Error(`Invalid range: Cell ${coord} doesn't exist.`)
              }
              const val = Number(cells[coord]['value']);
              if (selfId === coord) throw new Error(`Invalid range: range cannot include self.`);
              if (Number.isNaN(val)) throw new Error(`Invalid value for SUM argument: ${cells[coord]['value']} in coord ${coord}.`);
              rangeSum += val;
            }
          }
          sum += rangeSum;
          expectArg = false;
        } else {
          throw new Error(`Invalid token type in SUM: ${JSON.stringify(t.type)}`);
        }
        i++;
      }
      if (!foundClosingParen) throw new Error(`SUM missing closing ')'`);
      // Push the SUM result as a single number token
      result.push({ type: 'number', value: sum });
    } else {
      // Regular token, just pass through
      result.push(token);
      i++;
    }
  }
  return result;
}

const evalCell = (tokens) => {
  console.log(tokens)

  const nums = []; // number stack
  const ops = [];  // operator stack

  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const applyOp = () => {
    const b = nums.pop();
    const a = nums.pop();
    const op = ops.pop();
    switch (op) {
      case '+': nums.push(a + b); break;
      case '-': nums.push(a - b); break;
      case '*': nums.push(a * b); break;
      case '/': nums.push(a / b); break;
      case '^': nums.push(Math.pow(a, b)); break;
      case ',': throw new Error ('Comma can only be used within SUM');
      default: throw new Error(`Unexpected operator ${op}`);
    }
  };

  for (const token of tokens) {
    if (token.type === 'number') {
      nums.push(Number(token.value));
    } else if (token.type === 'operator') {
      const op = token.value;

      // Pop while top of ops is an operator (not '(') and has >= precedence
      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        precedence[ops[ops.length - 1]] >= precedence[op]
      ) {
        applyOp();
      }
      ops.push(op);
    } else if (token.type === 'parens' && token.value === '(') {
      ops.push('(');
    } else if (token.type === 'parens' && token.value === ')') {
      // Pop until matching '('
      while (ops.length && ops[ops.length - 1] !== '(') {
        applyOp();
      }
      if (ops.length === 0) throw new Error('Mismatched parentheses');
      ops.pop(); // remove '('
    } else if (token.type === 'range') {
      throw new Error(`Range token can only be inside SUM.`);
    } else {
      throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  // Finish remaining ops
  while (ops.length > 0) {
    const top = ops[ops.length - 1];
    if (top === '(' || top === ')') throw new Error('Mismatched parentheses');
    applyOp();
  }

  if (nums.length !== 1) throw new Error('Invalid expression');
  return nums[0];
};

const constructDepGraph = (dCells) => {
  let depGraph = {}
  for (const dCell of dCells) {
    depGraph[dCell.cellId] = [];
  }
  const dCellsWithRef = dCells.filter(dCell => 
    dCell.tokens.some(t => t.type === 'reference')
  );
  for (const dCellWithRef of dCellsWithRef) {
    const tokens = dCellWithRef.tokens.filter(t => t.type === 'reference');
    for (const token of tokens) {
      const coord = referenceParser(token.value);
      if (coord in depGraph && !depGraph[dCellWithRef.cellId].includes(coord)) {
        depGraph[dCellWithRef.cellId].push(coord)
      }
    }
  }

  const dCellsWithRange = dCells.filter(dCell => dCell.tokens.type === 'range');
  for (const dCellWithRange of dCellsWithRange) {
    const [start, end] = dCellWithRange.token.value.split(":").map(c => referenceParser(c));
    const [startX, startY] = start.split(',').map(Number);
    const [endX, endY] = end.split(',').map(Number);
    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        const coord = `${i},${j}`
        if (Object.keys(depGraph).includes(coord)) {
          depGraph[dCellWithRange.cellId].push(coord)
        }
      }
    }
  }
  return depGraph;
};

const topologicalSort = (depGraph) => {
  const numDeps = {};
  const queue = [];

  for (const [coord, deps] of Object.entries(depGraph)) {
    numDeps[coord] = deps.length;
    if (deps.length === 0) {
      queue.push(coord)
    }
  }
  const result = [];
  while (queue.length > 0) {
    const coord = queue.shift();
    result.push(coord);
    // Find cells that this cell resolves
    for (const [n, deps] of Object.entries(depGraph)) {
      if (deps.includes(coord)) {
        numDeps[n]--; 
        if (numDeps[n] === 0) {
          queue.push(n);
        }
      }
    }
  }
  return result;
}

export default spreadsheetEval;
