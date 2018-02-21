var card_generator = function (message, search_result) {

    var response = {
        "speech": message,
        "displayText": message,
        "source": "UniudBot",
        "messages": [{
            "type": 0,
            "platform": "telegram",
            "speech": message
        }]
    }

    response.messages.push(...[
        {
          "type": 1,
          "platform": "telegram",
          "title": search_result.title,
          "subtitle": search_result.snippet,
          "buttons": [
            {
              "text": "Vai al link",
              "postback": search_result.link
            }
          ]
        }
    ])

    return response
}

module.exports = card_generator