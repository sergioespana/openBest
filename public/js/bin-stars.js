
//initial setup
document.addEventListener('DOMContentLoaded', function(){
    addListenerbin('.nstar','.neg-stars');
    addListenerbin('.pstar','.pos-stars');
 }
  );
  
  function addListenerbin(star,set_star){
    var stars = document.querySelectorAll(star);
    var negslist = [-5,-4,-3,-2,-1];
    [].forEach.call(stars, function(star_, index){
      star_.addEventListener('click', (function(idx){
        if (star === '.pstar'.valueOf()){ // add listener for positive stars
        document.querySelector(set_star).setAttribute('data-rating',  idx + 1);  
        setRatingbin(star,set_star,'>=',[1,2,3,4,5]);
        resetscore('.nstar','.neg-stars');
        updatetext ("text_rating" ,getTotal());
      }
        else if (star === '.nstar'.valueOf()){ // add listerner for negative stars
        document.querySelector(set_star).setAttribute('data-rating', neglist [idx] );  
        setRatingbin(star,set_star,'<=',[-5,-4,-3,-2,-1]);
        resetscore('.pstar','.pos-stars');
        updatetext ("text_rating" ,getTotal());
        }  
      }).bind(window,index));
    }); 
  }

  function setRatingbin(star, star_set,operator, lijst){
    var stars = document.querySelectorAll(star);
    var rating = parseInt( document.querySelector(star_set).getAttribute('data-rating')); 
    [].forEach.call(stars, function(star_, index){
      support = lijst
      boolstring = rating.toString().concat(operator,support[index].toString());  
      if(eval(boolstring)){
        star_.classList.add('rated');
      }else{
        star_.classList.remove('rated');
      }
    });
  }

  function getTotal(){
    rating1 = parseInt( document.querySelector('.pos-stars').getAttribute('data-rating')); 
    rating2 = parseInt( document.querySelector('.neg-stars').getAttribute('data-rating'));
    totaal  = rating1 + rating2;
    return (totaal);
  }

  function resetscore(star,set_star){
    var stars = document.querySelectorAll(star);
    document.querySelector(set_star).setAttribute('data-rating',  0); 
    [].forEach.call(stars,function(star_){
      star_.classList.remove('rated');
    })
  }

  function updatetext(textid,text){
    var paragraph = document.getElementById(textid);
    paragraph.textContent = text;
  }

  
