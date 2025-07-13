(function() {
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return '';
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  let checkAgeVerified = true;
  let checkAgePopupCookie = getCookie("age-verification");
  if (document.querySelectorAll('[data-popup-type="age-verification"]').length > 0 && checkAgePopupCookie === "" && document.querySelectorAll('.theme-modal-popup.design__mode').length === 0) {
    checkAgeVerified = false;
    let ageVerificationPopup = document.querySelector('[data-popup-type="age-verification"]');
    ageVerificationPopup.classList.add("active");
    document.querySelector("body").classList.add("overflow-hidden");
    document.querySelector(".theme-modal-popup__overlay").classList.add("active");
    setTimeout(function(){
      trapFocus(ageVerificationPopup);
    },1500);
  }
  if (checkAgeVerified === true && document.querySelectorAll('.theme-modal-popup.design__mode').length === 0) {
    let checkNewsletterPopupCookie = getCookie("newsletter-popup");
    let newsletterPopup = document.querySelector('[data-popup-type="newsletter"]');
    if (checkNewsletterPopupCookie === "" && newsletterPopup) {
      let popupDelayTime = parseInt(newsletterPopup.dataset.popupDelaySeconds);
      setTimeout(function () {
        newsletterPopup.classList.add("active");
        document.querySelector("body").classList.add("overflow-hidden");
        document.querySelector(".theme-modal-popup__overlay").classList.add("active");
        setTimeout(function () {
          trapFocus(newsletterPopup);
        },500);
      }, popupDelayTime);
    }
  }

  let ageVerifiedButton = document.querySelector(".age-varified__button");
  if (ageVerifiedButton) {
    ageVerifiedButton.addEventListener("click", function(event) {
      event.preventDefault();
      let ageVerificationPopup = document.querySelector('[data-popup-type="age-verification"]');
      let showAgainAgePopup = ageVerificationPopup.dataset.popupDelayDays;
      ageVerificationPopup.classList.remove("active");
      setCookie("age-verification", true, showAgainAgePopup);
      document.querySelector(".theme-modal-popup__overlay").classList.remove("active");
      document.querySelector("body").classList.remove("overflow-hidden");
    });
  }

  let popupClose = document.querySelectorAll('.btn-modal-popup__trigger');
  popupClose.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      let modalId = this.getAttribute('data-modal-id');
      document.querySelector('.theme-modal-popup[data-popup-type="'+modalId+'"]').classList.remove('active');
      document.querySelector(".theme-modal-popup__overlay").classList.remove("active");
      document.querySelector("body").classList.remove("overflow-hidden");
      if(modalId == 'newsletter'){
        let showAgainPopup = document.querySelector('.theme-modal-popup[data-popup-type="'+modalId+'"]').dataset.popupDelayDays;
        setCookie("newsletter-popup", true, showAgainPopup);
      }
    });
  });
})();