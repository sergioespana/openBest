//function to create the star rating
function createStarRating(root,amount,selected,type){
  
  var starRatings = document.createElement("DIV");
  starRatings.classList.add("star-ratings");
  starRatings.style.marginTop = 'auto';
  starRatings.style.marginBottom = 'auto';

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

//function to create starrating result (non responsive)
function starRatingResult(root,percentage,max){
    var score       =  document.createElement('span');
    score.classList.add("score");
    score.style.marginBottom = 'auto';
    score.style.marginTop    = 'auto';
    var scoreWrap   =  document.createElement('div');
    scoreWrap.style.textAlign = 'left';      
    scoreWrap.classList.add("score-wrap");
  
    var starsActive =  document.createElement('span');
    starsActive.classList.add("stars-active");
    starsActive.style.width = percentage + '%';
  
    for (i= 0; i < max; i++){
      var star = document.createElement('span');
      star.innerHTML = '★'
      star.classList.add("star_");
      star.setAttribute('aria-hidden', 'true');
      starsActive.appendChild(star);
    }
  
    var starsInactive = document.createElement('span');
    starsInactive.classList.add("stars-inactive");
  
    for (i= 0; i < max; i++){
      var star = document.createElement('span');
      star.innerHTML = '★'
      star.classList.add("star_");
      star.setAttribute('aria-hidden', 'true');
      starsInactive.appendChild(star);
    }
  
    scoreWrap.appendChild(starsActive);
    scoreWrap.appendChild(starsInactive);
    score.appendChild(scoreWrap);
    root.appendChild(score);
  }
  
  
  
  




