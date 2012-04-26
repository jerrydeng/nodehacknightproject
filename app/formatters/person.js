
var DEFAULT_PICTURE_URL = "http://static01.linkedin.com/scds/common/u/img/icon/icon_no_photo_no_border_60x60.png";

/**
  Formatters convert input json into our desired model format
*/

function reformatSingle(person, options) {
  if (person && (person.id == 'private')) {
    return undefined;
  }
  if (person) {
    if (!person.pictureUrl) {
      person.pictureUrl = DEFAULT_PICTURE_URL;
    }
  }
  return person;
}

function reformat(people, options) {
  if (!people) { return people}
  if (!(people instanceof Array)) {
    return reformatSingle(people, options);
  } 
  people.forEach(function(person) {reformatSingle(person)});
  return(people);
}

//===== PUBLIC ================================================================

module.exports = {
  reformat: reformat
};