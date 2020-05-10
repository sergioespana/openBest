// ########################
// Views the clicked best practice
// ########################

// Create firestore (database) object
var db = firebase.firestore();

var modal = document.getElementsByClassName("bp-view-modal")[0];
var span = document.getElementsByClassName("close")[0];

// ############################################



function tableClick(e) {
    let clickedRow = e.target.parentElement;
    let BPid = clickedRow.getAttribute('doc-id');

    modal.style.display = "block";
    retrieveBPinfo(BPid);
}


function retrieveBPinfo(BPid) {
    // bpPath is the collection path to the bestpractices sub-collection
    let bpPath = findPath(collectionPaths, 'bestpractices');

    let bpModal = document.getElementById("bp-other-sections");

    // PART 1: finding the subcollections that have documents with this document id
    // Those are the docs for which info has been stored

    // collectionPaths stores each collection path according to the JSON model
    collectionPaths.forEach(coll => {
        db.collection(coll)
        .where(firebase.firestore.FieldPath.documentId(), "==", BPid)
        .get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                // Displaying the info from all documents, except in the bestpractices or authors subcollection
                // This docinfo will already be displayed in PART 2
                if(doc.ref.parent.id != 'bestpractices' && doc.ref.parent.id != 'authors'){
                    for(let [key, value] of Object.entries(doc.data())){
                        // We don't want information from the following keys
                        if(key != '01grouptitle' && key != '02groupdesc' && key != '1displayfeature' && key != 'created'){
                            if(key.replace(/[ˆ0-9]+/g, '') == 'name'){
                                // Create the title for this section
                                let sectionTitle = document.createElement('h6');
                                sectionTitle.setAttribute('class', 'text-success font-weight-bold text-uppercase');
                                sectionTitle.style.marginTop = '30px';
                                sectionTitle.innerText = value;
                                bpModal.appendChild(sectionTitle);
                            }
                            else{
                                // Create the text area for this section
                                let sectionContent = document.createElement('p');
                                sectionContent.innerText = value;
                                bpModal.appendChild(sectionContent);
                            }
                        }
                    }
                }
            })
        })
    })

    // PART 2: displaying general best practice info 
    db.collection(`${bpPath}`)
        .where(firebase.firestore.FieldPath.documentId(), "==", `${BPid}`)
        .get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                
                let BPtitle = document.getElementById("bp-title");
                // indexArr is instantiated in bp-retrieval when dataTable is initially loaded
                let title = indexArr[0];
                BPtitle.innerText = `${doc.data()[Object.keys(doc.data())[title]]}`;

                let BPdescription = document.getElementById("bp-description");
                let description = indexArr[1];
                BPdescription.innerText = `${doc.data()[Object.keys(doc.data())[description]]}`;

                let categoryArea = document.getElementById("bp-categories");
                let authorArea = document.getElementById("bp-authors");
                let dateArea = document.getElementById("bp-date");

                // Iterating over the document data and displaying general info
                for(let [key, value] of Object.entries(doc.data())){
                    
                    // Displaying authors
                    if(key.replace(/[ˆ0-9]+/g, '') == 'author'){

                        // Authors are always document references
                        let authorPath = findPath(collectionPaths, 'author');

                        // value is an array of id's
                        value.forEach(docref => {
                            db.collection(authorPath)
                            .doc(docref.id).get().then(function(doc) {
                                // Displaying each author 
                                let authorButton = document.createElement('a');
                                authorButton.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-user\"></i></span\><span class=\"text\">"+`${doc.data().name}`+"</span\>"
                                authorButton.setAttribute('class', 'btn btn-light btn-icon-split')
                                authorArea.appendChild(authorButton);
                            });
                        });
                    }

                    // Displaying categories
                    if(key.replace(/[ˆ0-9]+/g, '') == 'categories'){
                        // Populating the general info section (authors, date, categories)
                        value.forEach(element => {
                        let categoryButton = document.createElement('a');
                        categoryButton.innerHTML = "<span class=\"text\">"+`${element}`+"</span\>"
                        categoryButton.setAttribute('class', 'btn btn-light btn-icon-split')
                        categoryArea.appendChild(categoryButton);
                        });
                    }

                    // Displaying date
                    if(key.replace(/[ˆ0-9]+/g, '') == 'date'){
                        // Populating the general info section (authors, date, categories)
                        let dateButton = document.createElement('a');
                        dateButton.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-calendar-alt\"></i></span\><span class=\"text\">"+`${value}`+"</span\>"
                        dateButton.setAttribute('class', 'btn btn-light btn-icon-split')
                        dateArea.appendChild(dateButton);
                    }
                }
            })
        })
}


span.onclick = function() {
    modal.style.display = "none";

    let categoryArea = document.getElementById("bp-categories");
    let authorArea = document.getElementById("bp-authors");
    let dateArea = document.getElementById("bp-date");
    let otherSections = document.getElementById("bp-other-sections");
    // Removing previously existing categories, authors and dates
    while (categoryArea.hasChildNodes()) {  
        categoryArea.removeChild(categoryArea.firstChild);
    }
    while (authorArea.hasChildNodes()) {  
        authorArea.removeChild(authorArea.firstChild);
    }
    while (dateArea.hasChildNodes()) {  
        dateArea.removeChild(dateArea.firstChild);
    }
    while (otherSections.hasChildNodes()) {  
        otherSections.removeChild(otherSections.firstChild);
    }
}