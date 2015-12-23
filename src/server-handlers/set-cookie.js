'use strict';


var SetCookie = function(request, id, passwordHash) {
    var cookie = {
        userId: id,
        hash: passwordHash
    };
    request.auth.session.set(cookie);
};


module.exports = SetCookie;
