class CustomScrollbarVertical extends HTMLElement {
  constructor() {
    super();
    this.isDragging = false;
    this.startY = 0;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    } else {
      this.attachShadow({ mode: "open" });
    }

    this.targetId = this.dataset.targetId;
    if (!this.targetId) {
      console.warn("CustomScrollbarVertical: `data-target-id` is required.");
      return;
    }

    this.container = document.querySelector(`#${this.targetId}`);
    if (!this.container) {
      console.warn(`CustomScrollbarVertical: Target element with id "${this.targetId}" not found.`);
      return;
    }

    const style = document.createElement("style");
    style.textContent = `
      .scrollbar {
        height: 100%;
        width: 3px;
        border-radius: 5px;
        background-color: rgba(var(--color-foreground), 0.04);
        position: relative;
        cursor: pointer;
      }
      .thumb {
        width: 100%;
        background-color: rgba(var(--color-foreground));
        border-radius: 5px;
        border: 0;
        position: absolute;
        top: 0;
        transition: background-color 0.15s ease;
      }
    `;
    this.shadowRoot.appendChild(style);

    this.shadowRoot.innerHTML += `
      <div class="scrollbar">
        <div class="thumb"></div>
      </div>
    `;

    this.scrollbar = this.shadowRoot.querySelector(".scrollbar");
    this.thumb = this.shadowRoot.querySelector(".thumb");

    this.container.addEventListener("scroll", this.syncThumbPosition.bind(this));
    this.thumb.addEventListener("mousedown", this.handleThumbDragStart.bind(this));
    document.addEventListener("mousemove", this.handleThumbDragging.bind(this));
    document.addEventListener("mouseup", this.handleThumbDragEnd.bind(this));
    window.addEventListener("resize", this.updateThumbHeight.bind(this));
    this.scrollbar.addEventListener("click", this.handleScrollbarClick.bind(this));

    this.updateThumbHeight();
    this.syncThumbPosition();
  }

  updateThumbHeight() {
    if (!this.scrollbar || !this.container) return;

    const scrollbarHeight = this.scrollbar.offsetHeight;
    const contentHeight = this.container.scrollHeight;
    if (contentHeight <= scrollbarHeight) {
      this.style.display = "none";
    } else {
      this.style.visibility = "visible";
      this.style.display = "block";
    }
    this.thumb.style.height = `${(scrollbarHeight / contentHeight) * scrollbarHeight}px`;
  }

  syncThumbPosition() {
    if (!this.scrollbar || !this.container) return;

    const contentScrollTop = this.container.scrollTop;
    const contentScrollRange = this.container.scrollHeight - this.container.clientHeight;
    const thumbMaxScroll = this.scrollbar.offsetHeight - this.thumb.offsetHeight;
    const thumbPosition = (contentScrollTop / contentScrollRange) * thumbMaxScroll;
    this.thumb.style.top = `${thumbPosition}px`;
  }

  handleThumbDragStart(e) {
    this.isDragging = true;
    this.startY = e.clientY - this.thumb.offsetTop;
    document.body.style.userSelect = "none";
  }

  handleThumbDragging(e) {
    if (!this.isDragging) return;
    const scrollbarRect = this.scrollbar.getBoundingClientRect();
    const thumbHeight = this.thumb.offsetHeight;
    const thumbMaxScroll = this.scrollbar.offsetHeight - thumbHeight;
    let newTop = e.clientY - scrollbarRect.top - this.startY;

    newTop = Math.max(0, Math.min(newTop, thumbMaxScroll));
    this.thumb.style.top = `${newTop}px`;

    const contentScrollRange = this.container.scrollHeight - this.container.clientHeight;
    const thumbScrollRatio = newTop / thumbMaxScroll;
    this.container.scrollTop = contentScrollRange * thumbScrollRatio;
  }

  handleThumbDragEnd() {
    this.isDragging = false;
    document.body.style.userSelect = "";
  }

  handleScrollbarClick(e) {
    if (e.target === this.thumb) return;

    const scrollbarRect = this.scrollbar.getBoundingClientRect();
    const clickY = e.clientY - scrollbarRect.top;
    const thumbHeight = this.thumb.offsetHeight;
    const thumbMaxScroll = this.scrollbar.offsetHeight - thumbHeight;

    let newTop = clickY - thumbHeight / 2;
    newTop = Math.max(0, Math.min(newTop, thumbMaxScroll));

    this.thumb.style.top = `${newTop}px`;

    const contentScrollRange = this.container.scrollHeight - this.container.clientHeight;
    const thumbScrollRatio = newTop / thumbMaxScroll;
    this.container.scrollTop = contentScrollRange * thumbScrollRatio;
  }
}

customElements.define("custom-scrollbar-vertical", CustomScrollbarVertical);