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

const unique = (value, index, self) => {
  return self.indexOf(value) === index;
};

// Call the dataTables jQuery plugin
// Necessary for correctly displaying data in the table
$(document).ready(function () {
  //wait for domainjson to be found
  waitFordomainjson_retrieval()
});

//the below function guards the functions from firing premature.
//this could better be done using async and await but unfortunately this didnt seem to work.
function waitFordomainjson_retrieval(){
  //if domain is already loaded:
  if(typeof domainjson !== "undefined"){
       // First initialization of datatable before BPs are retrieved from database
      $('#dataTable').DataTable();
      initTable();    
  }
   //else wait and try again:
  else{
      setTimeout(waitFordomainjson_retrieval, 250);
  }
}


// First initialization of table when document is ready loading
async function initTable() {

  // Clean slate of data every time this function is called
  data = [];
  indexArr = [];
  keyArray = [];
  docIDs = [];

  // extractJSON instantiates the collection paths
  extractJSON(domainjson, 0, '');
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');

  //Getting all best practice documents
  db.collection(`${bpPath}`)
    // This where clause makes sure we only get best practices that are created by users
    .where("created", "==", "true")
    .get().then((snapshot) => {

      // Use getDocData to instantiate the docdata information
      // Callback function after getDocData
      getDocData(function () {
        // Only populate the category selection box once - when it's empty
        // DataTable needs to be destroyed before reinitializing
        $('#dataTable').DataTable().destroy();
        // copy header, needed for custom filters to append to 2nd row
        // $('#dataTable thead tr')
        //   .clone(true)
        //   .addClass('filters_')
        //   .appendTo('#dataTable thead');

        var table = $('#dataTable').DataTable({
          data: data,
          //responsive: true,
          orderCellsTop: true,
          fixedHeader: true,

          // createdRow is a function that adds data to the rows created
          "createdRow": function (row, data, dataIndex) {
            // docIDs stores the document id's of the retrieved best practices
            for (i = 0; i < docIDs.length; i++) {
              // dataIndex is the internal index of the rows in the dataTable > can therefore be linked to index in docIDs 
              if (dataIndex == i) {
                $(row).attr('doc-id', `${docIDs[i]}`)
                  .attr('onClick', 'tableClick(event)')
                  .addClass('bp-row');
              }
            }
          },


          initComplete: function (table) {
            var api = this.api();
            this.api().columns().every(function () {
              let column = this;
              let columnname = column.header().textContent
              let initiallyinvisible = ['Audience', 'Effort', 'Timeframe', 'Quote'];
              let alwaysinvisible = ['Image', 'Author']

              if (initiallyinvisible.includes(columnname) || alwaysinvisible.includes(columnname)) {
                column.visible(false, true);
              }
            }
            )
          },


          

          //
          //Custom filter assignment
          //
          // initComplete: function (table) {
          //   var api = this.api();

          //   this.api().columns().every(function () {
          //     let column = this;
          //     let columnname = column.header().textContent
          //     //categorize the column types, this is used for determining fitting filter options
          //     let categorical = ['Category','Problem'];
          //     let numerical   = [];
          //     let textual     = ['Name', 'Description'];
          //     let date        = ['Date'];
          //     if (categorical.includes(columnname)) {
          //       let cell = $('.filters_ th').eq(
          //         $(api.column(column[0]).header()).index()
          //       );
          //       let select = $('<select><option value=""></option></select>')
          //       $(cell).html(select);
          //       select
          //         .on('change', function () {
          //           var val = $.fn.dataTable.util.escapeRegex(
          //             $(this).val()
          //           );
          //           column.search(val ? '^' + val + '$' : '', true, false).draw();
          //         });
          //       column.data().unique().sort().each(function (d, j) {
          //         select.append('<option value="' + d + '">' + d + '</option>')
          //       });
          //     }
          //     else if (textual.includes(columnname)) {
          //       // Set the header cell to contain the input element
          //       let cell = $('.filters_ th').eq(
          //         $(api.column(column[0]).header()).index()
          //       );
          //       let title = $(cell).text();
          //       $(cell).html('<input type="text" placeholder="' + title + '" />');
          //       // On every keypress in this input
          //       $(
          //         'input',
          //         $('.filters_ th').eq($(api.column(column[0]).header()).index())
          //       )
          //         .off('keyup change')
          //         .on('keyup change', function (e) {
          //           e.stopPropagation();
          //           // Get the search value
          //           $(this).attr('title', $(this).val());
          //           var regexr = '({search})'; //$(this).parents('th').find('select').val();
          //           var cursorPosition = this.selectionStart;
          //           // Search the column for that value
          //           api
          //             .column(column[0])
          //             .search(
          //               this.value != ''
          //                 ? regexr.replace('{search}', '(((' + this.value + ')))')
          //                 : '',
          //               this.value != '',
          //               this.value == ''
          //             )
          //             .draw();
          //           $(this)
          //             .focus()[0]
          //             .setSelectionRange(cursorPosition, cursorPosition);
          //         });
          //     }
          //     else if (date.includes(columnname)) {
          //       // Set the header cell to contain the input element
          //       let cell = $('.filters_ th').eq(
          //         $(api.column(column[0]).header()).index()
          //       );
          //       var minDate, maxDate;

          //       // Custom filtering function which will search data in column one between two values
          //       $.fn.dataTable.ext.search.push(
          //           function( settings, data, dataIndex ) {
          //               var min = minDate.val();
          //               var max = maxDate.val();
          //               var date = new Date(data[1]);
          //               if (
          //                   ( min === null && max === null ) ||
          //                   ( min === null && date <= max ) ||
          //                   ( min <= date   && max === null ) ||
          //                   ( min <= date   && date <= max )
          //               ) {
          //                   return true;
          //               }
          //               return false;
          //           }
          //       );
          //       $(document).ready(function() { 
          //          // Create date inputs
          //          $(cell).html(' <label for="min">From:</label> <input type="date" id="min" name="min"> <label for="max">To:</label> <input type="date" id="max" name="max">');

          //           minDate = new DateTime($('#min'), {
          //               format: 'YYYY-MM-DD'
          //           });

          //           maxDate = new DateTime($('#max'), {
          //               format: 'YYYY-MM-DD'
          //           });
          //          // $(cell).html(maxDate)
          //           // Refilter the table
          //           $('#min, #max').on('change', function () {
          //               api.draw();
          //           });
          //       });
          //     }
          //   });
          // },

          //advanced filters
         //dom: 'QlfrtiBp',
          // columnDefs: [{
          //     searchBuilderTitle: 'date',
          //     targets: [1]
          // }],

          // with export buttons
          // dom: '<"top"Qlfrti<"clear">>rt<"bottom"Bp<"clear">>',
          // buttons: [
          //   'copy', 'excel', 'pdf'
          // ]
          // without export buttons
          dom: '<"top"Qlfrti<"clear">>rt<"bottom"Bp<"clear">>'
        })

        $('a.toggle-vis').on('click', function (e) {
          e.preventDefault();
          // Get the column API object
          var column = table.column($(this).attr('data-column'));
          // Toggle the visibility
          column.visible(!column.visible());
        });
      });
    });

}

// This function get the document info from all best practice documents
async function getDocData(callback) {
  // bpPath is the collection path to the bestpractices sub-collection
  let bpPath = findPath(collectionPaths, 'bestpractices');
  //Getting all best practice documents
  await db.collection(`${bpPath}`)
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

          else if (keyArray[x] == '"university"') {
            indexArr.splice(1, 0, x);
          }

          else if (keyArray[x] == '"date"') {
            indexArr.splice(2, 0, x);
          }
          else if (keyArray[x] == '"introduction"') {
            indexArr.splice(3, 0, x);
          }
          else if (keyArray[x] == '"process"') {
            indexArr.splice(4, 0, x);
          }
          else if (keyArray[x] == '"outcome"') {
            indexArr.splice(5, 0, x);
          }
          else if (keyArray[x] == '"conclusion"') {
            indexArr.splice(6, 0, x);
          }

          else if (keyArray[x] == '"learnmore"') {
            indexArr.splice(7, 0, x);
          }
        }

        // indexArr at index 0 stores the index of the title key in the original keyArr
        // the order below determines the column order of the table



        title = indexArr[0];
        date = indexArr[2];
        university = indexArr[1];
        introduction = indexArr[3];
        proces = indexArr[4];
        outcome = indexArr[5];
        conclusion = indexArr[6];
        //description = indexArr[8]; //this indexArr is also used in bp-viewing.js so be sure to update it there when it changes here

        //ORDERING OF THE TABLE COLUMNS
        // Getting the title, description and date for the documents
        let docdata = [
          `${doc.data()[Object.keys(doc.data())[title]]}`,
          `${doc.data()[Object.keys(doc.data())[date]]}`,
          `${doc.data()[Object.keys(doc.data())[university]]}`,
          `${doc.data()[Object.keys(doc.data())[introduction]].substring(0, 150) + '.....'}`,
          `${doc.data()[Object.keys(doc.data())[proces]].substring(0, 150) + '.....'}`,
          `${doc.data()[Object.keys(doc.data())[outcome]].substring(0, 150) + '.....'}`,
          `${doc.data()[Object.keys(doc.data())[conclusion]].substring(0, 150) + '.....'}`
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
  callback();
}



$("#some_div").on("click", ".checkboxes", function () {
  var value = $(this).attr("value");
  alert(value);
});


function apply() {
  datatype = [];
}

function setValue(key) {
  // bpPath is the collection path to the bestpractices sub-collection
  if (datatype.length < 1) {
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

  if (!(datatype === undefined)) {
    datatype.forEach(attribute => {
      if (!(attribute === undefined || attribute == "")) {

        var label = document.createElement("label");
        var description = document.createTextNode("  " + attribute + "   ");
        var checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.name = "slct" + attribute;
        checkbox.value = attribute;
        checkbox.style.padding = "20px";
        checkbox.style.left = "20px";
        checkbox.style.bottom = "20px";
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

