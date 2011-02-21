// (c) Steve Midgley 2011
// Released under Apache 2.0 license 
// (http://www.apache.org/licenses/LICENSE-2.0.html)

// Use: This file validates an incoming CouchDB JSON document for compatibility
//      with Learning Registry specification (currently 0.15.0)
// Install: For use with CouchDB/CouchApp. This file goes in the root 
//          of a CouchApp, and should be pushed along with the rest of the app:
//          E.g., "couchapp push"

function (newDoc, oldDoc, userCtx, secObj) {
// require statement isn't working here - don't know why. Copying validate code here for now. Ergh.
// var v = require("lib/validate").init(newDoc, oldDoc, userCtx, secObj);
  

  // ** VALIDATION UTILITY FUNCTIONS
  
  // Throws error with message, failing validation
  var forbidden = function(message) {    
    throw({forbidden : message});
  };
  
  // returns true of keyExists in newDoc
  // keyExists("varKeyWhichExists") // => true
  var keyExists = function(key) {
    return !(typeof newDoc[key] === "undefined");
  };
  
  // returns true if newDoc[key] is UTC parseable
  // OR returns true if newDoc[key] does not exist
  // isDateFormatted("varDateKey"); // => true
  isDateFormatted = function(key) {
    if (!keyExists(key)) {return true;}
    else if (newDoc[key].match(/\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}(\.\d*)?Z/)) {
      return true;
    }
    else { return false; };
  };

  // requires passed strings to exist as keys in newDoc
  // require("key1","key2");
  var mustExist = function() {
    for (var i=0; i < arguments.length; i++) {
      var key = arguments[i];
      var message = "The '"+key+"' key is required.";
      if (typeof newDoc[key] == "undefined") forbidden(message);
    };
  };
  
  // returns true if newDoc[key] matches value
  // keyMatches("key1", "test_value");
  var keyMatches = function(key, value) {
    return (newDoc[key] == value)
  };
  
  // requires key to match one of array of values or fails with error
  // mustMatch("key1",["value1","value2"]);
  var mustMatch = function(key,values) {
    var matchesAValue = false;
    for (var i=0; i < values.length; i++) {
      if (newDoc[key] == values[i]) {
        matchesAValue = true;
      };
    };
    if (!matchesAValue) {
      var message = "The '"+key+"' key must match the fixed vocabulary: ["+values.join(", ")+"]";
      forbidden(message);
    };
  };

  // requires key to match "typeof" function for string specifiedType
  // OR must be undefined (this function does not require a key to exist
  // but if a key does it exist, it must match specified type
  // isSpecifiedType(varBool, "boolean");
  var mustBeSpecifiedType = function(key, specifiedType) {
    // key must exist and match specified type or we permit it
    // use mustMatch function to ensure that key exists
    var isWrongType=false;
    var message = "";
    if (specifiedType == "array") {
      if (!(toString.call(newDoc[key]) === "[object Array]")) {
        message = "The '"+key+"' key must be of type '"+specifiedType+"'";
        isWrongType=true;
      };
    }
    else if (keyExists(key) && (typeof newDoc[key] === specifiedType) == false) {
      var message = "The '"+key+"' key must be of type '"+specifiedType+"'";
      isWrongType = true;
    };
    // throw validation error w/message if key is wrong type
    if (isWrongType) { forbidden(message); };
  };
  
  // requires key to be boolean type
  // isBoolean("varBooleanKey");
  var mustBeBoolean = function(key) {
    mustBeSpecifiedType(key,"boolean");
  };

  // requires single passed key to be array type  
  var mustBeArray = function(key) {
    mustBeSpecifiedType(key, "array");
  };

  // requires arbitrary passed elements to be array type  
  var mustBeArrays = function() {
    for (var i=0; i < arguments.length; i++) {
      mustBeArray(arguments[i]);
    };
  };

  // requires key to be string type
  // isString("varStringKey");
  var mustBeString = function(key) {
    mustBeSpecifiedType(key, "string");
  };
  
  // requires arbitrary number of string parameters are all string variable types
  // areStrings("varStringKey1", "varStringKey2");
  var mustBeStrings = function() {
    for (var i=0; i < arguments.length; i++) {
      mustBeString(arguments[i]);
    };
  };
  
  var mustBeDateTime = function(key) {
    if (!isDateFormatted(key)) {
      var message = "The '"+key+"' key must be in valid date format. Try: 2010-02-24T17:00:03.432Z";
      forbidden(message);
    };
  };

  // requires arbitrary number of string parameters are all string variable types
  // areStrings("varStringKey1", "varStringKey2");
  var mustBeDateTimes = function() {
    for (var i=0; i < arguments.length; i++) {
      mustBeDateTime(arguments[i]);
    };
  };

  // ** VALIDATION OF ENVELOPE SECTION (EDIT THIS SECTION TO ADD MORE VALIDATIONS)

  // Validation for deletion
  // no validation required for deleting documents
  if (newDoc._deleted) {return};

  // Validation for submission
  // LR Envelope required keys
  mustExist("doc_type", "doc_ID", "doc_version", "active", "resource_data_type", "submitter_type","submitter", "submission_TOS", "resource_locator", "publishing_node");
  // conditional required keys (key is required based on some set of conditions)
  if (keyMatches("payload_placement", "linked")) {
    mustExist("payload_locator");
    mustBeString("payload_locator");
  };
  // controlled vocabularies
  mustMatch("resource_data_type", ["metadata", "paradata", "resource"]);
  mustMatch("doc_type", ["resource_data"]);
  mustMatch("doc_version", ["0.10.0"]);
  mustMatch("payload_placement", ["inline", "linked", "attached"]);
  // datatype requirements 
  //   these functions do not mandate existence, but if present must be of specified datatype
  mustBeBoolean("active");
  mustBeStrings("doc_version", "doc_ID", "submitter_type", "submitter", "submitter_TTL", "submission_TOS", "resource_TTL", "payload_schema_locator", "payload_schema_format");
  mustBeDateTimes("submitter_timestamp", "update_timestamp", "node_timestamp", "create_timestamp");
  mustBeArrays("filtering_keys", "payload_schema");
}
