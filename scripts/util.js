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
