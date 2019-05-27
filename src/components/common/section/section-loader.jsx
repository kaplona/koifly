'use strict';

import React from 'react';
import Loader from '../loader';

require('./section-loader.less');


export default function SectionLoader() {
  return (
    <div className='section-loader'>
      <Loader/>
    </div>
  );
}
