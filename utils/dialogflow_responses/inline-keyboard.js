var inline_keyboard_generator = function (message, actions) {
    var response = require('./message')(message)

    var inline_keyboard = []
    actions.map(action => {
        var asd =
            {
                "text": action.text,
                "callback_data": action.callback
            };
        inline_keyboard.push(asd);
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
                            [inline_keyboard]
                    }
                }
            }
        }
    ])


    return response
}

module.exports = inline_keyboard_generator