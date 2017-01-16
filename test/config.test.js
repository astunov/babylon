const assert = require('assert');
const config = require('../src/config');

// HELPERS
/**
 * Get date ddmm format
 * @param {Date} date to convert
 * @return {String} ddmm
 */
function formateDate(date) {
  let day = date.getDate().toString();
  let month = date.getMonth().toString();
  let formatedDate;

  if (day < 10) {
    day = 0 + day;
  }
  if (month < 10) {
    month = 0 + month;
  }
  formatedDate = day + month;
  return formatedDate;
}

// TESTS
describe('Task', () => {
  it('exist', () => {
    assert(config.task);
  });
});

describe('Config', () => {
  describe('Date', () => {
    it('exist', () => {
      assert(config.date);
    });
    it('format is ddmm', () => {
      assert(config.date.length === 4);
    });
    it('is correct', () => {
      if (config.date.length === 4) {
        let day = parseFloat(config.date.slice(0, 2));
        let month = parseFloat(config.date.slice(2));
        assert(day <= 31 && month <= 12);
      } else {
        assert(false);
      }
    });

    it('is upcoming', () => {
      assert(config.date >= formateDate(new Date()));
    });
  });

  describe('Source', () => {
    it('is only one', () => {
      let counter = 0;
      for (let key in config.source) {
        if (config.source[key].use) {
          counter++;
        }
      }
      assert(counter === 1);
    });
  });
});
