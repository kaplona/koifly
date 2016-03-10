'use strict';

var React = require('react');
var _ = require('lodash');

require('./bread-crumbs.less');


var BreadCrumbs = React.createClass({

    propTypes: {
        elements: React.PropTypes.arrayOf(
            React.PropTypes.oneOfType([
                React.PropTypes.element,
                React.PropTypes.string,
                React.PropTypes.number
            ])
        ).isRequired
    },

    render: function() {
        var separator = ' / ';
        var breadCrumbs = _.map(this.props.elements, (element, index, elements) => {
            return (
                <span key={ 'bread-crumb-' + index }>
                    { element }
                    { index < (elements.length - 1) ? separator : null }
                </span>);
        });

        return (
            <div className='bread-crumbs'>
                { breadCrumbs }
            </div>
        );
    }
});


module.exports = BreadCrumbs;
