'use strict';

var React = require('react');
//var Header = require('./header');


var Koifly = React.createClass({

    render: function() {
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
});

module.exports = Koifly;
