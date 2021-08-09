(function () {
    function sha256(message, secret = '', encoding) {
        const hmac = exports.crypto.createHmac('sha256', secret)
        return hmac.update(message).digest(encoding)
    }

    function getHash(message, encoding = 'hex') {
        const hash = exports.crypto.createHash('sha256')
        return hash.update(message).digest(encoding)
    }

    function getDate(timestamp) {
        const date = new Date(timestamp * 1000)
        const year = date.getUTCFullYear()
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
        const day = ('0' + date.getUTCDate()).slice(-2)
        return `${year}-${month}-${day}`
    }

    function build_request(payload) {
        //时间处理, 获取世界时间日期
        const timestamp = parseInt((new Date()).getTime() / 1000)
        const date = getDate(timestamp)

        // ************* 步骤 1：拼接规范请求串 *************
        const signedHeaders = "content-type;host"

        const hashedRequestPayload = getHash(payload);
        const httpRequestMethod = "POST"
        const canonicalUri = "/"
        const canonicalQueryString = ""
        const canonicalHeaders = "content-type:application/json; charset=utf-8\n" + "host:" + sdk.options.endpoint.value + "\n"

        const canonicalRequest = httpRequestMethod + "\n"
            + canonicalUri + "\n"
            + canonicalQueryString + "\n"
            + canonicalHeaders + "\n"
            + signedHeaders + "\n"
            + hashedRequestPayload
        console.log(canonicalRequest)

        // ************* 步骤 2：拼接待签名字符串 *************
        const algorithm = "TC3-HMAC-SHA256"
        const hashedCanonicalRequest = getHash(canonicalRequest);
        const credentialScope = date + "/" + sdk.options.service.value + "/" + "tc3_request"
        const stringToSign = algorithm + "\n" +
            timestamp + "\n" +
            credentialScope + "\n" +
            hashedCanonicalRequest
        console.log(stringToSign)

        // ************* 步骤 3：计算签名 *************
        const kDate = sha256(date, 'TC3' + sdk.options.secret_key.value)
        const kService = sha256(sdk.options.service.value, kDate)
        const kSigning = sha256('tc3_request', kService)
        const signature = sha256(stringToSign, kSigning, 'hex')
        console.log(signature)

        // ************* 步骤 4：拼接 Authorization *************
        const authorization = algorithm + " " +
            "Credential=" + sdk.options.secret_id.value + "/" + credentialScope + ", " +
            "SignedHeaders=" + signedHeaders + ", " +
            "Signature=" + signature

        return {
            authorization: authorization,
            timestamp: timestamp.toString()
        };
    }

    let languageMap = {
        zhcn: 'zh',
        en: 'en'
    };

    // sdk 主要部分
    let sdk = {
        name: "tencent",
        title: "腾讯翻译",
        languages: ['auto', 'zhcn', 'en'],
        options: {
            secret_id: {
                type: 'text',
                label: 'Secret ID',
                value: null
            },
            secret_key: {
                type: 'text',
                label: 'Secret Key',
                value: null
            },
            endpoint: {
                // 只读
                type: 'only_read',
                label: 'Endpoint',
                value: 'tmt.tencentcloudapi.com'
            },
            region: {
                type: 'only_read',
                label: 'Region',
                value: 'ap-guangzhou',
            },
            service: {
                type: 'hidden',
                label: 'Service',
                value: 'tmt'
            },
            action: {
                type: 'hidden',
                label: 'Action',
                value: 'TextTranslate'
            },
            version: {
                type: 'hidden',
                label: 'Version',
                value: '2018-03-21'
            }
        },
        is_default: true, // 表示自己希望成为默认值
    };


    /**
     * 执行翻译的对象
     * @param {string} text 要翻译的文本
     * @param {string} source 源语言
     * @param {string} to 目标语言
     */
    sdk.go = function (text, source, to) {
        console.log(this)


        let payload = JSON.stringify({
            "SourceText": text,
            "Source": languageMap[source],
            "Target": languageMap[to],
            "ProjectId": 0
        }),
            request = build_request(payload);

        return new Promise((resolve, reject) => {
            ajax("https://" + sdk.options.endpoint.value, payload, result => {
                let data = JSON.parse(result).Response;
                console.log(data);
                
                if(data.Error) {
                    reject(data.Error.Message);
                    return;
                }

                resolve(data.TargetText);
            }, xhr => {
                xhr.setRequestHeader('Authorization', request.authorization);
                xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                // xhr.setRequestHeader('Host', sdk.options.endpoint.value);
                xhr.setRequestHeader('X-TC-Action', sdk.options.action.value);
                xhr.setRequestHeader('X-TC-Timestamp', request.timestamp);
                xhr.setRequestHeader('X-TC-Version', sdk.options.version.value);
                xhr.setRequestHeader('X-TC-Region', sdk.options.region.value);
            });
        });
    }

    Translate.register(sdk);
})()
