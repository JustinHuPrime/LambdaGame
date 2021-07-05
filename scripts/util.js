/**
 * @param {string} input
 */
export function sanitize(input) {
  const temp = document.createElement("div");
  temp.textContent = input;
  return temp.innerHTML;
}
