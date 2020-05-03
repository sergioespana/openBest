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
    var tekstvak = text;
    var isshown  = tekstvak.hasbeendrawn;  
    if (isshown == "false"){
        tbutton.innerText = "See less";
        tekstvak.classList.remove("line-clamp","line-clamp-2");
        text.hasbeendrawn = "true";
    }
    else {
        tbutton.innerText = "See more";
        tekstvak.classList.add("line-clamp","line-clamp-2");
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

   var picture_wrapper = document.createElement("DIV");
   picture_wrapper.classList.add("picture_wrapper");

   var content_wrapper = document.createElement("DIV");
   content_wrapper.classList.add("content");

   var meta_info_wrapper = document.createElement("DIV");
   meta_info_wrapper.classList.add("meta_info");

   var picture = document.createElement("img");
   picture.src = img;
   picture.classList.add("picture");
   picture_wrapper.appendChild(picture);//plak de afbeelding in de picture wrapping

   var name_text = document.createElement("p");
   name_text.classList.add("name");
   name_text.innerText = name;

   var date_posted_text = document.createElement("p");
   date_posted_text.classList.add("date_poster");
   date_posted_text.innerText = date;
      
   var comment_text = document.createElement("p");
   comment_text.innerText = text;
   comment_text.classList.add("comment_text","line-clamp","line-clamp-2");
   comment_text.setAttribute("hasbeendrawn", "false");

   var see_more = document.createElement("p");
   see_more.classList.add("see_more");
   
   meta_info_wrapper.appendChild(name_text);

   //if current user is the same as the comment writer he can remove the comment
   if (issame == "true"){
   var remove_comment = document.createElement("i");
   remove_comment.classList.add("fa","fa-trash","remove_button");
   meta_info_wrapper.appendChild(remove_comment);
   remove_comment.addEventListener("click", function(){removeComment(commentid,BP_id,comment_wrapper)}); 
   }

   meta_info_wrapper.appendChild(date_posted_text);
   content_wrapper.appendChild(meta_info_wrapper); // plak meta content in de tekstuele content
   content_wrapper.appendChild(comment_text);
   content_wrapper.appendChild(see_more);
 
     
   if (level < 4){  //if thread nesting is below 5 then the commenters can comment on a nested comment.
    var react_button = document.createElement("p");
    react_button.classList.add("react_button");
    react_button.innerText = "React";
    content_wrapper.appendChild(react_button);
    react_button.addEventListener("mouseover",function(){showcursor(react_button)});
    react_button.addEventListener("click",function(){create_comment_input(comment_wrapper,"true",commentid)});
    }
      
    
    var see_answers = document.createElement("p");
    see_answers.innerText = "see answers";
    see_answers.classList.add("see_answers");
    see_answers.id = "answers" + commentid;
    see_answers.addEventListener("click",function(){getallChildren(level,commentid)});
    see_more.addEventListener("mouseover",function(){showcursor(see_answers)});
    content_wrapper.appendChild(see_answers);

   if (haschildren == true){
    see_answers.style.display = "block";
    }
    else{see_answers.style.display = "none";}
 
   comment_wrapper.appendChild(picture_wrapper); // plak de picture wrapper in de grote wrapper
   comment_wrapper.appendChild(content_wrapper); // plak de tekstuele content in de grote wrapper
   
   if(thread == "main"){
   var root = document.getElementById("commentsection");
   root.appendChild(comment_wrapper);//plak totale comment in de commentsectie
   }
   else{
   var root = thread;
   insertAfter(comment_wrapper,root);
   }
   showtext(see_more,comment_text);
   see_more.addEventListener("click", function(){showtext(see_more,comment_text)});
   see_more.addEventListener("mouseover",function(){showcursor(see_more)});
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
        document.getElementById(item[4]).style.display = "flex";}
        else {
            document.getElementById(item[4]).style.display = "none";
            getallChildren(level+1,item[4],"removechildren");
        }
    }
}

if (isdrawn == "false" && reason != "removechildren"){document.getElementById(commentid).setAttribute("SubCommentDrawn","true");}
else{document.getElementById(commentid).setAttribute("SubCommentDrawn","false");
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