import React from 'react';
import { string } from 'prop-types';

require('./loader.less');


export default function Loader(props) {
  const className = props.className
    ? `loader ${props.className}`
    : 'loader';

  return <div className={className} />;
}

Loader.propTypes = {
  className: string
};
