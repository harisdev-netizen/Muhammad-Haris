document.addEventListene("DOMContentLoaded", function() {
  const trigger = document.querySelector(".top-bar__mobile-trigger");
  const mobileElements = document.querySelectorAll(".top-bar__hide-mobile");

  if (!trigger || !mobileElements.length) return;

  trigger.addEventListener("click", function() {
    this.classList.toggle("active");
    isActive = !isActive;

    mobileElements.forEach(function(element) {
      const elementHeight = element.scrollHeight;
      element.style.height = isActive ? '${elementHeight}.px' : '0px';
      element.style.marginTop = isActive ? '15px' : '0';
    });
  });
});