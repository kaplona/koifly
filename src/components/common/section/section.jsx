'use strict';

var React = require('react');
var Button = require('../buttons/button');

require('./section.less');


var Section = React.createClass({

    propTypes: {
        isFullScreen: React.PropTypes.bool,
        isCompact: React.PropTypes.bool, // smaller plate for login/signup pages
        onEditClick: React.PropTypes.func
    },

    renderEditButton: function() {
        if (this.props.onEditClick) {
            return (
                <div className='edit-button'>
                    <Button text='Edit' onClick={ this.props.onEditClick }/>
                </div>
            );
        }
    },

    render: function() {
        var className = 'section';
        if (this.props.isFullScreen) {
            className += ' x-full-screen';
        }

        if (this.props.isCompact) {
            className += ' x-compact';
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
