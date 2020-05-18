var BPid = null;

function startup(BPID){
   create_meta_info();
   comment_input_location = document.getElementById("searchbar");
   create_comment_input(comment_input_location,"false");
   BPid = BPID;
   getcomments(BPid);
}
function create_encouragement(){
    var encouragement = document.createElement("p");
    encouragement.innerText = "There are currently no comments, become the first to comment!";
    var root = document.getElementById("commentsection");
    root.appendChild(encouragement);//plak totale comment in de commentsectie
    encouragementOBJ = encouragement;
}
function create_meta_info(){
    var root = document.getElementById("searchbar");
    var comment_counter   = document.createElement("p");
    comment_counter.classList.add("comment_counter");
    comment_counter.id = "comment_counter";
    comment_counter.innerText =  amountOfComments + " comments";    
    root.appendChild(comment_counter);
}
function showtext(see_more,text){
    var tbutton  = see_more;
    var isshown  = text.hasbeendrawn;  
    if (isshown == "false"){
        tbutton.innerText = "See less";
        text.classList.remove("line-clamp","line-clamp-2");
        text.hasbeendrawn = "true";
    }
    else {
        tbutton.innerText = "See more";
        text.classList.add("line-clamp","line-clamp-2");
        text.hasbeendrawn = "false";
    }
}
function create_comment_input(elem, isSubComment,commentid){
    if (isSubComment == "true"){ isdrawn = elem.getAttribute("SubInputisDrawn");}  
    if (isSubComment == "true" && isdrawn == "false" || isSubComment == "false"){ 

    var newdiv = document.createElement("DIV"); 
    newdiv.classList.add("newcomment",commentid);

    var comment_input = document.createElement("SPAN");
    comment_input.classList.add("textarea");
    comment_input.role = "textbox";
    comment_input.setAttribute("contenteditable", "true");
    comment_input.setAttribute("hasbeendrawn", "false");
    if (isSubComment == "true"){comment_input.setAttribute("isSubComment", "true");}

    newdiv.appendChild(comment_input);

    if (isSubComment == "true"){ //in het geval van een subcomment
    
    insertAfter(newdiv,elem);
    comment_input.addEventListener("focus", function(){addbuttons(newdiv, comment_input,elem,commentid)});
    elem.setAttribute("SubInputisDrawn","true");
    }

    else{
    elem.appendChild(newdiv); // in het geval van hoofdcomment
    comment_input.addEventListener("focus", function(){addbuttons(newdiv, comment_input)});//hoofdcomment
    }
   }
}
function addbuttons(div,text,elem,commentid){
    draw = text.getAttribute("hasbeendrawn"); 
    
    if(draw == "false"){
    text.setAttribute("hasbeendrawn","true");

    var newbuttonbar = document.createElement("DIV");
    newbuttonbar.classList.add("button_bar");
    
    var newcancelbutton = document.createElement("INPUT"); 
    newcancelbutton.type = "button";
    newcancelbutton.value = "Cancel";
    newcancelbutton.classList.add("comment_button","cancel_button");

    var newsubmitbutton = document.createElement("INPUT");
    newsubmitbutton.type = "button";
    newsubmitbutton.value = "Submit"; 
    newsubmitbutton.classList.add ("comment_button","submit_button");

    newbuttonbar.appendChild(newsubmitbutton); 
    newbuttonbar.appendChild(newcancelbutton);
    newcomment = div;
    newcomment.appendChild(newbuttonbar);

    if (elem){// if input bar is below one comment
    newcancelbutton.addEventListener("click", function(){subCancel(text,elem)});
    newsubmitbutton.addEventListener("click", function(){subSubmit(text,elem,commentid)});
    text.addEventListener("input", function(){checklength(newsubmitbutton,text)});
    }
    else{// if input bar is the main inputbar
    newcancelbutton.addEventListener("click", function(){masterCancel(newbuttonbar,text)});
    newsubmitbutton.addEventListener("click", function(){masterSubmit(newbuttonbar,text)});
    text.addEventListener("input", function(){checklength(newsubmitbutton,text)});}
    }    
}
function getcurrentDateTime(){
    var date = new Date();
    return (date.toUTCString());
}
function masterCancel(buttonbar,text){
    text.innerText = "";
    remove_element(buttonbar);
    text.setAttribute("hasbeendrawn","false");
    
}
function masterSubmit(buttonbar,text){
    var message = text.innerText;
    if(lengte(message) >= 1){
    masterCancel(buttonbar,text);
    pushcomment(BPid,getcurrentDateTime(),getUserName(),getUserImage(),message,getUserEmail(),"main",0,"none"); //write comment to db and afterwards draw it locally
    }
}
function checklength(newsubmitbutton,text){
  var label = text.innerText;  
  if (lengte(label) >= 1){
    newsubmitbutton.style.background = "rgb( 48, 158, 191)";
  }
  else{
    newsubmitbutton.style.background = "buttonface";
  }
}               
function draw_comment(name,date,text,img,commentid,BP_id,issame,thread,level,parent,haschildren,isdrawn){

   // comment wrapper e.g. the wrapper for all the comments contents
   var comment_wrapper = document.createElement("DIV");
   //determine the width of the comment based on its level (indent)
   movement = level * 10 + "px";
   comment_wrapper.style.marginLeft = movement;
   comment_wrapper.style.width = 'calc(100% - '+ movement +')';
   comment_wrapper.style.display = isdrawn;
   
   comment_wrapper.id = commentid;
   comment_wrapper.classList.add("comment_wrapper");
   comment_wrapper.setAttribute("SubInputisDrawn","false");
   comment_wrapper.setAttribute("SubCommentDrawn","false");
   comment_wrapper.setAttribute("level",level);
   /////////////////////////////////////////////////////////////////

   //picture wrapper
   var picture_wrapper = document.createElement("DIV");
   picture_wrapper.classList.add("picture_wrapper");

   //content wrapper
   var content_wrapper = document.createElement("DIV");
   content_wrapper.classList.add("content");

   //topbar wrapper, wrapper for the meta info and toolbar
   var topbar_wrapper = document.createElement("DIV");
   topbar_wrapper.classList.add("topbar");

   //meta info wrapper, name, date, etc.
   var meta_info_wrapper = document.createElement("DIV");
   meta_info_wrapper.classList.add("meta_info");

   //toolbar wrapper, delete, edit, flag, etc.
   var toolbar_wrapper = document.createElement("DIV");
   toolbar_wrapper.classList.add("toolbar_wrapper");

   //toolbar wrapper for comment utilities under the comment text, confirm edit, cancel edit, show entire comment.
   var bottomtoolbar_wrapper = document.createElement("DIV");
   bottomtoolbar_wrapper.classList.add("bottomtoolbar");

   //picture
   var picture = document.createElement("img");
   picture.src = img;
   picture.classList.add("picture");
   picture_wrapper.appendChild(picture);//plak de afbeelding in de picture wrapping

   //author name
   var name_text = document.createElement("p");
   name_text.classList.add("name");
   name_text.innerText = name;

   //comment date, e.g. 5 minutes ago...
   var date_posted_text = document.createElement("p");
   date_posted_text.classList.add("date_poster");
   date_posted_text.innerText = date;
      
   //the comment text itself
   var comment_text = document.createElement("p");
   comment_text.innerText = text;
   comment_text.classList.add("comment_text","line-clamp","line-clamp-2");
   comment_text.setAttribute("hasbeendrawn", "false");

   //allow a user to flag a comment if comment in not from current logged in user
   if (issame == "false"){
    //flagging component
    var flag_comment = document.createElement("i");
    flag_comment.classList.add("far","fa-flag","flag_button","dropbtn");
    flag_comment.addEventListener("mouseover",function(){changeflag(flag_comment);})
    flag_comment.addEventListener("mouseleave",function(){changeflag(flag_comment);})
    toolbar_wrapper.appendChild(flag_comment);}

    //if current user is the same as the comment writer he can remove or edit the comment
    if (issame == "true"){
        //editing component
        var edit_comment = document.createElement("i");
        edit_comment.classList.add("far","fa-edit","edit_button");
        //on click toggle editable content, if comment_text is editable place focus on the comment_text and show the entire comment.
        edit_comment.addEventListener("click", function (){ editComment(see_more,comment_text,confirm_edit,cancel_edit,edit_comment);})
        // toolbar_wrapper.appendChild(edit_comment);

        //remove comment component
        var remove_comment = document.createElement("i");
        remove_comment.classList.add("fa","fa-trash","remove_button");
        toolbar_wrapper.appendChild(remove_comment);
        remove_comment.addEventListener("click", function(){
        // removeallChildren(level,commentid,BP_id);
        // ask for confirmation that a user indeed wants to delete his comments
            if (confirm("Are you sure you want to delete this comment? please not that reactions to this comment will also be lost")== true){
                removeComment(commentid,BP_id,comment_wrapper);
            }
        }); 
   }

   //add comment author and date to the meta info wrapper
   meta_info_wrapper.appendChild(name_text);
   meta_info_wrapper.appendChild(date_posted_text);

   //add meta info and the toolbar to the topbar
   topbar_wrapper.appendChild(meta_info_wrapper);
   topbar_wrapper.appendChild(toolbar_wrapper);

   //add topbar in the content wrapper
   content_wrapper.appendChild(topbar_wrapper); 
   //paste the comment text into the content wrapper
   content_wrapper.appendChild(comment_text);
   //paste picture wrapper in the comment wrapper
   comment_wrapper.appendChild(picture_wrapper); 
   //paste content into the comment wrapper
   comment_wrapper.appendChild(content_wrapper); 
   
   //statement to determine where to draw a comment
   if(thread == "main"){
   var root = document.getElementById("commentsection");
   root.appendChild(comment_wrapper);
   }
   else{
   var root = thread;
   insertAfter(comment_wrapper,root);
   }

   //creation of the "see more" button to view reactions on comments
   var see_more = document.createElement("p");
   see_more.classList.add("see_more","bottomOption");
   bottomtoolbar_wrapper.appendChild(see_more);

   see_more.addEventListener("click", function(){showtext(see_more,comment_text)});
   see_more.addEventListener("mouseover",function(){showcursor(see_more)});
   showtext(see_more,comment_text);
   //initial assesment if the text is larger than the 2 line comment box
   displayMore(comment_text,see_more);

   var confirm_edit = document.createElement("p");
   confirm_edit.classList.add("confirm_edit","bottomOption");
   confirm_edit.innerText = "Confirm edit";
   confirm_edit.style.display = "none";
   confirm_edit.addEventListener("click",function (){confirmEditing(cancel_edit,confirm_edit,see_more,comment_text,text,BP_id,commentid);})
   // bottomtoolbar_wrapper.appendChild(confirm_edit);

   var cancel_edit = document.createElement("p");
   cancel_edit.classList.add("cancel_edit","bottomOption");
   cancel_edit.innerText = "Cancel edit";
   cancel_edit.style.display = "none";
   cancel_edit.addEventListener("click", function() {cancelEditing(cancel_edit,confirm_edit,see_more,comment_text,text);})
   // bottomtoolbar_wrapper.appendChild(cancel_edit);

   content_wrapper.appendChild(bottomtoolbar_wrapper);

   //clamping and see more button and functionality
    window.onresize = function(event) {
        displayMore(comment_text,see_more);
    };
   
  //paste various rating systems
   //createEbayRating(comment_wrapper);//create eBay
   createLikeDislikeRating(content_wrapper);//create dislikelike
 // createStarRating(comment_wrapper);//create starRating

   //react button and functionality
   if (level < 3){  //if thread nesting is below 5 then the commenters can comment on a nested comment.
    var react_button = document.createElement("p");
    react_button.classList.add("react_button");
    react_button.innerText = "React";
    content_wrapper.appendChild(react_button);
    react_button.addEventListener("mouseover",function(){showcursor(react_button)});
    react_button.addEventListener("click",function(){create_comment_input(comment_wrapper,"true",commentid)});
    }
   //see answers button and functionality
   var see_answers = document.createElement("p");
   see_answers.innerText = "see answers";
   see_answers.classList.add("see_answers");
   see_answers.id = "answers" + commentid;
   see_answers.addEventListener("click",function(){getallChildren(level,commentid)});
   content_wrapper.appendChild(see_answers);

   //only display the "see more" button if a comment has children
  if (haschildren == true){
   see_answers.style.display = "block";
   }
   else{see_answers.style.display = "none";}
   see_answers.addEventListener("mouseover",function(){showcursor(see_answers)});
}

function editComment(see_more,comment_text,confirm,cancel,edit){  
    edit.classList.toggle("selected");
    comment_text.toggleAttribute("contentEditable");
    if (comment_text.isContentEditable){
        //select the comments text box
        comment_text.focus();
        //display the confirm and cancel buttons
        confirm.style.display = "inline-block";
        cancel.style.display = "inline-block";

        //de-clamp the comment
        if (comment_text.hasbeendrawn == "true"){
        comment_text.hasbeendrawn = "false"; }
        showtext(see_more,comment_text);
    }
    else {
        //hide confirm and cancel buttons
        confirm.style.display = "none";
        cancel.style.display = "none";

        if(showReadMoreButton(comment_text) == true){
            //re-clamp the comment
            if (comment_text.hasbeendrawn == "false"){
                comment_text.hasbeendrawn = "true"; }
                showtext(see_more,comment_text);
        }
    }
}

function confirmEditing(cancel_edit,confirm_edit,see_more,comment_text,text,BPid,messageid){
   //hide the cancel and confirm buttons
   cancel_edit.style.display  = "none";
   confirm_edit.style.display = "none";
      
   if (showReadMoreButton(comment_text) == true){
        //re-clamp the comment
        comment_text.hasbeendrawn = "true"; 
        showtext(see_more,comment_text);
   }
    //make the comment not editable
    comment_text.toggleAttribute("contentEditable");

    //if current content of the comment differs from the original text
    if (text != comment_text.innerText){
    //function to write changes to the db
    editCommentDB(comment_text.innerText,BPid,messageid);
    }

}

function cancelEditing(cancel_edit,confirm_edit,see_more,comment_text,text){
    //hide the cancel and confirm buttons
    cancel_edit.style.display  = "none";
    confirm_edit.style.display = "none";

    //reset the comments content to the original text
    comment_text.innerText = text;

    //re-clamp the comment
    comment_text.hasbeendrawn = "true"; 
    showtext(see_more,comment_text);

    //make the comment not editable
    comment_text.toggleAttribute("contentEditable");
}


function changeflag(element){
    element.classList.toggle("far");
    element.classList.toggle("fas");
}
//function to check overflow of text to enable the see_more button if needed
function showReadMoreButton(element){
    if (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
         return "true";
     } else {
         return "false";
     }
}
function subCancel(text,elem){
    text.innerText = "";
    if (text.getAttribute("isSubComment") == "true"){
        remove_element(text.parentElement);
        elem.setAttribute("SubInputisDrawn","false");
    }
}
function getallChildren(level,commentid,reason){
   var isdrawn =  document.getElementById(commentid).getAttribute("subCommentDrawn");
   for (item of getLevelList(level+1)){
    if(item[9] == commentid){
        if (isdrawn == "false" && reason != "removechildren"){
           // text.innerText = "hide answers";
        document.getElementById(item[4]).style.display = "flex";}
        else {
           // text.innerText = "see answers";
            document.getElementById(item[4]).style.display = "none";
            getallChildren(level+1,item[4],"removechildren");        
        }
    }
}
if (isdrawn == "false" && reason != "removechildren"){document.getElementById(commentid).setAttribute("SubCommentDrawn","true");}
else{document.getElementById(commentid).setAttribute("SubCommentDrawn","false");}
}
function removeallChildren(level,commentid,BP_id){
    for (item of getLevelList(level+1)){
     if(item[9] == commentid){
        removeComment(commentid,BP_id)
        removeallChildren(level+1,item[4],"removechildren");        
         }
     }
}
function subSubmit(text,elem,commentid){
    var message = text.innerText;
    if(lengte(message) >= 1){
    subCancel(text,elem);
    pushcomment(BPid,getcurrentDateTime(),getUserName(),getUserImage(),message,getUserEmail(),elem,updateLevel(elem),commentid); //write comment to db and afterwards draw it locally
    }
}
function updateLevel(elem){
    level = parseInt(elem.getAttribute("level"));
    level += 1;
    return level;
}
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function getUserEmail(){
    var user = firebase.auth().currentUser;
    var photoUrl;
        if (user != null) {
            email = user.email;
            return(email);
    }   
}
function getUserImage(){
var user = firebase.auth().currentUser;
var photoUrl;
    if (user != null) {
        photoUrl = user.photoURL;
        return(photoUrl);
        }   
}
function getUserName(){
    var user = firebase.auth().currentUser;
    var name;
        if (user != null) {
            name = user.displayName;
            return(name);
        }   
}
function showcursor(showmore){
    showmore.style.cursor = "pointer";
}
// remove 1 comment
function remove_element(element){
    myNode = element;
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
    myNode.remove();
}
// remove whole comment section
function remove_comment_elements(){
    myNode = document.getElementById("commentsection");
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
}
// remove top commentbar
function remove_top_searchbar(){
    myNode = document.getElementById("searchbar");
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
}
function displayMore(comment_text,see_more){
    if (showReadMoreButton(comment_text) == "true" ){
        see_more.style.display = "block";
        }
        else {see_more.style.display = "none";}
}