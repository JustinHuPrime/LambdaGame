import * as lang from "./lang.js";
import LEVELS from "./levels.js";
import { sanitize, stringifyError } from "./util.js";

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

/** @type {HTMLTextAreaElement} */
const code = (() => {
  const maybeCode = document.getElementById("code");
  if (maybeCode === null || !(maybeCode instanceof HTMLTextAreaElement))
    throw new Error("code not found");
  else return maybeCode;
})();

/** @type {HTMLElement} */
const levelTitle = (() => {
  const maybeLevelTitle = document.getElementById("level-title");
  if (maybeLevelTitle === null) throw new Error("level-title not found");
  else return maybeLevelTitle;
})();

/** @type {HTMLElement} */
const levelDescription = (() => {
  const maybeLevelDescription = document.getElementById("level-description");
  if (maybeLevelDescription === null)
    throw new Error("level-description not found");
  else return maybeLevelDescription;
})();

/** @type {HTMLElement} */
const testTable = (() => {
  const maybeTestTable = document.getElementById("test-table");
  if (maybeTestTable === null) throw new Error("test-table not found");
  else return maybeTestTable;
})();

/** @type {HTMLElement} */
const solutionOutput = (() => {
  const maybeSolutionOutput = document.getElementById("solution-output");
  if (maybeSolutionOutput === null)
    throw new Error("solution-output not found");
  else return maybeSolutionOutput;
})();

/** @type {HTMLButtonElement} */
const back = (() => {
  const maybeBack = document.getElementById("back");
  if (maybeBack === null || !(maybeBack instanceof HTMLButtonElement))
    throw new Error("back not found");
  else return maybeBack;
})();

/** @type {HTMLButtonElement} */
const next = (() => {
  const maybeNext = document.getElementById("next");
  if (maybeNext === null || !(maybeNext instanceof HTMLButtonElement))
    throw new Error("next not found");
  else return maybeNext;
})();

/** @type {HTMLButtonElement} */
const saveSolution = (() => {
  const maybeSaveSolution = document.getElementById("save-solution");
  if (
    maybeSaveSolution === null ||
    !(maybeSaveSolution instanceof HTMLButtonElement)
  )
    throw new Error("save-solution not found");
  else return maybeSaveSolution;
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

/**
 * @type {Map<string, {text: string, evaluated: lang.Closure | null}>}
 */
const solutions = new Map();
/** @type {lang.Closure | null} */
let solution = null;
/** @type {boolean} */
let saved = true;
/** @type {number} */
let level = 0;
/** @type {number} */
let available = 0;

/**
 * @param {number} level
 * @returns {Map<string, lang.Closure>}
 */
function getBuiltins(level) {
  return new Map(
    LEVELS[level].availableBuiltins.map((value, _index, _array) => {
      const gotten = solutions.get(value);
      if (gotten === undefined || gotten.evaluated === null)
        throw new Error(
          "missing builtin - levels may have been completed out of order"
        );
      else return [value, gotten.evaluated];
    })
  );
}

/**
 * @param {number} index
 * @returns {HTMLElement}
 */
function getOutputCell(index) {
  let maybeOutputCell = document.getElementById(`test-${index}`);
  if (maybeOutputCell === null) throw new Error("test output not found");
  else return maybeOutputCell;
}

/**
 * @param {number} [_time]
 */
function solutionRunner(_time) {
  try {
    solution = lang.evaluate(code.value, getBuiltins(level));
    solutionOutput.innerHTML = sanitize(
      solution.toString(LEVELS[level].availableBuiltins)
    );

    let ok = true;
    LEVELS[level].tests.forEach((test, index, _array) => {
      if (solution !== null) {
        const outputCell = getOutputCell(index);
        try {
          /** @type {lang.Closure} */
          const actual = test.inputs.reduce((fn, arg, _index, _array) => {
            return fn.lambda.body.evaluate(
              new Map(fn.env).set(
                fn.lambda.arg,
                lang.evaluate(arg, getBuiltins(level))
              )
            );
          }, solution);
          const equal = lang
            .evaluate(test.output, getBuiltins(level))
            .equals(actual);
          ok === ok && equal;
          outputCell.innerHTML = `<span class="${
            equal ? "text-success" : "text-danger"
          }">${sanitize(
            actual.toString(LEVELS[level].availableBuiltins)
          )}</span>`;
        } catch (e) {
          ok = false;
          outputCell.innerHTML = `<span class="text-danger">${stringifyError(
            e
          )}</span>`;
        }
      }
    });

    if (ok && LEVELS[level + 1] !== undefined) {
      next.removeAttribute("disabled");
    } else {
      next.setAttribute("disabled", "true");
    }
  } catch (e) {
    solutionOutput.innerHTML = `<span class="text-danger">${sanitize(
      stringifyError(e)
    )}</span>`;
    LEVELS[level].tests.forEach((_test, index, _array) => {
      getOutputCell(index).innerHTML = "";
    });

    next.setAttribute("disabled", "true");
  }
}
code.addEventListener("keydown", (_ev) => {
  saved = false;
  requestAnimationFrame(solutionRunner);
});

/**
 * @param {any} x
 */
function DEBUG(x) {
  console.log(x);
  return x;
}

/**
 * @param {number} level_
 */
function gotoLevel(level_) {
  level = level_;
  available = Math.max(available, level);

  levelTitle.innerHTML = LEVELS[level].title;
  levelDescription.innerHTML = LEVELS[level].description;
  testTable.innerHTML = "";
  LEVELS[level].tests.forEach((test, index, _array) => {
    testTable.innerHTML += `<tr><td>${sanitize(
      test.inputs
        .map((input, _index, _array) => {
          return lang
            .evaluate(input, getBuiltins(level))
            .toString(LEVELS[level].availableBuiltins);
        })
        .join(",\n")
    )}</td><td>${sanitize(
      lang
        .evaluate(test.output, getBuiltins(level))
        .toString(LEVELS[level].availableBuiltins)
    )}</td><td id="test-${index}"></td></tr>`;
  });

  code.value = solutions.get(LEVELS[level].builtinName)?.text ?? "";
  saved = true;

  if (level < available) next.removeAttribute("disabled");
  else next.setAttribute("disabled", "true");

  if (level > 0) back.removeAttribute("disabled");
  else back.setAttribute("disabled", "true");

  solutionRunner();
  code.focus();
}

gotoLevel(0);

back.addEventListener("click", () => {
  if (!saved) {
    if (solutions.get(LEVELS[level].builtinName) === undefined) {
      // no previous save - automatically save
      solutions.set(LEVELS[level].builtinName, {
        text: code.value,
        evaluated: solution,
      });
    } else if (
      !confirm("Are you sure you want to discard your unsaved solution?")
    ) {
      return;
    }
  }

  gotoLevel(level - 1);
});

saveSolution.addEventListener("click", (_ev) => {
  solutions.set(LEVELS[level].builtinName, {
    text: code.value,
    evaluated: solution,
  });

  saved = true;
});

next.addEventListener("click", (_ev) => {
  if (!saved) {
    if (solutions.get(LEVELS[level].builtinName) === undefined) {
      // no previous save - automatically save
      solutions.set(LEVELS[level].builtinName, {
        text: code.value,
        evaluated: solution,
      });
    } else if (
      !confirm("Are you sure you want to discard your unsaved solution?")
    ) {
      // you have to click the save button yourself
      return;
    }
  }

  gotoLevel(level + 1);
});

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
      lang.parse(replInput.value);
      const text = replInput.value;
      replInput.value = "";

      replOutput.innerHTML += `<span>&lt; ${sanitize(
        lang
          .evaluate(text, getBuiltins(level))
          .toString(LEVELS[level].availableBuiltins)
      )}</span><br/>`;
      replOutput.scrollTop = replOutput.scrollHeight;
    } catch (e) {
      replOutput.innerHTML += `<span class="text-danger">${sanitize(
        stringifyError(e)
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
