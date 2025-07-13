class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    
    if (this.classList.contains('facet-filters-form__header')) {
      const filterToggle = this.querySelector('.facet--button-toggle');
      const closeButton = document.querySelector('.filter-drawer__close');
      const applyButton = document.querySelector('.filter-apply__btn');
      const target = document.getElementById('main-collection-filters') || document.getElementById('main-search-filters');
      const toggleDrawer = () => {
        if(target){
          document.body.classList.toggle('overflow-hidden');
          document.body.classList.toggle('filter-drawer__open');
          target.classList.toggle('is-active');
        }
      };
  
      if (filterToggle) {
        filterToggle.addEventListener("click", () => {
          if (window.matchMedia("(max-width: 989px)").matches) {
            toggleDrawer();
          }
        });
      }
      if (closeButton || applyButton) {
        const closeHandler = () => {
          if (window.matchMedia("(max-width: 989px)").matches) {
            toggleDrawer();
          }
        };
        closeButton && closeButton.addEventListener("click", closeHandler);
        applyButton && applyButton.addEventListener("click", closeHandler);
      }
    }
    window.addEventListener('resize', function(event){
      if (window.matchMedia("(min-width: 990px)").matches) {
        const target = document.getElementById('main-collection-filters') || document.getElementById('main-search-filters');
        if(target){
          document.body.classList.remove('overflow-hidden');
          document.body.classList.remove('filter-drawer__open');
          target.classList.remove('is-active');
        }
      }
    });
    
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const loadingSpinners = document.querySelectorAll('.facets-container .loading__spinner, facet-filters-form .loading__spinner');
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
    
    const productGrid = document.getElementById('product-grid');
    if(productGrid){
      productGrid.classList.add('grid-animation-false');
      const checkMarquee = productGrid.querySelectorAll('.marquee3k');
      if (checkMarquee.length > 0) {
        Marquee3k.init(productGrid);
      }
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    
    const priceRange = parsedHTML.querySelector('price-range');
    if (priceRange) {
      const rangeGroupSliderLabel = priceRange.querySelector('.range-group__slider-label');
      if (rangeGroupSliderLabel) {
        document.querySelector('.range-group__slider-label').innerHTML = rangeGroupSliderLabel.innerHTML;
      }
    }

    const facetDetailsElements = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter'
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newElementSelector = document
          .getElementById(closestJSFilterID)
          .classList.contains('mobile-facets__details')
          ? `#${closestJSFilterID} .mobile-facets__close-button`
          : `#${closestJSFilterID} .facets__summary`;
        const newElementToActivate = document.querySelector(newElementSelector);
        if (newElementToActivate) newElementToActivate.focus();
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
      var checkActiveLength = parseInt(activeFacetsElement.querySelectorAll('facet-remove').length);
      if(checkActiveLength > 1){
        document.querySelector('.active-facets-desktop').classList.remove('hidden');
      }else{
        document.querySelector('.active-facets-desktop').classList.add('hidden');
      }
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    if(this.querySelector('price-range')){
      var getPriceRange = this.querySelector('price-range').getAttribute('style');
      const numericRegex = /\d+(\.\d+)?/;
      const rangeMin = parseFloat((getComputedStyle(this.querySelector('price-range')).getPropertyValue('--filter-range-min')).match(numericRegex)[0]);
      const rangeMax = parseFloat((getComputedStyle(this.querySelector('price-range')).getPropertyValue('--filter-range-max')).match(numericRegex)[0]); 
      if(rangeMin == 0 && rangeMax == 100){
         searchParams = removeQueryParam(searchParams, "filter.v.price.gte");
         searchParams = removeQueryParam(searchParams, "filter.v.price.lte");
      }
    }
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];

      sortFilterForms.forEach((form) => {
        if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
          const noJsElements = document.querySelectorAll('.no-js-list');
          noJsElements.forEach((el) => el.remove());
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach(element => element.addEventListener('input', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    var inputEvent = event.target.dataset.type;
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues(inputEvent);
  }

  setMinAndMaxValues(inputEvent) {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    const maxPrice = inputs[0].getAttribute('max');
    var priceGap = 1;
    var minInputPrice = parseInt(minInput.value);
    var maxInputPrice = parseInt(maxInput.value);

    if(inputEvent != 'high'){
      if(minInputPrice >= maxInputPrice){
        minInput.value = maxInputPrice - priceGap;
        minInputPrice = maxInputPrice - priceGap;
      }
    }
    if(inputEvent == 'high'){
      if(maxInputPrice <= minInputPrice){
        maxInput.value = minInputPrice + priceGap;
        maxInputPrice = minInputPrice + priceGap;
      }
    }
    
    const sliderMinimumValue = (minInputPrice / parseInt(maxPrice) * 100).toFixed(2);
    const sliderMaximumValue = (maxInputPrice / parseInt(maxPrice) * 100).toFixed(2);
    
    this.style.setProperty("--filter-range-min", sliderMinimumValue+'%');
    this.style.setProperty("--filter-range-max", sliderMaximumValue+'%');

  }

  adjustToValidValues(input) {
    return false;
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

function removeQueryParam(url, paramKey) {
  const urlSearchParams = new URLSearchParams(url);
  urlSearchParams.delete(paramKey);
  return urlSearchParams.toString();
}
