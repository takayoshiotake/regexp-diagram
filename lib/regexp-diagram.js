class RegExpDiagram {
    static setup(document) {
        RegExpDiagram._document = document
    }

    constructor(regexp) {
        let pattern
        if (typeof regexp === 'string') {
            // TODO: Check flags and remove '/' on head and tail if needed...
            pattern = regexp
        }
        else if (regexp instanceof RegExp) {
            if (regexp.flags.indexOf('u') != -1) {
                console.log(`Warning: Regular expression flag 'u' is not supported.`)
            }

            pattern = regexp.source
        }
        else {
            throw `Error: Not supported parameter type for regexp: type=${typeof regexp}`
        }

        this._pattern = pattern
        this._groupNumber = 0
        this.stations = this._readStations(pattern)
    }

    get pattern() {
        return this._pattern
    }

    /**
     * Analyzes pattern
     * 
     * @param {*} pattern 
     * @param {*} firstIndex for append _textRange attribute
     * @returns {[RegExpDiagramStation]} stations
     */
    _readStations(pattern, firstIndex = 0) {
        let isRepeatable = (type) => {
            return type === 'character' || type === 'classified' || type === 'group' || type === 'selection'
        }

        let stations = []
        while (pattern.length > 0) {
            let { station, lastIndex } = this._readStation(pattern, firstIndex)
            station._textRange = { firstIndex, lastIndex: firstIndex + lastIndex }
            firstIndex += lastIndex

            if (station.type === 'repeat') {
                if (stations.length == 0) {
                    throw 'Syntax error: Nothing to repeat'
                }

                let lastStation = stations[stations.length - 1]
                if (!isRepeatable(lastStation.type)) {
                    throw 'Syntax error: Nothing to repeat'
                }
                if (station.value === '?') {
                    if (typeof lastStation.repeat !== 'undefined') {
                        if (lastStation.repeat.nonGreedy) {
                            throw 'Syntax error: duplicated non-greedy'
                        }
                        lastStation.repeat.nonGreedy = true
                    }
                    else {
                        lastStation.repeat = { min: 0, max: 1 }
                    }
                }
                else {
                    lastStation.repeat = station.value
                }
            }
            else {
                stations.push(station)
            }

            pattern = pattern.substr(lastIndex)
        }

        stations = this._merge(stations)
        // Calculates with operators: '|'
        stations = this._calculate(stations)
        return stations
    }

    /**
     * Reads a station
     * @param {string} pattern 
     * @param {*} firstIndex for append _textRange attribute
     * @return {RegExpDiagramStation} station
     */
    _readStation(pattern, firstIndex = 0) {
        // Operator
        if (pattern[0] === '|') {
            return { station: {
                type: 'operator',
                value: '|'
            }, lastIndex: 1 }
        }

        // group
        if (pattern[0] == '(') {
            let i
            let nest = 1
            for (i = 1; i < pattern.length; ++i) {
                let c = pattern[i]
                if (c == '(') {
                    nest += 1
                }
                else if (c == ')') {
                    nest -= 1
                }
                else if (c == '\\') {
                    i += 1 // skip next character
                }
                if (nest == 0) {
                    break
                }
            }
            if (nest != 0) {
                throw `Syntax error: missing ')'`
            }

            if (pattern.startsWith('(?:')) {
                // non-capturing parentheses
                return { station: {
                    type: 'group',
                    value: this._readStations(pattern.substr(3, i - 3), firstIndex + 3)
                }, lastIndex: i + 1 }
            }
            else if (pattern.startsWith('(?=')) {
                // lookahead
                return { station: {
                    type: 'group',
                    value: this._readStations(pattern.substr(3, i - 3), firstIndex + 3),
                    lookahead: 'positive'
                }, lastIndex: i + 1 }
            }
            else if (pattern.startsWith('(?!')) {
                // lookahead
                return { station: {
                    type: 'group',
                    value: this._readStations(pattern.substr(3, i - 3), firstIndex + 3),
                    lookahead: 'negative'
                }, lastIndex: i + 1 }
            }
            else
            {
                // capturing parentheses
                this._groupNumber += 1
                let groupNumber = this._groupNumber
                return { station: {
                    type: 'group',
                    value: this._readStations(pattern.substr(1, i - 1), firstIndex + 1),
                    groupNumber
                }, lastIndex: i + 1 }
            }
        }

        // Repeat
        if (pattern[0] === '*') {
            return { station: {
                type: 'repeat',
                value: { min: 0, max: -1 }
            }, lastIndex: 1 }
        }
        else if (pattern[0] === '+') {
            return { station: {
                type: 'repeat',
                value: { min: 1, max: -1 }
            }, lastIndex: 1 }
        }
        else if (pattern[0] === '?') {
            return { station: {
                type: 'repeat',
                value: pattern[0]
            }, lastIndex: 1 }
        }
        else {
            let re = /^\{(\d+)(,(\d+)?)?\}/g
            let result = re.exec(pattern)
            if (result) {
                if (result[3]) {
                    return { station: {
                        type: 'repeat',
                        value: { min: result[1], max: result[3]}
                    }, lastIndex: re.lastIndex }
                }
                else if (result[2]) {
                    return { station: {
                        type: 'repeat',
                        value: { min: result[1], max: -1 }
                    }, lastIndex: re.lastIndex }
                }
                return { station: {
                    type: 'repeat',
                    value: { min: result[1], max: result[1] }
                }, lastIndex: re.lastIndex }
            }
        }

        // Classified
        for (let cs in RegExpDiagram.CLASSIFIED_STRING) {
            if (pattern.startsWith(cs)) {
                return { station: {
                    type: 'classified',
                    value: RegExpDiagram.CLASSIFIED_STRING[cs]
                }, lastIndex: cs.length }
            }
        }
        // Classified: \cX, \xhh, \uhhhh
        {
            {
                let re = /^\\c([A-Za-z])/g
                let result = re.exec(pattern)
                if (result) {
                    let letter = result[1].toUpperCase()
                    let hex = (letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1).toString(16).padStart(2, '0')
                    return { station: {
                        type: 'classified',
                        value: `ctrl-${letter} (0x${hex})`
                    }, lastIndex: re.lastIndex }
                }
            }
            {
                let re = /^\\x([0-9A-Za-z]{2})/g
                let result = re.exec(pattern)
                if (result) {
                    let hex = result[1].toUpperCase()
                    return { station: {
                        type: 'classified',
                        value: `0x${hex}`
                    }, lastIndex: re.lastIndex }
                }
            }
            {
                let re = /^\\u([0-9A-Za-z]{4})/g
                let result = re.exec(pattern)
                if (result) {
                    let hex = result[1].toUpperCase()
                    return { station: {
                        type: 'classified',
                        value: `U+${hex}`
                    }, lastIndex: re.lastIndex }
                }
            }
        }

        // selection (characterSet)
        {
            let re = /^\[(.*?(?:[^\\](?=])|\\\\(?=])))\]/g
            let result = re.exec(pattern)
            if (result) {
                let value = result[1]
                if (value.length > 0 && value[0] == '^') {
                    value = value.substr(1)
                    return { station: {
                        type: 'selection',
                        value: this._listSelection(value),
                        negativeSelection: true
                    }, lastIndex: re.lastIndex }
                }
                else {
                    return { station: {
                        type: 'selection',
                        value: this._listSelection(value)
                    }, lastIndex: re.lastIndex }
                }
            }
        }

        // Character (escape sequence)
        if (pattern[0] == '\\') {
            if (pattern.length > 1) {
                if ("123456789".indexOf(pattern[1]) != -1) {
                    return { station: {
                        type: 'classified',
                        value: `ref #${pattern[1]}`
                    }, lastIndex: 2 }
                }

                // NOTE: on-effective escape sequence
                return { station: {
                    type: 'character',
                    value: pattern[1]
                }, lastIndex: 2 }
            }
            else {
                throw `Syntax error: invalid escape sequence`
            }
        }

        return { station: {
            type: 'character',
            value: pattern[0]
        }, lastIndex: 1 }
    }

    _listSelection(pattern) {
        let stations = []
        while (pattern.length > 0) {
            // HACK: read special character
            if ('^$*+?.(|{['.indexOf(pattern[0]) != -1) {
                stations.push({
                    type: 'character',
                    value: pattern[0]
                })
                pattern = pattern.substr(1)
                continue
            }
            else if (pattern.startsWith('\\b')) {
                stations.push({
                    type: 'classified',
                    value: 'backspace (0x08)'
                })
                pattern = pattern.substr(2)
                continue
            }
            else if (pattern.startsWith('\\B') || pattern.startsWith('\\-') || pattern.startsWith('\\\\')) {
                stations.push({
                    type: 'character',
                    value: pattern[1]
                })
                pattern = pattern.substr(2)
                continue
            }
            else if (pattern[0] == '-') {
                stations.push({
                    type: 'operator',
                    value: pattern[0]
                })
                pattern = pattern.substr(1)
                continue
            }

            let { station, lastIndex } = this._readStation(pattern)
            station._originalValue = pattern.substr(0, lastIndex)

            stations.push(station)
            pattern = pattern.substr(lastIndex)
        }

        let calculated = []
        let merges = false
        for (let station of stations) {
            if (station.type === 'operator' && station.value == '-') {
                merges = true
                continue
            }
            if (merges) {
                let lastStation = calculated.pop()
                calculated.push({
                    type: 'characterRange',
                    value: [lastStation, station]
                })
                merges = false
            }
            else {
                calculated.push(station)
            }
        }
        if (merges) {
            let lastStation = stations.pop()
            lastStation.type = 'character'
            calculated.push(lastStation)
        }
        return calculated
    }

    _merge(stations) {
        let merged = []
        for (let station of stations) {
            if (merged.length == 0) {
                merged.push(station)
                continue
            }

            let lastStation = merged[merged.length - 1]
            if (lastStation.type === 'character' && !lastStation.repeat && station.type === 'character' && !station.repeat) {
                lastStation.value += station.value
                lastStation._textRange.lastIndex = station._textRange.lastIndex
                continue
            }

            merged.push(station)
        }
        return merged
    }

    _calculate(stations) {
        // Splits with operator '|' (branch)
        if (!stations.find(it => it.type === 'operator' && it.value == '|')) {
            return stations
        }

        // FIXME: The following should be able to simple...
        let splitted = []
        var buf = []
        for (let station of stations) {
            if (station.type === 'operator' && station.value == '|') {
                splitted.push(buf)
                buf = []
            }
            else {
                buf.push(station)
            }
        }
        splitted.push(buf)

        return [
            {
                type: 'branch',
                value: splitted
            }
        ]
    }

    draw(style) {
        return new RegExpDiagram.Drawer(this.stations, style).svg()
    }
}

/*
schema:
  RegExpDiagramStation:
    type: object
    properties:
      type:
        type: string
        enum:
          - character
          - characterRange
          - classified
          - group
          - operator
          - repeat
          - selection
      value:
        type: string
*/

RegExpDiagram.CLASSIFIED_STRING = {
    '^'    : 'beginning of line',
    '$'    : 'end of line',
    '.'    : 'any character',
    '[\\b]': 'backspace (0x08)',
    '\\b'  : 'word boundary',
    '\\B'  : 'non-word boundary',
    '\\d'  : 'digit', // [0-9]
    '\\D'  : 'non-digit', // [^0-9]
    '\\f'  : 'form feed (0x0C)',
    '\\n'  : 'line feed (0x0A)',
    '\\r'  : 'carriage return (0x0D)',
    '\\s'  : 'white space',
    '\\S'  : 'non-white space',
    '\\t'  : 'tab (0x09)',
    '\\v'  : 'vertical tab (0x0B)',
    '\\w'  : 'word', // [A-Za-z0-9_]
    '\\W'  : 'non-word', // [^A-Za-z0-9_]
    '\\0'  : 'null (0x00)'
}

RegExpDiagram.Drawer = class {
    constructor(stations, style) {
        this.stations = stations

        this.style = RegExpDiagram.Drawer.DEFAULT_STYLE
        Object.assign(this.style, style)
    }

    svg() {
        let ezsvg = RegExpDiagram._EzSvgNode.$(RegExpDiagram._document.createElementNS('http://www.w3.org/2000/svg', 'svg')).let(it => {
            it.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
            it.setAttribute('version', '1.1')
        })

        // HACK: <svg> element must be in DOM for getBBox() of SVGTextElement (<text> element)
        RegExpDiagram._document.body.appendChild(ezsvg.node)

        ezsvg.append('defs').append('style').let(it => {
            it.setAttribute('type', 'text/css')
            it.textContent = `
text {
    font-size: ${this.style.fontSize}px;
    font-family: Arial;
    fill: ${this.style.textColor};
}
text.annotation {
    font-size: ${this.style.annotationFontSize}px;
}
text .quotation {
    fill: ${this.style.helperTextColor};
}
* {
    stroke-linecap: square;
    stroke-width: ${this.style.strokeWidth}px;
}
.character rect, .classified rect {
    fill: ${this.style.stationFillColor};
    stroke: ${this.style.stationStrokeColor};
}
.characterRange text.en-dash {
    fill: ${this.style.textColor};
}
.selection-deco>rect {
    fill: ${this.style.stationFillColor};
    stroke: ${this.style.stationStrokeColor};
    stroke-dasharray: ${this.style.strokeWidth * 2},${this.style.strokeWidth};
    stroke-linecap: butt;
}
.group-deco>rect {
    fill: ${this.style.groupFillColor};
    stroke: ${this.style.groupStrokeColor};
    stroke-dasharray: ${this.style.strokeWidth * 2},${this.style.strokeWidth};
    stroke-linecap: butt;
}
.terminals>rect.start, .terminals>rect.end {
    fill: ${this.style.railroadColor};
    stroke: none;
}
.terminals>rect.end-line {
    fill: none;
    stroke: ${this.style.railroadColor};
}

path.railroad {
    fill: none;
    stroke: ${this.style.railroadColor};
}
path.railroad.non-greedy {
    stroke-dasharray: ${this.style.strokeWidth * 2},${this.style.strokeWidth};
    stroke-linecap: butt;
}
path.terminal {
    fill: none;
    stroke: ${this.style.railroadColor};
    stroke-linecap: round;
}
`
        })

        let eznode = this._appendStationNodes(this.stations, ezsvg, false, true)
        if (this.style.terminalType !== 'none') {
            this._decorateTerminals(eznode, this.style.terminalType)
        }
        eznode.let(it => {
            it.setAttribute('transform', `translate(${this.style.stationMargin * 0.5}, ${this.style.stationMargin * 0.5})`)
        })
        
        // HACK: padding for bottom repeat arrow, etc...
        eznode.width += this.style.stationMargin
        eznode.height += this.style.stationMargin
        eznode.upperHeight += this.style.stationMargin * 0.5
        eznode.lowerHeight += this.style.stationMargin * 0.5

        ezsvg.let(it => {
            it.setAttribute('width', eznode.width)
            it.setAttribute('height', eznode.height)
        })
        ezsvg.append('rect', ':first-child').let(it => {
            it.setAttribute('width', eznode.width)
            it.setAttribute('height', eznode.height)
            it.setAttribute('fill', this.style.backgroundColor)
        })

        // HACK:
        RegExpDiagram._document.body.removeChild(ezsvg.node)

        return ezsvg.node
    }

    _appendStationNodes(stations, parentNode, stack = false, isRoot = false) {
        let g = parentNode.append('g')

        if (!stack) {
            let width
            let upperHeight
            let lowerHeight

            if (isRoot && this.style.lineWidth) {
                let maxWidth = 0
                let totalUpperHeight = 0
                let totalLowerHeight = 0

                let lineStations = []
                let lineWidth = 0
                let lineUpperHeight = 0
                let lineLowerHeight = 0
                let isFirstLine = true
                let lines = 0
                let lastLineEndX
                let lastLineEndY
                let dy = 0

                let drawLines = () => {
                    let dx = isFirstLine ? 0 : this.style.stationMargin * 0.5
                    if (!isFirstLine) {
                        lineUpperHeight += this.style.stationMargin * 2
                    }
                    dy += lineUpperHeight

                    for (let station of lineStations) {
                        station._eznode.let(it => {
                            it.setAttribute('transform', `translate(${dx}, ${dy})`)
                        })
                        dx += station._eznode.width
                    }

                    maxWidth = Math.max(maxWidth, lineWidth)
                    if (isFirstLine) {
                        totalUpperHeight = lineUpperHeight
                        totalLowerHeight = lineLowerHeight
                    }
                    else {
                        totalLowerHeight += lineUpperHeight + lineLowerHeight
                    }

                    if (!isFirstLine) {
                        let r = this.style.stationMargin * 0.5
                        let xr0 = lastLineEndX
                        let xr1 = xr0 + r
                        let yr0 = lastLineEndY
                        let yr1 = yr0 + r
                        let yr2 = dy - lineUpperHeight + r
                        let yr3 = yr2 + r

                        let xl0 = 0
                        let xl1 = xl0 + r
                        let yl0 = yr3
                        let yl1 = yr3 + r
                        let yl2 = dy - r
                        let yl3 = dy

                        let pathData = []
                        pathData.push(`M${xr0},${yr0}`)
                        pathData.push(`Q${xr1},${yr0} ${xr1},${yr1}`)
                        pathData.push(`L${xr1},${yr2}`)
                        pathData.push(`Q${xr1},${yr3} ${xr0},${yr3}`)
                        pathData.push(`L${xl1},${yl0}`)
                        pathData.push(`Q${xl0},${yl0} ${xl0},${yl1}`)
                        pathData.push(`L${xl0},${yl2}`)
                        pathData.push(`Q${xl0},${yl3} ${xl1},${yl3}`)
                        g.append('path', ':first-child').let(it => {
                            it.setAttribute('class', 'railroad')
                            it.setAttribute('d', pathData.join(''))
                        })
                    }

                    lastLineEndX = dx
                    lastLineEndY = dy
                    dy += lineLowerHeight

                    lineStations = []
                    lineWidth = 0
                    lineUpperHeight = 0
                    lineLowerHeight = 0

                    isFirstLine = false
                    lines += 1
                }
                for (let station of stations) {
                    station._eznode = this._appendStationNode(station, g)
                    if (station.type === 'branch') {
                        // Already decorated
                    }
                    else {
                        this._decorateJunction(station._eznode, station.repeat)
                    }

                    lineStations.push(station)
                    lineWidth += station._eznode.width
                    lineUpperHeight = Math.max(lineUpperHeight, station._eznode.upperHeight)
                    lineLowerHeight = Math.max(lineLowerHeight, station._eznode.lowerHeight)

                    if (lineWidth > this.style.lineWidth) {
                        drawLines()
                    }
                }
                if (lineStations.length > 0) {
                    drawLines()
                }
                let drawsLastRailroad = lines > 1
                if (lines > 1) {
                    maxWidth += this.style.stationMargin
                }
                if (drawsLastRailroad) {
                    let pathData = []
                    pathData.push(`M${lastLineEndX},${lastLineEndY}`)
                    pathData.push(`L${maxWidth},${lastLineEndY}`)
                    g.append('path', ':first-child').let(it => {
                        it.setAttribute('class', 'railroad')
                        it.setAttribute('d', pathData.join(''))
                    })
                }

                width = maxWidth
                upperHeight = totalUpperHeight
                lowerHeight = totalLowerHeight
                g.endTerminalY = lastLineEndY
            }
            else {
                let totalWidth = 0
                let maxUpperHeight = 0
                let maxLowerHeight = 0
                for (let station of stations) {
                    station._eznode = this._appendStationNode(station, g)
                    if (station.type === 'branch') {
                        // Already decorated
                    }
                    else {
                        this._decorateJunction(station._eznode, station.repeat)
                    }
    
                    totalWidth += station._eznode.width
                    maxUpperHeight = Math.max(maxUpperHeight, station._eznode.upperHeight)
                    maxLowerHeight = Math.max(maxLowerHeight, station._eznode.lowerHeight)
                }
                width = totalWidth
                upperHeight = maxUpperHeight
                lowerHeight = maxLowerHeight

                let dx = 0
                for (let station of stations) {
                    station._eznode.let(it => {
                        it.setAttribute('transform', `translate(${dx}, ${maxUpperHeight})`)
                    })
                    dx += station._eznode.width
                }
            }

            g.width = width
            g.height = upperHeight + lowerHeight
            g.upperHeight = upperHeight
            g.lowerHeight = lowerHeight
        }
        else {
            let isFirst = true
            let maxWidth = 0
            let totalHeight = 0
            let upperHeight = 0
            let dy = 0
            for (let station of stations) {
                if (Array.isArray(station)) { // for branch
                    station._eznode = this._appendStationNodes(station, g).let(it => {
                        it.setAttribute('transform', `translate(0, ${dy})`)
                    })
                }
                else {
                    station._eznode = this._appendStationNode(station, g).let(it => {
                        it.setAttribute('transform', `translate(0, ${dy})`)
                    })
                }
                if (isFirst) {
                    upperHeight = station._eznode.upperHeight
                    isFirst = false
                }

                maxWidth = Math.max(maxWidth, station._eznode.width)
                dy += station._eznode.height + this.style.stationMargin
            }
            totalHeight = dy - this.style.stationMargin

            g.width = maxWidth
            g.height = totalHeight
            g.upperHeight = upperHeight
            g.lowerHeight = totalHeight - upperHeight
        }

        return g
    }

    _appendStationNode(station, parentNode) {
        if (station.type === 'character' || station.type === 'classified') {
            let g = parentNode.append('g').let(it => {
                it.setAttribute('class', station.type)
            })

            let text = g.append('text')
            if (station.type === 'character') {
                text.append('tspan').let(it => {
                    it.setAttribute('class', 'quotation')
                    it.textContent = '“'
                })
                text.append('tspan').let(it => {
                    it.textContent = station.value
                })
                text.append('tspan').let(it => {
                    it.setAttribute('class', 'quotation')
                    it.textContent = '”'
                })
            }
            else {
                text.node.textContent = station.value
            }

            let textBBox = this._getAdjustedBBox(text.node)
            let width = textBBox.width + this.style.textPadding.x * 2
            let height = textBBox.height + this.style.textPadding.y * 2
            let upperHeight = height * 0.5
            let lowerHeight = height * 0.5

            g.append('rect', 'text').let(it => {
                it.setAttribute('x', 0)
                it.setAttribute('y', - height * 0.5)
                it.setAttribute('width', width)
                it.setAttribute('height', height)
                if (station.type === 'character') {
                    it.setAttribute('rx', it.getAttribute('height') * 0.5)
                }
            })
            text.let(it => {
                it.setAttribute('x', this.style.textPadding.x)
                it.setAttribute('y', textBBox.height * 0.25)
            })

            g.width = width
            g.height = height
            g.upperHeight = upperHeight
            g.lowerHeight = lowerHeight
            if (station._textRange) {
                g.node.setAttribute('_textRange', `${station._textRange.firstIndex},${station._textRange.lastIndex}`)
            }
            return g
        }
        else if (station.type === 'characterRange') {
            let g = parentNode.append('g').let(it => {
                it.setAttribute('class', station.type)
            })

            let v1 = this._appendStationNode(station.value[0], g)
            let dash = g.append('text').let(it => {
                it.setAttribute('class', 'en-dash')
                it.textContent = '–'
                it.setAttribute('x', v1.width + this.style.textPadding.x)
                it.setAttribute('y', this._getAdjustedBBox(it).height * 0.25)
            })
            let v2 = this._appendStationNode(station.value[1], g).let(it => {
                it.setAttribute('transform', `translate(${v1.width + this.style.textPadding.x * 2 + this._getAdjustedBBox(dash.node).width}, 0)`)
            })

            g.width = v1.width + v2.width + this.style.textPadding.x * 2 + this._getAdjustedBBox(dash.node).width
            g.upperHeight = Math.max(v1.upperHeight, v2.upperHeight)
            g.lowerHeight = Math.max(v1.lowerHeight, v2.lowerHeight)
            g.height = g.upperHeight + g.lowerHeight
            return g
        }
        else if (station.type === 'selection') {
            let eznode = this._appendStationNodes(station.value, parentNode, true).let(it => {
                it.setAttribute('class', station.type)
            })
            this._decorateSelection(eznode, station.negativeSelection)
            if (station._textRange) {
                eznode.node.setAttribute('_textRange', `${station._textRange.firstIndex},${station._textRange.lastIndex}`)
            }
            return eznode
        }
        else if (station.type === 'branch') {
            let eznode = this._appendStationNodes(station.value, parentNode, true).wrap('g').let(it => {
                it.setAttribute('class', station.type)
            })
            {
                let it = eznode.node.querySelector(':scope>g')
                it.setAttribute('transform', `translate(0, ${-eznode.upperHeight})`)
            }
            this._decorateBranch(eznode, station.value)
            if (station._textRange) {
                eznode.node.setAttribute('_textRange', `${station._textRange.firstIndex},${station._textRange.lastIndex}`)
            }
            return eznode
        }
        else if (station.type === 'group') {
            let eznode = this._appendStationNodes(station.value, parentNode).wrap('g').let(it => {
                it.setAttribute('class', station.type)
            })
            {
                let it = eznode.node.querySelector(':scope>g')
                it.setAttribute('transform', `translate(0, ${-eznode.upperHeight})`)
            }
            if (this.style.drawsNoRememberGroup || (typeof station.groupNumber !== 'undefined') || (typeof station.lookahead !== 'undefined')) {
                this._decorateGroup(eznode, station.groupNumber, station.lookahead)
            }
            if (station._textRange) {
                eznode.node.setAttribute('_textRange', `${station._textRange.firstIndex},${station._textRange.lastIndex}`)
            }
            return eznode
        }
    }

    // FIXME: both ends of group, normal railroad => normal railroad, inside branch, ...
    /**
     * 
     * @param {*} eznode must not be transformed
     * @param {*} repeat 
     */
    _decorateJunction(eznode, repeat) {
        let width = eznode.width
        let height = eznode.height
        let upperHeight = eznode.upperHeight
        let lowerHeight = eznode.lowerHeight

        let dx = this.style.stationMargin * 0.5
        let dy = 0
        let repeatHeight = 0
        if (typeof repeat !== 'undefined' && repeat.min == 0) {
            dx = this.style.stationMargin
            dy = this.style.stationMargin + upperHeight
        }
        if (typeof repeat !== 'undefined' && (repeat.min >= 2 || repeat.max >= 2 || repeat.max < 0)) {
            dx = this.style.stationMargin
            repeatHeight = this.style.stationMargin
        }
        eznode.let(it => {
            it.setAttribute('transform', `translate(${dx}, ${dy})`)
        })

        let railroad = eznode.wrap('g')
        railroad.let(it => {
            it.setAttribute('class', 'junction')
        })
        if (typeof repeat !== 'undefined' && (repeat.min >= 2 || repeat.max >= 2 || repeat.max < 0)) {
            let annotation = null
            if (repeat.max < 0) { // infinity
                if (repeat.min >= 2) {
                    annotation = `${repeat.min - 1}+ times`
                }
            }
            else if (repeat.min == repeat.max) {
                if (repeat.min == 2) {
                    annotation = `once`
                }
                else {
                    annotation = `${repeat.min - 1} times`
                }
            }
            else {
                if (repeat.min <= 1) {
                    if (repeat.max == 2) {
                        annotation = `at most once`
                    }
                    else {
                        annotation = `at most ${repeat.max - 1} times`
                    }
                }
                else {
                    annotation = `${repeat.min - 1}..${repeat.max - 1} times`
                }
            }
            if (annotation) {
                railroad.append('text').let(it => {
                    it.setAttribute('class', 'annotation')
                    it.textContent = annotation
                    it.setAttribute('x', dx - this.style.stationMargin * 0.5)
                    it.setAttribute('y', dy + lowerHeight + repeatHeight + this._getAdjustedBBox(it).height + this.style.textPadding.y)

                    // HACK:
                    if (width + this.style.stationMargin < this._getAdjustedBBox(it).width) {
                        eznode.width = this._getAdjustedBBox(it).width - this.style.stationMargin
                    }
                    // HACK:
                    eznode.lowerHeight += this._getAdjustedBBox(it).height + this.style.textPadding.y
                })
            }
        }

        {
            let r = this.style.stationMargin * 0.5
            let x0 = dx - r * 2
            let x1 = dx - r
            let x2 = dx
            let x3 = dx + width
            let x4 = dx + width + r
            let x5 = dx + width + r * 2
            let y0 = 0
            let y1 = r
            let y2 = dy - r
            let y3 = dy

            let pathData = []
            pathData.push(`M${0},${0}`)
            // HACK:
            pathData.push(`L${dx + eznode.width + dx},${0}`)
            if (typeof repeat !== 'undefined' && repeat.min == 0) {
                pathData.push(`M${x0},${y0}`)
                pathData.push(`Q${x1},${y0} ${x1},${y1}`)
                pathData.push(`L${x1},${y2}`)
                pathData.push(`Q${x1},${y3} ${x2},${y3}`)
                pathData.push(`L${x3},${y3}`)
                pathData.push(`Q${x4},${y3} ${x4},${y2}`)
                pathData.push(`L${x4},${y1}`)
                pathData.push(`Q${x4},${y0} ${x5},${y0}`)

                // arrow
                pathData.push(`M${x3 - r},${y0 - r * 0.5}`)
                pathData.push(`L${x3},${y0}`)
                pathData.push(`L${x3 - r},${y0 + r * 0.5}`)
            }
            railroad.append('path', ':first-child').let(it => {
                it.setAttribute('class', 'railroad')
                it.setAttribute('d', pathData.join(''))
            })

            if (typeof repeat !== 'undefined' && (repeat.min >= 2 || repeat.max >= 2 || repeat.max < 0)) {
                let pathData = []

                let y4 = dy + r
                let y5 = dy + lowerHeight + repeatHeight - r
                let y6 = dy + lowerHeight + repeatHeight

                pathData.push(`M${x3},${y3}`)
                pathData.push(`Q${x4},${y3} ${x4},${y4}`)
                pathData.push(`L${x4},${y5}`)
                pathData.push(`Q${x4},${y6} ${x3},${y6}`)
                pathData.push(`L${x2},${y6}`)
                pathData.push(`Q${x1},${y6} ${x1},${y5}`)
                pathData.push(`L${x1},${y4}`)
                pathData.push(`Q${x1},${y3} ${x2},${y3}`)

                railroad.append('path', ':first-child').let(it => {
                    it.setAttribute('class', 'railroad' + (repeat.nonGreedy ? ' non-greedy' : ''))
                    it.setAttribute('d', pathData.join(''))
                })

                // arrow
                pathData = []
                pathData.push(`M${x2 + r},${y6 - r * 0.5}`)
                pathData.push(`L${x2},${y6}`)
                pathData.push(`L${x2 + r},${y6 + r * 0.5}`)

                railroad.append('path', ':first-child').let(it => {
                    it.setAttribute('class', 'railroad')
                    it.setAttribute('d', pathData.join(''))
                })
            }
        }

        eznode.width += dx * 2
        eznode.height += repeatHeight
        eznode.upperHeight -= dy
        eznode.lowerHeight += dy + repeatHeight
        // MEMO: fix /x*/
        if (eznode.upperHeight < this.style.stationMargin * 0.5) {
            eznode.height += this.style.stationMargin * 0.5 - eznode.upperHeight
            eznode.upperHeight = this.style.stationMargin * 0.5
        }
    }

    /**
     * 
     * @param {*} eznode must not be transformed
     */
    _decorateSelection(eznode, negative) {
        eznode.let(it => {
            it.setAttribute('transform', `translate(${this.style.stationMargin}, 0)`)
        })

        let selection = eznode.wrap('g')
        selection.let(it => {
            it.setAttribute('class', 'selection-deco')
        })
        let dy = 0
        {
            let x0 = 0
            let y0 = -eznode.upperHeight - this.style.stationMargin

            let annotation = selection.append('text', ':first-child').let(it => {
                it.setAttribute('class', 'annotation')
                if (negative) {
                    it.textContent = 'none of:'
                }
                else {
                    it.textContent = 'one of:'
                }
                it.setAttribute('x', x0)
                it.setAttribute('y', y0 - this.style.textPadding.y)

                dy = this._getAdjustedBBox(it).height + this.style.textPadding.y
            })

            selection.append('rect', ':first-child').let(it => {
                it.setAttribute('x', x0)
                it.setAttribute('y', y0)
                it.setAttribute('width', eznode.width + this.style.stationMargin * 2)
                it.setAttribute('height', eznode.height + this.style.stationMargin * 2)
                it.setAttribute('rx', this.style.stationMargin * 0.5)
            })
        }

        eznode.width += this.style.stationMargin * 2
        eznode.height += this.style.stationMargin * 2 + dy
        eznode.upperHeight += this.style.stationMargin + dy
        eznode.lowerHeight += this.style.stationMargin
    }

    /**
     * 
     * @param {*} eznode must not be transformed
     * @param {*} stations 
     */
    _decorateBranch(eznode, stations) {
        eznode.let(it => {
            it.setAttribute('transform', `translate(${this.style.stationMargin}, 0)`)
        })

        let branch = eznode.wrap('g')
        branch.let(it => {
            it.setAttribute('class', 'branch-deco')
        })
        {
            let r = this.style.stationMargin * 0.5
            let x0 = 0
            let x1 = x0 + r
            let x2 = x1 + r
            let x3 = x2 + eznode.width
            let x4 = x3 + r
            let x5 = x4 + r
            let y0 = -eznode.upperHeight - this.style.stationMargin

            let dy = -eznode.upperHeight
            let pathData = []
            for (let station of stations) {
                let y = dy + station._eznode.upperHeight
                let isLast = stations[stations.length - 1] === station

                // MEMO: Make sure the drawing lines do not overlap as much as possible...
                if (y == 0) {
                    // first
                    pathData.push(`M${x0},${0}`)
                    pathData.push(`L${x5},${0}`)
                }
                else if (isLast) {
                    pathData.push(`M${x0},${0}`)
                    pathData.push(`Q${x1},${0} ${x1},${r}`)
                    pathData.push(`L${x1},${y - r}`)
                    pathData.push(`Q${x1},${y} ${x2},${y}`)
                    pathData.push(`L${x3},${y}`)
                    pathData.push(`Q${x4},${y} ${x4},${y - r}`)
                    pathData.push(`L${x4},${r}`)
                    pathData.push(`Q${x4},${0} ${x5},${0}`)
                }
                else {
                    pathData.push(`M${x1},${y - r}`)
                    pathData.push(`Q${x1},${y} ${x2},${y}`)
                    pathData.push(`L${x3},${y}`)
                    pathData.push(`Q${x4},${y} ${x4},${y - r}`)
                }

                dy += station._eznode.height + this.style.stationMargin
            }
            branch.append('path', ':first-child').let(it => {
                it.setAttribute('class', 'railroad')
                it.setAttribute('d', pathData.join(''))
            })
        }

        eznode.width += this.style.stationMargin * 2
    }

    /**
     * 
     * @param {*} eznode must not be transformed
     * @param {*} groupNumber 
     * @param {*} lookahead 
     */
    _decorateGroup(eznode, groupNumber, lookahead) {
        let group = eznode.wrap('g')
        group.let(it => {
            it.setAttribute('class', 'group-deco')
        })
        let dy = 0
        {
            let x0 = 0
            let y0 = -eznode.upperHeight - this.style.stationMargin

            group.append('path', ':first-child').let(it => {
                it.setAttribute('class', 'railroad')
                it.setAttribute('d', `M0,0 L${eznode.width},0`)
            })
            group.append('rect', ':first-child').let(it => {
                it.setAttribute('x', x0)
                it.setAttribute('y', y0)
                it.setAttribute('width', eznode.width)
                it.setAttribute('height', eznode.height + this.style.stationMargin * 2)
                it.setAttribute('rx', this.style.stationMargin * 0.5)
            })

            if (typeof lookahead !== 'undefined') {
                let annotation = group.append('text', ':first-child').let(it => {
                    it.setAttribute('class', 'annotation')
                    it.textContent = `${lookahead} lookahead`
                    it.setAttribute('x', x0)
                    it.setAttribute('y', y0 - this.style.textPadding.y)

                    dy = this._getAdjustedBBox(it).height + this.style.textPadding.y
                    if (eznode.width < this._getAdjustedBBox(it).width) {
                        eznode.width = this._getAdjustedBBox(it).width
                    }
                })
            }
            else {
                let annotation = group.append('text', ':first-child').let(it => {
                    it.setAttribute('class', 'annotation')
                    it.textContent = (typeof groupNumber !== 'undefined') ? `group #${groupNumber}` : 'group'
                    it.setAttribute('x', x0)
                    it.setAttribute('y', y0 - this.style.textPadding.y)

                    dy = this._getAdjustedBBox(it).height + this.style.textPadding.y
                    if (eznode.width < this._getAdjustedBBox(it).width) {
                        eznode.width = this._getAdjustedBBox(it).width
                    }
                })
            }
        }

        eznode.height += this.style.stationMargin * 2 + dy
        eznode.upperHeight += this.style.stationMargin + dy
        eznode.lowerHeight += this.style.stationMargin
    }

    /**
     * 
     * @param {*} eznode must not be transformed
     * @param {*} type
     */
    _decorateTerminals(eznode, type = 'circle') {
        if (eznode.height < this.style.stationMargin) {
            eznode.height = this.style.stationMargin
            eznode.upperHeight = this.style.stationMargin * 0.5
            eznode.lowerHeight = this.style.stationMargin * 0.5
        }

        let endY = eznode.endTerminalY ? eznode.endTerminalY : eznode.upperHeight
        if (type === 'circle') {
            eznode.let(it => {
                it.setAttribute('transform', `translate(${this.style.stationMargin * 1.5}, 0)`)
            })

            let terminals = eznode.wrap('g')
            terminals.let(it => {
                it.setAttribute('class', 'terminals')
            })
            terminals.append('rect').let(it => {
                it.setAttribute('class', 'start')
                it.setAttribute('x', 0)
                it.setAttribute('y', eznode.upperHeight - this.style.stationMargin * 0.5)
                it.setAttribute('width', this.style.stationMargin)
                it.setAttribute('height', this.style.stationMargin)
                it.setAttribute('rx', this.style.stationMargin * 0.5)
            })
            terminals.append('rect').let(it => {
                it.setAttribute('class', 'end')
                it.setAttribute('x', this.style.stationMargin + eznode.width + this.style.stationMargin + this.style.strokeWidth * 2)
                it.setAttribute('y', endY - this.style.stationMargin * 0.5 + this.style.strokeWidth * 2)
                it.setAttribute('width', this.style.stationMargin  - this.style.strokeWidth * 4)
                it.setAttribute('height', this.style.stationMargin - this.style.strokeWidth * 4)
                it.setAttribute('rx', (this.style.stationMargin - this.style.strokeWidth * 4) * 0.5)
            })
            terminals.append('rect').let(it => {
                it.setAttribute('class', 'end-line')
                it.setAttribute('x', this.style.stationMargin + eznode.width + this.style.stationMargin + this.style.strokeWidth * 0.5)
                it.setAttribute('y', endY - this.style.stationMargin * 0.5 + this.style.strokeWidth * 0.5)
                it.setAttribute('width', this.style.stationMargin - this.style.strokeWidth)
                it.setAttribute('height', this.style.stationMargin - this.style.strokeWidth)
                it.setAttribute('rx', this.style.stationMargin * 0.5)
            })
            {
                let pathData = []
                let x0 = 0
                let x1 = x0 + this.style.stationMargin
                let x2 = x1 + this.style.stationMargin * 0.5
                let x3 = x2 + eznode.width
                let x4 = x3 + this.style.stationMargin * 0.5
                pathData.push(`M${x1},${eznode.upperHeight}`)
                pathData.push(`L${x2},${eznode.upperHeight}`)
                pathData.push(`M${x3},${endY}`)
                pathData.push(`L${x4},${endY}`)
                terminals.append('path', ':first-child').let(it => {
                    it.setAttribute('class', 'railroad')
                    it.setAttribute('d', pathData.join(''))
                })
            }

            eznode.width += this.style.stationMargin * 3
        }
        else if (type === 'line') {
            eznode.let(it => {
                it.setAttribute('transform', `translate(${this.style.stationMargin * 0.5 + this.style.strokeWidth * 2}, 0)`)
            })

            let terminals = eznode.wrap('g')
            terminals.let(it => {
                it.setAttribute('class', 'terminals')
            })
            {
                let x0 = 0
                let x1 = this.style.strokeWidth * 2
                let x2 = x1 + this.style.stationMargin * 0.5
                let x3 = x2 + eznode.width
                let x4 = x3 + this.style.stationMargin * 0.5
                let x5 = x4 + this.style.strokeWidth * 2

                {
                    let pathData = []
                    pathData.push(`M${x1},${eznode.upperHeight}`)
                    pathData.push(`L${x2},${eznode.upperHeight}`)
                    pathData.push(`M${x3},${endY}`)
                    pathData.push(`L${x4},${endY}`)
                    terminals.append('path', ':first-child').let(it => {
                        it.setAttribute('class', 'railroad')
                        it.setAttribute('d', pathData.join(''))
                    })
                }

                {
                    let pathData = []
                    pathData.push(`M${x0},${eznode.upperHeight - this.style.stationMargin * 0.5}`)
                    pathData.push(`L${x0},${eznode.upperHeight + this.style.stationMargin * 0.5}`)
                    pathData.push(`M${x1},${eznode.upperHeight - this.style.stationMargin * 0.5}`)
                    pathData.push(`L${x1},${eznode.upperHeight + this.style.stationMargin * 0.5}`)
                    pathData.push(`M${x4},${endY - this.style.stationMargin * 0.5}`)
                    pathData.push(`L${x4},${endY + this.style.stationMargin * 0.5}`)
                    pathData.push(`M${x5},${endY - this.style.stationMargin * 0.5}`)
                    pathData.push(`L${x5},${endY + this.style.stationMargin * 0.5}`)
                    terminals.append('path', ':first-child').let(it => {
                        it.setAttribute('class', 'terminal')
                        it.setAttribute('d', pathData.join(''))
                    })
                }
            }

            eznode.width += this.style.stationMargin + this.style.strokeWidth * 4
        }
    }

    _getAdjustedBBox(textElement) {
        let size = textElement.getBBox()
        size.width = Math.ceil(size.width)
        size.height = Math.ceil(size.height)
        return size
    }
}

RegExpDiagram._EzSvgNode = class {
    static $(node) {
        if (node instanceof RegExpDiagram._EzSvgNode) {
            return node
        }
        return new RegExpDiagram._EzSvgNode(node)
    }

    constructor(node) {
        if (node instanceof RegExpDiagram._EzSvgNode) {
            this.node = node.node
        }
        else {
            this.node = node
        }
    }

    select(query) {
        return new RegExpDiagram._EzSvgNode(this.node.querySelector(query))
    }

    append(node, beforeQuery) {
        if (typeof node === 'string') {
            node = RegExpDiagram._document.createElementNS('http://www.w3.org/2000/svg', node)
        }
        if (!beforeQuery) {
            this.node.appendChild(node)
        }
        else {
            this.node.insertBefore(node, this.node.querySelector(beforeQuery))
        }
        return new RegExpDiagram._EzSvgNode(node)
    }

    wrap(node) {
        if (typeof node === 'string') {
            node = RegExpDiagram._document.createElementNS('http://www.w3.org/2000/svg', node)
        }

        let replacedNode = this.node.parentNode.replaceChild(node, this.node)
        node.appendChild(replacedNode)
        this.node = node

        return this
    }

    remove() {
        this.node.parentNode.removeChild(this.node)
    }

    let(block) {
        block(this.node)
        return this
    }
}

RegExpDiagram.VERSION = '1.0'

RegExpDiagram.Drawer.DEFAULT_STYLE = {
    annotationFontSize: 10,
    drawsNoRememberGroup: true,
    fontSize: 12,
    strokeWidth: 2,
    stationMargin: 16,
    terminalType: 'line',
    textPadding: { x: 8, y: 4 },
    lineWidth: 640,
    // themes
    backgroundColor: '#FFFFFF',
    textColor: '#212121',
    helperTextColor: 'rgba(0, 0, 0, 0.6)',
    railroadColor: '#2196F3',
    stationFillColor: '#FAFAFA',
    stationStrokeColor: '#2196F3',
    groupFillColor: '#FAFAFA',
    groupStrokeColor: '#9E9E9E'
}

// commonjs
if (typeof module !== 'undefined') {
    module.exports.RegExpDiagram = RegExpDiagram
}
