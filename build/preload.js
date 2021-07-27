const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

// 列出目录下文件
function listFiles(dir, fileList) {
    fs.readdir(dir, function(err, files) {
        console.log(err, files);
        if (err) {
            return;
        }
        files.forEach(function(file) {
            fileList.push(dir + '/' + file);
        });
        console.log(fileList);
    });
}


listFiles('./lib/', fileList);




window.exports = {
    crypto: crypto,
    https: https
}
