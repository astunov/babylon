const assert = require('assert');
const data = require('../src/data/1.json');

describe('Data', () => {
  it('correct name shortcode', () => {
    let mistakes = [
      '\\$Full name\\$',
      '\\[\\[',
      '\\]\\]',
      '\\[',
      '\\]'
    ];
    let counter = 0;
    let mistakeRe;
    for (let key in data) {
      for (let subkey in data[key]) {
        mistakes.forEach(mistake => {
          mistakeRe = new RegExp(mistake);
          if (mistakeRe.test(data[key][subkey])) {
            counter++;
          }
        });
      }
    }
    assert(counter === 0);
  });
});
