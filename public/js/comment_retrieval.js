uberlijst = [];
var db = firebase.firestore();
var amountOfComments = 0;
function getcomments(BPid) {
   
    startstring = "/domain/domainstate/bestpractices/"
    endstring   = "/comments"
    doelstring = startstring.concat(BPid,endstring);    
    now =  getcurrentDateTime();
     // Getting a reference to all documents in the comment sub-collection for a best practice
     db.collection(doelstring)
         .get().then((snapshot) => {
             // Each document that matches the query is cycled through
             snapshot.docs.forEach(doc => {
                 // for every comment get de relevant info
                comment_date = getTimeDifference(now,doc.data().date);
                comment_author = doc.data().author; 
                comment_img = doc.data().img; 
                comment_text = doc.data().text;
                comment_email = doc.data().email;
                comment_level = doc.data().level;
                comment_parent = doc.data().parent;
                comment_id = doc.id; 
                  // draw the comment   
                 addtolist([comment_author,comment_date,comment_text,comment_img,comment_id,BPid, issame(comment_email),"main",comment_level,comment_parent]);
                // draw_comment(comment_author,comment_date,comment_text,comment_img,comment_id,BPid, issame(comment_email),"main",comment_level);
                //adjust the counter
             //  higherCounter();
             })
            // drawtree();
            splitlist();
     })
   }

 function addtolist(sublist){
     var tussenlijst = [];
     tussenlijst.push(sublist);
     uberlijst.push(tussenlijst);
 }

 function splitlist(){
    var head   = [];
    var first  = [];
    var second = [];
    var third  = [];
    var fourth = [];
    for (doc of uberlijst){
        document1 = doc[0];
        if (document1[8] == 0){head.push(doc[0]);}
        if (document1[8] == 1){first.push(doc[0]);}
        if (document1[8] == 2){second.push(doc[0]);}
        if (document1[8] == 3){third.push(doc[0]);}
        if (document1[8] == 4){fourth.push(doc[0]);}
    }
    
    for (doc1 of head){
        draw_comment_db(doc1);
        higherCounter();
        id = doc1[4];
        for (doc2 of first){
            if (doc2[9] == id){
                draw_comment_db(doc2);
                id = doc2[4];
                higherCounter();
                for (doc3 of second){
                    if (doc3[9] == id){
                        draw_comment_db(doc3);
                        id = doc3[4];
                        higherCounter();
                        for (doc4 of third){
                            if(doc4[9] == id){
                                draw_comment_db(doc4);
                                id = doc4[4];
                                higherCounter();
                                for (doc5 of fourth){
                                    if(doc5[9] == id){
                                        draw_comment_db(doc5);
                                        id = doc5[4];
                                        higherCounter();
                                    }     
                                }
                            }
                        }
                    }
                }
            }
        }
    } 
 }

 function draw_comment_db(doc){
    draw_comment(doc[0],doc[1],doc[2],doc[3],doc[4],doc[5],doc[6],doc[7],doc[8],doc[9]);
 }
 



 function  higherCounter(){
    amountOfComments += 1;  
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
   }
 function  lowerCounter(){
    amountOfComments -= 1;  
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
   }

   function removeComment(id,BPid,comment_element){
        startstring = "/domain/domainstate/bestpractices/"
        endstring   = "/comments"
        doelstring = startstring.concat(BPid,endstring);
        db.collection(doelstring).doc(id).delete();
        remove_element(comment_element);
        lowerCounter();
   }


    function pushcomment(BPid,comment_date,comment_author,comment_img,comment_text,comment_email,comment_thread,comment_level,comment_parent){
        startstring = "/domain/domainstate/bestpractices/";
        endstring   = "/comments";       
        doelstring = startstring.concat(BPid,endstring);
        db.collection(doelstring).add({ //write comment to db
                date: comment_date,
                author: comment_author,
                img: comment_img,
                text: comment_text, 
                email: comment_email,
                level: comment_level,
                parent: comment_parent
            }).then(docRef => {
                draw_comment(comment_author,"just now",comment_text,comment_img,docRef.id,BPid,"true",comment_thread,comment_level); //once comment has been written to db draw it locally     
                higherCounter();             
            })
        }

        
  function getTimeDifference(now,then){
      date_now = Date.parse(now);
      date_then = Date.parse(then);
      difference_seconds = Math.floor((date_now-date_then)/1000); 
      difference_minutes = Math.floor(difference_seconds/60);
      difference_hours   = Math.floor(difference_minutes/60);
      difference_days    = Math.floor(difference_hours/24);
      difference_weeks   = Math.floor(difference_days/7);
      difference_months  = Math.floor(difference_days/30);
      difference_years   = Math.floor((date_now-date_then)/(3.1556926 * 10^10)); 
      stam = " ago";
      var grootte = null;
    if (difference_seconds < 5){return ("just now");}
    else if (difference_seconds >= 5 && difference_seconds <= 59)
    {   grootte = " seconds";
        string = difference_seconds + grootte + stam;
        return (string);}
    else if (difference_minutes >= 1 && difference_minutes <= 59){
        if(difference_minutes == 1){grootte = " minute";}
        else{grootte = " minutes";}
        string = difference_minutes + grootte + stam;
        return (string);}
    else if (difference_hours >= 1 && difference_hours <= 23){
        if (difference_hours == 1){grootte = " hour";}
        else{grootte = " hours";}
        string = difference_hours + grootte + stam;
        return (string);}
    else if (difference_days >= 1 && difference_days <= 6){
        if(difference_days == 1){grootte = " day";}
        else{grootte = " days";}
        string = difference_days + grootte + stam;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 4 && difference_months <= 1){
        if (difference_weeks == 1){ grootte = " week";}
        else {grootte = " weeks";}
        string = difference_weeks + grootte + stam;
        return (string);}
    else if (difference_weeks >= 1 && difference_weeks <= 11 || difference_months > 1){
        if (difference_months == 1){grootte = " month";}
        else {grootte = " months";}
        string = difference_months + grootte + stam;
        return (string);}
    else if (difference_years >= 1){
        if (difference_years == 1){grootte = " year";}
        else{grootte = " years";}
        string = difference_years + grootte + stam;
        return (string);}
    }
  
function issame (email){
    var currentuser = getUserEmail();
    if (currentuser == email){
        return "true";
    }
    else{
        return "false";
    }
}