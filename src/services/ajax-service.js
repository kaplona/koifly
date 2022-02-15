import errorTypes from '../errors/error-types';
import KoiflyError from '../errors/error';
import dataServiceConstants from '../constants/data-service-constants';


const ajaxService = {

  /**
   * Sends Ajax requests to the server,
   *
   * @private
   *
   * @param {object} options
   *   @param {string} options.url
   *   @param {string} options.method - get or post
   *   @param {object} [options.queryParams] - for get requests
   *   @param {object} [options.data] - for post requests
   *   @param {object} [options.isThirdPartyRequest] - whether to include csrf token or not
   *
   * @param {boolean} [isRetry] - is used to prevent csrf attacks,
   * each request to server shall have csrf cookie which value is send to the server along with the request
   * server compare the value received with the request and the cookie value
   * if they don't match it reset cookie (in case it was expired) and 'asks' front end to repeat request
   *
   * @returns {Promise} - resolved with server respond or rejected with  server error
   */
  send(options, isRetry) {
    let url = options.url;
    const data = options.data;
    const csrfCookie = this.getCsrfCookie();

    if (options.method === 'get') {
      // Make valid query string from params object
      // Add csrf token to prevent csrf attack to the server
      const queryParams = options.isThirdPartyRequest
        ? options.queryParams
        : Object.assign({}, options.queryParams, { csrf: csrfCookie });
      url = url + '?' + this.buildQuery(queryParams);
    }

    if (options.method === 'post') {
      // Add csrf token to prevent csrf attack to the server
      data.csrf = csrfCookie;
    }

    return new Promise((resolve, reject) => {
      const ajaxRequest = new XMLHttpRequest();
      ajaxRequest.timeout = dataServiceConstants.TIMEOUT;

      // If we got response from the server
      ajaxRequest.addEventListener('load', () => {
        if (ajaxRequest.status === 401) {
          reject(new KoiflyError(errorTypes.AUTHENTICATION_ERROR));
          return;
        }

        if (ajaxRequest.status >= 400 && ajaxRequest.status < 600) {
          reject(new KoiflyError(errorTypes.DB_READ_ERROR));
          return;
        }

        const serverResponse = JSON.parse(ajaxRequest.responseText);

        if (process.env.NODE_ENV === 'development') {
          console.log('server response:', serverResponse); // eslint-disable-line no-console
        }

        if (!serverResponse.error) {
          resolve(serverResponse);
          return;
        }

        if (serverResponse.error.type === errorTypes.INVALID_CSRF_TOKEN) {
          if (isRetry) {
            reject(new KoiflyError(errorTypes.DB_READ_ERROR));
          } else {
            ajaxService
              .send(options, true)
              .then(resolve)
              .catch(reject);
          }
          return;
        }

        reject(serverResponse.error);
      });

      // If request failed
      ajaxRequest.addEventListener('error', () => reject(new KoiflyError(errorTypes.AJAX_NETWORK_ERROR)));
      ajaxRequest.addEventListener('timeout', () => reject(new KoiflyError(errorTypes.AJAX_NETWORK_ERROR)));

      // Open and send request
      ajaxRequest.open(options.method, url);

      if (options.method === 'post') {
        ajaxRequest.setRequestHeader('Content-Type', 'application/json');
      }

      ajaxRequest.send(data ? JSON.stringify(data) : null);
    });
  },


  /**
   * @param {string} url
   * @param {Object} [queryParams]
   * @param {Boolean} [isThirdPartyRequest]
   * @returns {Promise} - resolved with server respond or rejected with  server error
   */
  get(url, queryParams, isThirdPartyRequest = false) {
    return this.send({
      url: url,
      method: 'get',
      queryParams: queryParams,
      isThirdPartyRequest: isThirdPartyRequest
    });
  },


  /**
   * @param {string} url
   * @param {Object} [data]
   * @returns {Promise} - resolved with server respond or rejected with  server error
   */
  post(url, data = {}) {
    return this.send({ url: url, method: 'post', data: data });
  },


  /**
   * @private
   * @param {object} queryParams
   * @returns {string} - valid url query
   */
  buildQuery(queryParams) {
    return Object
      .keys(queryParams)
      .map(key => {
        const queryValue = queryParams[key];
        const queryValueString = typeof queryValue === 'string' ? queryValue : JSON.stringify(queryValue);
        return encodeURIComponent(key) + '=' + encodeURIComponent(queryValueString);
      })
      .join('&');
  },


  /**
   * Idea from:
   * http://stackoverflow.com/questions/10730362/get-cookie-by-name
   *
   * @private
   * @returns {string|null} - csrf token or null if there is no such
   */
  getCsrfCookie() {
    // Prepend '; ' to cookie string
    // so as to have '; name=value; name=value;'
    // in this case we are sure that 'csrf' is a full cookie name
    const value = '; ' + document.cookie;

    // divide cookie string into two parts,
    // where the second one starts with the csrf cookie value
    const parts = value.split('; csrf=');

    // If there is a cookie with 'csrf' name
    if (parts.length === 2) {
      // Take the second part of cookie string (with the value we need)
      // then take everything before ';'
      return parts.pop().split(';')[0];
    }

    return null;
  }
};


export default ajaxService;
