(function () {
    const languageMap = {
        zhcn: "zh",
        en: "en",
    };

    let sdk = {
        name: "caiyun",
        title: "彩云小译",
        languages: ['auto', 'zhcn', 'en'],
        options: {
            token: {
                type: 'text',
                label: 'token',
                value: null
            }
        }
    };

    sdk.go = function (text, source, target, cb) {
        let post_body = JSON.stringify({
            source: text,
            trans_type: `${languageMap[source]}2${languageMap[target]}`,
            replaced: true,
            media: "text",
            request_id: "utools_" + (new Date()).getTime() + '_' + Math.random()
        });

        return new Promise(function (resolve, reject) {
            ajax("http://api.interpreter.caiyunai.com/v1/translator", post_body, result => {
                let data = JSON.parse(result);
                console.log(data);
                
                if (data.message) {
                    return reject(data.message);
                }

                resolve(data.target);
            }, xhr => {
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("X-Authorization", "token " + sdk.options.token.value);
            });
        });
    }

    // 注册
    Translate.register(sdk);
})()