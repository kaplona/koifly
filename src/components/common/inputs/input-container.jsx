import React from 'react';

require('./input-container.less');


export default function InputContainer(props) {
  return (
    <div className='input-container'>
      <div className='arrow'>{'»'}</div>
      {props.children}
    </div>
  );
}
