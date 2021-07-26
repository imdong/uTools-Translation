const crypto = require('crypto');
const https = require('https')

window.exports = {
    crypto: crypto,
    https: https,
    sys_env: {
        mac: utools.isMacOs(),
        window: utools.isWindows(),
        linux: utools.isLinux()
    },
    copy: (text) => {
        utools.copyText(text);
        utools.hideMainWindow();
    }
}
