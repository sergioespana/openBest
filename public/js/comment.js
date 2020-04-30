var BPid = null;

function startup(BPID){
    create_meta_info();
    comment_input_location = document.getElementById("searchbar");
    create_comment_input(comment_input_location);
    BPid = BPID
    getcomments(BPID);
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

function create_comment_input(elem){
    var newdiv = document.createElement("DIV");
    newdiv.classList.add("newcomment");

    var comment_input = document.createElement("SPAN");
    comment_input.classList.add("textarea");
    comment_input.role = "textbox";
    comment_input.setAttribute("contenteditable", "true");
    comment_input.setAttribute("hasbeendrawn", "false");

    newdiv.appendChild(comment_input);
    elem.appendChild(newdiv);
    //document.getElementById("searchbar").appendChild(newdiv);
    comment_input.addEventListener("focus", function(){addbuttons(newdiv, comment_input)});
}

function addbuttons(div,text){
    draw = text.getAttribute("hasbeendrawn"); 
    
    if(draw == "false"){
    text.setAttribute("hasbeendrawn","true");

    newbuttonbar = document.createElement("DIV");
    newbuttonbar.classList.add("button_bar");
    
    newcancelbutton = document.createElement("INPUT"); 
    newcancelbutton.type = "button";
    newcancelbutton.value = "Cancel";
    newcancelbutton.classList.add("comment_button","cancel_button");

    newsubmitbutton = document.createElement("INPUT");
    newsubmitbutton.type = "button";
    newsubmitbutton.value = "Submit"; 
    newsubmitbutton.classList.add ("comment_button","submit_button");

    newbuttonbar.appendChild(newsubmitbutton); 
    newbuttonbar.appendChild(newcancelbutton);
    newcomment = div;
    newcomment.appendChild(newbuttonbar);
    
    newcancelbutton.addEventListener("click", function(){cancel(newbuttonbar,text)});
    newsubmitbutton.addEventListener("click", function(){submit(newbuttonbar,text)});
    text.addEventListener("input", function(){checklength(newsubmitbutton,text)});
    }
}

function getcurrentDateTime(){
    var date = new Date();
    return (date.toUTCString());
}

function cancel(buttonbar,text){
    text.innerText = "";
    remove_element(buttonbar);
    text.setAttribute("hasbeendrawn","false");
}

function submit(buttonbar,text){
    var message = text.innerText;
    if(lengte(message) >= 1){
    cancel(buttonbar,text);
    pushcomment(BPid,getcurrentDateTime(),getUserName(),getUserImage(),message,getUserEmail()); //write comment to db and afterwards draw it locally
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

function draw_comment(name,date,text,img,commentid,BP_id,issame){
   
   var root = document.getElementById("commentsection");
    
   var comment_wrapper = document.createElement("DIV");
   comment_wrapper.classList.add("comment_wrapper");

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

   if (issame == "true"){
   var remove_comment = document.createElement("i");
   remove_comment.classList.add("fa","fa-trash","remove_button");
   meta_info_wrapper.appendChild(remove_comment);
   remove_comment.addEventListener("click", function(){removeComment(commentid,BP_id,comment_wrapper)}); 
   }
   
   var react_button = document.createElement("p");
   react_button.classList.add("react_button");
   react_button.innerText = "React";

   meta_info_wrapper.appendChild(date_posted_text);
   
   content_wrapper.appendChild(meta_info_wrapper); // plak meta content in de tekstuele content
   content_wrapper.appendChild(comment_text);
   content_wrapper.appendChild(see_more);

   content_wrapper.appendChild(react_button);

   comment_wrapper.appendChild(picture_wrapper); // plak de picture wrapper in de grote wrapper
   comment_wrapper.appendChild(content_wrapper); // plak de tekstuele content in de grote wrapper
   
   root.appendChild(comment_wrapper);//plak totale comment in de commentsectie
   showtext(see_more,comment_text);
   see_more.addEventListener("click", function(){showtext(see_more,comment_text)});
   see_more.addEventListener("mouseover",function(){showcursor(see_more)});
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

function remove_element(element){
    myNode = element;
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
    myNode.remove();
}

function remove_comment_elements(){
    myNode = document.getElementById("commentsection");
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
}

function remove_top_searchbar(){
    myNode = document.getElementById("searchbar");
    while(myNode.hasChildNodes()){
        myNode.removeChild(myNode.firstChild);
    }
}



