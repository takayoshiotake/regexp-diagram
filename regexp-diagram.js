export function render(element) {
  const railwayMaker = RailwayMaker();
  const svg = railwayMaker.StyledSvgTag();
  // FIXME
  svg.value.setAttribute('width', 1000);

  const stations = [];
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
      )
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.CharacterStation(
        'any character',
        true
      )
    )
  );

  // DEBUG
  for (let i = 0; i < stations.length; ++i) {
    stations[i] = railwayMaker.Bounds(stations[i]);
  }
  for (let i = 1; i < stations.length; ++i) {
    stations[i].x = stations[i - 1].x + stations[i - 1].width + 12;
  }
  
  let g = svg.appendChild('g', {transform: 'translate(1, 1)'});
  stations.forEach(station => {
    g.value.appendChild(station.render().value);
  });

  for (let i = 1; i < stations.length; ++i) {
    g.appendChild(
      'path',
      {
        class: 'link',
        d: pathD(`
          M${stations[i - 1].connectors[1].x} ${stations[i - 1].connectors[1].y}
          L${stations[i].connectors[0].x} ${stations[i].connectors[0].y}
        `),
      }
    );
  }

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
  strokeWidth: 2,
  spacing: 12,
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
text {
  fill: black;
  font-size: ${style.characterFontSize}px;
  font-family: ${style.characterFontFamily};
  white-space: nowrap;
}
text.classified {
  font-style: oblique;
}
tspan.quotation, tspan.hyphen {
  fill: rgba(0, 0, 0, 0.6);
}
rect.station {
  fill: none;
  stroke: black;
  stroke-width: ${style.strokeWidth}px;
}
path.railway {
  fill: none;
  stroke: black;
  stroke-width: ${style.strokeWidth}px;
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
        // isClassified:
        // g
        //   rect
        //   text.classified
        //
        // g
        //   rect
        //   text
        //     tspan.quotation
        //     tspan
        //     tspan.quotation
        render() {
          const textMetrics = measureText(isClassified ? character : `“${character}”`);

          const g = createElement('g', { transform: `translate(${this.x}, ${this.y})` });
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
        render() {
          const g = createElement('g', { transform: `translate(${this.x}, ${this.y})` });
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

    Loop(station, x = 0, y = 0) {
      return {
        x: x,
        y: y,
        get width() {
          return station.width + style.spacing * 2;
        },
        get height() {
          return station.height + style.spacing * 2 + style.arrowSize / 2;
        },
        get connectors() {
          return [
            { x: this.x + style.spacing, y: station.connectors[0].y },
            { x: this.x + this.width - style.spacing, y: station.connectors[1].y },
          ];
        },
        render() {
          const g = createElement('g', { transform: `translate(${this.x + style.spacing}, ${this.y})` });
          g.value.appendChild(station.render().value);
          g.appendChild('path', { class: 'railway', d: pathD(`
M ${station.connectors[1].x} ${station.connectors[1].y}
q ${style.spacing} 0,${style.spacing} ${style.spacing}
V ${station.height + style.spacing}
q 0 ${style.spacing},-${style.spacing} ${style.spacing}
H ${station.connectors[0].x}
m ${style.arrowSize} -${style.arrowSize / 2}
l -${style.arrowSize} ${style.arrowSize / 2}
l ${style.arrowSize} ${style.arrowSize / 2}
m -${style.arrowSize} -${style.arrowSize / 2}
q -${style.spacing} 0,-${style.spacing} -${style.spacing}
V ${station.connectors[0].y + style.spacing}
q 0 -${style.spacing},${style.spacing} -${style.spacing}
          `) });
          return g;
        }
      }
    },
  };
}
