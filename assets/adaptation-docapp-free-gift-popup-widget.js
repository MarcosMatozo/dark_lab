window.addEventListener('load', docappShippingAdapt);

async function docappShippingAdapt() {
  let elapsed = 0;
  const interval = setInterval(() => {
    const shippEl = document.querySelector('.docapp-promo-popup-container');

    
    if (shippEl) {
      clearInterval(interval);
      cloneAndObserve(shippEl);
    } else {
      elapsed += 1000;
      if (elapsed >= 10000) {
        clearInterval(interval);
      }
    }
  }, 1000);

  function cloneAndObserve(shippEl) {
    // Initial clone
    cloneElement(shippEl);

    // Set up MutationObserver to watch for changes
    const observer = new MutationObserver((mutationsList, observer) => {
      console.log('mut', mutationsList)
      cloneElement(shippEl);
    });
    observer.observe(shippEl, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  function cloneElement(shippEl) {
    // Remove previous clones if needed
    const placeToPut = document.querySelector('.cart-drawer__footer') || document.querySelector('.cart_right_sec .footer-js-contents');
    if ( !placeToPut ) return;

    const prevClone = document.querySelector('.cart-drawer-note__total .docapp-promo-popup-container') || document.querySelector('.cart_right_sec .docapp-promo-popup-container');
    prevClone && prevClone.remove();

    // Clone and append
    const clndShippEl = shippEl.cloneNode(true);
    clndShippEl.style.display = 'block';
    placeToPut.after(clndShippEl);

    console.log('111 shippEl', shippEl)
    console.log('111 clndShippEl', clndShippEl)
    console.log('111 placeToPut', placeToPut)


    //Verify if there is gifts to select
    if(clndShippEl.querySelector('.docapp-gift-re-choice-button')){

      clndShippEl.querySelectorAll('.docapp-promo-offer-card').forEach(function(el, i){
        if (! el.querySelector('.docapp-gift-re-choice-button')) return;
        const btn = el.querySelector('.docapp-gift-re-choice-button');
        btn.addEventListener('click', function(e){
          e.preventDefault();
          shippEl.querySelectorAll('.docapp-promo-offer-card')[i]?.querySelector('.docapp-gift-re-choice-button')?.click();
        });
      });
   
    }
  }
}