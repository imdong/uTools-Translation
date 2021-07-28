(function () {
    let sdk_list = {};

    // 翻译主对象，各sdk 将自身注册到此对象中
    let Translate = function () { };

    /**
     * 检查是否包含中文
     * @param {*} text 待检查文本
     */
    Translate.prototype.isChinese = function (text) {
        return /[\u4e00-\u9fa5]/.test(text);
    }

    /**
     * 注册一个sdk
     *
     * @param {Object} sdk 待注册的sdk
     * @param {Object} sdk.name sdk的别名 如 baidu
     * @param {Object} sdk.title SDK 的名称 如 百度翻译
     * @param {Object} sdk.languages 支持的语言列表 ["auto", en', 'zhcn']
     * @param {Object} sdk.options 配置项 {ak: '', sk: ''}
     * @param {Object} sdk.translate.go 待注册的sdk的翻译方法
     */
    Translate.register = function (sdk) {
        sdk_list[sdk.name] = sdk;
    };

    /**
     * 从指定的sdk中获取翻译方法
     * @param {String} name sdk名称 留空获取 sdk 列表
     */
    Translate.prototype.getSdk = function (name) {
        if (typeof name == 'undefined') {
            return sdk_list;
        }
        return sdk_list[name];
    }

    /**
     * 执行一次翻译
     * @param {*} text 
     * @param {*} sdk 
     * @param {*} source 
     * @param {*} to 
     */
    Translate.prototype.go = function (text, sdk, direction) {
        let source_language = 'en', out_language = 'zhcn';
        switch (direction) {
            case 'auto':
                if (this.isChinese(text)) {
                    source_language = 'zhcn', out_language = 'en';
                }
                break;
            default:
                let directions = direction.split('-');
                source_language = directions[0];
                out_language = directions[1];
                break;
        }

        // 判断运行时环境 调用对应的 SDK 执行
        if (typeof utools == "object") {
            return sdk_list[sdk].go(text, source_language, out_language);
        } else {
            out.value = `${sdk} Result (${source_language} => ${out_language}): ${text}`
        }
    }

    window.Translate = Translate;
})();