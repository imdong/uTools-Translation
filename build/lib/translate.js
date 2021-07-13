let Translate = function (sdk_list) {
    this.sdk_list = sdk_list;
};

/**
 * 检查是否包含中文
 * @param {*} text 待检查文本
 */
Translate.prototype.isChinese = function (text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 执行一次翻译
 * @param {*} text 
 * @param {*} sdk 
 * @param {*} source 
 * @param {*} to 
 */
Translate.prototype.go = function (text, sdk, direction, out) {
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
    if(typeof utools == "object") {
        this.sdk_list[sdk].go(text, source_language, out_language, (result) => {
            out.value = result;
        });
    } else {
        out.value = `${sdk} Result (${source_language} => ${out_language}): ${text}`
    }
}