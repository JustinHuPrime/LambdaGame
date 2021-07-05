// Copyright 2021 Justin Hu
// This file is part of LambdaGame.
//
// LambdaGame is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// LambdaGame is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
// for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with LambdaGame. If not, see <https://www.gnu.org/licenses/>.
//
// SPDX-License-Identifier: AGPL-3.0-or-later

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
    "In the code window (on the left), write the <code>identity</code> function.<br/>" +
      "The <code>identity</code> function takes one argument and produces it.<br/>" +
      '<a href="./help.html" target="_blank">Need help? Click here for syntax documentation.</a>',
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
    'Write the function corresponding to the <a href="https://en.wikipedia.org/wiki/Church_encoding#Church_numerals" target="_blank">Church numeral</a> zero.<br/>' +
      "The <code>zero</code> function is a curried function taking two arguments, and it returns the second argument.",
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
    "Write the function corresponding to the function <code>add1</code><br/>" +
      "The <code>add1</code> function is a function taking one argument, a Church numeral, and it produces the successor of that numeral.",
    [
      {
        inputs: ["zero"],
        output: "((\\n.(\\f.(\\x.(f ((n f) x))))) zero)",
      },
      {
        inputs: ["((\\n.(\\f.(\\x.(f ((n f) x))))) zero)"],
        output: "((\\n.(\\f.(\\x.(f (f ((n f) x)))))) zero)",
      },
    ],
    ["identity", "zero"],
    "add1"
  ),
];
export default LEVELS;
