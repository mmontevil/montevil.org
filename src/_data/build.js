

const timestamp = new Date();

export default {
  env: process.env.NODE_ENV,
  timestamp,
  id: timestamp.valueOf(),
};
