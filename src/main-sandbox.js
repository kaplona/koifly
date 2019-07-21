import { hot } from 'react-hot-loader/root';
import React from 'react';
import ReactDOM from 'react-dom';
import NavigationMenu from './components/common/menu/navigation-menu';

require('./main-sandbox.less');


if (process.env.NODE_ENV !== 'development') {
  throw new Error('ERROR: Sandbox is only intended for dev environment');
}


let sandbox = function() {
  return <NavigationMenu isSiteView={true} />;
};
sandbox = hot(sandbox);


function mainSandbox() {
  ReactDOM.render(
    React.createElement(sandbox),
    document.getElementById('container')
  );
}


document.addEventListener('DOMContentLoaded', mainSandbox);
