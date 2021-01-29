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
  monthString: (month) => {
    // transforms "2020/02" into "February 2020"
    let fullDate = `${month.replace('/', '-')}-01T10:00:00.000Z`;
    return moment(fullDate).format('MMMM YYYY');
  },
  attributeDate: (date) => {
    return moment(date).format('YYYY-MM-DD');
  },
  permalinkDate: (date) => {
    return moment(date).format('YYYY/MM/DD');
  },
};
