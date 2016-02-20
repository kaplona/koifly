'use strict';

var React = require('react');

require('./bread-crumbs.less');


var BreadCrumbs = React.createClass({
    render: function() {
        return (
            <div className='bread-crumbs'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = BreadCrumbs;
