'use strict';

import React from 'react';
import { oneOf } from 'prop-types';

if (process.env.BROWSER) {
  require('./screen-shot.less');
}


export default function ScreenShort() {
  const firstScreenShort = ' x-' + this.props.type + '-1';
  const secondScreenShort = ' x-' + this.props.type + '-2';

  return (
    <div className='screen-shots'>
      <div className={'first screen-shot' + firstScreenShort}/>
      <div className={'second screen-shot' + secondScreenShort}/>
    </div>
  );
}

ScreenShort.propTypes = {
  type: oneOf(['flights', 'sites', 'gliders']).isRequired
};
