export const defaultStyle = {
  stationHeight: 24,
  characterFontSize: 16,
  characterFontFamily: 'Arial',
  characterHorizontalPadding: 6,
  annotationHeight: 24,
  annotationFontSize: 12,
  annotationFontFamily: 'Arial',
  railwayWidth: 2,
  railwayUnit: 12,
  arrowSize: 12,
};

export function RailwayMaker(style = defaultStyle) {
  const measureCharacterText = text => measureText(text, `${style.characterFontSize}px ${style.characterFontFamily}`);
  const measureAnnotationText = text => measureText(text, `${style.annotationFontSize}px ${style.annotationFontFamily}`);

  return {
    StyledSvgTag() {
      const svgTag = createElement('svg', {
        'version': '1.1',
        'xmlns': 'http://www.w3.org/2000/svg',
      });
      const styleTag = svgTag
        .appendChild('defs')
        .appendChild(
          'style',
          {
            type: 'text/css'
          }
        );
      // MEMO: center stroke
      styleTag.value.textContent = css(`
* {
  stroke-linecap: butt;
}
text {
  fill: black;
  font-size: ${style.characterFontSize}px;
  font-family: ${style.characterFontFamily};
  white-space: nowrap;
}
text.classified {
  font-style: oblique;
}
text.annotation {
  font-size: ${style.annotationFontSize}px;
  font-family: ${style.annotationFontFamily};
}
tspan.quotation, text.hyphen {
  fill: rgba(0, 0, 0, 0.6);
}
rect.station {
  fill: white;
  stroke: black;
  stroke-width: ${style.railwayWidth}px;
}
path.railway {
  fill: none;
  stroke: black;
  stroke-width: ${style.railwayWidth}px;
}
path.arrow {
  fill: none;
  stroke: black;
  stroke-width: ${style.railwayWidth}px;
}
path.loop {
  fill: none;
  stroke: black;
  stroke-width: ${style.railwayWidth}px;
}
.non-greedy path.loop {
  stroke-dasharray: 4 2;
}
rect.border {
  fill: #F0F0F0;
  stroke: gray;
  stroke-width: ${style.railwayWidth}px;
  stroke-dasharray: 4 2;
}

rect.bounds {
  fill: none;
  stroke: magenta;
  stroke-width: 1px;
}
      `);
      return svgTag;
    },

    Hyphen() {
      const textMetrics = measureCharacterText('−');
      return {
        get width() {
          return textMetrics.roundedWidth;
        },
        get height() {
          return style.stationHeight;
        },
        get connectors() {
          return [];
        },
        // g
        //   text
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-hyphen', transform: `translate(${dx}, ${dy})` });
          const text = g.appendChild(
            'text',
            {
              class: 'hyphen',
              x: (textMetrics.roundedWidth - textMetrics.width) / 2,
              y: textMetrics.fontBoundingBoxAscent + (style.stationHeight - textMetrics.height) / 2,
            }
          ).value.textContent = '−';
          return g;
        },
      }
    },

    CharacterStation(character, isClassified) {
      const textMetrics = measureCharacterText(isClassified ? character : `“${character}”`);
      return {
        get width() {
          // MEMO: between stroke centers
          return textMetrics.roundedWidth + style.characterHorizontalPadding * 2;
        },
        get height() {
          // MEMO: between stroke centers
          return style.stationHeight;
        },
        get connectors() {
          return [
            { x: 0, y: this.height / 2 },
            { x: this.width, y: this.height / 2 },
          ];
        },
        // case isClassified:
        //   g
        //     rect
        //     text.classified
        // default:
        //   g
        //     rect
        //     text
        //       tspan.quotation
        //       tspan
        //       tspan.quotation
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-characterstation', transform: `translate(${dx}, ${dy})` });
          g.appendChild(
            'rect',
            {
              class: 'station',
              x: 0,
              y: 0,
              width: textMetrics.roundedWidth + style.characterHorizontalPadding * 2,
              height: style.stationHeight,
              rx: isClassified ? 0 : style.stationHeight / 2,
            }
          );
          const text = g.appendChild(
            'text',
            {
              x: style.characterHorizontalPadding + (textMetrics.roundedWidth - textMetrics.width) / 2,
              y: textMetrics.fontBoundingBoxAscent + (style.stationHeight - textMetrics.height) / 2,
            }
          );
          if (isClassified) {
            text.value.setAttribute('class', 'classified');
            text.value.textContent = character;
          } else {
            text.appendChild('tspan', { class: 'quotation' }).value.textContent = '“';
            text.appendChild('tspan').value.textContent = character;
            text.appendChild('tspan', { class: 'quotation' }).value.textContent = '”';
          }
          return g;
        },
      }
    },

    TerminalStation() {
      return {
        get width() {
          // MEMO: between stroke centers
          return style.railwayWidth * 2;
        },
        get height() {
          return style.stationHeight;
        },
        get connectors() {
          return [
            { x: 0, y: this.height / 2 },
            { x: this.width, y: this.height / 2 },
          ];
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-terminalstation', transform: `translate(${dx}, ${dy})` });
          g.appendChild('path', { class: 'railway', d: pathD(`
            M0 0
            V${this.height}
            M${this.width} 0
            V${this.height}
          `) });
          return g;
        },
      };
    },

    // DEBUG
    Bounds(station) {
      return {
        get width() {
          return station.width;
        },
        get height() {
          return station.height;
        },
        get connectors() {
          return [
            { x: station.connectors[0].x, y: station.connectors[0].y },
            { x: station.connectors[1].x, y: station.connectors[1].y },
          ];
        },
        // g
        //   rect
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-bounds', transform: `translate(${dx}, ${dy})` });
          g.value.appendChild(station.render().value);
          g.appendChild('rect', {
            class: 'bounds',
            width: this.width,
            height: this.height,
          });
          return g;
        }
      };
    },

    Loop(station, annotation = '', isGreedy = true) {
      const textMetrics = measureAnnotationText(annotation);
      return {
        // XXX: This is Loop
        get isLoop() {
          return true;
        },
        get width() {
          return Math.max(station.width + style.railwayUnit * 2, style.railwayUnit + textMetrics.roundedWidth);
        },
        get height() {
          return station.height + style.railwayUnit * 2 + style.arrowSize / 2 + (annotation.length ? style.annotationHeight : 0);
        },
        get connectors() {
          return [
            { x: style.railwayUnit, y: station.connectors[0].y },
            { x: this.width - style.railwayUnit, y: station.connectors[1].y },
          ];
        },
        // g
        //   station
        //   path.railway
        //   path.arrow
        //   text.annotation?
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-loop' + (isGreedy ? '' : ' non-greedy'), transform: `translate(${dx}, ${dy})` });
          g.value.appendChild(station.render(style.railwayUnit, 0).value);
          g.appendChild('path', { class: 'railway', d: pathD(`
            M ${station.connectors[1].x + style.railwayUnit} ${station.connectors[1].y}
            H ${this.width - style.railwayUnit}
          `) });
          g.appendChild('path', { class: 'loop', d: pathD(`
            M ${this.width - style.railwayUnit} ${station.connectors[1].y}
            q ${style.railwayUnit} 0,${style.railwayUnit} ${style.railwayUnit}
            V ${station.height + style.railwayUnit}
            q 0 ${style.railwayUnit},${-style.railwayUnit} ${style.railwayUnit}
            H ${style.railwayUnit}
            q ${-style.railwayUnit} 0,${-style.railwayUnit} ${-style.railwayUnit}
            V ${station.connectors[0].y + style.railwayUnit}
            q 0 ${-style.railwayUnit},${style.railwayUnit} ${-style.railwayUnit}
            H ${station.connectors[0].x + style.railwayUnit}
          `) });
          g.appendChild('path', { class: 'arrow', d: pathD(`
            M ${style.railwayUnit + style.arrowSize} ${station.height + style.railwayUnit * 2 -style.arrowSize / 2}
            l ${-style.arrowSize} ${style.arrowSize / 2}
            l ${style.arrowSize} ${style.arrowSize / 2}
          `) });
          if (annotation.length) {
            g.appendChild('text', {
              class: 'annotation',
              x: style.railwayUnit,
              y: station.height + style.railwayUnit * 2 + style.arrowSize / 2 + textMetrics.fontBoundingBoxAscent + (style.annotationHeight - textMetrics.height) / 2,
            }).value.textContent = annotation;
          }
          return g;
        }
      }
    },

    Shortcut(station) {
      return {
        get width() {
          // MEMO: Optimization for `Shortcut(Loop(...))`
          const [spaceLeft, spaceRight] = station.isLoop ? [station.connectors[0].x, station.width - station.connectors[1].x] : [0, 0];
          return station.width + style.railwayUnit * 4 - spaceLeft - spaceRight;
        },
        get height() {
          return station.height + style.arrowSize / 2 + style.railwayUnit * 2;
        },
        get connectors() {
          return [
            { x: 0, y: style.arrowSize / 2 },
            { x: this.width, y: style.arrowSize / 2 },
          ];
        },
        get hasHorizontalPadding() {
          return true;
        },
        // g
        //   station
        //   path.railway
        //   path.arrow
        //   path.railway
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-shortcut', transform: `translate(${dx}, ${dy})` });

          // MEMO: Optimization for `Shortcut(Loop(...))`
          const spaceLeft = station.isLoop ? station.connectors[0].x : 0;
          g.value.appendChild(station.render(style.railwayUnit * 2 - spaceLeft, style.arrowSize / 2 + style.railwayUnit * 2).value);

          g.appendChild('path', { class: 'railway', d: pathD(`
            M 0 ${this.connectors[0].y}
            H ${this.width}
          `) });
          g.appendChild('path', { class: 'arrow', d: pathD(`
            M ${this.width - style.railwayUnit * 2 - style.arrowSize} ${this.connectors[0].y - style.arrowSize / 2}
            l ${style.arrowSize} ${style.arrowSize / 2}
            l ${-style.arrowSize} ${style.arrowSize / 2}
          `) });
          g.appendChild('path', { class: 'railway', d: pathD(`
            M 0 ${this.connectors[0].y}
            q ${style.railwayUnit} 0,${style.railwayUnit} ${style.railwayUnit}
            V ${station.connectors[0].y + style.arrowSize / 2 + style.railwayUnit * 2 - style.railwayUnit}
            q 0 ${style.railwayUnit},${style.railwayUnit} ${style.railwayUnit}
            H ${station.connectors[0].x + style.railwayUnit * 2 - spaceLeft}
            M ${station.connectors[1].x + style.railwayUnit * 2 - spaceLeft} ${station.connectors[1].y + style.arrowSize / 2 + style.railwayUnit * 2}
            H ${this.width - style.railwayUnit * 2}
            q ${style.railwayUnit} 0,${style.railwayUnit} ${-style.railwayUnit}
            V ${this.connectors[1].y + style.railwayUnit}
            q 0 ${-style.railwayUnit},${style.railwayUnit} ${-style.railwayUnit}
          `) });
          return g;
        }
      }
    },

    Border(station, annotation = '', useInsideConnectors = true) {
      const textMetrics = measureAnnotationText(annotation);
      return {
        get width() {
          if (station.hasHorizontalPadding) {
            // MEMO: Optimization for `Border(Shortcut(...))`, ...
            return Math.max(station.width, textMetrics.roundedWidth);
          } else {
            return Math.max(station.width + style.railwayUnit * 2, textMetrics.roundedWidth);
          }
        },
        get height() {
          return station.height + style.railwayUnit * 2 + (annotation.length ? style.annotationHeight : 0);
        },
        get connectors() {
          if (useInsideConnectors) {
            if (station.hasHorizontalPadding) {
              // MEMO: Optimization for `Border(Shortcut(...))`, ...
              return [
                { x: station.connectors[0].x, y: station.connectors[0].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
                { x: station.connectors[1].x, y: station.connectors[1].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
              ];
            } else {
              return [
                { x: station.connectors[0].x + style.railwayUnit, y: station.connectors[0].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
                { x: station.connectors[1].x + style.railwayUnit, y: station.connectors[1].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
              ];
            }
          } else {
            return [
              { x: 0, y: station.connectors[0].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
              { x: this.width, y: station.connectors[1].y + style.railwayUnit + (annotation.length ? style.annotationHeight : 0) },
            ];
          }
        },
        // g
        //   text.annotation?
        //   rect.border
        //   station
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-border', transform: `translate(${dx}, ${dy})` });
          if (annotation.length) {
            g.appendChild('text', {
              class: 'annotation',
              x: 0,
              y: textMetrics.fontBoundingBoxAscent + (style.annotationHeight - textMetrics.height) / 2,
            }).value.textContent = annotation;
          }
          g.appendChild('rect', {
            class: 'border',
            x: 0,
            y: annotation.length ? style.annotationHeight : 0,
            width: this.width,
            height: station.height + style.railwayUnit * 2,
          });
          g.value.appendChild(station.render(station.hasHorizontalPadding ? 0 : style.railwayUnit, style.railwayUnit + (annotation.length ? style.annotationHeight : 0)).value);
          return g;
        }
      };
    },

    HStack() {
      return {
        stations: [],
        get width() {
          const values = this.stations.map(s => s.width);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get height() {
          const values = this.stations.map(s => s.height);
          return values.length ? values.reduce((a, b) => Math.max(a, b)) : 0;
        },
        get connectors() {
          return [
            { x: 0, y: this.height / 2 },
            { x: this.width, y: this.height / 2 },
          ];
        },
        // station
        // station
        // ...
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-hstack', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, (this.height - station.height) / 2).value);
            childX += station.width + style.railwayUnit;
          }
          return g;
        }
      };
    },

    VStack() {
      return {
        stations: [],
        get width() {
          const values = this.stations.map(s => s.width);
          return values.length ? values.reduce((a, b) => Math.max(a, b)) : 0;
        },
        get height() {
          const values = this.stations.map(s => s.height);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get connectors() {
          return [
            { x: 0, y: this.stations.length ? this.stations[0].connectors[0].y : this.height / 2 },
            { x: this.width, y: this.stations.length ? this.stations[0].connectors[1].y : this.height / 2 },
          ];
        },
        // station
        // station
        // ...
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-vstack', transform: `translate(${dx}, ${dy})` });
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(0, childY).value);
            childY += station.height + style.railwayUnit;
          }
          return g;
        }
      };
    },

    RangeStation(s0, s1, hasBorder = true) {
      const hstack = this.HStack();
      hstack.stations.push(s0);
      hstack.stations.push(this.Hyphen());
      hstack.stations.push(s1);
      return hasBorder ? this.Border(hstack, 'one of:', false) : hstack;
    },

    SelectionStation(stations) {
      const vstak = this.VStack();
      vstak.stations = stations;
      return this.Border(vstak, 'one of:', false);
    },

    Switch(stations) {
      return {
        get width() {
          return stations.map(s => s.width).reduce((a, b) => Math.max(a, b)) + style.railwayUnit * 4;
        },
        get height() {
          return stations.map(s => s.height).reduce((a, b) => a + b + style.railwayUnit);
        },
        get connectors() {
          return [
            { x: 0, y: stations[0].connectors[0].y },
            { x: this.width, y: stations[0].connectors[1].y },
          ];
        },
        get hasHorizontalPadding() {
          return true;
        },
        // g
        //   child
        //   path.railway
        //   child
        //   path.railway
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-switch', transform: `translate(${dx}, ${dy})` });
          let childY = 0;
          let childrenY = [];
          for (let i = 0; i < stations.length; ++i) {
            const station = stations[i];
            g.value.appendChild(station.render(style.railwayUnit * 2, childY).value);
            childrenY.push(childY);
            childY += station.height + style.railwayUnit;
          }

          for (let i = 0; i < stations.length; ++i) {
            const station = stations[i];
            if (i == 0) {
              g.appendChild('path', { class: 'railway', d: pathD(`
                M 0 ${this.connectors[0].y}
                H ${station.connectors[0].x + style.railwayUnit * 2}
                M ${station.connectors[1].x + style.railwayUnit * 2} ${station.connectors[1].y}
                H ${this.width}
              `) });
            } else if (i == 1) {
              g.appendChild('path', { class: 'railway', d: pathD(`
                M 0 ${this.connectors[0].y}
                q ${style.railwayUnit} 0,${style.railwayUnit} ${style.railwayUnit}
                V ${station.connectors[0].y + childrenY[i] - style.railwayUnit}
                q 0 ${style.railwayUnit},${style.railwayUnit} ${style.railwayUnit}
                H ${station.connectors[0].x + style.railwayUnit * 2}
                M ${station.connectors[1].x + style.railwayUnit * 2} ${station.connectors[1].y + childrenY[i]}
                H ${this.width - style.railwayUnit * 2}
                q ${style.railwayUnit} 0,${style.railwayUnit} ${-style.railwayUnit}
                V ${this.connectors[1].y + style.railwayUnit}
                q 0 ${-style.railwayUnit},${style.railwayUnit} ${-style.railwayUnit}
              `) });
            } else {
              g.appendChild('path', { class: 'railway', d: pathD(`
                M ${style.railwayUnit} ${childrenY[i - 1] + stations[i - 1].connectors[0].y - style.railwayUnit}
                V ${station.connectors[0].y + childrenY[i] - style.railwayUnit}
                q 0 ${style.railwayUnit},${style.railwayUnit} ${style.railwayUnit}
                H ${station.connectors[0].x + style.railwayUnit * 2}
                M ${station.connectors[1].x + style.railwayUnit * 2} ${station.connectors[1].y + childrenY[i]}
                H ${this.width - style.railwayUnit * 2}
                q ${style.railwayUnit} 0,${style.railwayUnit} ${-style.railwayUnit}
                V ${childrenY[i - 1] + stations[i - 1].connectors[1].y - style.railwayUnit}
              `) });
            }
          }
          return g;
        }
      };
    },

    StraightRoute(stations) {
      return {
        stations: stations,
        get width() {
          const values = this.stations.map(s => s.width);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get height() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          const alignedStationsBottom = this.stations.map(s => connectorLevel - s.connectors[0].y + s.height).reduce((a, b) => Math.max(a, b));
          return alignedStationsBottom;
        },
        get connectors() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          const lastChildX = this.stations.slice(0, -1).map(s => s.width).reduce((a, b) => a + b + style.railwayUnit, 0);
          return [
            { x: this.stations[0].connectors[0].x, y: connectorLevel },
            { x: lastChildX + this.stations.slice(-1)[0].connectors[1].x, y: connectorLevel },
          ];
        },
        // g
        //   child
        //   path.railway
        //   child
        //   path.railway
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));

          const g = createElement('g', { class: 'regexp-diagram-straightroute', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, connectorLevel - station.connectors[0].y).value);
            // MEMO: Draw the railway on the front of the station background-color
            if (i > 0) {
              g.appendChild('path', { class: 'railway', d: pathD(`
                M ${childX - stations[i - 1].width - style.railwayUnit + stations[i - 1].connectors[1].x} ${this.connectors[0].y}
                H ${childX + station.connectors[0].x}
              `) });
            }
            childX += station.width + style.railwayUnit;
          }
          return g;
        }
      };
    },

    Wrapping(stations) {
      return {
        stations: stations,
        get width() {
          return this.stations.map(s => s.width).reduce((a, b) => Math.max(a, b)) + (this.stations.length >= 2 ? style.railwayUnit * 4: 0);
        },
        get height() {
          return this.stations.map(s => s.height).reduce((a, b) => a + b + style.railwayUnit * 4);
        },
        get connectors() {
          return [];
        },
        // g
        //   child
        //   path.railway
        //   child
        //   path.railway
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const g = createElement('g', { class: 'regexp-diagram-wrapping', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, childY).value);
            if (i < this.stations.length - 1) {
              g.appendChild('path', { class: 'railway', d: pathD(`
                M ${childX + station.connectors[1].x} ${childY + station.connectors[1].y}
                H ${childX + station.width + style.railwayUnit}
                q ${style.railwayUnit} 0, ${style.railwayUnit} ${style.railwayUnit}
                V ${childY + station.height + style.railwayUnit}
                q 0 ${style.railwayUnit}, ${-style.railwayUnit} ${style.railwayUnit}
                H ${style.railwayUnit}
                q ${-style.railwayUnit} 0, ${-style.railwayUnit} ${style.railwayUnit}
                V ${childY + station.height + style.railwayUnit * 3 + this.stations[i + 1].connectors[0].y}
                q 0 ${style.railwayUnit}, ${style.railwayUnit} ${style.railwayUnit}
                H ${style.railwayUnit * 2 + this.stations[i + 1].connectors[0].x}
              `) });
            }
            childX = style.railwayUnit * 2;
            childY += station.height + style.railwayUnit * 4;
          }
          return g;
        }
      };
    },
  };
}

function createElement(name, attributes = {}) {
  const element = document.createElement(name);
  for (let key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return {
    get value() {
      return element;
    },
    appendChild(name, attributes = {}) {
      const child = createElement(name, attributes);
      this.value.appendChild(child.value);
      return child;
    },
  };
}

function measureText(text, font) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  Object.defineProperties(metrics, {
    roundedWidth: {
      get: function() {
        return Math.ceil(this.width);
      },
    },
    height: {
      get: function() {
        return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      }
    },
  });
  return metrics;
};

function css(str) {
  return str.trim();
}

function pathD(str) {
  return str.replace(/\s/g, ' ').replace(/\s{2,}/g, '');
}


function testStations(railwayMaker) {
  const stations = [];
  stations.push(railwayMaker.TerminalStation());
  stations.push(
    railwayMaker.CharacterStation(
      'Hello world!',
      false
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.CharacterStation(
        'any character',
        true
      ),
      'loop',
      false
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.CharacterStation(
        'a',
        true
      )
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        ),
        'inner loop text ...'
      ),
      'outer loop text ...'
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      ),
      ''
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.CharacterStation(
        'a',
        true
      ),
      'group'
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.CharacterStation(
        'a',
        true
      ),
      'long long text ...'
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Border(
        railwayMaker.CharacterStation(
          'a',
          true
        ),
        'inner border text ...'
      ),
      'outer border text ...'
    )
  );
  stations.push(railwayMaker.SelectionStation(
    [
      railwayMaker.CharacterStation('1'),
      railwayMaker.CharacterStation('a', true),
      railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
    ]
  ));
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.SelectionStation(
        [
          railwayMaker.CharacterStation('1'),
          railwayMaker.CharacterStation('a', true),
          railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
        ]
      )
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Loop(
        railwayMaker.SelectionStation(
          [
            railwayMaker.CharacterStation('1'),
            railwayMaker.CharacterStation('a', true),
            railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
          ]
        )
      )
    )
  );
  stations.push(
    railwayMaker.Switch(
      [
        railwayMaker.CharacterStation('1'),
        railwayMaker.Loop(railwayMaker.CharacterStation('a', true), 'once'),
        railwayMaker.Shortcut(railwayMaker.CharacterStation('a', true)),
        railwayMaker.Shortcut(
          railwayMaker.Loop(
            railwayMaker.SelectionStation(
              [
                railwayMaker.CharacterStation('1'),
                railwayMaker.CharacterStation('a', true),
                railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
              ]
            )
          )
        )
      ]
    )
  );
  stations.push(railwayMaker.RangeStation(railwayMaker.CharacterStation('1'), railwayMaker.CharacterStation('a', true)));
  stations.push(railwayMaker.StraightRoute(
    [
      railwayMaker.CharacterStation('1'),
      railwayMaker.Loop(railwayMaker.CharacterStation('a', true)),
      railwayMaker.Border(railwayMaker.CharacterStation('a', true)),
      railwayMaker.Shortcut(railwayMaker.CharacterStation('a', true)),
    ]
  ));
  stations.push(railwayMaker.TerminalStation());
  return stations;
}