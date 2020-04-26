var db = firebase.firestore();

function getcomments(BPid) {
    startstring = "/domain/domainstate/bestpractices/"
    endstring   = "/comments"
    doelstring = startstring.concat(BPid,endstring);
     // Getting a reference to all documents in the comment sub-collection for bp1
     db.collection(doelstring)
         .get().then((snapshot) => {
             // Each document that matches the query is cycled through
             snapshot.docs.forEach(doc => {
                comment_date = doc.data().date;
                comment_author = doc.data().author; 
                comment_img = doc.data().img; 
                comment_text = doc.data().text;
                draw_comment(comment_author,comment_date,comment_text,comment_img);
             })
     })
   }

    function pushcomment(BPid,comment_date,comment_author,comment_img,comment_text){
        startstring = "/domain/domainstate/bestpractices/";
        endstring   = "/comments";
     
        console.log(comment_author,typeof(comment_author));
            
        doelstring = startstring.concat(BPid,endstring);
        db.collection(doelstring).add({
                date: comment_date,
                author: comment_author,
                img: comment_img,
                text: comment_text  
            })
        }
        
  
    

    function storeData() {
        db.collection("testpractice").add({
            title: "werktditverdorie??",
            author: "Stefan"
        })
    }
    