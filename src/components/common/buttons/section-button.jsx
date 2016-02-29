'use strict';

var React = require('react');
var Button = require('./button');

require('./section-button.less');


var SectionButton = React.createClass({

    propTypes: {
        text: React.PropTypes.string,
        type: React.PropTypes.string,
        buttonStyle: React.PropTypes.string,
        onClick: React.PropTypes.func,
        isEnabled: React.PropTypes.bool
    },

    render: function() {
        return <Button { ...this.props } className='section-button' />;
    }
});


module.exports = SectionButton;
