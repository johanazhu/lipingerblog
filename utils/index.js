function formatTime(date, fmt = 'YYYY-MM-DD hh:mm:ss') {
    if (date && date.length === 10) {
        date = date * 1000
    }
    date = typeof date === 'number' ? new Date(date) : new Date()

    let obj = {
        Y: date.getFullYear(),
        M: date.getMonth() + 1,
        D: date.getDate(),
        w: date.getDay(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    }
    let week = ['日', '一', '二', '三', '四', '五', '六']

    for (let key in obj) {
        fmt = fmt.replace(new RegExp(key + '+', 'g'), function (e) {
            var val = obj[key] + '' // 字符串化

            if (key === 'w') {
                return (e.length > 2 ? '星期' : '周') + week[val]
            }
            // e.length： 要求的长度， val.length: 目前的长度，不足的前面补零
            for (let j = 0, len = e.length - val.length; j < len; j++) {
                val = '0' + val
            }
            return val
        })
    }
    return fmt
}

module.exports = {
    formatTime
}