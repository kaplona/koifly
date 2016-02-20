'use strict';

var React = require('react');

require('./navigation-item.less');


var NavigationItem = React.createClass({

    propTypes: {
        iconFileName: React.PropTypes.string,
        text: React.PropTypes.string,
        itemsNumber: React.PropTypes.number,
        isActive: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    render: function() {
        var className = 'navigation-item-' + this.props.itemsNumber;
        if (this.props.isActive) {
            className += ' x-active';
        }

        var imgSrc = '/static/icons/' + this.props.iconFileName;

        return (
            <div className={ className } onClick={ this.props.onClick }>
                <div className='icon'>
                    <img src={ imgSrc } width='25px' />
                </div>
                { this.props.text }
            </div>
        );
    }
});


module.exports = NavigationItem;
