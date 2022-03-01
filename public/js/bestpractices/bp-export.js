// ########################
// Retrieves best practices from the repository
// ########################

// Create firestore (database) object
var db = firebase.firestore();


// Call the dataTables jQuery plugin
// Necessary for correctly displaying data in the table
$(document).ready(function () {
  Collectdata();
});


// First initialization of table when document is ready loading
function Collectdata() {

  // extractJSON instantiates the collection paths
  extractJSON(jsontest, 0, '');
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');

  //Getting all best practice documents
  db.collection(`${bpPath}`)
    // This where clause makes sure we only get best practices that are created by users
    .where("created", "==", "true")
    .get().then((snapshot) => {



// This function get the document info from all best practice documents
async function getDocData(callback) {
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');
  //Getting all best practice documents
  db.collection(`${bpPath}`)
    .where("created", "==", "true")
    .get().then((snapshot) => {
      snapshot.docs.forEach(doc => {
        keyArray = [];
        indexArr = [];

        alreadyeffortFrame = false;
        alreadytimeframe = false;

        docIDs.push(doc.id);
        // Pushing key names (without numerics) to keyArray
        // We want to display title, description and date > using this array, we can find the index of those keys in the documents
        for (let key in doc.data()) {
          keyArray.push(JSON.stringify(key).replace(/[ˆ0-9]+/g, ''));
          keyArrayWithNum.push(key);
          normalkey = JSON.stringify(key).replace(/[ˆ0-9]+/g, '');
          normalkey = normalkey.replace(/['"]+/g, '');

          snapshot.docs.forEach(doc => {
            datatype.push(doc.data()[key]);
          });


          var label = document.createElement("label");
          if (datatype.length > 0) {
            datatype = datatype.filter(unique);
            datatype.forEach(attribute => {
              if (!(attribute === undefined || attribute == "")) {

                let normalkeys = ["categories", "title", "description", "author", "created", "lessonslearned", "problems", "effort", "timeframe", "date"]
                if (!(normalkeys.includes(normalkey))) {

                  var description = document.createTextNode("  " + attribute + "   ");
                  var checkbox = document.createElement("input");

                  checkbox.type = "checkbox";  // make the element a checkbox
                  checkbox.name = "slct[]";    // give it a name we can check on the server side
                  checkbox.value = attribute;   // make its value "pair"
                  checkbox.style.padding = "20px";
                  checkbox.style.backgroundColor = "red";
                  checkbox.style.left = "20px";
                  checkbox.style.bottom = "20px";
                  checkbox.style.width = "20px";
                  checkbox.style.height = "20px";
                  checkbox.style.border = "solid white";
                  checkbox.style.borderWidth = "20px";
                  label.style.padding = "5px";

                  label.appendChild(checkbox);   // add the box to the element
                  label.appendChild(description);// add the description to the element


                  // add the label element to your div
                }
              }

            });
            if (!(normalkey == "categories" || normalkey == "date" || normalkey == "title" || normalkey == "description" || normalkey == "author" || normalkey == "created" || normalkey == "lessonslearned" || normalkey == "problems")) {
              var div = document.createElement('div');
              div.id = 'container';
              div.innerHTML = normalkey;
              div.style.fontFamily = "Arial, Helvetica, sans-serif";
              div.style.fontSize = "20px";
              div.style.fontWeight = "bold";
            }
          }
          datatype = [];
        }

        for (let x = 0; x < keyArray.length; x++) {
          // The index of the title, description and date keys is pushed to indexArr
          // Using splice ensures that title is pushed to index 0, description to index 4, etc
          //Keep in mind that this order should resemble the models numerical order.
          if (keyArray[x] == '"title"') {
            indexArr.splice(0, 0, x);
          }

          else if (keyArray[x] == '"theme"') {
            indexArr.splice(1, 0, x);
          }

          else if (keyArray[x] == '"sustainability dimension"') {
            indexArr.splice(2, 0, x);
          }

          else if (keyArray[x] == '"date"') {
            indexArr.splice(3, 0, x);
          }
          else if (keyArray[x] == '"effort"') {
            indexArr.splice(4, 0, x);
          }
          else if (keyArray[x] == '"timeframe"') {
            indexArr.splice(5, 0, x);
          }
          else if (keyArray[x] == '"audience"') {
            indexArr.splice(6, 0, x);
          }
          else if (keyArray[x] == '"quote"') {
            indexArr.splice(7, 0, x);
          }

          else if (keyArray[x] == '"description"') {
            indexArr.splice(8, 0, x);
          }
          else if (keyArray[x] == '"treatment"') {
            indexArr.splice(9, 0, x);
          }
          else if (keyArray[x] == '"takeaway"') {
            indexArr.splice(10, 0, x);
          }

        }

        // indexArr at index 0 stores the index of the title key in the original keyArr
        // the order below determines the column order of the table
        title = indexArr[0];
        date = indexArr[3];
        theme = indexArr[1];
        dimension = indexArr[2];
        audience = indexArr[6];
        effort = indexArr[4];
        timeframe = indexArr[5];
        quote = indexArr[7];
        description = indexArr[8]; //this indexArr is also used in bp-viewing.js so be sure to update it there when it changes here
        treatment = indexArr[9];
        takeaway = indexArr[10];


        //ORDERING OF THE TABLE COLUMNS
        // Getting the title, description and date for the documents
        let docdata = [
          `${doc.data()[Object.keys(doc.data())[title]]}`,
          `${doc.data()[Object.keys(doc.data())[date]]}`,
          `${doc.data()[Object.keys(doc.data())[theme]]}`,
          `${doc.data()[Object.keys(doc.data())[dimension]]}`,
          `${doc.data()[Object.keys(doc.data())[audience]]}`,
          `${doc.data()[Object.keys(doc.data())[timeframe]]}`,
          `${doc.data()[Object.keys(doc.data())[effort]]}`,
          `${doc.data()[Object.keys(doc.data())[quote]]}`,
          `${doc.data()[Object.keys(doc.data())[description]].substring(0, 150) + '.....'}`,
          `${doc.data()[Object.keys(doc.data())[treatment]].substring(0, 150) + '.....'}`,
          `${doc.data()[Object.keys(doc.data())[takeaway]].substring(0, 150) + '.....'}`
        ];

        // Pushing docdata to data array to populate the table
        data.push(docdata);


        for (let key in doc.data())
          // Populating the category array           
          if (key.replace(/[ˆ0-9]+/g, '') == "categories") {
            snapshot.docs.forEach(doc => {
              catArray.push(doc.data()[key]);
            });
          }
      });
    });


  await delay();
  callback();
}







