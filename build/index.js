let in_text = '',
    delay_id = null,
    in_dom = document.getElementById('in'),
    out_dom = document.getElementById('out'),
    select_dom = document.getElementById('select'),
    copy_dom = document.getElementById('copy'),
    setting_dom = document.getElementById('setting'),
    options_dom = document.getElementById('options'),
    options_body_dom = document.getElementById('options-items'),
    menu_dom = document.querySelector('.menu');
select = 'google',
    direction = 'auto',
    use_default = false,
    translate = new Translate(),
    config_rev = null;

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

document.body.addEventListener('click', (event) => {
    const hidden = () => {
        menu_dom.style.visibility = 'hidden'
        menu_dom.style.top = '90px'
        menu_dom.style.opacity = 0
    }
    if (event.target.className != 'menu-item') {
        if (event.target.className === 'translate-mode') {
            if (menu_dom.style.visibility != 'visible') {
                menu_dom.style.visibility = 'visible'
                menu_dom.style.top = '45px'
                menu_dom.style.opacity = 1
            } else {
                hidden()
            }
        } else {
            hidden()
        }
    } else {
        direction = event.target.id;
        filter_delay(0);
        hidden();
    }
    event.stopPropagation();
})


// 设置按钮事件
function optionCancel(event) {
    console.log('optionCancel')
    options_dom.classList.add('hide');
}
document.querySelector('#options .mask').addEventListener('click', optionCancel);
document.querySelector('#option-cancel').addEventListener('click', optionCancel);
setting_dom.addEventListener('click', (event) => {
    // setting 显示与隐藏
    if (options_dom.classList.contains('hide')) {
        options_dom.classList.remove('hide');
        // 开始初始化配置页面
        init_options();
    } else {
        options_dom.classList.add('hide');
    }
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
            if ((timeout == 0 || in_text != in_dom.value)) {
                if (in_dom.value.trim().length > 0) {
                    out_dom.value = "翻译中...";

                    in_text = in_dom.value;
                    translate.go(in_dom.value, select, direction).then(result => {
                        out_dom.value = result;
                    }).catch(err => {
                        out_dom.value = "啊哦，出错啦!!1\n\n(" + err + ")";
                    });
                } else {
                    out_dom.value = '';
                }
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
    utools.onPluginReady(() => {
        utools.onPluginEnter((action) => {
            if (action.code == 'translate_over') {
                in_dom.value = action.payload;
                filter_delay(0)
            }
        })


        console.log('onPluginReady')

        // 获取用户配置信息
        loadConfig();

        // 依次初始化 各插件
        init_sdk();

        // 复制结果
        set_copy();

    });
}

// 保存配置
document.getElementById('option-save').addEventListener('click', (event) => {
    options_dom.querySelectorAll('input').forEach(item => {
        let option_name = item.getAttribute('name').split('-'),
            sdk_name = option_name[0],
            option_key = option_name[1];

        if (item.value.length > 0) {
            if (typeof exports.config.options[sdk_name] == 'undefined') {
                exports.config.options[sdk_name] = {};
            }
            exports.config.options[sdk_name][option_key] = item.value;
        }
    });

    updateOptionToSDK();

    // 保存配置
    let result = utools.db.put({
        _id: "config",
        data: JSON.stringify(exports.config),
        _rev: config_rev
    })
    config_rev = result._rev;
    console.log(result);

    // 隐藏配置窗口
    optionCancel();
});

// 从数据库加载配置
function loadConfig() {
    let result = utools.db.get("config");
    console.log(result);

    if (result) {
        config_rev = result._rev;
        exports.config = JSON.parse(result.data);
    }

    updateOptionToSDK();
}

// 空的复制
function onCpoy(event) {
    utools.copyText(out_dom.value);
    utools.hideMainWindow();
}
function set_copy() {
    copy_dom.addEventListener('click', onCpoy);
    document.addEventListener('keydown', function (oEvent) {
        let ctrl_key = utools.isMacOs() ? 'metaKey' : 'ctrlKey';

        if (oEvent[ctrl_key] && oEvent.code == 'KeyC') {
            onCpoy(oEvent);
        }
    });

    // 设置复制按钮标题
    if (utools.isMacOs()) {
        copy_dom.innerText = "复制 ( Cmd + C )";
    }
}

// 初始化sdk
function init_sdk() {
    let sdk_list = translate.getSdk();
    console.log('init_sdk', sdk_list)

    for (const sdk_name in sdk_list) {
        console.log('init sdk', sdk_name);

        // 检查插件是否需要初始化
        if (typeof sdk_list[sdk_name]['init'] == "function") {
            sdk_list[sdk_name]['init']();
        }
    }

    // 检查是否有配置需要设置
    updateOptionToSDK();
}

// 更新配置到 SDK
function updateOptionToSDK() {
    console.log('updateOptionToSDK')
    let sdk_list = translate.getSdk();
    for (const sdk_name in sdk_list) {
        if (typeof exports.config.options[sdk_name] == 'object') {
            console.log('set options', sdk_name);
            for (const option_name in exports.config.options[sdk_name]) {
                console.log('config', sdk_name, option_name);
                if (typeof sdk_list[sdk_name].options[option_name] == 'object') {
                    sdk_list[sdk_name].options[option_name].value = exports.config.options[sdk_name][option_name];
                }
            }
        }
    }
}

// 初始化设置列表
function init_options() {
    // 更新配置
    loadConfig();

    let template = document.querySelector('#options-item-template').innerHTML,
        div = document.createElement('div'),
        input = null;

    div.innerHTML = template;
    input = div.querySelector('.content').innerHTML;
    // 替换内部
    div.querySelector('.input').replaceWith('{inputs}')
    template = div.innerHTML;

    // 清空现有配置列表
    options_body_dom.innerHTML = null;

    // 逐个sdk设置
    let sdk_list = translate.getSdk();
    for (const sdk_name in sdk_list) {
        console.log('option sdk', sdk_name);

        // 如果没有配置项则不显示
        if (sdk_list[sdk_name].options == null) {
            continue;
        }

        let option_item = template.replace('{title}', sdk_list[sdk_name].title).replace('{sdk}', sdk_name),
            inputs = [];

        for (const key in sdk_list[sdk_name].options) {
            const option = sdk_list[sdk_name].options[key];
            console.log(sdk_name, key, option);

            inputs.push(input
                .replace(/{label}/g, option.label)
                .replace(/{sdk}/g, sdk_name)
                .replace(/{key}/g, key)
                .replace(/{value_mask}/g, () => {
                    let len = parseInt(option.value.length / 5);
                    return option.value.substr(0, len) + ''.padStart(option.value.length - (len * 2), '*') + option.value.substr(len * -1);
                })
                .replace(/{value}/g, '')
            );
        }

        let div = document.createElement('div');
        div.innerHTML = option_item.replace('{inputs}', inputs.join(''));

        options_body_dom.append(div.querySelector('.options-item'));
    }
}

// 设置CSS变量
function set_css_var(key, val) {
    return document.documentElement.style.setProperty(key, val);
}

// 读取CSS变量
function get_css_var(key) {
    return getComputedStyle(document.documentElement).getPropertyValue(key);
}