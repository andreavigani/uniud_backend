Date.prototype.toFormattedDateTime = function(){
    var options = {hour12: false, hour:"numeric", minute: "numeric"}
    return this.getDate() + '/' + (this.getMonth()+1) + '/' + this.getFullYear() + ' ore ' + this.toLocaleString('en', options)
}

Date.prototype.toFormattedDate = function(){
    return this.getDate() + '/' + (this.getMonth()+1) + '/' + this.getFullYear()
}