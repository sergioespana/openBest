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
    "domain": {
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
                    "1displayfeature": true,
                    "2title": "string",
                    "3description": "string",
                    "4author": "document reference",
                    "5categories":
                        ["string"],
                    "6date": "string",
                    "7problems":
                        ["document reference"],
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
                    "displayfeature": false,
                    "email": "string",
                    "name": "string",
                    "role": "string"
                }
            },
            //collection
            "authors": {
                //document
                "authordocument": {
                    "displayfeature": false,
                    "contactinfo": "string",
                    "internal": "boolean",
                    "name": "string"
                }
            },
            //collection
            "solutions": {
                "solutiondocument": {
                    "displayfeature": false,
                    "name": "string",
                    "description": "string"
                }
            },
            //collection
            "problems": {
                "problemdocument": {
                    "displayfeature": false,
                    "name": "string",
                    "description": "string"
                }
            }
        }
    }
};


// Create a DB instance
document.getElementById("create-instance-btn").addEventListener("click", function(){
    // Emptying the collectionpaths and documentpaths
    // This function is called for each BP that is created, so we need updated collectionpaths each time
    collectionPaths = [];
    documentPaths = [];

    extractJSON(jsontest, 0, '');
    extractFields();
});



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
    // For every entry in fieldsArr, we want to get the key-value pairs and corresponding collection path
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
                var arrObject = ("\""+`${key}`+"\""+": "+"[\""+`${value}`+"\"]");
                remaining.push(arrObject);
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

function writeDB(coll, doci, docp) {
    var JSONinfo = JSON.parse(doci);
    // Getting the name of the document related to the fields
    var x = docp.split("/");
    var docName = x[x.length - 1];

    db.collection(coll).doc(docName).set(JSONinfo);
}