export const defaultStyle = {
  stationHeight: 24,
  characterFontSize: 16,
  characterFontFamily: 'Arial',
  characterHorizontalPadding: 6,
  annotationHeight: 24,
  annotationFontSize: 12,
  annotationFontFamily: 'Arial',
  railroadWidth: 2,
  railroadUnit: 12,
  arrowSize: 12,
};

export function RailroadMaker(style = defaultStyle) {
  const measureCharacterText = text => measureText(text, `${style.characterFontSize}px ${style.characterFontFamily}`);
  const measureAnnotationText = text => measureText(text, `${style.annotationFontSize}px ${style.annotationFontFamily}`);

  return {
    get style() {
      return style;
    },
    StyledSvgTag(userStyle = '') {
      const svgTag = createSvgElement('svg', {
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
  stroke-width: ${style.railroadWidth}px;
}
path.railroad {
  fill: none;
  stroke: black;
  stroke-width: ${style.railroadWidth}px;
}
path.arrow {
  fill: none;
  stroke: black;
  stroke-width: ${style.railroadWidth}px;
}
path.loop {
  fill: none;
  stroke: black;
  stroke-width: ${style.railroadWidth}px;
}
.non-greedy path.loop {
  stroke-dasharray: 4 2;
}
rect.border {
  fill: #F0F0F0;
  stroke: black;
  stroke-width: ${style.railroadWidth}px;
  stroke-dasharray: 4 2;
}

rect.bounds {
  fill: none;
  stroke: magenta;
  stroke-width: 1px;
}
${userStyle}
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
          const g = createSvgElement('g', { class: 'regexp-diagram-hyphen', transform: `translate(${dx}, ${dy})` });
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
          const g = createSvgElement('g', { class: 'regexp-diagram-characterstation', transform: `translate(${dx}, ${dy})` });
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
          if (this.attributes) {
            for (let name in this.attributes) {
              g.value.setAttribute(name, this.attributes[name]);
            }
          }
          return g;
        },
      }
    },

    TerminalStation() {
      return {
        get width() {
          // MEMO: between stroke centers
          return style.railroadWidth * 2;
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
          const g = createSvgElement('g', { class: 'regexp-diagram-terminalstation', transform: `translate(${dx}, ${dy})` });
          g.appendChild('path', { class: 'railroad', d: pathD(`
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
          const g = createSvgElement('g', { class: 'regexp-diagram-bounds', transform: `translate(${dx}, ${dy})` });
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
          return Math.max(station.width + style.railroadUnit * 2, style.railroadUnit + textMetrics.roundedWidth);
        },
        get height() {
          return station.height + style.railroadUnit * 2 + style.arrowSize / 2 + (annotation.length ? style.annotationHeight : 0);
        },
        get connectors() {
          return [
            { x: style.railroadUnit, y: station.connectors[0].y },
            { x: this.width - style.railroadUnit, y: station.connectors[1].y },
          ];
        },
        // g
        //   station
        //   path.railroad
        //   path.arrow
        //   text.annotation?
        render(dx = 0, dy = 0) {
          const g = createSvgElement('g', { class: 'regexp-diagram-loop' + (isGreedy ? '' : ' non-greedy'), transform: `translate(${dx}, ${dy})` });
          g.value.appendChild(station.render(style.railroadUnit, 0).value);
          g.appendChild('path', { class: 'railroad', d: pathD(`
            M ${station.connectors[1].x + style.railroadUnit} ${station.connectors[1].y}
            H ${this.width - style.railroadUnit}
          `) });
          g.appendChild('path', { class: 'loop', d: pathD(`
            M ${this.width - style.railroadUnit} ${station.connectors[1].y}
            q ${style.railroadUnit} 0,${style.railroadUnit} ${style.railroadUnit}
            V ${station.height + style.railroadUnit}
            q 0 ${style.railroadUnit},${-style.railroadUnit} ${style.railroadUnit}
            H ${style.railroadUnit}
            q ${-style.railroadUnit} 0,${-style.railroadUnit} ${-style.railroadUnit}
            V ${station.connectors[0].y + style.railroadUnit}
            q 0 ${-style.railroadUnit},${style.railroadUnit} ${-style.railroadUnit}
            H ${station.connectors[0].x + style.railroadUnit}
          `) });
          g.appendChild('path', { class: 'arrow', d: pathD(`
            M ${style.railroadUnit + style.arrowSize} ${station.height + style.railroadUnit * 2 -style.arrowSize / 2}
            l ${-style.arrowSize} ${style.arrowSize / 2}
            l ${style.arrowSize} ${style.arrowSize / 2}
          `) });
          if (annotation.length) {
            g.appendChild('text', {
              class: 'annotation',
              x: style.railroadUnit,
              y: station.height + style.railroadUnit * 2 + style.arrowSize / 2 + textMetrics.fontBoundingBoxAscent + (style.annotationHeight - textMetrics.height) / 2,
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
          return station.width + style.railroadUnit * 4 - spaceLeft - spaceRight;
        },
        get height() {
          return station.height + style.arrowSize / 2 + style.railroadUnit * 2;
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
        //   path.railroad
        //   path.arrow
        //   path.railroad
        render(dx = 0, dy = 0) {
          const g = createSvgElement('g', { class: 'regexp-diagram-shortcut', transform: `translate(${dx}, ${dy})` });

          // MEMO: Optimization for `Shortcut(Loop(...))`
          const spaceLeft = station.isLoop ? station.connectors[0].x : 0;
          g.value.appendChild(station.render(style.railroadUnit * 2 - spaceLeft, style.arrowSize / 2 + style.railroadUnit * 2).value);

          g.appendChild('path', { class: 'railroad', d: pathD(`
            M 0 ${this.connectors[0].y}
            H ${this.width}
          `) });
          g.appendChild('path', { class: 'arrow', d: pathD(`
            M ${this.width - style.railroadUnit * 2 - style.arrowSize} ${this.connectors[0].y - style.arrowSize / 2}
            l ${style.arrowSize} ${style.arrowSize / 2}
            l ${-style.arrowSize} ${style.arrowSize / 2}
          `) });
          g.appendChild('path', { class: 'railroad', d: pathD(`
            M 0 ${this.connectors[0].y}
            q ${style.railroadUnit} 0,${style.railroadUnit} ${style.railroadUnit}
            V ${station.connectors[0].y + style.arrowSize / 2 + style.railroadUnit * 2 - style.railroadUnit}
            q 0 ${style.railroadUnit},${style.railroadUnit} ${style.railroadUnit}
            H ${station.connectors[0].x + style.railroadUnit * 2 - spaceLeft}
            M ${station.connectors[1].x + style.railroadUnit * 2 - spaceLeft} ${station.connectors[1].y + style.arrowSize / 2 + style.railroadUnit * 2}
            H ${this.width - style.railroadUnit * 2}
            q ${style.railroadUnit} 0,${style.railroadUnit} ${-style.railroadUnit}
            V ${this.connectors[1].y + style.railroadUnit}
            q 0 ${-style.railroadUnit},${style.railroadUnit} ${-style.railroadUnit}
          `) });
          return g;
        }
      }
    },

    Border(station, annotation = '', useInsideConnectors = true, userClass = '') {
      const textMetrics = measureAnnotationText(annotation);
      return {
        get width() {
          if (station.hasHorizontalPadding) {
            // MEMO: Optimization for `Border(Shortcut(...))`, ...
            return Math.max(station.width, textMetrics.roundedWidth);
          } else {
            return Math.max(station.width + style.railroadUnit * 2, textMetrics.roundedWidth);
          }
        },
        get height() {
          return station.height + style.railroadUnit * 2 + (annotation.length ? style.annotationHeight : 0);
        },
        get connectors() {
          if (useInsideConnectors) {
            if (station.hasHorizontalPadding) {
              // MEMO: Optimization for `Border(Shortcut(...))`, ...
              return [
                { x: station.connectors[0].x, y: station.connectors[0].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
                { x: station.connectors[1].x, y: station.connectors[1].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
              ];
            } else {
              return [
                { x: station.connectors[0].x + style.railroadUnit, y: station.connectors[0].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
                { x: station.connectors[1].x + style.railroadUnit, y: station.connectors[1].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
              ];
            }
          } else {
            return [
              { x: 0, y: station.connectors[0].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
              { x: this.width, y: station.connectors[1].y + style.railroadUnit + (annotation.length ? style.annotationHeight : 0) },
            ];
          }
        },
        // g
        //   text.annotation?
        //   rect.border
        //   station
        render(dx = 0, dy = 0) {
          const g = createSvgElement('g', { class: 'regexp-diagram-border' + (userClass ? ` ${userClass}` : ''), transform: `translate(${dx}, ${dy})` });
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
            height: station.height + style.railroadUnit * 2,
          });
          g.value.appendChild(station.render(station.hasHorizontalPadding ? 0 : style.railroadUnit, style.railroadUnit + (annotation.length ? style.annotationHeight : 0)).value);
          if (this.attributes) {
            for (let name in this.attributes) {
              g.value.setAttribute(name, this.attributes[name]);
            }
          }
          return g;
        }
      };
    },

    HStack() {
      return {
        stations: [],
        get width() {
          const values = this.stations.map(s => s.width);
          return values.length ? values.reduce((a, b) => a + b + style.railroadUnit) : 0;
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
          const g = createSvgElement('g', { class: 'regexp-diagram-hstack', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, (this.height - station.height) / 2).value);
            childX += station.width + style.railroadUnit;
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
          return values.length ? values.reduce((a, b) => a + b + style.railroadUnit) : 0;
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
          const g = createSvgElement('g', { class: 'regexp-diagram-vstack', transform: `translate(${dx}, ${dy})` });
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(0, childY).value);
            childY += station.height + style.railroadUnit;
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
          return stations.map(s => s.width).reduce((a, b) => Math.max(a, b)) + style.railroadUnit * 4;
        },
        get height() {
          return stations.map(s => s.height).reduce((a, b) => a + b + style.railroadUnit);
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
        //   path.railroad
        //   child
        //   path.railroad
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const g = createSvgElement('g', { class: 'regexp-diagram-switch', transform: `translate(${dx}, ${dy})` });
          let childY = 0;
          let childrenY = [];
          for (let i = 0; i < stations.length; ++i) {
            const station = stations[i];
            g.value.appendChild(station.render(style.railroadUnit * 2, childY).value);
            childrenY.push(childY);
            childY += station.height + style.railroadUnit;
          }

          for (let i = 0; i < stations.length; ++i) {
            const station = stations[i];
            if (i == 0) {
              g.appendChild('path', { class: 'railroad', d: pathD(`
                M 0 ${this.connectors[0].y}
                H ${station.connectors[0].x + style.railroadUnit * 2}
                M ${station.connectors[1].x + style.railroadUnit * 2} ${station.connectors[1].y}
                H ${this.width}
              `) });
            } else if (i == 1) {
              g.appendChild('path', { class: 'railroad', d: pathD(`
                M 0 ${this.connectors[0].y}
                q ${style.railroadUnit} 0,${style.railroadUnit} ${style.railroadUnit}
                V ${station.connectors[0].y + childrenY[i] - style.railroadUnit}
                q 0 ${style.railroadUnit},${style.railroadUnit} ${style.railroadUnit}
                H ${station.connectors[0].x + style.railroadUnit * 2}
                M ${station.connectors[1].x + style.railroadUnit * 2} ${station.connectors[1].y + childrenY[i]}
                H ${this.width - style.railroadUnit * 2}
                q ${style.railroadUnit} 0,${style.railroadUnit} ${-style.railroadUnit}
                V ${this.connectors[1].y + style.railroadUnit}
                q 0 ${-style.railroadUnit},${style.railroadUnit} ${-style.railroadUnit}
              `) });
            } else {
              g.appendChild('path', { class: 'railroad', d: pathD(`
                M ${style.railroadUnit} ${childrenY[i - 1] + stations[i - 1].connectors[0].y - style.railroadUnit}
                V ${station.connectors[0].y + childrenY[i] - style.railroadUnit}
                q 0 ${style.railroadUnit},${style.railroadUnit} ${style.railroadUnit}
                H ${station.connectors[0].x + style.railroadUnit * 2}
                M ${station.connectors[1].x + style.railroadUnit * 2} ${station.connectors[1].y + childrenY[i]}
                H ${this.width - style.railroadUnit * 2}
                q ${style.railroadUnit} 0,${style.railroadUnit} ${-style.railroadUnit}
                V ${childrenY[i - 1] + stations[i - 1].connectors[1].y - style.railroadUnit}
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
          return values.length ? values.reduce((a, b) => a + b + style.railroadUnit) : 0;
        },
        get height() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          const alignedStationsBottom = this.stations.map(s => connectorLevel - s.connectors[0].y + s.height).reduce((a, b) => Math.max(a, b));
          return alignedStationsBottom;
        },
        get connectors() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          const lastChildX = this.stations.slice(0, -1).map(s => s.width).reduce((a, b) => a + b + style.railroadUnit, 0);
          return [
            { x: this.stations[0].connectors[0].x, y: connectorLevel },
            { x: lastChildX + this.stations.slice(-1)[0].connectors[1].x, y: connectorLevel },
          ];
        },
        // g
        //   child
        //   path.railroad
        //   child
        //   path.railroad
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));

          const g = createSvgElement('g', { class: 'regexp-diagram-straightroute', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, connectorLevel - station.connectors[0].y).value);
            // MEMO: Draw the railroad on the front of the station background-color
            if (i > 0) {
              g.appendChild('path', { class: 'railroad', d: pathD(`
                M ${childX - stations[i - 1].width - style.railroadUnit + stations[i - 1].connectors[1].x} ${this.connectors[0].y}
                H ${childX + station.connectors[0].x}
              `) });
            }
            childX += station.width + style.railroadUnit;
          }
          return g;
        }
      };
    },

    Wrapping(stations) {
      return {
        stations: stations,
        get width() {
          const widthList = this.stations.map(s => s.width);
          if (this.stations.length >= 2) {
            // The first and last have the wrapping railroad on one side (right or left),
            // the rest have it on both sides.
            for (let i = 0; i < this.stations.length; ++i) {
              if (i == 0 || i == this.stations.length - 1) {
                widthList[i] += style.railroadUnit * 2;
              } else {
                widthList[i] += style.railroadUnit * 4;
              }
            }
          }
          return widthList.reduce((a, b) => Math.max(a, b));
        },
        get height() {
          return this.stations.map(s => s.height).reduce((a, b) => a + b + style.railroadUnit * 4);
        },
        get connectors() {
          return [];
        },
        // g
        //   child
        //   path.railroad
        //   child
        //   path.railroad
        //   ...
        //   child
        render(dx = 0, dy = 0) {
          const g = createSvgElement('g', { class: 'regexp-diagram-wrapping', transform: `translate(${dx}, ${dy})` });
          let childX = 0;
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, childY).value);
            if (i < this.stations.length - 1) {
              g.appendChild('path', { class: 'railroad', d: pathD(`
                M ${childX + station.connectors[1].x} ${childY + station.connectors[1].y}
                H ${childX + station.width + style.railroadUnit}
                q ${style.railroadUnit} 0, ${style.railroadUnit} ${style.railroadUnit}
                V ${childY + station.height + style.railroadUnit}
                q 0 ${style.railroadUnit}, ${-style.railroadUnit} ${style.railroadUnit}
                H ${style.railroadUnit}
                q ${-style.railroadUnit} 0, ${-style.railroadUnit} ${style.railroadUnit}
                V ${childY + station.height + style.railroadUnit * 3 + this.stations[i + 1].connectors[0].y}
                q 0 ${style.railroadUnit}, ${style.railroadUnit} ${style.railroadUnit}
                H ${style.railroadUnit * 2 + this.stations[i + 1].connectors[0].x}
              `) });
            }
            childX = style.railroadUnit * 2;
            childY += station.height + style.railroadUnit * 4;
          }
          return g;
        }
      };
    },
  };
}

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (let key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return {
    get value() {
      return element;
    },
    appendChild(name, attributes = {}) {
      const child = createSvgElement(name, attributes);
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


function testStations(railroadMaker) {
  const stations = [];
  stations.push(railroadMaker.TerminalStation());
  stations.push(
    railroadMaker.CharacterStation(
      'Hello world!',
      false
    )
  );
  stations.push(
    railroadMaker.Loop(
      railroadMaker.CharacterStation(
        'any character',
        true
      ),
      'loop',
      false
    )
  );
  stations.push(
    railroadMaker.Shortcut(
      railroadMaker.CharacterStation(
        'a',
        true
      )
    )
  );
  stations.push(
    railroadMaker.Shortcut(
      railroadMaker.Loop(
        railroadMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railroadMaker.Loop(
      railroadMaker.Loop(
        railroadMaker.CharacterStation(
          'a',
          true
        ),
        'inner loop text ...'
      ),
      'outer loop text ...'
    )
  );
  stations.push(
    railroadMaker.Shortcut(
      railroadMaker.Shortcut(
        railroadMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railroadMaker.Loop(
      railroadMaker.Shortcut(
        railroadMaker.CharacterStation(
          'a',
          true
        )
      ),
      ''
    )
  );
  stations.push(
    railroadMaker.Border(
      railroadMaker.CharacterStation(
        'a',
        true
      ),
      'group'
    )
  );
  stations.push(
    railroadMaker.Border(
      railroadMaker.CharacterStation(
        'a',
        true
      ),
      'long long text ...'
    )
  );
  stations.push(
    railroadMaker.Border(
      railroadMaker.Shortcut(
        railroadMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railroadMaker.Border(
      railroadMaker.Loop(
        railroadMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railroadMaker.Border(
      railroadMaker.Border(
        railroadMaker.CharacterStation(
          'a',
          true
        ),
        'inner border text ...'
      ),
      'outer border text ...'
    )
  );
  stations.push(railroadMaker.SelectionStation(
    [
      railroadMaker.CharacterStation('1'),
      railroadMaker.CharacterStation('a', true),
      railroadMaker.RangeStation(railroadMaker.CharacterStation('0'), railroadMaker.CharacterStation('9'), false),
    ]
  ));
  stations.push(
    railroadMaker.Shortcut(
      railroadMaker.SelectionStation(
        [
          railroadMaker.CharacterStation('1'),
          railroadMaker.CharacterStation('a', true),
          railroadMaker.RangeStation(railroadMaker.CharacterStation('0'), railroadMaker.CharacterStation('9'), false),
        ]
      )
    )
  );
  stations.push(
    railroadMaker.Shortcut(
      railroadMaker.Loop(
        railroadMaker.SelectionStation(
          [
            railroadMaker.CharacterStation('1'),
            railroadMaker.CharacterStation('a', true),
            railroadMaker.RangeStation(railroadMaker.CharacterStation('0'), railroadMaker.CharacterStation('9'), false),
          ]
        )
      )
    )
  );
  stations.push(
    railroadMaker.Switch(
      [
        railroadMaker.CharacterStation('1'),
        railroadMaker.Loop(railroadMaker.CharacterStation('a', true), 'once'),
        railroadMaker.Shortcut(railroadMaker.CharacterStation('a', true)),
        railroadMaker.Shortcut(
          railroadMaker.Loop(
            railroadMaker.SelectionStation(
              [
                railroadMaker.CharacterStation('1'),
                railroadMaker.CharacterStation('a', true),
                railroadMaker.RangeStation(railroadMaker.CharacterStation('0'), railroadMaker.CharacterStation('9'), false),
              ]
            )
          )
        )
      ]
    )
  );
  stations.push(railroadMaker.RangeStation(railroadMaker.CharacterStation('1'), railroadMaker.CharacterStation('a', true)));
  stations.push(railroadMaker.StraightRoute(
    [
      railroadMaker.CharacterStation('1'),
      railroadMaker.Loop(railroadMaker.CharacterStation('a', true)),
      railroadMaker.Border(railroadMaker.CharacterStation('a', true)),
      railroadMaker.Shortcut(railroadMaker.CharacterStation('a', true)),
    ]
  ));
  stations.push(railroadMaker.TerminalStation());
  return stations;
}
