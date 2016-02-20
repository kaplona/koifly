'use strict';

var React = require('react');

require('./top-buttons.less');


var TopButtons = React.createClass({

    propTypes: {
        leftElement: React.PropTypes.element,
        middleElement: React.PropTypes.element,
        rightElement: React.PropTypes.element
    },

    render: function() {
        return (
            <div className='top-buttons'>
                <div className='left-element'>
                    { this.props.leftElement }
                </div>

                <div className='middle-element'>
                    { this.props.middleElement }
                </div>

                <div className='right-element'>
                    { this.props.rightElement }
                </div>
            </div>
        );
    }
});


module.exports = TopButtons;
