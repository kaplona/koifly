'use strict';

var React = require('react');
var Header = require('./common/menu/header');


var Koifly = React.createClass({

    render: function() {
        return (
            <div className='content'>
                <Header />
                { this.props.children }
            </div>
        );
    }
});

module.exports = Koifly;
