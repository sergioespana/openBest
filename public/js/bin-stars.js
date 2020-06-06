
//function to draw the binary rating mechanism
function createBinaryStarRating(root,amtPos,amtNeg,type,negdefault,plusdefault){
  var negdefault = parseInt(negdefault);
  var plusdefault = parseInt(plusdefault);


  var binStarsRatings = document.createElement("div");
  binStarsRatings.classList.add("bin-star-ratings");
  binStarsRatings.setAttribute("data-rating",0);
  binStarsRatings.setAttribute("name","binstars");
  binStarsRatings.style.marginTop   = 'auto';
  binStarsRatings.style.marginBottom = 'auto';

  var binStarsUnit    = document.createElement("div");
  binStarsUnit.classList.add("bin-star-unit");

  var postext = document.createElement('p');
  postext.innerText = plusdefault;
  postext.style.marginBottom = '0px';
  postext.style.width = '20%';

  var negtext = document.createElement('p');
  negtext.innerText =  negdefault;
  negtext.style.marginBottom = '0px';
  negtext.style.width = '20%';

  //negstars wrapper
  var negStars        = document.createElement("div");
  negStars.setAttribute("data-rating", negdefault);

  //individual negstars
  var negstars = [];
  for(var i=0; i < amtNeg; i++){
    var star = document.createElement("SPAN");
    star.classList.add("nstar");
    negstars.push(star);
    negStars.appendChild(star);
  } 

  //text to display assigned score
  var text            = document.createElement("p");
  text.classList.add("text_rating");
  text.style.fontWeight = "900";
  text.style.width = '20%';
  text.innerText = Math.round((negdefault + plusdefault)*10)/10;

  //posstars wrapper
  var posStars        = document.createElement("div");
  posStars.setAttribute("data-rating", plusdefault);

  //individual postars
  var posstars = [];
  for(var i=0; i < amtPos; i++){
    var star = document.createElement("SPAN");
    star.classList.add("pstar");
    posstars.push(star);
    posStars.appendChild(star);
  } 
  
  if (type != "readOnly" && type != "readOnlyAgg"){
  //listeners for all stars
  addListenerbin(negstars,negStars,posstars,posStars,text,amtPos,amtNeg,binStarsRatings);
  addListenerbin(posstars,posStars,negstars,negStars,text,amtPos,amtNeg,binStarsRatings);
  }

  //fill the stars according to the default values
  setRatingbin(posstars,posStars,'>=',Array.from(new Array(amtPos),(val,index)=>index+1));
  var negslist = Array.from(new Array(amtNeg),(val,index)=>index+1).map(value => -value).reverse();
  setRatingbin(negstars,negStars,'<=', negslist);
  
  if (type == "readOnlyAgg"){
  binStarsUnit.appendChild(negtext);
  }
  binStarsUnit.appendChild(negStars);
  binStarsUnit.appendChild(text);
  binStarsUnit.appendChild(posStars);
  if (type == "readOnlyAgg"){
  binStarsUnit.appendChild(postext);
}

  binStarsRatings.appendChild(binStarsUnit);
  root.appendChild(binStarsRatings);
  return binStarsRatings;
}


//function to assign scores based on the selecter star option.
function addListenerbin(star,set_star,other_star,other_set_star,text,amtPos,amtNeg,binStarsRatings){
  var negslist = Array.from(new Array(amtNeg),(val,index)=>index+1).map(value => -value).reverse();//make array [-n, -n+1, -n+2.....]
  [].forEach.call(star, function(star_, index){
    star_.addEventListener('click', (function(idx){     
      if (star_.classList.contains('pstar')){ // add listener for positive stars
      set_star.setAttribute('data-rating',  idx + 1); //change rating value to the star wrapper
      setRatingbin(star,set_star,'>=',Array.from(new Array(amtPos),(val,index)=>index+1)); //make array [1..n]// set rating
    }
      else if (star_.classList.contains('nstar')){ // add listerner for negative stars
      set_star.setAttribute('data-rating', negslist [idx]); //change rating value to the star wrapper
      setRatingbin(star,set_star,'<=', negslist); // add rating attribute to individual stars
      }      
    resetscore(other_star,other_set_star); // reset score of the other stars (mutual exclusion between negative and positive star ratings)
    updatetext (text ,getTotal(set_star,other_set_star,binStarsRatings));// update the text indicating the assigned score
    
    }).bind(window,index));
  }); 
}

//function to assign the rated class to the selected star and all stars with a lower scale e.g. color all stars till the selected star
function setRatingbin(stars, star_set,operator, support){
  var rating = parseInt(star_set.getAttribute('data-rating')); 
  [].forEach.call(stars, function(star_, index){
    boolstring = rating.toString().concat(operator,support[index].toString());  
    if(eval(boolstring)){
      star_.classList.add('rated');
      }
    else{
      star_.classList.remove('rated');
    }
  });
}

//function to calculate the resulting rating
function getTotal(wrapperNeg,wrapperPos,binStarsRatings){
  rating1 = parseInt( wrapperPos.getAttribute('data-rating')); 
  rating2 = parseInt( wrapperNeg.getAttribute('data-rating'));
  total  = rating1 + rating2;
  binStarsRatings.setAttribute("data-rating",total);
  return (total);
}

//supporting function for mutual exclusion between the positive and negative stars
function resetscore(stars,set_star){
  set_star.setAttribute('data-rating',  0); 
  [].forEach.call(stars,function(star_){
    star_.classList.remove('rated');
  })
}

//supporting function to change the innertext of the score element
function updatetext(textcontainer,text){
  textcontainer.innerText = text;
}

  
