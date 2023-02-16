import './style.css';
import { makeDiagramSvg } from './regexp-diagram';

document.querySelector('#version').innerHTML = `regexp-diagram 2.0.0-a1`;

const views = {
  optionDarkMode: document.querySelector('#option-dark-mode'),
};

views.optionDarkMode.checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  views.optionDarkMode.checked = event.matches;
});
views.optionDarkMode.addEventListener('change', event => {
  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(event.target.checked ? 'dark' : 'light');
});

performance.mark('start');
const svg = makeDiagramSvg();
document.querySelector('#diagram').innerHTML = svg.outerHTML;
// xxx
document.querySelector('#diagram').style.height = svg.getAttribute('height') + 'px';
performance.mark('end');
performance.measure('time', 'start', 'end');
console.log(performance.getEntriesByName('time')[0].duration);
