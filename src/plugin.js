import videojs from 'video.js';

class Dropdown {
  constructor(player) {
    this.player = player;
    this.sources = [];
    this.callback = undefined;
    this.containerDropdownElement = undefined;
    this.defaults = {};
    this.changeDropdownItemName = true;
  }

	/**
	 * event on selected the item
	 */
  onDropdownItemSelect(item) {
    if (this.callback) {
      this.callback(item);
    }

    if (this.sources) {
      // tries to find the source with this item
      let source = this.sources.find(ss => ss.format === item.code);

      if (source) {
        this.player.src({ src: source.src, type: source.type });
        let whereYouAt = this.player.currentTime();

        this.player.on('loadedmetadata', () => {
          this.player.currentTime(whereYouAt);
          this.player.play();

          Array.from(this.containerDropdownElement.firstChild.childNodes).forEach(ele => {
            if (ele.dataset.code === item.code) {
              ele.setAttribute('class', 'current');
            } else {
              ele.removeAttribute('class');
            }
          });
        });
      }

      const player = document.getElementById(this.player.id_);
      const dropdown = player.getElementsByClassName('vjs-brand-dropdown-link');

      if (this.changeDropdownItemName && dropdown && dropdown.length > 0) {
        dropdown[0].innerText = item.name;
      }
    }

    this.onToggleDropdown();
  }

	/**
	 * show or hide the dropdown
	 */
  onToggleDropdown() {
    if (this.containerDropdownElement.className.indexOf('show') === -1) {
      this.containerDropdownElement.className += ' show';
    } else {
      const className = this.containerDropdownElement.className.replace(' show', '');

      this.containerDropdownElement.className = className;
    }
  }

	/**
	 * Function to invoke when the player is ready.
	 *
	 * This is a great place for your plugin to initialize itself. When this
	 * function is called, the player will have its DOM and child components
	 * in place.
	 *
	 * @function onPlayerReady
	 * @param    {Player} player
	 * @param    {Object} [options={}]
	 */
  onPlayerReady(options) {
    this.containerDropdownElement = document.createElement('div');
    this.containerDropdownElement.className = 'vjs-dropdown-dropdown';

    let containerElement = document.createElement('div');

    containerElement.className = 'vjs-dropdown-container';

    let buttonElement = document.createElement('button');

    buttonElement.className = 'vjs-brand-dropdown-link';
    buttonElement.onclick = (event) => this.onToggleDropdown(event);
    buttonElement.innerText = options.text || 'Dil / Lang';

    let ulElement = document.createElement('ul');

    if (!options.formats) {
      options.formats = [{ code: 'auto', name: 'Auto' }];
    }

    if (options.onFormatSelected) {
      this.callback = options.onFormatSelected;
    }

    if (options.sources) {
      this.sources = options.sources;
    }

    if (options.hasOwnProperty('changeDropdownItemName')) {
      this.changeDropdownItemName = options.changeDropdownItemName;
    }

    options.formats.map((format) => {
      let liElement = document.createElement('li');

      liElement.dataset.code = format.code;

      let linkElement = document.createElement('a');

      linkElement.innerText = format.name;
      linkElement.setAttribute('href', '#');
      linkElement.addEventListener('click', (event) => {
        event.preventDefault();
        this.onDropdownItemSelect(format);
      });

      liElement.appendChild(linkElement);
      ulElement.appendChild(liElement);
    });

    this.containerDropdownElement.appendChild(ulElement);
    containerElement.appendChild(this.containerDropdownElement);
    containerElement.appendChild(buttonElement);

    const fullScreenToggle = this.player.controlBar.fullscreenToggle.el();

    this.player.controlBar.el().insertBefore(containerElement, fullScreenToggle);

    this.player.addClass('vjs-dropdown');
  }
}

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a 'ready' state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for 'ready'!
 *
 * @function dropdown
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const dropdown = function(options) {
  this.ready(() => {
    let dropdownControl = new Dropdown(this);

    dropdownControl.onPlayerReady(videojs.mergeOptions(dropdownControl.defaults, options));
  });
};

// Register the plugin with video.js.
const registerPlugin = videojs.registerPlugin || videojs.plugin;

registerPlugin('dropdown', dropdown);

// Include the version number.
dropdown.VERSION = '__VERSION__';

export default dropdown;
