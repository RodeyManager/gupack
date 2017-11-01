/**
 * Created by Rodey on 2017/10/31
 * parse request url to body middleware
 */
"use strict";

const url             = require('url');

module.exports = (req, res) => {
    req.body = url.parse(req.url);
};