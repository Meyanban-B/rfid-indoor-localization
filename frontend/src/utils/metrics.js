/**
 * Calculates 3D distance and 2D compass bearing angle/direction of a tag relative to a reader position.
 * @param {Object} tagPos - {x, y, z} coordinates of the RFID tag.
 * @param {Object} readerPos - {x, y, z} coordinates of the RFID reader.
 * @returns {Object|null} - Calculated metrics: { distance, angle, direction } or null.
 */
export const calculateRelativeMetrics = (tagPos, readerPos) => {
  if (!tagPos || !readerPos) return null;
  if (tagPos.x === undefined || tagPos.y === undefined || tagPos.z === undefined) return null;
  if (readerPos.x === undefined || readerPos.y === undefined || readerPos.z === undefined) return null;

  const dx = tagPos.x - readerPos.x;
  const dy = tagPos.y - readerPos.y;
  const dz = tagPos.z - readerPos.z;

  // 3D Euclidean Distance
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // 2D Bearing Angle in degrees (XY plane)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  // Map bearing to compass direction
  let direction = 'N';
  if (angle >= 22.5 && angle < 67.5) direction = 'NE';
  else if (angle >= 67.5 && angle < 112.5) direction = 'E';
  else if (angle >= 112.5 && angle < 157.5) direction = 'SE';
  else if (angle >= 157.5 && angle < 202.5) direction = 'S';
  else if (angle >= 202.5 && angle < 247.5) direction = 'SW';
  else if (angle >= 247.5 && angle < 292.5) direction = 'W';
  else if (angle >= 292.5 && angle < 337.5) direction = 'NW';

  return {
    distance,
    angle,
    direction
  };
};
