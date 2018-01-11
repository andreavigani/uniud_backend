
var message_generator = function (message) {
    var response = {
        "speech": message,
        "displayText": message,
        "source": "ESSE3"
    }
    return response
}

module.exports = message_generator