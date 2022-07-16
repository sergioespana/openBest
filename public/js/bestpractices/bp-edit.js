//This file contains the functions used when editing a bp.
let bpid = null
let domainstate


window.onload = function () {
    waitFordomainjson_edit()
}

async function waitFordomainjson_edit() {
    //if domain is already loaded:
    if (typeof domainjson !== "undefined") {
        // First initialization of datatable before BPs are retrieved from database
        extractJSON(domainjson, 0, '');
        domainstate = await findPath(documentPaths, 'domainstate') + '/'
    }
    //else wait and try again:
    else {
        setTimeout(waitFordomainjson_edit, 250);
    }
}

function storeID(BPid) {
    bpid = BPid;
}

let anchor1 = document.getElementById('editconfirm');
let confirm_BP_edit = document.createElement('a');
confirm_BP_edit.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"  fa fa-check  \"></i></span\><span class=\"text\">" + "Confirm edit" + "</span\>"
confirm_BP_edit.setAttribute('class', 'btn btn-light btn-icon-split');
confirm_BP_edit.style.display = "none";
confirm_BP_edit.addEventListener("click", function () { confirmBPEditing() });
anchor1.appendChild(confirm_BP_edit);

let anchor2 = document.getElementById('editcancel');
let cancel_BP_edit = document.createElement('a');
cancel_BP_edit.innerHTML = "<span class=\"icon text-gray-600\"><i class=\"  fa fa-ban \"></i></span\><span class=\"text\">" + "Cancel edit" + "</span\>"
cancel_BP_edit.setAttribute('class', 'btn btn-light btn-icon-split');
cancel_BP_edit.style.display = "none";
cancel_BP_edit.style.marginRight = '15px';
cancel_BP_edit.addEventListener("click", function () {
    cancelBPEditing();
    addactivity(userEmail, userRole, 'cancel edit best practice', 'best practice', bpid, getcurrentDateTime());

});
anchor2.appendChild(cancel_BP_edit);

function editBP(listofContainers) {
    toggle_visibility_edit_buttons();
    for (item of listofContainers) {
        //if container consists of lists of containers
        let arraycontainers = ['theme', 'sustainability dimension'];
        let imagecontainers = ['front image', 'figure one', 'figure two','image'];
        if (arraycontainers.includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            for (c of item.container) {
                c.toggleAttribute("contentEditable");
            }
        }

        else if (imagecontainers.includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            if (item.container.style.display == "block") {
                item.container.style.display = "none"
                toggle_visibility('urllabel');

            }
            else if (item.container.style.display == "none") {
                item.container.style.display = "block"
                toggle_visibility('urllabel');
            }

        }

        else {
            item.container.toggleAttribute("contentEditable");
        }
    }
}

function cancelBPEditing() {
    let imagecontainers = ['front image', 'figure one', 'figure two','image'];
    //hide the cancel and confirm buttons
    cancel_BP_edit.style.display = "none";
    confirm_BP_edit.style.display = "none";
    //restyle the edit button
    let editbutton = document.getElementById('edit-BP-btn');
    editbutton.style.color = '#3a3b45';
    editbutton.style.backgroundColor = '#f8f9fc';
    editbutton.style.borderColor = '#f8f9fc';
    // for each item
    //make the content not editable
    //reset the content to the original contents
    for (item of listofContainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'theme' || item.name.replace(/[ˆ0-9]+/g, '') == 'sustainability dimension') {
            for (c of item.container) {
              //  c.toggleAttribute("contentEditable");
                c.removeAttribute("contentEditable");
                c.innerText = item.content;
            }
        }
        else if (['title', 'description'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
           // item.container.toggleAttribute("contentEditable");
            item.container.removeAttribute("contentEditable");
            item.container.innerText = item.content;
        }
        else if (['date', 'audience', 'effort', 'timeframe'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
           // item.container.toggleAttribute("contentEditable");
           item.container.removeAttribute("contentEditable");
            item.container.innerText = item.content;
        }
        else if (imagecontainers.includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            if (item.container.style.display == "block") {
                item.container.style.display = "none";
                toggle_visibility('urllabel');
            }
            item.image.src = item.content;
            item.container.value = item.content;
        }
        else {
            // item.container.toggleAttribute("contentEditable");
            item.container.removeAttribute("contentEditable");
            item.container.innerHTML = item.content;
        }
    }
}

function confirmBPEditing() {
    let imagecontainers = ['front image', 'figure one', 'figure two','image'];
    //hide the cancel and confirm buttons
    cancel_BP_edit.style.display = "none";
    confirm_BP_edit.style.display = "none";
    //restyle the edit button
    let editbutton = document.getElementById('edit-BP-btn');
    editbutton.style.color = '#3a3b45';
    editbutton.style.backgroundColor = '#f8f9fc';
    editbutton.style.borderColor = '#f8f9fc';
    //make the element not editable
    //check if current content of the element differs from the orginial content
    let amtchanges = 0;
    let changes = []
    for (item of listofContainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'theme' || item.name.replace(/[ˆ0-9]+/g, '') == 'sustainability dimension') {
            let allcontent = [];
            for (c of item.container) {
                c.toggleAttribute("contentEditable");
                if (c.innerText != item.content) {
                    amtchanges += 1;
                    changes.push(c)
                }
                allcontent.push(c.innerText);
            }
            item.currencontent = allcontent;
        }
        else if (item.name.replace(/[ˆ0-9]+/g, '') == "figure one caption" || item.name.replace(/[ˆ0-9]+/g, '') == "figure two caption") {
            item.container.toggleAttribute("contentEditable");
            if (item.container.innerHTML != item.content) {
                amtchanges += 1;
                changes.push(item)
            }
            item.currencontent = item.container.innerHTML;
        }

        else if (imagecontainers.includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            if (item.container.style.display == "block") {
                item.container.style.display = "none";
                toggle_visibility('urllabel');
            }
            if (item.container.value != item.content) {
                amtchanges += 1;
                changes.push(item);
            }
            item.currencontent = item.container.value;
        }


        else {
            item.container.toggleAttribute("contentEditable");
            if (item.container.innerText != item.content) {
                amtchanges += 1;
                changes.push(item)
            }
            item.currencontent = item.container.innerText;
        }

    }
    if (amtchanges > 0) {
        editBPs(bpid, changes);
        $('#dataTable').DataTable();
        initTable();
        alert('The BP has been updated');
        addactivity(userEmail, userRole, 'edit best practice', 'best practice', bpid, getcurrentDateTime())
    }
}

async function editBPs(BPid, listofcontainers) {
    let path = domainstate + 'bestpractices' + '/';
    for (item of listofcontainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') != "theme" || item.name.replace(/[ˆ0-9]+/g, '') != "sustainability dimension") {
            await db.collection(path).doc(BPid).update({
                [item.name]: item.currencontent
            })
        }
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'theme' || item.name.replace(/[ˆ0-9]+/g, '') == 'sustainability dimension') {
            if (item.content[0].constructor === Array) {
                await db.collection(path).doc(BPid).update({
                    [item.name]: item.currencontent[0]
                })
            }
            else {
                await db.collection(path).doc(BPid).update({
                    [item.name]: item.currencontent
                })
            }
        }
        item.content = item.currencontent
        item.currencontent = null;
    }
}

function toggle_visibility(className) {
    elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = elements[i].style.display == 'inline' ? 'none' : 'inline';
    }
}

function toggle_visibility_edit_buttons(){
    let editbutton = document.getElementById('edit-BP-btn');
    for (item of [cancel_BP_edit, confirm_BP_edit]) {
        if (item.style.display === "none") {
            item.style.display = "block";
            //make button appear toggable
            editbutton.style.background = '#dde2f1';
            editbutton.style.borderColor = '#d4daed';
        }
        else {
            item.style.display = "none";
            //make button appear toggable
            editbutton.style.backgroundColor = '#f8f9fc';
            editbutton.style.borderColor = '#f8f9fc';
        }
    }
}

