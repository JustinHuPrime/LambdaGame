import * as lang from "./lang.js";
import { sanitize } from "./util.js";

// find elements

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

// repl resizing

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

// game

// repl

/** @type {string[]} */
const history = [];
/** @type {number} */
let historyPointer = history.length;
document.getElementById("repl-input")?.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    replOutput.innerHTML += `<span>&gt; ${sanitize(
      replInput.value
    )}</span><br/>`;

    history.push(replInput.value);
    historyPointer = history.length;

    try {
      const parsed = lang.parse(replInput.value);
      replInput.value = "";

      replOutput.innerHTML += `<span>&lt; ${sanitize(
        parsed.evaluate(new Map()).toString()
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
    } catch (e) {
      let stringified;
      if (!(e instanceof Error)) {
        stringified = `Unexpected exception type: ${e}`;
      } else if (e instanceof lang.ParseError || e instanceof lang.EvalError) {
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
    if (historyPointer > 0) {
      replInput.value = history[--historyPointer];
    }
  } else if (ev.key === "ArrowDown") {
    if (historyPointer <= history.length) {
      replInput.value = history[++historyPointer] || "";
    }
  }
});
