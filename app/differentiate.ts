import './types'
import stringify from './stringify'

// the idea of the differentiate function is to take a token and return the derivative of that token recursively
// we have already created a tree of tokens, so we can just use that to differentiate
// we can then use the rules of differentiation to differentiate each token in turn
// we return a new tree that represents the derivative of the original tree


export default function differentiate(tree: Token): [Token, Step[]] {
  let steps: Step[] = [];
  // differentiate function must be able to return the derivative, but also return
  // the steps done to actually differentiate the expression
  return [helper(tree), steps];
  function helper(token: Token): Token {
    // use a switch case on the token we are looking at
    switch (token.type) {
      // if we have a variable x, we just return 1
      case "X":
        steps.push({
          title: 'Differentiate x',
          description: 'd/dx(x) = 1'
        })
        return {
          type: "constant",
          value: 1,
        };
      // in the case of a constant, pi or e, we just return 0
      case "constant":
      case "pi":
      case "e":
        steps.push({
          title: `Differentiate ${token.type}`,
          description: `d/dx(${token.type}) = 0`
        })
        return {
          type: "constant",
          value: 0,
        };
      // in the case of addition, we can just differentiate the left and right arguments and add them together
      case "add":
        steps.push({
          title: `Splitting the derivative across the addition,`,
          description: `d/dx(u + v) = d/dx(u) + d/dx(v)`
            .replaceAll('u', stringify(token.left))
            .replaceAll('v', stringify(token.right)),
        });
        return {
          type: "add",
          left: helper(token.left),
          right: helper(token.right)
        };
      // in the case of subtraction, we can just differentiate the left and right arguments and subtract them
      case "subtract":
        steps.push({
          title: `Splitting the derivative across the subtraction,`,
          description: `d/dx(u - v) = d/dx(u) - d/dx(v)`
            .replaceAll('u', stringify(token.left))
            .replaceAll('v', stringify(token.right)),
        })
        return {
          type: "subtract",
          left: helper(token.left),
          right: helper(token.right)
        };
      // in the case of multiplication, we can use the product rule and differentiate the left and right arguments
      // then use (uv)' = u'v + uv'
      case "multiply":
        steps.push({
          title: `Using product rule,`,
          description: `d/dx(u * v) = d/dx(u) * v + u * d/dx(v)`
            .replaceAll('u', stringify(token.left))
            .replaceAll('v', stringify(token.right))
        })
        return {
          type: "add",
          left: {
            type: "multiply",
            left: token.left,
            right: helper(token.right),
          },
          right: {
            type: "multiply",
            left: helper(token.left),
            right: token.right,
          }
        };
      // in the case of division, we can use the quotient rule and differentiate the left and right arguments
      // then use (u/v)' = (u'v - uv') / v ^ 2
      case "divide":
        steps.push({
          title: `Using quotient rule,`,
          description: `d/dx(u/v) = (d/dx(x) * v - u * d/dx(v)) / v^2`
            .replaceAll('u', stringify(token.left))
            .replaceAll('v', stringify(token.right)),
        })
        return {
          type: "divide",
          left: {
            type: "subtract",
            left: {
              type: "multiply",
              left: helper(token.left),
              right: token.right,
            },
            right: {
              type: "multiply",
              left: token.left,
              right: helper(token.right),
            }
          },
          right: {
            type: "power",
            left: token.right,
            right: {
              type: "constant",
              value: 2,
            }
          }
        };
      // in the case of sin, we can simply use the chain rule and differentiate the argument along with
      // using the identity that d/dx sin(x) = cos(x)
      case "sin":
        steps.push({
          title: `Differentiate sin + chain rule`,
          description: `d/dx(sin(u)) = cos(u) * d/dx(u)`
            .replaceAll('u', stringify(token.argument)),
        })
        return {
          type: "multiply",
          left: {
            type: "cos",
            argument: token.argument,
          },
          right: helper(token.argument)
        };
      // in the case of cos, we can simply use the chain rule and differentiate the argument along with
      // using the identity that d/dx cos(x) = -sin(x)
      case "cos":
        steps.push({
          title: `Differentiate cos + chain rule`,
          description: `d/dx(cos(u)) = -sin(u) * d/dx(u)`.replaceAll('u', stringify(token.argument)),
        })
        return {
          type: "multiply",
          left: {
            type: "subtract",
            left: {
              type: "constant",
              value: 0,
            },
            right: {
              type: "sin",
              argument: token.argument,
            }
          },
          right: helper(token.argument)
        };
      // in the case of tan, we can simply use the chain rule and differentiate the argument along with
      // using the identity that d/dx tan(x) = sec^2(x) but 1/cos(x) = sec(x)
      // as there is no direct implementation of sec(x), we can just use 1/cos(x) to substitute for it
      case "tan":
        steps.push({
          title: `Differentiate tan + chain rule`,
          description: `d/dx(tan(u)) = cos(u)^-2 * d/dx(u)`
            .replaceAll('u', stringify(token.argument)),
        })
        return {
          type: "multiply",
          left: {
            type: "power",
            left: {
              type: "cos",
              argument: token.argument,
            },
            right: {
              type: "constant",
              value: -2,
            }
          },
          right: helper(token.argument)
        };
      // in the case of ln, we can simply use the chain rule and differentiate the argument along with
      // using the identity that d/dx ln(x) = 1/x
      case "ln":
        steps.push({
          title: `Differentiate ln + chain rule`,
          description: `d/dx(ln(u)) = d/dx(u) / u`
            .replaceAll('u', stringify(token.argument)),
        })
        return {
          type: "divide",
          left: helper(token.argument),
          right: token.argument,
        };
      // in the case of exponentiation we can an identity or just the power rule
      case "power":
        // this is the case we simply x ^ n
        // we can just use the power rule, which states that d/dx x^n = nx^(n-1)
        if (token.left.type === "X" && token.right.type === "constant") {
          steps.push({
            title: `Differentiate power rule`,
            description: `d/dx(x^${token.right.value}) = ${token.right.value}x^${token.right.value - 1}`
          })
          return {
            type: "multiply",
            left: {
              type: "constant",
              value: token.right.value,
            },
            right: {
              type: "power",
              left: token.left,
              right: {
                type: "constant",
                value: token.right.value - 1,
              }
            }
          }
        }
        // the more general case is when we have f(x) ^ g(x)
        // the derivative of this is f(x) ^ g(x) * (g(x) * f'(x) / f(x) + g'(x) * ln(f(x)))
        steps.push({
          title: `Differentiate exponentiation rule`,
          description: `d/dx(u^v) = u^v * (v * d/dx(u) / u + d/dx(v) * ln(u))`
            .replaceAll('u', stringify(token.left))
            .replaceAll('v', stringify(token.right)),
        })
        return {
          type: "multiply",
          left: {
            type: "power",
            left: token.left,
            right: token.right,
          },
          right: {
            type: "add",
            left: {
              type: "multiply",
              left: helper(token.right),
              right: {
                type: "ln",
                argument: token.left,
              }
            },
            right: {
              type: "multiply",
              left: {
                type: "divide",
                left: token.right,
                right: token.left,
              },
              right: helper(token.left),
            }
          }
        };
      // in the case of abs, we can just use the chain rule and differentiate the inside of it

      case "abs":
        // no steps because useless at the moment - ignore for now and remove later
        return helper(token.argument);
    }
  }
}

