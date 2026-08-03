/**
 * API Google Sheets pour l'application Boule & Concours.
 *
 * 1. Créez un Google Sheet et copiez son identifiant dans SPREADSHEET_ID.
 * 2. Dans Extensions > Apps Script, remplacez Code.gs par ce fichier.
 * 3. Exécutez setupSheet() une fois puis déployez en "Application web".
 *    Exécuter en tant que : vous ; accès : toute personne.
 * 4. Copiez l'URL /exec dans app.js (const API_URL).
 */
const SPREADSHEET_ID = '1GjrpA5BPDgBJJA6PTTnhqMGlmAWOPnBbseDwF0ROJD0';
const SHEET_NAME = 'Concours';
const HEADERS = ['id', 'nom', 'debut', 'fin', 'association', 'lieu', 'format', 'telephones', 'points', 'categories', 'capacite', 'jeu', 'public','CBD', 'statut'];

function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#123C2D').setFontColor('#FFFFFF');
  }
}

function doGet() {
  try {
    return json({ success: true, contests: getContests() });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    // À remplacer ultérieurement par une vérification d'identité (Google Sign-In
    // ou jeton spécifique à chaque association) avant l'ouverture publique.
    if (payload.action !== 'create' || !payload.contest) throw new Error('Requête non valide');
    const c = payload.contest;
    const mandatory = ['name', 'association', 'date', 'end', 'place', 'phone', 'capacity', 'game', 'audience'];
    mandatory.forEach(key => { if (!c[key]) throw new Error('Champ obligatoire : ' + key); });
    const sheet = getSheet();
    const id = String(new Date().getTime());
    sheet.appendRow([id, c.name, c.date, c.end, c.association, c.place, c.format || 'Rien', c.phone, c.points || 'Propagande', (c.categories || []).join('|'), c.capacity, c.game, c.audience, c.CBD, 'publié']);
    return json({ success: true, id: id });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
}

function getContests() {
    const sheet = getSheet();

    if (sheet.getLastRow() < 2)
        return [];

    const rows = sheet
        .getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length)
        .getValues();

    return rows
        .filter(row => String(row[14]).toLowerCase() !== 'brouillon')
        .map(row => ({
            id: String(row[0]),
            name: row[1],
            date: toIso(row[2]),
            end: toIso(row[3]),
            association: row[4],
            place: row[5],
            format: row[6],
            phone: row[7],
            points: row[8],
            categories: String(row[9]).split('|').filter(Boolean),
            capacity: Number(row[10]),
            game: row[11],
            audience: row[12],
            CBD: row[13],
            statut: row[14]
        }));
}

function getSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('La feuille « ' + SHEET_NAME + ' » est introuvable. Exécutez setupSheet().');
  return sheet;
}
function toIso(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
  return String(value);
}
function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
