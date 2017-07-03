import {
  ACTIVETURNING_UPDATE,
} from '../common/actionTypes';

export const updateActiveTurning = stuff => ({
  type: ACTIVETURNING_UPDATE,
  ...stuff,
});

export default updateActiveTurning;
