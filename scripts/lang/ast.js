export class ASTNode {}

export class IdNode extends ASTNode {
  /**
   * @param {string} id
   */
  constructor(id) {
    super();

    /** @type {string} */
    this.id = id;
  }
}

export class LambdaNode extends ASTNode {
  /**
   * @param {string} arg
   * @param {ASTNode} body
   */
  constructor(arg, body) {
    super();

    /** @type {string} */
    this.arg = arg;
    /** @type {ASTNode} */
    this.body = body;
  }
}

export class ApplicationNode extends ASTNode {
  /**
   * @param {ASTNode} fn
   * @param {ASTNode} arg
   */
  constructor(fn, arg) {
    super();

    /** @type {ASTNode} */
    this.fn = fn;
    /** @type {ASTNode} */
    this.arg = arg;
  }
}

/**
 * @param {string} input
 * @returns {(string | null)[]}
 */
function tokenize(input) {
  const trimmed = input.trim();

  if (trimmed === "") {
    return [];
  }

  const lparen = trimmed.match(/^\(/);
  if (lparen !== null) {
    const retval = tokenize(trimmed.substr(lparen[0].length));
    retval.unshift(lparen[0]);
    return retval;
  }

  const rparen = trimmed.match(/^\)/);
  if (rparen !== null) {
    const retval = tokenize(trimmed.substr(rparen[0].length));
    retval.unshift(rparen[0]);
    return retval;
  }

  const backslash = trimmed.match(/^\\/);
  if (backslash !== null) {
    const retval = tokenize(trimmed.substr(backslash[0].length));
    retval.unshift(backslash[0]);
    return retval;
  }

  const dot = trimmed.match(/^\./);
  if (dot !== null) {
    const retval = tokenize(trimmed.substr(dot[0].length));
    retval.unshift(dot[0]);
    return retval;
  }

  const id = trimmed.match(/^[^.()\\\s]+/);
  if (id !== null) {
    const retval = tokenize(trimmed.substr(id[0].length));
    retval.unshift(id[0]);
    return retval;
  }

  throw new Error("string.trim is broken - unexpected whitespace");
}

/**
 * @param {string} input
 * @returns {(string | null)[]}
 */
export function parse(input) {
  throw new Error("something bad!");
  return tokenize(input);
}
