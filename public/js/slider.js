var db = firebase.firestore();
var counter = 0;
var idlist = [];

function lengte (l1){
  var lengte = 0;
  for (_ in l1){
      lengte += 1;
  }
  return lengte;
}


window.addEventListener('DOMContentLoaded', (event) => {
  addAll();
  realtime();
});

//realtime update
function realtime() {
    var output = document.querySelectorAll('output')[0];
    $(document).on('input', 'input[type="range"]', function(e) {
          document.querySelector('output.'+ this.id).innerHTML = e.target.value;
    });
  };

//update zodra de slider losgelaten is  
  $(".slider").on("change", function() {
    addAll();
  });
 
  
  function addAll() {
      var sum = 0; 
      $('.slider').each(function (){        
         sum += parseFloat(this.value) || 0; 
      });
      $('#total').html(sum);
  }

// ------------------------------------------------------- //


function getAvg(l1) {
  const total = l1.reduce((acc, c) => acc + c, 0);
  return total / l1.length;
}

function fillbars(BPid) {
 var scale = [];
 var score = [];
 startstring = "/domain/domainstate/bestpractices/"
 endstring   = "/ratings"
 doelstring = startstring.concat(BPid,endstring);
  // Getting a reference to all documents in the comment sub-collection for bp1
  db.collection(doelstring)
      .get().then((snapshot) => {
          // Each document that matches the query is cycled through
          snapshot.docs.forEach(doc => {
             scale.push(doc.data().scale);
             score.push(doc.data().score);        
          })
         lijst = maketuple(score,scale[0]);
         console.log(lijst);
         
         test(lijst);
  })
}

function maketuple(L1,tupletje){
  goodorientation = transpose(L1);
  tuplelist = [];
  for (sublist of goodorientation){
    tuple = [];
    var a = goodorientation.indexOf(sublist);
    tuple.push(tupletje[a]);
    tuple.push(getAvg(sublist));
    tuple.push(lengte(sublist));
    tuplelist.push(tuple);
  }
  return (tuplelist);
}

function test (L1){
  for (substring of L1){
    barid = createbar();
    var max = substring[0];
    var avg = substring[1];
    updatethebars(barid,"text",avg ,max );  
  }
}

function updatethebars(bar_id,text_id,score,scale){
  document.getElementById(bar_id).max        = scale;
  document.getElementById(bar_id).step       = score - Math.floor(score);
  document.getElementById(bar_id).disabled   = true;
  document.getElementById(bar_id).value      = score;
  var para = document.createElement('p');
  var text = document.createTextNode(score);
  para.appendChild(text);
  document.getElementById("card_body").appendChild(para);
}

function createbar() {
  var newDiv = document.createElement("div"); 
  newDiv.class = "sliding-unit"
  var bar = document.createElement("INPUT");
  bar.type = "range";
  bar.class = "slider";
  bar.id = getid();
  newDiv.appendChild(bar); 
  var para = document.createElement('p');
  var text = document.createTextNode("testestestest");
  para.appendChild(text);
  newDiv.appendChild(para);
  document.getElementById("card_body").appendChild(newDiv);
  return (bar.id);
}

function getid() {
 counter += 1;
 basisstring = "iD";
 idstring = basisstring.concat(counter);
 idlist.push(idstring);
 return idstring;
}

function transpose(a) {
  // Calculate the width and height of the Array
  var w = a.length || 0;
  var h = a[0] instanceof Array ? a[0].length : 0;
  // In case it is a zero matrix, no transpose routine needed.
  if(h === 0 || w === 0) { return []; }
  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  var i, j, t = [];
  // Loop through every item in the outer array (height)
  for(i=0; i<h; i++) {
    // Insert a new row (array)
    t[i] = [];
    // Loop through every item per item in outer array (width)
    for(j=0; j<w; j++) {
      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }
  return t;
}





