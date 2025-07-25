!(function (t, e) {
  "function" == typeof define && define.amd
    ? define([], e)
    : "object" == typeof exports
    ? (module.exports = e())
    : (t.Marquee3k = e());
})(this, function () {
  "use strict";
  let t = 0;
  class e {
    constructor(t, e) {
      (this.element = t),
        (this.selector = e.selector),
        (this.speed = t.dataset.speed),
        (this.pausable = t.dataset.pausable === "true" ? 1 : -1),
        (this.reverse = t.dataset.reverse === "true" ? 1 : !1),
        (this.paused = !1),
        (this.parent = t.parentElement),
        (this.parentProps = this.parent.getBoundingClientRect()),
        (this.content = t.children[0]),
        (this.innerContent = this.content.innerHTML),
        (this.wrapStyles = ""),
        (this.offset = 0),
        this._setupWrapper(),
        this._setupContent(),
        this._setupEvents(),
        this.wrapper.appendChild(this.content),
        this.element.appendChild(this.wrapper),
        (this.lastFrameTime = null);
    }
    _setupWrapper() {
      (this.wrapper = document.createElement("div")),
        this.wrapper.classList.add("marquee3k__wrapper"),
        (this.wrapper.style.whiteSpace = "nowrap");
    }
    _setupContent() {
      this.content.classList.add(`${this.selector}__copy`),
        (this.content.style.display = "inline-block"),
        (this.contentWidth = this.content.offsetWidth),
        (this.requiredReps =
          this.contentWidth > this.parentProps.width
            ? 2
            : Math.ceil(
                (this.parentProps.width - this.contentWidth) / this.contentWidth
              ) + 1);
      for (let t = 0; t < this.requiredReps; t++) this._createClone();
      this.reverse && (this.offset = -1 * this.contentWidth),
        this.element.classList.add("is-init");
    }
    _setupEvents() {
      this.element.addEventListener("mouseenter", () => {
        this.pausable && (this.paused = !0);
      }),
        this.element.addEventListener("mouseleave", () => {
          this.pausable && (this.paused = !1);
        });
    }
    _createClone() {
      const t = this.content.cloneNode(!0);
      (t.style.display = "inline-block"),
        t.classList.add(`${this.selector}__copy`),
        this.wrapper.appendChild(t);
    }
    animate() {
      if (!this.paused) {
        const currentTime = Date.now();
        let deltaTime = 0;
        if (this.lastFrameTime) {
          deltaTime = currentTime - this.lastFrameTime;
        }
        this.lastFrameTime = currentTime;

        const distanceToMove = this.speed * deltaTime / 16;

        const t = this.reverse
            ? this.offset < 0
            : this.offset > -1 * this.contentWidth,
          e = this.reverse ? -1 : 1,
          s = this.reverse ? -1 * this.contentWidth : 0;
        t ? (this.offset -= distanceToMove * e) : (this.offset = s),
          (this.wrapper.style.whiteSpace = "nowrap"),
          (this.wrapper.style.transform = `translate(${this.offset}px, 0) translateZ(0)`);
      }
    }
    _refresh() {
      this.contentWidth = this.content.offsetWidth;
    }
    repopulate(t, e) {
      if (((this.contentWidth = this.content.offsetWidth), e)) {
        const e = Math.ceil(t / this.contentWidth) + 1;
        for (let t = 0; t < e; t++) this._createClone();
      }
    }
    static refresh(t) {
      MARQUEES[t]._refresh();
    }
    static pause(t) {
      MARQUEES[t].paused = !0;
    }
    static play(t) {
      MARQUEES[t].paused = !1;
    }
    static toggle(t) {
      MARQUEES[t].paused = !MARQUEES[t].paused;
    }
    static refreshAll() {
      for (let t = 0; t < MARQUEES.length; t++) MARQUEES[t]._refresh();
    }
    static pauseAll() {
      for (let t = 0; t < MARQUEES.length; t++) MARQUEES[t].paused = !0;
    }
    static playAll() {
      for (let t = 0; t < MARQUEES.length; t++) MARQUEES[t].paused = !1;
    }
    static toggleAll() {
      for (let t = 0; t < MARQUEES.length; t++)
        MARQUEES[t].paused = !MARQUEES[t].paused;
    }
    static init(s = { selector: "marquee3k" }) {
      if (s && s.dataset && s.dataset.scrolling) {
        const i = Array.from(s.querySelectorAll('.marquee3k'));
        let n,
          r = window.innerWidth;
        for (let t = 0; t < i.length; t++) {
          const n = i[t],
            r = new e(n, s);
          MARQUEES.push(r);
        }
        function animate() {
          for (let t = 0; t < MARQUEES.length; t++) MARQUEES[t].animate();
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
        window.addEventListener("resize", () => {
          clearTimeout(n),
            (n = setTimeout(() => {
              const t = r < window.innerWidth,
                e = window.innerWidth - r;
              for (let s = 0; s < MARQUEES.length; s++)
                MARQUEES[s].repopulate(e, t);
              r = this.innerWidth;
            }, 250));
        });
      } else {
        t && window.cancelAnimationFrame(t), (window.MARQUEES = []);
        const i = Array.from(document.querySelectorAll(`.${s.selector}`));
        let n,
          r = window.innerWidth;
        for (let t = 0; t < i.length; t++) {
          const n = i[t],
            r = new e(n, s);
          MARQUEES.push(r);
        }
        function animate() {
          for (let t = 0; t < MARQUEES.length; t++) MARQUEES[t].animate();
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
        window.addEventListener("resize", () => {
          clearTimeout(n),
            (n = setTimeout(() => {
              const t = r < window.innerWidth,
                e = window.innerWidth - r;
              for (let s = 0; s < MARQUEES.length; s++)
                MARQUEES[s].repopulate(e, t);
              r = this.innerWidth;
            }, 250));
        });
      }
    }
  }
  return e;
});
Marquee3k.init();