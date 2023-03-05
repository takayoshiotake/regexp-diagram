(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerpolicy&&(n.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?n.credentials="include":r.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();const v={stationHeight:24,characterFontSize:16,characterFontFamily:"Arial",characterHorizontalPadding:6,annotationHeight:24,annotationFontSize:12,annotationFontFamily:"Arial",railroadWidth:2,railroadUnit:12,arrowSize:12};function T(e=v){const a=t=>U(t,`${e.characterFontSize}px ${e.characterFontFamily}`),o=t=>U(t,`${e.annotationFontSize}px ${e.annotationFontFamily}`);return{get style(){return e},StyledSvgTag(t=""){const r=g("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg"}),n=r.appendChild("defs").appendChild("style",{type:"text/css"});return n.value.textContent=H(`
* {
  stroke-linecap: butt;
}
text {
  fill: black;
  font-size: ${e.characterFontSize}px;
  font-family: ${e.characterFontFamily};
  white-space: nowrap;
}
text.classified {
  font-style: oblique;
}
text.annotation {
  font-size: ${e.annotationFontSize}px;
  font-family: ${e.annotationFontFamily};
}
tspan.quotation, text.hyphen {
  fill: rgba(0, 0, 0, 0.6);
}
rect.station {
  fill: white;
  stroke: black;
  stroke-width: ${e.railroadWidth}px;
}
path.railroad {
  fill: none;
  stroke: black;
  stroke-width: ${e.railroadWidth}px;
}
path.arrow {
  fill: none;
  stroke: black;
  stroke-width: ${e.railroadWidth}px;
}
path.loop {
  fill: none;
  stroke: black;
  stroke-width: ${e.railroadWidth}px;
}
.non-greedy path.loop {
  stroke-dasharray: 4 2;
}
rect.border {
  fill: #F0F0F0;
  stroke: black;
  stroke-width: ${e.railroadWidth}px;
  stroke-dasharray: 4 2;
}

rect.bounds {
  fill: none;
  stroke: magenta;
  stroke-width: 1px;
}
${t}
      `),r},Hyphen(){const t=a("−");return{get width(){return t.roundedWidth},get height(){return e.stationHeight},get connectors(){return[]},render(r=0,n=0){const i=g("g",{class:"regexp-diagram-hyphen",transform:`translate(${r}, ${n})`});return i.appendChild("text",{class:"hyphen",x:(t.roundedWidth-t.width)/2,y:t.fontBoundingBoxAscent+(e.stationHeight-t.height)/2}).value.textContent="−",i}}},CharacterStation(t,r){const n=a(r?t:`“${t}”`);return{get width(){return n.roundedWidth+e.characterHorizontalPadding*2},get height(){return e.stationHeight},get connectors(){return[{x:0,y:this.height/2},{x:this.width,y:this.height/2}]},render(i=0,s=0){const c=g("g",{class:"regexp-diagram-characterstation",transform:`translate(${i}, ${s})`});c.appendChild("rect",{class:"station",x:0,y:0,width:n.roundedWidth+e.characterHorizontalPadding*2,height:e.stationHeight,rx:r?0:e.stationHeight/2});const d=c.appendChild("text",{x:e.characterHorizontalPadding+(n.roundedWidth-n.width)/2,y:n.fontBoundingBoxAscent+(e.stationHeight-n.height)/2});if(r?(d.value.setAttribute("class","classified"),d.value.textContent=t):(d.appendChild("tspan",{class:"quotation"}).value.textContent="“",d.appendChild("tspan").value.textContent=t,d.appendChild("tspan",{class:"quotation"}).value.textContent="”"),this.attributes)for(let u in this.attributes)c.value.setAttribute(u,this.attributes[u]);return c}}},TerminalStation(){return{get width(){return e.railroadWidth*2},get height(){return e.stationHeight},get connectors(){return[{x:0,y:this.height/2},{x:this.width,y:this.height/2}]},render(t=0,r=0){const n=g("g",{class:"regexp-diagram-terminalstation",transform:`translate(${t}, ${r})`});return n.appendChild("path",{class:"railroad",d:p(`
            M0 0
            V${this.height}
            M${this.width} 0
            V${this.height}
          `)}),n}}},Bounds(t){return{get width(){return t.width},get height(){return t.height},get connectors(){return[{x:t.connectors[0].x,y:t.connectors[0].y},{x:t.connectors[1].x,y:t.connectors[1].y}]},render(r=0,n=0){const i=g("g",{class:"regexp-diagram-bounds",transform:`translate(${r}, ${n})`});return i.value.appendChild(t.render().value),i.appendChild("rect",{class:"bounds",width:this.width,height:this.height}),i}}},Loop(t,r="",n=!0){const i=o(r);return{get isLoop(){return!0},get width(){return Math.max(t.width+e.railroadUnit*2,e.railroadUnit+i.roundedWidth)},get height(){return t.height+e.railroadUnit*2+e.arrowSize/2+(r.length?e.annotationHeight:0)},get connectors(){return[{x:e.railroadUnit,y:t.connectors[0].y},{x:this.width-e.railroadUnit,y:t.connectors[1].y}]},render(s=0,c=0){const d=g("g",{class:"regexp-diagram-loop"+(n?"":" non-greedy"),transform:`translate(${s}, ${c})`});return d.value.appendChild(t.render(e.railroadUnit,0).value),d.appendChild("path",{class:"railroad",d:p(`
            M ${t.connectors[1].x+e.railroadUnit} ${t.connectors[1].y}
            H ${this.width-e.railroadUnit}
          `)}),d.appendChild("path",{class:"loop",d:p(`
            M ${this.width-e.railroadUnit} ${t.connectors[1].y}
            q ${e.railroadUnit} 0,${e.railroadUnit} ${e.railroadUnit}
            V ${t.height+e.railroadUnit}
            q 0 ${e.railroadUnit},${-e.railroadUnit} ${e.railroadUnit}
            H ${e.railroadUnit}
            q ${-e.railroadUnit} 0,${-e.railroadUnit} ${-e.railroadUnit}
            V ${t.connectors[0].y+e.railroadUnit}
            q 0 ${-e.railroadUnit},${e.railroadUnit} ${-e.railroadUnit}
            H ${t.connectors[0].x+e.railroadUnit}
          `)}),d.appendChild("path",{class:"arrow",d:p(`
            M ${e.railroadUnit+e.arrowSize} ${t.height+e.railroadUnit*2-e.arrowSize/2}
            l ${-e.arrowSize} ${e.arrowSize/2}
            l ${e.arrowSize} ${e.arrowSize/2}
          `)}),r.length&&(d.appendChild("text",{class:"annotation",x:e.railroadUnit,y:t.height+e.railroadUnit*2+e.arrowSize/2+i.fontBoundingBoxAscent+(e.annotationHeight-i.height)/2}).value.textContent=r),d}}},Shortcut(t){return{get width(){const[r,n]=t.isLoop?[t.connectors[0].x,t.width-t.connectors[1].x]:[0,0];return t.width+e.railroadUnit*4-r-n},get height(){return t.height+e.arrowSize/2+e.railroadUnit*2},get connectors(){return[{x:0,y:e.arrowSize/2},{x:this.width,y:e.arrowSize/2}]},get hasHorizontalPadding(){return!0},render(r=0,n=0){const i=g("g",{class:"regexp-diagram-shortcut",transform:`translate(${r}, ${n})`}),s=t.isLoop?t.connectors[0].x:0;return i.value.appendChild(t.render(e.railroadUnit*2-s,e.arrowSize/2+e.railroadUnit*2).value),i.appendChild("path",{class:"railroad",d:p(`
            M 0 ${this.connectors[0].y}
            H ${this.width}
          `)}),i.appendChild("path",{class:"arrow",d:p(`
            M ${this.width-e.railroadUnit*2-e.arrowSize} ${this.connectors[0].y-e.arrowSize/2}
            l ${e.arrowSize} ${e.arrowSize/2}
            l ${-e.arrowSize} ${e.arrowSize/2}
          `)}),i.appendChild("path",{class:"railroad",d:p(`
            M 0 ${this.connectors[0].y}
            q ${e.railroadUnit} 0,${e.railroadUnit} ${e.railroadUnit}
            V ${t.connectors[0].y+e.arrowSize/2+e.railroadUnit*2-e.railroadUnit}
            q 0 ${e.railroadUnit},${e.railroadUnit} ${e.railroadUnit}
            H ${t.connectors[0].x+e.railroadUnit*2-s}
            M ${t.connectors[1].x+e.railroadUnit*2-s} ${t.connectors[1].y+e.arrowSize/2+e.railroadUnit*2}
            H ${this.width-e.railroadUnit*2}
            q ${e.railroadUnit} 0,${e.railroadUnit} ${-e.railroadUnit}
            V ${this.connectors[1].y+e.railroadUnit}
            q 0 ${-e.railroadUnit},${e.railroadUnit} ${-e.railroadUnit}
          `)}),i}}},Border(t,r="",n=!0,i=""){const s=o(r);return{get width(){return t.hasHorizontalPadding?Math.max(t.width,s.roundedWidth):Math.max(t.width+e.railroadUnit*2,s.roundedWidth)},get height(){return t.height+e.railroadUnit*2+(r.length?e.annotationHeight:0)},get connectors(){return n?t.hasHorizontalPadding?[{x:t.connectors[0].x,y:t.connectors[0].y+e.railroadUnit+(r.length?e.annotationHeight:0)},{x:t.connectors[1].x,y:t.connectors[1].y+e.railroadUnit+(r.length?e.annotationHeight:0)}]:[{x:t.connectors[0].x+e.railroadUnit,y:t.connectors[0].y+e.railroadUnit+(r.length?e.annotationHeight:0)},{x:t.connectors[1].x+e.railroadUnit,y:t.connectors[1].y+e.railroadUnit+(r.length?e.annotationHeight:0)}]:[{x:0,y:t.connectors[0].y+e.railroadUnit+(r.length?e.annotationHeight:0)},{x:this.width,y:t.connectors[1].y+e.railroadUnit+(r.length?e.annotationHeight:0)}]},render(c=0,d=0){const u=g("g",{class:"regexp-diagram-border"+(i?` ${i}`:""),transform:`translate(${c}, ${d})`});if(r.length&&(u.appendChild("text",{class:"annotation",x:0,y:s.fontBoundingBoxAscent+(e.annotationHeight-s.height)/2}).value.textContent=r),u.appendChild("rect",{class:"border",x:0,y:r.length?e.annotationHeight:0,width:this.width,height:t.height+e.railroadUnit*2}),u.value.appendChild(t.render(t.hasHorizontalPadding?0:e.railroadUnit,e.railroadUnit+(r.length?e.annotationHeight:0)).value),this.attributes)for(let x in this.attributes)u.value.setAttribute(x,this.attributes[x]);return u}}},HStack(){return{stations:[],get width(){const t=this.stations.map(r=>r.width);return t.length?t.reduce((r,n)=>r+n+e.railroadUnit):0},get height(){const t=this.stations.map(r=>r.height);return t.length?t.reduce((r,n)=>Math.max(r,n)):0},get connectors(){return[{x:0,y:this.height/2},{x:this.width,y:this.height/2}]},render(t=0,r=0){const n=g("g",{class:"regexp-diagram-hstack",transform:`translate(${t}, ${r})`});let i=0;for(let s=0;s<this.stations.length;++s){const c=this.stations[s];n.value.appendChild(c.render(i,(this.height-c.height)/2).value),i+=c.width+e.railroadUnit}return n}}},VStack(){return{stations:[],get width(){const t=this.stations.map(r=>r.width);return t.length?t.reduce((r,n)=>Math.max(r,n)):0},get height(){const t=this.stations.map(r=>r.height);return t.length?t.reduce((r,n)=>r+n+e.railroadUnit):0},get connectors(){return[{x:0,y:this.stations.length?this.stations[0].connectors[0].y:this.height/2},{x:this.width,y:this.stations.length?this.stations[0].connectors[1].y:this.height/2}]},render(t=0,r=0){const n=g("g",{class:"regexp-diagram-vstack",transform:`translate(${t}, ${r})`});let i=0;for(let s=0;s<this.stations.length;++s){const c=this.stations[s];n.value.appendChild(c.render(0,i).value),i+=c.height+e.railroadUnit}return n}}},RangeStation(t,r,n=!0){const i=this.HStack();return i.stations.push(t),i.stations.push(this.Hyphen()),i.stations.push(r),n?this.Border(i,"one of:",!1):i},SelectionStation(t){const r=this.VStack();return r.stations=t,this.Border(r,"one of:",!1)},Switch(t){return{get width(){return t.map(r=>r.width).reduce((r,n)=>Math.max(r,n))+e.railroadUnit*4},get height(){return t.map(r=>r.height).reduce((r,n)=>r+n+e.railroadUnit)},get connectors(){return[{x:0,y:t[0].connectors[0].y},{x:this.width,y:t[0].connectors[1].y}]},get hasHorizontalPadding(){return!0},render(r=0,n=0){const i=g("g",{class:"regexp-diagram-switch",transform:`translate(${r}, ${n})`});let s=0,c=[];for(let d=0;d<t.length;++d){const u=t[d];i.value.appendChild(u.render(e.railroadUnit*2,s).value),c.push(s),s+=u.height+e.railroadUnit}for(let d=0;d<t.length;++d){const u=t[d];d==0?i.appendChild("path",{class:"railroad",d:p(`
                M 0 ${this.connectors[0].y}
                H ${u.connectors[0].x+e.railroadUnit*2}
                M ${u.connectors[1].x+e.railroadUnit*2} ${u.connectors[1].y}
                H ${this.width}
              `)}):d==1?i.appendChild("path",{class:"railroad",d:p(`
                M 0 ${this.connectors[0].y}
                q ${e.railroadUnit} 0,${e.railroadUnit} ${e.railroadUnit}
                V ${u.connectors[0].y+c[d]-e.railroadUnit}
                q 0 ${e.railroadUnit},${e.railroadUnit} ${e.railroadUnit}
                H ${u.connectors[0].x+e.railroadUnit*2}
                M ${u.connectors[1].x+e.railroadUnit*2} ${u.connectors[1].y+c[d]}
                H ${this.width-e.railroadUnit*2}
                q ${e.railroadUnit} 0,${e.railroadUnit} ${-e.railroadUnit}
                V ${this.connectors[1].y+e.railroadUnit}
                q 0 ${-e.railroadUnit},${e.railroadUnit} ${-e.railroadUnit}
              `)}):i.appendChild("path",{class:"railroad",d:p(`
                M ${e.railroadUnit} ${c[d-1]+t[d-1].connectors[0].y-e.railroadUnit}
                V ${u.connectors[0].y+c[d]-e.railroadUnit}
                q 0 ${e.railroadUnit},${e.railroadUnit} ${e.railroadUnit}
                H ${u.connectors[0].x+e.railroadUnit*2}
                M ${u.connectors[1].x+e.railroadUnit*2} ${u.connectors[1].y+c[d]}
                H ${this.width-e.railroadUnit*2}
                q ${e.railroadUnit} 0,${e.railroadUnit} ${-e.railroadUnit}
                V ${c[d-1]+t[d-1].connectors[1].y-e.railroadUnit}
              `)})}return i}}},StraightRoute(t){return{stations:t,get width(){const r=this.stations.map(n=>n.width);return r.length?r.reduce((n,i)=>n+i+e.railroadUnit):0},get height(){const r=this.stations.map(i=>i.connectors[0].y).reduce((i,s)=>Math.max(i,s));return this.stations.map(i=>r-i.connectors[0].y+i.height).reduce((i,s)=>Math.max(i,s))},get connectors(){const r=this.stations.map(i=>i.connectors[0].y).reduce((i,s)=>Math.max(i,s)),n=this.stations.slice(0,-1).map(i=>i.width).reduce((i,s)=>i+s+e.railroadUnit,0);return[{x:this.stations[0].connectors[0].x,y:r},{x:n+this.stations.slice(-1)[0].connectors[1].x,y:r}]},render(r=0,n=0){const i=this.stations.map(d=>d.connectors[0].y).reduce((d,u)=>Math.max(d,u)),s=g("g",{class:"regexp-diagram-straightroute",transform:`translate(${r}, ${n})`});let c=0;for(let d=0;d<this.stations.length;++d){const u=this.stations[d];s.value.appendChild(u.render(c,i-u.connectors[0].y).value),d>0&&s.appendChild("path",{class:"railroad",d:p(`
                M ${c-t[d-1].width-e.railroadUnit+t[d-1].connectors[1].x} ${this.connectors[0].y}
                H ${c+u.connectors[0].x}
              `)}),c+=u.width+e.railroadUnit}return s}}},Wrapping(t){return{stations:t,get width(){const r=this.stations.map(n=>n.width);if(this.stations.length>=2)for(let n=0;n<this.stations.length;++n)n==0||n==this.stations.length-1?r[n]+=e.railroadUnit*2:r[n]+=e.railroadUnit*4;return r.reduce((n,i)=>Math.max(n,i))},get height(){return this.stations.map(r=>r.height).reduce((r,n)=>r+n+e.railroadUnit*4)},get connectors(){return[]},render(r=0,n=0){const i=g("g",{class:"regexp-diagram-wrapping",transform:`translate(${r}, ${n})`});let s=0,c=0;for(let d=0;d<this.stations.length;++d){const u=this.stations[d];i.value.appendChild(u.render(s,c).value),d<this.stations.length-1&&i.appendChild("path",{class:"railroad",d:p(`
                M ${s+u.connectors[1].x} ${c+u.connectors[1].y}
                H ${s+u.width+e.railroadUnit}
                q ${e.railroadUnit} 0, ${e.railroadUnit} ${e.railroadUnit}
                V ${c+u.height+e.railroadUnit}
                q 0 ${e.railroadUnit}, ${-e.railroadUnit} ${e.railroadUnit}
                H ${e.railroadUnit}
                q ${-e.railroadUnit} 0, ${-e.railroadUnit} ${e.railroadUnit}
                V ${c+u.height+e.railroadUnit*3+this.stations[d+1].connectors[0].y}
                q 0 ${e.railroadUnit}, ${e.railroadUnit} ${e.railroadUnit}
                H ${e.railroadUnit*2+this.stations[d+1].connectors[0].x}
              `)}),s=e.railroadUnit*2,c+=u.height+e.railroadUnit*4}return i}}}}}function g(e,a={}){const o=document.createElementNS("http://www.w3.org/2000/svg",e);for(let t in a)o.setAttribute(t,a[t]);return{get value(){return o},appendChild(t,r={}){const n=g(t,r);return this.value.appendChild(n.value),n}}}function U(e,a){const t=document.createElement("canvas").getContext("2d");t.font=a;const r=t.measureText(e);return Object.defineProperties(r,{roundedWidth:{get:function(){return Math.ceil(this.width)}},height:{get:function(){return r.fontBoundingBoxAscent+r.fontBoundingBoxDescent}}}),r}function H(e){return e.trim()}function p(e){return e.replace(/\s/g," ").replace(/\s{2,}/g,"")}function B(e,a=v){const o=y(e),t={...v,wrap:640,padding:12,showBounds:!1,...a},r=T(t);let n=w(r,o);n=[r.TerminalStation(),...n,r.TerminalStation()];const i=[];let s=r.StraightRoute([]);for(let x=0;x<n.length;++x)s.stations.length>0&&s.width+n[x].width>t.wrap&&(i.push(s),s=r.StraightRoute([])),s.stations.push(n[x]);i.push(s);let c=r.Wrapping(i);t.showBounds&&(c=r.Bounds(c));const d=r.StyledSvgTag(`
.group > rect.border {
  fill: #F0FFF0;
  stroke: green;
}
rect.bounds {
  stroke: magenta;
}
  `);return d.value.setAttribute("width",c.width+t.padding*2),d.value.setAttribute("height",c.height+t.padding*2),d.appendChild("rect",{width:d.value.getAttribute("width"),height:d.value.getAttribute("height"),fill:"#fff"}),d.appendChild("g",{transform:`translate(${t.padding}, ${t.padding})`}).value.appendChild(c.render().value),d.value}function w(e,a){const o=[];for(let t of a){let r;switch(t.type){case l.Branch:r=e.Switch(t.value.map(n=>e.StraightRoute(w(e,n))));break;case l.Character:r=e.CharacterStation(t.value);break;case l.CharacterRange:r=e.RangeStation(e.CharacterStation(t.value[0].value),e.CharacterStation(t.value[1].value),!1);break;case l.Classified:r=e.CharacterStation(t.value,!0);break;case l.Selection:r=e.SelectionStation(w(e,t.value));break;case l.Group:r=e.Border(e.StraightRoute(w(e,t.value)),t.lookahead?`${t.lookahead} lookahead`:t.lookbehind?`${t.lookbehind} lookbehind`:t.groupName?`group <${t.groupName}>`:t.groupNumber!=null?`group #${t.groupNumber}`:"group",!0,"group");break;default:throw""}if(t._textRange&&(r.attributes={"data-text-range":`${t._textRange.firstIndex},${t._textRange.lastIndex}`}),t.repeat){const n=t.repeat;if(n.max!=1){let i="";(n.min>=2||n.max>=2)&&(isFinite(n.max)?n.min==n.max?n.min==2?i="once":i=`${n.min-1} times`:n.min<=1?n.max==2?i="at most once":i=`at most ${n.max-1} times`:i=`${n.min-1}..${n.max-1} times`:n.min>=2?i=`${n.min-1}+ times`:i=""),r=e.Loop(r,i,!n.nonGreedy)}n.min==0&&(r=e.Shortcut(r)),o.push(r)}else o.push(r)}if(e.style.showBounds)for(let t=0;t<o.length;++t)o[t]=e.Bounds(o[t]);return o}function y(e){const a={groupNumber:0,groupNames:[]};let o;if(typeof e=="string")o=e;else if(e instanceof RegExp)e.flags.indexOf("u")!=-1&&console.warn("Regular expression flag 'u' is not supported."),o=e.source;else throw`Error: not supported parameter type for regexp: type=${typeof e}`;return f(a,o)}function f(e,a,o=0){const t=[];for(;a.length>0;){const[i,s]=b(e,a,o);if(i._textRange={firstIndex:o,lastIndex:o+s},o+=s,i.type===l.Repeat){if(t.length===0)throw"Syntax error: nothing to repeat";const c=t.slice(-1)[0];if(!q(c))throw"Syntax error: nothing to repeat";if(i.value==="?")if(c.repeat){if(c.repeat.nonGreedy)throw"Syntax error: duplicated non-greedy";c.repeat.nonGreedy=!0}else{if(c.repeat)throw"Syntax error: duplicated repetitions";c.repeat={min:0,max:1}}else{if(c.repeat)throw"Syntax error: duplicated repetitions";c.repeat=i.value}}else t.push(i);a=a.slice(s)}const r=R(t);return z(r)}function b(e,a,o){if(a[0]==="|")return[{type:l.Operator,value:"|"},1];if(a[0]=="("){let t,r=1;for(t=1;t<a.length;++t){let n=a[t];if(n=="("?r+=1:n==")"?r-=1:n=="\\"&&(t+=1),r==0)break}if(r!=0)throw"Syntax error: missing ')'";{let n=a.slice(0,t+1),i=/^\(\?<([^>]+)>/g,s=i.exec(n);if(s){let c=s[1];if(e.groupNames.indexOf(c)!=-1)throw`Syntax error: duplicated group name '${c}'`;return e.groupNames.push(c),[{type:l.Group,value:f(e,a.slice(i.lastIndex,t),o+i.lastIndex),groupName:c},t+1]}}if(a.startsWith("(?:"))return[{type:l.Group,value:f(e,a.slice(3,t),o+3)},t+1];if(a.startsWith("(?="))return[{type:l.Group,value:f(e,a.slice(3,t),o+3),lookahead:"positive"},t+1];if(a.startsWith("(?!"))return[{type:l.Group,value:f(e,a.slice(3,t),o+3),lookahead:"negative"},t+1];if(a.startsWith("(?<="))return[{type:l.Group,value:f(e,a.slice(4,t),o+4),lookbehind:"positive"},t+1];if(a.startsWith("(?<!"))return[{type:l.Group,value:f(e,a.slice(4,t),o+4),lookbehind:"negative"},t+1];{e.groupNumber+=1;let n=e.groupNumber;return[{type:l.Group,value:f(e,a.slice(1,t),o+1),groupNumber:n},t+1]}}if(a[0]==="*")return[{type:l.Repeat,value:{min:0,max:1/0}},1];if(a[0]==="+")return[{type:l.Repeat,value:{min:1,max:1/0}},1];if(a[0]==="?")return[{type:l.Repeat,value:"?"},1];{let t=/^\{(\d+)(,(\d+)?)?\}/g,r=t.exec(a);if(r)return r[3]?[{type:l.Repeat,value:{min:r[1],max:r[3]}},t.lastIndex]:r[2]?[{type:l.Repeat,value:{min:r[1],max:1/0}},t.lastIndex]:[{type:l.Repeat,value:{min:r[1],max:r[1]}},t.lastIndex]}for(const t in C)if(a.startsWith(t))return[{type:l.Classified,value:C[t]},t.length];{{let t=/^\\c([A-Za-z])/g,r=t.exec(a);if(r){let n=r[1].toUpperCase(),i=(n.charCodeAt(0)-"A".charCodeAt(0)+1).toString(16).padStart(2,"0");return[{type:l.Classified,value:`ctrl-${n} (0x${i})`},t.lastIndex]}}{let t=/^\\x([0-9A-Za-z]{2})/g,r=t.exec(a);if(r){let n=r[1].toUpperCase();return[{type:l.Classified,value:`0x${n}`},t.lastIndex]}}{let t=/^\\u([0-9A-Za-z]{4})/g,r=t.exec(a);if(r){let n=r[1].toUpperCase();return[{type:l.Classified,value:`U+${n}`},t.lastIndex]}}}{let t=/^\[(.*?(?:[^\\](?=])|\\\\(?=])))\]/g,r=t.exec(a);if(r){let n=r[1];return n.length>0&&n[0]=="^"?(n=n.slice(1),[{type:l.Selection,value:S(e,n,o),isNegativeSelection:!0},t.lastIndex]):[{type:l.Selection,value:S(e,n,o)},t.lastIndex]}}if(a[0]==="\\")if(a.length>1){if("123456789".indexOf(a[1])!==-1)return[{type:l.Classified,value:`ref #${a[1]}`},2];{let t=/^\\k<([^>]+)>/g,r=t.exec(a);if(r)return[{type:l.Classified,value:`ref <${r[1]}>`},t.lastIndex]}return[{type:l.Character,value:a[1]},2]}else throw"Syntax error: invalid escape sequence";return[{type:l.Character,value:a[0]},1]}function S(e,a,o){const t=[];for(a[0]=="-"&&a.length>0&&(t.push({type:l.Character,value:"-"}),a=a.slice(1));a.length>0;)if("^$*+?.(|{[".indexOf(a[0])!=-1)t.push({type:l.Character,value:a[0]}),a=a.slice(1);else if(a.startsWith("\\b"))t.push({type:l.Classified,value:"backspace (0x08)"}),a=a.slice(2);else if(a.startsWith("\\B")||a.startsWith("\\-")||a.startsWith("\\\\"))t.push({type:l.Classified,value:a[1]}),a=a.slice(2);else if(a[0]=="-")t.push({type:l.Operator,value:a[0]}),a=a.slice(1);else{const[i,s]=b(e,a,o);t.push(i),a=a.slice(s)}let r=[],n=!1;for(let i of t){if(i.type===l.Operator&&i.value==="-"){n=!0;continue}if(n){let s=r.pop();r.push({type:l.CharacterRange,value:[s,i]}),n=!1}else r.push(i)}return n&&r.push({type:l.Character,value:"-"}),r}function R(e){const a=[];for(let o of e)if(a.length===0)a.push({...o});else{const t=a.slice(-1)[0];t.type===l.Character&&!t.repeat&&o.type===l.Character&&!o.repeat?(t.value+=o.value,t._textRange&&o._textRange&&(t._textRange.lastIndex=o._textRange.lastIndex)):a.push({...o})}return a}function z(e){if(!e.find(t=>t.type===l.Operator&&t.value==="|"))return e;let a=[];var o=[];for(let t of e)t.type===l.Operator&&t.value==="|"?(a.push(o),o=[]):o.push(t);return a.push(o),[{type:l.Branch,value:a}]}const l={Branch:"Branch",Character:"Character",CharacterRange:"CharacterRange",Classified:"Classified",Group:"Group",Repeat:"Repeat",Selection:"Selection",Operator:"Operator"},C={"^":"beginning of line",$:"end of line",".":"any character","[\\b]":"backspace (0x08)","\\b":"word boundary","\\B":"non-word boundary","\\d":"digit","\\D":"non-digit","\\f":"form feed (0x0C)","\\n":"line feed (0x0A)","\\r":"carriage return (0x0D)","\\s":"white space","\\S":"non-white space","\\t":"tab (0x09)","\\v":"vertical tab (0x0B)","\\w":"word","\\W":"non-word","\\0":"null (0x00)"};function q(e){return e.type===l.Character||e.type===l.Classified||e.type===l.Group||e.type===l.Selection}document.querySelector("#version").innerHTML="regexp-diagram 2.1.0";const h={regexpTxtTab:document.querySelector("#tab-regexp-txt"),styleJsonTab:document.querySelector("#tab-style-json"),regexpText:document.querySelector("#text-regexp"),styleText:document.querySelector("#text-style"),renderButton:document.querySelector("#button-render"),downloadSvgButton:document.querySelector("#button-download-svg"),downloadPngButton:document.querySelector("#button-download-png"),copyPngButton:document.querySelector("#button-copy-png"),nowrapOption:document.querySelector("#option-nowrap"),showBoundsOption:document.querySelector("#option-show-bounds"),diagram:document.querySelector("#diagram")},$={currentTab:h.regexpTxtTab,isAutoRendering:!1};function L(){h.renderButton.value+="  (Ctrl+Enter)",document.addEventListener("keydown",t=>{t.ctrlKey&&t.key==="Enter"&&m()}),h.regexpTxtTab.addEventListener("click",()=>{$.currentFile=h.regexpTxtTab,h.styleJsonTab.classList.remove("active"),h.regexpTxtTab.classList.add("active"),h.regexpText.style.display="block",h.styleText.style.display="none",h.regexpText.style.height=h.styleText.style.height}),h.styleJsonTab.addEventListener("click",()=>{$.currentFile=h.styleJsonTab,h.regexpTxtTab.classList.remove("active"),h.styleJsonTab.classList.add("active"),h.regexpText.style.display="none",h.styleText.style.display="block",h.styleText.style.height=h.regexpText.style.height}),h.regexpText.addEventListener("input",()=>{if($.isAutoRendering){console.log("Skipped auto-rendering");return}$.isAutoRendering=!0,setTimeout(()=>{m(),$.isAutoRendering=!1},300)}),h.renderButton.addEventListener("click",()=>{m()}),h.downloadSvgButton.addEventListener("click",()=>{A()}),h.downloadPngButton.addEventListener("click",()=>{F()}),h.copyPngButton.addEventListener("click",()=>{W()}),h.nowrapOption.addEventListener("change",()=>{localStorage.setItem("nowrap",h.nowrapOption.checked),m()}),h.showBoundsOption.addEventListener("change",()=>{localStorage.setItem("showBounds",h.showBoundsOption.checked),m()});const e=localStorage.getItem("nowrap");e!==null&&(h.nowrapOption.checked=e==="true");const a=localStorage.getItem("showBounds");a!==null&&(h.showBoundsOption.checked=a==="true");const o=localStorage.getItem("regexp");o!==null&&(h.regexpText.value=o),h.regexpText.value===""&&(h.regexpText.value=String.raw`-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?`),h.styleText.value=JSON.stringify({characterFontFamily:"Arial",annotationFontFamily:"Arial"},null,2),m()}function m(){const e=h.regexpText.value;localStorage.setItem("regexp",e);const a=h.nowrapOption.checked?1/0:640,o=h.showBoundsOption.checked;try{performance.clearMeasures("time"),performance.mark("start");const t=B(e,{wrap:a,showBounds:o,...JSON.parse(h.styleText.value)},!1);h.diagram.innerHTML="",h.diagram.appendChild(t);for(let r of t.querySelectorAll("*[data-text-range]"))r.addEventListener("click",n=>{const i=r.getAttribute("data-text-range").split(",");h.regexpText.focus(),h.regexpText.setSelectionRange(i[0],i[1]),n.stopPropagation()});h.diagram.style.height=t.getAttribute("height")+"px",performance.mark("end"),performance.measure("time","start","end"),console.log(performance.getEntriesByName("time")[0].duration)}catch(t){console.warn(t),h.diagram.innerHTML=`<p class="text-warning">${t}</p>`,h.diagram.style.height="auto"}}function A(){const e=h.diagram.querySelector("svg").outerHTML;if(!e)return;const a=document.createElement("a");a.download="regexp-diagram.svg",a.href=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`,a.click()}async function F(){const e=h.diagram.querySelector("svg").outerHTML;if(!e)return;const a=await k(e),o=document.createElement("a");o.download="regexp-diagram.png",o.href=a.toDataURL(),o.click()}async function W(){const e=h.diagram.querySelector("svg").outerHTML;if(!e)return;(await k(e)).toBlob(o=>{navigator.clipboard.write([new ClipboardItem({[o.type]:o})])})}async function k(e){const a=new Image,o=new Promise(t=>{a.onload=()=>{const r=document.createElement("canvas"),n=1;r.width=a.naturalWidth*n,r.height=a.naturalHeight*n;const i=r.getContext("2d");i.setTransform(n,0,0,n,0,0),i.drawImage(a,0,0),t(r)}});return a.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`,o}L();
