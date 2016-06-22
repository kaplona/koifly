'use strict';

var React = require('react');

require('./navigation-item.less');


var NavigationItem = React.createClass({

    propTypes: {
        iconFileName: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        itemsNumber: React.PropTypes.number.isRequired,
        isActive: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            isActive: false
        };
    },

    render: function() {
        var className = 'navigation-item-' + this.props.itemsNumber;
        if (this.props.isActive) {
            className += ' x-active';
        }

        var imgSrc = '/static/icons/' + this.props.iconFileName;

        return (
            <div
                className={ className }
                onClick={ this.props.onClick }
                onTouchStart={ () => {} } // required for iOS webkit browser to trigger :active pseudo state
                >

                <div className='icon'>
                    <img src={ imgSrc } width='26px' />
                </div>
                { this.props.label }

            </div>
        );
    }
});


module.exports = NavigationItem;
