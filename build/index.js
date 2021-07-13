let in_text = '',
    delay_id = null,
    in_dom = document.getElementById('in'),
    out_dom = document.getElementById('out'),
    select = 'google',
    direction = 'auto',
    translate = new Translate({
        deepl: DeepL_TranslateApi,
        google: GoogleTranslateApi,
        fanyijun: Tencent_FanYiJun_SDK,
    });

// 依次初始化
for (const key in translate.sdk_list) {
    if (typeof translate.sdk_list[key]['init'] == "function") {
        translate.sdk_list[key]['init']();
    }
}

// 监听按钮事件
document.getElementById('select').addEventListener('click', (event) => {
    document.getElementById(select).disabled = false;
    select = event.target.id;
    document.getElementById(select).disabled = true;

    filter_delay(0)
});
document.getElementById('direction').addEventListener('click', (event) => {
    document.getElementById(direction).disabled = false;
    direction = event.target.id;
    document.getElementById(direction).disabled = true;

    filter_delay(0);
});

// 输入框事件
in_dom.addEventListener('keypress', filter_delay);
in_dom.addEventListener('compositionend', filter_delay);
in_dom.focus();

/**
 * 过滤输入抖动
 * @param {*} text 
 */
function filter_delay(timeout) {
    timeout = typeof timeout == "number" ? timeout : 500;

    // 设置定时器 用于输入抖动
    delay_id && clearTimeout(delay_id);
    delay_id = setTimeout(() => {
        translate.go(in_dom.value, select, direction, out_dom);
    }, timeout);
}

/**
 * 一个简易的 Ajax 请求库
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 * @param {*} cb 
 */
function ajax(url, data, cb, before) {
    if (typeof data == 'function') {
        cb = data;
        data = null;
    }

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (event) {
        if (event.target.readyState != 4) {
            return;
        }
        cb(event.target.response, event.target);
    }
    xhr.open(data == null ? 'GET' : 'POST', url);

    if (before) {
        before(xhr);
    }

    xhr.send(data);
}

if (typeof utools == 'object') {
    utools.onPluginReady(() => {
        utools.onPluginEnter((action) => {
            // if (action.code == "translate") {
            //     // utools.setExpendHeight(0);
            //     utools.setSubInput((action) => {
            //         in_dom.value = action.text;
            //         if (in_dom.value.length > 20) {
            //             utools.removeSubInput()
            //             utools.setExpendHeight(500);
            //         }

            //         filter_delay();
            //     }, "请输入要翻译的内容");
            // } else
            if (action.code == 'translate_over') {
                in_dom.value = action.payload;
                filter_delay(0)
            }
        })
    });
}