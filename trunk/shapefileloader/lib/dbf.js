/**
 * @fileoverview Parses a .dbf file based on the xbase standards as documented
 * here: http://www.clicketyclick.dk/databases/xbase/format/dbf.html
 * @author Mano Marks
 */

// Creates global namespace.
DBF = {};

DBFParser = function() {};

/**
 * Executes a binary XHR to load a .dbf file and then creates a callback to
 * handle the result.
 * @param {string} url URL to the .dbf file.
 * @param {function(Object)} callback the function to be called when finished.
 * @param {Function} onerror the function to be called in case of an error
 *                   loading the file.
 */
 DBFParser.load = function(url, callback, onerror) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'arraybuffer';
  xhr.onload = function() {
    var d = new DBFParser().parse(xhr.response);
    callback(d);
  };
  xhr.onerror = onerror;
  xhr.open('GET', url);
  xhr.send(null);
};

/**
 * Parses through the .dbf file byte by byte
 * @param {arraybuffer} arrayBuffer the ArrayBuffer created by loading the file
 *                        in XHR.
 * @return {object} o An object representing the .dbf file.
 */
DBFParser.prototype.parse = function(arrayBuffer) {
  var o = {};
  var dv = new DataView(arrayBuffer);
  var idx = 0;
  o.version = dv.getInt8(idx, false);

  idx += 1;
  o.year = dv.getUint8(idx) + 1900;
  idx += 1;
  o.month = dv.getUint8(idx);
  idx += 1;
  o.day = dv.getUint8(idx);
  idx += 1;

  o.numberOfRecords = dv.getInt32(idx, true);
  idx += 4;
  o.bytesInHeader = dv.getInt16(idx, true);
  idx += 2;
  o.bytesInRecord = dv.getInt16(idx, true);
  idx += 2;
  //reserved bytes
  idx += 2;
  o.incompleteTransation = dv.getUint8(idx);
  idx += 1;
  o.encryptionFlag = dv.getUint8(idx);
  idx += 1;
  // skip free record thread for LAN only
  idx += 4;
  // reserved for multi-user dBASE in dBASE III+
  idx += 8;
  o.mdxFlag = dv.getUint8(idx);
  idx += 1;
  o.languageDriverId = dv.getUint8(idx);
  idx += 1;
  // reserved bytes
  idx += 2;

  o.fields = [];
  while (true) {
    var field = {};
    var nameArray = [];
    for (var i = 0; i < 10; i++) {
      var letter = dv.getUint8(idx);
      if (letter != 0) nameArray.push(String.fromCharCode(letter));
      idx += 1;
    }
    field.name = nameArray.join('');
    idx += 1;
    field.type = String.fromCharCode(dv.getUint8(idx));
    idx += 1;
    // Skip field data address
    idx += 4;
    field.fieldLength = dv.getUint8(idx);
    idx += 1;
    //field.decimalCount = dv.getUint8(idx);
    idx += 1;
    // Skip reserved bytes multi-user dBASE.
    idx += 2;
    field.workAreaId = dv.getUint8(idx);
    idx += 1;
    // Skip reserved bytes multi-user dBASE.
    idx += 2;
    field.setFieldFlag = dv.getUint8(idx);
    idx += 1;
    // Skip reserved bytes.
    idx += 7;
    field.indexFieldFlag = dv.getUint8(idx);
    idx += 1;
    o.fields.push(field);
    var test = dv.getUint8(idx);
    // Checks for end of field descriptor array. Valid .dbf files will have this
    // flag.
    if (dv.getUint8(idx) == 0x0D) break;
  }

  idx += 1;
  o.records = [];

  for (var i = 0; i < o.numberOfRecords; i++) {
    var record = {};
    // Skip record deleted flag.
    //record["recordDeleted"] = String.fromCharCode(dv.getUint8(idx));
    idx += 1;
    for (var j = 0; j < o.fields.length; j++) {
      var charString = [];
      for (var h = 0; h < o.fields[j].fieldLength; h++) {
        charString.push(String.fromCharCode(dv.getUint8(idx)));
        idx += 1;
      }
      record[o.fields[j].name] = charString.join('').trim();

    }
    o.records.push(record);
  }

  return o;
};
