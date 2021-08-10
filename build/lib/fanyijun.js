(function () {
    let sdk = {
        name: "fanyijun",
        title: "翻译君",
        languages: ['auto', 'zhcn', 'en']
    };

    let reauthuri = "",
        languageMap = {
            zhcn: 'zh',
            en: 'en',
        };

    sdk.init = function () {
        // 先获取认证地址
        ajax("https://fanyi.qq.com/", result => {
            reauthuri = result.match(/var\s+reauthuri\s*=\s*['"]([^'"]+)['"];/)[1];
        })
    }

    /**
     * 
     * @param {*} text 
     * @param {*} source 
     * @param {*} out 
     * @param {*} cb 
     */
    sdk.go = function (text, source, out) {
        return new Promise((resolve, reject) => {
            ajax('https://fanyi.qq.com/api/' + reauthuri, '', (result, xhr) => {
                console.log(xhr)
                let reauthuri_data = JSON.parse(result);
                let post_data = {
                    source: languageMap[source],
                    target: languageMap[out],
                    sourceText: text,
                    qtv: reauthuri_data.qtv || "",
                    qtk: reauthuri_data.qtk || "",
                    ticket: "",
                    randstr: "",
                    sessionUuid: "translate_uuid" + (new Date).getTime(),
                },
                    post = [];
                Object.keys(post_data).map(key => {
                    post.push(key + "=" + encodeURIComponent(post_data[key]));
                });

                ajax('https://fanyi.qq.com/api/translate', post.join('&'), (result) => {
                    let data = JSON.parse(result);
                    console.log(data)

                    if (data.errCode != 0) {
                        return reject(data.errMsg);
                    }

                    resolve(data.translate.records.map(record => {
                        return record.targetText;
                    }).join(''));
                }, (xhr) => {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

                    // xhr.setRequestHeader('Cookies', );

                    // 没有 UC 也能用 但不知道咋回事 先不管了
                    // var uc = CryptoJS.AES.encrypt(`266|${Date.now()}|460`, CryptoJS.enc.Utf8.parse('skvrjylxqadpfubt'), {
                    //     iv: CryptoJS.enc.Utf8.parse('kfpucgwiaxzdqhje'),
                    //     mode: CryptoJS.mode.CBC,
                    //     padding: CryptoJS.pad.Pkcs7
                    // }).toString();
                    // xhr.setRequestHeader('uc', uc)
                });
            });
        });
    }

    Translate.register(sdk);
})();