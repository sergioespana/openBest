

//start();

// function start(){
// loc  = document.getElementById("ratingsection");
// createStarRating(loc,10)
// }

function createStarRating(root,amount){
  var starRatings = document.createElement("DIV");
  starRatings.classList.add("star-ratings");

  var starUnit = document.createElement("DIV");
  starUnit.classList.add("star-unit");

  var stars = document.createElement("DIV");
  stars.classList.add("stars");
  stars.setAttribute("data-rating",3);
  stars.setAttribute("data-hover",0);

  for(var i=1; i == amount; i++){
  var star = document.createElement("SPAN");
  star.classList.add("star");
  stars.appendChild(star);
  } 
  
  starUnit.appendChild(stars);
  starRatings.appendChild(starUnit);
  root.appendChild(starRatings);
  addListeners(stars);
  setRating(stars);
}



//initial setup
document.addEventListener('DOMContentLoaded', function(){
    //based on value inside the div
  });
  
  function addListeners(stars){
    var stars_ = stars.childNodes;
    [].forEach.call(stars_, function(star, index){
      star.addEventListener('click', (function(idx){
        stars.setAttribute('data-rating',  idx + 1);  
        setRating(stars);
      }).bind(window,index) );
    });  
  }
  
  function setRating(stars){
    var stars_ = stars.childNodes;
    var rating = parseInt( stars.getAttribute('data-rating') );
    [].forEach.call(stars_, function(star, index){
      if(rating > index){
        star.classList.add('rated');
      }else{
        star.classList.remove('rated');
      }
    });
  }






