'use strict';

var React = require('react');
var Button = require('../buttons/button');

require('./section.less');


var Section = React.createClass({

    propTypes: {
        isFullScreen: React.PropTypes.bool.isRequired,
        onEditClick: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            isFullScreen: false
        };
    },

    renderEditButton: function() {
        if (this.props.onEditClick) {
            return (
                <div className='edit-button'>
                    <Button caption='Edit' onClick={ this.props.onEditClick } />
                </div>
            );
        }
    },

    render: function() {
        var className = 'section';
        if (this.props.isFullScreen) {
            className += ' x-full-screen';
        }

        return (
            <div className={ className }>
                { this.props.children }
                { this.renderEditButton() }
            </div>
        );
    }
});


module.exports = Section;
