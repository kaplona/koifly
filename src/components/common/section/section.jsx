'use strict';

const React = require('react');
const { bool, func } = React.PropTypes;
const Button = require('../buttons/button');

require('./section.less');


const Section = React.createClass({

    propTypes: {
        isFullScreen: bool,
        onEditClick: func
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
                    <Button caption='Edit' onClick={this.props.onEditClick} />
                </div>
            );
        }
    },

    render: function() {
        let className = 'section';
        if (this.props.isFullScreen) {
            className += ' x-full-screen';
        }

        return (
            <div className={className}>
                {this.props.children}
                {this.renderEditButton()}
            </div>
        );
    }
});


module.exports = Section;
