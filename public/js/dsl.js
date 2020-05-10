// ########################
// Creates the JSON model 
// ########################

// Create firestore (database) object
var db = firebase.firestore();


// ############################################


var dslmodal = document.getElementById("model-modal");
var dslbtn = document.getElementById("create-model-btn");
// span elements closes the modal
var dslspan = document.getElementsByClassName("close")[1];
// Counts the amount of concept instances
var counter = 0;


// displaying the modal
if(dslbtn){
    dslbtn.onclick = function() {
    dslmodal.style.display = "block";
    }
}


document.getElementById("add-concept").addEventListener("click", function(){
    
    let addConceptHTML = "\
    <div style=\"margin-top: 40px\" class=\"font-weight-bold text-success text-uppercase\">New concept</div>\
    <br>\
    <label>Group title</label>\
    <input class=\"new-group-title-"+counter+" form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Example\"></input>\
    <br>\
    <label>Group description</label>\
    <input class=\"new-group-description-"+counter+" form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Describe an example here\"></input>\
    <br>\
        <input id=\"required-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"required\" value=\"Required\"></input>\
        <label for=\"required\">This is a required concept</label>\
    <br>\
    <div class=\"row\">\
        <div class=\"col-md-6\">\
        <label>Attribute name</label>\
        </div>\
        <div class=\"col-md-6\">\
        <label>Attribute type</label>\
        </div>\
    </div>\
    <div class=\"attribute-add\" counter=\""+counter+"\">\
        <div number=\"1\" class=\"row\">\
        <div class=\"col-md-6\">\
            <input class=\"form-control bg-light border-0 small\" type=\"value\" placeholder=\"e.g. Description\"></input>\
        </div>\
        <div class=\"col-md-6\">\
            <select class=\"form-control bg-light border-0 small\">\
            <option>String</option>\
            <option>Text</option>\
            <option>Document reference</option>\
            </select>\
            <input id=\"array-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"array\" value=\"Array\"></input>\
            <label for=\"array\">Multiple</label>\
        </div>\
        </div>\
    </div>\
    <a style=\"margin-top: 20px\" id=\"add-attribute\" class=\"btn btn-light btn-icon-split\" btn-counter=\""+counter+"\">\
        <span class=\"icon text-gray-600\">\
        <i class=\"fas fa-arrow-right\"></i>\
        </span>\
        <span class=\"text\">Add attribute</span>\
    </a>\
    " 
    
    $('.new-concept').append(addConceptHTML);

    counter++;
})


// Adding the possibility to add another attribute
$(".new-concept").on('click', 'a', function(event){

    // HTML blob in which user can add a new attribute
    let attributeAddHTML = "\
    <div class=\"row\"\>\
        <div class=\"col-md-6\"\>\
            <input class=\"form-control bg-light border-0 small\" type=\"value\"></input\>\
        </div\>\
        <div class=\"col-md-5\"\>\
            <select class=\"form-control bg-light border-0 small\"\>\
                <option>String</option\>\
                <option>Text</option\>\
                <option>Document reference</option\>\
            </select\>\
            <input id=\"array-checkbox\" class=\"bg-light border-0 small\" type=\"checkbox\" name=\"array\" value=\"Array\"></input\>\
            <label for=\"array\">Multiple</label\>\
        </div\>\
        <div class=\"col-md-1\"\>\
            <a class=\"attrDelete btn btn-light btn-icon-split\"\>\
                <span class=\"icon text-gray-600\"\>\
                    <i class=\"fas fa-times\"></i\>\
                </span\>\
            </a\>\
        </div\>\
    </div>"
    

    // The counter of the "Add attribute" button that was pressed
    let attrCounter = $(this).attr("btn-counter");
    // The div to which the new row should be appended
    let attributeAdd = $(this).closest("div").find(`[counter='${attrCounter}']`);
    $(attributeAdd).append(attributeAddHTML);
})


// Removing an input row for an attribute
$(".new-concept").on('click', '.attrDelete', function(event){
    // The row in which the clicked delete button is located
    let attrRow = $(this).parent().parent()[0];
    attrRow.remove(attrRow);
});


// Creating the JSON model
document.getElementById("dsl-create").addEventListener("click", function(){

    // Information filled in by user
    let domainName = document.getElementById('input-domain-name').value;
    let bpGroupTitle = document.getElementById('bp-group-title').value;
    let bpGroupDesc = document.getElementById('bp-group-description').value;
    let probGroupTitle = document.getElementById('prob-group-title').value;
    let probGroupDesc = document.getElementById('prob-group-description').value;
    let solGroupTitle = document.getElementById('sol-group-title').value;
    let solGroupDesc = document.getElementById('sol-group-description').value;

    // The initial JSON model (as string). After this, variable data can be appended.
    let JSONmodel = "\
    \{\""+domainName.replace(' ', '')+"\": \{\
        \"domainstate\": \{\
            \"displayfeature\": false\,\
            \"model\": \"string\",\
            \"name\": \""+domainName+"\",\
            \"administrator\": \""+userEmail+"\",\
            \"bestpractices\": \{\
                \"bpdocument\": \{\
                    \"01grouptitle\": \""+bpGroupTitle+"\",\
                    \"02groupdesc\": \""+bpGroupDesc+"\",\
                    \"1displayfeature\": true,\
                    \"2title\": \"string\",\
                    \"3description\": \"text\",\
                    \"4author\": [\"document reference\"\],\
                    \"5categories\": [\"string\"\],\
                    \"6date\": \"string\"\
        "


    // Adding comments > this is a RECOMMENDED subcollection
    let commentsCheckbox = document.getElementById("comments-checkbox");
    // Adding ratings > this is a RECOMMENDED subcollection
    let ratingsCheckbox = document.getElementById("ratings-checkbox");

    // Both are checked
    if(commentsCheckbox.checked && ratingsCheckbox.checked){
        let commentsRatingsString = "\
        ,\"comments\": \{\
            \"commentdocument\": \{\
                \"01grouptitle\": \"comments title\",\
                \"02groupdesc\": \"comments description\",\
                \"1displayfeature\": false\
            \}\
        \},\
        \"ratings\": \{\
            \"ratingdocument\": \{\
                \"01grouptitle\": \"ratings title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += commentsRatingsString
    }
    else if(ratingsCheckbox.checked && !(commentsCheckbox.checked)){
        let ratingsString = "\
        ,\"ratings\": \{\
            \"ratingdocument\": \{\
                \"01grouptitle\": \"ratings title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += ratingsString
    }
    else if(!(ratingsCheckbox.checked) && commentsCheckbox.checked){
        let commentsString = "\
        ,\"comments\": \{\
            \"commentdocument\": \{\
                \"01grouptitle\": \"comments title\",\
                \"02groupdesc\": \"ratings description\",\
                \"1displayfeature\": false\
            \}\
        \}\
        \}\
        \},"

        JSONmodel += commentsString
    }
    // If none of the subcollections are checked, we need to close bestpractices
    else{
        JSONmodel += "\
        \}\
        \}\
        ,"
    }


    // Adding problems > this is a FIXED subcollection
    let problemString = "\
    \"problems\": \{\
        \"problemdocument\": \{\
            \"01grouptitle\": \""+probGroupTitle+"\",\
            \"02groupdesc\": \""+probGroupDesc+"\",\
            \"1displayfeature\": true,\
            \"2name\": \"string\",\
            \"3description\": \"text\"\
        \}\
    \},\
    "

    JSONmodel += problemString

    // Adding solutions > this is a FIXED subcollection
    let solutionString = "\
    \"solutions\": \{\
        \"solutiondocument\": \{\
            \"01grouptitle\": \""+solGroupTitle+"\",\
            \"02groupdesc\": \""+solGroupDesc+"\",\
            \"1displayfeature\": true,\
            \"2name\": \"string\",\
            \"3description\": \"text\"\
        \}\
    \}\
    "

    JSONmodel += solutionString


    // Adding a new concept as a subcollection

    // Creating an array of counters that for each attribute-add row
    let counterArray = [];
    $('.attribute-add').each(function(){
        counterArray.push($(this).attr("counter"));
    });

    // Iterating over the counterarray to find the info for each attribute-add row
    for(let c = 0; c < counterArray.length; c++){

        if(c == 0){
            JSONmodel += ","
        }

        let newGroupTitle = document.getElementsByClassName('new-group-title-'+counterArray[c])[0].value;
        let newGroupDesc = document.getElementsByClassName('new-group-description-'+counterArray[c])[0].value;

        let newConceptString = "\
        \""+newGroupTitle.replace(' ', '')+"\": \{\
            \"newdocument\": \{\
                \"01grouptitle\": \""+newGroupTitle+"\",\
                \"02groupdesc\": \""+newGroupDesc+"\",\
        "
    
        JSONmodel += newConceptString

        // Storing the attribute contents of the additional concepts
        let attrNames = [];
        let attrTypes = [];
        let checkedArrays = [];

        // Adding the attribute type to an array
        //$('.attribute-add').find('select').each(function(){
        $(`[counter='${counterArray[c]}']`).find('select').each(function(){
            attrTypes.push($(this).children("option:selected").val());
        });
        // Addding the attribute name to an array
        //$('.attribute-add').find('input').each(function(){
        $(`[counter='${counterArray[c]}']`).find('input').each(function(){
            if($(this).attr("id") != "array-checkbox"){
                attrNames.push($(this).val());
            }
            // Adding the checkbox information to an array
            if($(this).attr("id") == "array-checkbox"){
                if($(this)[0].checked){
                    checkedArrays.push("checked");
                }
                else{
                    checkedArrays.push("unchecked");
                }
            }
        });

        for(let attr = 0; attr < attrNames.length; attr++){
            // Adding 2 because the first two attributes are the group title and description
            let number = (attr+2).toString();

            // The last attribute to be added needs to have extra curly brackets to correctly close this model section
            if(attr == attrNames.length - 1){
                // If this attribute is an ARRAY, add the square brackets
                if(checkedArrays[attr] == "checked"){
                    // The attributes for the final concept should be closed off with more curly brackets
                    if(c == counterArray.length - 1){
                        // But if comments and/or rating are added, less brackets are needed
                        if((commentsCheckbox.checked || ratingsCheckbox.checked) || (!commentsCheckbox.checked || !ratingsCheckbox.checked)){
                            let addAttrString = "\
                            \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"]\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            "

                            JSONmodel += addAttrString;
                        }
                        else{
                            let addAttrString = "\
                            \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"]\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            "

                            JSONmodel += addAttrString;
                        }
                    }
                    else{
                        let addAttrString = "\
                        \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"]\
                        \}\
                        \}\
                        "

                        JSONmodel += addAttrString;
                    }
                }
                // Don't add square brackets for REGULAR ATTRIBUTES
                else{
                    // The attributes for the final concept should be closed off with more curly brackets
                    if(c == counterArray.length - 1){
                        // But if comments and/or rating are added, less brackets are needed
                        if((commentsCheckbox.checked || ratingsCheckbox.checked) || (!commentsCheckbox.checked || !ratingsCheckbox.checked)){
                            let addAttrString = "\
                            \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\"\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            "
                    
                            JSONmodel += addAttrString;
                        }
                        else{
                            let addAttrString = "\
                            \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\"\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            \}\
                            "
                    
                            JSONmodel += addAttrString;
                        }
                    }
                    else{
                        let addAttrString = "\
                        \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\"\
                        \}\
                        \}\
                        "
                
                        JSONmodel += addAttrString;
                    }
                }
            }
            else{
                // Add square brackets for arrays
                if(checkedArrays[attr] == "checked"){
                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": [\""+attrTypes[attr]+"\"],\
                    "
            
                    JSONmodel += addAttrString;
                }
                else{
                    let addAttrString = "\
                    \""+number+attrNames[attr]+"\": \""+attrTypes[attr]+"\",\
                    "
            
                    JSONmodel += addAttrString;
                }
            }
        }
        if(c < counterArray.length - 1){
            JSONmodel += ",";
        }
    }

    if(counterArray.length == 0){
        JSONmodel += "\
        \}\
        \}\
        \}\
        "
    }

    console.log(JSON.parse(JSONmodel))

    //console.log(JSONmodel);

})

// Closing the modal
dslspan.onclick = function() {
    dslmodal.style.display = "none";
}