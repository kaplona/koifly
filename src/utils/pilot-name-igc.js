/**
 * IGC files have a special file naming format: https://xp-soaring.github.io/igc_file_format/igc_format_2008.html#link_2.5
 * pilot names are encoded to 3 characters short name
 * @param {string} pilotName - full pilot name
 * @returns {string} - pilot name part expected in igc file name
 */
export default function pilotNameToIGCShort(pilotName) {
  // translate special characters and split name parts
  const nameParts = pilotName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ');
  if (nameParts.length > 1) {
    // if first name(s) and surname use 1st character of first name and 2 chars of last name
    return (nameParts[0][0] + nameParts[nameParts.length - 1].substr(0, 2)).toUpperCase();
  }
  // if only one name (or no spaces), use first 3 letters of this
  return nameParts[0].substr(0, 3).toUpperCase();
}
