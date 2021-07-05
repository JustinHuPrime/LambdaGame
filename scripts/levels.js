import * as lang from "./lang.js";

export class Level {
  /**
   * @param {string} title
   * @param {string} description
   * @param {{inputs: string[], output: string}[]} tests
   * @param {string[]} availableBuiltins
   * @param {string} builtinName
   */
  constructor(title, description, tests, availableBuiltins, builtinName) {
    this.title = title;
    this.description = description;
    this.tests = tests;
    this.availableBuiltins = availableBuiltins;
    this.builtinName = builtinName;
  }
}

/**
 * @param {string} input
 */
function parseLambda(input) {
  const lambda = lang.parse(input);
  if (!(lambda instanceof lang.LambdaNode)) {
    throw new Error(`bad level data: ${input} is not a lambda`);
  }
  return lambda;
}

/**
 * @type {Level[]}
 */
let LEVELS = [
  new Level(
    "Identity, please?",
    "In the code window (on the left), write the identity function.",
    [
      {
        inputs: ["(\\x.x)"],
        output: "(\\x.x)",
      },
      {
        inputs: ["(\\y.y)"],
        output: "(\\y.y)",
      },
    ],
    [],
    "identity"
  ),
  new Level(
    "Level zero",
    "Write the function corresponding to the Church numeral zero.",
    [
      {
        inputs: ["(\\x.x)", "(\\y.y)"],
        output: "(\\y.y)",
      },
    ],
    ["identity"],
    "zero"
  ),
  new Level(
    "Level <code>n + 1</code>",
    "Write the function corresponding to the function <code>add1</code>",
    [
      {
        inputs: ["zero"],
        output: "((\\n.(\\f.(\\x.(f ((n f) x))))) zero)",
      },
    ],
    ["identity", "zero"],
    "add1"
  ),
];
export default LEVELS;
