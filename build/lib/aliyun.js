(function () {
    /**
     * 签了个名
     * @returns 
     */
    function buildSignature(body) {
        const date = (new Date()).toGMTString();

        // 1.对body做MD5+BASE64加密
        const bodyMd5 = exports.crypto.createHash("md5").update(body).digest("base64");
        const uuid = Math.random().toString().split('.')[1];
        const stringToSign = "POST\n"
            + "application/json\n"
            + bodyMd5 + "\n"
            + "application/json;chrset=utf-8\n"
            + date + "\n"
            + "x-acs-signature-method:HMAC-SHA1\n"
            + "x-acs-signature-nonce:" + uuid + "\n"
            + "x-acs-version:2019-01-02\n"
            + "/api/translate/web/general";

        // 2.计算 HMAC-SHA1
        const signature = exports.crypto.createHmac('sha1', sdk.options.access_key_secret.value)
            .update(stringToSign)
            .digest('base64')

        // 打开和URL之间的连接
        const authHeader = "acs " + sdk.options.access_key_id.value + ":" + signature;

        return { date, bodyMd5, uuid, authHeader }
    }

    languageMap = {
        zhcn: "zh",
        en: "en",
    };

    let sdk = {
        name: "aliyun",
        title: "阿里云",
        languages: ['auto', 'zhcn', 'en'],
        options: {
            access_key_id: {
                type: 'text',
                label: 'Access Key Secret',
                value: null
            },
            access_key_secret: {
                type: 'text',
                label: 'Access Key Secret',
                value: null
            }
        }
    };

    /**
     * 执行翻译请求
     * @param {*} text 
     * @param {*} source 
     * @param {*} to 
     * @param {*} cb 
     */
    sdk.go = function (text, source, to, cb) {
        let postBody = JSON.stringify({
            Action: "TranslateGeneral",
            FormatType: "text",
            Scene: "general",
            SourceLanguage: languageMap[source],
            TargetLanguage: languageMap[to],
            SourceText: encodeURIComponent(text)
        });

        // let postBody = '{"Action":"TranslateGeneral","FormatType":"text","SourceLanguage":"en","TargetLanguage":"zh","SourceText":"text","Scene":"general"}';

        let signature = buildSignature(postBody);

        return new Promise((resolve, reject) => {
            // 发起请求
            let req = exports.https.request({
                hostname: 'mt.cn-hangzhou.aliyuncs.com',
                port: 443,
                path: '/api/translate/web/general',
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json;chrset=utf-8",
                    "Content-MD5": signature.bodyMd5,
                    'Content-Length': postBody.length,
                    "Date": signature.date,
                    "Host": "mt.cn-hangzhou.aliyuncs.com",
                    "Authorization": signature.authHeader,
                    "x-acs-signature-nonce": signature.uuid,
                    "x-acs-signature-method": "HMAC-SHA1",
                    "x-acs-version": "2019-01-020",
                }
            }, res => {
                let response = '';
                res.on('data', (chunk) => {
                    response += chunk;
                });

                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    let data = JSON.parse(response);
                    if(data.Code !== '200') {
                        return reject(data.Message);
                    }
                    
                    resolve(JSON.parse(response).Data.Translated);
                });
            });
            req.write(postBody)
            req.end();
        });
    }

    Translate.register(sdk);
})()