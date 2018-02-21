
var message_generator = function (message, contextOut = []) {
    var response = {
        "speech": message,
        "displayText": message,
        "source": "UniudBot",
        "messages": [{
            "type": 0,
            //"platform": "telegram",
            "speech": message
        }]
    }

    response.contextOut = contextOut

    return response
}

module.exports = message_generator