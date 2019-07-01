import React from 'react';

require('./compact-container.less');


// defined as class for testing purposes
export default class CompactContainer extends React.Component {
  render() {
    return (
      <div className='compact-container'>
        {this.props.children}
      </div>
    );
  }
}
