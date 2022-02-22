//This file contains the functions used when editing a bp.
let bpid = null
let domainstate = 'Economy for the common good/domainstate/'

function storeID(BPid) {
    bpid = BPid;
    console.log(collectionPaths);
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
cancel_BP_edit.addEventListener("click", function () { cancelBPEditing() });
anchor2.appendChild(cancel_BP_edit);

function editBP(listofContainers) {
    for (item of [cancel_BP_edit, confirm_BP_edit]) {
        if (item.style.display === "none") {
            item.style.display = "block";
        }
        else {
            item.style.display = "none";
        }
    }
    for (item of listofContainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'categories') {
            for (c of item.container) {
                c.toggleAttribute("contentEditable");
            }
        }
        else {
            item.container.toggleAttribute("contentEditable");
        }
    }
}

function cancelBPEditing() {
    //hide the cancel and confirm buttons
    cancel_BP_edit.style.display = "none";
    confirm_BP_edit.style.display = "none";
    // for each item
    //make the content not editable
    //reset the content to the original contents
    for (item of listofContainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'categories') {
            for (c of item.container) {
                c.toggleAttribute("contentEditable");
                c.innerText = item.content;
            }
        }
        else if (['title', 'description'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            item.container.toggleAttribute("contentEditable");
            item.container.innerText = item.content
        }
        else if (['date', 'audience', 'effort', 'timeframe'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            item.container.toggleAttribute("contentEditable");
            item.container.innerText = item.content
        }
        else {
            item.container.toggleAttribute("contentEditable");
            item.container.innerHTML = item.content
        }
    }
}

function confirmBPEditing() {
    //hide the cancel and confirm buttons
    cancel_BP_edit.style.display = "none";
    confirm_BP_edit.style.display = "none";
    //make the element not editable
    //check if current content of the element differs from the orginial content
    let differences = 0;
    for (item of listofContainers) {
        if (item.name.replace(/[ˆ0-9]+/g, '') == 'categories') {
            let allcontent = [];
            for (c of item.container) {
                c.toggleAttribute("contentEditable");
                if (c.innerText != item.content) {
                    differences += 1;
                }
                allcontent.push(c.innerText);
            }
            item.currencontent = allcontent;
        }
        else if (['title'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            item.container.toggleAttribute("contentEditable");
            if (item.container.innerText != item.content) {
                differences += 1;
            }
            item.currencontent = item.container.innerText;
        }
        else if (['date', 'audience', 'effort', 'timeframe'].includes(item.name.replace(/[ˆ0-9]+/g, ''))) {
            item.container.toggleAttribute("contentEditable");
            if (item.container.innerText != item.content) {
                differences += 1;
            }
            item.currencontent = item.container.innerText;
        }
        else {
            item.container.toggleAttribute("contentEditable");
            if (item.container.innerText != item.content) {
                differences += 1;
            }
            item.currencontent = item.container.innerText;
        }
    }
    if (differences > 0) {
        editBPs(bpid);
        $('#dataTable').DataTable();
        initTable();
        alert('The BP has been updated');
    }
}

async function editBPs(BPid) {
    let path = domainstate + 'bestpractices' + '/';
    for (item of listofContainers) {
        if (item.name != "11categories") {
            await db.collection(path).doc(BPid).update({
                [item.name]: item.currencontent
            })//.then(console.log(item.name, 'in the database'))
        }
        if (item.name == "11categories") {
            //console.log(item.name, item.currencontent)
            if (item.content[0].constructor === Array) {
                await db.collection(path).doc(BPid).update({
                    [item.name]: item.currencontent[0]
                })//.then(console.log(item.name, 'in the database'))
            }
            else {
                await db.collection(path).doc(BPid).update({
                    [item.name]: item.currencontent
                })//.then(console.log(item.name, 'in the database'))
            }
        }
        item.content = item.currencontent
        item.currencontent = null;
    }
}

