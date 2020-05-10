// ########################
// Creates a modal for entering BPs and stores them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// The form to enter new BP information
const BPform = document.querySelector('#bp-entry-form');


// ############################################


var modal = document.getElementById("bp-modal");
var btn = document.getElementById("create-BP-btn");
// span elements closes the modal
var span = document.getElementsByClassName("close")[0];

// displaying the modal
if(btn){
    btn.onclick = function() {
    modal.style.display = "block";
    }
}


document.getElementById("create-BP-btn").addEventListener("click", function(){

    // Assigning a unique id
    let uniqueDocID = ('_' + Math.random().toString(36).substr(2, 9));
    span.setAttribute('id', uniqueDocID);


    // First alter the JSON string by inserting the unique doc id's
    alterJSON(uniqueDocID, function(aJSON){

        // Once the JSON string has been altered, fire this callback

        // Emptying these arrays prevents information from the initial JSON model to be present
        fieldsArr = [];
        collectionPaths = [];
        documentPaths = [];


        // WRITING THE DOCUMENT TO THE DB BEFORE ANY INFO IS FILLED IN
        // Calling these functions does the following:
        // 1. collectionPaths and documentPaths arrays are filled
        // 2. All documents specified in the altered JSON string are written to the DB
        // (this includes the best practice document with the unique id, but also the domainstate doc)
        // (manually changed info in standard docs will therefore be overwritten by the model)
        extractJSON(JSON.parse(aJSON), 0, '');
        extractFields();


        collectionPaths.forEach(coll => {
            db.collection(coll)
            // Documents that match the current uniqueDocID are the documents for which features need to be displayed
            .where(firebase.firestore.FieldPath.documentId(), "==", uniqueDocID.toString())
            .get().then(snapshot => {

                snapshot.docs.forEach(doc => {
    
                    // Getting the fields of the document
                    var docdata = Object.entries(doc.data());

                    // Populate an array of document references
                    let docrefArray = [];

                    //Iterating over the key-value pairs of the documents in which features should be displayed
                    for (let [key, value] of docdata) {

                        // Before features are instantiated, we need to be able to populate docref dropdowns
                        if(value == "document reference"){

                            let keyText = key.replace(/[0-9]/g, '');
                            // keyText (e.g. authors) is used to find the path to the subcollection that requires a docref
                            // This requires the subcollection that is pointed to with the docref to have the same name as the key
                            // E.g. if 4author is a document reference, the document should be stored in a subcollection named author or authors
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


// This function is called for each key-value pair in each document that requires features
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
                // Larger text fields
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
                // No current entries in the docref subcollection
                // For example, no authors
                // We add a text field to the doc, rather than a dropdown
                if(docrefArray.length == 0){
                    BPform.appendChild(label);
                    BPform.appendChild(br);
                    BPform.appendChild(input);
                    BPform.appendChild(br);

                    // Setting the path to the docref subcollection as attribute
                    let keyText = key.replace(/[0-9]/g, '');
                    let docrefPath = findPath(collectionPaths, keyText);
                    input.setAttribute('docrefpath', docrefPath+'/'+doc.id)
                }
                // Current entries already exist > we create a dropdown
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

                    referenceSelect.setAttribute('colpath', coll)
                    referenceSelect.setAttribute('docname', doc.id);
                    referenceSelect.setAttribute('key', key);
                    referenceSelect.setAttribute('type', 'select');
                }
            }

            // addItem is the add button for the current key value
            let addItem = document.getElementById("addItem-"+`${key}`);
            // Checking if the button exists yet
            if(addItem){
                addItem.addEventListener('click', function() {
                    
                    // Element is the parent element of the clicked button
                    let element = this.parentElement;

                    let newInput = input;
                    
                    // If the other form element is select, than it's a document reference
                    if(element.previousSibling.nodeName == 'SELECT'){
                        // Setting the path to the docref subcollection as attribute
                        let keyText = key.replace(/[0-9]/g, '');
                        let docrefPath = findPath(collectionPaths, keyText);
                        newInput.setAttribute('docrefpath', docrefPath+'/'+doc.id);
                    }
                    
                    newInput.setAttribute('style', 'margin-top: 10px');
                    // Inserting the field before the button

                    // TODO: WE DON'T WANT TO CLONE ALL ATTRIBUTES > DOCREFPATH NEEDS TO BE UPDATED FOR EACH NEW FIELD
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


// Creates an altered version of the JSON model by inserting the unique doc id's 
// for the subcollections that have instantiated features
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

    // Getting an array of collectionpaths specified for the form elements
    let colpathArray = []
    for (var col = 0; col < filledBPform.length; col++) {
        if(!(colpathArray.includes(filledBPform.elements[col].getAttribute('colpath')))){
            colpathArray.push(filledBPform.elements[col].getAttribute('colpath'));
        }
    }

    // For each unique colpath, document content is constructed
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

       
        // STEP 1
        // Extracting all information from the filled in form and writing that info to arrays

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
                // Selected fields in selectbox OR regular fields for document references
                else if(entryType == 'select' || filledBPform.elements[i].textContent == 'document reference'){
                    if(entryType == 'select'){
                        let selectedOption = filledBPform.elements[i].options[filledBPform.elements[i].selectedIndex];
                        docRef.push(selectedOption.getAttribute('colpath') + '/' + selectedOption.getAttribute('docname'));
                        keyRef.push(selectedOption.getAttribute('key'));
                    }
                    else{
                        // For a regular field, we want to store the docrefpath (which is passed as an attribute), rather than the input value
                        // This docref points to a document which is created with the value the user has put in
                        docRef.push(filledBPform.elements[i].getAttribute('docrefpath'));
                        keyRef.push(filledBPform.elements[i].getAttribute('key'));
                    }
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

        // STEP 2
        // Constructing a string with array contents and adding that to the JSON info

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

        // STEP 3
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

        // STEP 4
        // Writing to the database

        db.collection(entryColPath).doc(entryDocName).set(JSON.parse(JSONstring));


        // STEP 5
        // So far only array information and regular field information is written. Docref writes requires extra info.

        // Checking if there are document references in the docref array
        if(docRef.length){

            let uniqueRef = [];
            let uniqueIndex = [];

            // Need to store multiple docrefs in the same field as an array
            // Construct that array first and then write it > otherwise only one ref is stored

            // docRef stores all docrefs for every field
            // Creating an array of indexes > up until which index grouped docrefs are stored
            for(let ref = 0; ref < keyRef.length; ref++){
                if(!(uniqueRef.includes(keyRef[ref]))){
                    uniqueRef.push(keyRef[ref]);
                }
                else{
                    // Remove the last element
                    uniqueIndex.pop();
                    // Push the new element
                    uniqueIndex.push(ref);
                }
            }


            for(var key = 0; key < keyRef.length; key++){

                // Getting the form that is responsible for this input
                let keyName = keyRef[key];
                let inputFeature = Array.from(filledBPform.elements).filter(function(formfeature) {
                    return (formfeature.getAttribute('key') == keyName)
                });

                // Info from selectbox
                if(inputFeature[key].nodeName == 'SELECT'){
                    // Write the reference to the best practice doc if only one docref is stored
                    if(uniqueIndex.length == 0){
                        db.collection(entryColPath).doc(entryDocName).set({[keyRef[key]]: [db.doc(docRef[key])]}, { merge: true });
                    }
                }
                // Info from a regular field
                else{
                    // Write the reference to the best practice doc if only one docref is stored
                    if(uniqueIndex.length == 0){
                        db.collection(entryColPath).doc(entryDocName).set({[keyRef[key]]: [db.doc(docRef[key])]}, { merge: true });
                    }

                    let inputValue = inputFeature[key].value;

                    let drp = docRef[key].replace('/'+entryDocName, '');
                    // Write a value to a new doc in the subcollection that is referenced
                    db.collection(drp).doc(entryDocName).set({"name": inputValue});
                }
            }

            for(let ui = 0; ui < uniqueIndex.length; ui++){

                // Construct an array to write to the database for every docref field
                let writeArr = [];
                let writeKey;

                for(let dr = 0; dr < docRef.length; dr++){

                    // First element in docref
                    if(dr == 0){
                        // Should be lower than or equal to the uniqueness index
                        if(dr <= uniqueIndex[ui]){
                            writeArr.push(docRef[dr]);
                            writeKey = keyRef[ui];
                        }
                    }
                    else{
                        // If there is a previous uniqueness index
                        if(uniqueIndex[ui-1]){
                            // Should be lower or equal to uniqueness index, but higher than the previous index
                            if(dr <= uniqueIndex[ui] && dr > uniqueIndex[ui-1]){
                                writeArr.push(docRef[dr]);
                                writeKey = keyRef[ui];
                            }
                        }
                        else{
                            if(dr <= uniqueIndex[ui]){
                                writeArr.push(docRef[dr]);
                                writeKey = keyRef[ui];
                            }
                        }
                    }

                }

                // writing the writeArr 
                db.collection(entryColPath).doc(entryDocName).set({[writeKey]: writeArr}, { merge: true });

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