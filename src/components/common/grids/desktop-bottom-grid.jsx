'use strict';

const React = require('react');
const { arrayOf, element, oneOfType, string } = React.PropTypes;
const _ = require('lodash');

require('./desktop-bottom-grid.less');


const DesktopBottomGrid = React.createClass({

    propTypes: {
        leftElements: arrayOf(oneOfType([element, string])),
        rightElement: oneOfType([element, string])
    },

    render: function() {
        const leftElements = _.map(this.props.leftElements, (el, index) => {
            return <div key={'left-element-' + index}>{el}</div>;
        });

        return (
            <div className='bottom-grid'>
                <div className='left-elements'>
                    {leftElements}
                </div>

                <div className='right-element'>
                    {this.props.rightElement}
                </div>
            </div>
        );
    }
});


module.exports = DesktopBottomGrid;
