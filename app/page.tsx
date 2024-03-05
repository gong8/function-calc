'use client';

// importing the graphing library
import functionPlot from 'function-plot'
// importing the React library components for effects and states
import React, {useEffect, useRef, useState} from 'react';
// import my own functions from parse, validate, differentiate, stringify and simplify
import parse from './parse';
import validate from './validate';
import differentiate from './differentiate';
import stringify from './stringify';
import simplify from './simplify';
// import the types from types.ts
import './types';
// import the Chakra UI components
import {
  Card,
  CardBody,
  ChakraProvider,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Input,
  VStack,
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Switch,
  useSteps,
  Text
} from '@chakra-ui/react'

// set the width and height of the graphing library


// set whether to simplify the derivative and to allow the parser to be disabled
const doSimplify = true;
const disableParser = false;

// NextJS component that renders the main page
export default function Home() {
  // graph rendering function using function-plot js library
  function renderGraph() {
    functionPlot({
      target: "#graph",
      width: graphWidth!,
      height: graphHeight!,
      grid: true,
      data: [
        {
          fn: desymbolise(expression),
          graphType: 'polyline',
          derivative: {
            fn: desymbolise(unsimplifiedDerivative, true),
            updateOnMouseMove: true
          },
          range: (desymbolise(expression) == "0") ? [0, 0] : [-Infinity, Infinity],
          skipTip: desymbolise(expression) == "0",

        },
        {
          fn: desymbolise(unsimplifiedDerivative, true),
          graphType: 'polyline',
          color: 'red',
          skipTip: true,
          range: (!toShowDerivativeGraph || desymbolise(expression) == "0") ? [0, 0] : [-Infinity, Infinity],

        }
      ]
    })
  }


  function desymbolise(input: string, isDerivative: boolean = false): string {
    input = input
      .replace(/e/g, Math.E.toString())
      .replace(/pi/g, Math.PI.toString())
    input = input.replace(/ln/g, "log");
    return input;
  }

  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expression, setExpression] = useState<string>("0");
  const [unsimplifiedDerivative, setUnsimplifiedDerivative] = useState<string>("0");
  const [derivative, setDerivative] = useState<string>("0");
  const [isTreeValid, setIsTreeValid] = useState<boolean>(true);
  const [toShowDerivativeGraph, setShowDerivativeGraph] = useState<boolean>(false);
  const [steps, setSteps] = useState<Step[]>([]);

  let container = useRef(null);
  let [graphHeight, setGraphHeight] = useState(null);
  let [graphWidth, setGraphWidth] = useState(null);
  function handleResize() {
    // @ts-ignore
    setGraphHeight(container.current!.offsetHeight);
    // @ts-ignore
    setGraphWidth(container.current!.offsetWidth);
  }
  useEffect(() => void setTimeout(() => isTreeValid && renderGraph(), 50),
    [expression, toShowDerivativeGraph, graphHeight, graphWidth]);

  useEffect(() => {
    handleResize();
    addEventListener("resize", handleResize);
    return () => removeEventListener("resize", handleResize);
  }, []);

  function formatOutput(input: string): string {
    return input
      .replace(/-1\*/g, "-")
      .replace(/(\d+)\*x/g, "$1x")

  }



  function listen(ev: React.ChangeEvent<HTMLInputElement>) {
    // read the input from the text box
    const input: string = ev.target.value;
    // validatedResult says 0 is valid and an error message is invalid
    const validatedResult = validate(input);
    let tree: Token | null = null;
    // now if either the parser is disabled or the input is empty, then don't render anything
    if (disableParser || input == "") {
      tree = {type: "constant", value: 0};
    } else {
      tree = parse(input);
    }

    if (validatedResult !== 0) {
    // if (false) {
      setIsInvalid(true);
      setErrorMessage(validatedResult.toString());
    } else if (tree == null) {
      setIsInvalid(true);
      setErrorMessage("Invalid input");
    } else {
      setIsInvalid(false);
      console.log(tree);
      // simplify the tree before we differentiate it
      if (doSimplify) {
        let prevTree = tree;
        do {
          prevTree = tree;
          tree = simplify(tree);
        } while (stringify(prevTree) !== stringify(tree));
        tree = simplify(tree);
      }
      setExpression(stringify(tree));


      let derivativeTree: Token = differentiate(tree)[0];
      console.log(derivativeTree);
      setSteps(differentiate(tree)[1]);
      setUnsimplifiedDerivative(stringify(derivativeTree));
      if (doSimplify) {
        let prevTree = derivativeTree;
        do {
          prevTree = derivativeTree;
          derivativeTree = simplify(derivativeTree);
        } while (stringify(prevTree) !== stringify(derivativeTree));
        derivativeTree = simplify(derivativeTree);
      }

      setDerivative(formatOutput(stringify(derivativeTree)));

    }

  }
  function toggleDerivativeGraph(ev: React.ChangeEvent<HTMLInputElement>) {
    setShowDerivativeGraph(ev.target.checked);
  }

  const { activeStep } = useSteps({
    index: -1,
    count: steps.length,
  });



  return (
    <ChakraProvider>
      <HStack height={"100%"} alignItems={"flex-start"} padding={"1em"}>
        <VStack margin={"2em"} alignItems={"flex-start"} maxWidth={"45%"} width = {"45%"} minWidth={"45%"} height={"100%"} maxHeight={"920px"} overflow={"scroll"}>
          <Heading>
            Function Calculator
          </Heading>
          <HStack width={"100%"} marginTop={"1em"}alignItems={"flex-start"}>
            <Card variant={"filled"} flexShrink={0} padding={0} minWidth={"120px"}>
              <CardBody fontSize={"24px"} fontWeight={"extrabold"} textAlign={"center"}>
                <Text noOfLines={1}>
                  f(x) =
                </Text>
              </CardBody>
            </Card>
            <FormControl isInvalid={isInvalid}>
              <Input
                padding={'30px'}
                variant='filled'
                placeholder='Input function here'
                fontSize={"24px"}
                onChange={ev => listen(ev)}
                height={'76px'}
                flexShrink={1}
              />
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            </FormControl>
          </HStack>

          <HStack width={"100%"} marginTop={"0em"} alignItems={"flex-start"}>
            <Card variant={"outline"} marginTop={"1em"} flexShrink={0} minWidth={"120px"}>
              <CardBody fontSize={"24px"} fontWeight={"extrabold"} textAlign={"center"} >
                <Text>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  f'(x) =
                </Text>

              </CardBody>
            </Card>
            <Card variant={"outline"} marginTop={"1em"} justifySelf={"flex-end"} display={"flex"} >
              <CardBody fontSize={"24px"} paddingLeft={'30px'} paddingRight={'30px'}>
                {expression == "0" ? "..." : derivative}
              </CardBody>
            </Card>
          </HStack>
        <Card marginTop={"1em"} variant={"unstyled"}>
          <CardBody flexDirection={"row"} display={"flex"}>
            <Switch onChange={ev => toggleDerivativeGraph(ev)} margin={"0.1em"}/>
            <Text marginLeft={"0.5em"} marginRight={"0.3em"}>Show derivative graph</Text>
          </CardBody>
        </Card>

        <Box id="graph" margin={'2em'} padding={'0em'} ref={container} width={"100%"} height={"100%"}></Box>




        </VStack>
        <VStack margin={"1em"} height={"100%"} overflow={"scroll"} width={"100%"} alignItems={"flex-start"}>
          <Stepper index={activeStep} orientation={"vertical"} margin={"2em"}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        </VStack>
      </HStack>
    </ChakraProvider>
  )
}
