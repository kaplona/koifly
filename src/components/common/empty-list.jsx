'use strict';

const React = require('react');
const { func, string } = React.PropTypes;

require('./empty-list.less');


function EmptyList(props) {
    return (
        <div className='empty-list'>
            <div>{'You don\'t have any ' + props.ofWhichItems + ' yet'}</div>
            <div className='add-button' onClick={props.onAdding}>+</div>
        </div>
    );
}

EmptyList.propTypes = {
    ofWhichItems: string.isRequired, // plural
    onAdding: func.isRequired
};


module.exports = EmptyList;
