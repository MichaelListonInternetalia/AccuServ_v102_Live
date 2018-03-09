"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

  /**
   * NumericToggler component
   * @attribute {number} [initialQuantity] - Starting quantity value
   * @attribute {boolean} [canIncrement] - Are we able to increment the value
   * @attribute {boolean} [canDecrement] - Are we able to decrement the value
   * @event changed - Fired when held value changes
   */
  customElements.define("numeric-toggler", function (_HTMLElement) {
    _inherits(NumericToggler, _HTMLElement);

    function NumericToggler(self) {
      var _this, _ret;

      _classCallCheck(this, NumericToggler);

      self = (_this = _possibleConstructorReturn(this, (NumericToggler.__proto__ || Object.getPrototypeOf(NumericToggler)).call(this, self)), _this);
      self._initialized = false;
      self._quantity = 0;
      self._canIncrement = true;
      self._canDecrement = true;
      self._rendered = false;
      return _ret = self, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(NumericToggler, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        this._initialized = true;
        this._render();
      }
    }, {
      key: "displayQuantity",
      value: function displayQuantity() {
        var quantityField = this.childNodes[1];
        quantityField.innerText = this._quantity;
        this._fireEvent("changed");
      }
    }, {
      key: "displayCanDecrement",
      value: function displayCanDecrement() {
        var el = this.childNodes[2];
        if (this._canDecrement) {
          el.classList.remove("not-available");
        } else {
          el.classList.add("not-available");
        }
      }
    }, {
      key: "displayCanIncrement",
      value: function displayCanIncrement() {
        var el = this.childNodes[2];
        if (this._canIncrement) {
          el.classList.remove("not-available");
        } else {
          el.classList.add("not-available");
        }
      }
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(attrName) {}

      /**
       * Decrement the value in the control
       * 
       */

    }, {
      key: "decrement",
      value: function decrement() {
        if (this._quantity == 0) {
          return false;
        }
        if (this._canDecrement) {
          this.quantity = this._quantity - 1;
        }
      }

      /**
       * Increment the current value
       * 
       */

    }, {
      key: "increment",
      value: function increment() {
        if (this._canIncrement) {
          this.quantity = this._quantity + 1;
        }
      }
    }, {
      key: "decrementQuantityHandler",
      value: function decrementQuantityHandler(e) {
        e = e || window.event;
        var targ = e.target || e.srcElement;
        var id = targ.parentElement.id;
        document.getElementById(id).decrement();
      }
    }, {
      key: "incrementQuantityHandler",
      value: function incrementQuantityHandler(e) {
        debugger;
        e = e || window.event;
        var targ = e.target || e.srcElement;
        var id = targ.parentElement.id;
        document.getElementById(id).increment();
      }
    }, {
      key: "_render",
      value: function _render() {

        function attrToBool(that, attrName, defaultValue) {
          var result = defaultValue;
          if (that.getAttribute(attrName) !== undefined && that.getAttribute(attrName) != null) {
            var attrValue = that.getAttribute(attrName);
            debugger;
            result = attrValue == "true" || attrValue == 1;
          }
          return result;
        }

        if (this._rendered || !this._initialized) return;
        this._rendered = true;

        if (this.getAttribute("initialQuantity") !== undefined && this.getAttribute("initialQuantity") != null) {
          debugger;
          var initialQuantity = this.getAttribute("initialQuantity");
          this._quantity = parseInt(initialQuantity);
        }
        this._canIncrement = attrToBool(this, "canIncrement", true);
        this._canDecrement = attrToBool(this, "canDecrement", true);

        var elDecrement = document.createElement('div');
        elDecrement.className = 'fa minus ' + (this._canDecrement ? '' : 'not-available');
        elDecrement.onclick = this.decrementQuantityHandler;
        //elDecrement.innerHTML = 'DEC';
        this.appendChild(elDecrement);

        var elQuantitiy = document.createElement('div');
        elQuantitiy.innerHTML = this._quantity;
        elQuantitiy.id = 'quantity';
        elQuantitiy.className = 'qty';
        this.appendChild(elQuantitiy);

        var elIncrement = document.createElement('div');
        elIncrement.id = "actIncrement";
        elIncrement.className = 'fa plus ' + (this._canIncrement ? '' : 'not-available');
        elIncrement.onclick = this.incrementQuantityHandler;
        elIncrement.innerHTML = '  ';
        this.appendChild(elIncrement);
      }
    }, {
      key: "_fireEvent",
      value: function _fireEvent(eventName) {
        if (!this._initialized) return;
        console.log('debug:: fireEvent ' + eventName);
        this.dispatchEvent(new CustomEvent(eventName));
      }
    }, {
      key: "quantity",


      /**
       * Get the current quantity
       * @returns {number} - The current value
       */
      get: function get() {
        return this._quantity;
      }

      /**
       * Set the quantity
       * @param {number} val - The quantity value
       */
      ,
      set: function set(val) {
        debugger;
        this._quantity = val;
        this.displayQuantity();
      }

      /**
       * Is the user allowed to dec the value?
       * @returns {boolean} - True or false
       */

    }, {
      key: "canDecrement",
      get: function get() {
        return this._canDecrement;
      }

      /**
       * Set if the user is allowed to dec the value
       * @param {boolean} val - True or false
       */
      ,
      set: function set(val) {
        this._canDecrement = val;
        this.displayCanDecrement();
      }

      /**
        * Is the user allowed to inc the value?
        * @returns {boolean} - True or false
        */

    }, {
      key: "canIncrement",
      get: function get() {
        return this._canIncrement;
      }

      /**
       * Set if the user is allowed to inc the value
       * @param {boolean} val - True or false
       */
      ,
      set: function set(val) {
        this._canIncrement = val;
        this.displayCanIncrement();
      }
    }], [{
      key: "observedAttributes",
      get: function get() {
        return ["initialQuantity", "canIncrement", "canDecrement"];
      }
    }]);

    return NumericToggler;
  }(HTMLElement));
})();