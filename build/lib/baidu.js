(function () {
    const token = '';
    const languageMap = {
        zhcn: "zh",
        en: "en",
    };

    function buildSignature(post_body) {
        let body = post_body.appid + post_body.q + post_body.salt + sdk.options.token.value;
        console.log(body)
        return exports.crypto.createHash("md5").update(body).digest("hex");
    }

    let sdk = {
        name: "baidu",
        title: "百度翻译",
        languages: ['auto', 'zhcn', 'en'],
        options: {
            appid: {
                type: 'text',
                label: 'appid',
                value: null
            },
            token: {
                type: 'text',
                label: 'token',
                value: null
            },
        },
        is_default: true,
    }

    sdk.go = function (text, source, target) {
        let post_body = {
            q: text,
            from: languageMap[source],
            to: languageMap[target],
            appid: sdk.options.appid.value,
            salt: Math.random().toString().split('.')[1],
        }

        post_body.sign = buildSignature(post_body);

        let body = [];
        for (const key in post_body) {
            body.push(`${key}=${encodeURIComponent(post_body[key])}`);
        }

        return new Promise((resolve, reject) => {
            ajax('https://fanyi-api.baidu.com/api/trans/vip/translate', body.join('&'), result => {
                let data = JSON.parse(result);
                console.log(data);
                
                if(data.error_code){
                    return reject(data.error_msg);
                }
                
                let dsts = [];
                data.trans_result.forEach(item => {
                    dsts.push(item.dst);
                });
                resolve(dsts.join("\n"));
            }, xhr => {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            })
        })
    }

    // 注册
    Translate.register(sdk);
})()