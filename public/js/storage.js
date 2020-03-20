// Create firestore (database) object
var db = firebase.firestore();


const bpList = document.querySelector('#test-list');


// Display the BPs in a list
function renderBPlist(doc) {
    // Create page elements
    let li = document.createElement('li');
    let title = document.createElement('span');
    let description = document.createElement('span');

    // Setting the document's id as an attribute to the li tag
    li.setAttribute('data-id', doc.id);

    title.textContent = doc.data().title;
    description.textContent = doc.data().description;

    li.appendChild(title);
    li.appendChild(description);

    bpList.appendChild(li);
}


// Query test
function queryTest() {

    //Getting all best practices that have the Workers category

    db.collection("sustainability/sustainability-state/bestpractices")
        .where("categories", "array-contains", "Workers")
        .get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                // Logging the titles of matching BPs
                console.log(doc.data().title)

                // Displaying all BP info in a list
                renderBPlist(doc);
            })
        })

}