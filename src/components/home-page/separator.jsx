import React from 'react';

if (process.env.BROWSER) {
  require('./separator.less');
}


export default function Separator() {
  return <div className='separator'/>;
}
