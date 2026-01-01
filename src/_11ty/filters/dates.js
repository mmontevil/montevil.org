import { DateTime } from "luxon";

export const date = (dateValue, format) => {
  if (!dateValue || dateValue === '2100-01-01') return 'Submitted';
  if(format==="YYYY")
    return DateTime.fromISO(dateValue).toFormat('yyyy');
  if(format==="YYYYMMDD")
    return DateTime.fromISO(dateValue).toISODate()?.replace("-","");
};

export const formattedDate = (dateValue) => {
    return DateTime.fromISO(dateValue).toFormat('dd LLL yyyy');
};

export const formattedDateShort = (dateValue) => {
  return DateTime.fromISO(dateValue).toFormat('LLL yyyy');
};

export const attributeDate = (dateValue) => {
  return DateTime.fromISO(dateValue).toISODate() ;
};
export const formatDateUTC = (date, locale = 'en') => {
  if (!(date instanceof Date)){ return date;}

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
