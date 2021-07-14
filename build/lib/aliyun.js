(function () {
    const serviceURL = "https://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general"
    const accessKeyId = "LTAI5t5ro8BfCZfzcXdg9UCx";
    const accessKeySecret = "U2uj2B9i80LunpMDT7dlELLqyl71ZQ";

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
        const signature = exports.crypto.createHmac('sha1', accessKeySecret)
            .update(stringToSign)
            .digest('base64')

        // 打开和URL之间的连接
        const authHeader = "acs " + accessKeyId + ":" + signature;

        return { date, bodyMd5, uuid, authHeader }
    }

    /**
     * 
     */
    let sdk = function () { },
        languageMap = {
            zhcn: "zh",
            en: "en",
        };

    /**
     * 执行翻译请求
     * @param {*} text 
     * @param {*} source 
     * @param {*} to 
     * @param {*} cb 
     */
    sdk.prototype.go = function (text, source, to, cb) {
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
                "x-acs-version": "2019-01-02",
            }
        }, res => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
                cb(JSON.parse(response).Data.Translated);
            });
        });
        req.write(postBody)
        req.end();
    }

    window.AliyunTranslateSDK = new sdk();
})()