// ########################
// Creates a modal for entering BPs and stores them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

// Use a timestamp as a unique document id
var uniqueDocID;
// The form to enter new BP information
const BPform = document.querySelector('#bp-entry-form');
// Use the JSON data model as an inital model to be altered
var alteredJSONstring = JSON.stringify(jsontest);


// ############################################


var modal = document.getElementsByClassName("bp-modal")[0];
var btn = document.getElementById("create-BP-btn");
// span elements closes the modal
var span = document.getElementsByClassName("close")[0];

// displaying the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// closing the modal
span.onclick = function() {
    modal.style.display = "none";
}

// closing anywhere outside the modal closes it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// This function has a callback
// First, the JSON string is altered with a unique documentid
document.getElementById("create-BP-btn").addEventListener("click", function(){

    alterJSON(function(){
        // Once the JSON string has been altered, fire this callback

        // Emptying these arrays prevents information from the initial JSON model to be present
        fieldsArr = [];
        collectionPaths = [];
        documentPaths = [];
        // Calling these function instantiates the correct path for each newly created document
        extractJSON(JSON.parse(alteredJSONstring), 0, '');
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
    
                            // Removing numbers from the string + capitalize first letter
                            var keyText = key.replace(/[0-9]/g, '');
                            var upperKey = keyText.charAt(0).toUpperCase() + keyText.substring(1);
    
                            label.textContent = upperKey;
                            input.textContent = value;
    
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
                            BPform.appendChild(label);
                            BPform.appendChild(br);
                            BPform.appendChild(input);
                            BPform.appendChild(br);
    
                        }
                    }
    
                })
            });
        });

    })
})

// Delay function specifies how long to wait on an async function
function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

async function alterJSON(callback){

    // Making sure the collectionPaths array is available
    extractJSON(jsontest, 0, '');
    // Giving a value to uniqueDoc idea the moment this function is called
    // Doing it any sooner leads to differences in value
    uniqueDocID = new Date().valueOf();

    // Remove all children from the BPform > prevents duplicate form features
    while (BPform.hasChildNodes()) {  
        BPform.removeChild(BPform.firstChild);
    }

    for(const coll of collectionPaths){
        //Getting all docs for which features should be displayed
        db.collection(coll)
        .where("1displayfeature", "==", "true")
        .get().then(snapshot => {
            for(const item of snapshot.docs){
                alteredJSONstring = alteredJSONstring.replace(item.id.toString(), uniqueDocID.toString());
            }
        })
    }
    // Await the delay before firing the callback
    await delay();
    callback();
};

document.getElementById("store-BP-btn").addEventListener("click", function(){

    var filledBPform = document.querySelector('#bp-entry-form');
    var JSONarray = [];
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
        // Arrays
        else{
            JSONarray.push('\"'+`${entryKey}`+'\": [\"'+`${filledBPform.elements[i].value}`+'\"]');
        }
    }

    // Constructing the JSONstring
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

});