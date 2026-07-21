function doGet(e) {
  // Conecta con la hoja activa
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  const participants = [];
  
  // Empezamos en 1 para saltar los encabezados
  for (let i = 1; i < data.length; i++) {
    // Verifica que haya folio y nombre en la fila
    if (data[i][0] && data[i][1]) {
      participants.push([data[i][0].toString(), data[i][1].toString()]);
    }
  }
  
  // Devuelve los datos en formato JSON para tu página web
  return ContentService.createTextOutput(JSON.stringify(participants))
    .setMimeType(ContentService.MimeType.JSON);
}