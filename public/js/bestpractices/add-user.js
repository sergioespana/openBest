// ########################
// Creates a modal for entering users and storing them
// ########################

// Create firestore (database) object
var db = firebase.firestore();

const Userform = document.querySelector('#user-entry-form');

let userpath

// The modal and button to display it
var usermodal = document.getElementById("user-modal");
var userbtn = document.getElementById("add-user-btn");
// Span elements closes the modal
var userspan = document.getElementById("user-close");
// name
let namespan = document.getElementById("input-user-name");
// email
let emailspan = document.getElementById("input-user-email");
// role
let rolespan = document.getElementById("role");
// choice (also create author account for user..)
let choicespan = document.getElementById("makeauthor");


// ############################################

    



// displaying the modal
if (userbtn) {
    userbtn.onclick = function () {
        usermodal.style.display = "block";
    }
}

document.getElementById("store-user-btn").addEventListener("click",async function () {
    let values = [emailspan.value, namespan.value, rolespan.value]
    if (values.includes('')){alert('Please fill in all fields')}
    else{
        addUser()
        if (choicespan = "affirmative"){
            addauthor_()
        }
        
    }
})

// Closing the modal
userspan.onclick = function () {
    usermodal.style.display = "none";
}

function addUser(){
    extractJSON(domainjson, 0, '');
    userpath = findPath(collectionPaths, 'users') + '/'
    console.log(userpath)
    db.collection(userpath).add({
        email: emailspan.value,
        name: namespan.value,
        role: rolespan.value
    }).then(
       console.log('user posted'),
       alert('User added'),
       addactivity(userEmail, 'added user', 'noBP involved', getcurrentDateTime())
    )
}

function addauthor_(){
    extractJSON(domainjson, 0, '');
    authorpath = findPath(collectionPaths, 'authors') + '/'
    db.collection(authorpath).add({
        email: emailspan.value,
        name: namespan.value,
        relationship: []
    }).then(
       console.log('author posted'),
       alert('Author added'),
       addactivity(userEmail, 'added author', 'noBP involved', getcurrentDateTime())
    )
}


