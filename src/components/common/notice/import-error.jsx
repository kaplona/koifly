'use strict';

const React = require('react');
const { arrayOf, number, oneOfType, shape } = React.PropTypes;
const koiflyErrorPropType = require('../../../errors/error-prop-type');

const Notice = require('./notice');

require('./import-error.less');


function ImportError(props) {
  if (!(props.error instanceof Array)) {
    const errorMessage = props.error.message || 'Couldn\'t import your file';
    return <Notice text={errorMessage} type='error'/>;
  }

  const noticeText = (
    <div className='import-error'>
      <div className='title'>Couldn't process next file lines:</div>
      <table>
        <thead>
        <tr>
          <th className='first-column'>Line</th>
          <th>Error Message</th>
        </tr>
        </thead>
        <tbody>
        {props.error.map((importError, index) => (
          <tr key={index}>
            <td>{importError.row}</td>
            <td>{importError.error.message}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );

  return <Notice text={noticeText} type='error'/>;
}

ImportError.propTypes = {
  error: oneOfType([
    shape(koiflyErrorPropType),
    arrayOf(shape({
      row: number,
      error: shape(koiflyErrorPropType)
    }))
  ]).isRequired
};


module.exports = ImportError;
