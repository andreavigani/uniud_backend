/*
Example usage:

var btn_list = require('buttons-list')

var response = btn_list('Ecco la lista degli studenti:', 
    students,
    s => s.first_name + ' ' + s.last_name,
    s => 'voti ' + s.id_number)

res.json(response)
*/

var buttons_list_generator = function (message, entries, text_cb, postback_cb) {
    var response = require('./message')(message)
    console.log(message)
    var inline_keyboard = entries.map(entry => {
        return [
            {
                "text": text_cb ? text_cb(entry) : entry.toString(),
                "callback_data": postback_cb ? postback_cb(entry) : ''
            }
        ]
    }
    );

    response.messages = [
        /*{
          "type": 1,
          "platform": "telegram",
          "title": "Ecco la lista degli studenti",
          "buttons": students.map(s => { return { "text": s.name + ' ' + s.lastname, "postback": "voti " + s.id_number }})
        },*/
        {
            "type": 4,
            "platform": "telegram",
            "payload": {
                "telegram": {
                    "text": message,
                    "reply_markup": {
                        "inline_keyboard":
                            inline_keyboard
                    }
                }
            }
        },
        {
            "type": 0,
            "speech": message
        }
    ]

    response.contextOut = []

    return response
}

module.exports = buttons_list_generator