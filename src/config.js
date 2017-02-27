// Email settings

/**
 * @namespace
 * @property {String}  task — task name, used in utm
 * @property {String}  date — actual date, used in utm
 * @property {Object}  source — list of email clients
 * @property {Boolean}  source.* — email client, used in utm && some unics moves for each
 * @property {String}  type —
 * @property {String}  prodSrc —
 * @property {String}  src —
 * @property {String}  alias — task alias used in utm (rewrites @task)
 * @property {String}  letterWidth — default value is 600px
 */

const CONFIG = {
  task: 'em430',
  date: '1611',
  source: {
    ems: {
      use: true,
      utm: 'fbs-eMS'
    },
    gr: {
      use: false,
      utm: 'fbs-gr360'
    },
    mt: {
      use: false,
      utm: 'email-MT'
    }
  },
  type: '' || 'promo',
  src: 'http://s.fbs.direct/custloads/761680031/2017/em575/1_01.jpg' || './i/',
  letterMaxWidth: 600
};

module.exports = CONFIG;
