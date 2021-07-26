(function () {
    const token = "aq67gv3eaui7rcasvsgz";
    const languageMap = {
        zhcn: "zh",
        en: "en",
    };

    let sdk = function () { };

    sdk.prototype.go = function (text, source, target, cb) {


        let post_body = JSON.stringify({
            source: text,
            trans_type: `${languageMap[source]}2${languageMap[target]}`,
            replaced: true,
            media: "text",
            request_id: "utools_" + (new Date()).getTime() + '_' + Math.random()
        });

        ajax("http://api.interpreter.caiyunai.com/v1/translator", post_body, result => {
            let data = JSON.parse(result);
            cb(data.target);
        }, xhr => {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Authorization", "token " + token);
        });
    }

    // 注册
    regSDK('caiyun', new sdk(), '彩云小译', false);
})()