// ########################
// Views the clicked best practice
// ########################

// Create firestore (database) object
var db = firebase.firestore();

var modal = document.getElementsByClassName("bp-view-modal")[0];
var span = document.getElementsByClassName("close")[0];

// Arrays that store the checked docrefs to prevent recursive checks
var checkedDR  = [];
var checkedSC  = [];
var checkedREL = [];

// ############################################

function tableClick(e) {
    let clickedRow = e.target.parentElement;
    let BPid = clickedRow.getAttribute('doc-id');
    modal.style.display = "block";
    retrieveBPinfo(BPid);
    startup(BPid);
    startupRatings(BPid);
}


async function retrieveBPinfo(BPid) {
    // bpPath is the collection path to the bestpractices sub-collection
    let bpPath = findPath(collectionPaths, 'bestpractices');

    // Adding this path to checkedSC to prevent checking the bpdocument again as part of a docref
    checkedSC.push(bpPath);

    // PART 1: displaying general best practice info 
    // Categories, authors, date, etc

    let bpDoc = await db.collection(`${bpPath}`).where(firebase.firestore.FieldPath.documentId(), "==", `${BPid}`).get();
    for(doc of bpDoc.docs){
                
        let BPtitle       = document.getElementById("bp-title");
        // indexArr is instantiated in bp-retrieval when dataTable is initially loaded
        let title         = indexArr[0];
        BPtitle.innerText = `${doc.data()[Object.keys(doc.data())[title]]}`;

        let BPdescription       = document.getElementById("bp-description");
        let description         = indexArr[3];
        BPdescription.innerText = `${doc.data()[Object.keys(doc.data())[description]]}`;

        let categoryArea = document.getElementById("bp-categories");
        let dateArea     = document.getElementById("bp-date");
         //ADDED//
        let imageArea    = document.getElementById("bp-image");
        imageArea.style.marginLeft = "auto";
        imageArea.style.marginRight = "auto";

        let audienceArea = document.getElementById("bp-audience");
        let effortArea = document.getElementById("bp-effort");
        let timeFrameArea = document.getElementById("bp-timeframe");

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
                categoryButton.innerHTML = "<span class=\"text\">"+`${element}`+"</span\>";
                categoryButton.setAttribute('class', 'btn btn-light btn-icon-split');
                categoryArea.appendChild(categoryButton);
                });
            }

            // Displaying date
            if(key.replace(/[ˆ0-9]+/g, '') == 'date'){
                // Populating the general info section (authors, date, categories)
                let dateButton = document.createElement('a');
                dateButton.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-calendar-alt\"></i></span\><span class=\"text\">"+`${value}`+"</span\>";
                dateButton.setAttribute('class', 'btn btn-light btn-icon-split');
                dateArea.appendChild(dateButton);
            }
            //ADDED//
              // Displaying image
              if(key.replace(/[ˆ0-9]+/g, '') == 'image'){
                // Populating the general info section 
                let picture = document.createElement("img");
                picture.src = value;
                picture.style.width = 'calc(100%)';
                imageArea.appendChild(picture);
               
            }  
             //ADDED FOR ECG//
             if(key.replace(/[ˆ0-9]+/g, '') == 'audience'){
                let audienceButton = document.createElement('a');
                audienceButton.innerHTML = "<span class=\"text\">"+`${value}`+"</span\>";
                audienceButton.setAttribute('class', 'btn btn-light btn-icon-split');
                audienceArea.appendChild(audienceButton);
                
            }

            if(key.replace(/[ˆ0-9]+/g, '') == 'effort'){
                let effortButton = document.createElement('a');
                effortButton.innerHTML = "<span class=\"text\">"+`${value}`+"</span\>";
                effortButton.setAttribute('class', 'btn btn-light btn-icon-split');
                effortArea.appendChild(effortButton);
                
            }

            if(key.replace(/[ˆ0-9]+/g, '') == 'timeframe'){
                let timeframeButton = document.createElement('a');
                timeframeButton.innerHTML = "<span class=\"text\">"+`${value}`+"</span\>";
                timeframeButton.setAttribute('class', 'btn btn-light btn-icon-split');
                timeFrameArea.appendChild(timeframeButton);
                
            }

        }
    }

    // The div in which BP content should be placed
    let bpCore = document.getElementById("bp-core-content");
     
    retrieveDocInfo(bpPath, BPid, bpCore);
}


// Retrieving info for the documents linked to this best practice
async function retrieveDocInfo(docPath, docId, div){

    let bpOther = document.getElementById("bp-other-sections");

    // PART 1: displaying all text contents for this document
    let currentDoc = await db.collection(docPath).doc(docId).get();
    for(let [key, value] of Object.entries(currentDoc.data())){
        let keyText = key.replace(/[0-9]/g, '');

        // The values for the following keys are irrelevant because they are always present in each BP and therefore queried elsewhere
        if(keyText != 'title' && keyText != 'author' && keyText != 'categories' && keyText != 'date' && keyText != 'created' && keyText != 'image' && keyText != "ECGTheme" && keyText !='audience' && keyText !='timeframe' && keyText !='effort'){
            if((docPath.split('/')[docPath.split('/').length - 1]) != "bestpractices"){
                // String or text
                if(typeof(value) != 'object'){
                    // Title
                    if(keyText == 'name' || keyText == 'title'){
                        let colTitle = document.createElement('h6');
                        colTitle.setAttribute('class', 'text-gray-400 font-weight-bold text-uppercase');
                        colTitle.style.fontSize = '12px';
                        colTitle.innerText = (docPath.split('/')[docPath.split('/').length - 1]);
                        div.appendChild(colTitle);

                        // This document is in a subcollection
                        if(docPath.split('/').length > 3){
                            //Create the title for this section
                            let sectionTitle = document.createElement('h6');
                            sectionTitle.setAttribute('class', 'text-gray-600 font-weight-bold text-uppercase');
                            sectionTitle.style.fontSize = '1rem';
                            sectionTitle.innerText = value;
                            div.style.marginTop = '15px'
                            div.appendChild(sectionTitle);
                        }
                        else{
                            //Create the title for this section
                            let sectionTitle = document.createElement('h6');
                            sectionTitle.setAttribute('class', 'text-success font-weight-bold text-uppercase');
                            sectionTitle.style.fontSize = '1rem';
                            sectionTitle.style.marginTop = '15px';
                            sectionTitle.innerText = value;
                            div.appendChild(sectionTitle);
                        }
                    }
                    // Regular text
                    else{
                        // Adding the attribute value as regular text
                        let p = document.createElement('p');
                        p.innerText = value;
                        p.style.marginTop = '15px';
                        div.appendChild(p);
                    }
                }
            }
            // Description should not be displayed again for the best practice document
            else if(keyText!= 'description'){
                if(typeof(value) != 'object'){
                    
                    let l1 = document.createElement('div');
                    l1.setAttribute("class", "card border-left-success shadow");
                    l1.style.marginTop = '15px';

                    let l2 = document.createElement('div');
                    l2.setAttribute("class", "card-body");

                    let l3 = document.createElement('div');
                    l3.setAttribute("class", "row no-gutters align-items-center");

                    let l4 = document.createElement('div');
                    l4.setAttribute("class", "col mr-2");
                    
                    //title
                    let h = document.createElement('div');
                    h.innerHTML = keyText;
                    h.setAttribute('class',"text-xs font-weight-bold text-success text-uppercase mb-1");
                    l4.appendChild(h);

                    // Adding the attribute value as regular text
                    let p = document.createElement('p');
                    p.innerText = value;
                    p.style.marginTop = '15px';
                    l4.appendChild(p);

                    l3.appendChild(l4);
                    l2.appendChild(l3);
                    l1.appendChild(l2);
                    div.appendChild(l1);              
                }
            }
        }
    }


    // PART 2: Displaying subcollections for this document
    // Data is appended to div
    await retrieveSub(docId, docPath, div).then(async function(){

        // PART 3: Displaying data from docrefs
        for(let [key, value] of Object.entries(currentDoc.data())){
            let keyText = key.replace(/[0-9]/g, '');

            // The values for the following keys are irrelevant because they are always present in each BP and therefore queries later on
            if(keyText != 'title' && keyText != 'author' && keyText != 'description' && keyText != 'categories' && keyText != 'date' && keyText != 'created' && keyText !='image' && keyText != "ECGTheme" && keyText !='audience' && keyText !='timeframe' && keyText !='effort'){

                // Arrays of docrefs 
                // The docref should not point back to a collection that has already been checked, to prevent recursive additions
                if(typeof(value) == 'object' && Array.isArray(value)){

                    // Array of docrefs to be checked
                    let toCheck = [];

                    // Creating a new div for this docref
                    let contentDiv = document.createElement('div');

                    // Checking if the found relationships in this docref are not added yet
                    for(let docref = 0; docref < value.length; docref++){
                        // The subcollection of this ref
                        let refElements = (value[docref].related.path).split('/');
                        let refDocId = refElements[refElements.length - 1];
                        let refColPath = (value[docref].related.path).replace('/'+refDocId, '');

                        // We only want to check relationships that have not been checked with subcollections that have not been checked
                        if(!(checkedREL.includes(value[docref].related)) && !(checkedSC.includes(refColPath))){
                            toCheck.push(value[docref].related)
                        }
                    }

                    // If there are relationships that should be checked/added
                    if(toCheck.length > 0){
                        contentDiv.style.borderStyle = "solid";
                        contentDiv.style.borderColor = "#f8f9fc";
                        contentDiv.style.padding     = "20px";
                        contentDiv.style.marginTop   = "30px";
                        // It's not a child concept, so we add it to bpOther rather than div
                        bpOther.appendChild(contentDiv);
                    }

                    for(ref = 0; ref < toCheck.length; ref++){

                        // The subcollection of this ref
                        let refElements = (toCheck[ref].path).split('/');
                        let refDocId = refElements[refElements.length - 1];
                        let refColPath = (toCheck[ref].path).replace('/'+refDocId, '');

                        checkedSC.push(refColPath);

                        // Adding a div for this relationship, adding its contents, and checking for subconcepts
                        let docRefDiv = document.createElement('div');
                        docRefDiv.setAttribute('docref', toCheck[ref].path);
                        docRefDiv.style.marginTop    = '15px';
                        docRefDiv.style.marginBottom = '15px';
                        let relTitle                 = document.createElement('h6');
                        relTitle.setAttribute('class', 'text-gray-400 font-weight-bold text-uppercase');
                        relTitle.style.fontSize = '12px';
                        relTitle.innerText      = value[ref].name;
                        // let colTitle = document.createElement('h6');
                        // colTitle.setAttribute('class', 'text-gray-400 font-weight-bold text-uppercase');
                        // colTitle.style.fontSize = '12px';
                        // colTitle.innerText = refElements[refElements.length - 2];
                        $(docRefDiv).append(relTitle);
                        // $(docRefDiv).append(colTitle);
                        $(contentDiv).append(docRefDiv);
                        retrieveDocInfo(refColPath, refDocId, docRefDiv)
                    }
                }
            }
        }
    })
}


// Getting the subcollections for the doc that's passed as a parameter
async function retrieveSub(refDocId, refDocPath, div){

    // This callable function is specified in functions/index.js
    const getSubCollections = firebase
        .functions()
        .httpsCallable('getSubCollections');

    await getSubCollections({ docPath: `${refDocPath}`+'/'+`${refDocId}` })
    .then(async function(result) {
        let collections = result.data.collections;
        
        // Checking if this collection has subcollections
        if(collections.length > 0){

            // Iterating over the subcollections found
            for(let [index, subCol] of Object.entries(collections)){

                // Adding a div for this subcollection in the previous div
                let subDiv = document.createElement('div');
                div.appendChild(subDiv);

                let subCollection = await db.collection(refDocPath+'/'+refDocId+'/'+subCol).get();
                for (let doc of subCollection.docs){

                    // Only display info from document that are created by a user
                    if(doc.data().hasOwnProperty('created')){

                        // Calling retrieveDocInfo again to include the contents of this doc
                        retrieveDocInfo(refDocPath+'/'+refDocId+'/'+subCol, doc.id, subDiv);

                    }

                }
            }
        }
    })
}


span.onclick = function() {
    modal.style.display = "none";
    //remove comment and rating elements
    remove_comment_elements();
    remove_top_searchbar();
    remove_rating_elements();
    //reset lists and counters
    commentlist = [];
    ratinglist  = [];
    ratinginfo  = [];
    amountOfComments = 0;
    ///////////////////////////////////

    let categoryArea  = document.getElementById("bp-categories");
    let authorArea    = document.getElementById("bp-authors");
    let dateArea      = document.getElementById("bp-date");
    let imageArea     = document.getElementById("bp-image");
    let audienceArea = document.getElementById("bp-audience");
    let effortArea = document.getElementById("bp-effort");
    let timeFrameArea = document.getElementById("bp-timeframe");
    let coreContent   = document.getElementById("bp-core-content");
    let otherSections = document.getElementById("bp-other-sections");
    // Removing previously existing categories, authors and dates
    while (categoryArea.hasChildNodes()) {  
        categoryArea.removeChild(categoryArea.firstChild);
    }
    while (authorArea.hasChildNodes()) {  
        authorArea.removeChild(authorArea.firstChild);
    }
    while (imageArea.hasChildNodes()) {  
        imageArea.removeChild(imageArea.firstChild);
    }
    while (dateArea.hasChildNodes()) {  
        dateArea.removeChild(dateArea.firstChild);
    }
    while (audienceArea.hasChildNodes()) {  
        audienceArea.removeChild(audienceArea.firstChild);
    }
    while (effortArea.hasChildNodes()) {  
        effortArea.removeChild(effortArea.firstChild);
    }
    while (timeFrameArea.hasChildNodes()) {  
        timeFrameArea.removeChild(timeFrameArea.firstChild);
    }

    while (coreContent.hasChildNodes()) {
        coreContent.removeChild(coreContent.firstChild);
    }
    while (otherSections.hasChildNodes()) {
        otherSections.removeChild(otherSections.firstChild);
    }
   
}
