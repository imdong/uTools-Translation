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

        let post_data = `{"jsonrpc":"2.0","method": "LMT_handle_jobs","params":{"jobs":[{"kind":"default","raw_en_sentence":"${Text}","raw_en_context_before":[],"raw_en_context_after":[],"preferred_num_beams":4}],"lang":{"user_preferred_langs":["EN","ZH"],"source_lang_computed":"${languageMap[sourceLanguage]}","target_lang":"${languageMap[toLanguage]}"},"priority":1,"commonJobParams":{"regionalVariant":"en-US","formality":null},"timestamp":${timestamp}},"id":${this.req_id}}`

        ajax(api_url, post_data, (result, xhr) => {
            let data = JSON.parse(xhr.responseText);

            cb(data.result.translations['0'].beams['0'].postprocessed_sentence)
        }, (xhr) => {
            xhr.setRequestHeader("content-type", "application/json");
        })
    }

    window.DeepL_TranslateApi = new api();

    regSDK('deepl', new api(), 'DeepL', false);
})();
