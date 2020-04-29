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
                fillbars(BPid);
                startup(BPid);

            })
        })
}

span.onclick = function() {
    modal.style.display = "none";
    //comment stuffffff
    remove_comment_elements();
    remove_top_searchbar();
    amountOfComments = 0;
}






































