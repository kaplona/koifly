import errorMessages from '../../errors/error-messages';
import Util from '../../utils/util';

/**
 * Checks if value is a date string in yyyy-mm-dd format.
 * @param {string} value
 */
export default function isDate(value) {
  if (typeof value !== 'string' || !Util.isRightDateFormat(value)) {
    throw new Error(errorMessages.DATE_FORMAT);
  }
}
