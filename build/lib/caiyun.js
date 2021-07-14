(function () {
    const token = "3975l6lr5pcbvidl6jl2";
    const languageMap = {
        zhcn: "zh",
        en: "en",
    };

    let sdk = function () { };

    sdk.prototype.go = function (text, source, target, cb) {
        let post_body = JSON.stringify({
            source: text,
            trans_type: 'en2zh',
            replaced: true,
            media: "text",
            request_id: "demo"
        });

        ajax("http://api.interpreter.caiyunai.com/v1/translator",post_body, result => {
            cb(`彩云小译 token 申请中...`);
        }, xhr => {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Authorization", "token: " + token);
        });
    }

    // 注册
    regSDK('caiyun', new sdk(), '彩云小译', false);
})()