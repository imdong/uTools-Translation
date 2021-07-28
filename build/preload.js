const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

// 检查配置文件是否存在
let config = {};
if (fs.existsSync(__dirname + '/config.js')) {
    config = require('./config');
}

window.exports = {
    crypto: crypto,
    https: https,
    config: config,
}
