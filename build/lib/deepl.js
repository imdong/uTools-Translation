(function () {
    let api_url = 'https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs',
        req_id = 57280004,
        languageMap = {
            zhcn: 'ZH',
            en: 'EN'
        },
        regionalVariantMap = {
            en: 'en-US'
        };

    let sdk = {
        name: "deelp",
        title: "DeepL",
        languages: ['auto', 'zhcn', 'en'],
        options: null, // 表示不需要配置
        is_default: false, // 表示自己希望成为默认值
    };

    sdk.go = function (Text, sourceLanguage, toLanguage, cb) {
        let timestamp = (new Date()).getTime() - 3000;
        req_id++;

        let jobs = [];

        // 以换行分段
        let lines = Text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const job = {
                "kind": "default",
                "raw_en_sentence": lines[i],
                "raw_en_context_before": lines.slice(0, i),
                "raw_en_context_after": lines[i + 1] ? [lines[i + 1]] : [],
                "preferred_num_beams": 4
            };
            jobs.push(job);
        }

        let commonJobParams = {};
        // if (sourceLanguage == 'en') {
        //     commonJobParams.regionalVariant = regionalVariantMap[sourceLanguage];
        //     commonJobParams.formality = null;
        // }

        let post_data = `{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":${JSON.stringify(jobs)},"lang":{"user_preferred_langs":["EN","ZH"],"source_lang_computed":"${languageMap[sourceLanguage]}","target_lang":"${languageMap[toLanguage]}"},"priority":1,"commonJobParams":{},"timestamp":${timestamp}},"id":${req_id}}`

        return new Promise(function (resolve, reject) {
            ajax(api_url, post_data, (response, xhr) => {
                let data = JSON.parse(xhr.responseText);
                // 异常处理 {"jsonrpc": "2.0","error":{"code":1042912,"message":"Too many requests."}}
                if (typeof data.error == "object") {
                    reject("出错啦：" + data.error.message);
                    return;
                }

                let result = data.result.translations.map(function (translation) {
                    return translation.beams[0].postprocessed_sentence;
                });

                resolve(result.join('\n'));
            }, (xhr) => {
                xhr.setRequestHeader("content-type", "application/json");
            })
        });
    }

    Translate.register(sdk);
})();
