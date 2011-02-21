// Return all resource data documents
function(doc) {
  if (doc.doc_type == "resource_data") {
    emit(doc.doc_ID, doc);
  };
};