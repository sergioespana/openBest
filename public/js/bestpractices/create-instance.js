// ########################
// Parses the JSON model uploaded by the user and instantiates the repository
// ########################

// Create firestore (database) object
var db = firebase.firestore();

var collectionPaths = [];
var documentPaths = [];
var fieldsArr = [];


// ############################################

var jsontest = {
    //collection
    "domain2": {
        //document
        "domainstate": {
            //fields
            "displayfeature": false,
            "model": "string",
            "name": "Test Domain",
            "administrator": "plomp1996@gmail.com",
            //collection
            "bestpractices": {
                //document
                "bpdocument": {
                    //fields
                    "01grouptitle": "Best practice",
                    "02groupdesc": "Enter basic best practice information here.",
                    "1displayfeature": true,
                    "2title": "string",
                    "3description": "text",
                    "4author": [{"name" : "Written by", "self": "document reference", "related": "document reference"},
                                {"name" : "Reviewed by", "self": "document reference", "related": "document reference"}],
                    "problems": [{"name" : "Solves", "self": "document reference", "related": "document reference"}],
                    "5categories":
                        ["string"],
                    "6date": "string",
                    "subcollectiontest": {
                        "testdocument":{
                            "01grouptitle": "Testing subcollections",
                            "02groupdesc": "Enter basic test information here.",
                            "1displayfeature": true,
                            "2name": "string",
                            "3description": "text",
                            "4testfield": "string"
                        }
                    },
                    //collection
                    "comments": {
                        "commentdocument": {
                            "displayfeature": false,
                            "comment": "string",
                            "date": "string",
                            "user": "document reference"
                        }
                    },
                    //collection
                    "ratings":{
                        "ratingdocument": {
                            "displayfeature": false,
                            //These categories can be changed by user creating the model
                            "scale": ["integer"],
                            "score": ["integer"],
                            "user": "document reference"
                        }
                    }
                }
            },
            //collection
            // must ALWAYS be called users and have an email field
            "users": {
                "userdocument": {
                    "1displayfeature": false,
                    "2email": "string",
                    "3name": "string",
                    "4role": "string"
                }
            },
            //collection
            "authors": {
                //document
                "authordocument": {
                    "1displayfeature": false,
                    "2contactinfo": "string",
                    "3internal": "boolean",
                    "4name": "string"
                }
            },
            //collection
            "problems": {
                "problemdocument": {
                    "01grouptitle": "Problem",
                    "02groupdesc": "What problem does this best practice solve?",
                    "1displayfeature": true,
                    "2name": "string",
                    "3description": "text",
                    "bestpractices": [{"name" : "Solved by", "self": "document reference", "related": "document reference"}],
                    "solutions": {
                        "solutiondocument": {
                            "01grouptitle": "Solution",
                            "02groupdesc": "What is the prescribed solution to the problem?",
                            "1displayfeature": true,
                            "2name": "string",
                            "3description": "text"
                        }
                    }
                }
            }
        }
    }
};


// Create a DB instance
if(document.getElementById("create-instance-btn")){
    document.getElementById("create-instance-btn").addEventListener("click", function(){
        // Emptying the collectionpaths and documentpaths
        // This function is called for each BP that is created, so we need updated collectionpaths each time
        collectionPaths = [];
        documentPaths = [];

        extractJSON(jsontest, 0, '');
        extractFields();
    })
};


// Instantiates the collectionPaths and documentPaths arrays
function extractJSON(obj, int, prev) {
    // looping over the elements in the json file
    for (const i in obj) {
        // checking if the element is an array or object
        if(Array.isArray(obj[i]) || !(typeof obj[i] === 'object')){
            // keys in the document
        }
        else {
            // an even position indicates a collection
            if(int%2 == 0){
                // the first element should not have a / in front
                if(int == 0){
                    var path = i;
                    collectionPaths.push(path);
                }
                else{
                    var path = prev + '/' + i;
                    collectionPaths.push(path);
                }
            }
            // uneven position indicates document
            else{
                var path = prev + '/' + i;
                fieldsArr.push(obj[i]);
                documentPaths.push(path);
            }
            // looping again for the next element
            extractJSON(obj[i], int+1, path);
        } 
    }
}


function extractFields() {
    // For every entry in fieldsArr (key-value pair in the JSON model), we want to get the key-value pairs and corresponding collection path
    for(var x = 0; x < fieldsArr.length; x++){
        // All fields related to this collection 
        var fields = Object.entries(fieldsArr[x]);
        // Array of the remaining fields (non-nested objects)
        var remaining = [];

        // Document info to be written to DB
        var docInfo = "";

        // For every key-value pair
        for (let [key, value] of fields) {
            // We don't want nested objects
            if(!(typeof value === 'object')) {
                var fieldsObject = ("\""+`${key}`+"\""+": "+"\""+`${value}`+"\"");
                remaining.push(fieldsObject);
            }
            // If the key-value pair indicates an array (which is an object type)
            else if(Array.isArray(value)){
                // If this array stores a map object (docref)
                if(typeof(value) == "object"){
                    let arrObject = ("\""+`${key}`+"\""+": "+`${JSON.stringify(value)}`);
                    remaining.push(arrObject);
                }
                // Other arrays
                else{
                    let arrObject = ("\""+`${key}`+"\""+": "+"[\""+`${value}`+"\"]");
                    remaining.push(arrObject);
                }
            }
        }

        // Creating the document set info
        remaining.forEach(element => {
            if(remaining[0] === element){
                docInfo += ("{"+element+",");
            }
            else if (remaining[remaining.length - 1] === element){
                docInfo += (element+"}");
            }
            else {
                docInfo += (element+",");
            }
        });

        var docPath = documentPaths[x];
        // Passing the doc info and collection path to writeDB to instantiate
        writeDB(collectionPaths[x], docInfo, docPath);
    }
}

// Writing to DB and then reloading the page
function writeDB(coll, doci, docp) {
    let JSONinfo = JSON.parse(doci);
    // Getting the name of the document related to the fields
    let x = docp.split("/");
    let docName = x[x.length - 1];

    // Page refreshed after write to DB if the domain has not been instantiated before
    writeCallback(coll, docName, JSONinfo, function() {
        if(domainInstantiated == false){
            location.reload();
        }
    })
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 800));
}


// Please note that any manually changed data will be overwritten by what's specified in the JSON model
async function writeCallback(coll, docName, JSONinfo, callback) {
    // Writing all documents to the database
    // >> This info is later also used in create-bp to instantiate featured
    // >> Info provided by user in create-bp will overwrite this info
    db.collection(coll).doc(docName).set(JSONinfo);

    let userPath = findPath(collectionPaths, 'user');

    // Only writing this info when the domain hasn't been instantiated yet
    if(domainInstantiated == false){
        db.collection(userPath).doc('d-user').set({'email': userEmail, 'name': userName, 'role': 'administrator'});
    }

    await delay();
    callback();
}