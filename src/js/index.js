;(function(window, document, undefined) {

    class Timeline {
        static defaults = {
            contentFadeSpeed: 200,
            resizeDebounceSpeed: 60,
            gradientColorActive: '#E73F53',
            gradientColorInctive: '#DADADA',

            containerSelector: '.container__timeline',
            listSelector: '.container__timeline > ol',
            listElementSelector: '[data-year]',
            viewSelector: '.container__view .view',
            contentSelector: '[data-content]',

            activeClassName: 'current',
            contentVisibleClassName: 'visible',

            debug: false,

        }
        constructor(options = {}) {
            const settings = {...Timeline.defaults}

            let i
            for (i in options) {
                if ({}.hasOwnProperty.call(Timeline.defaults, i)) {
                    settings[i] = options[i]
                }
            }

            this.settings = settings


            const nodes = this._nodeArray(this.settings.listElementSelector)

            if (!nodes.length) return

            this.container = document.querySelector(this.settings.containerSelector)
            this.list = document.querySelector(this.settings.listSelector)
            this.view = document.querySelector(this.settings.viewSelector)


            this.placeNodes(nodes)
            this.setActive(nodes, nodes[0])
            this.setBackground(nodes[0])
            this.bindHandlers(nodes)
            this.updateContent()

        }

        _nodeArray(selector) {
            return Array.prototype.slice.call(this._nodeList(selector), 0)
        }
        _nodeList(selector) {
            return document.querySelectorAll(selector)
        }

        marker(n) {
            var elem
            elem = document.createElement('div')
            elem.style.position = 'absolute'
            elem.style.left = n + 'px'
            elem.classList.add('marker')

            return elem
        }

        placeNodes(nodes) {
            const maxWidth = this.container.offsetWidth
            const buffer = 3

            let years
            let min
            let max
            let step
            let n
            let m
            let i


            years = nodes.map(function(node) {
                return JSON.parse(node.dataset.year)
            })

            years.sort()

            min = years[0]
            max = years[years.length - 1]

            step = maxWidth / (max - min + (buffer * 2))


            n = min - buffer
            m = max + buffer + 1
            i = 0

            while (n < m) {

                if (this.settings.debug) this.container.appendChild(this.marker(i * step))

                if (years.includes(n)) {
                    document.querySelector('[data-year="'+ n +'"]').style.left = (i * step) + 'px'
                }

                n++
                i++

            }
        }

        setActive(nodes, node) {
            const len = nodes.length
            let i = nodes.indexOf(node)
            let j = i

            while (j < len) {
                nodes[j].classList.remove(this.settings.activeClassName)
                j++
            }
            while (i > -1) {
                nodes[i].classList.add(this.settings.activeClassName)
                i--
            }
        }

        updateContent() {
            const nodes = this._nodeArray('[data-year].current')
            const lastNode = nodes[nodes.length - 1]
            const content = lastNode.querySelector(this.settings.contentSelector)

            this.view.classList.remove('visible')

            setTimeout(() => {
                this.view.innerHTML = content.innerHTML
                this.view.classList.add(this.settings.contentVisibleClassName)
            }, this.settings.contentFadeSpeed)

        }

        updateBackground(start, stop, dir) {
            const increment = 7
            const pos = start + (increment * dir)

            this.list.style.background = 'linear-gradient( \
                                         to right, \
                                         '+ this.settings.gradientColorActive +' 0%, \
                                         '+ this.settings.gradientColorActive +' '+ pos +'px, \
                                         '+ this.settings.gradientColorInctive +' '+ pos +'px, \
                                         '+ this.settings.gradientColorInctive +' 100%)'

            if (dir === 1 && pos > stop + increment) return
            if (dir !== 1 && pos < stop + increment) return

            setTimeout(() => this.updateBackground(pos, stop, dir), 0)
        }

        setBackground(nextNode) {
            const nodes = this._nodeList('[data-year].current')
            const prevNode = nodes[nodes.length - 1]
            const start = prevNode.offsetLeft
            const stop = nextNode.offsetLeft
            const dir = start > stop ? -1 : 1

            this.updateBackground(start, stop, dir)
        }


        bindHandlers(nodes) {
            const self = this
            const buttons = this._nodeList('[data-controls]')

            let i
            let j
            let resizeTimer

            for (i = 0; i < nodes.length; i++) {
                nodes[i].addEventListener('click', function(e) {
                    self.setBackground(this)
                    self.setActive(nodes, this)
                    self.updateContent()
                }, false)
            }

            for (j = 0; j < buttons.length; j++) {
                buttons[j].addEventListener('click', function(e) {
                    e.preventDefault()
                    var dir = JSON.parse(this.dataset.controls)
                    var nodes = self._nodeArray('[data-year]')
                    var current = nodes.filter(function(node) {
                        return node.classList.contains(self.settings.activeClassName)
                    })

                    var index = current.length - 1 + dir
                    if (nodes[index]) nodes[index].click()
                }, false)
            }

            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(function() {
                    var nodes = self._nodeArray('[data-year]')
                    var current = nodes.filter(function(node) {
                        return node.classList.contains(self.settings.activeClassName)
                    })
                    var node = current[current.length - 1]

                    self.placeNodes(nodes)
                    self.updateBackground(node.offsetLeft, node.offsetLeft, 1)
                }, self.settings.resizeDebounceSpeed)
            }, false)
        }

    }


    window.Timeline = Timeline

})(window, document);
