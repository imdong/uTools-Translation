(function () {
    // 基础信息
    let api_url = 'https://translate.google.cn/translate_a/single',
        // 语言对照表
        languageMap = {
            auto: 'auto',
            zhcn: 'zh-CN',
            en: 'en'
        };

    // 解决ttk 的问题
    function pu(a, b) {
        for (var c = 0; c < b.length - 2; c += 3) {
            var d = b.charAt(c + 2);
            d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
            d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
            a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
        }
        return a
    };
    function getTk(a) {
        var b = '444630.468464038';
        d = b.split(".");
        b = Number(d[0]) || 0;
        for (var e = [], f = 0, g = 0; g < a.length; g++) {
            var h = a.charCodeAt(g);
            128 > h ? e[f++] = h : (2048 > h ? e[f++] = h >> 6 | 192 : (55296 == (h & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (h = 65536 + ((h & 1023) << 10) + (a.charCodeAt(++g) & 1023),
                e[f++] = h >> 18 | 240,
                e[f++] = h >> 12 & 63 | 128) : e[f++] = h >> 12 | 224,
                e[f++] = h >> 6 & 63 | 128),
                e[f++] = h & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++)
            a += e[f],
                a = pu(a, "+-a^+6");
        a = pu(a, "+-3^+b+-f");
        a ^= Number(d[1]) || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return (a.toString() + "." + (a ^ b))
    };

    // sdk 主要部分
    let sdk = {
        name: "google",
        title: "谷歌翻译",
        languages: ['auto', 'zhcn', 'en'],
        options: null, // 表示不需要配置
        is_default: true, // 表示自己希望成为默认值
    };

    sdk.go = function (text, source, target) {
        let data = {
            client: 'webapp',
            sl: languageMap[source],
            tl: languageMap[target],
            hl: 'zh-CN',
            dt: 'at',
            dt: 'bd',
            dt: 'ex',
            dt: 'ld',
            dt: 'md',
            dt: 'qca',
            dt: 'rw',
            dt: 'rm',
            dt: 'sos',
            dt: 'ss',
            dt: 't',
            pc: 1,
            otf: 1,
            ssel: 0,
            tsel: 0,
            xid: 45662847,
            kc: 1,
            tk: getTk(text),
            q: text
        },
            queryData = [];

        Object.keys(data).map(function (key) {
            queryData.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        });

        return new Promise(function (resolve, reject) {
            ajax(api_url + '?' + queryData.join('&'), (result, xhr) => {
                let data = JSON.parse(xhr.responseText),
                    ret_data = '';
                console.log(data);

                data['0'].forEach(item => {
                    ret_data += item[0];
                });

                resolve(ret_data);
            })
        });
    }

    Translate.register(sdk);
})();