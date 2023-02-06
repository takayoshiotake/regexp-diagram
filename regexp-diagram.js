export function render(element) {
  const svg = createElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'version': '1.1',
  });
  const style = svg
    .append('defs')
    .append(
      'style',
      {
        type: 'text/css'
      }
    );
  // MEMO: center stroke
  style.value.textContent = css(`
text {
  fill: blue;
  font-size: 16px;
  font-family: Arial;
}
rect.box, path.line {
  fill: none;
  stroke: black;
  stroke-width: 2px;
}
  `);
  const metrics = measureText('Hello', '16px Arial');
  console.log(metrics);

  let g = svg.append('g', {transform: 'translate(1, 1)'});

  g.append(
    'rect',
    {
      class: 'box',
      x: 0,
      y: 0,
      width: metrics.width,
      height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
    }
  );
  g.append(
    'text',
    {
      x: 0,
      y: metrics.fontBoundingBoxAscent,
    }
  ).value.textContent = 'Hello';
  g.append(
    'path',
    {
      class: 'line',
      d: `M${metrics.width} ${(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / 2}h12`,
    }
  );

  element.innerHTML = svg.value.outerHTML;
}

function measureText(text, font) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text);
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
    append(name, attributes = {}) {
      const child = createElement(name, attributes);
      this.value.appendChild(child.value);
      return child;
    },
    attrs: new Proxy(element, {
      get: function(element, prop) {
        return element.getAttribute(prop);
      },
      set: function(element, prop, value) {
        element.setAttribute(prop, value);
        return true;
      },
    })
  };
}

function css(str) {
  return str.replace(/\s{2,}/g, '');
}
