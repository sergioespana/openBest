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
    startup(BPid);
    //testlist = [["stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"],["stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"],["stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"],["stars","Ease of use",5,"input",1,1,"this dimension describes blablabla a high score indicates blablabla"]];
    //loc1  = document.getElementById("ratinginput");
    getratings(BPid);
    //console.log(dimensioninfo);
    //createRatingInput(loc1,BPid,dimensioninfo);
}


async function retrieveBPinfo(BPid) {
    // bpPath is the collection path to the bestpractices sub-collection
    let bpPath = findPath(collectionPaths, 'bestpractices');

    let bpCore = document.getElementById("bp-core-content");
    let bpOther = document.getElementById("bp-other-sections");

    // PART 1: displaying all contents for this best practice
    // Looking at the docrefs stored

    let BPdoc = await db.collection(bpPath).doc(BPid).get();
    for(let [key, value] of Object.entries(BPdoc.data())){
        let keyText = key.replace(/[0-9]/g, '');

        // The values for the following keys are irrelevant because they are always present in each BP and therefore queries later on
        if(keyText != 'title' && keyText != 'description' && keyText != 'author' & keyText != 'categories' && keyText != 'date' && keyText != 'created'){
            // Three options for attributes:
            // ## Docrefs
            // ## Text
            // ## String

            // String or text
            if(typeof(value) != 'object'){
                // Adding the attribute value as regular text
                let p = document.createElement('p');
                p.innerText = value;
                p.style.marginTop = '30px';
                bpCore.appendChild(p);
            }
            // Docref
            else{
                // Create a div in which content related to this document will be placed
                let contentDiv = document.createElement('div');
                contentDiv.style.borderStyle = "solid";
                contentDiv.style.borderColor = "#f8f9fc";
                contentDiv.style.padding = "20px";
                contentDiv.style.marginTop = "30px";
                bpOther.appendChild(contentDiv);

                let refDoc = await db.collection(value.parent.path).doc(value.id).get();
                for(let [refKey, refValue] of Object.entries(refDoc.data())){

                    // Displaying the title
                    if(refKey.replace(/[0-9]/g, '') == 'name'){
                        //Create the title for this section
                        let sectionTitle = document.createElement('h6');
                        sectionTitle.setAttribute('class', 'text-success font-weight-bold text-uppercase');
                        //sectionTitle.style.marginTop = '30px';
                        sectionTitle.innerText = refValue;
                        contentDiv.appendChild(sectionTitle);
                    }
                    else if(refKey != 'created'){
                        let p = document.createElement('p');
                        p.innerText = refValue;
                        p.style.marginTop = '15px';
                        contentDiv.appendChild(p);
                    }
                }

                // Calling this function to retrieve data for nested subcollections
                retrieveSub(refDoc.id, refDoc.ref.parent.path);
            }
            
        }
    }

    // PART 2: displaying general best practice info 
    // Categories, authors, date, etc

    let bpDoc = await db.collection(`${bpPath}`).where(firebase.firestore.FieldPath.documentId(), "==", `${BPid}`).get();
    for(doc of bpDoc.docs){
                
        let BPtitle = document.getElementById("bp-title");
        // indexArr is instantiated in bp-retrieval when dataTable is initially loaded
        let title = indexArr[0];
        BPtitle.innerText = `${doc.data()[Object.keys(doc.data())[title]]}`;

        let BPdescription = document.getElementById("bp-description");
        let description = indexArr[1];
        BPdescription.innerText = `${doc.data()[Object.keys(doc.data())[description]]}`;

        let categoryArea = document.getElementById("bp-categories");
        let dateArea = document.getElementById("bp-date");

        // Iterating over the document data and displaying general info
        for(let [key, value] of Object.entries(doc.data())){
            
            // Displaying authors
            if(key.replace(/[ˆ0-9]+/g, '') == 'author'){

                for(let rel = 0; rel < value.length; rel++){

                    // The row in which author info should be appended
                    let authorRow = document.getElementsByClassName('authors-info');

                    // If the authorRow already has a row for the current relationship name
                    if($(authorRow).find(`[relname='${value[rel].name}']`).length != 0){
                        let addDiv = $(authorRow).find(`[relname='${value[rel].name}']`).find('.col-sm-10');

                        // Retrieving the doc that is stored in the docref
                        let authorDoc = await db.collection(value[rel].related.parent.path).doc(value[rel].related.id).get();
                        for(let [key, value] of Object.entries(authorDoc.data())){
                            if(key == 'name'){
                                let authorName = document.createElement('a');
                                authorName.style.marginRight = "5px";
                                authorName.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-user\"></i></span\><span class=\"text\">"+value+"</span\>";
                                authorName.setAttribute('class', 'btn btn-light btn-icon-split');

                                $(addDiv).append(authorName);
                            }
                        }
                    }
                    // If no authors have been added for this relationship type yet, add a new row
                    else{
                        let relNameRow = document.createElement('div');
                        relNameRow.setAttribute('class', 'row general-info');
                        relNameRow.setAttribute('relname', value[rel].name);
                        let relNameDiv = document.createElement('div');
                        relNameDiv.setAttribute('class', 'col-sm-2');
                        let authorNameDiv = document.createElement('div');
                        authorNameDiv.setAttribute('class', 'col-sm-10');

                        let relName = document.createElement('p');
                        relName.style.display = "inline";
                        relName.textContent = value[rel].name;
                        $(relNameDiv).append(relName);

                        let authorDoc = await db.collection(value[rel].related.parent.path).doc(value[rel].related.id).get();
                        for(let [key, value] of Object.entries(authorDoc.data())){
                            if(key == 'name'){
                                let authorName = document.createElement('a');
                                authorName.style.marginRight = "5px";
                                authorName.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-user\"></i></span\><span class=\"text\">"+value+"</span\>";
                                authorName.setAttribute('class', 'btn btn-light btn-icon-split');

                                $(authorNameDiv).append(authorName);
                            }
                        }

                        $(relNameRow).append(relNameDiv);
                        $(relNameRow).append(authorNameDiv);
                        $(authorRow).append(relNameRow);
                    }
                }
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
    }
}

async function retrieveSub(refDocId, refDocPath){
    const getSubCollections = firebase
        .functions()
        .httpsCallable('getSubCollections');

      getSubCollections({ docPath: `${refDocPath}`+'/'+`${refDocId}` })
        .then(function(result) {
          var collections = result.data.collections;
          console.log(collections);
        })
        .catch(function(error) {
          // Getting the Error details.
          var code = error.code;
          var message = error.message;
          var details = error.details;
          // ...
        });
}

span.onclick = function() {
    modal.style.display = "none";
    //remove comment and rating elements
    remove_comment_elements();
    remove_top_searchbar();
    //reset lists and counters
    commentlist = [];
    ratinglist  = [];
    ratinginfo  = [];
    amountOfComments = 0;
    ///////////////////////////////////

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
