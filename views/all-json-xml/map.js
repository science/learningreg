// process all docs, returning string signatures as keys and resource_data payloads as values
function(doc) {

  // returns true if array
  var isArray = function(arr) {
    return (toString.call(arr) === "[object Array]")  ;
  };

  // Returns true if all members of elements appears in array
  // Signature: array as Array, elements as Array
  // arrayHasElements([1,2,3,4], [1,4]) // => true
  var arrayHasElements = function(array, elements) {
    if (!isArray(array) || !isArray(elements)) { return false};
    var numFoundElements = 0;
    for (var i=0;i<elements.length;i++) {
      for (var j=0;j<array.length;j++) {
        if (array[j] == elements[i]) {
          numFoundElements++;
        };
      };
    };
    // return true if we found all the elements
    return (numFoundElements == elements.length);
  };

  // process known json and xml formats, returning easy-to-process strings as keys
  // which describe the type and schema of format to be processed
  if (arrayHasElements(doc.payload_schema, ["midgley-test","json"])) {
    emit("midgley-test-json", doc.resource_data);
  };
  if (arrayHasElements(doc.payload_schema, ["midgley-test","xml"])) {
    emit("midgley-test-xml", doc.resource_data);
  };

};