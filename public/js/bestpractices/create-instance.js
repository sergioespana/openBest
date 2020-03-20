// Create firestore (database) object
var db = firebase.firestore();

var collections = [];


var jsontest = {
    "testdomain": {
        "model": "this is a model",
        "bestpractices": {
            
        },
        "users": {

        },
        "solutions": {

        },
        "problems": {

        }
    }
};


// Create a DB instance
document.getElementById("create-instance-btn").addEventListener("click", function(){
    extractJSON(jsontest);
});

function extractJSON(obj) {
    for (const i in obj) {
        // For every element in jsontest, we check if it's an array or object
        if(Array.isArray(obj[i]) || typeof obj[i] === 'object') {
            console.log(i);
            console.log(obj[i]);
            extractJSON(obj[i]);
        } else {
            console.log(obj[i]);
        }
    }
}