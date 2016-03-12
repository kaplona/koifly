'use strict';

var React = require('react');
var _ = require('lodash');

require('./desktop-bottom-grid.less');


var DesktopBottomGrid = React.createClass({

    propTypes: {
        leftElements: React.PropTypes.arrayOf(React.PropTypes.element),
        rightElement: React.PropTypes.element
    },

    render: function() {
        var leftElements = _.map(this.props.leftElements, (element, index) => {
            return <div key={ 'left-element-' + index }>{ element }</div>;
        });

        return (
            <div className='bottom-grid'>
                <div className='left-elements'>
                    { leftElements }
                </div>

                <div className='right-element'>
                    { this.props.rightElement }
                </div>
            </div>
        );
    }
});


module.exports = DesktopBottomGrid;
