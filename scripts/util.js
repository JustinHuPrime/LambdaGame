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

/**
 * @param {string} input
 */
export function sanitize(input) {
  const temp = document.createElement("div");
  temp.textContent = input;
  return temp.innerHTML.replace(/\n/g, "<br/>");
}

/**
 * @param {any} e
 */
export function stringifyError(e) {
  if (!(e instanceof Error)) {
    return sanitize(`Unexpected exception type: ${e}`);
  } else if (e instanceof lang.ParseError || e instanceof lang.EvalError) {
    return sanitize(e.toString());
  } else {
    return sanitize(`Internal error: ${e.toString()}`);
  }
}
