'use strict';


// Test helper
const then = (callback, timeout) => {
  setTimeout(callback, timeout ? timeout : 10);
  return { then: then };
};


module.exports = then;
