import * as ast from "./lang/ast.js";
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

document.getElementById("repl-input")?.addEventListener("keypress", (ev) => {
  if (ev.key === "Enter") {
    replOutput.innerHTML += `<span>&gt; ${sanitize(
      replInput.value
    )}</span><br/>`;
    try {
      const parsed = ast.parse(replInput.value);

      replOutput.innerHTML += `<span>&lt; ${sanitize(
        parsed.toString()
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
      replInput.value = "";
    } catch (e) {
      replOutput.innerHTML += `<span class="text-danger">${sanitize(
        e.toString()
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
    }
  }
});
