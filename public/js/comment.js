

var BPid = null;
function startup(BPID){
    BPid = BPID;
    create_comment_input();
    getcomments(BPid);
    console.log(BPid);
    
}

function showtext(see_more_id,text_id){
    var tbutton  = document.getElementById(see_more_id);
    var tekstvak = document.getElementById(text_id);
    var isshown  = tekstvak.hasbeendrawn;  
    if (isshown == "false"){
        tbutton.innerText = "See less";
        tekstvak.classList.remove("line-clamp","line-clamp-2");
        document.getElementById(text_id).hasbeendrawn = "true";
    }
    else {
        tbutton.innerText = "See more";
        tekstvak.classList.add("line-clamp","line-clamp-2");
        document.getElementById(text_id).hasbeendrawn = "false";
}}

function create_comment_input(){
    var newdiv = document.createElement("DIV");
    newdiv.classList.add("newcomment");
    newdiv.id = getid();

    var comment_input = document.createElement("SPAN");
    comment_input.id = getid();
    comment_input.classList.add("textarea");
    comment_input.role = "textbox";
    comment_input.setAttribute("contenteditable", "true");
    comment_input.setAttribute("hasbeendrawn", "false");

    newdiv.appendChild(comment_input);
    document.getElementById("searchbar").appendChild(newdiv);
    document.getElementById(comment_input.id).addEventListener("focus", function(){addbuttons(newdiv.id, comment_input.id)});
}

function addbuttons(divid,textid){
    draw = document.getElementById(textid).getAttribute("hasbeendrawn"); 
    
    if(draw == "false"){
    document.getElementById(textid).setAttribute("hasbeendrawn","true");

    newcancelbutton = document.createElement("INPUT"); 
    newcancelbutton.type = "button";
    newcancelbutton.value = "Cancel";
    newcancelbutton.classList.add("comment_button","cancel_button");
    newcancelbutton.id = getid();

    newsubmitbutton = document.createElement("INPUT");
    newsubmitbutton.type = "button";
    newsubmitbutton.value = "Submit"; 
    newsubmitbutton.classList.add ("comment_button","submit_button");
    newsubmitbutton.id = getid();

    newcomment = document.getElementById(divid);
    newcomment.appendChild(newsubmitbutton); 
    newcomment.appendChild(newcancelbutton);

    document.getElementById(newcancelbutton.id).addEventListener("click", function(){cancel(newcancelbutton.id,newsubmitbutton.id,textid)});
    document.getElementById(newsubmitbutton.id).addEventListener("click", function(){submit(newcancelbutton.id,newsubmitbutton.id,textid)});
    document.getElementById(textid).addEventListener("input", function(){checklength(newsubmitbutton.id,textid)});
    }
}

function getcurrentDateTime(){
    var d = new Date();
    return (d.toUTCString());
}


function cancel(cancel_id,submit_id,text_id){
    document.getElementById(text_id).innerText = "";
    document.getElementById(cancel_id).remove();
    document.getElementById(submit_id).remove();
    document.getElementById(text_id).setAttribute("hasbeendrawn","false");
}

function submit(cancel_id,submit_id,text_id){
    var message = document.getElementById(text_id).innerText;
    if(lengte(message) >= 1){
    cancel(cancel_id,submit_id,text_id);
    pushcomment(BPid,getcurrentDateTime(),getUserName(),getUserImage(),message);
    remove_comment_elements();
    getcomments(BPid);
    }
}

function checklength(newsubmitbutton,textid){
  var text = document.getElementById(textid).innerText;  
  if (lengte(text) >= 1){
    document.getElementById(newsubmitbutton).style.background = "rgb( 48, 158, 191)";
  }
  else{
  document.getElementById(newsubmitbutton).style.background = "buttonface";
  }
}

function draw_comment(name,date,text,img){

   var root = document.getElementById("commentsection");

   var comment_wrapper   = document.createElement("DIV");
   comment_wrapper.classList.add("comment_wrapper");

   var picture_wrapper   = document.createElement("DIV");
   picture_wrapper.classList.add("picture_wrapper");

   var content_wrapper   = document.createElement("DIV");
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
   comment_text.id = getid();
   comment_text.setAttribute("hasbeendrawn", "false");

   var see_more = document.createElement("p");
   see_more.classList.add("see_more");
   see_more.id = getid();
   
   meta_info_wrapper.appendChild(name_text);
   meta_info_wrapper.appendChild(date_posted_text);
   content_wrapper.appendChild(meta_info_wrapper); // plak meta content in de tekstuele content
   content_wrapper.appendChild(comment_text);
   content_wrapper.appendChild(see_more);
   
   comment_wrapper.appendChild(picture_wrapper); // plak de picture wrapper in de grote wrapper
   comment_wrapper.appendChild(content_wrapper); // plak de tekstuele content in de grote wrapper
   
   root.appendChild(comment_wrapper);//plak totale comment in de commentsectie
   showtext(see_more.id,comment_text.id);
   document.getElementById(see_more.id).addEventListener("click", function(){showtext(see_more.id,comment_text.id)});
   document.getElementById(see_more.id).addEventListener("mouseover",function(){showcursor(see_more.id)});
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

function showcursor(id){
    document.getElementById(id).style.cursor = "pointer";
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

