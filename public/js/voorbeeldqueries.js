// Create firestore (database) object
var db = firebase.firestore();

// Store data
function storeData() {
    db.collection("testpractice").add({
        title: "test1",
        author: "Milo",
        author: "Sergio"
    })
}


// Query test
function queryTest() {

    // Getting a reference to all documents in the comment sub-collection for bp1
    db.collection("sustainability/sustainability-state/bestpractices/bp1/comments")
        .get().then((snapshot) => {
            // Each document that matches the query is cycled through
            snapshot.docs.forEach(doc => {
                var user = doc.data().user
                getUser(user);
            })
    })

    db.collection("sustainability/sustainability-state/bestpractices")
        // Getting all document in the best practices collection that have a category called Workers
        .where("categories", "array-contains", "Workers")
        .get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                // RESULT: A Good Best Practice
                console.log(doc.data().title)
            })
        })

}

function getUser(user) {
    // The user object stores the path to the user
    var userPath = (user.path)

    // Getting a reference to all document in the bestpractices collection
    db.doc(`${userPath}`).get().then((snapshot) => {
        //RESULT: Milo
        console.log(snapshot.data().name)
    })

}



const BPrecords = document.querySelector('#BPrecords');


// Display the BPs in a list
function renderBPlist(doc) {
    // Create page elements
    let tr = document.createElement('tr');
    let title = document.createElement('td');
    let description = document.createElement('td');
    let date = document.createElement('td');

    // Setting the document's id as an attribute to the tr tag
    tr.setAttribute('data-id', doc.id);

    title.textContent = doc.data().title;
    description.textContent = doc.data().description;
    date.textContent = doc.data().date;

    tr.appendChild(title);
    tr.appendChild(description);
    tr.appendChild(date)

    BPrecords.appendChild(tr);
}