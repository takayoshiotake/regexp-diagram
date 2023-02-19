import './style.css';
import { makeDiagramSvg } from './regexp-diagram';

document.querySelector('#version').innerHTML = `regexp-diagram 2.0.0-a1`;

const views = {
  regexpText: document.querySelector('#text-regexp'),
  renderButton: document.querySelector('#button-render'),
  downloadSvgButton: document.querySelector('#button-download-svg'),
  downloadPngButton: document.querySelector('#button-download-png'),
  diagram: document.querySelector('#diagram'),
};

function init() {
  // const isMac = navigator.platform.toUpperCase().indexOf('MAC') !== -1;
  const isMac = undefined;
  views.renderButton.value += '  ' + (isMac ? '(⌘Enter)' : '(Ctrl+Enter)');
  document.addEventListener('keydown', event => {
    if ((isMac ? event.metaKey : event.ctrlKey) && event.key === 'Enter') {
      render();
    }
  });

  views.renderButton.addEventListener('click', () => {
    render();
  });
  views.downloadSvgButton.addEventListener('click', () => {
    downloadSvg();
  });
  views.downloadPngButton.addEventListener('click', () => {
    downloadPng();
  });

  const regexp = localStorage.getItem('regexp')
  if (regexp !== null) {
    views.regexpText.value = regexp;
  }
  if (views.regexpText.value === '') {
    views.regexpText.value = '-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?';
  }
  render();
}

function render() {
  const regexp = views.regexpText.value;
  localStorage.setItem('regexp', regexp);

  performance.mark('start');
  const svg = makeDiagramSvg(regexp);
  document.querySelector('#diagram').innerHTML = svg.outerHTML;
  // xxx
  document.querySelector('#diagram').style.height = svg.getAttribute('height') + 'px';
  performance.mark('end');
  performance.measure('time', 'start', 'end');
  console.log(performance.getEntriesByName('time')[0].duration); 
}

function downloadSvg() {
  const svgText = views.diagram.innerHTML;
  const a = document.createElement('a');
  a.download = 'regexp-diagram.svg';
  a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
  a.click()
}

function downloadPng() {
  const svgText = views.diagram.innerHTML;
  const image = new Image();
  image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = image.naturalWidth * scale;
      canvas.height = image.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(image, 0, 0);

      const a = document.createElement('a');
      a.download = `regexp-diagram.png`;
      a.href = canvas.toDataURL();
      a.click();
  }
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

init();
