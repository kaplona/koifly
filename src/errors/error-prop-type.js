import { array, object, oneOfType, string } from 'prop-types';

const koiflyErrorPropType = {
  type: string,
  message: string,
  errors: oneOfType([array, object])
};

export default koiflyErrorPropType;
