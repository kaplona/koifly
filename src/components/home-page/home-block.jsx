'use strict';

var React = require('react');

if (process.env.BROWSER) {
    require('./home-block.less');
}


var HomeBlock = React.createClass({
    render: function() {
        return (
            <div className='home-block'>
                { this.props.children }
            </div>
        );
    }
});


module.exports = HomeBlock;
