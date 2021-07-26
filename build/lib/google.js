(function (ttk) {
    let api_url = 'https://translate.google.cn/translate_a/single',
        languageMap = {
            zhcn: 'zh-CN',
            en: 'en'
        },
        api = function (_ttk) {
            ttk = _ttk || ttk || '';
        },
        ou = function (a) {
            return function () {
                return a
            }
        },
        pu = function (a, b) {
            for (var c = 0; c < b.length - 2; c += 3) {
                var d = b.charAt(c + 2);
                d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
                d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
                a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
            }
            return a
        };

    api.prototype.getTk = function (a) {
        var b = ttk;
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

    api.prototype.go = function (Text, sourceLanguage, toLanguage, cb) {
        console.log(Text);

        let data = {
            client: 'webapp',
            sl: languageMap[sourceLanguage],
            tl: languageMap[toLanguage],
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
            tk: this.getTk(Text),
            q: Text
        },
            queryData = [];

        Object.keys(data).map(function (key) {
            queryData.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        });

        ajax(api_url + '?' + queryData.join('&'), (result, xhr) => {
            let data = JSON.parse(xhr.responseText),
                ret_data = '';

            data['0'].forEach(item => {
                ret_data += item[0];
            });

            cb(ret_data);
        })
    }

    window.GoogleTranslateApi = new api();

    regSDK('google', new api(), '谷歌翻译', true);
})('444630.468464038');