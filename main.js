import './style.css';
import { makeDiagramSvg } from './regexp-diagram';

document.querySelector('#version').innerHTML = `regexp-diagram 2.0.0-a1`;

performance.mark('start');
const svg = makeDiagramSvg();
document.querySelector('#diagram').innerHTML = svg.outerHTML;
// xxx
document.querySelector('#diagram').style.height = svg.getAttribute('height') + 'px';
performance.mark('end');
performance.measure('time', 'start', 'end');
console.log(performance.getEntriesByName('time')[0].duration);
