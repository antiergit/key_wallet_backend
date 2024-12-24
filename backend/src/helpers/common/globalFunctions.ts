import { config } from "../../config";
// var aws = require("aws-sdk");
var BigNumber = require('bignumber.js');
// var s3 = new aws.S3({
//   accessKeyId: config.S3_ACCESSID,
//   secretAccessKey: config.S3_SECRETKEY,
//   region: config.REGION
// });


export const exponentialToDecimal = function (exponential: number) {
  let decimal: string = exponential.toString().toLowerCase();
  if (decimal.includes('e+')) {
    const exponentialSplitted: any = decimal.split('e+');
    let postfix: any = '';
    for (
      let i: number = 0;
      i <
      +exponentialSplitted[1] -
      (exponentialSplitted[0].includes('.')
        ? exponentialSplitted[0].split('.')[1].length
        : 0);
      i++
    ) {
      postfix += '0';
    }
    const addCommas: any = (text: string) => {
      let j: number = 3;
      let textLength: number = text.length;
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
    decimal = addCommas(exponentialSplitted[0].replace('.', '') + postfix);
  }
  if (decimal.toLowerCase().includes('e-')) {
    const exponentialSplitted: any = decimal.split('e-');
    let prefix: any = '0.';
    for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
      prefix += '0';
    }
    decimal = prefix + exponentialSplitted[0].replace('.', '');
  }
  return decimal;
};




export const bigNumberSafeMath = function (
  c: string,
  operation: string,
  d: string | number,
  precision?: number
) {
  BigNumber.config({ DECIMAL_PLACES: 18 });
  var a = new BigNumber(c);
  var b = new BigNumber(typeof d === 'number' ? d.toString() : d);
  var rtn;
  // Figure out which operation to perform.
  switch (operation.toLowerCase()) {
    case '-':
      rtn = a.minus(b);
      break;
    case '+':
      rtn = a.plus(b);
      break;
    case '*':
    case 'x':
      rtn = a.multipliedBy(b);
      break;
    case '÷':
    case '/':
      rtn = a.dividedBy(b);
      break;
    default:
      //operator = operation;
      break;
  }
  return rtn;
};
export const bigNumberSafeConversion = function (val: number): number {
  var amount = val.toString();
  var value = new BigNumber(amount);
  return value.toFixed();
};
// export async function iconInstances(file: any) {
//   // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'];
//   // let types=allowedTypes.includes(file.mimetype);

//   const params = {
//     Bucket: config.S3_BUCKET, // bucket you want to upload to
//     Key: `uploads/-${Date.now()}-${file.name}`, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
//     Body: file.data,
//     ACL: "public-read",
//   };
//   const data = await s3.upload(params).promise();
//   console.log("data######!!!!!!!!!!!!!!####%", data.Location);
//   return data.Location; // returns the url location
// }

// export async function multerInstances(file: any, type: any) {
//   // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'];
//   // let types=allowedTypes.includes(file.mimetype);

//   console.log("INSIDE FILE", file)
//   const params = {
//     Bucket: config.S3_BUCKET, // bucket you want to upload to
//     Key: `uploads/-${Date.now()}-${file.name}`, // put all image to fileupload folder with name scanskill-${Date.now()}${file.name}`
//     Body: file.data,
//     ACL: "public-read",
//   };
//   console.log("params@@@", params)
//   const data = await s3.upload(params).promise();
//   console.log("data######!!!!!!!!!!!!!!####%", data.Location);
//   return { url: data.Location, type: type }; // returns the url location
// }
