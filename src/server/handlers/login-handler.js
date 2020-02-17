import BcryptPromise from '../../utils/bcrypt-promise';
import getAllData from '../helpers/get-all-data';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import normalizeError from '../../errors/normalize-error';
import Pilot from '../../orm/models/pilots';
import setAuthCookie from '../helpers/set-auth-cookie';

/**
 * Searches for a pilot DB record with given email,
 * compares hash of given password with the one in DB
 * if success set cookie and reply to client with all pilot's data
 * @param {Object} request
 */
export default function loginHandler(request) {
  let pilot; // we need it to have reference to current pilot
  const payload = request.payload;

  // Checks payload for required fields
  if (typeof payload.email !== 'string' || typeof payload.password !== 'string') {
    return { error: new KoiflyError(errorTypes.BAD_REQUEST) };
  }

  // email is stored in lower case in DB, so as to perform case insensitivity
  return Pilot
    .findOne({ where: { email: payload.email.toLowerCase() } })
    .catch(() => {
      throw new KoiflyError(errorTypes.DB_READ_ERROR);
    })
    .then(pilotRecord => {
      if (!pilotRecord || pilotRecord.email !== payload.email.toLowerCase()) {
        throw new KoiflyError(errorTypes.AUTHENTICATION_ERROR, 'There is no user with this email');
      }
      pilot = pilotRecord;
      // Compare password provided by user with the one we have in DB
      return BcryptPromise.compare(payload.password, pilot.password);
    })
    .catch(error => {
      // If it's any other error but KoiflyError will replace it with KoiflyError with given type and message
      throw normalizeError(error, errorTypes.AUTHENTICATION_ERROR, 'You entered wrong password');
    })
    .then(() => {
      return setAuthCookie(request, pilot.id, pilot.password);
    })
    .then(() => {
      // Log in was successful
      // Reply with all user's data starting from the latest date user has on the front end
      // e.g. if user was logged out due to expiring cookie but still has data in js
      // this saves amount of data sending between server and client
      return getAllData(pilot, payload.lastModified);
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
}
