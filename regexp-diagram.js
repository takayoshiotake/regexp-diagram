export function render(element) {
  const railwayMaker = RailwayMaker();
  const svg = railwayMaker.StyledSvgTag();

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
      'loop'
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

  // DEBUG
  for (let i = 0; i < stations.length; ++i) {
    stations[i] = railwayMaker.Bounds(stations[i]);
  }

  // const connectorLevel = stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
  // stations.forEach(s => {
  //   s.y = connectorLevel - s.connectors[0].y + s.y;
  // });
  
  let g = svg.appendChild('g', {transform: 'translate(1, 1)'});

  const routes = [];
  let route = railwayMaker.StraightRoute([]);
  for (let i = 0; i < stations.length; ++i) {
    if ((i + 1) % 10 == 0) {
      routes.push(route);
      route = railwayMaker.StraightRoute([]);
    }
    route.stations.push(stations[i]);
  }
  routes.push(route);

  const wrapping = railwayMaker.Bounds(railwayMaker.Wrapping(routes));

  // routes.forEach((route, i) => {
  //   g.value.appendChild(route.render(0, i * 200).value);
  // });

  g.value.appendChild(wrapping.render().value);

  // for (let i = 1; i < routes.length; ++i) {
  //   g.appendChild(
  //     'path',
  //     {
  //       class: 'link',
  //       d: pathD(`
  //         M${routes[i - 1].connectors[1].x} ${routes[i - 1].connectors[1].y + (i - 1) * 200}
  //         L${routes[i].connectors[0].x} ${routes[i].connectors[0].y + i * 200}
  //       `),
  //     }
  //   );
  // }

  // FIXME: 2 means railwayWidth / 2 * 2
  svg.value.setAttribute('width', wrapping.width + 2);
  svg.value.setAttribute('height', wrapping.height + 2);
  element.innerHTML = svg.value.outerHTML;
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

function css(str) {
  return str.trim();
}

function pathD(str) {
  return str.replace(/\s/g, ' ').replace(/\s{2,}/g, '');
}

const defaultStyle = {
  stationHeight: 24,
  characterFontSize: 16,
  characterFontFamily: 'Arial',
  characterHorizontalPadding: 6,
  helperHeight: 24,
  helperFontSize: 12,
  helperFontFamily: 'Arial',
  railwayWidth: 2,
  railwayUnit: 12,
  arrowSize: 12,
};

function RailwayMaker(style = defaultStyle) {
  const measureText = text => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${style.characterFontSize}px ${style.characterFontFamily}`;
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
  const measureHelperText = text => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${style.helperFontSize}px ${style.helperFontFamily}`;
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
text.helper {
  font-size: ${style.helperFontSize}px;
  font-family: ${style.helperFontFamily};
}
tspan.quotation, text.hyphen {
  fill: rgba(0, 0, 0, 0.6);
}
rect.station {
  fill: none;
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
rect.border {
  fill: none;
  stroke: black;
  stroke-width: ${style.railwayWidth}px;
  stroke-dasharray: 4 2;
}
path.link {
  fill: none;
  stroke: magenta;
  stroke-width: 1px;
}
rect.bounds {
  fill: none;
  stroke: magenta;
  stroke-width: 1px;
}
      `);
      return svgTag;
    },

    Hyphen(x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          const textMetrics = measureText('−');
          return textMetrics.roundedWidth;
        },
        get height() {
          return style.stationHeight;
        },
        get connectors() {
          return [
            { x: this.x, y: this.height / 2 },
            { x: this.x + this.width, y: this.height / 2 },
          ];
        },
        render(dx = 0, dy = 0) {
          const textMetrics = measureText('−');

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
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

    CharacterStation(character, isClassified, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          const textMetrics = measureText(isClassified ? character : `“${character}”`);
          // MEMO: between stroke centers
          return textMetrics.roundedWidth + style.characterHorizontalPadding * 2;
        },
        get height() {
          // MEMO: between stroke centers
          return style.stationHeight;
        },
        get connectors() {
          return [
            { x: this.x, y: this.height / 2 },
            { x: this.x + this.width, y: this.height / 2 },
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
          const textMetrics = measureText(isClassified ? character : `“${character}”`);

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
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

    TerminalStation(x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          // MEMO: between stroke centers
          return style.railwayWidth * 2;
        },
        get height() {
          return style.stationHeight;
        },
        get connectors() {
          return [
            { x: this.x, y: this.height / 2 },
            { x: this.x + this.width, y: this.height / 2 },
          ];
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          g.appendChild(
            'path',
            {
              class: 'railway',
              d: pathD(`
M0 0
V${this.height}
M${this.width} 0
V${this.height}
              `),
            }
          );
          return g;
        },
      };
    },

    // DEBUG
    Bounds(station, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          return station.width;
        },
        get height() {
          return station.height;
        },
        get connectors() {
          return [
            { x: this.x + station.connectors[0].x, y: this.y + station.connectors[0].y },
            { x: this.x + station.connectors[1].x, y: this.y + station.connectors[1].y },
          ];
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          g.value.appendChild(station.render().value);
          g.appendChild('rect', {
            class: 'bounds',
            x: station.x,
            y: station.y,
            width: this.width,
            height: this.height,
          });
          return g;
        }
      };
    },

    Loop(station, help = '', x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          const textMetrics = measureHelperText(help);
          return Math.max(station.width + style.railwayUnit * 2, style.railwayUnit + textMetrics.roundedWidth);
        },
        get height() {
          return station.height + style.railwayUnit * 2 + style.arrowSize / 2 + (help.length ? style.helperHeight : 0);
        },
        get connectors() {
          return [
            { x: this.x + style.railwayUnit, y: this.y + station.connectors[0].y },
            { x: this.x + this.width - style.railwayUnit, y: this.y + station.connectors[1].y },
          ];
        },
        // g
        //   station
        //   path.railway
        //   path.arrow
        //   text.helper
        render(dx = 0, dy = 0) {
          const textMetrics = measureHelperText(help);

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          g.value.appendChild(station.render(style.railwayUnit, 0).value);
          g.appendChild('path', { class: 'railway', d: pathD(`
M ${station.connectors[1].x + style.railwayUnit} ${station.connectors[1].y}
H ${this.width - style.railwayUnit}
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
          if (help.length) {
            g.appendChild('text', {
              class: 'helper',
              x: style.railwayUnit,
              y: station.height + style.railwayUnit * 2 + style.arrowSize / 2 + textMetrics.fontBoundingBoxAscent + (style.helperHeight - textMetrics.height) / 2,
            }).value.textContent = help;
          }
          return g;
        }
      }
    },

    Shortcut(station, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          // MEMO: Optimization for `Shortcut(Loop(...))`
          const spaceLeft = station.connectors[0].x - station.x;
          const spaceRight = station.x + station.width - station.connectors[1].x;
          return station.width + style.railwayUnit * 4 - spaceLeft - spaceRight;
        },
        get height() {
          return station.height + style.arrowSize / 2 + style.railwayUnit * 2;
        },
        get connectors() {
          return [
            { x: this.x, y: style.arrowSize / 2 },
            { x: this.x + this.width, y: style.arrowSize / 2 },
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
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });

          // MEMO: Optimization for `Shortcut(Loop(...))`
          const spaceLeft = station.connectors[0].x - station.x;
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
M ${this.width - style.railwayUnit * 2} ${station.connectors[1].y + style.arrowSize / 2 + style.railwayUnit * 2}
q ${style.railwayUnit} 0,${style.railwayUnit} ${-style.railwayUnit}
V ${this.connectors[1].y + style.railwayUnit}
q 0 ${-style.railwayUnit},${style.railwayUnit} ${-style.railwayUnit}
          `) });
          return g;
        }
      }
    },

    Border(station, help = '', useInsideConnectors = true, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          const textMetrics = measureHelperText(help);
          if (station.hasHorizontalPadding) {
            // MEMO: Optimization for `Border(Shortcut(...))`, ...
            return Math.max(station.width, textMetrics.roundedWidth);
          } else {
            return Math.max(station.width + style.railwayUnit * 2, textMetrics.roundedWidth);
          }
        },
        get height() {
          return station.height + style.railwayUnit * 2 + (help.length ? style.helperHeight : 0);
        },
        get connectors() {
          if (useInsideConnectors) {
            if (station.hasHorizontalPadding) {
              // MEMO: Optimization for `Border(Shortcut(...))`, ...
              return [
                { x: this.x + station.connectors[0].x, y: this.y + station.connectors[0].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
                { x: this.x + station.connectors[1].x, y: this.y + station.connectors[1].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
              ];
            } else {
              return [
                { x: this.x + station.connectors[0].x + style.railwayUnit, y: this.y + station.connectors[0].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
                { x: this.x + station.connectors[1].x + style.railwayUnit, y: this.y + station.connectors[1].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
              ];
            }
          } else {
            return [
              { x: this.x, y: this.y + station.connectors[0].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
              { x: this.x + this.width, y: this.y + station.connectors[1].y + style.railwayUnit + (help.length ? style.helperHeight : 0) },
            ];
          }
        },
        render(dx = 0, dy = 0) {
          const textMetrics = measureHelperText(help);

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          if (help.length) {
            g.appendChild('text', {
              class: 'helper',
              x: 0,
              y: textMetrics.fontBoundingBoxAscent + (style.helperHeight - textMetrics.height) / 2,
            }).value.textContent = help;
          }
          g.value.appendChild(station.render(station.hasHorizontalPadding ? 0 : style.railwayUnit, style.railwayUnit + (help.length ? style.helperHeight : 0)).value);
          g.appendChild('rect', {
            class: 'border',
            x: station.x,
            y: station.y + (help.length ? style.helperHeight : 0),
            width: this.width,
            height: station.height + style.railwayUnit * 2,
          });
          return g;
        }
      };
    },

    HStack(x = 0, y = 0) {
      return {
        stations: [],
        x: x,
        y: y,
        get width() {
          const values = this.stations.map(s => s.x + s.width);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get height() {
          const values = this.stations.map(s => s.y + s.height);
          return values.length ? values.reduce((a, b) => Math.max(a, b)) : 0;
        },
        get connectors() {
          return [
            { x: this.x, y: this.y + this.height / 2 },
            { x: this.x + this.width, y: this.y + this.height / 2 },
          ];
        },
        render(dx = 0, dy = 0) {
          const textMetrics = measureText('−');

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, (this.height - station.height) / 2).value);
            childX += station.x + station.width + style.railwayUnit;
          }
          return g;
        }
      };
    },

    VStack(x = 0, y = 0) {
      return {
        stations: [],
        x: x,
        y: y,
        get width() {
          const values = this.stations.map(s => s.x + s.width);
          return values.length ? values.reduce((a, b) => Math.max(a, b)) : 0;
        },
        get height() {
          const values = this.stations.map(s => s.y + s.height);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get connectors() {
          return [
            { x: this.x, y: this.stations.length ? this.stations[0].connectors[0].y : this.y + this.height / 2 },
            { x: this.x + this.width, y: this.stations.length ? this.stations[0].connectors[1].y : this.y + this.height / 2 },
          ];
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(0, childY).value);
            childY += station.y + station.height + style.railwayUnit;
          }
          return g;
        }
      };
    },

    RangeStation(s0, s1, hasBorder = true, x = 0, y = 0) {
      const hstack = this.HStack(x, y);
      hstack.stations.push(s0);
      hstack.stations.push(this.Hyphen());
      hstack.stations.push(s1);
      return hasBorder ? this.Border(hstack, 'one of:', false) : hstack;
    },

    SelectionStation(stations, x = 0, y = 0) {
      const vstak = this.VStack(x, y);
      vstak.stations = stations;
      return this.Border(vstak, 'one of:', false);
    },

    Switch(stations, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          return stations.map(s => s.x + s.width).reduce((a, b) => Math.max(a, b)) + style.railwayUnit * 4;
        },
        get height() {
          return stations.map(s => s.y + s.height).reduce((a, b) => a + b + style.railwayUnit);
        },
        get connectors() {
          return [
            { x: this.x, y: stations[0].connectors[0].y },
            { x: this.x + this.width, y: stations[0].connectors[1].y },
          ];
        },
        get hasHorizontalPadding() {
          return true;
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          let childY = 0;
          let childrenY = [];
          for (let i = 0; i < stations.length; ++i) {
            const station = stations[i];
            g.value.appendChild(station.render(style.railwayUnit * 2, childY).value);
            childrenY.push(childY);
            childY += station.y + station.height + style.railwayUnit;
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

    StraightRoute(stations, x = 0, y = 0) {
      return {
        stations: stations,
        x: x,
        y: y,
        get width() {
          const values = this.stations.map(s => s.x + s.width);
          return values.length ? values.reduce((a, b) => a + b + style.railwayUnit) : 0;
        },
        get height() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          const alignedStationsBottom = this.stations.map(s => connectorLevel - s.connectors[0].y + s.y + s.height).reduce((a, b) => Math.max(a, b));
          return this.y + alignedStationsBottom;
        },
        get connectors() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          return [
            { x: this.x, y: this.y + connectorLevel },
            { x: this.x + this.width, y: this.y + connectorLevel },
          ];
        },
        render(dx = 0, dy = 0) {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));

          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          let childX = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, connectorLevel - station.connectors[0].y + station.y).value);
            if (i < this.stations.length - 1) {
              g.appendChild('path', { class: 'railway', d: pathD(`
M ${childX + station.connectors[1].x} ${this.connectors[0].y}
H ${childX + station.x + station.width + style.railwayUnit + this.stations[i + 1].connectors[0].x}
              `) });
            }
            childX += station.x + station.width + style.railwayUnit;
          }
          return g;
        }
      };
    },

    Wrapping(stations, x = 0, y = 0) {
      return {
        stations: stations,
        x: x,
        y: y,
        get width() {
          return this.stations.map(s => s.x + s.width).reduce((a, b) => Math.max(a, b)) + (this.stations.length >= 2 ? style.railwayUnit * 2: 0);
        },
        get height() {
          return this.stations.map(s => s.y + s.height).reduce((a, b) => a + b + style.railwayUnit * 2);
        },
        get connectors() {
          const connectorLevel = this.stations.map(s => s.connectors[0].y).reduce((a, b) => Math.max(a, b));
          return [
            { x: this.x, y: this.y + connectorLevel },
            { x: this.x + this.width, y: this.y + connectorLevel },
          ];
        },
        render(dx = 0, dy = 0) {
          const g = createElement('g', { transform: `translate(${this.x + dx}, ${this.y + dy})` });
          let childX = 0;
          let childY = 0;
          for (let i = 0; i < this.stations.length; ++i) {
            const station = this.stations[i];
            g.value.appendChild(station.render(childX, childY).value);
            if (i < this.stations.length - 1) {
              g.appendChild('path', { class: 'railway', d: pathD(`
M ${childX + station.connectors[1].x} ${childY + station.connectors[1].y}
q ${style.railwayUnit} 0, ${style.railwayUnit} ${style.railwayUnit}
V ${childY + station.y + station.height}
q 0 ${style.railwayUnit}, ${-style.railwayUnit} ${style.railwayUnit}
H ${style.railwayUnit}
q ${-style.railwayUnit} 0, ${-style.railwayUnit} ${style.railwayUnit}
V ${childY + station.y + station.height + style.railwayUnit + this.stations[i + 1].connectors[0].y}
q 0 ${style.railwayUnit}, ${style.railwayUnit} ${style.railwayUnit}
H ${style.railwayUnit + this.stations[i + 1].connectors[0].x}
              `) });
            }
            childX = style.railwayUnit;
            childY += station.y + station.height + style.railwayUnit * 2;
          }
          return g;
        }
      };
    },
  };
}
