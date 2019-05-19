'use strict';

const React = require('react');
const Loader = require('../loader');

require('./section-loader.less');


function SectionLoader() {
  return (
    <div className='section-loader'>
      <Loader/>
    </div>
  );
}


module.exports = SectionLoader;
