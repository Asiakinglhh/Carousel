class Component {
  constructor(id, opts = {name, data: []}) {
    this.container = document.getElementById(id);
    this.options = opts;
    this.container.innerHTML = this.render(opts.data);
  }

  registerPlugins(...plugins) {
    plugins.forEach(plugin => {
      const pluginContainer = document.createElement('div');
      pluginContainer.className = `.${name}__plugin`;
      pluginContainer.innerHTML = plugin.render(this.options.data);
      this.container.appendChild(pluginContainer);

      plugin.action(this);
    })
  }

  render(data) {
    /* abstract */
    return ''
  }
}

class Slider extends Component {
  constructor(id, opts = {name: 'slider-list', data: [], cycle: 3000}) {
    super(id, opts);
    this.items = this.container.querySelectorAll('.slider-list__item, .slider-list__item--selected');
    this.cycle = opts.cycle || 3000;
    this.slideTo(0);
  }

  render(data) {
    const content = data.map(image => `
      <li class="slider-list__item">
        <img src="${image}"/>
      </li>
    `.trim());

    return `<ul>${content.join('')}</ul>`;
  }

  getSelectedItem() {
    return this.container.querySelector('.slider-list__item--selected');
  }

  getSelectedItemIndex() {
    // return Array.from(this.items).indexOf(this.getSelectedItem());
    return Array.prototype.indexOf.call(this.items, this.getSelectedItem());
  }

  slideTo(index) {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      selectedItem.classList.remove('slider-list__item--selected');
    }
    const nextItem = this.items[index];
    if (nextItem) {
      nextItem.classList.add('slider-list__item--selected');
    }

    const detail = { index }
    const event = new CustomEvent('slide', { bubbles: true, detail });
    this.container.dispatchEvent(event);
  }

  slideNext() {
    const currentIndex = this.getSelectedItemIndex()
    const nextIndex = (currentIndex + 1) % this.items.length;

    this.slideTo(nextIndex);
  }

  slidePrev() {
    const currentIndex = this.getSelectedItemIndex()
    const previousIndex = (this.items.length + currentIndex - 1) % this.items.length;
    this.slideTo(previousIndex);
  }

  addEventListener(eventName, callback) {
    this.container.addEventListener(eventName, callback);
  }

  start() {
    this.stop();
    this._timer = setInterval(() => this.slideNext(), this.cycle);
  }

  stop() {
    clearInterval(this._timer);
  }
}

const pluginController = {
  render(images) {
    return `
      <div class="slider-list__control">
        ${images.map((image, i) => `
            <span class="slider-list__control-buttons${i === 0 ? '--selected' : ''}"></span>
          `).join('')}
      </div>
    `.trim();
  },

  action(slider) {
    const controller = slider.container.querySelector('.slider-list__control');
    if (!controller) return;

    const buttons = controller.querySelectorAll('.slider-list__control-buttons, .slider-list__control-buttons--selected');
    controller.addEventListener('mouseover', e => {
      const index = Array.from(buttons).indexOf(e.target);
      if (index >= 0) {
        slider.slideTo(index);
        slider.stop();
      }
    });

    controller.addEventListener('mouseout', e => {
      slider.start();
    });

    slider.addEventListener('slide', e => {
      const index = e.detail.index;
      const selected = controller.querySelector('.slider-list__control-buttons--selected');
      if(selected) selected.className = 'slider-list__control-buttons';
      buttons[index].className = 'slider-list__control-buttons--selected';
    })
  }
}

const pluginPrev = {
  render() {
    return `
      <div class="slider-list__prev"></div>
    `.trim();
  },

  action(slider) {
    const prevButton = slider.container.querySelector('.slider-list__prev');
    if (!prevButton) return;
    prevButton.addEventListener('click', e => {
      slider.stop();
      slider.slidePrev();
      slider.start();
      e.preventDefault();
    })
  }
}

const pluginNext = {
  render() {
    return `
      <div class="slider-list__next"></div>
    `.trim();
  },

  action(slider) {
    const nextButton = slider.container.querySelector('.slider-list__next');
    if (!nextButton) return;
    nextButton.addEventListener('click', e => {
      slider.stop();
      slider.slideNext();
      slider.start();
      e.preventDefault();
    })
  }
}

const slider = new Slider('slider', {
  data: [
    'https://p5.ssl.qhimg.com/t0119c74624763dd070.png',
    'https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg',
    'https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg',
    'https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg'
  ],
  cycle: 3000
});

slider.registerPlugins(pluginController, pluginPrev, pluginNext);
slider.start();