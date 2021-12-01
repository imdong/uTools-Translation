// 将本文件重命名为 config.js
const config = {
    options: {
        tencent: {
            secret_id: '',
            secret_key: ""
        },
        aliyun: {
            access_key_id: '',
            access_key_secret: ''
        },
        caiyun: {
            token: ''
        },
        baidu: {
            appid: '',
            token: ''
        },
    },
    ui_default: {
        default: 'google',
        direction: 'auto'
    }
}

module.exports = config;