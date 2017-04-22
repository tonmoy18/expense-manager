var CLIENT_ID =
  "840179112792-bhg3k1h0dcnp9ltelj21o6vibphjcufe.apps.googleusercontent.com";

// Array of API discovery doc URLs for APIs used
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4"
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// expense sheet id
var SPREADSHEET_ID = "1tAd4YjX8VgRkRG8-LXuYLhlUsyZgxLsRKqvbK74fetY";

var authorizeButton = document.getElementById("authorize-button");
var signoutButton = document.getElementById("signout-button");

var description = document.getElementById("description");
var date = document.getElementById("date");
var accountSelect = document.getElementById("account");
var categorySelect = document.getElementById("category");
var expense = document.getElementById("expense");
var income = document.getElementById("income");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    })
    .then(function() {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    updateAccounts();
    updateCategories();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Add expense to the sheet
 */
function addExpense() {
  var epochDay = new Date(1899, 11, 31);
  var expenseDate = new Date(date.value);
  var oneDay = 24 * 60 * 60 * 1000;

  var days = Math.round(
    Math.abs(epochDay.getTime() - expenseDate.getTime()) / oneDay
  );
  var description = desc.value;
  var account = accountSelect.value;
  var category = categorySelect.value;
  var expenseAmt = expense.value;
  var incomeAmt = income.value;

  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: SPREADSHEET_ID,

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: "Expenses!A1",

    includeValuesInResponse: true,

    responseDateTimeRenderOption: "FORMATTED_STRING",

    responseValueRenderOption: "FORMATTED_VALUE",

    // How the input data should be interpreted.
    valueInputOption: "USER_ENTERED",

    // How the input data should be inserted.
    insertDataOption: "INSERT_ROWS",

    resource: {
      values: [[days, description, account, category, expenseAmt, incomeAmt]]
    }
  };

  gapi.client.sheets.spreadsheets.values
    .append(request)
    .then(function(err, response) {
      if (err) {
        console.log(err);
        return;
      }

      date.value = "";
      desc.value = "";
      accountSelect.value = "";
      categorySelect.value = "";
      expense.value = "";
      income.value = "";
    });
}

/**
 * Fetch all accounts from sheet and update the select dropdown
 */
function updateAccounts() {
  gapi.client.sheets.spreadsheets.values
    .get(getRequestObj("Data!A3:A18"))
    .then(function(response) {
      var accounts = "";
      var allValues = response.result.values[0];
      allValues.forEach(function(value) {
        accounts += wrapInOption(value);
      });

      accountSelect.innerHTML = accounts;
    });
}

/**
 * Fetch expense categories from sheet and update the select dropdown
 */
function updateCategories() {
  gapi.client.sheets.spreadsheets.values
    .get(getRequestObj("Data!E3:E18"))
    .then(function(response) {
      var categories = "";
      var allValues = response.result.values[0];
      allValues.forEach(function(value) {
        categories += wrapInOption(value);
      });

      categorySelect.innerHTML = categories;
    });
}

function getRequestObj(range) {
  return {
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    dateTimeRenderOption: "FORMATTED_STRING",
    majorDimension: "COLUMNS",
    valueRenderOption: "FORMATTED_VALUE"
  };
}

function wrapInOption(option) {
  return `<option value='${option}'>${option}</option>`;
}
