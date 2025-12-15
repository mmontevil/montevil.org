import moment from "moment";

export const date = (dateValue, format) => {
  return moment(dateValue).format(format);
};

export const formattedDate = (dateValue) => {
  return moment(dateValue).format("Do MMMM YYYY");
};

export const formattedDateShort = (dateValue) => {
  return moment(dateValue).format("MMM YYYY");
};

export const attributeDate = (dateValue) => {
  return moment(dateValue).format("YYYY-MM-DD");
};
