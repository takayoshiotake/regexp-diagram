import './style.css';
import { makeDiagramSvg } from './regexp-diagram';

document.querySelector('#version').innerHTML = `regexp-diagram ${__APP_VERSION__}`;

const views = {
  regexpTxtTab: document.querySelector('#tab-regexp-txt'),
  styleJsonTab: document.querySelector('#tab-style-json'),
  regexpText: document.querySelector('#text-regexp'),
  styleText: document.querySelector('#text-style'),
  renderButton: document.querySelector('#button-render'),
  downloadSvgButton: document.querySelector('#button-download-svg'),
  downloadPngButton: document.querySelector('#button-download-png'),
  nowrapOption: document.querySelector('#option-nowrap'),
  showBoundsOption: document.querySelector('#option-show-bounds'),
  diagram: document.querySelector('#diagram'),
};

const state = {
  currentTab: views.regexpTxtTab,
  isAutoRendering: false,
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

  views.regexpTxtTab.addEventListener('click', () => {
    state.currentFile = views.regexpTxtTab;
    views.styleJsonTab.classList.remove('active');
    views.regexpTxtTab.classList.add('active');
    views.regexpText.style.display = 'block';
    views.styleText.style.display = 'none';
    views.regexpText.style.height = views.styleText.style.height;
  });
  views.styleJsonTab.addEventListener('click', () => {
    state.currentFile = views.styleJsonTab;
    views.regexpTxtTab.classList.remove('active');
    views.styleJsonTab.classList.add('active');
    views.regexpText.style.display = 'none';
    views.styleText.style.display = 'block';
    views.styleText.style.height = views.regexpText.style.height;
  });
  views.regexpText.addEventListener('input', () => {
    if (state.isAutoRendering) {
      console.log('Skipped auto-rendering');
      return;
    }
    state.isAutoRendering = true;
    setTimeout(() => {
      render();
      state.isAutoRendering = false;
    }, 300);
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
  views.nowrapOption.addEventListener('change', () => {
    localStorage.setItem('nowrap', views.nowrapOption.checked);
    render();
  });
  views.showBoundsOption.addEventListener('change', () => {
    localStorage.setItem('showBounds', views.showBoundsOption.checked);
    render();
  });

  const nowrap = localStorage.getItem('nowrap');
  if (nowrap !== null) {
    views.nowrapOption.checked = nowrap === 'true';
  }
  const showBounds = localStorage.getItem('showBounds');
  if (showBounds !== null) {
    views.showBoundsOption.checked = showBounds === 'true';
  }
  const regexp = localStorage.getItem('regexp')
  if (regexp !== null) {
    views.regexpText.value = regexp;
  }
  if (views.regexpText.value === '') {
    views.regexpText.value = String.raw`-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?`;
  }
  views.styleText.value = JSON.stringify({
    characterFontFamily: "Arial",
    annotationFontFamily: "Arial",
  }, null, 2);
  render();
}

function render() {
  const regexp = views.regexpText.value;
  localStorage.setItem('regexp', regexp);

  const wrap = views.nowrapOption.checked ? Infinity : 640;
  const showBounds = views.showBoundsOption.checked;
  try {
    performance.clearMeasures('time');
    performance.mark('start');
    const svg = makeDiagramSvg(
      regexp,
      {
        wrap,
        showBounds,
        ...JSON.parse(views.styleText.value),
      },
      false
    );
    views.diagram.innerHTML = '';
    views.diagram.appendChild(svg);

    for (let selectable of svg.querySelectorAll('*[data-text-range]')) {
      selectable.addEventListener('click', e => {
        const textRange = selectable.getAttribute('data-text-range').split(',');
        views.regexpText.focus();
        views.regexpText.setSelectionRange(textRange[0], textRange[1]);
        e.stopPropagation();
      });
    }

    // xxx
    views.diagram.style.height = svg.getAttribute('height') + 'px';
    performance.mark('end');
    performance.measure('time', 'start', 'end');
    console.log(performance.getEntriesByName('time')[0].duration);
  } catch (e) {
    console.warn(e);
    views.diagram.innerHTML = `<p class="text-warning">${e}</p>`;
    // xxx
    views.diagram.style.height = 'auto';
  }
}

function downloadSvg() {
  const svgText = views.diagram.querySelector('svg').outerHTML;
  if (!svgText) {
    return;
  }
  const a = document.createElement('a');
  a.download = 'regexp-diagram.svg';
  a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
  a.click()
}

function downloadPng() {
  const svgText = views.diagram.querySelector('svg').outerHTML;
  if (!svgText) {
    return;
  }
  const image = new Image();
  image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 1;
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
