'use strict';

var React = require('react');
var _ = require('lodash');
var Label = require('./label');

require('./remarks-row.less');


var RemarksRow = React.createClass({

    propTypes: {
        value: React.PropTypes.string
    },

    render: function() {
        if (this.props.value) {
            var newLines = this.props.value.split('\n');
            var value = _.map(newLines, (newLine) => {
                return <span>{ newLine }<br/></span>;
            });

            return (
                <div className='remarks-row'>
                    <Label>Remarks:</Label>
                    <div className='remarks'>{ value }</div>
                </div>
            );
        }

        return null;
    }

});


module.exports = RemarksRow;
