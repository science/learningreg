function(head,req) {
  var row;
  // send header to permit examining output in a browser
  start({"headers": {"Content-Type": "text/plain"}});

  while (row = getRow()) {
    var processedRow = false;
    // only process documents in formats we know about
    if (row.key == "midgley-test-json") {
      var json = row.value;
      var title = json.title;
      var author = json.author;
      var url = json.sub_url_struct.sub_url;
      var orig_format = "midgley-test-json";
      processedRow = true;
    }
    else if (row.key == "midgley-test-xml") {
      var xmlObj = new XML(row.value);
      // transform XML to JSON
      var title = xmlObj.title_key.text().toXMLString();
      var author = xmlObj.title_key.author_sub.text().toXMLString();
      var url = xmlObj.@url.toXMLString(); //@ means attribute in E4X
      var orig_format = "midgley-test-xml";
      processedRow = true;
    };
    if (processedRow) {
      // send transformed data as json
      var json = {"title": title,"author": author, "url": url, original_format: orig_format};
      send(JSON.stringify(json)+"\n");
    };
  };
 
};