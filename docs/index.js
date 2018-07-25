'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function (window, document, undefined) {
    var Timeline = function () {
        function Timeline() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, Timeline);

            var settings = _extends({}, Timeline.defaults);

            var i = void 0;
            for (i in options) {
                if ({}.hasOwnProperty.call(Timeline.defaults, i)) {
                    settings[i] = options[i];
                }
            }

            this.settings = settings;
            this.settings.listElementSelector = '[data-year]';

            var nodes = this._nodeArray(this.settings.listElementSelector);

            if (!nodes.length) return;

            this.container = document.querySelector(this.settings.containerSelector);
            this.list = document.querySelector(this.settings.listSelector);
            this.view = document.querySelector(this.settings.viewSelector);

            this.placeNodes(nodes);
            this.setActive(nodes, nodes[0]);
            this.setBackground(nodes[0]);
            this.bindHandlers(nodes);
            this.updateContent();
        }

        _createClass(Timeline, [{
            key: '_defaults',
            value: function _defaults() {
                return Timeline.defaults;
            }
        }, {
            key: '_nodeArray',
            value: function _nodeArray(selector) {
                return Array.prototype.slice.call(this._nodeList(selector), 0);
            }
        }, {
            key: '_nodeList',
            value: function _nodeList(selector) {
                return document.querySelectorAll(selector);
            }
        }, {
            key: '_marker',
            value: function _marker(n) {
                var elem;
                elem = document.createElement('div');
                elem.style.position = 'absolute';
                elem.style.left = n + 'px';
                elem.style.width = '1px';
                elem.style.background = 'blue';
                elem.style.height = '25px';
                elem.style.top = '-12px';

                elem.classList.add(this.settings.markerClassName);

                return elem;
            }
        }, {
            key: '_removeMarkers',
            value: function _removeMarkers() {
                var markers = this._nodeArray('.' + this.settings.markerClassName);
                var marker = void 0;
                while (marker = markers.pop()) {
                    marker.parentNode.removeChild(marker);
                }
            }
        }, {
            key: '_addMarker',
            value: function _addMarker(pos) {
                this.container.appendChild(this._marker(pos));
            }
        }, {
            key: 'placeNodes',
            value: function placeNodes(nodes) {
                var maxWidth = this.container.offsetWidth;
                var buffer = 3;

                var years = void 0;
                var min = void 0;
                var max = void 0;
                var step = void 0;
                var n = void 0;
                var m = void 0;
                var i = void 0;

                years = nodes.map(function (node) {
                    return JSON.parse(node.dataset.year);
                });

                years.sort();

                min = years[0];
                max = years[years.length - 1];

                step = maxWidth / (max - min + buffer * 2);

                n = min - buffer;
                m = max + buffer + 1;
                i = 0;

                while (n < m) {

                    if (this.settings.debug) this._addMarker(i * step);

                    if (years.includes(n)) {
                        document.querySelector('[data-year="' + n + '"]').style.left = i * step + 'px';
                    }

                    n++;
                    i++;
                }
            }
        }, {
            key: 'setActive',
            value: function setActive(nodes, node) {
                var len = nodes.length;
                var i = nodes.indexOf(node);
                var j = i;

                while (j < len) {
                    nodes[j].classList.remove(this.settings.activeClassName);
                    j++;
                }
                while (i > -1) {
                    nodes[i].classList.add(this.settings.activeClassName);
                    i--;
                }
            }
        }, {
            key: 'updateContent',
            value: function updateContent() {
                var _this = this;

                var nodes = this._nodeArray(this.settings.listElementSelector + '.' + this.settings.activeClassName);
                var lastNode = nodes[nodes.length - 1];
                var content = lastNode.querySelector(this.settings.contentSelector);

                this.view.classList.remove(this.settings.contentVisibleClassName);

                setTimeout(function () {
                    _this.view.innerHTML = content.innerHTML;
                    _this.view.classList.add(_this.settings.contentVisibleClassName);
                }, this.settings.contentFadeSpeed);
            }
        }, {
            key: 'updateBackground',
            value: function updateBackground(start, stop, dir) {
                var _this2 = this;

                var increment = 7;
                var pos = start + increment * dir;

                this.list.style.background = ('linear-gradient(\n                                         to right,\n                                         ' + this.settings.gradientColorActive + ' 0%,\n                                         ' + this.settings.gradientColorActive + ' ' + pos + 'px,\n                                         ' + this.settings.gradientColorInctive + ' ' + pos + 'px,\n                                         ' + this.settings.gradientColorInctive + ' 100%)').replace(/\n\s+/g, '');

                if (dir === 1 && pos > stop + increment) return;
                if (dir !== 1 && pos < stop + increment) return;

                setTimeout(function () {
                    return _this2.updateBackground(pos, stop, dir);
                }, 0);
            }
        }, {
            key: 'setBackground',
            value: function setBackground(nextNode) {
                var nodes = this._nodeList(this.settings.listElementSelector + '.' + this.settings.activeClassName);
                var prevNode = nodes[nodes.length - 1];
                var start = prevNode.offsetLeft;
                var stop = nextNode.offsetLeft;
                var dir = start > stop ? -1 : 1;

                this.updateBackground(start, stop, dir);
            }
        }, {
            key: 'bindHandlers',
            value: function bindHandlers(nodes) {
                var self = this;
                var buttons = this._nodeList(this.settings.controlsSelector);

                var i = void 0;
                var j = void 0;
                var resizeTimer = void 0;

                for (i = 0; i < nodes.length; i++) {
                    nodes[i].addEventListener('click', function (e) {
                        self.setBackground(this);
                        self.setActive(nodes, this);
                        self.updateContent();
                    }, false);
                }

                for (j = 0; j < buttons.length; j++) {
                    buttons[j].addEventListener('click', function (e) {
                        e.preventDefault();
                        var dir = JSON.parse(this.dataset.controls);
                        var nodes = self._nodeArray(self.settings.listElementSelector);
                        var active = nodes.filter(function (node) {
                            return node.classList.contains(self.settings.activeClassName);
                        });
                        var index = active.length - 1 + dir;

                        if (nodes[index]) nodes[index].click();
                    }, false);
                }

                window.addEventListener('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
                        var nodes = self._nodeArray(self.settings.listElementSelector);
                        var active = nodes.filter(function (node) {
                            return node.classList.contains(self.settings.activeClassName);
                        });
                        var node = active[active.length - 1];

                        self._removeMarkers();
                        self.placeNodes(nodes);
                        self.updateBackground(node.offsetLeft, node.offsetLeft, 1);
                    }, self.settings.resizeDebounceSpeed);
                }, false);
            }
        }]);

        return Timeline;
    }();

    Timeline.defaults = {
        contentFadeSpeed: 200,
        resizeDebounceSpeed: 60,
        gradientColorActive: '#E73F53',
        gradientColorInctive: '#DADADA',

        containerSelector: '.container__timeline',
        listSelector: '.container__timeline > ol',
        viewSelector: '.container__view .view',
        contentSelector: '[data-content]',
        controlsSelector: '[data-controls]',

        activeClassName: 'current',
        contentVisibleClassName: 'visible',
        markerClassName: 'marker',

        debug: false

    };


    window.Timeline = Timeline;
})(window, document);