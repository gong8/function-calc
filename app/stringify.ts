import './types'

// stringify function is a recursive function that stringifies each token in turn
// relatively trivial as just need to turn the binary operator tree back into a string
// this is essentially the reverse of parsing but much easier
export default function stringify(token: Token): string {
  // use a switch case on the token we are looking at
  switch (token.type) {
    // if we have a variable x, we just return x
    case "X":
      return "x";
    // if we have a constant, we just return the value of the constant
    case "constant":
      return token.value.toString();
    // if we have pi, we just return pi`
    case "pi":
      return "pi";
    // if we have e, we just return e
    case "e":
      return "e";
    // if we have an addition token, we return the left and right arguments with a + sign in the middle
    case "add":
      return `(${stringify(token.left)}+${stringify(token.right)})`;
    // if we have a subtraction token, we return the left and right arguments with a - sign in the middle
    case "subtract":
      return `(${stringify(token.left)}-${stringify(token.right)})`;
    // if we have a multiplication token, we return the left and right arguments with a * sign in the middle
    case "multiply":
      return `(${stringify(token.left)}*${stringify(token.right)})`;
    // if we have a division token, we return the left and right arguments with a / sign in the middle
    case "divide":
      return `(${stringify(token.left)}/${stringify(token.right)})`;
    // if we have a power token, we return the left and right arguments with a ^ sign in the middle
    case "power":
      return `(${stringify(token.left)}^${stringify(token.right)})`;
    // if we have a sin token, we return sin(argument)
    case "sin":
      return `sin(${stringify(token.argument)})`;
    // if we have a cos token, we return cos(argument)
    case "cos":
      return `cos(${stringify(token.argument)})`;
    // if we have a tan token, we return tan(argument)
    case "tan":
      return `tan(${stringify(token.argument)})`;
    // if we have a ln token, we return ln(argument)
    case "ln":
      return `ln(${stringify(token.argument)})`;
    // if we have an abs token, we return abs(argument)
    case "abs":
      return `abs(${stringify(token.argument)})`;
  }
}