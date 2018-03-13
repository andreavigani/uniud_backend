var buttons_list_generator = function (message, entries, text_cb, postback_cb, contextOut = []) {
    var response = require('./message')(message, contextOut)

    var inline_keyboard = entries.map(entry => {
        return [
            {
                "text": text_cb ? text_cb(entry) : entry.toString(),
                "callback_data": postback_cb ? postback_cb(entry) : ''
            }
        ]
    }
    );

    response.messages.push(...[
        {
            "type": 4,
            "platform": "telegram",
            "payload": {
                "telegram": {
                    "text": message,
                    "parse_mode": "HTML",
                    "reply_markup": {
                        "inline_keyboard":
                            inline_keyboard
                    }
                }
            }
        }
    ])


    return response
}

module.exports = buttons_list_generator