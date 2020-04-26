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
if(btn){
    btn.onclick = function() {
    modal.style.display = "block";
    }
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
            .get().then(snapshot => {

                snapshot.docs.forEach(doc => {
    
                    //Getting the fields of the document
                    var docdata = Object.entries(doc.data());

                    // Populate an array of document references
                    let docrefArray = [];

                    //Iterating over the key-value pairs of the documents in which features should be displayed
                    for (let [key, value] of docdata) {

                        if(value == "document reference"){
                            let keyText = key.replace(/[0-9]/g, '');
                            // keyText (e.g. authors) is used to find the path to the subcollection that requires a docref
                            let docrefPath = findPath(collectionPaths, keyText);

                            db.collection(`${docrefPath}`)
                            .get().then((snapshot) => {
                                snapshot.docs.forEach(doc => {

                                    let keyIndexArr = [];
                                    for (let [key, value] of Object.entries(doc.data())){
                                        let keyname = JSON.stringify(key).replace(/[ˆ0-9]+|"/g, '');
                                        keyIndexArr.push(keyname)
                                    };

                                    // Specifies at which point in the array the "name" field is specified
                                    let entryPoint;

                                    for(var keyIndex = 0; keyIndex < keyIndexArr.length; keyIndex++){
                                        if(keyIndexArr[keyIndex] == 'name'){
                                            entryPoint = keyIndex;
                                        }
                                    }

                                    // authorArray will store an array for each author, with the name, documentid and path
                                    let docData = [];
                                    // Don't include "string" > that's part of the initial model only
                                    if(!(doc.data()[Object.keys(doc.data())[entryPoint]] == 'string')){
                                        docData.push(doc.data()[Object.keys(doc.data())[entryPoint]]);
                                        docData.push(doc.id);
                                        docData.push(docrefPath);
                                        docrefArray.push(docData);
                                    }
                                })
                            })
                        }

                        // Setting a timeout so that instantiateFeatures is called only after the query above has had a chance to complete
                        // The result of the query is needed to determine if selectboxes for the document references are instantiated
                        setTimeout(() => {
                            instantiateFeatures(key, value, coll, doc, docrefArray);
                        }, 1000)

                    }
                })
            })

        });
    })
})


function instantiateFeatures(key, value, coll, doc, docrefArray){
    
    // Don't display the displayfeature field
    if(key != '1displayfeature'){
                            
        let grouptitle = document.createElement('div');
        let label = document.createElement('label');
        let input = document.createElement('input');
        let textarea = document.createElement('textarea');
        let br = document.createElement('br');
        let addOther = document.createElement('div');

        // Setting the title and description of the group of form elements
        if(key == '01grouptitle'){
            grouptitle.setAttribute('class', 'font-weight-bold text-success text-uppercase');
            grouptitle.textContent = value;
            BPform.appendChild(grouptitle);
            BPform.appendChild(br);
        }
        else if(key == '02groupdesc'){
            let groupdesc = document.createElement('p');
            groupdesc.textContent = value;
            BPform.appendChild(groupdesc);
            BPform.appendChild(br);
        }
        // Every other key-value pair
        else{
            // Removing numbers from the key + capitalize first letter
            let keyText = key.replace(/[0-9]/g, '');
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

            // Styling of the input fields
            input.setAttribute('class', 'form-control bg-light border-0 small');
            input.setAttribute('type', 'value');
            textarea.setAttribute('class', 'form-control bg-light border-0 small');
            textarea.setAttribute('type', 'value');

            // For each element we need to know the collectionpath, docname and key type
            // That way we write the data to the correct document
            input.setAttribute('colpath', coll);
            input.setAttribute('docname', doc.id);
            input.setAttribute('key', key);
            textarea.setAttribute('colpath', coll);
            textarea.setAttribute('docname', doc.id);
            textarea.setAttribute('key', key);

            // Assigning attribute types to the input fields
            if(Array.isArray(value)){
                input.setAttribute('type', 'array');
            }
            else {
                input.setAttribute('type', 'field');
                textarea.setAttribute('type', 'field');
            }

            // Adding elements that do not require population with document references
            if(value != "document reference"){
                // Arrays
                if(Array.isArray(value)){
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(input);
                    BPform.appendChild(br);
                    BPform.appendChild(addOther);
                    BPform.appendChild(br);
                }
                // Text fields
                else if(value == 'text'){
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(textarea);
                    BPform.appendChild(br);
                }
                // Other
                else{
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(input);
                    BPform.appendChild(br);
                }
            }
            // Document reference dropdowns are created and populated here
            else{       
                // Adding the values of the docrefArray to the dropdown
                docrefArray.forEach(docref => {
                    let option = document.createElement('option');
                    option.setAttribute('value', docref[0]);
                    option.setAttribute('docname', docref[1]);
                    option.setAttribute('colpath', docref[2]);
                    option.setAttribute('key', key);
                    option.textContent = docref[0];
                    referenceSelect.add(option);
                });

                // No current entries in the docref subcollection
                // For example, no authors
                if(docrefArray.length == 0){
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(input);
                    BPform.appendChild(br);
                }
                else{
                    // A selectbox is added if there are document references to be found
                    let referenceSelect = document.createElement('select');
                    referenceSelect.setAttribute('class', 'form-control bg-light border-0 small');
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(referenceSelect);
                    BPform.appendChild(br);
                    if(Array.isArray(value)){
                        BPform.appendChild(addOther);
                        BPform.appendChild(br);
                    }

                    // Adding the option for the user to add something else
                    let option = document.createElement('option');
                    option.textContent = 'Add other';
                    referenceSelect.setAttribute('colpath', coll)
                    referenceSelect.setAttribute('docname', doc.id);
                    referenceSelect.setAttribute('key', key);
                    referenceSelect.setAttribute('type', 'select');
                    referenceSelect.add(option);
                }
            }

            // addItem is the add button for the current key value
            let addItem = document.getElementById("addItem-"+`${key}`);
            // Checking if the button exists yet
            if(addItem){
                addItem.addEventListener('click', function() {
                    
                    // Element is the parent element of the clicked button
                    let element = this.parentElement;
                    console.log(element)
                    let newInput = input;
                    newInput.setAttribute('style', 'margin-top: 10px');
                    // Inserting the field before the button
                    $(newInput).clone().insertBefore(element);

                });
            }

        }
    }
}


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

    let colpathArray = []
    for (var col = 0; col < filledBPform.length; col++) {
        if(!(colpathArray.includes(filledBPform.elements[col].getAttribute('colpath')))){
            colpathArray.push(filledBPform.elements[col].getAttribute('colpath'));
        }
    }

    for (var cps = 0; cps < colpathArray.length; cps++){

        var arrayArray = [];
        var keyArray = [];
        var arrayString = "";
    
        var JSONarray = ["\"created\": \"true\""];
        var JSONstring = "";

        // docRef stores the references for any docref that needs to be written to the db
        let docRef = [];
        // keyRef stores the corresponding key
        let keyRef = [];

        // For each element in the BP entry form
        for (var i = 0; i < filledBPform.length; i++) {
            if(filledBPform.elements[i].getAttribute('colpath') == colpathArray[cps]){
                var entryColPath = filledBPform.elements[i].getAttribute('colpath');
                var entryDocName = filledBPform.elements[i].getAttribute('docname');
                var entryKey = filledBPform.elements[i].getAttribute('key');
                var entryType = filledBPform.elements[i].getAttribute('type');

                // Regular fields
                if(entryType === 'field'){
                    JSONarray.push('\"'+`${entryKey}`+'\": \"'+`${filledBPform.elements[i].value}`+'\"');
                }
                // Selected fields in selectbox
                else if(entryType == 'select'){
                    let selectedOption = filledBPform.elements[i].options[filledBPform.elements[i].selectedIndex];
                    docRef.push(selectedOption.getAttribute('colpath') + '/' + selectedOption.getAttribute('docname'));
                    keyRef.push(selectedOption.getAttribute('key'));
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
            // Only do this if this section contains arrays
            if(arrayString != 0){
                JSONarray.push(arrayElement[y]);
            }
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

        console.log(JSONstring);

        db.collection(entryColPath).doc(entryDocName).set(JSON.parse(JSONstring));

        // Adding references to the document
        if(docRef.length){
            for(var key = 0; key < keyRef.length; key++){
                db.collection(entryColPath).doc(entryDocName).set({[keyRef[key]]: db.doc(docRef[key])}, { merge: true });
            }
        }
    }

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