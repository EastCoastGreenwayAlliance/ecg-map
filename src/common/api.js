export const noop = () => ({});

const isNumber = val => val && typeof val === 'number';

const parseURLHash = () => {
  // parses the URL hash to see if it contains zxy settings for the leaflet map
  // used to set the map's center and zoom on load
  const hash = window.location.hash;
  if (!hash.length) return noop();

  const split = hash.split('#')[1];
  if (!split) return noop();

  const zxy = split.split('/');
  if (!zxy.length || zxy.length < 3 || zxy.length > 3) return noop();

  return {
    zoom: isNumber(+zxy[0]) ? +zxy[0] : null,
    lat: isNumber(+zxy[1]) ? +zxy[1] : null,
    lng: isNumber(+zxy[2]) ? +zxy[2] : null,
  };
};

export default parseURLHash;
