'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./screen-shot.less');
}


var ScreenShort = React.createClass({

    propTypes: {
        type: React.PropTypes.string
    },

    render: function() {
        var firstScreenShort = ' x-' + this.props.type + '-1';
        var secondScreenShort = ' x-' + this.props.type + '-2';

        return (
            <div className='screen-shots'>
                <div className={ 'first screen-shot' + firstScreenShort } />
                <div className={ 'second screen-shot' + secondScreenShort } />
            </div>
        );
    }
});


module.exports = ScreenShort;
