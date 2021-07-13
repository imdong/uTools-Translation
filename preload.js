window.exports = {
    translate_list: {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                // 如果进入插件就要显示列表数据
                callbackSetList([
                    {
                        title: 'DeepL',
                        description: 'DeepL 翻译'
                    },
                    {
                        title: '谷歌翻译',
                        description: '谷歌翻译'
                    },
                ])
            }
        }
    }
}