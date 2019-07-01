const errorMessages = {
  COORDINATES: 'Coordinates must be in Decimal Degrees format, like 38.8897°, -77.0089° or 45.455678 56.452332',
  DATE_FORMAT: 'Date must be in yyyy-mm-dd format',
  DOUBLE_VALUE: '%field with this name already exists',
  EITHER_BOTH_COORDS_OR_NONE: 'Require either both latitude and longitude or neither',
  EXISTENT_EMAIL: 'User with this email already exists',
  MAX_LENGTH: '%field exceeds maximum field length %max characters',
  NOT_EMPTY: '%field cannot be empty',
  NOT_EXIST: '%field you chose does no longer exist',
  NOT_VALID_EMAIL: 'You provided not valid email',
  NUMBER: '%field must be a number',
  POSITIVE_NUMBER: '%field must be number greater than 0',
  POSITIVE_ROUND: '%field must be round number greater than 0'
};

export default errorMessages;
