'use strict';

var React = require('react');
var Header = require('./header');

require('./koifly.css');

var Koifly = React.createClass({

    render: function() {
        return (
            <div>
                <Header />
                { this.props.children }
            </div>
        );
    }
});

module.exports = Koifly;