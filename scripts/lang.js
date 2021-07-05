export class Closure {
  /**
   * @param {Map<string, Closure>} env
   * @param {LambdaNode} body
   */
  constructor(env, body) {
    this.env = env;
    this.lambda = body;
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.lambda.toString();
  }
}

export class EvalError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "error";
  }
}

export class ASTNode {
  constructor() {}

  /**
   * @param {Map<string, Closure>} env
   * @returns {Closure}
   */
  evaluate(env) {
    throw new Error(
      `attempted to call 'toString' on abstract class ${this.constructor.name}`
    );
  }

  /**
   * @returns {string}
   */
  toString() {
    throw new Error(
      `attempted to call 'toString' on abstract class ${this.constructor.name}`
    );
  }
}

export class IdNode extends ASTNode {
  /**
   * @param {string} id
   */
  constructor(id) {
    super();

    /** @type {string} */
    this.id = id;
  }

  /**
   * @param {Map<string, Closure>} env
   * @returns {Closure}
   */
  evaluate(env) {
    const value = env.get(this.id);
    if (value === undefined) {
      throw new EvalError(`undefined variable: ${this.id}`);
    } else {
      return value;
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.id;
  }
}

export class LambdaNode extends ASTNode {
  /**
   * @param {IdNode} arg
   * @param {ASTNode} body
   */
  constructor(arg, body) {
    super();

    /** @type {string} */
    this.arg = arg.id;
    /** @type {ASTNode} */
    this.body = body;
  }

  /**
   * @param {Map<string, Closure>} env
   * @returns {Closure}
   */
  evaluate(env) {
    return new Closure(new Map(env), this);
  }

  /**
   * @returns {string}
   */
  toString() {
    return `(\\${this.arg}.${this.body})`;
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

  /**
   * @param {Map<string, Closure>} env
   * @returns {Closure}
   */
  evaluate(env) {
    const fn = this.fn.evaluate(env);
    const arg = this.arg.evaluate(env);
    return fn.lambda.body.evaluate(new Map(fn.env).set(fn.lambda.arg, arg));
  }

  /**
   * @returns {string}
   */
  toString() {
    return `(${this.fn} ${this.arg})`;
  }
}

/**
 * @param {string} input
 * @returns {string[]}
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

export class ParseError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "parse error";
  }
}

/**
 * @param {string[]} tokens
 * @returns {IdNode}
 */
function parseId(tokens) {
  const token = tokens.shift();
  switch (token) {
    case "(":
    case ")":
    case "\\":
    case ".": {
      throw new ParseError(`expected identifier, got '${token}'`);
    }
    case undefined: {
      throw new ParseError(`expected identifier, got end-of-input`);
    }
    default: {
      return new IdNode(token);
    }
  }
}

/**
 * @param {string[]} tokens
 * @param {string} punctuation
 */
function expect(tokens, punctuation) {
  const token = tokens.shift();
  if (token !== punctuation) {
    throw new ParseError(`expected '${punctuation}', got '${token}'`);
  }
}

/**
 * @param {string[]} tokens
 * @param {string} punctuation
 */
function peek(tokens, punctuation) {
  const token = tokens[0];
  if (token === punctuation) {
    tokens.shift();
    return true;
  } else {
    return false;
  }
}

/**
 * @param {string[]} tokens
 * @returns {ASTNode}
 */
function parseExpression(tokens) {
  const token = tokens.shift();
  switch (token) {
    case "(": {
      // lambda or application
      if (peek(tokens, "\\")) {
        // lambda
        const arg = parseId(tokens);
        expect(tokens, ".");
        const body = parseExpression(tokens);
        expect(tokens, ")");
        return new LambdaNode(arg, body);
      } else {
        // application
        const fn = parseExpression(tokens);
        const arg = parseExpression(tokens);
        expect(tokens, ")");
        return new ApplicationNode(fn, arg);
      }
    }
    case "\\":
    case ")":
    case ".":
    case undefined: {
      throw new ParseError(
        `expected identifier or '(', got '${token ?? "end-of-input"}'`
      );
    }
    default: {
      // id node
      return new IdNode(token);
    }
  }
}

/**
 * @param {string} input
 * @returns {ASTNode}
 */
export function parse(input) {
  return parseExpression(tokenize(input));
}
