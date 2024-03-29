
// ########################
// Parses the JSON model uploaded by the user and instantiates the repository
// ########################

// Create firestore (database) object
var db = firebase.firestore();

var collectionPaths = [];
var documentPaths = [];
var fieldsArr = [];

// ############################################
// The functions from this class would ideally be used in dsl.js. However, this also requires making sure that every page has access to the jsonmodel, instead of the static jsontest defined here.

// This variable will be overwritten when a model is created in the dsl class / model creation modal
var jsontest_ = {
     //collection
     "RCIS": {
        //document
        "domainstate": {
            //fields
            "displayfeature": false,
            "model": "string",
            "name": "RCIS environment",
            "administrator": "stefanvanderpijl@gmail.com",
            //collection
            "bestpractices": {
                //document
                "bpdocument": {
                    //fields
                    "01grouptitle": "Best practice",
                    "02groupdesc": "Introduce the best practice briefly. Also describe what the solution is.",
                    "1displayfeature": true,
                    "10title": "string",
                    "11question": "string",
                    "12major dimension": "string",
                    "13sub dimension": "string",
                    "14date": "string",
                    "15front image": "string",
                    "16front image licence": "string",
                    "17author": [{
                        "name": "Written by",
                        "self": "document reference",
                        "related": "document reference"
                    }],
                    
                    "18description": "text",
                    "19figure one": "string",
                    "20figure one caption": "string",
                    "21figure two": "string",
                    "22figure two caption": "string",
                

                    //collection
                    "comments": {
                        "commentdocument": {
                            "displayfeature": false,
                            "author": "string",
                            "date": "string",
                            "email": "string",
                            "img": "string",
                            "level": "int",
                            "parent": "string",
                            "text": "string"
                        }
                    },
                    //collection
                    "ratings": {
                        "ratingdocument": {
                            "01grouptitle": "Ratings",
                            "02groupdesc": "Describe the dimension (category) on which the best practice can be rated",
                            "2ratingtype": ["stars"],
                            "3dimension": ["Overall"],
                            "4dimension description": ["Overall quality"],
                            "5scale": [5],
                            "6stepsize": [1]
                        }
                    },

                }
            },
            //collection
            // must ALWAYS be called users and have an email field
            "users": {
                "userdocument": {
                    "1displayfeature": false,
                    "2email": "string",
                    "3name": "string",
                    "4role": "string",
                    "5hasaccesed":"string"
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
            "activitylogs": {
                //document
                "activitylog": {
                    "1displayfeature": false,
                    "2user": "string",
                    "3action": "boolean",
                    "4bpid": "string",
                    "5date": "string"
                }
            },
        }
    }
};




// Create a DB instance
if (document.getElementById("create-instance-btn")) {
    document.getElementById("create-instance-btn").addEventListener("click", function () {
        // Emptying the collectionpaths and documentpaths
        // This function is called for each BP that is created, so we need updated collectionpaths each time
        collectionPaths = [];
        documentPaths = [];
        // remove this after dev
        if (JSONmodel) {
            jsontest_ = JSONmodel;
        }
        console.log(jsontest_);
        extractJSON(jsontest_, 0, '');
        extractFields_();
        writeModel();

    })
};

function extractFields_() {
    // For every entry in fieldsArr (key-value pair in the JSON model), we want to get the key-value pairs and corresponding collection path
    for (var x = 0; x < fieldsArr.length; x++) {
        // All fields related to this collection 
        var fields = Object.entries(fieldsArr[x]);
        // Array of the remaining fields (non-nested objects)
        var remaining = [];

        // Document info to be written to DB
        var docInfo = "";

        // For every key-value pair
        for (let [key, value] of fields) {
            // We don't want nested objects
            if (!(typeof value === 'object')) {
                var fieldsObject = ("\"" + `${key}` + "\"" + ": " + "\"" + `${value}` + "\"");
                remaining.push(fieldsObject);
            }
            // If the key-value pair indicates an array (which is an object type)
            else if (Array.isArray(value)) {
                // If this array stores a map object (docref)
                if (typeof (value) == "object") {
                    let arrObject = ("\"" + `${key}` + "\"" + ": " + `${JSON.stringify(value)}`);
                    remaining.push(arrObject);
                }
                // Other arrays
                else {
                    let arrObject = ("\"" + `${key}` + "\"" + ": " + "[\"" + `${value}` + "\"]");
                    remaining.push(arrObject);
                }
            }
        }

        // Creating the document set info
        remaining.forEach(element => {
            if (remaining[0] === element) {
                docInfo += ("{" + element + ",");
            }
            else if (remaining[remaining.length - 1] === element) {
                docInfo += (element + "}");
            }
            else {
                docInfo += (element + ",");
            }
        });

        var docPath = documentPaths[x];
        // Passing the doc info and collection path to writeDB to instantiate
        if (docPath) {
            writeDB_(collectionPaths[x], docInfo, docPath);
        }
    }
}

// Writing to DB and then reloading the page
function writeDB_(coll, doci, docp) {
    let JSONinfo = JSON.parse(doci);
    // Getting the name of the document related to the fields
    let x = docp.split("/");
    let docName = x[x.length - 1];

    // Page refreshed after write to DB if the domain has not been instantiated before
    writeCallback_(coll, docName, JSONinfo, function () {
        if (domainInstantiated == false) {
            location.reload();
        }
    })
}

// Please note that any manually changed data will be overwritten by what's specified in the JSON model
async function writeCallback_(coll, docName, JSONinfo, callback) {
    // Writing all documents to the database
    // >> This info is later also used in create-bp to instantiate featured
    // >> Info provided by user in create-bp will overwrite this info

    db.collection(coll).doc(docName).set(JSONinfo);

    let userPath = findPath(collectionPaths, 'user');
    // Only writing this info when the domain hasn't been instantiated yet
    if (domainInstantiated == false) {
        db.collection(userPath).doc('d-user').set({ 'email': userEmail, 'name': userName, 'role': 'administrator' });
    }
    await delay();
    callback();
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 800));
}

async function writeModel() {
    let domain = documentPaths[0].split("/")[0]
    let domainstate = documentPaths[0].split("/")[1]
    await db.collection(domain).doc(domainstate).update({
        model: jsontest_
    });
}

//

// Instantiates the collectionPaths and documentPaths arrays
function extractJSON(obj, int, prev) {
    // looping over the elements in the json file
    for (const i in obj) {
        // checking if the element is an array or object
        if (Array.isArray(obj[i]) || !(typeof obj[i] === 'object')) {
            // keys in the document
        }
        else {
            // an even position indicates a collection
            if (int % 2 == 0) {
                // the first element should not have a / in front
                if (int == 0) {
                    var path = i;
                    collectionPaths.push(path);
                }
                else {
                    var path = prev + '/' + i;
                    collectionPaths.push(path);
                }
            }
            // uneven position indicates document
            else {
                var path = prev + '/' + i;
                fieldsArr.push(obj[i]);
                documentPaths.push(path);
            }
            // looping again for the next element
            extractJSON(obj[i], int + 1, path);
        }
    }
}


function extractFields() {
    // For every entry in fieldsArr (key-value pair in the JSON model), we want to get the key-value pairs and corresponding collection path
    for (var x = 0; x < fieldsArr.length; x++) {
        // All fields related to this collection 
        var fields = Object.entries(fieldsArr[x]);
        // Array of the remaining fields (non-nested objects)
        var remaining = [];

        // Document info to be written to DB
        var docInfo = "";

        // For every key-value pair
        for (let [key, value] of fields) {
            // We don't want nested objects
            if (!(typeof value === 'object')) {
                var fieldsObject = ("\"" + `${key}` + "\"" + ": " + "\"" + `${value}` + "\"");
                remaining.push(fieldsObject);
            }
            // If the key-value pair indicates an array (which is an object type)
            else if (Array.isArray(value)) {
                // If this array stores a map object (docref)
                if (typeof (value) == "object") {
                    let arrObject = ("\"" + `${key}` + "\"" + ": " + `${JSON.stringify(value)}`);
                    remaining.push(arrObject);
                }
                // Other arrays
                else {
                    let arrObject = ("\"" + `${key}` + "\"" + ": " + "[\"" + `${value}` + "\"]");
                    remaining.push(arrObject);
                }
            }
        }

        // Creating the document set info
        remaining.forEach(element => {
            if (remaining[0] === element) {
                docInfo += ("{" + element + ",");
            }
            else if (remaining[remaining.length - 1] === element) {
                docInfo += (element + "}");
            }
            else {
                docInfo += (element + ",");
            }
        });

        var docPath = documentPaths[x];
        // Passing the doc info and collection path to writeDB to instantiate
        if (docPath) {
            writeDB(collectionPaths[x], docInfo, docPath);
        }
    }
}

// Writing to DB and then reloading the page
function writeDB(coll, doci, docp) {
    let JSONinfo = JSON.parse(doci);
    // Getting the name of the document related to the fields
    let x = docp.split("/");
    let docName = x[x.length - 1];

    // Page refreshed after write to DB if the domain has not been instantiated before
    writeCallback(coll, docName, JSONinfo, function () {
        if (domainInstantiated == false) {
            location.reload();
        }
    })
}


// Please note that any manually changed data will be overwritten by what's specified in the JSON model
async function writeCallback(coll, docName, JSONinfo, callback) {
    // Writing all documents to the database
    // >> This info is later also used in create-bp to instantiate featured
    // >> Info provided by user in create-bp will overwrite this info

    if (!(docName == 'domainstate' || docName == 'activitylog' || docName == 'authordocument' || docName == 'commentdocument' || docName == 'ratingdocument' || docName == 'userdocument')) {
        db.collection(coll).doc(docName).set(JSONinfo);
    }
    let userPath = findPath(collectionPaths, 'user');
    // Only writing this info when the domain hasn't been instantiated yet
    if (domainInstantiated == false) {
        db.collection(userPath).doc('d-user').set({ 'email': userEmail, 'name': userName, 'role': 'administrator' });
    }
    await delay();
    callback();
}