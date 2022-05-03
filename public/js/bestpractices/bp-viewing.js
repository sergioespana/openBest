// ########################
// Views the clicked best practice
// ########################

// This file contains viewing procedures for many elements that we can expect to see in a best practice, note that for most elements a standard procedure is followed
// This means that all elements are displayed equally. For some special elements this is formulated differently (e.g. audience). Note that this does not mean
// That all these elements need to be present. If you for instance expect never to see an element then feel free to delete it.

// Create firestore (database) object
var db = firebase.firestore();

var modal = document.getElementsByClassName("bp-view-modal")[0];
var span = document.getElementsByClassName("close")[0];
// Arrays that store the checked docrefs to prevent recursive checks
var checkedDR = [];
var checkedSC = [];
var checkedREL = [];
let textcontents = ['title', 'author', 'categories', 'date', 'created', 'image', "ECGTheme", 'audience', 'timeframe', 'effort', 'university', 'major dimension', 'sub dimension', 'question', 'front image','front image licence'];
var listofContainers = []
// ############################################

var currenteamail = null
var authoremails = []
//change domainemail to the domain administrator.....
var domainemail = null
//change the below url when deployed to: https://green-repo.web.app/bestpractices.html
//or when locally run to 'http://localhost:5000/bestpractices.html'
var starturl
if (location.hostname === "localhost")
  starturl ='http://localhost:5000/bestpractices.html'
else{starturl = 'https://green-repo.web.app/bestpractices.html'}

var lock = false

const queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
//this is used to get the actual user
auth.onAuthStateChanged(function (user) {
    if (user) {
        currenteamail = user.email;
    }
})

//start the bp if present in the url, this happens when directly searching for one, or scanning a QR
//Note that the timeout of 3000 may need to be increased when the Bps become larger and that an asynchronous solution would be better
 

$(document).ready(async function () {
    var selectedbpid = urlParams.get('BPid')
    var qr = urlParams.get('QR')
    if (selectedbpid) {
        await retrieveBPinfo(selectedbpid);
        modal.style.display = "block";

        if (qr) {
            addactivity(userEmail, userRole, 'open by qr', 'best practice',selectedbpid, getcurrentDateTime());
        }
        else {
            addactivity(userEmail, userRole ,'open by url', 'best practice',selectedbpid, getcurrentDateTime());
        }
        await startupComments(selectedbpid);
        for (let i = 0; i < (amountOfComments / 3); i++) {
            await delay();
        }
        await startupRatings(selectedbpid);
        storeID(selectedbpid);
    }
})


//start the bp based on the selected row in the BP table
async function tableClick(e) {
    //make sure that buttonclick can only be done once at the time
    if (lock == false){
    lock = true;
    let clickedRow = e.target.parentElement;
    let BPid = clickedRow.getAttribute('doc-id');
    await retrieveBPinfo(BPid);
    modal.style.display = "block";
    await startupComments(BPid);
    await startupRatings(BPid);
    storeID(BPid);
    window.history.replaceState("", "", starturl + '?' + "BPid=" + BPid);
    addactivity(userEmail, userRole ,'open best practice', 'best practice', BPid, getcurrentDateTime())
    lock = false;
    }
}

async function retrieveBPinfo(BPid) {
    // bpPath is the collection path to the bestpractices sub-collection
    await awaitforVar_colpath()
    let bpPath = findPath(collectionPaths, 'bestpractices');
  
    // Adding this path to checkedSC to prevent checking the bpdocument again as part of a docref
    checkedSC.push(bpPath);

    //Remove BP component
    let remove_BP = document.createElement('a');
    remove_BP.style.marginRight = "15px";
    remove_BP.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"fa fa-trash\"></i></span\><span class=\"text\">" + "Remove BP" + "</span\>"
    remove_BP.setAttribute('class', 'btn btn-light btn-icon-split');
    let remove = document.getElementById('removeBP');
    remove_BP.id = "removebutton"
    remove_BP.addEventListener("click", async function () {
        // ask for confirmation that a user indeed wants to delete his bp
        if (confirm("Are you sure you want to delete this best practice?") == true) {
            removeBP(BPid);
            await delay();
            alert('Best practice has been removed, the page will now reload');
            window.history.replaceState("", "", starturl);
            location.reload();
        }
    });

    //Edit BP component
    let edit = document.getElementById('editBP');
    var edit_BP = document.createElement('a');
    edit_BP.style.marginRight = "15px";
    edit_BP.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-edit\"></i></span\><span class=\"text\">" + "Edit BP" + "</span\>"
    edit_BP.setAttribute('class', 'btn btn-light btn-icon-split');
    edit_BP.id = ('edit-BP-btn');
    edit_BP.addEventListener("click", function () {
        editBP(listofContainers);
    })

    //QR code
    // let qrcode = new QRCode("qr_code", {
    //     text: starturl + '?' + "BPid=" + BPid + "&QR=true",
    //     width: 110,
    //     height: 110,
    //     colorDark: "#000000",
    //     colorLight: "#ffffff",
    //     correctLevel: QRCode.CorrectLevel.H
    // });

    // PART 1: displaying general best practice info 
    // Categories, authors, date, etc
    let bpDoc = await db.collection(`${bpPath}`).where(firebase.firestore.FieldPath.documentId(), "==", `${BPid}`).get();
    for (doc of bpDoc.docs) {

        let BPtitle = document.getElementById("bp-title");
        // indexArr is instantiated in bp-retrieval when dataTable is initially loaded

        await awaitforVar_indexarr()

        let title = indexArr[0];
        BPtitle.innerText = `${doc.data()[Object.keys(doc.data())[title]]}`;
        //add the element to the listofcontainers. 
        // This list is used when editing the BP form. 
        // Note that the digit before the name is related to the BP document and should be changed according to the model.
        // the same is true for the description
        listofContainers.push({
            "name": "10title",
            "container": BPtitle,
            "content": `${doc.data()[Object.keys(doc.data())[title]]}`
        })

        let dateArea = document.getElementById("bp-date");

        // let audienceArea = document.getElementById("bp-audience");

        // let effortArea = document.getElementById("bp-effort");

        // let timeFrameArea = document.getElementById("bp-timeframe");

        // Iterating over the document data and displaying general info
        for (let [key, value] of Object.entries(doc.data())) {
            // Displaying authors
            if (key.replace(/[ˆ0-9]+/g, '') == 'author') {

                for (let rel = 0; rel < value.length; rel++) {

                    // The row in which author info should be appended
                    let authorRow = document.getElementsByClassName('authors-info');

                    // If the authorRow already has a row for the current relationship name
                    if ($(authorRow).find(`[relname='${value[rel].name}']`).length != 0) {
                        let addDiv = $(authorRow).find(`[relname='${value[rel].name}']`).find('.col-sm-10');

                        // Retrieving the doc that is stored in the docref
                        let authorDoc = await db.collection(value[rel].related.parent.path).doc(value[rel].related.id).get();
                        for (let [key, value] of Object.entries(authorDoc.data())) {
                            if (key == 'name') {
                                let authorName = document.createElement('a');
                                authorName.style.marginRight = "5px";
                                authorName.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-user\"></i></span\><span class=\"text\">" + value + "</span\>";
                                authorName.setAttribute('class', 'btn btn-light btn-icon-split');
                                $(addDiv).append(authorName);
                            }
                            if (key == 'email') {
                                authoremails.push(value);
                            }
                        }
                    }
                    // If no authors have been added for this relationship type yet, add a new row
                    else {
                        let relNameRow = document.createElement('div');
                        relNameRow.setAttribute('class', 'row general-info');
                        relNameRow.setAttribute('relname', value[rel].name);
                        let relNameDiv = document.createElement('div');
                        relNameDiv.setAttribute('class', 'col-sm-2');
                        let authorNameDiv = document.createElement('div');
                        authorNameDiv.setAttribute('class', 'col-sm-10');

                        let relName = document.createElement('p');
                        relName.style.display = "inline";
                        relName.textContent = value[rel].name + ':';
                        $(relNameDiv).append(relName);

                        let authorDoc = await db.collection(value[rel].related.parent.path).doc(value[rel].related.id).get();
                        for (let [key, value] of Object.entries(authorDoc.data())) {
                            if (key == 'name') {
                                let authorName = document.createElement('a');
                                authorName.style.marginRight = "5px";
                                authorName.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"far fa-user\"></i></span\><span class=\"text\">" + value + "</span\>";
                                authorName.setAttribute('class', 'btn btn-light btn-icon-split');
                                $(authorNameDiv).append(authorName);

                            }
                            if (key == 'email') {
                                authoremails.push(value);

                            }
                        }
                        $(relNameRow).append(relNameDiv);
                        $(relNameRow).append(authorNameDiv);
                        $(authorRow).append(relNameRow);
                    }
                }
            }


            if (key.replace(/[ˆ0-9]+/g, '') == 'question') {
                let questionArea = document.getElementById("bp-title");
                let question = document.createElement('h2')
                question.innerText = value
                questionArea.after(question)
                question.setAttribute('class', 'OICT');
                listofContainers.push({
                    "name": key,
                    "container": question,
                    "content": value
                })

            }



            let topArea = document.getElementById('topbuttons')
            // Displaying topelements (university, category, dimension etc.)
            topelements = ['university', 'sub dimension', 'major dimension']
            if (topelements.includes(key.replace(/[ˆ0-9]+/g, ''))) {

                let generalinforow = document.createElement('div')
                generalinforow.setAttribute('class', 'row general-info', 'topfield');
                topArea.append(generalinforow)

                let generalcolumn = document.createElement('div')
                generalcolumn.setAttribute('class', 'col-sm-2');
                generalinforow.appendChild(generalcolumn)

                let vlabel = document.createElement('p')
                vlabel.style.display = 'inline'
                let labeltext = key.replace(/[ˆ0-9]+/g, '')
                vlabel.innerText = labeltext[0].toUpperCase() + labeltext.substring(1) + ':'
                generalcolumn.appendChild(vlabel)

                let valuearea = document.createElement('div')
                valuearea.setAttribute('class', 'col-sm-10');
                valuearea.style.display = "inline"
                valuearea.id = 'bp-' + key
                generalinforow.appendChild(valuearea)

                // Populating the general info section (authors, date, categories)

                let themeButton = document.createElement('a');
                let span = document.createElement('span');
                span.setAttribute('class', 'text');
                span.innerText = value;
                themeButton.appendChild(span);
                themeButton.setAttribute('class', 'btn btn-light btn-icon-split');
                valuearea.appendChild(themeButton);

                listofContainers.push({
                    "name": key,
                    "container": span,
                    "content": value
                })
            }
            // Displaying date
            else if (key.replace(/[ˆ0-9]+/g, '') == 'date') {
                // Populating the general info section (authors, date, categories)
                let dateButton = document.createElement('a');
                let span1 = document.createElement('span');
                span1.setAttribute('class', 'icon text-gray-600');
                let icon = document.createElement('i');
                icon.setAttribute('class', 'far fa-calendar-alt');
                span1.appendChild(icon);
                let span2 = document.createElement('span');
                span2.setAttribute('class', 'text');
                span2.innerText = value;
                dateButton.append(span1);
                dateButton.append(span2);
                dateButton.setAttribute('class', 'btn btn-light btn-icon-split');
                dateArea.appendChild(dateButton);

                listofContainers.push({
                    "name": key,
                    "container": span2,
                    "content": value
                })
            }
            // Displaying top image
            let imagefields = ['image', 'front image']
            if (imagefields.includes(key.replace(/[ˆ0-9]+/g, ''))) {
                // Populating the general info section 
                if (value != '') {
                    let imageArea = document.getElementById("bp-image");
                    imageArea.style.marginLeft = "auto";
                    imageArea.style.marginRight = "auto";

                    let fig = document.createElement('figure')
                    fig.id = 'topfigure'

                    let picture = document.createElement("img");
                    picture.src = value;
                    picture.style.width = 'calc(100%)';
                    
                    let figurl = document.createElement('input');
                    figurl.defaultValue = value;
                    figurl.setAttribute('class', 'form-control bg-light border-0 small');
                    figurl.setAttribute('type', 'value');
                    figurl.style.marginTop = '15px';
                    figurl.id = 'url topimage';
                    figurl.style.display = 'none';

                    picture.onerror = function handleError() {
                        picture.style.display = 'none';
                    
                    };
    
                           
                    figurl.oninput = function () {
                        if (figurl.value.length >= 1) {
                            picture.src = figurl.value;
                            picture.onload = function(){
                            picture.style.display = 'block';
                            }
                        }
                        else {
                            picture.style.display = 'none';
                        }
                    }

                    listofContainers.push({
                        "name": key,
                        "container": figurl,
                        "content": value
                    })
                        

                 
                    fig.appendChild(picture);
                    imageArea.appendChild(fig);
                    imageArea.appendChild(figurl);
                    
                }
            }

            let captions = ['front image licence']
            if (captions.includes(key.replace(/[ˆ0-9]+/g, '')) ) {
                let fig = document.getElementById('topfigure');
                if (fig){
                let figcap = document.createElement('figcaption');
                figcap.innerText = 'Licence: ' + value;
                fig.appendChild(figcap);
                }
            }

            else if (key.replace(/[ˆ0-9]+/g, '') == 'audience') {
                let audienceButton = document.createElement('a');
                audienceButton.setAttribute('class', 'btn btn-light btn-icon-split');
                let span1 = document.createElement('span');
                span1.setAttribute('class', 'icon text-gray-600');
                let icon = document.createElement('i');
                icon.setAttribute('class', 'fa fa-light fa-users');
                span1.appendChild(icon);
                let span2 = document.createElement('span');
                span2.setAttribute('class', 'text');
                span2.innerText = value;
                audienceButton.appendChild(span1);
                audienceButton.appendChild(span2);
                audienceArea.appendChild(audienceButton);

                listofContainers.push({
                    "name": key,
                    "container": span2,
                    "content": value
                })
            }

            else if (key.replace(/[ˆ0-9]+/g, '') == 'effort') {
                let effortButton = document.createElement('a');
                effortButton.setAttribute('class', 'btn btn-light btn-icon-split');
                let span1 = document.createElement('span');
                span1.setAttribute('class', 'icon text-gray-600');
                let icon = document.createElement('i');
                icon.setAttribute('class', 'fa fa-hammer');
                span1.appendChild(icon);
                let span2 = document.createElement('span');
                span2.setAttribute('class', 'text');
                span2.innerText = value;
                effortButton.appendChild(span1);
                effortButton.appendChild(span2);
                effortArea.appendChild(effortButton);

                listofContainers.push({
                    "name": key,
                    "container": span2,
                    "content": value
                })
            }

            else if (key.replace(/[ˆ0-9]+/g, '') == 'timeframe') {
                let timeframeButton = document.createElement('a');
                timeframeButton.setAttribute('class', 'btn btn-light btn-icon-split');
                let span1 = document.createElement('span');
                span1.setAttribute('class', 'icon text-gray-600');
                let icon = document.createElement('i');
                icon.setAttribute('class', 'fa fa-clock');
                span1.appendChild(icon);

                let span2 = document.createElement('span');
                span2.setAttribute('class', 'text');
                span2.innerText = value;

                timeframeButton.appendChild(span1);
                timeframeButton.appendChild(span2);
                timeFrameArea.appendChild(timeframeButton);

                listofContainers.push({
                    "name": key,
                    "container": span2,
                    "content": value
                })
            }
        }
    }
    //make the remove and edit functionalities available to the domain administrator, BP author, and developer
    if (userRole == 'administrator' || authoremails.includes(currenteamail) || developers.includes(currenteamail)) {
        remove.appendChild(remove_BP);
        edit.appendChild(edit_BP);
    }

    // The div in which BP content should be placed
    let bpCore = document.getElementById("bp-core-content");
    retrieveDocInfo(bpPath, BPid, bpCore);

    span.onclick = function () {
        closeModal();
        addactivity(userEmail, userRole ,'close best practice', 'best practice', bpid, getcurrentDateTime());
    }
    return new Promise((resolve)=>{
            resolve();
    });
}


// Retrieving info for the documents linked to this best practice
async function retrieveDocInfo(docPath, docId, div) {
    let bpOther = document.getElementById("bp-other-sections");

    // PART 1: displaying all text contents for this document
    let currentDoc = await db.collection(docPath).doc(docId).get();
    for (let [key, value] of Object.entries(currentDoc.data())) {
        let keyText = key.replace(/[0-9]/g, '');
        // The values for the following keys are irrelevant because they are always present in each BP and therefore queried elsewhere
        if (!textcontents.includes(keyText)) {
            if ((docPath.split('/')[docPath.split('/').length - 1]) != "bestpractices") {
                // String or text
                if (typeof (value) != 'object') {
                    // Title
                    if (keyText == 'name' || keyText == 'title') {
                        let colTitle = document.createElement('h6');
                        colTitle.setAttribute('class', 'text-gray-400 font-weight-bold text-uppercase');
                        colTitle.style.fontSize = '12px';
                        colTitle.innerText = (docPath.split('/')[docPath.split('/').length - 1]);
                        div.appendChild(colTitle);

                        // This document is in a subcollection
                        if (docPath.split('/').length > 3) {
                            //Create the title for this section
                            let sectionTitle = document.createElement('h6');
                            sectionTitle.setAttribute('class', 'text-gray-600 font-weight-bold text-uppercase');
                            sectionTitle.style.fontSize = '1rem';
                            sectionTitle.innerText = value;
                            div.style.marginTop = '15px'
                            div.appendChild(sectionTitle);
                        }
                        else {
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
                    else {// Adding the attribute value as regular text
                        let p = document.createElement('p');
                        p.innerText = value;
                        p.style.marginTop = '15px';
                        div.appendChild(p);
                    }
                }
            }
         
                if (typeof (value) != 'object') {

                        // Image
                       if (keyText.includes('figure') && !keyText.includes('caption')) {
                           // if an image has been filled in
                        if (value != '') {
                            let figDiv = document.createElement('div');
                            figDiv.setAttribute('class', 'col-sm-10');
                            figDiv.style.marginLeft = 'auto';
                            figDiv.style.marginRight = 'auto';
                            figDiv.style.marginTop = '10px';

                            let fig = document.createElement('figure')
                            fig.id = 'topfigure ' + keyText;

                            let picture = document.createElement("img");
                            picture.src = value;
                            picture.style.width = 'calc(100%)';

                            let urlkey =  document.createElement('b');
                            urlkey.innerText = 'Image link:'
                            urlkey.style.marginTop = '15px';
                            urlkey.id = 'urlkey' 
                            urlkey.style.display = 'none'

                            let figurl = document.createElement('input');
                            figurl.defaultValue = value;
                            figurl.setAttribute('class', 'form-control bg-light border-0 small');
                            figurl.setAttribute('type', 'value');
                            figurl.style.marginTop = '15px';
                            figurl.id = 'url ' + keyText;
                            figurl.style.display = 'none';


                            picture.onerror = function handleError() {
                                picture.style.display = 'none';
                            };
    
                           
                            figurl.oninput = function () {
                                if (figurl.value.length >= 1) {
                                    picture.src = figurl.value;
                                    picture.onload = function(){
                                    picture.style.display = 'block';
                                    }
                                }
                                else {
                                    picture.style.display = 'none';
                                }
                            }

                            fig.appendChild(picture);
                            figDiv.appendChild(fig);
                            figDiv.appendChild(urlkey)
                            figDiv.appendChild(figurl);
                            div.appendChild(figDiv);

                            listofContainers.push({
                                "name": key,
                                "container": figurl,
                                "content": value
                            })
                        }
                    }
                    else if (keyText.includes('figure') && keyText.includes('caption')){
                        if (value != '') {
                            let fig
                            if (keyText == 'figure one caption'){
                              fig =  document.getElementById('topfigure figure one');
                            }  
                            else if (keyText == 'figure two caption'){
                              fig =  document.getElementById('topfigure figure two');
                            }
                        if (fig){
                        let figcap = document.createElement('figcaption');
                        figcap.innerText = value;
                        fig.appendChild(figcap);
                        listofContainers.push({
                            "name": key,
                            "container": figcap,
                            "content": value
                        })
                    }
                        }
                    }
                    else{
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
                    h.setAttribute('class', "text-xs font-weight-bold text-success text-uppercase mb-1");
                    l4.appendChild(h);
                    // Adding the attribute value as regular text
                    let p = document.createElement('p');
                    p.innerText = value;
                    p.style.marginTop = '15px';
                    listofContainers.push({
                        "name": key,
                        "container": p,
                        "content": value
                    })
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
    await retrieveSub(docId, docPath, div).then(async function () {
        // PART 3: Displaying data from docrefs
        for (let [key, value] of Object.entries(currentDoc.data())) {
            let keyText = key.replace(/[0-9]/g, '');
            // The values for the following keys are irrelevant because they are always present in each BP and therefore queries later on
            if (!textcontents.concat('description').includes(keyText)) {

                // Arrays of docrefs 
                // The docref should not point back to a collection that has already been checked, to prevent recursive additions
                if (typeof (value) == 'object' && Array.isArray(value)) {

                    // Array of docrefs to be checked
                    let toCheck = [];

                    // Creating a new div for this docref
                    let contentDiv = document.createElement('div');

                    // If there are relationships that should be checked/added
                    if (toCheck.length > 0) {
                        contentDiv.style.borderStyle = "solid";
                        contentDiv.style.borderColor = "#f8f9fc";
                        contentDiv.style.padding = "20px";
                        contentDiv.style.marginTop = "30px";
                        // It's not a child concept, so we add it to bpOther rather than div
                        bpOther.appendChild(contentDiv);
                    }

                    for (ref = 0; ref < toCheck.length; ref++) {

                        // The subcollection of this ref
                        let refElements = (toCheck[ref].path).split('/');
                        let refDocId = refElements[refElements.length - 1];
                        let refColPath = (toCheck[ref].path).replace('/' + refDocId, '');

                        checkedSC.push(refColPath);

                        // Adding a div for this relationship, adding its contents, and checking for subconcepts
                        let docRefDiv = document.createElement('div');
                        docRefDiv.setAttribute('docref', toCheck[ref].path);
                        docRefDiv.style.marginTop = '15px';
                        docRefDiv.style.marginBottom = '15px';
                        let relTitle = document.createElement('h6');
                        relTitle.setAttribute('class', 'text-gray-400 font-weight-bold text-uppercase');
                        relTitle.style.fontSize = '12px';
                        relTitle.innerText = value[ref].name;
                        $(docRefDiv).append(relTitle);
                        $(contentDiv).append(docRefDiv);
                        retrieveDocInfo(refColPath, refDocId, docRefDiv)
                    }
                }
            }
        }
    })
}


// Getting the subcollections for the doc that's passed as a parameter
async function retrieveSub(refDocId, refDocPath, div) {

    // This callable function is specified in functions/index.js
    const getSubCollections = firebase
        .functions()
        .httpsCallable('getSubCollections');

    await getSubCollections({ docPath: `${refDocPath}` + '/' + `${refDocId}` })
        .then(async function (result) {
            let collections = result.data.collections;
            // Checking if this collection has subcollections
            if (collections.length > 0) {
                // Iterating over the subcollections found
                for (let [index, subCol] of Object.entries(collections)) {
                    // Adding a div for this subcollection in the previous div
                    let subDiv = document.createElement('div');
                    div.appendChild(subDiv);
                    let subCollection = await db.collection(refDocPath + '/' + refDocId + '/' + subCol).get();
                    for (let doc of subCollection.docs) {
                        // Only display info from document that are created by a user
                        if (doc.data().hasOwnProperty('created')) {
                            // Calling retrieveDocInfo again to include the contents of this doc
                            retrieveDocInfo(refDocPath + '/' + refDocId + '/' + subCol, doc.id, subDiv);
                        }
                    }
                }
            }
        })
}




function closeModal() {
    modal.style.display = "none";
    //remove comment and rating elements
    remove_comment_elements();
    remove_top_searchbar();
    remove_rating_elements();
    //reset lists and counters
    authoremails = [];
    commentlist = [];
    ratinglist = [];
    ratinginfo = [];
    amountOfComments = 0;
    listofContainers = [];
    ///////////////////////////////////
    let Removebutton = document.getElementById("removeBP");
    let Editbutton = document.getElementById("editBP");
    let QRSection = document.getElementById("qr_code");
    let topArea = document.getElementById('topbuttons')
    let authorArea = document.getElementById("bp-authors");
    let dateArea = document.getElementById("bp-date");
    let imageArea = document.getElementById("bp-image");
    let coreContent = document.getElementById("bp-core-content");
    let otherSections = document.getElementById("bp-other-sections");
    // Removing previously existing categories, authors and dates

    while (Removebutton.hasChildNodes()) {
        Removebutton.removeChild(Removebutton.firstChild);
    }
    while (Editbutton.hasChildNodes()) {
        Editbutton.removeChild(Editbutton.firstChild);
    }
    while (QRSection.hasChildNodes()) {
        QRSection.removeChild(QRSection.firstChild);
    }
    while (topArea.hasChildNodes()) {
        topArea.removeChild(topArea.firstChild);
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
    while (coreContent.hasChildNodes()) {
        coreContent.removeChild(coreContent.firstChild);
    }
    while (otherSections.hasChildNodes()) {
        otherSections.removeChild(otherSections.firstChild);
    }


    ///
    var paras = document.getElementsByClassName('OICT');

    while (paras[0]) {
        paras[0].parentNode.removeChild(paras[0]);
    }
    //reset URL
    window.history.replaceState("", "", starturl);
}

async function removeBP(BPid) {
    //remove subcollections of the BP
    subcollections = ['comments', 'ratings', 'example']
    for (subcollection of subcollections) {
        let path = findPath(collectionPaths, 'bestpractices') + '/' + BPid + '/' + subcollection;
        // Getting a reference to all documents in the sub-collections of a best practice
        let bpSub = await db.collection(path).get();
        // Each document that matches the query is cycled through 
        for (doc of bpSub.docs) {
            db.collection(path).doc(doc.id).delete()

        }
    }
    let path = findPath(collectionPaths, 'bestpractices') + '/';
    //delete BP itself
    await (db.collection(path).doc(BPid).delete());
    addactivity(userEmail, userRole,'remove best practice', 'best practice',BPid, getcurrentDateTime())
}



async function awaitforVar_indexarr(){
    if (typeof indexArr[0] === "undefined"){
           await delay();
           awaitforVar_indexarr();
        }
    else{
        return new Promise((resolve)=>{
            resolve();})
    }
   
}

async function awaitforVar_colpath(){
    if (typeof collectionPaths[0] === "undefined"){
           await delay();
           awaitforVar_colpath();
        }
    else{
        return new Promise((resolve)=>{
            resolve();})
    }
   
}