'use strict';

const React = require('react');
const { string } = React.PropTypes;
const _ = require('lodash');
const Label = require('./label');

require('./remarks-row.less');


function RemarksRow(props) {
    if (!props.value) {
        return null;
    }

    const newLines = props.value.split('\n');
    const remarks = _.map(newLines, (newLine, index) => {
        return <span key={'remark-' + index}>{newLine}<br/></span>;
    });

    return (
        <div className='remarks-row'>
            <Label>Remarks:</Label>
            <div className='remarks'>{remarks}</div>
        </div>
    );
}

RemarksRow.propTypes = {
    value: string.isRequired // can be an empty string
};


module.exports = RemarksRow;
