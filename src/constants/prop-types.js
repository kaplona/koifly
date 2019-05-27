'use strict';

import { func, number, shape } from 'prop-types';


export const coordinatesPropType = shape({
  lat: number.isRequired,
  lng: number.isRequired
});

export const promisePropType = shape({
  then: func.isRequired,
  catch: func
});
