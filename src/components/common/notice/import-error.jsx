import React from 'react';
import { arrayOf, number, oneOfType, shape } from 'prop-types';
import koiflyErrorPropType from '../../../errors/error-prop-type';
import Notice from './notice';

require('./import-error.less');


export default function ImportError(props) {
  if (!(props.error instanceof Array)) {
    const errorMessage = props.error.message || 'Couldn\'t import your file';
    return <Notice text={errorMessage} type='error'/>;
  }

  const noticeText = (
    <div className='import-error'>
      <div className='title'>Couldn't import your file. Please correct next records:</div>
      <table>
        <thead>
          <tr>
            <th className='first-column'>Record#</th>
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
