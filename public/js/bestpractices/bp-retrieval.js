// ########################
// Retrieves best practices from the repository
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// Data array that populates the datatable
var data = [];

// keyArray included the keys in best practice documents
var keyArray = [];
var keyArrayWithNum = [];
var indexArr = [];
var docIDs = [];

// Variables storing the indices related to title, description, date and categories
var title;
var description;
var date;
var categories;
// The original key name for categories, e.g. "5categories"
var catKeyName;

// Array of all categories
var catArray = [];

// Function for filtering out duplicate array values
const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};


// ############################################


// Call the dataTables jQuery plugin
// Necessary for correctly displaying data in the table
$(document).ready(function() {

  // First initialization of datatable before BPs are retrieved from database
  $('#dataTable').DataTable();
  initTable();

});


// First initialization of table when document is ready loading
function initTable() {

  // Clean slate of data every time this function is called
  data = [];
  indexArr = [];
  keyArray = [];

  // extractJSON instantiates the collection paths
  extractJSON(jsontest, 0, '');
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');

  //Getting all best practice documents
  db.collection(`${bpPath}`)
    // This where clause makes sure we only get best practices that are created by users
    .where("created", "==", "true")
      .get().then((snapshot) => {
          
          // Use getDocData to instantiate the docdata information
          // Callback function after getDocData
          getDocData(function() { 

            // Only populate the category selection box once - when it's empty
            if(document.querySelector('#category-select').childElementCount == 1){
              populateCat();
            }

            // DataTable needs to be destroyed before reinitializing
            $('#dataTable').DataTable().destroy();
            $('#dataTable').DataTable( {
              data: data,
              // createdRow is a function that adds data to the rows created
              "createdRow": function( row, data, dataIndex ) {
                // docIDs stores the document id's of the retrieved best practices
                for(i = 0; i < docIDs.length; i++){
                  // dataIndex is the internal index of the rows in the dataTable > can therefore be linked to index in docIDs 
                  if(dataIndex == i){
                    $(row).attr( 'doc-id', `${docIDs[i]}` )
                    .attr('onClick', 'tableClick(event)')
                    .addClass('bp-row');
                  }
                }
              }
            } );

          });

      });

}

// Delay function specifies how long to wait on an async function
function delay() {
  return new Promise(resolve => setTimeout(resolve, 800));
}


// This function get the document info from all best practice documents
async function getDocData(callback) {
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');
  //Getting all best practice documents
  db.collection(`${bpPath}`)
    .where("created", "==", "true")
      .get().then((snapshot) => {
          snapshot.docs.forEach(doc => {

            // Emptying both arrays so that they don't increment for each doc in the snapshot
            keyArray = [];
            indexArr = [];

            docIDs.push(doc.id);

            // Pushing key names (without numerics) to keyArray
            // We want to display title, description and date > using this array, we can find the index of those keys in the documents
            for (let key in doc.data()) {
              keyArray.push(JSON.stringify(key).replace(/[ˆ0-9]+/g, ''));
              keyArrayWithNum.push(key);
            }

            for(let x=0; x<keyArray.length; x++){
              // The index of the title, description and date keys is pushed to indexArr
              // Using splice ensures that title is pushed to index 0, description to index 1, etc
              if(keyArray[x] == '"title"'){
                indexArr.splice(0, 0, x);
              }
              else if(keyArray[x] == '"description"'){
                indexArr.splice(1, 0, x);
              }
              else if(keyArray[x] == '"date"'){
                indexArr.splice(2, 0, x);
              }
              else if(keyArray[x] == '"categories"'){
                indexArr.splice(3, 0, x);
                catKeyName = keyArrayWithNum[x];
              }
            }

            // indexArr at index 0 stores the index of the title key in the original keyArr
            title = indexArr[0];
            description = indexArr[1];
            date = indexArr[2];
            categories = indexArr[3];

            // Getting the title, description and date for the documents
            let docdata = [`${doc.data()[Object.keys(doc.data())[title]]}`, `${doc.data()[Object.keys(doc.data())[description]]}`, `${doc.data()[Object.keys(doc.data())[date]]}`];

            // Pushing docdata to data array to populate the table
            data.push(docdata);

            // Populating the category array
            doc.data()[Object.keys(doc.data())[categories]].forEach(element => {
              catArray.push(element);
            });

          });
      });

  await delay();
  callback();
}


// Populating the category selection box
function populateCat() {

  const categorySelect = document.querySelector('#category-select');
  const uniqueCat = catArray.filter(unique);

  // Iterating over the categories of retrieved BPs
  uniqueCat.forEach(categoryElement => {

    let category = document.createElement('option');
    category.setAttribute('value', categoryElement);
    category.textContent = categoryElement;

    categorySelect.appendChild(category);

  });

}


// When a category is selected
$("#category-select").change(function() {

  const selectedCat = document.getElementById("category-select").value;

  if(selectedCat == ''){
    initTable();
  }
  else{
    let bpPath = findPath(collectionPaths, 'bestpractices');
    db.collection(`${bpPath}`)
        .where(catKeyName, "array-contains", `${selectedCat}`)
        .get().then((snapshot) => {

            //Empty the data array
            data = [];
            snapshot.docs.forEach(doc => {

                // Pushing data to docdata array to populate the table
                let docdata = [`${doc.data()[Object.keys(doc.data())[title]]}`, `${doc.data()[Object.keys(doc.data())[description]]}`, `${doc.data()[Object.keys(doc.data())[date]]}`];
                data.push(docdata);

            });

            // DataTable needs to be destroyed before reinitializing
            $('#dataTable').DataTable().destroy();

            $('#dataTable').DataTable( {
              data: data,
            } );
            

        });
  }
  catArray = [];

});