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
    let values = [authoremailspan.value, authornamespan.value]
    if (values.includes('')) { alert('Please fill in all fields') }
    else (addauthor())
})

//Closing the modal
authorspan.onclick = function () {
    authormodal.style.display = "none";
}

function addauthor() {
    extractJSON(domainjson, 0, '');
    authorpath = findPath(collectionPaths, 'authors') + '/'
    db.collection(authorpath).add({
        email: authoremailspan.value,
        name: authornamespan.value,
        relationship: []
    }).then(
        console.log('author posted'),
        alert('Author added'),
        addactivity(userEmail, 'added author', 'noBP involved', getcurrentDateTime())
    )
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