"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

  /**
   * Creates a search feature to manipulate items shown in a list
   * @attribute {number} [minCharacters] - Min number of characters to be entered before it will auto-search ahead
   * @attribute {number} [maxResults] - Maximum number of results to output (defaults to 30)
   * @attribute {number=0|1} displayListIfNoSearch - Governs display of results if a search is not active default to 0
   * @attribute {string} [sourceObjectArrayName] - Name of the source object array you want to search (eg. cti.model.customerList). If not specified, sordata in pouchdb will be used as the source
   * @attribute {string} displayArrayName - Name of the array to populate with search results, which you should then bind to a list (eg. cti.model.mySearchResults)
   * @attribute {string} [locationFilter] - Location id filter by which to restrict result selection (empty value will be unfiltered)
   * @attribute {string} [pouchDB] - Select your pouch DB instance
   * @event searchComplete - Fired when a search has finished actioning
   */
  customElements.define("sor-searcher", function (_HTMLElement) {
    _inherits(SORSearcher, _HTMLElement);

    function SORSearcher(self) {
      var _this, _ret;

      _classCallCheck(this, SORSearcher);

      self = (_this = _possibleConstructorReturn(this, (SORSearcher.__proto__ || Object.getPrototypeOf(SORSearcher)).call(this, self)), _this);
      self._initialized = false;
      self._sordata = [];
      return _ret = self, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(SORSearcher, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        this._initialized = true;
        this._buildElements();
        //this._render();
      }
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(attrName) {
        if (!this._initialized) return;

        if (attrName == 'locationFilter') {
          // Filter changed, clear the results
          var target = this.getAttribute("displayArrayName");
          eval(target + ' = []');
          eval('cti.utils.updatePage();');
        }
      }

      /**
       * Re-bind location filtered SOR codes to the model 
       * 
       */

    }, {
      key: "bind",
      value: function bind() {
        this._bind();
      }
    }, {
      key: "_search",
      value: function _search(instance) {
        function trimString(s) {
          var l = 0,
              r = s.length - 1;
          while (l < s.length && s[l] == ' ') {
            l++;
          }while (r > l && s[r] == ' ') {
            r -= 1;
          }return s.substring(l, r + 1);
        }
        function compareObjects(o1, o2) {
          var k = '';
          for (k in o1) {
            if (o1[k] != o2[k]) return false;
          }for (k in o2) {
            if (o1[k] != o2[k]) return false;
          }return true;
        }
        function itemExists(things, thing) {
          for (var i = 0; i < things.length; i++) {
            if (compareObjects(things[i], thing)) return true;
          }return false;
        }

        if (instance.id == "SearchAllSORCodes" || instance.id == "SearchAllOTCStockCodes" || instance.id == "SearchAllVanStockCodes") {
          var value = document.getElementById("searchBoxAll").value;
        } else if (instance.id == "SearchJobSORCodes" || instance.id == "SearchJobOTCStockCodes" || instance.id == "SearchJobVanStockCodes") {
          var value = document.getElementById("searchBoxJob").value;
        } else {
          var value = document.getElementById("searchBox").value;
        }
        var min = instance.getAttribute("minCharacters") || 3;
        var location = instance.getAttribute("locationFilter") || "";
        var source = instance.getAttribute("sourceObjectArrayName");
        var target = instance.getAttribute("displayArrayName");
        var pouch = this.getAttribute("pouchDB");

        if (value === undefined || value.length == 0) {
          (instance || this)._bind();
          return false;
        }
        if (value.length < min || source == undefined || target == undefined) {
          return false;
        }

        var searchArray = [];

        if (source !== undefined && source != null && source != '') {
          searchArray = eval(source);
        } else {
          if (pouch === "otc") {
            searchArray = instance._otcdata;
          } else {
            searchArray = instance._sordata;
          }
        }

        var max = instance.getAttribute("maxResults") || 30;
        var locationFilterId = "";
        if (location != "") locationFilterId = eval(location);
        var results = [];
        for (var i = 0; i < searchArray.length; i++) {
          if (locationFilterId == '' || locationFilterId == searchArray[i].sLocation) {
            for (var key in searchArray[i]) {
              var currentKey = searchArray[i][key];
              var addIt = false;
              if (typeof currentKey === "number") {
                addIt = currentKey == value;
              } else if (typeof currentKey === "string") {
                addIt = currentKey.toLowerCase().indexOf(value.toLowerCase()) != -1;
              }
              if (addIt && !itemExists(results, searchArray[i]) && results.length < max) {
                results.push(searchArray[i]);
              }
            }
          }
        }
        eval(target + ' = results');
        eval('cti.utils.updatePage();');
        (instance || this)._fireEvent("searchComplete");
      }
    }, {
      key: "_buildElements",
      value: function _buildElements() {
        var instance = this;

        if (instance.id == "SearchAllSORCodes" || instance.id == "SearchAllOTCStockCodes" || instance.id == "SearchAllVanStockCodes") {
          var html = '<div class="top"><div class="input-group"><span class="input-group-addon"><span class="fa fa-search"></span></span><input id="searchBoxAll" type="text" class="form-control search-entry"></div></div>';
          this.innerHTML = html;
        } else if (instance.id == "SearchJobSORCodes" || instance.id == "SearchJobOTCStockCodes" || instance.id == "SearchJobVanStockCodes") {
          var _html = '<div class="top"><div class="input-group"><span class="input-group-addon"><span class="fa fa-search"></span></span><input id="searchBoxJob" type="text" class="form-control search-entry"></div></div>';
          this.innerHTML = _html;
        } else {
          var _html2 = '<div class="top"><div class="input-group"><span class="input-group-addon"><span class="fa fa-search"></span></span><input id="searchBox" type="text" class="form-control search-entry"></div></div>';
          this.innerHTML = _html2;
        }

        var el = this.querySelector(".search-entry");
        el.onkeyup = function () {
          instance._search(instance);
        };

        var source = this.getAttribute("sourceObjectArrayName");
        var pouch = this.getAttribute("pouchDB");
        // If we specified a source object, bind/search with that
        if (source !== undefined && source != null && source != '') {
          instance._render();
        } else {
          // Otherwise, load from pouch
          // TODO Probably need a non-obtrusive spinner
          if (pouch === "otc") {
            window.appManager.loadFromDatabase('otcdata', function (doc) {
              // TODO Remove spinner
              instance._otcdata = doc.data;
              instance._render();
            }, function (reason, err) {
              // TODO Remove spinner
              window.appManager.logError('Failed to load OTC data - ' + reason, err);
              instance._render();
            });
          } else {
            window.appManager.loadFromDatabase('sordata', function (doc) {
              // TODO Remove spinner
              instance._sordata = doc.data;
              instance._render();
            }, function (reason, err) {
              // TODO Remove spinner
              window.appManager.logError('Failed to load SOR data - ' + reason, err);
              instance._render();
            });
          }
        }
      }
    }, {
      key: "_render",
      value: function _render() {
        if (!this._initialized) return;
        this._bind();
      }
    }, {
      key: "_bind",
      value: function _bind() {
        var displayListIfNoSearch = this.getAttribute("displayListIfNoSearch") || 1;
        if (displayListIfNoSearch != 1) {
          return;
        }

        var location = this.getAttribute("locationFilter") || "";
        var source = this.getAttribute("sourceObjectArrayName");
        var target = this.getAttribute("displayArrayName");

        if (location == "") {
          eval(target + ' = ' + source);
        } else {
          var results = [];
          var locationFilterId = eval(location);
          var searchArray = [];
          if (source !== undefined && source != null && source != '') {
            searchArray = eval(source);
          } else {
            searchArray = instance._sordata;
          }

          for (var i = 0; i < searchArray.length; i++) {
            if (locationFilterId == searchArray[i].sLocation) {
              results.push(searchArray[i]);
            }
          }
          eval(target + ' = results');
        }
        eval('cti.utils.updatePage();');
      }
    }, {
      key: "_fireEvent",
      value: function _fireEvent(eventName) {
        if (!this._initialized) return;
        console.log('Event ' + eventName + ' raised');
        this.dispatchEvent(new CustomEvent(eventName));
      }
    }], [{
      key: "observedAttributes",
      get: function get() {
        return ["minCharacters", "maxResults", "sourceObjectArrayName", "displayArrayName", "searchComplete", "locationFilter", "pouchDB"];
      }
    }]);

    return SORSearcher;
  }(HTMLElement));
})();