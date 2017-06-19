function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

export const setStorageItem = (type, val) => {
  if (storageAvailable('localStorage')) {
    localStorage.setItem(type, val);
  }
};

export const getStorageItem = (type) => {
  if (storageAvailable('localStorage')) {
    const data = localStorage.getItem(type);

    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  return null;
};
