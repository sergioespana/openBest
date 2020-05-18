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
                 addtolist([comment_author,comment_date,comment_text,comment_img,comment_id,BPid, issame(comment_email),"main",comment_level,comment_parent]);
             })
            splitlist();
     })
}
// helper function to produce a list from the serepate data entries.
function addtolist(sublist){
     var tussenlijst = [];
     tussenlijst.push(sublist);
     uberlijst.push(tussenlijst);
}
// splits the list gotten from the database into levels so that not the complete list schould be gone over on each ordering.
function splitlist(){
    head   = [];
    first  = [];
    second = [];
    third  = [];
    fourth = [];
    for (doc of uberlijst){
        document1 = doc[0];
        if (document1[8] == 0){head.push(doc[0]);}
        if (document1[8] == 1){first.push(doc[0]);}
        if (document1[8] == 2){second.push(doc[0]);}
        if (document1[8] == 3){third.push(doc[0]);}
        if (document1[8] == 4){fourth.push(doc[0]);}
    }
    console.log(head);
    
    draw_all();
}
// this function calls a function to draw all comments and offers a text if there is no comment to be shown.
function draw_all(){
    if (lengte(head) < 1){
    //create_encouragement();
    }
    else{
        recursive();
    }
}
function checkChildren(messageID,level){
   var hasChildren = getLevelList(level+1).map(x => x[9]).includes(messageID);
   return hasChildren;  
}
function getLevelList(level){
    switch(level){
        case 0:
            return head;
        case 1:
            return first;
        case 2:
            return second;
        case 3:
            return third;
        case 4:
            return fourth;


    }
}
// this function uses draw_comment_db to translate and draw all comments of all levels, every comment above level 0 is not shown but already retrieved.
function recursive(){   
    for (doc1 of head){
        id1 = doc1[4];
        draw_comment_db(doc1,checkChildren(id1,0),"flex");
        higherCounter();
        for (doc2 of first){
            if (doc2[9] == id1){
                id2 = doc2[4];
                draw_comment_db(doc2,checkChildren(id2,1),"none");
                higherCounter();
                for (doc3 of second){
                    if (doc3[9] == id2){
                        id3 = doc3[4];
                        draw_comment_db(doc3,checkChildren(id3,2),"none");
                        higherCounter();
                        for (doc4 of third){
                            if(doc4[9] == id3){
                                id4 = doc4[4];
                                higherCounter();
                                draw_comment_db(doc4,checkChildren(id4,3),"none");
                                for (doc5 of fourth){
                                    if(doc5[9] == id4){
                                        draw_comment_db(doc5,"none","none");
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
// function to translate an entry gotten from the database to a way suitable for draw_comment
function draw_comment_db(doc,haschildren,isdrawn){
    draw_comment(doc[0],doc[1],doc[2],doc[3],doc[4],doc[5],doc[6],doc[7],doc[8],doc[9],haschildren,isdrawn);
}
// highers the total comment counter
function  higherCounter(){
    amountOfComments += 1;
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
}
// lowers the total counter
function  lowerCounter(){
    amountOfComments -= 1;  
    document.getElementById("comment_counter").innerText = amountOfComments + " comments";
}
// remove one comment from the database and remove it from the screeen, last lower the counter.
function removeComment(id,BPid,comment_element){
        startstring = "/domain/domainstate/bestpractices/"
        endstring   = "/comments"
        doelstring  = startstring.concat(BPid,endstring);
        db.collection(doelstring).doc(id).delete();
        if (comment_element){
        remove_element(comment_element);
        }
        lowerCounter();  
}
// push comment to the database and draw it on the screen using its ID once it has been pushed.
function pushcomment(BPid,comment_date,comment_author,comment_img,comment_text,comment_email,comment_thread,comment_level,comment_parent){
        startstring = "/domain/domainstate/bestpractices/";
        endstring   = "/comments";       
        doelstring = startstring.concat(BPid,endstring);
        db.collection(doelstring).add({ //write comment to db
                date:   comment_date,
                author: comment_author,
                img:    comment_img,
                text:   comment_text, 
                email:  comment_email,
                level:  comment_level,
                parent: comment_parent
            }).then(docRef => {
                //append.....
                //add to local representation of database
                add_comment_db_repr(comment_author,comment_date,comment_text,comment_img,docRef.id,BPid, "true",comment_thread,comment_level,comment_parent);

                //drawlocally
                draw_comment(comment_author,"just now",comment_text,comment_img,docRef.id,BPid,"true",comment_thread,comment_level,comment_parent,checkChildren(docRef.id,comment_level) ,"flex"); //once comment has been written to db draw it locally     
                higherCounter();             
            })
}  
// get time difference for the "posted .... ago" statement.    
function getTimeDifference(now,then){
      date_now  = Date.parse(now);
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
// function to check if the current logged in user is the same as the one who made the comment.
function issame (email){
    var currentuser = getUserEmail();
    if (currentuser == email){return "true";}
    else{return "false";}
}

//function to add comments to the local list of comments to display them
function add_comment_db_repr(comment_author,_ ,comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent){
    switch (comment_level){
        case 0:
            head.push([comment_author,"just now",comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent]);
            break;
        case 1:
            first.push([comment_author,"just now",comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent]);
            document.getElementById("answers" + comment_parent).style.display = "block";
            break;
        case 2:
            second.push([comment_author,"just now",comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent]);
            document.getElementById("answers" + comment_parent).style.display = "block";
            break;
        case 3:
            third.push([comment_author,"just now",comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent]);
            document.getElementById("answers" + comment_parent).style.display = "block";
            break;
        case 4:
            fourth.push([comment_author,"just now",comment_text,comment_img,comment_id,BPid,comment_same_author,comment_thread,comment_level,comment_parent]);
            document.getElementById("answers" + comment_parent).style.display = "block";
            break;
    }

}

function editCommentDB(newcommenttext,BPid,id){
    startstring    = "/domain/domainstate/bestpractices/"
    tussenstring   = "/comments/"
    doelstring     = startstring.concat(BPid,tussenstring);
    db.collection(doelstring).doc(id).update({
        text:   newcommenttext
    });



}