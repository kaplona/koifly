'use strict';


var EmailMessages = {
    PASSWORD_CHANGE: {
        from: 'noreply@koifly.com',
        subject: 'Your Koifly password was changed',
        text: 'Your Koifly password was changed.\n If it was not you follow the link to reset your password: %s \n Fly safe!',
        html: '<p></p><b>Your Koifly password was changed</b></p><p>If it was not you follow the link to reset your password:  <a href="%s">%s</a></p><p>Fly safe!</p>'
    },

    EMAIL_VERIFICATION: {
        from: 'noreply@koifly.com',
        subject: 'Koifly registration',
        text: 'You successfully signed in to Koifly application.\n To complete your registration and confirm your email follow the link: %s \n Fly safe!',
        html: '<p></p><b>You successfully signed in to Koifly application</b></p><p>To complete your registration and confirm your email follow the link:  <a href="%s">%s</a></p><p>Fly safe!</p>'
    },

    PASSWORD_RESET: {
        from: 'noreply@koifly.com',
        subject: 'Koifly password reset',
        text: 'You requested for Koifly password reset.\n Follow the link and fill in the form: %s \n Fly safe!',
        html: '<p></p><b>You requested for Koifly password reset</b></p><p>Follow the link and fill in the form:  <a href="%s">%s</a></p><p>Fly safe!</p>'
    },

    ONE_TIME_LOGIN: {
        from: 'noreply@koifly.com',
        subject: 'Log in to Koifly with your email',
        text: 'You do not need to have your password handy any more.\n Log in to your Koifly account by clicking on the link: %s \n Fly safe!',
        html: '<p></p><b>You do not need to have your password handy any more</b></p><p>Log in to your Koifly account by clicking on the link:  <a href="%s">%s</a></p><p>Fly safe!</p>'
    }
};


module.exports = EmailMessages;
