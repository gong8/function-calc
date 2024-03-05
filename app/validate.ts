import './types'

export default function validate(input: string): number | string {
  // if input is not clean, then report back the error as a string,
  // if the input is fine, then return 0 to show that we can continue with the parser

  // check for misarranged brackets:
  let brackets: number = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] == "(") brackets++;
    if (input[i] == ")") brackets--;
    // if number of closing brackets is greater than opening brackets, then there is a problem
    if (brackets < 0) return "Misarranged brackets";
  }
  // if brackets is not zero at the end, this means there is not an equal amount of opening or closing brackets
  if (brackets != 0) return "Misarranged brackets";

  const validCharacters = "0123456789.x+-*/^() ";
  // remove the acceptable functions into a temporary string in order to not trigger the invalid character detector
  const tempString = input.replace(/sin|cos|tan|ln|e|pi/g, "");
  // check for unrecognised characters:
  for (let i = 0; i < tempString.length; i++) {
    if (!validCharacters.includes(tempString[i])) return "Unrecognised character(s)";
  }

  // check for incorrect use of operators:
  if (/[\^*/+-]{2,}/.test(input)) return "Incorrect use of operators";

  // check for incorrect decimal points:
  if (/\.\d*\.\d*/.test(input) || /\d*\.\d*\./.test(input)) return "Incorrect decimal point(s)";
  // also need to make sure every dot has a digit before and after it
  for (let i = 0; i < input.length; i++) {
    if (input[i] == ".") {
      if (i == 0 || i == input.length - 1) return "Incorrect decimal point(s)";
      if (isNaN(parseInt(input[i - 1])) || isNaN(parseInt(input[i + 1]))) return "Incorrect decimal point(s)";
    }
  }

  // input cleaned of basic errors, so can now return 0 to show it is fine
  return 0;
}
