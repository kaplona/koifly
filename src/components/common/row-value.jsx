'use strict';

var React = require('react');


var RowValue = React.createClass({
    render: function() {
        return (
            <div className='row-value'>
                { '\u25bb' }
                { this.props.children }
            </div>
        );
    }
});


module.exports = RowValue;
