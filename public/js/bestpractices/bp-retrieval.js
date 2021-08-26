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
var datatype = [];

// Temporary variables to use for creating sliders, based on existing values. Should be removed in the full system.
var alreadytimeframe;
var alreadyeffortFrame;

// Get the modal
var modalfilter = document.getElementById("FilterModal");

// Get the button that opens the modal
var btnfilter = document.getElementById("FilterBtn");

// Get the <span> element that closes the modal
var spanfilter = document.getElementsByClassName("closefilter")[0];


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
  docIDs = [];

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
            keyArray = [];
            indexArr = [];

            alreadyeffortFrame = false;
            alreadytimeframe = false;

            docIDs.push(doc.id);
            var selection = document.getElementById("filterbtns");
            selection.innerHTML = "";
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
              if(datatype.length > 0){
                datatype = datatype.filter(unique);
                datatype.forEach(attribute => {   
                  if(!(attribute === undefined || attribute == "" )){
                    
                    if(!(normalkey == "categories" || normalkey == "title" || normalkey == "description" || normalkey == "author" || normalkey == "created" || normalkey == "lessonslearned" || normalkey == "problems" || normalkey == "effort" || normalkey == "timeframe" || normalkey == "date")){
                      
                    var description = document.createTextNode("  " + attribute + "   ");
                    var checkbox = document.createElement("input");
                    
      
                    checkbox.type = "checkbox";    // make the element a checkbox
                    checkbox.name = "slct[]";      // give it a name we can check on the server side
                    checkbox.value = attribute;         // make its value "pair"
                    checkbox.style.padding = "20px";
                    checkbox.style.backgroundColor = "red";
      
                    
                    checkbox.style.left =  "20px";
                    checkbox.style.bottom=  "20px";
                    checkbox.style.width = "20px";
                    checkbox.style.height = "20px";
                    checkbox.style.border = "solid white";
                    checkbox.style.borderWidth = "20px";
                    label.style.padding = "5px";
                    
                    
                    
      
                    label.appendChild(checkbox);   // add the box to the element
                    label.appendChild(description);// add the description to the element
                    //label.title = "test";
      
                    // add the label element to your div
                    }
                    if(normalkey == "effort"){
                      if(alreadyeffortFrame) return;

                    
                    var slider = document.createElement("input");
                    slider.type = "range";
                    slider.max = "10";
                    slider.min = "1";
                    label.appendChild(slider);   // add the box to the element
                    alreadyeffortFrame = true;
                    
                      
                    }
                    if(normalkey == "timeframe"){
                      if(alreadytimeframe) return;
                    var slider = document.createElement("input");
                    slider.type = "range";
                    slider.max = "10";
                    slider.min = "1";
                    label.appendChild(slider);   // add the box to the element
                                   
                    alreadytimeframe = true;
                    }
                  }
                  // if(normalkey == "timeframe"){
                  //   alreadytimeframe = true;
                  //   console.log("c");
                  // }
                  });
                  if(!(normalkey == "categories" || normalkey == "date" || normalkey == "title" || normalkey == "description" || normalkey == "author" || normalkey == "created" || normalkey == "lessonslearned" || normalkey == "problems" )){   
                  var div = document.createElement('div');
                  div.id = 'container';
                  div.innerHTML = normalkey;
                  //div.className = 'border pad';
                  div.style.fontFamily =    "Arial, Helvetica, sans-serif";
                  div.style.fontSize =  "20px";
                  div.style.fontWeight =    "bold";
                  
                  selection.appendChild(div);
                  selection.appendChild(label); 

                  
                  
                  }
                  
                
                    
              }
            
              datatype = [];
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
            snapshot.docs.forEach(doc => {   
              
              catArray.push(doc.data()["6categories"]);;
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

    if(!(categoryElement === undefined || categoryElement == "")){

      var label = document.createElement("label");
      var description = document.createTextNode("  " + categoryElement + "   ");
      var checkbox = document.createElement("input");
      
      // Creates the checkboxes for categories in the filter modal
      checkbox.type = "checkbox";    
      checkbox.name = "slct" + categoryElement;      
      checkbox.value = categoryElement;         
      checkbox.style.padding = "20px";
      checkbox.style.left =  "20px";
      checkbox.style.bottom=  "20px";
      checkbox.style.width = "20px";
      checkbox.style.height = "20px";
      checkbox.style.border = "solid white";
      checkbox.style.borderWidth = "20px";
      label.style.padding = "5px";

      label.appendChild(checkbox);   // add the box to the element
      label.appendChild(description);// add the description to the element
  
      // add the label element to your div
      document.getElementById('some_div').appendChild(label);
      
      }


    let category = document.createElement('option');
    category.setAttribute('value', categoryElement);
    category.textContent = categoryElement;

    categorySelect.appendChild(category);

  });

}

$("#some_div").on("click", ".checkboxes", function () {
  var value=$(this).attr("value");
  alert(value);
});

// When a category is selected
$("#category-select").change(function() {

  docIDs = [];
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
                docIDs.push(doc.id);
            });

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
  }
  catArray = [];
});

btnfilter.onclick = function() {
  modalfilter.style.display = "block";
}

  function apply(){
    datatype = [];
  }

  function setValue(key){
    // bpPath is the collection path to the bestpractices sub-collection
    if(datatype.length < 1){
    let bpPath = findPath(collectionPaths, 'bestpractices');
    //Getting all best practice documents
    db.collection(`${bpPath}`)
    .where("created", "==", "true")
        .get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
              datatype.push(doc.data()[key]);                       
          });
        });
      } 

        var selectsection = document.getElementById("selectionsection");
        datatype = datatype.filter(unique);
        document.getElementById("selectionsection").innerHTML = "";
  
        if(!(datatype === undefined)){
            datatype.forEach(attribute => {
              if(!(attribute === undefined || attribute == "")){
              
                var label = document.createElement("label");
                var description = document.createTextNode("  " + attribute + "   ");
                var checkbox = document.createElement("input");
                
                checkbox.type = "checkbox";   
                checkbox.name = "slct" + attribute;    
                checkbox.value = attribute;   
                checkbox.style.padding = "20px";
                checkbox.style.left =  "20px";
                checkbox.style.bottom=  "20px";
                checkbox.style.width = "20px";
                checkbox.style.height = "20px";
                checkbox.style.border = "solid white";
                checkbox.style.borderWidth = "20px";
                label.style.padding = "5px";
                
                label.appendChild(checkbox);    // add the box to the element
                label.appendChild(description); // add the description to the element
             
                selectsection.appendChild(label); 
            }
          }
        )
      }
    }

  spanfilter.onclick = function() {
    modalfilter.style.display = "none";
  }