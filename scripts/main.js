import * as ast from "./lang.js";
import { sanitize } from "./util.js";

/** @type {HTMLElement} */
const replOutput = (() => {
  const maybeReplOutput = document.getElementById("repl-output");
  if (maybeReplOutput === null) throw new Error("repl-output not found");
  else return maybeReplOutput;
})();

/** @type {HTMLElement} */
const replParent = (() => {
  const maybeReplParent =
    document.getElementById("repl")?.parentElement ?? null;
  if (maybeReplParent === null) throw new Error("repl parent not found");
  else return maybeReplParent;
})();

/** @type {HTMLInputElement} */
const replInput = (() => {
  const maybeReplInput = document.getElementById("repl-input");
  if (maybeReplInput === null || !(maybeReplInput instanceof HTMLInputElement))
    throw new Error("repl-input not found");
  else return maybeReplInput;
})();

/**
 * @param {UIEvent} [_ev]
 */
function resizeHandler(_ev) {
  replOutput.style.height = `${
    replParent.clientHeight - replInput.offsetHeight
  }px`;
}
window.addEventListener("resize", resizeHandler);
resizeHandler();

/** @type {string[]} */
const inputHistory = [];
document.getElementById("repl-input")?.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    inputHistory.push(replInput.value);
    replOutput.innerHTML += `<span>&gt; ${sanitize(
      replInput.value
    )}</span><br/>`;

    try {
      const parsed = ast.parse(replInput.value);

      replOutput.innerHTML += `<span>&lt; ${sanitize(
        parsed.evaluate(new Map()).toString()
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
      replInput.value = "";
    } catch (e) {
      let stringified;
      if (!(e instanceof Error)) {
        stringified = `Unexpected exception type: ${e}`;
      } else if (e instanceof ast.ParseError) {
        stringified = `${e}`;
      } else {
        stringified = `Internal error: ${e}`;
      }

      replOutput.innerHTML += `<span class="text-danger">${sanitize(
        stringified
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
    }
  } else if (ev.key === "ArrowUp") {
    replInput.value = inputHistory.pop() || "";
  } else {
    console.log(ev.key);
  }
});
