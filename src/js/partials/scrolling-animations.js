//Animate CSS + WayPoints javaScript Plugin

function animate(elem, animationName) {
  var elem = document.querySelectorAll(elem);
  var obj = {
    element: elem,
    handler: function(direction) {
      if (elem) {
        for (var i = 0; i < elements.length; i++) {
          elem[i].style.opacity='0';
          elem[i].classList.add('animated');
          elem[i].classList.add('fadeInDown');
          elem[i].style.opacity='1';
        }
      }
    },
    offset: '90%'
  }
  return obj;
}

var waypoint = new Waypoint(animate('.features-list__item', 'fadeInDown'));

var elements = document.querySelectorAll('.features-list__item');
for (var i = 0; i < elements.length; i++) {
    elements[i].style.opacity='0';
    elements[i].classList.add('animated');
    elements[i].classList.add('fadeInDown');
    elements[i].style.opacity='1';
  }
