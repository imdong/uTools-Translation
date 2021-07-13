(function () {
    let api = function () {
        this.qtk = "";
        this.qtv = "";
    },
        languageMap = {
            zhcn: 'zh',
            en: 'en',
        };

    api.prototype.init = function () {
        ajax('https://fanyi.qq.com/api/reauth1232f', '', (result) => {
            let data = JSON.parse(result);

            console.log('init', this, data, result);

            this.qtv = data.qtv;
            this.qtk = data.qtk;
        });
    }

    /**
     * 
     * @param {*} text 
     * @param {*} source 
     * @param {*} out 
     * @param {*} cb 
     */
    api.prototype.go = function (text, source, out, cb) {
        let data = {
            source: languageMap[source],
            target: languageMap[out],
            sourceText: text,
            qtv: this.qtv || "",
            qtk: this.qtk || "",
            ticket: "",
            randstr: "",
            sessionUuid: "translate_uuid" + (new Date).getTime(),
        },
            post = [];
        Object.keys(data).map(key => {
            post.push(key + "=" + encodeURIComponent(data[key]));
        });

        ajax('https://fanyi.qq.com/api/translate', post.join('&'), (result) => {
            let data = JSON.parse(result);
            cb(data.translate.records[0].targetText);
        }, (xhr) => {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        })
    }

    window.Tencent_FanYiJun_SDK = new api();
})();