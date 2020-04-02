// ########################
// Retrieves best practices from the repository
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// Data array that populates the datatable
var data = [];

// Array of all categories
var catArray = [];

// Function for filtering out duplicate array values
const unique = (value, index, self) => {
  return self.indexOf(value) === index
}


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

  data = [];

  //Getting all best practices that have the Workers category
  db.collection("sustainability/sustainability-state/bestpractices")
      //.where("categories", "array-contains", "Refugee")
      .get().then((snapshot) => {
          snapshot.docs.forEach(doc => {
              // Pushing data to docdata array to populate the table
              let docdata = [`${doc.data().title}`, `${doc.data().description}`, `${doc.data().date}`];
              data.push(docdata);

              // Populating the category array
              doc.data().categories.forEach(element => {
                catArray.push(element);
              });

          })

          // Only populate the category selection box once - when it's empty
          if(document.querySelector('#category-select').childElementCount == 1){
            populateCat();
          }

          // DataTable needs to be destroyed before reinitializing
          $('#dataTable').DataTable().destroy();
          $('#dataTable').DataTable( {
            data: data,
          } );
          

      })

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
  
    //Getting all best practices that have the Workers category
    db.collection("sustainability/sustainability-state/bestpractices")
        .where("categories", "array-contains", `${selectedCat}`)
        .get().then((snapshot) => {
            //Empty the data array
            data = [];
            snapshot.docs.forEach(doc => {

                // Pushing data to docdata array to populate the table
                let docdata = [`${doc.data().title}`, `${doc.data().description}`, `${doc.data().date}`];
                data.push(docdata);

            })

            // DataTable needs to be destroyed before reinitializing
            $('#dataTable').DataTable().destroy();

            $('#dataTable').DataTable( {
              data: data,
            } );
            

        })
  }
  catArray = [];

});