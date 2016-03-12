'use strict';

var React = require('react');
var _ = require('lodash');
var Label = require('./label');

require('./remarks-row.less');


var RemarksRow = React.createClass({

    propTypes: {
        value: React.PropTypes.string.isRequired // can be an empty string
    },

    render: function() {
        if (!this.props.value) {
            return null;
        }

        var newLines = this.props.value.split('\n');
        var remarks = _.map(newLines, (newLine, index) => {
            return <span key={ 'remark-' + index }>{ newLine }<br/></span>;
        });

        return (
            <div className='remarks-row'>
                <Label>Remarks:</Label>
                <div className='remarks'>{ remarks }</div>
            </div>
        );
    }
});


module.exports = RemarksRow;
