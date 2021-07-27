(function () {
    let api_url = 'https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs',
        api = function () {
            this.req_id = 57280004;
        },
        languageMap = {
            zhcn: 'ZH',
            en: 'EN'
        };

    api.prototype.go = function (Text, sourceLanguage, toLanguage, cb) {
        let timestamp = (new Date()).getTime() - 3000;
        this.req_id++;


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

        let post_data = `{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":${JSON.stringify(jobs)},"lang":{"user_preferred_langs":["EN","ZH"],"source_lang_computed":"${languageMap[sourceLanguage]}","target_lang":"${languageMap[toLanguage]}"},"priority":1,"commonJobParams":{"regionalVariant":"en-US","formality":null},"timestamp":${timestamp}},"id":${this.req_id}}`

        ajax(api_url, post_data, (response, xhr) => {
            let data = JSON.parse(xhr.responseText);
            // 异常处理 {"jsonrpc": "2.0","error":{"code":1042912,"message":"Too many requests."}}
            if (typeof data.error == "object") {
                cb("出错啦：" + data.error.message);
                return;
            }

            let result = data.result.translations.map(function (translation) {
                return translation.beams[0].postprocessed_sentence;
            });

            cb(result.join('\n'));
        }, (xhr) => {
            xhr.setRequestHeader("content-type", "application/json");
        })
    }

    window.DeepL_TranslateApi = new api();

    regSDK('deepl', new api(), 'DeepL', false);
})();
