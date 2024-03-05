import './types'

// the equality checker between two expressions simply checks if they are the stringified versions are the same
// this is because JS/TS doesn't have a deep equality checker built in for my custom data structure
// it is easier just to use stringify in this case
function equality(expression1: Token, expression2: Token): boolean {
  return JSON.stringify(expression1) === JSON.stringify(expression2);
}

// simplification function is a recursive function that simplifies on each token

export default function simplify(expression: Token): Token {
  switch (expression.type) {
    // x, constants, pi and e cannot be simplified so we can simply just return it up the stack
    case "X":
    case "constant":
    case "pi":
    case "e":
      return expression;

    case "add":
      // in the case that we have two constants, we can simply add them together
      if (expression.left.type === "constant" && expression.right.type === "constant") {
        return {
          type: "constant",
          value: expression.left.value + expression.right.value,
        };
      }
      // in the case that we have 0 + x, we can simply return x
      if (expression.left.type === "constant" && expression.left.value === 0) {
        return simplify(expression.right);
      }
      // in the case that we have x + 0, we can simply return x
      if (expression.right.type === "constant" && expression.right.value === 0) {
        return simplify(expression.left);
      }
      // otherwise, we can't simplify, so we recursively simplify normally (the subtrees)
      return {
        type: "add",
        left: simplify(expression.left),
        right: simplify(expression.right),
      }

    case "subtract":
      // in the case that we have two constants, we can simply subtract them
      if (expression.left.type === "constant" && expression.right.type === "constant") {
        return {
          type: "constant",
          value: expression.left.value - expression.right.value,
        };
      }
      // in the case that we have 0 - x, we can simply return -x
      if (expression.left.type === "constant" && expression.left.value === 0) {
        return {
          type: "multiply",
          left: {
            type: "constant",
            value: -1,
          },
          right: simplify(expression.right),
        };
      }

      // in the case where we have x - x, we can simply return 0
      if (equality(expression.left, expression.right)) {
        return {
          type: "constant",
          value: 0,
        };
      }


      // in the case that we have x - 0, we can simply return x
      if (expression.right.type === "constant" && expression.right.value === 0) {
        return simplify(expression.left);
      }
      // otherwise, we can't simplify so we recursively simplify normally (the subtrees)
      return {
        type: "subtract",
        left: simplify(expression.left),
        right: simplify(expression.right),
      }

    case "multiply":
      // in the case that we have two constants, we can simply multiply them
      if (expression.left.type === "constant" && expression.right.type === "constant") {
        return {
          type: "constant",
          value: expression.left.value * expression.right.value,
        };
      }
      // in the case that we have 0 * x, we can simply return 0
      if (expression.left.type === "constant" && expression.left.value === 0) {
        return {
          type: "constant",
          value: 0,
        };
      }
      // in the case that we have x * 0, we can simply return 0
      if (expression.right.type === "constant" && expression.right.value === 0) {
        return {
          type: "constant",
          value: 0,
        };
      }
      // in the case that we have 1 * x, we can simply return x
      if (expression.left.type === "constant" && expression.left.value === 1) {
        return simplify(expression.right);
      }
      // in the case that we have x * 1, we can simply return x
      if (expression.right.type === "constant" && expression.right.value === 1) {
        return simplify(expression.left);
      }
      // this exists to turn x * 5 -> 5 * x -> 5x
      // otherwise the coefficient spotter code won't be able to recognise and simplify
      if (expression.right.type === "constant") {
        return simplify({
          type: "multiply",
          left: expression.right,
          right: expression.left,
        });
      }
      // otherwise, we can't simplify, so we recursively simplify normally (the subtrees)
      return {
        type: "multiply",
        left: simplify(expression.left),
        right: simplify(expression.right),
      }

    case "divide":
      // in the case that we have two constants, we can simply divide them
      if (expression.left.type === "constant" && expression.right.type === "constant") {
        return {
          type: "constant",
          value: expression.left.value / expression.right.value,
        };
      }
      // in the case that we have x / x, we can simply return 1
      if (equality(expression.left, expression.right)) {
        return {
          type: "constant",
          value: 1,
        };
      }
      // in the case that we have x / 1, we can simply return x
      if (expression.right.type === "constant" && expression.right.value === 1) {
        return simplify(expression.left);
      }
      // in the case that we have 0 / x, we can simply return 0
      if (expression.left.type === "constant" && expression.left.value === 0) {
        return {
          type: "constant",
          value: 0,
        }
      }
      // otherwise, we can't simplify, so we recursively simplify normally (the subtrees)
      return {
        type: "divide",
        left: simplify(expression.left),
        right: simplify(expression.right),
      }

    case "power":
      // in the case that we have 0 ^ x, we can simply return 0
      if (expression.left.type === "constant" && expression.left.value === 0) {
        return {
          type: "constant",
          value: 0,
        };
      }
      // in the case that we have x ^ 0, we can simply return 1
      if (expression.right.type === "constant" && expression.right.value === 0) {
        return {
          type: "constant",
          value: 1,
        };
      }
      // in the case that we have x ^ 1, we can simply return x
      if (expression.right.type === "constant" && expression.right.value === 1) {
        return simplify(expression.left);
      }
      // in the case that we have 1 ^ x, we can simply return 1
      if (expression.left.type === "constant" && expression.left.value === 1) {
        return {
          type: "constant",
          value: 1,
        };
      }
      // in the case that we have a constant to the power of another constant, we can simply evaluate it
      if (expression.left.type == "constant" && expression.right.type == "constant") {
        return {
          type: "constant",
          value: Math.pow(expression.left.value, expression.right.value),
        };
      }
      // if we have e to the power of ln of something, we can just take what is in the ln
      if (expression.left.type == "e" && expression.right.type == "ln") {
        return simplify(expression.right.argument);
      }
      // otherwise, we can't simplify, so we recursively simplify normally (the subtrees)
      return {
        type: expression.type,
        left: simplify(expression.left),
        right: simplify(expression.right),
      };

    case "sin":
      // sin doesn't have any obvious simplifications, so we just recursively simplify the argument
      return {
        type: expression.type,
        argument: simplify(expression.argument),
      }
    case "cos":
      // cos doesn't have any obvious simplifications, so we just recursively simplify the argument
      return {
        type: expression.type,
        argument: simplify(expression.argument),
      }
    case "tan":
      // tan doesn't have any obvious simplifications, so we just recursively simplify the argument
      return {
        type: expression.type,
        argument: simplify(expression.argument),
      }
    case "ln":
      // ln(a^b) = b*ln(a) so we can apply this rule directly
      if (expression.argument.type === "power") {
        return {
          type: "multiply",
          left: simplify(expression.argument.right),
          right: {
            type: "ln",
            argument: simplify(expression.argument.left),
          }
        }
      }
      // ln(e) = 1 so we can apply this rule directly
      if (expression.argument.type === "e") {
        return {type: "constant", value: 1};
      }
      // otherwise, we can't simplify, so we recursively simplify normally (the subtrees)
      return {
        type: expression.type,
        argument: simplify(expression.argument),
      }
    // anything else not caught can just be returned
    default:
      return expression;
  }
}

