'use strict';


var SetCookie = function(request, userId, passwordHash) {
    var cookie = {
        userId: userId,
        hash: passwordHash
    };
    request.auth.session.set(cookie);
};


module.exports = SetCookie;
