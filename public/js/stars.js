
//initial setup
document.addEventListener('DOMContentLoaded', function(){
   addListeners();
   setRating(); //based on value inside the div
  });
  
  function addListeners(){
    var stars = document.querySelectorAll('.star');
    [].forEach.call(stars, function(star, index){
      star.addEventListener('click', (function(idx){
        document.querySelector('.stars').setAttribute('data-rating',  idx + 1);  
        setRating();
      }).bind(window,index) );
    });  
  }
  
  function setRating(){
    var stars = document.querySelectorAll('.star');
    var rating = parseInt( document.querySelector('.stars').getAttribute('data-rating') );
    [].forEach.call(stars, function(star, index){
      if(rating > index){
        star.classList.add('rated');
      }else{
        star.classList.remove('rated');
      }
    });
  }






