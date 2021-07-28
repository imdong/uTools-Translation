let in_text = '',
    delay_id = null,
    in_dom = document.getElementById('in'),
    out_dom = document.getElementById('out'),
    select_dom = document.getElementById('select'),
    copy_dom = document.getElementById('copy'),
    select = 'google',
    direction = 'auto',
    use_default = false,
    translate = new Translate();

for (const key in translate.getSdk()) {
    let item = translate.getSdk(key);

    // 追加到翻译按钮上
    let btn = document.createElement('button');
    btn.id = item.name;
    btn.innerText = item.title;
    if (item.is_default && !use_default) {
        use_default = true;
        btn.disabled = true;
        select = item.name;
    }
    select_dom.append(btn);
}

// 到现在还没有默认就第一个为默认
if (!use_default) {
    let def_dom = select_dom.querySelector('button');
    select = def_dom.id;
    def_dom.disabled = true;
}

// 监听按钮事件
select_dom.addEventListener('click', (event) => {
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
['keypress', 'change', 'keydown', 'compositionend'].map((event) => {
    in_dom.addEventListener(event, filter_delay);
});
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
        try {
            if (timeout == 0 || in_text != in_dom.value) {
                out_dom.value = "翻译中...";

                in_text = in_dom.value;
                translate.go(in_dom.value, select, direction).then(result => {
                    out_dom.value = result;
                }).catch(err => {
                    out_dom.value = "啊哦，出错啦!!1";
                });
            }
        } catch (error) {
            console.log(error);
            out_dom.value = "啊哦，出错啦!!1";
        }
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

// 仅 uTools 环境下执行
if (typeof utools == 'object') {

    console.log('config', exports.config)


    utools.onPluginReady(() => {
        utools.onPluginEnter((action) => {
            if (action.code == 'translate_over') {
                in_dom.value = action.payload;
                filter_delay(0)
            }
        })
    });

    // 依次初始化 各插件
    for (const key in translate.sdk_list) {
        if (typeof translate.sdk_list[key]['init'] == "function") {
            translate.sdk_list[key]['init']();
        }
    }

    // 复制结果
    copy_dom.addEventListener('click', onCpoy);
    document.addEventListener('keydown', function (oEvent) {
        let ctrl_key = utools.isMacOs() ? 'metaKey' : 'ctrlKey';

        if (oEvent[ctrl_key] && oEvent.code == 'KeyC') {
            onCpoy(oEvent);
        }
    });

    // 空的复制
    function onCpoy(event) {
        utools.copyText(out_dom.value);
        utools.hideMainWindow();
    }

    // 设置复制按钮标题
    if (utools.isMacOs()) {
        copy_dom.innerText = "复制 ( Cmd + C )";
    }
}