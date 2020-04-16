// ########################
// Creates a modal for entering BPs and stores them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// The form to enter new BP information
const BPform = document.querySelector('#bp-entry-form');


// ############################################


var modal = document.getElementsByClassName("bp-modal")[0];
var btn = document.getElementById("create-BP-btn");
// span elements closes the modal
var span = document.getElementsByClassName("close")[0];

// displaying the modal
btn.onclick = function() {
  modal.style.display = "block";
}


// This function has a callback
// First, the JSON string is altered with a unique documentid
document.getElementById("create-BP-btn").addEventListener("click", function(){

    // Assigning a unique id
    let uniqueDocID = ('_' + Math.random().toString(36).substr(2, 9));
    span.setAttribute('id', uniqueDocID);

    alterJSON(uniqueDocID, function(aJSON){

        // Once the JSON string has been altered, fire this callback

        // Emptying these arrays prevents information from the initial JSON model to be present
        fieldsArr = [];
        collectionPaths = [];
        documentPaths = [];
        // Calling these function instantiates the correct path for each newly created document
        extractJSON(JSON.parse(aJSON), 0, '');
        extractFields();

        collectionPaths.forEach(coll => {
            // Getting all docs for which features should be displayed
            db.collection(coll)
            .where(firebase.firestore.FieldPath.documentId(), "==", uniqueDocID.toString())
            // And where the document id matches the current docid
            .get().then((snapshot) => {
                snapshot.docs.forEach(doc => {

                    // Remove all form elements > prevents duplicate fields
                    while (BPform.hasChildNodes()) {  
                        BPform.removeChild(BPform.firstChild);
                    }
    
                    //Getting the fields of the document
                    var docdata = Object.entries(doc.data());
                    for (let [key, value] of docdata) {
                        // Don't display the displayfeature field
                        if(key != '1displayfeature'){
    
                            let label = document.createElement('label');
                            let input = document.createElement('input');
                            let br = document.createElement('br');
                            let addOther = document.createElement('div');

    
                            // Removing numbers from the string + capitalize first letter
                            var keyText = key.replace(/[0-9]/g, '');
                            var upperKey = keyText.charAt(0).toUpperCase() + keyText.substring(1);
    
                            label.textContent = upperKey;
                            input.textContent = value;

                            // HTML code block for adding another element to the form group
                            let addOtherHTML = 
                                "<a style=\"margin-top: 10px\" id=\"addItem-"+`${key}`+"\" class=\"btn btn-light btn-icon-split\"\>\
                                    <span class=\"icon text-gray-600\"\>\
                                    <i class=\"fas fa-plus\"></i\>\
                                    </span\>\
                                    <span class=\"text\">"+`${upperKey}`+"</span\>\
                                </a>"
                            
                            addOther.innerHTML = addOtherHTML;
    
                            input.setAttribute('class', 'form-control bg-light border-0 small');
                            input.setAttribute('type', 'value');
    
                            // For each element we need to know the collectionpath, docname and key type
                            // That way we write the data to the correct document
                            input.setAttribute('colpath', coll);
                            input.setAttribute('docname', doc.id);
                            input.setAttribute('key', key);
                            if(Array.isArray(value)){
                                input.setAttribute('type', 'array');
                            }
                            else {
                                input.setAttribute('type', 'field');
                            }
    
                            // Adding all elements to the form
                            if(input.getAttribute('type') == 'array'){
                                BPform.appendChild(label);
                                BPform.appendChild(br);
                                BPform.appendChild(input);
                                BPform.appendChild(br);
                                BPform.appendChild(addOther);
                                BPform.appendChild(br);
                            }
                            else{
                                BPform.appendChild(label);
                                BPform.appendChild(br);
                                BPform.appendChild(input);
                                BPform.appendChild(br);
                            }

                            // addItem is the add button for the current key value
                            let addItem = document.getElementById("addItem-"+`${key}`);
                            // Checking if the button exists yet
                            if(addItem){
                                addItem.addEventListener('click', function() {
                                    
                                    // Element is the parent element of the clicked button
                                    let element = this.parentElement;
                                    let newInput = input;
                                    newInput.setAttribute('style', 'margin-top: 10px');
                                    // Inserting the field before the button
                                    $(newInput).clone().insertBefore(element);
       
                                });
                            }
                        }
                    }
    
                })
            });
        });
    })
})


// Delay function specifies how long to wait on an async function
// This delay should be long enough to write alteredJSONstring before firing te callback
function delay() {
    return new Promise(resolve => setTimeout(resolve, 800));
}


async function alterJSON(docid, callback){

    let alteredJSONstring = JSON.stringify(jsontest);

    // Making sure the collectionPaths array is available
    collectionPaths = [];
    extractJSON(jsontest, 0, '');

    // Remove all children from the BPform > prevents duplicate form features
    while (BPform.hasChildNodes()) {  
        BPform.removeChild(BPform.firstChild);
    }

    for(const coll of collectionPaths){
        // Getting all collections for which features should be displayed
        // Only for collections in the JSON model
        db.collection(coll)
        .where("1displayfeature", "==", "true")
        .get().then(snapshot => {
            for(const item of snapshot.docs){
                // Replace the name of the document (e.g. bestpracticedoc) with the uniqueDocID
                alteredJSONstring = alteredJSONstring.replace(item.id.toString(), docid.toString());
            }
        })
    }
    
    // Await the delay before firing the callback > long enough to write alteredJSONstring
    await delay();

    callback(alteredJSONstring);
};


// This function stores the best practice
// A string in JSON format is created to write to Firestore
document.getElementById("store-BP-btn").addEventListener("click", function(){

    var filledBPform = document.querySelector('#bp-entry-form');

    var arrayArray = [];
    var keyArray = [];
    var arrayString = "";

    var JSONarray = ["\"created\": \"true\""];
    var JSONstring = "";

    // For each element in the BP entry form
    for (var i = 0; i < filledBPform.length; i++) {
        var entryColPath = filledBPform.elements[i].getAttribute('colpath');
        var entryDocName = filledBPform.elements[i].getAttribute('docname');
        var entryKey = filledBPform.elements[i].getAttribute('key');
        var entryType = filledBPform.elements[i].getAttribute('type');

        // Regular fields
        if(entryType === 'field'){
            JSONarray.push('\"'+`${entryKey}`+'\": \"'+`${filledBPform.elements[i].value}`+'\"');
        }
        // Array fields
        else{
            // keyArray contains all key fields of array groups, e.g. "4categories"
            keyArray.push(`${entryKey}`);

            // arrayArray included the key and the input value of all array-type input fields
            if(!(arrayArray.includes(`${entryKey}`))){
                arrayArray.push(`${entryKey}`);
                arrayArray.push(`${filledBPform.elements[i].value}`);
            }
            else{
                arrayArray.push(`${filledBPform.elements[i].value}`);
            }
        }
    }

    // Constructing a string with array contents
    for (var x = 0; x < arrayArray.length; x++){
        // If the array element is the index key
        if(keyArray.includes(arrayArray[x])){
            if(x == 0){
                arrayString += ("\"" + arrayArray[x] + "\": [");
            }
            else{
                arrayString = arrayString.slice(0, arrayString.length - 2);
                // Double commas to be able to split the string later on
                arrayString += ("],, \"" + arrayArray[x] + "\": [");
            }
        }
        else{
            if(x == arrayArray.length - 1){
                arrayString += ("\"" + arrayArray[x] + "\"]");
            }
            else {
                arrayString += ("\"" + arrayArray[x] + "\", ");
            }
        }
    }

    // Splitting the string of array information to get an array with all contents
    // We need a string first since we need to write the square brackets to the database
    // arrayElement therefore now contains contents like "4categories": ["Environment", "Health"]
    let arrayElement = arrayString.split(",, ");
    for(var y = 0; y < arrayElement.length; y++){
        JSONarray.push(arrayElement[y]);
    } 

    // Constructing the JSONstring to be written to the database
    JSONarray.forEach(element => {
        if(JSONarray[0] === element){
            JSONstring += ("{"+element+",");
        }
        else if (JSONarray[JSONarray.length - 1] === element){
            JSONstring += (element+"}")
        }
        else {
            JSONstring += (element+",");
        }
    });

    db.collection(entryColPath).doc(entryDocName).set(JSON.parse(JSONstring));

    modal.style.display = "none";
});

span.onclick = function() {
    modal.style.display = "none";

    let x = span.getAttribute('id');

    // Removing the document if the entry form is closed without sending
    for(const coll of collectionPaths){
        db.collection(coll).doc(x).delete().then(function() {
        });
    }
}