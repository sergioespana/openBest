// ########################
// Creates a modal for entering BPs and stores them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// The form to enter new BP information
const BPform = document.querySelector('#bp-entry-form');

// How many docrefs are stored
var docRefCounter = 0;

// The modal and button to display it
var modal = document.getElementById("bp-modal");
var btn = document.getElementById("create-BP-btn");
// Span elements closes the modal
var span = document.getElementsByClassName("close")[0];

// Div instantiated for the set of features for each concept
// var conceptDivInit = document.createElement('div');
var check = "nothing";

// Stores a counter to give each new concept a unique docname
var newConceptCounter = 0;


// ############################################

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

    // Resetting the counter
    newConceptCounter = 0;

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
                        if(typeof(value[0]) == "object"){

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
            .catch(function(error) {
                console.error("Error retrieving document: ", error);
            });

        });
    })
})


// This function is called for each key-value pair in each document that requires features
function instantiateFeatures(key, value, coll, doc, docrefArray){

    // Adding a div for each NEW concept by checking the collectionpath
    if(check != coll){
        let conceptDiv = document.createElement('div');
        conceptDiv.setAttribute('coll', coll);
        check = coll;
        $(BPform).append(conceptDiv);
    }
    
    // Don't display the displayfeature field
    if(key != '1displayfeature'){

        let conceptDiv = $(BPform).find(`[coll='${coll}']`)[0];
                            
        let grouptitle = document.createElement('div');
        let label = document.createElement('label');
        let input = document.createElement('input');
        let textarea = document.createElement('textarea');
        let addOther = document.createElement('div');
        let addEx = document.createElement('div');

        // Setting the title and description of the group of form elements
        if(key == '01grouptitle'){
            grouptitle.setAttribute('class', 'group-title font-weight-bold text-success text-uppercase');
            grouptitle.textContent = value;
            conceptDiv.appendChild(grouptitle);
        }
        else if(key == '02groupdesc'){
            let groupdesc = document.createElement('p');
            groupdesc.textContent = value;
            conceptDiv.appendChild(groupdesc);
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
            // HTML code block for adding another docref drowpdown to the form group
            let addExistingHTML = 
                "<a style=\"margin-top: 10px\" id=\"addExisting-"+`${key}`+"\" class=\"btn btn-light btn-icon-split\"\>\
                    <span class=\"icon text-gray-600\"\>\
                    <i class=\"fas fa-plus\"></i\>\
                    </span\>\
                    <span class=\"text\">Existing</span\>\
                </a>"
            addEx.innerHTML = addExistingHTML;

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
                if(typeof(value[0]) == "object"){
                    input.setAttribute('type', 'docref');
                }
                else{
                    input.setAttribute('type', 'array');
                }
            }
            else {
                input.setAttribute('type', 'field');
                textarea.setAttribute('type', 'field');
            }


            // Adding elements that do not require population with DOCUMENT REFERENCES
            if(!(typeof(value[0]) == "object")){
                // Arrays
                if(Array.isArray(value)){
                    conceptDiv.appendChild(label);
                    conceptDiv.appendChild(input);
                    // Setting this attribute helps in determining the type of input to be added
                    addOther.setAttribute('add-type', 'regular');
                    addOther.style.marginBottom = '15px';
                    conceptDiv.appendChild(addOther);
                }
                // Larger text fields
                else if(value == 'text'){
                    conceptDiv.appendChild(label);
                    conceptDiv.appendChild(textarea);
                }
                // Other
                else{
                    conceptDiv.appendChild(label);
                    conceptDiv.appendChild(input);
                }
            }


            // DOCUMENT REFERENCE dropdowns are created and populated here
            else{       
                // No current entries in the docref subcollection
                // For example, no authors
                // We add a text field to the doc, rather than a dropdown
                if(docrefArray.length == 0){
                    // Iterating over the relationship names, in the case there
                    for(let relname = 0; relname < value.length; relname++){

                        let relTitle = document.createElement('p');
                        relTitle.textContent = value[relname].name;
                        conceptDiv.appendChild(relTitle);

                        let relInput = document.createElement('input');
                        relInput.setAttribute('key', input.getAttribute('key'));
                        relInput.setAttribute('type', 'docref');
                        relInput.setAttribute('colpath', input.getAttribute('colpath'));
                        relInput.setAttribute('docname', input.getAttribute('docname'));
                        relInput.setAttribute('class', input.getAttribute('class'));
                        // Adding the current docref as the self attribute
                        relInput.setAttribute('self', coll+'/'+doc.id);
                        // Adding the relationship name
                        relInput.setAttribute('rel-name', value[relname].name);
                        // Adding the input field
                        conceptDiv.appendChild(relInput);

                        let addOtherRel = document.createElement('a');
                        addOtherRel.innerHTML = addOther.innerHTML;
                        addOtherRel.setAttribute('id', 'addItem-'+(`${value[relname].name}`).replace(' ', ''));
                        addOtherRel.setAttribute('add-type', 'docref');
                        addOtherRel.setAttribute('class', 'addOther');
                        addOtherRel.setAttribute('rel-name', value[relname].name);
                        conceptDiv.appendChild(addOtherRel);

                        // Setting the path to the docref subcollection as attribute
                        let keyText = key.replace(/[0-9]/g, '');
                        let docrefPath = findPath(collectionPaths, keyText);
                        relInput.setAttribute('docrefpath', docrefPath+'/'+doc.id+'-'+relname);
                        relInput.setAttribute('docrefcoll', docrefPath);
                        relInput.setAttribute('docref-docname', doc.id+'-'+relname);
                    }
                }
                // Current entries already exist > we create a dropdown
                else{
                    // Iterating over the relationship names, in the case there
                    for(let relname = 0; relname < value.length; relname++){

                        // A selectbox is added if there are document references to be found
                        let referenceSelect = document.createElement('select');
                        referenceSelect.setAttribute('class', 'form-control bg-light border-0 small');
                        
                        let relTitle = document.createElement('p');
                        relTitle.textContent = value[relname].name;
                        conceptDiv.appendChild(relTitle);

                        conceptDiv.appendChild(referenceSelect);

                        let addExRel = document.createElement('a');
                        addExRel.innerHTML = addEx.innerHTML;
                        addExRel.setAttribute('add-type', 'docref');
                        addExRel.setAttribute('class', 'addEx');
                        addExRel.setAttribute('rel-name', value[relname].name);
                        conceptDiv.appendChild(addExRel);

                        let addOtherRel = document.createElement('a');
                        addOtherRel.innerHTML = addOther.innerHTML;
                        addOtherRel.setAttribute('id', 'addItem-'+(`${value[relname].name}`).replace(' ', ''));
                        addOtherRel.setAttribute('add-type', 'docref');
                        addOtherRel.setAttribute('class', 'addOther');
                        addOtherRel.setAttribute('rel-name', value[relname].name);
                        conceptDiv.appendChild(addOtherRel);


                        // Adding the values of the docrefArray to the dropdown
                        docrefArray.forEach(docref => {
                            let option = document.createElement('option');
                            option.setAttribute('value', docref[0]);
                            option.setAttribute('docname', docref[1]);
                            option.setAttribute('colpath', docref[2]);
                            option.setAttribute('key', key);
                            // Adding the current docref as the self attribute
                            option.setAttribute('self', coll+'/'+doc.id);
                            // Adding the relationship name
                            option.setAttribute('rel-name', value[relname].name);
                            option.textContent = docref[0];
                            referenceSelect.add(option);
                        });

                        referenceSelect.setAttribute('colpath', coll)
                        referenceSelect.setAttribute('docname', doc.id);
                        referenceSelect.setAttribute('key', key);
                        referenceSelect.setAttribute('type', 'select');
                    }
                }
            }


            // // ADDING ANOTHER ELEMENT TO THE FORM
            // // >> Two element types that can be added: dropdowns or regular fields

            // // ADDING A REGULAR FIELD
            // // addItem is the add button for the current key value
            // if(typeof(value[0]) == "object"){
            //     for(let relname = 0; relname < value.length; relname++){
            //         var addItem = document.getElementById('addItem-'+(`${value[relname].name}`).replace(' ', ''));
            //     }
            // }
            // else{
            //     var addItem = document.getElementById('addItem-'+`${key}`);
            // }

            // // Checking if the button exists yet
            // if(addItem){
            //     addItem.addEventListener('click', function() {
                    
            //         // Element is the parent element of the clicked button
            //         let element = this.parentElement;

            //         let docrefPath = findPath(collectionPaths, keyText);

            //         // HTML code for adding an input field
            //         let inputAddHTML;

            //         // Setting the correct attributes in the case of a docref
            //         if(element.getAttribute('add-type') == 'docref'){
            //             inputAddHTML = "\
            //             <div style=\"margin-top: 10px\" class=\"row\"\>\
            //                 <div class=\"col-md-11\"\>\
            //                     <input class=\"form-control bg-light border-0 small\" colpath=\""+coll+"\" docname=\""+doc.id+"\" key=\""+key+"\" docref-docname=\""+doc.id+'-'+docRefCounter+"\" docrefpath=\""+docrefPath+'/'+doc.id+'-'+docRefCounter+"\" docrefcoll=\""+docrefPath+"\" self=\""+coll+"/"+doc.id+"\" rel-name=\""+element.getAttribute('rel-name')+"\" type=\"docref\"></input\>\
            //                 </div\>\
            //                 <div style=\"padding: 0px!important\" class=\"col-md-1\"\>\
            //                     <a class=\"attrDelete btn btn-light btn-icon-split\"\>\
            //                         <span class=\"icon text-gray-600\"\>\
            //                             <i class=\"fas fa-times\"></i\>\
            //                         </span\>\
            //                     </a\>\
            //                 </div\>\
            //             </div>"
            //         }
            //         else{
            //             inputAddHTML = "\
            //             <div style=\"margin-top: 10px\" class=\"row\"\>\
            //                 <div class=\"col-md-11\"\>\
            //                     <input class=\"form-control bg-light border-0 small\" colpath=\""+coll+"\" docname=\""+doc.id+"\" key=\""+key+"\" type=\"array\"></input\>\
            //                 </div\>\
            //                 <div style=\"padding: 0px!important\" class=\"col-md-1\"\>\
            //                     <a class=\"attrDelete btn btn-light btn-icon-split\"\>\
            //                         <span class=\"icon text-gray-600\"\>\
            //                             <i class=\"fas fa-times\"></i\>\
            //                         </span\>\
            //                     </a\>\
            //                 </div\>\
            //             </div>"
            //         }

            //         // The previous input field
            //         let previousInput = element.previousElementSibling;
            //         // Adding the new input field
            //         $(inputAddHTML).insertAfter(previousInput);

            //         docRefCounter++;

            //     });
            // }

            // // ADDING ANOTHER DROPDOWN FOR DOCREFS

            // let addExisting = document.getElementById("addExisting-"+`${key}`);
            // // Checking if the button exists yet
            // if(addExisting){
            //     addExisting.addEventListener('click', function() {
                    
            //         // Element is the parent element of the clicked button
            //         let element = this.parentElement;

            //         let referenceSelect = document.createElement('select');
            //         referenceSelect.setAttribute('class', 'form-control bg-light border-0 small');
            //         // Adding the values of the docrefArray to the dropdown
            //         docrefArray.forEach(docref => {
            //             let option = document.createElement('option');
            //             option.setAttribute('value', docref[0]);
            //             option.setAttribute('docname', docref[1]);
            //             option.setAttribute('colpath', docref[2]);
            //             option.setAttribute('key', key);
            //             // Adding the current docref as the self attribute
            //             option.setAttribute('self', coll+'/'+doc.id);
            //             // Adding the relationship name
            //             option.setAttribute('rel-name', element.getAttribute('rel-name'));
            //             option.textContent = docref[0];
            //             referenceSelect.add(option);
            //         });
            //         referenceSelect.setAttribute('colpath', coll);
            //         referenceSelect.setAttribute('docname', doc.id);
            //         referenceSelect.setAttribute('key', key);
            //         referenceSelect.setAttribute('type', 'select');

            //         let referenceRow = "\
            //         <div style=\"margin-top: 10px\" class=\"row\"\>\
            //             <div class=\"col-md-11\"\>"
            //                 +referenceSelect.outerHTML+
            //             "</div\>\
            //             <div style=\"padding: 0px!important\" class=\"col-md-1\"\>\
            //                 <a class=\"attrDelete btn btn-light btn-icon-split\"\>\
            //                     <span class=\"icon text-gray-600\"\>\
            //                         <i class=\"fas fa-times\"></i\>\
            //                     </span\>\
            //                 </a\>\
            //             </div\>\
            //         </div>"

            //         // The previous input field
            //         let previousInput = element.previousElementSibling;
            //         // Adding the new input field
            //         $(referenceRow).insertAfter(previousInput);
            //     });
            // }

        }
    }

    // ADDING ANOTHER CONCEPT IN A SUBCOLLECTION
    // Any collectionpath with more than 3 items is a subcollection
    if(coll.split("/").length > 3){
        // Array of keys in this document
        let documentKeys = Object.keys(doc.data());

        if(key == documentKeys[documentKeys.length - 1]){

            let conceptDiv = $(BPform).find(`[coll='${coll}']`)[0];

            // Button to add a new concept
            let addConcept = "<a style=\"margin-bottom: 15px\" class=\"addConcept btn btn-light btn-icon-split\">\
            <span class=\"text\">\
            <i class=\"fas fa-plus\"></i>\
            </span>\
            <span class=\"text\">Add document</span>\
            </a>"

            $(conceptDiv).append(addConcept);

        }
    }
}


// Adding attribute rows: dropdowns or regular fields
$("bp-entry-form").on('click', '.addOther', function(event){
    //Element is the parent element of the clicked button
    let element = this.parentElement;

    // HTML code for adding an input field
    let inputAddHTML;

    // Setting the correct attributes in the case of a docref
    if(element.getAttribute('add-type') == 'docref'){
        
    }
    else{
        
    }

    // The previous input field
    let previousInput = element.previousElementSibling;
    // Adding the new input field
    $(inputAddHTML).insertAfter(previousInput);

    docRefCounter++;
});


// Removing an input row for an attribute
$("#bp-entry-form").on('click', '.attrDelete', function(event){
    // The row in which the clicked delete button is located
    let attrRow = $(this).parent().parent()[0];
    attrRow.remove(attrRow);
});


// Adding a concept
$("#bp-entry-form").on('click', '.addConcept', function(event){
    // Upping the newConceptCounter
    newConceptCounter++;
    // Creating the new div
    let newConcept = document.createElement("div");
    // Adding the delete button, but only adding it to the HTML for the first newly added concept
    if(!($(this).parent()[0].getAttribute('class'))){
        newConcept.innerHTML = "\
        <div class=\"row\"\>\
            <div class=\"col-md-11\"\></div\>\
            <div class=\"col-md-1\"\>\
                <a class=\"conceptDelete btn btn-light btn-icon-split\"\>\
                    <i class=\"fas fa-times\"></i\>\
                </a\>\
            </div\>\
        </div>"
    }
    // Adding the same elements as the previous div
    newConcept.innerHTML += $(this).parent()[0].innerHTML;
    // Setting the class for the new concept
    newConcept.setAttribute('class', 'newConcept');
    // Styling the div
    newConcept.style = "border-style: solid; border-color: #f8f9fc; padding: 20px; margin-top: 15px; margin-bottom: 15px"

    // Adding the newConceptCounter, so that each input field in this new div has a unique docname
    $(newConcept).find('input, select, textarea').each(function(){
        $(this).attr('docname', `${$(this).attr('docname')}`+'-'+`${newConceptCounter}`)
    });

    // Adding the div
    $(newConcept).insertAfter($(this).parent()[0]);
});


// Removing an new concept div
$("#bp-entry-form").on('click', '.conceptDelete', function(event){
    // The div in which the button is located
    let conceptDiv = $(this).parent().parent().parent()[0];
    // Deleting the div
    conceptDiv.remove(conceptDiv);
});


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
        .catch(function(error) {
            console.error("Error retrieving document: ", error);
        });
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
    let colpathArray = [];
    // Storing the docnames as well
    let docNameArray = [];

    // Store the docname AND colpath for each concept in two arrays
    for (var col = 0; col < filledBPform.length; col++) {
        // If the element has a colpath attribute
        if(filledBPform.elements[col].getAttribute('colpath')){
            // For subcollection colpaths, we store a (non-unique) colpath for each unique docname
            if(filledBPform.elements[col].getAttribute('colpath').split("/").length > 3){
                if(!(colpathArray.includes(filledBPform.elements[col].getAttribute('colpath')))){
                    // Storing the colpath
                    colpathArray.push(filledBPform.elements[col].getAttribute('colpath'));
                    // Storing the docname
                    docNameArray.push(filledBPform.elements[col].getAttribute('docname'));
                }
                else if(!(docNameArray.includes(filledBPform.elements[col].getAttribute('docname')))){
                    // Storing the colpath
                    colpathArray.push(filledBPform.elements[col].getAttribute('colpath'));
                    // Storing the docname
                    docNameArray.push(filledBPform.elements[col].getAttribute('docname'));
                }
            }
            // For non-subcollection colpaths, we only store unique colpaths
            else{
                // And that attribute is not already added to the array
                if(!(colpathArray.includes(filledBPform.elements[col].getAttribute('colpath')))){
                    // Storing the colpath
                    colpathArray.push(filledBPform.elements[col].getAttribute('colpath'));
                    // Storing the docname
                    docNameArray.push(filledBPform.elements[col].getAttribute('docname'));
                }
            }
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
        // docRefColl stores the collectionpaths in which the documents created for the references should be stored
        let docRefColl = [];
        // docRefDocName stores the unique names for the documents, including the docRefCounter
        let docRefDocName = [];
        // relNames stores the names for each relationship to be stored
        let relNames = [];

       
        // STEP 1
        // Extracting all information from the filled in form and writing that info to arrays

        for (var i = 0; i < filledBPform.length; i++) {
            if(filledBPform.elements[i].getAttribute('colpath') == colpathArray[cps] && filledBPform.elements[i].getAttribute('docname') == docNameArray[cps]){
                var entryColPath = filledBPform.elements[i].getAttribute('colpath');
                var entryDocName = filledBPform.elements[i].getAttribute('docname');
                var entryKey = filledBPform.elements[i].getAttribute('key');
                var entryType = filledBPform.elements[i].getAttribute('type');

                // Regular fields
                if(entryType === 'field'){
                    JSONarray.push('\"'+`${entryKey}`+'\": \"'+`${filledBPform.elements[i].value}`+'\"');
                }
                // Selected fields in selectbox OR regular fields for document references
                else if(entryType == 'select' || filledBPform.elements[i].getAttribute('docref-docname')){
                    if(entryType == 'select'){
                        let selectedOption = filledBPform.elements[i].options[filledBPform.elements[i].selectedIndex];
                        docRef.push(selectedOption.getAttribute('colpath') + '/' + selectedOption.getAttribute('docname'));
                        docRefColl.push(selectedOption.getAttribute('colpath'));
                        docRefDocName.push(selectedOption.getAttribute('docname'));
                        keyRef.push(selectedOption.getAttribute('key'));
                        relNames.push(selectedOption.getAttribute('rel-name'));
                    }
                    else{
                        // For a regular field, we want to store the docrefpath (which is passed as an attribute), rather than the input value
                        // This docref points to a document which is created with the value the user has put in
                        docRef.push(filledBPform.elements[i].getAttribute('docrefpath'));
                        docRefColl.push(filledBPform.elements[i].getAttribute('docrefcoll'));
                        docRefDocName.push(filledBPform.elements[i].getAttribute('docref-docname'));
                        keyRef.push(filledBPform.elements[i].getAttribute('key'));
                        relNames.push(filledBPform.elements[i].getAttribute('rel-name'));
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
        // Writing the best practice to the database

        db.collection(entryColPath).doc(entryDocName).set(JSON.parse(JSONstring));


        // STEP 5
        // So far only array information and regular field information is written. Docref writes requires extra info.

        // Checking if there are document references in the docref array
        if(docRef.length){

            let uniqueRef = [];
            let uniqueIndex = [];

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

            // STEP 5.1: Handling the documents that docrefs point too
            // ## If a docref is created with an input field > create a new document in that referenced subcollection
            // ## If a docref is created with a selectbox > update the relationship info in that referenced document

            // Iterating over all docrefs
            for(var key = 0; key < keyRef.length; key++){

                // Getting the form that is responsible for this input
                let keyName = keyRef[key];
                let inputFeature = Array.from(filledBPform.elements).filter(function(formfeature) {
                    return (formfeature.getAttribute('key') == keyName)
                });

                // drp is the collectionpath in which docrefs are stored
                let drp = docRefColl[key];
                // drdn is the name of the document, including the docrefcounter
                let drdn = docRefDocName[key];
                
                // Information on the docrefs to be stored in the array of maps
                let name = relNames[key];
                let self = db.doc(`${entryColPath}`+"/"+`${entryDocName}`);
                let related = db.doc(docRef[key]);

                // Info from selectbox
                if(inputFeature[key].nodeName == 'SELECT'){
                    // For selectboxes, we don't have to create a new document
                    // We do have to update the relationship array in the referenced document

                    db.collection(drp).doc(drdn).get().then(function(doc) {
                        // The currently stored docrefs in the referenced document
                        let currentRefArray;

                        // The current array of maps of docrefs that is stored in the referenced document
                        currentRefArray = doc.data().relationship;

                        // Adding the relationship data for the newly created document to this array
                        currentRefArray.push({name: name, self: related, related: self});

                        console.log(drp)
                        console.log(drdn)
                        console.log(currentRefArray)

                        // Storing that docref
                        db.collection(drp).doc(drdn).set({relationship: currentRefArray}, { merge: true });
                        debugger
                    });
                }
                // Info from a regular field
                else{
                    // The value that the user has filled in
                    let inputValue = inputFeature[key].value;

                    // Write a value to a new doc in the subcollection that is referenced
                    db.collection(drp).doc(drdn).set({"name": inputValue});
                    // Also storing the relationship info
                    db.collection(drp).doc(drdn).set({relationship: [{name: name, self: related, related: self}]}, { merge: true });
                }
            }


            // Step 5.2: Storing the arrays of maps of docrefs in the current (best practice) document
            // ## This info is stored in the best practice document, not the documents that are pointed to

            for(let ui = 0; ui < uniqueIndex.length; ui++){

                // Construct an array of maps to write to the database for every docref field
                let writeArr = [];
                let writeKey;

                for(let dr = 0; dr < docRef.length; dr++){

                    // First element in docref
                    if(dr == 0){
                        // Should be lower than or equal to the uniqueness index
                        if(dr <= uniqueIndex[ui]){
                            // Constructing the map to be pushed to writeArr
                            let name = relNames[dr];
                            let self = db.doc(`${entryColPath}`+"/"+`${entryDocName}`);
                            let related = db.doc(docRef[dr]);
                            writeArr.push({name: name, self: self, related: related})

                            writeKey = keyRef[ui];
                        }
                    }
                    else{
                        // If there is a previous uniqueness index
                        if(uniqueIndex[ui-1]){
                            // Should be lower or equal to uniqueness index, but higher than the previous index
                            if(dr <= uniqueIndex[ui] && dr > uniqueIndex[ui-1]){
                                // Constructing the map to be pushed to writeArr
                                let name = relNames[dr];
                                let self = db.doc(`${entryColPath}`+"/"+`${entryDocName}`);
                                let related = db.doc(docRef[dr]);
                                writeArr.push({name: name, self: self, related: related})

                                writeKey = keyRef[ui];
                            }
                        }
                        else{
                            if(dr <= uniqueIndex[ui]){
                                // Constructing the map to be pushed to writeArr
                                let name = relNames[dr];
                                let self = db.doc(`${entryColPath}`+"/"+`${entryDocName}`);
                                let related = db.doc(docRef[dr]);
                                writeArr.push({name: name, self: self, related: related})
                                
                                writeKey = keyRef[ui];
                            }
                        }
                    }
                }

                // writing the writeArr to the best practice doc
                db.collection(entryColPath).doc(entryDocName).set({[writeKey]: writeArr}, { merge: true });

            }

            
        }
    }

    // Closing the modal
    modal.style.display = "none";
    // Resetting the counter
    docRefCounter = 0;
});


// Closing the modal
span.onclick = function() {
    modal.style.display = "none";

    let x = span.getAttribute('id');

    // Removing the document if the entry form is closed without sending

    // Don't just delete all documents with the unique doc id > this does not delete nested subcollections
    // For each documentpath (according to the JSON model), we find the name of the doc that's stored in that path
    let docNames = [];
    
    // docNames is an array of arrays > the last entries in each array are the doc names
    for(let docs of documentPaths){
        docNames.push(docs.split('/'));
    }

    for(let coll = 0; coll < collectionPaths.length; coll++){
        // Don't delete the first document > that's the domainstate
        if(coll != 0){
            db.collection(collectionPaths[coll]).doc((docNames[coll])[docNames[coll].length - 1]).delete().then(function() {
            });
        }
    }

    // Resetting the counter
    docRefCounter = 0;
}