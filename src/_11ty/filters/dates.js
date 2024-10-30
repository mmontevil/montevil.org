const moment = require('moment');

module.exports = {
  date: (date, format) => {
    return moment(date).format(format);
  },
  formattedDate: (date) => {
    return moment(date).format('Do MMMM YYYY');
  },
  formattedDateShort: (date) => {
    return moment(date).format('MMM YYYY');
  },
  attributeDate: (date) => {
    return moment(date).format('YYYY-MM-DD');
  },
};
