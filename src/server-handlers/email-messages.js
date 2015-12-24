'use strict';


var EmailMessages = {
    PASSWORD_CHANGE: {
        from: 'noreply@koifly.com',
        subject: 'Your Koifly password was changed',
        text: 'Your Koifly password was changed.\n If it was not you follow the link to reset your password: %s \n Fly safe!',
        html: '<p></p><b>Your Koifly password was changed</b></p><p>If it was not you follow the link to reset your password:  <a href="%s">%s</a></p><p>Fly safe!</p>'
    }
};


module.exports = EmailMessages;
