// we need a base token interface, and then a token interface for each type of token
interface BaseToken {
  type: string;
};
// we have a type token which can take any of the following types
type Token = X | PI | E | Constant | Add | Subtract | Multiply | Divide | Power | Sin | Cos | Tan | Ln | Abs;
// type of x (as in the unknown parameter of the function)
interface X extends BaseToken {
  type: "X";
};
// type of pi
interface PI extends BaseToken {
  type: "pi";
};
// type of e
interface E extends BaseToken {
  type: "e";
};
// type of constant - a number (can be negative or a decimal)
interface Constant extends BaseToken {
  type: "constant";
  value: number;
};
// addition token, has left and right arguments
interface Add extends BaseToken {
  type: "add";
  left: Token;
  right: Token;
};
// subtraction token, has left and right arguments
interface Subtract extends BaseToken {
  type: "subtract";
  left: Token;
  right: Token;
};
// multiplication token, has left and right arguments
interface Multiply extends BaseToken {
  type: "multiply";
  left: Token;
  right: Token;
};
// division token, has left and right arguments
interface Divide extends BaseToken {
  type: "divide";
  left: Token;
  right: Token;
};
// power token, has left and right arguments
interface Power extends BaseToken {
  type: "power";
  left: Token;
  right: Token;
};

// sin token, only has one argument
interface Sin extends BaseToken {
  type: "sin";
  argument: Token;
};
// cos token, only has one argument
interface Cos extends BaseToken {
  type: "cos";
  argument: Token;
};
// tan token, only has one argument
interface Tan extends BaseToken {
  type: "tan";
  argument: Token;
};
// ln token, only has one argument
interface Ln extends BaseToken {
  type: "ln";
  argument: Token;
};
// abs token, only has one argument
interface Abs extends BaseToken {
  type: "abs";
  argument: Token;
};

type Step = {
  title: string;
  description : string;
}



