import {
  ACTIVE_TURNING_UPDATE,
  ACTIVE_TURNING_ENABLE,
  ACTIVE_TURNING_DISABLE,
} from '../common/actionTypes';

export const enableActiveTurning = () => ({
  type: ACTIVE_TURNING_ENABLE,
});

export const disableActiveTurning = () => ({
  type: ACTIVE_TURNING_DISABLE,
});

export const updateActiveTurning = stuff => ({
  type: ACTIVE_TURNING_UPDATE,
  ...stuff,
});

export default updateActiveTurning;
