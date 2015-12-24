"use strict";

module.exports = function debug(log) {
    if (process.env.DEBUG) {
        console.log(log);
    }
};