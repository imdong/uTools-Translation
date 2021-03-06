(function () {
    let api_url = 'https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs',
        req_id = 57280004,
        languageMap = {
            auto: 'auto',
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

        let post_data = {
            "jsonrpc": "2.0",
            "method": "LMT_handle_jobs",
            "params": {
                "jobs": jobs,
                "lang": {
                    "user_preferred_langs": [
                        "EN",
                        "ZH"
                    ],
                    // "preference": {
                    //     "weight": {},
                    //     "default": "default"
                    // },
                    "source_lang_computed": languageMap[sourceLanguage] || sourceLanguage,
                    "target_lang": languageMap[toLanguage] || toLanguage
                },
                "priority": 1,
                "commonJobParams": {},
                "timestamp": timestamp
            },
            "id": req_id
        };

        // 如果目标语言是英文则有一些特别的参数
        // if (post_data.params.lang.target_lang == 'EN') {
        //     post_data.params.commonJobParams = {
        //         "regionalVariant": "en-US",
        //         "formality": null
        //     }
        // }

        post_data = JSON.stringify(post_data).replace('"method":"LMT_handle_jobs"', '"method": "LMT_handle_jobs"');

        return new Promise(function (resolve, reject) {
            ajax(api_url, post_data, (response, xhr) => {
                let data = JSON.parse(xhr.responseText);

                // 异常处理 {"jsonrpc": "2.0","error":{"code":1042912,"message":"Too many requests."}}
                if (typeof data.error == "object") {
                    reject("出错啦：" + data.error.message);
                    return;
                }

                // 如果源语言是 auto 则判断源语言重新请求
                if (sourceLanguage == "auto") {
                    let max = 0,
                        lang = '';
                    // 找到相似度最高的语言
                    for (const key in data.result.detectedLanguages) {
                        if (data.result.detectedLanguages[key] > max && key != 'unsupported') {
                            max = data.result.detectedLanguages[key];
                            lang = key;
                        }
                    }
                    sourceLanguage = lang;
                    toLanguage = sourceLanguage == 'ZH' ? 'EN' : 'ZH';

                    console.log('auto ss', sourceLanguage, toLanguage, max);
                    sdk.go(Text, sourceLanguage, toLanguage).then(resolve, reject);
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

    // 注册
    Translate.register(sdk);
})();
