'use strict';

var React = require('react');

require('./value-input.less');


var ValueInput = React.createClass({
    render: function() {
        return (
            <div className='value-input'>
                <div className='arrow'>{ '\u25bb' }</div>
                { this.props.children }
            </div>
        );
    }
});


module.exports = ValueInput;
