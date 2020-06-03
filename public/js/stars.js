//function to create the star rating
function createStarRating(root,amount,selected,type){
  
  var starRatings = document.createElement("DIV");
  starRatings.classList.add("star-ratings");

  var starUnit = document.createElement("DIV");
  starUnit.classList.add("star-unit");

  var stars = document.createElement("DIV");
  stars.classList.add("stars");
  stars.setAttribute("data-rating",selected);
  stars.setAttribute("data-hover",0);
  stars.setAttribute("name","stars");
  
 
  for(var i=0; i < amount; i++){
    var star = document.createElement("SPAN");
    star.classList.add("star");
    stars.appendChild(star);
  } 

  starUnit.appendChild(stars);
  starRatings.appendChild(starUnit);
  root.appendChild(starRatings);
  if (type != "readOnly"){
    addListeners(stars);
  }
  setRating(stars);
  return stars;
}

//function to add listeners to all stars.
function addListeners(stars){
  var stars_ = stars.childNodes;
  [].forEach.call(stars_, function(star, index){
    star.addEventListener('click', (function(idx){
      stars.setAttribute('data-rating',  idx + 1);  
      setRating(stars);
    }).bind(window,index) );
  });  
}
  
//function to add the rated class to the star which is selected and all 'lower' stars
function setRating(stars){
  var stars_ = stars.childNodes;
  var rating = parseInt(stars.getAttribute('data-rating') );
  [].forEach.call(stars_, function(star, index){
    if(rating > index){
      star.classList.add('rated');
    }else{
      star.classList.remove('rated');
    }
  });
}






