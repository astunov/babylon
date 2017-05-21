// Email settings

/**
 * @namespace
 * @property {String}  task — task name, used in utm
 * @property {String}  date — actual date, used in utm ddmm format
 * @property {Object}  source — list of email clients
 * @property {Boolean}  source.* — email client, used in utm
 * && some unics moves for each
 * @property {String}  type —
 * @property {String}  prodSrc —
 * @property {String}  src —
 * @property {String}  alias — task alias used in utm (rewrites @task)
 * @property {String}  letterWidth — default value is 600px
 */

const CONFIG = {
  task: '$taskName$',
  date: '2205',
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
  src: 'http://s.fbs.direct/custloads/761680031/2017/$taskName$/' || './i/',
  letterMaxWidth: 600
}

module.exports = CONFIG
