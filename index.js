const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const fileLocation = getArgs().location== 'remote' ? '../../Sitetracker/develop_repo/data/wm/': './data/';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), generateData);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Generates json files for each sheet in the spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * Make sure to publish the sheet to web before you try to read the data
 * If you see a 401 error or api error in fetching data, check the below thread
 * @see https://stackoverflow.com/questions/37315266/google-sheets-api-v4-receives-http-401-responses-for-public-feeds
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function generateData(auth) {
  var sheetsList = [
                      { name: 'Site__cs',
                        range: 'Site!A1:N12894'
                      },
                      { name: 'Candidate__cs',
                        range: 'Candidate!A1:N4'
                      },
                      { name: 'Segment__cs',
                        range: 'Segment!A1:H84'
                      },
                      { name: 'Lease__cs',
                        range: 'Lease!A1:Q3318'
                      },
                      { name: 'Lease_Critical_Date__cs',
                        range: 'Lease_Critical_Date!A1:H341'
                      },
                      { name: 'Lease_Payment_Term__cs',
                        range: 'Lease_Payment_Term!A1:T394'
                      },
                      { name: 'Form_Theme__cs',
                        range: 'Form_Theme!A1:H17'
                      },
                      { name: 'Checklist_Template__cs',
                        range: 'Checklist_Template!A1:C21'
                      },
                      { name: 'Checklist_Item_Template__cs',
                        range: 'Checklist_Item_Template!A1:X357'
                      },
                      { name: 'Project_Price_Book__cs',
                        range: 'Project_Price_Book!A1:F7'
                      },
                      { name: 'Pricebook_Item__cs',
                        range: 'Pricebook_Item!A1:L26'
                      },
                      { name: 'Vendor_Payment_Templatecs',
                        range: 'Vendor_Payment_Template!A1:J30'
                      },
                      { name: 'Project_Milestone__cs',
                        range: 'Project_Milestone!A1:G308'
                      },
                      { name: 'Project_Template__cs',
                        range: 'Project_Template!A1:P17'
                      },
                      { name: 'Activity_Template__cs',
                        range: 'Activity_Template!A1:AU578'
                      },
                    ];
  const sheets = google.sheets({version: 'v4', auth});
  sheetsList.map((sheetItem) => {
    sheets.spreadsheets.values.get({
        spreadsheetId: '1WJ7G9JmsjnaguKUyVbfcb9O3dflp987EOS995Z3CHDs', //Actual
        range: sheetItem.range,
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
          switch(sheetItem.range) {
            case sheetsList[0].range: //SiteCS
              generate_SiteCS_file(sheetItem.name, rows);
              break;
            case sheetsList[1].range: //CandidateCS
              generate_CandidateCS_file(sheetItem.name, rows);
              break;
            case sheetsList[2].range: //SegmentCS
              generate_SegmentCS_file(sheetItem.name, rows);
              break;
            case sheetsList[3].range: //LeaseCS
              generate_LeaseCS_file(sheetItem.name, rows);
              break;
            case sheetsList[4].range: //LeaseCriticalDateCS
              generate_LeaseCriticalDateCS_file(sheetItem.name, rows);
              break;
            case sheetsList[5].range: //LeasePaymentTermCS
              generate_LeasePaymentTermCS_file(sheetItem.name, rows);
              break;
            case sheetsList[6].range: //FormThemeCS
              generate_FormThemeCS_file(sheetItem.name, rows);
              break;
            case sheetsList[7].range: //ChecklistTemplateCS
              generate_ChecklistTemplateCS_file(sheetItem.name, rows);
              break;
            case sheetsList[8].range: //ChecklistItemTemplateCS
              generate_ChecklistItemTemplateCS_file(sheetItem.name, rows);
              break;
            case sheetsList[9].range:
              generate_ProjectPriceBook_file(sheetItem.name, rows);
              break;
            case sheetsList[10].range:
              generate_PricebookItem_file(sheetItem.name, rows);
              break;
            case sheetsList[11].range:
              generate_VendorPaymentTemplate_file(sheetItem.name, rows);
              break;
            case sheetsList[12].range:
              generate_ProjectMilestoneCS_file(sheetItem.name, rows);
              break;
            case sheetsList[13].range:
              generate_ProjectTemplate_file(sheetItem.name, rows);
              break;
            case sheetsList[14].range:
              generate_ActivityTemplate_file(sheetItem.name, rows);
              break;
            default:
              console.log('No data found.');
          }
        } else {
          console.log('No data found.');
        }
      });
  })
}

function generate_SiteCS_file(filename, data) {
    var items_cs_data = { records : []};
    var tempObject = { attributes: {}};
    var data, newFileName;
    try {
      data.map((item, index) => {
        // if(index <= 800) {
          if(index != 0) {
              tempObject.attributes['type'] = 'strk__Site__c';
              tempObject.attributes['referenceId'] = `Site__cRef${index}`;
              tempObject['strk__Site_Name__c'] = item[0];
              tempObject['strk__Site_Type__c'] = item[1];
              tempObject['strk__Site_Subtype__c'] = item[2];
              tempObject['strk__Site_Status__c'] = item[3];
              tempObject['strk__Site_Description__c'] = item[4];
              tempObject['strk__Territory__c'] = item[5];
              tempObject['strk__Street_Address__c'] = item[6];
              tempObject['strk__City__c'] = item[7];
              tempObject['strk__Zip_Code__c'] = item[8];
              tempObject['strk__Country__c'] = item[9];
              tempObject['strk__Full_Address__c'] = item[10];
              tempObject['strk__Lat__c'] = item[11];
              tempObject['strk__Long__c'] = item[12];
              items_cs_data.records.push(tempObject);
              tempObject = { attributes: {}}
          }
          if(index != 0 && (index % 200 == 0 || index == data.length - 1)) {
            generateFile(items_cs_data, index, filename);
            items_cs_data.records = [];
          }
        // }
      });
    } catch {
      console.error(newFileName, 'failure');
    }
}

function generate_CandidateCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Candidate__c';
          tempObject.attributes['referenceId'] = `Candidate__cRef${index}`;
          tempObject['strk__Candidate_Name__c'] = item[0];
          tempObject['strk__Site__c'] = item[1];
          tempObject['strk__Street_Address__c'] = item[2];
          tempObject['strk__Street_Address_2__c'] = item[3];
          tempObject['strk__Site_Description__c'] = item[4];
          tempObject['strk__City__c'] = item[5];
          tempObject['strk__State__c'] = item[6];
          tempObject['strk__County__c'] = item[7];
          tempObject['strk__Zip_Code__c'] = item[8];
          tempObject['strk__Status__c'] = item[9];
          tempObject['strk__Lat__c'] = item[10];
          tempObject['strk__Long__c'] = item[11];
          tempObject['strk__Lease__c'] = item[12];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
    var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_SegmentCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Segment__c';
            tempObject.attributes['referenceId'] = `Segment__cRef${index}`;
            tempObject['strk_Segment_ID__c'] = item[0];
            tempObject['strk__Segment_Type__c'] = item[1];
            tempObject['strk__Segment_Status__c'] = item[2];
            tempObject['strk__Segment_Description__c'] = item[3];
            tempObject['strk__Segment_Description__c'] = item[4];
            tempObject['strk__A-Location__c'] = item[5];
            tempObject['strk__Z-Location__c'] = item[6];
            tempObject['strk__Segment_Path__c'] = item[7];
            tempObject['strk__Snap_To_Street__c'] = item[8];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
    });
    var data = JSON.stringify(items_cs_data);
    fs.writeFileSync(fileLocation + filename + '.json', data);
    console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_LeaseCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Lease__c';
            tempObject.attributes['referenceId'] = `Lease__cRef${index}`;
            tempObject['strk__Lease_Name__c'] = item[0];
            tempObject['strk__Lease_Number__c'] = item[1];
            tempObject['strk__Status__c'] = item[2];
            tempObject['strk__Version__c'] = item[3];
            tempObject['strk__Previous_Version__c'] = item[4];
            tempObject['strk__Site__c'] = item[5];
            tempObject['strk__Tenant__c'] = item[6];
            tempObject['strk__Landlord__c'] = item[7];
            tempObject['strk__Ownership_Type__c'] = item[8];
            tempObject['strk__Lease_Description__c'] = item[9];
            tempObject['strk__Lease_Type__c'] = item[10];
            tempObject['strk__Lease_Term__c'] = item[11];
            tempObject['strk__Commencement_Date__c'] = item[12];
            tempObject['strk__Commencement_Notes__c'] = item[13];
            tempObject['strk__End_Date__c'] = item[14];
            tempObject['strk__Days_Until_Lease_End__c'] = item[15];
            tempObject['strk__Amendment__c'] = item[16];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0 || index == data.length - 1)) {
          generateFile(items_cs_data, index, filename);
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_LeaseCriticalDateCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Lease_Critical_Date__c';
            tempObject.attributes['referenceId'] = `Lease_Critical_Date__cRef${index}`;
            tempObject['strk__Name__c'] = item[0];
            tempObject['strk__Lease__c'] = item[1];
            tempObject['strk__Type__c'] = item[2];
            tempObject['strk__Description__c'] = item[3];
            tempObject['strk__Critical_Date__c'] = item[4];
            tempObject['strk__Notice_Date__c'] = item[5];
            tempObject['strk__Internal_Process__c'] = item[6];
            tempObject['strk__Renewal_Length__c'] = item[7];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0)) {
          data = JSON.stringify(items_cs_data);
          var fileCount = (index / 200) > 1 ?  (index / 200) : '';
          newFileName = `${filename}${fileCount}.json`;
          fs.writeFileSync(fileLocation + newFileName, data);
          console.log(newFileName, ' is generated!');
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_LeasePaymentTermCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Lease_Payment_Term__c';
            tempObject.attributes['referenceId'] = `Lease_Payment_Term__cRef${index}`;
            tempObject['strk__Lease_Payment_Term_Name__c'] = item[0];
            tempObject['strk__Lease__c'] = item[1];
            tempObject['strk__Type__c'] = item[2];
            tempObject['strk__Accounting_Type__c'] = item[3];
            tempObject['strk__Amount__c'] = item[4];
            tempObject['strk__Escalator_Type__c'] = item[5];
            tempObject['strk__Escalation_Amount(%)__c'] = item[6];
            tempObject['strk__Escalation_Amount($)__c'] = item[7];
            tempObject['strk__Escalation_Frequency__c'] = item[8];
            tempObject['strk__Escalation_Interval__c'] = item[9];
            tempObject['strk__Escalation_Compound_Type__c'] = item[10];
            tempObject['strk__Date_To_Begin_Escalation__c'] = item[11];
            tempObject['strk__Custom_Escalation_Period__c'] = item[12];
            tempObject['strk__End_of_Month__c'] = item[13];
            tempObject['strk__Number_of_Payments__c'] = item[14];
            tempObject['strk__Payment_Frequency__c'] = item[15];
            tempObject['strk__Second_Payment_Date__c'] = item[16];
            tempObject['strk__Payment_Terms__c'] = item[17];
            tempObject['strk__Generate_Payments__c'] = item[18];
            tempObject['strk__First_Payment_Date__c'] = item[19];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0)) {
          data = JSON.stringify(items_cs_data);
          var fileCount = (index / 200) > 1 ?  (index / 200) : '';
          newFileName = `${filename}${fileCount}.json`;
          fs.writeFileSync(fileLocation + newFileName, data);
          console.log(newFileName, ' is generated!');
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_FormThemeCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Form_Theme__c';
          tempObject.attributes['referenceId'] = `Form_Theme__cRef${index}`;
          tempObject['strk__Form_Theme_Name__c'] = item[0];
          tempObject['strk__Header_Text__c'] = item[1];
          tempObject['strk__Footer_Text__c'] = item[2];
          tempObject['strk__Logo_Path__c'] = item[3];
          tempObject['strk__Align_Logo__c'] = item[4];
          tempObject['strk__Image_Align__c'] = item[5];
          tempObject['strk__Group_Images__c'] = item[6];
          tempObject['strk__Page_Numbering__c'] = item[7];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
    var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ChecklistTemplateCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Checklist_Template__c';
          tempObject.attributes['referenceId'] = `Form_Checklist_Template__cRef${index}`;
          tempObject['strk__Form_Templates_Name__c'] = item[0];
          tempObject['strk__Active__c'] = item[1];
          tempObject['strk__Form_Theme__c'] = item[2];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
      var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ChecklistItemTemplateCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Checklist_Item_Template__c';
            tempObject.attributes['referenceId'] = `Checklist_Item_Template__cRef${index}`;
            tempObject['strk__Form_Item_Template_Name__c'] = item[0];
            tempObject['strk__Form_Template__c'] = item[0];
            tempObject['strk__Order__c'] = item[1];
            tempObject['strk__Section__c'] = item[2];
            tempObject['strk__Subsection__c'] = item[3];
            tempObject['strk__Description__c'] = item[4];
            tempObject['strk__Response_Type__c'] = item[5];
            tempObject['strk__Render_Logic__c'] = item[6];
            tempObject['strk__Optional__c'] = item[7];
            tempObject['strk__Comment_Required__c'] = item[8];
            tempObject['strk__Photo_Required__c'] = item[9];
            tempObject['strk__Geofence_Photo_Upload__c'] = item[10];
            tempObject['strk__Tags_Applied_On_Upload__c'] = item[11];
            tempObject['strk__Label_Override__c'] = item[12];
            tempObject['strk__Filter_Criteria__c'] = item[13];
            tempObject['strk__Picklist_Values__c'] = item[14];
            tempObject['strk__Field_Reference__c'] = item[15];
            tempObject['strk__Child_Object__c'] = item[16];
            tempObject['strk__Child_Relationship_Path__c'] = item[17];
            tempObject['strk__Form_Relationship_Path__c'] = item[18];
            tempObject['strk__Display_Field_Set_Name__c'] = item[19];
            tempObject['strk__Show_Existing_Related_Records__c'] = item[20];
            tempObject['strk__Read_Only__c'] = item[21];
            tempObject['strk__Request_Signature_for_Children__c'] = item[22];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0 || index == data.length - 1)) {
          generateFile(items_cs_data, index, filename);
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ProjectPriceBook_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Project_Price_Book__c';
          tempObject.attributes['referenceId'] = `Project_Price_Book__cRef${index}`;
          tempObject['strk__Price_Book_Name__c'] = item[0];
          tempObject['strk__Active__c'] = item[1];
          tempObject['strk__Description__c'] = item[2];
          tempObject['strk__Project_Template__c'] = item[3];
          tempObject['strk__Pass_Through_Markup_%__c'] = item[4];
          tempObject['strk__Pass_Through_Markup_Cap__c'] = item[5];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
      var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_PricebookItem_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Pricebook_Item__c';
          tempObject.attributes['referenceId'] = `Pricebook_Item__cRef${index}`;
          tempObject['strk__Price_Book_Item__c'] = item[0];
          tempObject['strk__Project_Template__c'] = item[1];
          tempObject['strk__Activity_Template__c'] = item[2];
          tempObject['strk__Project_Price_Book__c'] = item[3];
          tempObject['strk__Work_Type__c'] = item[4];
          tempObject['strk__Description__c'] = item[5];
          tempObject['strk__Amount__c'] = item[6];
          tempObject['strk__Item_Type__c'] = item[7];
          tempObject['strk__Auto_Create__c'] = item[8];
          tempObject['strk__Auto_Create_Criteria__c'] = item[9];
          tempObject['strk__Auto_Create_Date__c'] = item[10];
          tempObject['strk__Tags_Applied_On_Upload__c'] = item[11];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
      var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_VendorPaymentTemplate_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Vendor_Payment_Template__c';
          tempObject.attributes['referenceId'] = `Vendor_Payment_Template__cRef${index}`;
          tempObject['strk__Expense_Name__c'] = item[0];
          tempObject['strk__Pricebook_Item__c'] = item[1];
          tempObject['strk__Description__c'] = item[2];
          tempObject['strk__Auto_Create__c'] = item[3];
          tempObject['strk__Auto_Create_Criteria__c'] = item[4];
          tempObject['strk__Auto_Create_Date__c'] = item[5];
          tempObject['strk__Default_Cost__c'] = item[6];
          tempObject['strk__Default_Vendor__c'] = item[7];
          tempObject['strk__Default_Vendor_Type__c'] = item[8];
          tempObject['strk__Vendor_Field_API__c'] = item[9];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
      var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ProjectMilestoneCS_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Project_Milestone__c';
            tempObject.attributes['referenceId'] = `Project_Milestone__cRef${index}`;
            tempObject['strk__Project_Milestone_Name__c'] = item[0];
            tempObject['strk__sObjectType__c'] = item[1];
            tempObject['strk__Forecast_Field_API_Name__c'] = item[2];
            tempObject['strk__Actual_Field_API_Name__c'] = item[3];
            tempObject['strk__Critical_Milestone__c'] = item[4];
            tempObject['strk__Project_Milestone_Key__c'] = item[5];
            tempObject['strk__Milestone_Owner__c'] = item[6];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0 || index == data.length - 1)) {
          generateFile(items_cs_data, index, filename);
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ProjectTemplate_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      if(index != 0) {
          tempObject.attributes['type'] = 'strk__Project_Template__c';
          tempObject.attributes['referenceId'] = `Project_Template__cRef${index}`;
          tempObject['strk__Project_Template_Name__c'] = item[0];
          tempObject['strk__Active__c'] = item[1];
          tempObject['strk__Sitetracker_Object__c'] = item[2];
          tempObject['strk__Project_Extension_Objects__c'] = item[3];
          tempObject['strk__Category__c'] = item[4];
          tempObject['strk__Complete_Status__c'] = item[5];
          tempObject['strk__Default_Price_Book__c'] = item[6];
          tempObject['strk__Manual_Forecast_Change_Behavior__c'] = item[7];
          tempObject['strk__Schedule_Optional_Column_APIs_CSV__c'] = item[8];
          tempObject['strk__Schedule_Optional_Column_Labels_CSV__c'] = item[9];
          tempObject['strk__Schedule_Show_Duration__c'] = item[10];
          tempObject['strk__Schedule_Show_WBS__c'] = item[11];
          tempObject['strk__Schedule_Use_Layouts__c'] = item[12];
          tempObject['strk__Allow_Updates_to_Rendered_Items_Only__c'] = item[13];
          tempObject['strk__Tags_Applied_On_Upload__c'] = item[14];
          tempObject['strk__Schedule_Icon_API__c'] = item[15];
          items_cs_data.records.push(tempObject);
          tempObject = { attributes: {}}
      }
    });
      var data = JSON.stringify(items_cs_data);
      fs.writeFileSync(fileLocation + filename + '.json', data);
      console.log(filename, ' is generated!');
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generate_ActivityTemplate_file(filename, data) {
  var items_cs_data = { records : []};
  var tempObject = { attributes: {}};
  var data, newFileName;
  try {
    data.map((item, index) => {
      // if(index <= 800) {
        if(index != 0) {
            tempObject.attributes['type'] = 'strk__Activity_Template__c';
            tempObject.attributes['referenceId'] = `Activity_Template__cRef${index}`;
            tempObject['strk__Activity_Name__c'] = item[0];
            tempObject['strk__Project_Template__c'] = item[1];
            tempObject['strk__Project_Milestone__c'] = item[2];
            tempObject['strk__Field_Name__c'] = item[3];
            tempObject['strk__Schedule_Width__c'] = item[4];
            tempObject['strk__Order__c'] = item[5];
            tempObject['strk__WBS_Code__c'] = item[6];
            tempObject['strk__Activity_Type__c'] = item[7];
            tempObject['strk__Sub-Milestone__c'] = item[8];
            tempObject['strk__Activity_Category__c'] = item[9];
            tempObject['strk__Activity_Section__c'] = item[10];
            tempObject['strk__Description__c'] = item[11];
            tempObject['strk__Activity_Owner_(Field)__c'] = item[12];
            tempObject['strk__Activity_Owner_(Role)__c'] = item[13];
            tempObject['strk__Rendered_Logic__c'] = item[14];
            tempObject['strk__Project_Status__c'] = item[15];
            tempObject['strk__Enable_Scheduling__c'] = item[16];
            tempObject['strk__Predecessor_Type__c'] = item[17];
            tempObject['strk__Predecessor__c'] = item[18];
            tempObject['strk__Duration__c'] = item[19];
            tempObject['strk__Days_Type__c'] = item[20];
            tempObject['strk__Custom_Scheduling_Apex_Class__c'] = item[21];
            tempObject['strk__Schedule_Using_Predecessor_Forecast_Date__c'] = item[22];
            tempObject['strk__Require_Completed_Form_to_Actualize__c'] = item[23];
            tempObject['strk__Actualize_on_Form_Completion__c'] = item[24];
            tempObject['strk__Form_Template__c'] = item[25];
            tempObject['strk__Form_Page__c'] = item[26];
            tempObject['strk__Form_Type__c'] = item[27];
            tempObject['strk__Job_Template__c'] = item[28];
            tempObject['strk__Require_Job_Completion_to_Actualize__c'] = item[29];
            tempObject['strk__Requires_Approval__c'] = item[30];
            tempObject['strk__Actualize_on_Document_Upload__c'] = item[31];
            tempObject['strk__Actualize_on_Job_Completion__c'] = item[32];
            tempObject['strk__Activity_Template_Key__c'] = item[33];
            tempObject['strk__Auto_Submit_for_Approval__c'] = item[34];
            tempObject['strk__Cost_Category__c'] = item[35];
            tempObject['strk__Amount__c'] = item[36];
            tempObject['strk__Document_Uploads__c'] = item[37];
            tempObject['strk__Tags_Applied_On_Upload__c'] = item[38];
            tempObject['strk__Financial_Activity__c'] = item[39];
            tempObject['strk__Hide_Forecast__c'] = item[40];
            tempObject['strk__Milestone_Object_Type__c'] = item[41];
            tempObject['strk__Optional_Activity__c'] = item[42];
            tempObject['strk__Page_Layout__c'] = item[43];
            tempObject['strk__Propagate_Name_Changes__c'] = item[44];
            tempObject['strk__Schedule_Activity_Color__c'] = item[45];
            tempObject['strk__Email_on_Activity_Start__c'] = item[46];
            items_cs_data.records.push(tempObject);
            tempObject = { attributes: {}}
        }
        // Generate a new file for every 200 records
        if(index != 0 && (index % 200 == 0 || index == data.length - 1)) {
          generateFile(items_cs_data, index, filename);
          items_cs_data.records = [];
        }
      // }
    });
  } catch {
    console.error(newFileName, 'failure');
  }
}

function generateFile(items_cs_data, index, filename) {
  var batchData = JSON.stringify(items_cs_data);
  var fileCount = (index / 200) > 1 ?  Math.floor(index / 200) : '';
  newFileName = `${filename}${fileCount}.json`;
  fs.writeFileSync(fileLocation + newFileName, batchData);
  console.log(newFileName, ' is generated!');
}

function getArgs () {
  const args = {};
  process.argv
      .slice(2, process.argv.length)
      .forEach( arg => {
      // long arg
      if (arg.slice(0,2) === '--') {
          const longArg = arg.split('=');
          const longArgFlag = longArg[0].slice(2,longArg[0].length);
          const longArgValue = longArg.length > 1 ? longArg[1] : true;
          args[longArgFlag] = longArgValue;
      }
      // flags
      else if (arg[0] === '-') {
          const flags = arg.slice(1,arg.length).split('');
          flags.forEach(flag => {
          args[flag] = true;
          });
      }
  });
  return args;
}
const args = getArgs();