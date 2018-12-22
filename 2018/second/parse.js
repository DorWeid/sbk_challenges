const fs = require('fs');
const median = require('median')
const tm = require( 'text-miner' );
var Gematria = require('gematria');

const firstTest = (parsed) => {
  const {text, value} = parsed;
  let sum = 0;

  for (let index = 0; index < text.length; index++) {
    sum += text.charCodeAt(index);
  }

  return sum === parseInt(value, 10);
}

const getStatistics = data => {
  const sortedArray = [];
  for (const outerHexKey in data) {
    const arr = data[outerHexKey];

    arr.forEach((d,idx) => {
      const keys = Object.keys(d);

      // console.log(`\t[${idx}]. 
      //   \tLength of ${keys[0]}: ${d[keys[0]].length}
      //   \tValue: ${d.value}
      // `);

      sortedArray.push({length: d[keys[0]].length, text: d[keys[0]], value: d.value, outerHexKey, arrayIndex: idx});
    })
  }

  sortedArray.sort((a,b) => {
    return a.length - b.length;
  })

  return (sortedArray);
}

function unicodeToChar(text) {
  return text.replace(/\\u[\dA-F]{4}/gi, 
         function (match) {
              return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
         });
}

const extractUnicodes = string => {
  let str = '';
  for (let index = 0; index < string.length; index++) {
    const curChar = string[index];
    
    if (curChar === 'u') {
      str += unicodeToChar('\\'+string.substring(index, index + 5));
    }        
  }

  return str;
}

const toBase64 = string => Buffer.from(string).toString('base64')

const main = () => {
  fs.readFile('WhoAmI.json', (err, data) => {
    if (err) {
      throw err;
    }

    const parsedObject = JSON.parse(data);
    const values = [];

    const outerKeys = Object.keys(parsedObject);

    for (const outerHexKey in parsedObject) {
      const arr = parsedObject[outerHexKey];

      arr.forEach(d => {
        const keys = Object.keys(d);
        if (d.value !== '?') values.push(d.value)
        if (keys.includes('text')) return;
        console.log(`${outerHexKey}. ${keys[0]}`)
      })
    }

    const sortedArray = getStatistics(parsedObject);

    sortedArray.forEach(o => {
      const gematriaValue = Gematria(extractUnicodes(o.text)).toMisparGadol();
      if (o.value === '?') {
        o.value = gematriaValue;
      } else {
        if (gematriaValue !== o.value) {
          throw new Error('error')
        }
      }
    })

    sortedArray.sort((a,b) => {
      return a.value - b.value;
    })
    
    let sum = 0;
    for (let index = 0; index < sortedArray.length / 2; index++) {
      const element = sortedArray[index];
      sum += parseInt(element.value, 10);
    }
    console.log(toBase64(sum.toString()))

    // sortedArray.filter(o => o.value < 12227).map(o => sum += o.value);
    // console.log(toBase64(sum.toString()))
    // console.log('Values length: ', values.length)
    // const med = median([].concat(values));
    // console.log('Median: ', med);

    // const belowMedian = values.filter(v =>{
    //   return v < med;
    // });

    // console.log('Below median length: ', belowMedian.length)
    // let sumBelowMedian = 0;

    // belowMedian.forEach(b => sumBelowMedian += b);
    // console.log(sumBelowMedian)
    // console.log(Buffer.from(sumBelowMedian.toString()).toString('base64'))

    let medianSum = 0;

    ['0x1', '0x12c', '0x14', '0x190'].map(k => {
      sortedArray.filter(o => o.outerHexKey === k).forEach(o => {
        if (o.outerHexKey === '0x190') {
          // if (o.arrayIndex === 0) medianSum += o.value;
        } else {
          medianSum += o.value;
        }
      })
    });

    console.log(medianSum)
  })
}

main();