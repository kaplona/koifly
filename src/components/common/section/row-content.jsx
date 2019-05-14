'use strict';

const React = require('react');
const { element, number, oneOfType, string } = React.PropTypes;
const Label = require('./label');
const ValueContainer = require('./value-container');


function RowContent(props) {
    return (
        <div>
            <Label>{props.label}</Label>
            <ValueContainer>{props.value}</ValueContainer>
        </div>
    );
}

RowContent.propTypes = {
    label: string,
    value: oneOfType([element, string, number])
};


module.exports = RowContent;
