
var message_generator = function (message, contextOut = []) {
    var response = {
        "speech": message,
        "displayText": message,
        "source": "ESSE3",
        "messages": [{
            "type": 0,
            "speech": message
        }]
    }

    response.contextOut = contextOut

    return response
}

module.exports = message_generator