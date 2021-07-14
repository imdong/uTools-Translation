(function () {
    const appid = '20210714000888248';
    const token = 'YJNBayc403EAG6Fesvy9';
    const languageMap = {
        zhcn: "zh",
        en: "en",
    };

    function buildSignature(post_body) {
        let body = post_body.appid + post_body.q + post_body.salt + token;
        console.log(body)
        return exports.crypto.createHash("md5").update(body).digest("hex");
    }

    let sdk = function () { }

    sdk.prototype.go = function (text, source, target, cb) {
        let post_body = {
            q: text,
            from: languageMap[source],
            to: languageMap[target],
            appid: appid,
            salt: Math.random().toString().split('.')[1],
        }

        post_body.sign = buildSignature(post_body);

        let body = [];
        for (const key in post_body) {
            body.push(`${key}=${encodeURIComponent(post_body[key])}`);
        }

        ajax('https://fanyi-api.baidu.com/api/trans/vip/translate', body.join('&'), result => {
            cb(JSON.parse(result).trans_result[0].dst);
        }, xhr => {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        })
    }

    regSDK('baidu', new sdk(), "百度翻译", true);
})()