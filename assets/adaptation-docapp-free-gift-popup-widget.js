window.addEventListener('load', docappShippingAdapt);

async function docappShippingAdapt() {
  let elapsed = 0;
  const interval = setInterval(() => {
    const shippEl = document.querySelector('.docapp-promo-popup-container');
    if (shippEl) {
      console.log('shippEl found: mut', shippEl);
      clearInterval(interval);
      cloneAndObserve(shippEl);
    } else {
      elapsed += 1000;
      if (elapsed >= 5000) {
        clearInterval(interval);
      }
    }
  }, 1000);

  function cloneAndObserve(shippEl) {
    // shippEl.style.display = 'block';
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
    const placeToPut = document.querySelector('.cart-drawer__footer');
    const prevClone = document.querySelector('.cart-drawer-note__total .docapp-promo-popup-container');
    if (prevClone) prevClone.remove();

    // Clone and append
    const clndShippEl = shippEl.cloneNode(true);
    clndShippEl.style.display = 'block !important';
    placeToPut.after(clndShippEl);
  }
}