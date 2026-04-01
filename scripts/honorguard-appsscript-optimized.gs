// OPTIMIZED Honor Guard Apps Script - use bounded reads to avoid getDataRange() slowness on large sheets.
// Replace entire script in Apps Script editor, then Deploy > New version.

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = (e && e.parameter) ? e.parameter : {};

  if (params.data === 'signin') {
    var signInSheet = ss.getSheetByName('Sign In');
    var event = { date: '', occasion: '', location: '', marshalName: '' };
    var signIns = [];
    if (signInSheet) {
      event.date = getCell(signInSheet, 'C2');
      event.occasion = getCell(signInSheet, 'C3');
      event.location = getCell(signInSheet, 'C4');
      event.marshalName = getCell(signInSheet, 'C5');
      var lastRow = signInSheet.getLastRow();
      if (lastRow >= 8) {
        var data = signInSheet.getRange(8, 2, lastRow, 6).getValues();
        for (var r = 0; r < data.length; r++) {
          var name = (data[r][0] != null) ? String(data[r][0]).trim() : '';
          if (name === '') continue;
          signIns.push({
            name: name,
            contact: (data[r][1] != null) ? String(data[r][1]) : '',
            position: (data[r][2] != null) ? String(data[r][2]) : '',
            orgNumber: (data[r][3] != null) ? String(data[r][3]) : '',
            orgName: (data[r][4] != null) ? String(data[r][4]) : ''
          });
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ event: event, signIns: signIns }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var members = [];
  var membersSheet = ss.getSheetByName('Members');
  if (membersSheet) {
    var mLast = membersSheet.getLastRow();
    if (mLast >= 1) {
      var mRows = membersSheet.getRange(2, 1, mLast, 5).getValues();
      for (var i = 0; i < mRows.length; i++) {
        members.push({
          name: (mRows[i][0] != null) ? String(mRows[i][0]) : '',
          contact: (mRows[i][1] != null) ? String(mRows[i][1]) : '',
          position: (mRows[i][2] != null) ? String(mRows[i][2]) : '',
          orgNumber: (mRows[i][3] != null) ? String(mRows[i][3]) : '',
          orgName: (mRows[i][4] != null) ? String(mRows[i][4]) : ''
        });
      }
    }
  }
  var orgs = [];
  var orgsSheet = ss.getSheetByName('orgs');
  if (orgsSheet) {
    var oLast = orgsSheet.getLastRow();
    if (oLast >= 1) {
      var oRows = orgsSheet.getRange(2, 1, oLast, 2).getValues();
      for (var k = 0; k < oRows.length; k++) {
        if (oRows[k][0] !== '' || oRows[k][1] !== '') {
          orgs.push({ number: String(oRows[k][0] || ''), name: String(oRows[k][1] || '') });
        }
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ members: members, orgs: orgs }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getCell(sheet, a1Notation) {
  try {
    var val = sheet.getRange(a1Notation).getValue();
    return val != null ? String(val) : '';
  } catch (err) {
    return '';
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var signInSheet = ss.getSheetByName('Sign In');

  if (data.clearEvent === true) {
    var lastRow = signInSheet.getLastRow();
    if (lastRow >= 8) {
      signInSheet.getRange(8, 2, lastRow, 6).clearContent();
    }
    signInSheet.getRange('C2').setValue(data.eventDate != null ? data.eventDate : '');
    signInSheet.getRange('C3').setValue(data.occasion != null ? data.occasion : '');
    signInSheet.getRange('C4').setValue(data.location != null ? data.location : '');
    signInSheet.getRange('C5').setValue(data.marshalName != null ? data.marshalName : '');
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  signInSheet.getRange('C2').setValue(data.eventDate != null ? data.eventDate : '');
  signInSheet.getRange('C3').setValue(data.occasion != null ? data.occasion : '');
  signInSheet.getRange('C4').setValue(data.location != null ? data.location : '');
  signInSheet.getRange('C5').setValue(data.marshalName != null ? data.marshalName : '');

  var lastB = signInSheet.getLastRow();
  var startRow = 8;
  var maxRow = Math.max(lastB + 1, 8);
  var colB = signInSheet.getRange(8, 2, Math.min(maxRow + 500, 1000), 2).getValues();
  var nextRow = 8;
  for (var i = 0; i < colB.length; i++) {
    if (colB[i][0] === '' || colB[i][0] == null) {
      nextRow = 8 + i;
      break;
    }
    nextRow = 8 + i + 1;
  }

  signInSheet.getRange(nextRow, 2).setValue(data.name);
  signInSheet.getRange(nextRow, 3).setValue(data.contact);
  signInSheet.getRange(nextRow, 4).setValue(data.position);
  signInSheet.getRange(nextRow, 5).setValue(data.orgNumber);
  signInSheet.getRange(nextRow, 6).setValue(data.orgName);

  try {
    var membersSheet = ss.getSheetByName('Members');
    var mLast = membersSheet.getLastRow();
    if (mLast >= 2) {
      var memberRows = membersSheet.getRange(2, 1, mLast, 5).getValues();
      var existingRowIndex = -1;
      var nameLower = String(data.name).toLowerCase();
      for (var r = 0; r < memberRows.length; r++) {
        if (memberRows[r][0] && String(memberRows[r][0]).toLowerCase() === nameLower) {
          existingRowIndex = r + 2;
          break;
        }
      }
      if (existingRowIndex > 0) {
        membersSheet.getRange(existingRowIndex, 2, existingRowIndex, 5).setValues([[
          data.contact != null ? data.contact : '',
          data.position != null ? data.position : '',
          data.orgNumber != null ? data.orgNumber : '',
          data.orgName != null ? data.orgName : ''
        ]]);
      } else {
        membersSheet.appendRow([data.name, data.contact, data.position, data.orgNumber, data.orgName]);
      }
    } else {
      membersSheet.appendRow([data.name, data.contact, data.position, data.orgNumber, data.orgName]);
    }
  } catch (memberErr) {
    Logger.log('Members update error: ' + memberErr.toString());
  }

  try {
    var orgNumber = (data.orgNumber != null) ? String(data.orgNumber).trim() : '';
    var orgName = (data.orgName != null) ? String(data.orgName).trim() : '';
    if (orgNumber !== '' && orgName !== '') {
      var orgsSheet = ss.getSheetByName('orgs');
      var oLast = orgsSheet.getLastRow();
      var found = false;
      if (oLast >= 2) {
        var orgRows = orgsSheet.getRange(2, 1, oLast, 1).getValues();
        for (var j = 0; j < orgRows.length; j++) {
          if (String(orgRows[j][0]).trim() === orgNumber) {
            found = true;
            break;
          }
        }
      }
      if (!found) orgsSheet.appendRow([orgNumber, orgName]);
    }
  } catch (orgErr) {
    Logger.log('Orgs update error: ' + orgErr.toString());
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
