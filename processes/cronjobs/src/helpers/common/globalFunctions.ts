var BigNumber = require("bignumber.js");

export const bigNumberSafeMath = function (
  c: string,
  operation: string,
  d: string | number,
  precision?: number
) {
  BigNumber.config({ DECIMAL_PLACES: 18 });
  var a = new BigNumber(c);
  var b = new BigNumber(typeof d === "number" ? d.toString() : d);
  var rtn;
  // Figure out which operation to perform.
  switch (operation.toLowerCase()) {
    case "-":
      rtn = a.minus(b);
      break;
    case "+":
      rtn = a.plus(b);
      break;
    case "*":
    case "x":
      rtn = a.multipliedBy(b);
      break;
    case "÷":
    case "/":
      rtn = a.dividedBy(b);
      break;
    default:
      //operator = operation;
      break;
  }
  return rtn;
};
export const exponentialToDecimal = function (exponential: number) {
  let decimal: string = exponential.toString().toLowerCase();
  if (decimal.includes("e+")) {
    const exponentialSplitted = decimal.split("e+");
    let postfix = "";
    for (
      let i = 0;
      i <
      +exponentialSplitted[1] -
      (exponentialSplitted[0].includes(".")
        ? exponentialSplitted[0].split(".")[1].length
        : 0);
      i++
    ) {
      postfix += "0";
    }
    const addCommas = (text: string) => {
      let j = 3;
      let textLength = text.length;
      while (j < textLength) {
        text = `${text.slice(0, textLength - j)}${text.slice(
          textLength - j,
          textLength
        )}`;
        textLength++;
        j += 3 + 1;
      }
      return text;
    };
    decimal = addCommas(exponentialSplitted[0].replace(".", "") + postfix);
  }
  if (decimal.toLowerCase().includes("e-")) {
    const exponentialSplitted = decimal.split("e-");
    let prefix = "0.";
    for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
      prefix += "0";
    }
    decimal = prefix + exponentialSplitted[0].replace(".", "");
  }
  return decimal;
};