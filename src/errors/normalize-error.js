import errorTypes from './error-types';
import KoiflyError from './error';

/**
 * Will convert given error into Koifly error.
 * If error is already instance of Koifly error, nothing will be done.
 * This function converts several predefined errors into particular Koifly errors:
 * - authentication errors
 * - sequelize orm validation errors
 * If any other error passed, it will be converted into default Koifly error.
 *
 * @example of sequelize validation error:
 * {
 *    name: 'SequelizeValidationError',
 *    message: 'notNull Violation: airtime cannot be null',
 *    errors: [{
 *      message: 'airtime cannot be null',
 *      type: 'notNull Violation',
 *      path: 'airtime',
 *      value: null
 *    }]
 * }
 *
 * @example of Koifly validation error:
 * {
 *    type: 'validationError',
 *    message: 'some message',
 *    errors: {
 *      dbFieldName: error message,
 *      dbFieldName: error message
 *    }
 * }
 *
 * Note: sequelizeValidationError.message or KoiflyValidationError.message will contain error messages for all DB fields
 * separated by new line character.
 *
 * @param {Error|Object} error – Error occurred.
 * @param {string} defaultErrorType – Pass it to override default Koifly error type.
 * @param {string|null} defaultMessage – Default error message.
 * @return {KoiflyError}
 */
export default function normalizeError(error, defaultErrorType = errorTypes.DB_READ_ERROR, defaultMessage = null) {
  if (error instanceof KoiflyError) {
    return error;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(error);
  }

  if (error && error.output && error.output.payload.error === 'Unauthorized') {
    return new KoiflyError(errorTypes.AUTHENTICATION_ERROR);
  }

  if (error && error.name === 'SequelizeValidationError') {
    const validationErrors = {};
    for (let i = 0; i < error.errors.length; i++) {
      validationErrors[error.errors[i].path] = error.errors[i].message;
    }
    return new KoiflyError(errorTypes.VALIDATION_ERROR, error.message, validationErrors);
  }

  return new KoiflyError(defaultErrorType, defaultMessage);
}
