'use strict';

const React = require('react');

if (process.env.BROWSER) {
    require('./home-block.less');
}

const HomeBlock = React.createClass({
    render() {
        return (
            <div className='home-block'>
                {this.props.children}
            </div>
        );
    }
});


module.exports = HomeBlock;
