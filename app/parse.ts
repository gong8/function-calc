import './types';

export default function parse(input: string): Token | null {
  // if the input cannot be parsed, return null to show error
  // if the input is valid, return the abstract syntax tree equivalent of the input

  // remove whitespaces from the initial input
  input = input.replace(/\s/g, "");

  // replace coefficient multiplication with the * operator
  input = input.replace(/(\d+)(e|pi|x)/g, (match, capture1, capture2): string => {
    return `${capture1}*${capture2}`;
  });

  // add multiply signs in bracketed multiplication
  input = input.replace(/([0-9)])\(/g, (match, capture1): string => {
    return `${capture1}*(`;
  });

  // now call the recursive function to create the abstract syntax tree

  try {
    return helper(input);
  } catch (e) {
    return null;
  }

  function helper(expression: string): Token {

    // we want to find +,-,/,*,^ that's not inside any brackets
    // we can easily maintain what level of brackets we're in
    // and go through the string, looking for each operation in turn


    let level = 0;
    // loop goes backwards as normally you would evaluate left to right
    for (let i = expression.length - 1; i >= 0; i--) {
      if (expression[i] === '(') level++;
      if (expression[i] === ')') level--;
      // only parse if we are in the outermost level of brackets
      if (level === 0) {
        // looking for +
        // addition and subtraction are the first things we want to parse due to reverse BODMAS order
        // + and - are on the same level of operator precedence
        if (expression[i] === '+') {
          // split the expression into left and right parts of the + sign
          return {
            type: "add",
            left: helper(expression.slice(0, i)),
            right: helper(expression.slice(i + 1))
          };
          // looking for -
        } else if (expression[i] === '-') {
          // checking if it is a unary - or binary -
          // regex checks whether it is unary or not, and if so parse it was -1 * whatever comes after
          if (i == 0 || /[-*(/^]/.test(expression[i - 1])) {
            return {
              type: "multiply",
              left: {
                type: "constant",
                value: -1,
              },
              right: helper(expression.slice(i + 1))
            }
          }
          // otherwise it is a binary - so we can parse it normally
          return {
            type: "subtract",
            left: helper(expression.slice(0, i)),
            right: helper(expression.slice(i + 1))
          };
        }
      }
    }


    // set the bracket level back to zero, as we're checking for a difference level of precedence of operator
    level = 0;
      for (let i = expression.length - 1; i >= 0; i--) {
        if (expression[i] === '(') level++;
        if (expression[i] === ')') level--;
        // only parse if we are in the outermost level of brackets
        if (level === 0) {
          // looking for *
          if (expression[i] === '*') {
            // split the expression into left and right parts of the * sign
            return {
              type: "multiply",
              left: helper(expression.slice(0, i)),
              right: helper(expression.slice(i + 1))
            };
            // looking for /
          } else if (expression[i] === '/') {
            // split the expression into left and right parts of the / sign
            return {
              type: "divide",
              left: helper(expression.slice(0, i)),
              right: helper(expression.slice(i + 1))
            };
          }
        }
      }

      // set the bracket level back to zero, as we're checking for a difference level of precedence of operator
      level = 0;
      for (let i = 0; i<expression.length; i++) {
        if (expression[i] === '(') level++;
        if (expression[i] === ')') level--;
        // only parse if we are in the outermost level of brackets
        if (level === 0) {
          // looking for ^
          if (expression[i] === '^') {
            // split the expression into left and right parts of the ^ sign
            return {
              type: "power",
              left: helper(expression.slice(0, i)),
              right: helper(expression.slice(i + 1))
            };
          }
        }
      }

    // set the bracket level back to zero, as we're checking for a difference level of precedence of operator
    level = 0;
      for (let i = 0; i < expression.length; i++) {
        if (expression[i] === '(') level++;
        if (expression[i] === ')') level--;
        // only parse if we are in the outermost level of brackets
        // we are now only looking for unary operators
        if (level === 0) {
          // looking for sin
          if (expression.slice(0, 3) === 'sin') {
            // return what is the argument of sin
            return {
              type: "sin",
              argument: helper(expression.slice(i+3))
            };
          // looking for cos
          } else if (expression.slice(0, 3) === 'cos') {
            // return what is the argument of cos
            return {
              type: "cos",
              argument: helper(expression.slice(i+3))
            };
          // looking for tan
          } else if (expression.slice(0, 3) === 'tan') {
            // return what is the argument of tan
            return {
              type: "tan",
              argument: helper(expression.slice(i+3))
            };
          // looking for abs
          } else if (expression.slice(0, 3) === 'abs') {
            // return what is the argument of abs
            return {
              type: "abs",
              argument: helper(expression.slice(i+3))
            };
          // looking for ln
          } else if (expression.slice(0, 2) === 'ln') {
            // return what is the argument of ln (notice ln is only 2 characters long, unlike 3)
            return {
              type: "ln",
              argument: helper(expression.slice(i+2))
            };
          }
        }
      }

      // if we haven't returned anything by the end
      // then the expression is either:
      // - a pair of brackets surrounding something
      // - a constant
      // - pi
      // - X

      if (expression[0] === '(') {
        // this just removes the brackets and parses what is inside
        return helper(expression.slice(1, -1));
      } else if (expression === 'x') {
        // return x as a token
        return {
          type: "X"
        };
        // return pi as a token
      } else if (expression === 'pi') {
        return {
          type: "pi"
        };
        // return e as a token
      } else if (expression === 'e') {
        return {
          type: "e"
        };
        // if we see an empty string, this shouldn't be possible, so we return an error
      } else if (expression === '') {
        throw new Error("Empty string");
      } else if (/^\d+(\.\d+)?$/.test(expression)) {
        // if we see a number, then we can return it as a constant (notice we are checking for decimal points optionally)
        return {
          type: "constant",
          value: parseFloat(expression),
        };
        // if we find anything else, then we have an error and the input must not have been correct in the first place
      } else {
        throw new Error("Invalid input");

      }

  }
}