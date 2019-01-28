'use strict';

const React = require('react');
const Loader = require('../loader');

require('./section-loader.less');


const SectionLoader = React.createClass({

    render: function() {
        return (
            <div className='section-loader'>
                <Loader />
            </div>
        );
    }
});


module.exports = SectionLoader;
