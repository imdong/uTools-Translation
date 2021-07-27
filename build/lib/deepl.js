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


        let job_tpl = {
            "kind": "default",
            "raw_en_sentence": '',
            "raw_en_context_before": [],
            "raw_en_context_after": [],
            "preferred_num_beams": 4
        }, jobs = [], before_job = null, before_text = "";

        // 以换行分段
        Text.split("\n").forEach(function (line, index) {
            let job = Object.assign({}, job_tpl);
            line = line.trim();
            job.raw_en_sentence = line;
            job.raw_en_context_before = [before_text];
            before_text = line;

            // 前一个对象保存起来 下一次提交
            if (before_job) {
                before_job.raw_en_context_after.push(line);
                jobs.push(before_job);
            }
            before_job = job;
        });

        let post_data = `{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":${JSON.stringify(jobs)},"lang":{"user_preferred_langs":["EN","ZH"],"source_lang_computed":"${languageMap[sourceLanguage]}","target_lang":"${languageMap[toLanguage]}"},"priority":1,"commonJobParams":{"regionalVariant":"en-US","formality":null},"timestamp":${timestamp}},"id":${this.req_id}}`

        ajax(api_url, post_data, (result, xhr) => {
            let data = JSON.parse(xhr.responseText);
            // 异常待处理   {"jsonrpc": "2.0","error":{"code":1042912,"message":"Too many requests."}}

            cb(data.result.translations['0'].beams['0'].postprocessed_sentence)
        }, (xhr) => {
            xhr.setRequestHeader("content-type", "application/json");
        })
    }

    window.DeepL_TranslateApi = new api();

    regSDK('deepl', new api(), 'DeepL', false);
})();
