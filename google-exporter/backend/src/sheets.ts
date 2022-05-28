
const { GoogleSpreadsheet } = require('google-spreadsheet');


exports.createSheet = async (credentials: any, sheetName: string, headers: string)  => {
  const doc = new GoogleSpreadsheet();
  
  doc.useRawAccessToken(credentials.access_token)

  const newDoc = await doc.createNewSpreadsheetDocument({ title: sheetName }); 
  const newSheet = doc.sheetsByIndex[0]
  await newSheet.setHeaderRow(headers)
  return doc

}

exports.insertLine = async (credentials: any, sheetId: string, data: any) => {
  const doc = new GoogleSpreadsheet(sheetId);

  doc.useRawAccessToken(credentials.access_token)
  await doc.loadInfo()
  const row = await doc.sheetsByIndex[0].addRow(data)
  return {sheetName: doc.title, row: row._rowNumber}
}

exports.findLines = async(credentials: any, sheetId: string) => {
  const doc = new GoogleSpreadsheet(sheetId);

  doc.useRawAccessToken(credentials.access_token)
  await doc.loadInfo()
  const rows = await doc.sheetsByIndex[0].getRows()
  return rows
}

exports.updateLine = async (line: any, data: any) => {
  Object.keys(line).forEach(key => {
      if (data[key]) {
          line[key] = data[key];
      }
  });
  const resp = await line.save();
  return resp;
};



