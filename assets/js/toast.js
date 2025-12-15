// toast.js (ESM)
const Toast = (function () {
  const version = '1.0.0';

  function Toast(options) {
    return new Toast.lib.init(options);
  }

  Toast.lib = Toast.prototype = {
    toast: version,
    constructor: Toast,

    init(options = {}) {
      this.options = {
        text: options.text || 'Hi there!',
        duration: options.duration ?? 3000,
        callback: options.callback || (() => {}),
        close: options.close || false,
        icon: options.icon || 'info',
        type: options.type || 'info',
        onClick: options.onClick,
        destination: options.destination,
        newWindow: options.newWindow,
      };

      this.toastElement = null;
      return this;
    },

    buildToast() {
      if (!this.options) throw new Error('Toast is not initialized');

      const div = document.createElement('div');
      div.className = `toast on toast-bottom toast-${this.options.type}`;
      div.innerHTML = this.options.text;

      if (this.options.icon) {
        div.insertAdjacentHTML(
          'afterbegin',
          `<svg class="toast-icon"><use xlink:href="#symbol-${this.options.icon}" /></svg>`
        );
      }

      if (this.options.close) {
        const closeEl = document.createElement('span');
        closeEl.innerHTML = '&#10006;';
        closeEl.className = 'toast-close';
        closeEl.addEventListener('click', (event) => {
          event.stopPropagation();
          this.removeElement(event.target.parentElement);
          clearTimeout(event.target.parentElement.timeOutValue);
        });

        div.addEventListener('mouseover', () => clearTimeout(div.timeOutValue));
        div.addEventListener('mouseleave', () => {
          div.timeOutValue = setTimeout(() => this.removeElement(div), this.options.duration);
        });

        div.appendChild(closeEl);
      }

      if (this.options.destination) {
        div.addEventListener('click', (event) => {
          event.stopPropagation();
          if (this.options.newWindow) {
            window.open(this.options.destination, '_blank');
          } else {
            window.location.href = this.options.destination;
          }
        });
      } else if (typeof this.options.onClick === 'function') {
        div.addEventListener('click', (event) => {
          event.stopPropagation();
          this.options.onClick();
        });
      }

      return div;
    },

    showToast() {
      this.toastElement = this.buildToast();
      const root = document.body;
      if (!root) throw new Error('Root element is not defined');

      root.insertBefore(this.toastElement, root.firstChild);
      Toast.reposition();

      if (this.options.duration > 0) {
        this.toastElement.timeOutValue = setTimeout(
          () => this.removeElement(this.toastElement),
          this.options.duration
        );
      }

      return this;
    },

    hideToast() {
      clearTimeout(this.toastElement?.timeOutValue);
      this.removeElement(this.toastElement);
    },

    removeElement(el) {
      if (!el) return;
      el.className = el.className.replace(' on', '');
      setTimeout(() => {
        el.parentNode?.removeChild(el);
        this.options.callback.call(el);
        Toast.reposition();
      }, 400);
    },
  };

  Toast.reposition = function () {
    const spacing = 15;
    let bottomOffset = spacing;
    const allToasts = document.getElementsByClassName('toast');

    for (const t of allToasts) {
      t.style.bottom = bottomOffset + 'px';
      bottomOffset += t.offsetHeight + spacing;
    }

    return this;
  };

  Toast.lib.init.prototype = Toast.lib;

  return Toast;
})();

export default Toast;
