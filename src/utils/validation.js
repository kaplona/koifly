import _ from 'lodash';
import errorMessages from '../errors/error-messages';
import Util from './util';


const Validation = {
  /**
   * @param {object} validationConfig - config rules to check user inputs against { fieldName: rulesObj }
   * @param {object} formData - data from html form { fieldName: userInput }
   * @param {boolean} isSoft - if false - the validation is final, check for required empty fields is performed
   * @returns {object|null} - object with validation error messages { fieldName: msg } or null if no errors found
   */
  getValidationErrors(validationConfig, formData, isSoft) {
    const validationErrors = {};

    // For each field of given form
    Object.keys(validationConfig).forEach(fieldName => {
      const config = validationConfig[fieldName];
      let nextError = null;

      // It's error if required field is empty and it isn't soft validation mode
      if (Util.isEmptyString(formData[fieldName]) && !isSoft && config.isRequired) {
        nextError = errorMessages.NOT_EMPTY.replace('%field', config.rules.field);
      }

      // If field isn't empty check its value against its validation config
      if (!Util.isEmptyString(formData[fieldName])) {
        const methodName = config.method;
        const rules = config.rules;
        nextError = this.methods[methodName](formData, fieldName, rules, isSoft);
      }

      // If validation failed save error message for this field
      if (nextError) {
        validationErrors[fieldName] = nextError;
      }
    });

    return _.isEmpty(validationErrors) ? null : validationErrors;
  },


  // Validation methods return either true or error message
  methods: {
    /**
     * Check whether value is yyyy-mm-dd date format
     * @param {object} formData - data from html form { fieldName: userInput }
     * @param {string} fieldName
     * @returns {string|null} - error message or null if validation passed
     */
    date(formData, fieldName) {
      if (!Util.isRightDateFormat(formData[fieldName])) {
        return errorMessages.DATE_FORMAT;
      }

      return null;
    },


    /**
     * Check if the value is a number
     * additional quality checks:
     * round number, number within min and max
     * @param {object} formData - data from html form { fieldName: userInput }
     * @param {string} fieldName
     * @param {object} rules - validation rules to check user input against
     * @returns {string|null} - error message or null if validation passed
     */
    number(formData, fieldName, rules) {
      // If value is not a number
      if (!Util.isNumber(formData[fieldName])) {
        return errorMessages.NUMBER.replace('%field', rules.field);
      }

      const errorElements = [];

      // Check number quality against each given rule
      if (rules.round && !Util.isInteger(formData[fieldName])) {
        errorElements.push(' round number');
      }

      if (!Util.isNumberWithin(formData[fieldName], rules.min, rules.max)) {
        if (rules.min !== undefined) {
          errorElements.push(` greater than ${rules.min}`);
        }
        if (rules.max !== undefined) {
          errorElements.push(` less than ${rules.max}`);
        }
      }

      // If quality control failed
      if (!_.isEmpty(errorElements)) {
        return `${rules.field} must be${errorElements.join(',')}`;
      }

      return null;
    },


    /**
     * Check text length
     * @param {object} formData - data from html form { fieldName: userInput }
     * @param {string} fieldName
     * @param {object} rules - validation rules to check user input against
     * @returns {string|null} - error message or null if validation passed
     */
    text(formData, fieldName, rules) {
      if (formData[fieldName].length > rules.maxLength) {
        const errorMessage = errorMessages.MAX_LENGTH;
        return errorMessage.replace('%field', rules.field).replace('%max', rules.maxLength);
      }

      return null;
    },


    /**
     * Examples acceptable values:
     * 38.8897°, -77.0089°
     * 45.455678 56.452332
     * -15.0054 , -178.67
     * @param {object} formData - data from html form { fieldName: userInput }
     * @param {string} fieldName
     * @param {object} rules - validation rules to check user input against
     * @param {boolean} isSoft - if true - validation is not final,
     * don't perform any check since user input might not be complete
     *
     * @returns {string|null} - error message or null if validation passed
     */
    coordinates(formData, fieldName, rules, isSoft) {
      // Don't check the format for soft validation
      // so don't interrupt user from typing long coordinates input
      if (isSoft) {
        return null;
      }

      // Replace all degree characters by space
      const coord = formData[fieldName].replace(/°/g, ' ').trim();

      // Split user input by reg:
      // any number of space | any number of ',' | space or ',' | any number of ',' | any number of space
      const coordArray = coord.split(/\s*,*[,\s],*\s*/);

      // If user input is two char sets (presumably latitude and longitude)
      if (coordArray.length === 2) {
        // If latitude and longitude value is a number
        if (Util.isNumber(coordArray[0]) && Util.isNumber(coordArray[1])) {
          // If latitude and longitude are within given limits
          if (Util.isNumberWithin(coordArray[0], rules.minLatitude, rules.maxLatitude) &&
            Util.isNumberWithin(coordArray[1], rules.minLongitude, rules.maxLongitude)) {
            return null;
          }
        }
      }

      // If validation failed
      return errorMessages.COORDINATES;
    }
  }
};

export default Validation;
