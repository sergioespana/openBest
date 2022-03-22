// ########################
// Creates a modal for entering authors and storing them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

const authorform = document.querySelector('#author-entry-form');

let authorpath

// The modal and button to display it
var authormodal = document.getElementById("author-modal");
var authorbtn = document.getElementById("add-author-btn");
// Span elements closes the modal
var authorspan = document.getElementById("author-close");
// name
let authornamespan = document.getElementById("input-author-name");
// email
let authoremailspan = document.getElementById("input-author-email");

// ############################################


//displaying the modal
if (authorbtn) {
    authorbtn.onclick = function () {
        authormodal.style.display = "block";
    }
}

document.getElementById("store-author-btn").addEventListener("click", function () {
    if (authornamespan.value == '') { alert('Please fill in an authorname'); }
    else (addauthor())
})

//Closing the modal
authorspan.onclick = function () {
    authormodal.style.display = "none";
}

async function addauthor() {
    extractJSON(domainjson, 0, '');
    authorpath = findPath(collectionPaths, 'authors') + '/'
    await db.collection(authorpath).where('email','==', emailspan.value.toLowerCase()).get().then(snapshot => {
        amt = snapshot.size;
     })
    
    if (amt == 0){
    db.collection(authorpath).add({
        email: authoremailspan.value.toLowerCase(),
        name: authornamespan.value,
        relationship: []
    }).then(function(){
        console.log('author posted');
        alert('Author added');
        addactivity(userEmail, userRole, 'add author', 'author', 'not recorded', getcurrentDateTime());
    })}
    else{
        alert('There is already an author associated with that emailadress');
    }
}


async function findAuthor(authorname) {
    let doelstring = domainstate + 'authors' + '/';
    let author = null;
    await db.collection(doelstring).where("name", '==', authorname).get().then(docRef => {
        if (docRef.docs.length >= 1) {
            author = docRef.docs[0].id;
        }
        else {
            author = 'none found';
        }
    })
    return author
}