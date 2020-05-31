
//function to draw the binary rating mechanism
function createBinaryStarRating(root,amtPos,amtNeg){
  binStarsRatings = document.createElement("div");
  binStarsRatings.classList.add("bin-star-ratings");

  binStarsUnit    = document.createElement("div");
  binStarsUnit.classList.add("bin-star-unit");

  //negstars wrapper
  negStars        = document.createElement("div");
  negStars.setAttribute("data-rating", -1);
  negStars.setAttribute("data-hover",0);

  //individual negstars
  var negstars = [];
  for(var i=0; i < amtNeg; i++){
    var star = document.createElement("SPAN");
    star.classList.add("nstar");
    negstars.push(star);
    negStars.appendChild(star);
  } 
  
  //text wrapper
  textDiv         = document.createElement("div");
  textDiv.classList.add("divider_");
  //text to display assigned score
  text            = document.createElement("p");
  text.classList.add("text_rating");
  text.style.fontWeight = "900";
  text.innerText = "0";
  textDiv.appendChild(text);

  //posstars wrapper
  posStars        = document.createElement("div");
  posStars.setAttribute("data-rating", 1);
  posStars.setAttribute("data-hover",0);

  //individual postars
  var posstars = [];
  for(var i=0; i < amtPos; i++){
    
    var star = document.createElement("SPAN");
    star.classList.add("pstar");
    posstars.push(star);
    posStars.appendChild(star);
  } 
  
  //listeners for all stars
  addListenerbin(negstars,negStars,posstars,posStars,text,amtPos,amtNeg);
  addListenerbin(posstars,posStars,negstars,negStars,text,amtPos,amtNeg);
  binStarsUnit.appendChild(negStars);
  binStarsUnit.appendChild(textDiv);
  binStarsUnit.appendChild(posStars);

  binStarsRatings.appendChild(binStarsUnit);
  root.appendChild(binStarsRatings);
}


  //function to assign scores based on the selecter star option.
  function addListenerbin(star,set_star,other_star,other_set_star,text,amtPos,amtNeg){
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
      updatetext (text ,getTotal(set_star,other_set_star));// update the text indicating the assigned score
      
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
      }else{
        star_.classList.remove('rated');
      }
    });
  }

  //function to calculate the resulting rating
  function getTotal(wrapperNeg,wrapperPos){
    rating1 = parseInt( wrapperPos.getAttribute('data-rating')); 
    rating2 = parseInt( wrapperNeg.getAttribute('data-rating'));
    totaal  = rating1 + rating2;
    return (totaal);
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

  
