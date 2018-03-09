'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

    /**
     * An amazing panel with super properties
     * @attribute {string} [title] - An optional panel title
     * @container
     */
    var contextMenu = function (_HTMLElement) {
        _inherits(contextMenu, _HTMLElement);

        function contextMenu(self) {
            var _this2, _ret;

            _classCallCheck(this, contextMenu);

            self = (_this2 = _possibleConstructorReturn(this, (contextMenu.__proto__ || Object.getPrototypeOf(contextMenu)).call(this, self)), _this2);
            return _ret = self, _possibleConstructorReturn(_this2, _ret);
        }

        _createClass(contextMenu, [{
            key: 'connectedCallback',
            value: function connectedCallback() {
                this._render();
            }
        }, {
            key: 'disconnectedCallback',
            value: function disconnectedCallback() {}
        }, {
            key: 'attributeChangedCallback',
            value: function attributeChangedCallback(attrName, oldVal, newVal) {}
        }, {
            key: 'open',


            /**
             * Open the context menu
             */
            value: function open() {
                var contextMenu = document.getElementsByClassName('contextMenuBG')[0];
                this.opened = true;
                contextMenu.addEventListener('click', this.closeMenu, true);
                contextMenu.style.display = 'initial';
            }

            /**
             * Close the context menu
             */

        }, {
            key: 'close',
            value: function close() {
                var contextMenu = document.getElementsByClassName('contextMenuBG')[0];
                this.opened = false;
                contextMenu.removeEventListener('click', this.closeMenu);
                contextMenu.style.display = 'none';
            }
        }, {
            key: 'closeMenu',
            value: function closeMenu(e) {
                var contextMenu = document.getElementsByTagName('context-menu')[0];
                contextMenu.close();
            }
        }, {
            key: '_render',
            value: function _render() {
                var container = document.createElement('div');
                container.className = 'contextMenuBG ';
                container.style.display = 'none';

                var menu = document.createElement('div');
                menu.className = 'contextMenu';

                while (this.childNodes.length !== 0) {
                    menu.appendChild(this.childNodes[0]);
                }

                window.addEventListener('resize', this.windowSizeChange);

                container.appendChild(menu);
                this.appendChild(container);
                this.opened = false;
            }
        }, {
            key: 'setContextMenuInner',
            value: function setContextMenuInner(myMenu) {
                console.log('foooooooo');
                if (_typeof(this) !== contextMenu) {
                    var _this = myMenu;
                }

                var contextMenuInner = document.getElementsByClassName('contextMenu')[0];
                var pos = _this.generatePositionOnPage();
                contextMenuInner.style.top = pos.top + 'px';
                contextMenuInner.style.left = pos.left + 'px';

                if (_this.minWidth !== 0 && pos.width < _this.minWidth) {
                    contextMenuInner.style.width = _this.minWidth + 'px';
                } else {
                    contextMenuInner.style.width = pos.width + 'px';
                }
            }
        }, {
            key: 'generatePositionOnPage',
            value: function generatePositionOnPage() {
                console.log('baaarrrrr');
                var callingBtnId = localStorage.callingBtn;
                var callingBtn = document.querySelector('a#' + callingBtnId);

                var callingBtnPos = callingBtn.getBoundingClientRect();
                var padTop = $(callingBtn).css('padding-top');
                var padBot = $(callingBtn).css('padding-bottom');
                var borderWidth = $(callingBtn).css('border-width');

                var padTop = parseInt(padTop.substring(0, padTop.length - 2));
                var padBot = parseInt(padBot.substring(0, padBot.length - 2));
                var borderWidth = parseInt(borderWidth.substring(0, borderWidth.length - 2));

                var top = callingBtnPos.top + padTop + padBot + borderWidth;
                var left = callingBtnPos.left;
                var right = callingBtnPos.right;
                var width = callingBtnPos.width;

                var res = {
                    top: top,
                    left: left,
                    right: right,
                    width: width
                };
                return res;
            }
        }, {
            key: 'windowSizeChange',
            value: function windowSizeChange() {}
        }], [{
            key: 'observedAttributes',
            get: function get() {
                return ["title"];
            }
        }]);

        return contextMenu;
    }(HTMLElement);

    customElements.define('context-menu', contextMenu);
})();