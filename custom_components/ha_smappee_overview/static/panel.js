/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ee=globalThis,_e=ee.ShadowRoot&&(ee.ShadyCSS===void 0||ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,xe=Symbol(),Ae=new WeakMap;let Je=class{constructor(e,s,o){if(this._$cssResult$=!0,o!==xe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(_e&&e===void 0){const o=s!==void 0&&s.length===1;o&&(e=Ae.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),o&&Ae.set(s,e))}return e}toString(){return this.cssText}};const rt=t=>new Je(typeof t=="string"?t:t+"",void 0,xe),Ge=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((o,r,a)=>o+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[a+1],t[0]);return new Je(s,t,xe)},at=(t,e)=>{if(_e)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const o=document.createElement("style"),r=ee.litNonce;r!==void 0&&o.setAttribute("nonce",r),o.textContent=s.cssText,t.appendChild(o)}},Ee=_e?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const o of e.cssRules)s+=o.cssText;return rt(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:it,defineProperty:nt,getOwnPropertyDescriptor:lt,getOwnPropertyNames:ct,getOwnPropertySymbols:dt,getPrototypeOf:pt}=Object,I=globalThis,Ce=I.trustedTypes,ut=Ce?Ce.emptyScript:"",le=I.reactiveElementPolyfillSupport,V=(t,e)=>t,se={toAttribute(t,e){switch(e){case Boolean:t=t?ut:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},$e=(t,e)=>!it(t,e),Te={attribute:!0,type:String,converter:se,reflect:!1,useDefault:!1,hasChanged:$e};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),I.litPropertyMetadata??(I.litPropertyMetadata=new WeakMap);let j=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=Te){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(e,s),!s.noAccessor){const o=Symbol(),r=this.getPropertyDescriptor(e,o,s);r!==void 0&&nt(this.prototype,e,r)}}static getPropertyDescriptor(e,s,o){const{get:r,set:a}=lt(this.prototype,e)??{get(){return this[s]},set(i){this[s]=i}};return{get:r,set(i){const l=r==null?void 0:r.call(this);a==null||a.call(this,i),this.requestUpdate(e,l,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Te}static _$Ei(){if(this.hasOwnProperty(V("elementProperties")))return;const e=pt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(V("properties"))){const s=this.properties,o=[...ct(s),...dt(s)];for(const r of o)this.createProperty(r,s[r])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[o,r]of s)this.elementProperties.set(o,r)}this._$Eh=new Map;for(const[s,o]of this.elementProperties){const r=this._$Eu(s,o);r!==void 0&&this._$Eh.set(r,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const r of o)s.unshift(Ee(r))}else e!==void 0&&s.push(Ee(e));return s}static _$Eu(e,s){const o=s.attribute;return o===!1?void 0:typeof o=="string"?o:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(s=>s(this))}addController(e){var s;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((s=e.hostConnected)==null||s.call(e))}removeController(e){var s;(s=this._$EO)==null||s.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const o of s.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return at(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(s=>{var o;return(o=s.hostConnected)==null?void 0:o.call(s)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(s=>{var o;return(o=s.hostDisconnected)==null?void 0:o.call(s)})}attributeChangedCallback(e,s,o){this._$AK(e,o)}_$ET(e,s){var a;const o=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,o);if(r!==void 0&&o.reflect===!0){const i=(((a=o.converter)==null?void 0:a.toAttribute)!==void 0?o.converter:se).toAttribute(s,o.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,s){var a,i;const o=this.constructor,r=o._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const l=o.getPropertyOptions(r),c=typeof l.converter=="function"?{fromAttribute:l.converter}:((a=l.converter)==null?void 0:a.fromAttribute)!==void 0?l.converter:se;this._$Em=r;const d=c.fromAttribute(s,l.type);this[r]=d??((i=this._$Ej)==null?void 0:i.get(r))??d,this._$Em=null}}requestUpdate(e,s,o,r=!1,a){var i;if(e!==void 0){const l=this.constructor;if(r===!1&&(a=this[e]),o??(o=l.getPropertyOptions(e)),!((o.hasChanged??$e)(a,s)||o.useDefault&&o.reflect&&a===((i=this._$Ej)==null?void 0:i.get(e))&&!this.hasAttribute(l._$Eu(e,o))))return;this.C(e,s,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,s,{useDefault:o,reflect:r,wrapped:a},i){o&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,i??s??this[e]),a!==!0||i!==void 0)||(this._$AL.has(e)||(this.hasUpdated||o||(s=void 0),this._$AL.set(e,s)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var o;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[a,i]of this._$Ep)this[a]=i;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[a,i]of r){const{wrapped:l}=i,c=this[a];l!==!0||this._$AL.has(a)||c===void 0||this.C(a,void 0,i,c)}}let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(o=this._$EO)==null||o.forEach(r=>{var a;return(a=r.hostUpdate)==null?void 0:a.call(r)}),this.update(s)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(s)}willUpdate(e){}_$AE(e){var s;(s=this._$EO)==null||s.forEach(o=>{var r;return(r=o.hostUpdated)==null?void 0:r.call(o)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(s=>this._$ET(s,this[s]))),this._$EM()}updated(e){}firstUpdated(e){}};j.elementStyles=[],j.shadowRootOptions={mode:"open"},j[V("elementProperties")]=new Map,j[V("finalized")]=new Map,le==null||le({ReactiveElement:j}),(I.reactiveElementVersions??(I.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J=globalThis,Pe=t=>t,oe=J.trustedTypes,Oe=oe?oe.createPolicy("lit-html",{createHTML:t=>t}):void 0,qe="$lit$",O=`lit$${Math.random().toFixed(9).slice(2)}$`,Ke="?"+O,gt=`<${Ke}>`,L=document,q=()=>L.createComment(""),K=t=>t===null||typeof t!="object"&&typeof t!="function",we=Array.isArray,ht=t=>we(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ce=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ie=/-->/g,Ne=/>/g,M=RegExp(`>|${ce}(?:([^\\s"'>=/]+)(${ce}*=${ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Me=/'/g,Re=/"/g,Ye=/^(?:script|style|textarea|title)$/i,mt=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),n=mt(1),W=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),ze=new WeakMap,R=L.createTreeWalker(L,129);function Qe(t,e){if(!we(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Oe!==void 0?Oe.createHTML(e):e}const vt=(t,e)=>{const s=t.length-1,o=[];let r,a=e===2?"<svg>":e===3?"<math>":"",i=F;for(let l=0;l<s;l++){const c=t[l];let d,g,u=-1,f=0;for(;f<c.length&&(i.lastIndex=f,g=i.exec(c),g!==null);)f=i.lastIndex,i===F?g[1]==="!--"?i=Ie:g[1]!==void 0?i=Ne:g[2]!==void 0?(Ye.test(g[2])&&(r=RegExp("</"+g[2],"g")),i=M):g[3]!==void 0&&(i=M):i===M?g[0]===">"?(i=r??F,u=-1):g[1]===void 0?u=-2:(u=i.lastIndex-g[2].length,d=g[1],i=g[3]===void 0?M:g[3]==='"'?Re:Me):i===Re||i===Me?i=M:i===Ie||i===Ne?i=F:(i=M,r=void 0);const v=i===M&&t[l+1].startsWith("/>")?" ":"";a+=i===F?c+gt:u>=0?(o.push(d),c.slice(0,u)+qe+c.slice(u)+O+v):c+O+(u===-2?l:v)}return[Qe(t,a+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),o]};class Y{constructor({strings:e,_$litType$:s},o){let r;this.parts=[];let a=0,i=0;const l=e.length-1,c=this.parts,[d,g]=vt(e,s);if(this.el=Y.createElement(d,o),R.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=R.nextNode())!==null&&c.length<l;){if(r.nodeType===1){if(r.hasAttributes())for(const u of r.getAttributeNames())if(u.endsWith(qe)){const f=g[i++],v=r.getAttribute(u).split(O),h=/([.?@])?(.*)/.exec(f);c.push({type:1,index:a,name:h[2],strings:v,ctor:h[1]==="."?bt:h[1]==="?"?yt:h[1]==="@"?_t:ae}),r.removeAttribute(u)}else u.startsWith(O)&&(c.push({type:6,index:a}),r.removeAttribute(u));if(Ye.test(r.tagName)){const u=r.textContent.split(O),f=u.length-1;if(f>0){r.textContent=oe?oe.emptyScript:"";for(let v=0;v<f;v++)r.append(u[v],q()),R.nextNode(),c.push({type:2,index:++a});r.append(u[f],q())}}}else if(r.nodeType===8)if(r.data===Ke)c.push({type:2,index:a});else{let u=-1;for(;(u=r.data.indexOf(O,u+1))!==-1;)c.push({type:7,index:a}),u+=O.length-1}a++}}static createElement(e,s){const o=L.createElement("template");return o.innerHTML=e,o}}function H(t,e,s=t,o){var i,l;if(e===W)return e;let r=o!==void 0?(i=s._$Co)==null?void 0:i[o]:s._$Cl;const a=K(e)?void 0:e._$litDirective$;return(r==null?void 0:r.constructor)!==a&&((l=r==null?void 0:r._$AO)==null||l.call(r,!1),a===void 0?r=void 0:(r=new a(t),r._$AT(t,s,o)),o!==void 0?(s._$Co??(s._$Co=[]))[o]=r:s._$Cl=r),r!==void 0&&(e=H(t,r._$AS(t,e.values),r,o)),e}class ft{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:o}=this._$AD,r=((e==null?void 0:e.creationScope)??L).importNode(s,!0);R.currentNode=r;let a=R.nextNode(),i=0,l=0,c=o[0];for(;c!==void 0;){if(i===c.index){let d;c.type===2?d=new Q(a,a.nextSibling,this,e):c.type===1?d=new c.ctor(a,c.name,c.strings,this,e):c.type===6&&(d=new xt(a,this,e)),this._$AV.push(d),c=o[++l]}i!==(c==null?void 0:c.index)&&(a=R.nextNode(),i++)}return R.currentNode=L,r}p(e){let s=0;for(const o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(e,o,s),s+=o.strings.length-2):o._$AI(e[s])),s++}}class Q{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,o,r){this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=o,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=H(this,e,s),K(e)?e===x||e==null||e===""?(this._$AH!==x&&this._$AR(),this._$AH=x):e!==this._$AH&&e!==W&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ht(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==x&&K(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){var a;const{values:s,_$litType$:o}=e,r=typeof o=="number"?this._$AC(e):(o.el===void 0&&(o.el=Y.createElement(Qe(o.h,o.h[0]),this.options)),o);if(((a=this._$AH)==null?void 0:a._$AD)===r)this._$AH.p(s);else{const i=new ft(r,this),l=i.u(this.options);i.p(s),this.T(l),this._$AH=i}}_$AC(e){let s=ze.get(e.strings);return s===void 0&&ze.set(e.strings,s=new Y(e)),s}k(e){we(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let o,r=0;for(const a of e)r===s.length?s.push(o=new Q(this.O(q()),this.O(q()),this,this.options)):o=s[r],o._$AI(a),r++;r<s.length&&(this._$AR(o&&o._$AB.nextSibling,r),s.length=r)}_$AR(e=this._$AA.nextSibling,s){var o;for((o=this._$AP)==null?void 0:o.call(this,!1,!0,s);e!==this._$AB;){const r=Pe(e).nextSibling;Pe(e).remove(),e=r}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class ae{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,o,r,a){this.type=1,this._$AH=x,this._$AN=void 0,this.element=e,this.name=s,this._$AM=r,this.options=a,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=x}_$AI(e,s=this,o,r){const a=this.strings;let i=!1;if(a===void 0)e=H(this,e,s,0),i=!K(e)||e!==this._$AH&&e!==W,i&&(this._$AH=e);else{const l=e;let c,d;for(e=a[0],c=0;c<a.length-1;c++)d=H(this,l[o+c],s,c),d===W&&(d=this._$AH[c]),i||(i=!K(d)||d!==this._$AH[c]),d===x?e=x:e!==x&&(e+=(d??"")+a[c+1]),this._$AH[c]=d}i&&!r&&this.j(e)}j(e){e===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class bt extends ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===x?void 0:e}}class yt extends ae{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==x)}}class _t extends ae{constructor(e,s,o,r,a){super(e,s,o,r,a),this.type=5}_$AI(e,s=this){if((e=H(this,e,s,0)??x)===W)return;const o=this._$AH,r=e===x&&o!==x||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,a=e!==x&&(o===x||r);r&&this.element.removeEventListener(this.name,this,o),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class xt{constructor(e,s,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){H(this,e)}}const de=J.litHtmlPolyfillSupport;de==null||de(Y,Q),(J.litHtmlVersions??(J.litHtmlVersions=[])).push("3.3.2");const $t=(t,e,s)=>{const o=(s==null?void 0:s.renderBefore)??e;let r=o._$litPart$;if(r===void 0){const a=(s==null?void 0:s.renderBefore)??null;o._$litPart$=r=new Q(e.insertBefore(q(),a),a,void 0,s??{})}return r._$AI(t),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const z=globalThis;class G extends j{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var s;const e=super.createRenderRoot();return(s=this.renderOptions).renderBefore??(s.renderBefore=e.firstChild),e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$t(s,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return W}}var Ve;G._$litElement$=!0,G.finalized=!0,(Ve=z.litElementHydrateSupport)==null||Ve.call(z,{LitElement:G});const pe=z.litElementPolyfillSupport;pe==null||pe({LitElement:G});(z.litElementVersions??(z.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const wt=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const kt={attribute:!0,type:String,converter:se,reflect:!1,hasChanged:$e},St=(t=kt,e,s)=>{const{kind:o,metadata:r}=s;let a=globalThis.litPropertyMetadata.get(r);if(a===void 0&&globalThis.litPropertyMetadata.set(r,a=new Map),o==="setter"&&((t=Object.create(t)).wrapped=!0),a.set(s.name,t),o==="accessor"){const{name:i}=s;return{set(l){const c=e.get.call(this);e.set.call(this,l),this.requestUpdate(i,c,t,!0,l)},init(l){return l!==void 0&&this.C(i,void 0,t,l),l}}}if(o==="setter"){const{name:i}=s;return function(l){const c=this[i];e.call(this,l),this.requestUpdate(i,c,t,!0,l)}}throw Error("Unsupported decorator location: "+o)};function ie(t){return(e,s)=>typeof s=="object"?St(t,e,s):((o,r,a)=>{const i=r.hasOwnProperty(a);return r.constructor.createProperty(a,o),i?Object.getOwnPropertyDescriptor(r,a):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function At(t){return ie({...t,state:!0,attribute:!1})}const Et="ha_smappee_overview/get_panel_data",Ct="ha_smappee_overview/list_entries";function Ze(t,e){return typeof t.callWS=="function"?t.callWS(e):t.connection.sendMessagePromise(e)}async function Tt(t){return(await Ze(t,{type:Ct})).entries??[]}function Pt(t){if(!t||typeof t!="object")throw new Error("Panel payload is not an object");const e=t,s=[];Array.isArray(e.chargers)||(s.push("missing_chargers_array_defaulted"),e.chargers=[]),Array.isArray(e.sessions_active)||(s.push("missing_sessions_active_defaulted"),e.sessions_active=[]),Array.isArray(e.sessions_recent)||(s.push("missing_sessions_recent_defaulted"),e.sessions_recent=[]),Array.isArray(e.tariffs)||(s.push("missing_tariffs_defaulted"),e.tariffs=[]),Array.isArray(e.alerts)||(s.push("missing_alerts_defaulted"),e.alerts=[]),(!e.discovery||typeof e.discovery!="object")&&(e.discovery={partial:!0,notes:[],sources:{},generated_at:null,edges:[],nodes:[],summary:{ok:0,offline:0,stale:0,unknown:0},consumption_stale_hint:!1});const o=e.discovery;return Array.isArray(o.nodes)||(o.nodes=[]),Array.isArray(o.edges)||(o.edges=[]),(!o.summary||typeof o.summary!="object")&&(o.summary={ok:0,offline:0,stale:0,unknown:0}),e.__normalize_warnings=s,e}async function Ot(t,e,s=!1,o=!1){const r={type:Et,config_entry_id:e};s&&(r.include_advanced=!0);const a=await Ze(t,r),i=Pt(a);if(o){const l=i;console.debug("smappee_panel_payload",{keys:Object.keys(l),chargers:(i.chargers||[]).length,sessions_active:(i.sessions_active||[]).length,sessions_recent:(i.sessions_recent||[]).length,normalize_warnings:l.__normalize_warnings||[]})}return i}async function It(t,e,s=48,o=24*60){const r=e.filter(Boolean);if(!r.length||typeof t.callWS!="function")return{};const a=new Date,i=new Date(a.getTime()-o*60*1e3);let l;try{l=await t.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:a.toISOString(),entity_ids:r,minimal_response:!0,no_attributes:!0,significant_changes_only:!0})}catch{return{}}const c={},d=l&&typeof l=="object"&&!Array.isArray(l)?l:{};for(const g of r){const u=d[g];if(!Array.isArray(u))continue;const f=[];for(const m of u){if(!m||typeof m!="object")continue;const p=m,b=p.lu??p.lc,_=(typeof b=="number"?b:0)*1e3,$=parseFloat(String(p.s??""));Number.isFinite($)&&f.push({t:_,v:$})}if(f.length<=s){c[g]=f;continue}const v=Math.ceil(f.length/s),h=[];for(let m=0;m<f.length;m+=v)h.push(f[m]);c[g]=h}return c}const Le="smappee_panel_entry",ue="smappee_panel_advanced",ge="smappee_panel_debug",De="smappee_panel_overview_layout";function Ue(t){let e=t;try{const c=sessionStorage.getItem(Le);c&&(e=c)}catch{}let s=!1;try{s=sessionStorage.getItem(ue)==="1"}catch{}let o=!1;try{o=sessionStorage.getItem(ge)==="1"}catch{}let r="default",a=["flow_kpi","insights","assistant","economics","chargers"];try{const c=sessionStorage.getItem(De);if(c){const d=JSON.parse(c);(d.template==="default"||d.template==="operations"||d.template==="compact")&&(r=d.template),Array.isArray(d.order)&&d.order.every(g=>typeof g=="string")&&(a=d.order)}}catch{}let i={entries:[],selectedEntryId:e||t,activeTab:"overview",panel:null,connection:"idle",panelError:null,tabError:null,historyByEntity:{},historyLoading:!1,lastFetchAt:null,sessionsSort:{column:"start",dir:"desc"},sessionsFilters:{},sessionsExpandedRowId:null,sessionsGroupByDay:!1,economicsPeriod:"today",timePreset:"live",advancedMode:s,debugMode:o,overviewTemplate:r,overviewOrder:a};const l=new Set;return{getState:()=>i,subscribe:c=>(l.add(c),()=>l.delete(c)),setState:c=>{const d={...i,...c};let g=!1;for(const u of Object.keys(c))if(i[u]!==d[u]){g=!0;break}g&&(i=d,l.forEach(u=>u()))},loadStoredEntry:()=>e||t,persistEntry:c=>{try{sessionStorage.setItem(Le,c)}catch{}e=c},persistAdvancedMode:c=>{try{c?sessionStorage.setItem(ue,"1"):sessionStorage.removeItem(ue)}catch{}i={...i,advancedMode:c},l.forEach(d=>d())},persistDebugMode:c=>{try{c?sessionStorage.setItem(ge,"1"):sessionStorage.removeItem(ge)}catch{}i={...i,debugMode:c},l.forEach(d=>d())},persistOverviewLayout:(c,d)=>{const g=[...d];try{sessionStorage.setItem(De,JSON.stringify({template:c,order:g}))}catch{}i={...i,overviewTemplate:c,overviewOrder:g},l.forEach(u=>u())}}}function Nt(t){if(!t)return null;const e=new Date(t).getTime();return Number.isFinite(e)?e:null}function P(t,e="device"){var i,l,c,d,g;const s=((i=t==null?void 0:t.consumption)==null?void 0:i.timestamp)??(t==null?void 0:t.last_successful_update)??((l=t==null?void 0:t.discovery)==null?void 0:l.generated_at)??null,o=Nt(s);if(!o)return{lastUpdate:null,freshness:"offline",source:e};const r=Date.now()-o;return((c=t==null?void 0:t.consumption)==null?void 0:c.stale)||((d=t==null?void 0:t.meta)==null?void 0:d.consumption_stale)||((g=t==null?void 0:t.meta)==null?void 0:g.coordinator_last_update_success)===!1||r>10*60*1e3?{lastUpdate:s,freshness:"stale",source:e}:{lastUpdate:s,freshness:"live",source:e}}function Mt(t,e,s,o){var a,i,l;return e==="loading"&&!t?"loading":e==="error"?"error_connection":s!=null&&s.toLowerCase().includes("parse")?"error_parsing":t?!!t.consumption||(((a=t.chargers)==null?void 0:a.length)??0)>0||(((i=t.sessions_active)==null?void 0:i.length)??0)>0||(((l=t.sessions_recent)==null?void 0:l.length)??0)>0?(o!=null&&o.periodStart||o!=null&&o.periodEnd)&&!et(t,o).length?"error_no_data_range":t.api_partial?"partial":"ready":"empty_no_devices":"error_connection"}function Rt(t){return t?t.replace("T"," ").slice(0,19):"—"}function Xe(t){const e=t==null?void 0:t.consumption;return{gridImport:(e==null?void 0:e.grid_import_w)??null,gridExport:(e==null?void 0:e.grid_export_w)??null,solar:(e==null?void 0:e.solar_w)??null,home:(e==null?void 0:e.consumption_w)??null,battery:(e==null?void 0:e.battery_flow_w)??null,batterySoc:(e==null?void 0:e.battery_soc_pct)??null}}function ke(t){var o;if(!t)return[];if((o=t.sessions_enriched)!=null&&o.length)return t.sessions_enriched;const e=new Set,s=[];for(const r of[...t.sessions_active,...t.sessions_recent])e.has(r.id)||(e.add(r.id),s.push(r));return s}function et(t,e){var o;let s=ke(t);if(e.chargerSerial&&(s=s.filter(r=>r.charger_serial===e.chargerSerial)),(o=e.userQuery)!=null&&o.trim()){const r=e.userQuery.trim().toLowerCase();s=s.filter(a=>{const i=(a.user_display||a.user_label||a.user_id||"").toLowerCase(),l=(a.card_label||"").toLowerCase();return i.includes(r)||l.includes(r)||a.user_id&&a.user_id.toLowerCase().includes(r)||a.id.toLowerCase().includes(r)})}if(e.mode&&(s=s.filter(r=>(r.effective_mode||r.status||"").toLowerCase()===e.mode.toLowerCase())),e.periodStart){const r=new Date(e.periodStart).getTime();s=s.filter(a=>a.start?new Date(a.start).getTime()>=r:!1)}if(e.periodEnd){const r=new Date(e.periodEnd);r.setHours(23,59,59,999);const a=r.getTime();s=s.filter(i=>i.start?new Date(i.start).getTime()<=a:!1)}return s}function zt(t,e){var o;const s=(o=t==null?void 0:t.chargers_extended)==null?void 0:o.find(r=>r.serial===e);return(s==null?void 0:s.load_balance)??{reported:!1,value:null}}function Lt(t){var e;return((e=t==null?void 0:t.economics)==null?void 0:e.belgium_cap_compliant)??null}function Dt(t){var e,s;return t?t.api_partial?"Some data from the Smappee API is partial or failed to load.":(e=t.consumption)!=null&&e.stale?"Live consumption data may be stale.":(s=t.meta)!=null&&s.consumption_stale?"Consumption marked stale by coordinator.":null:null}function Ut(t,e,s){var r,a;const o=(r=t.overview_context)==null?void 0:r.connector_explanations;return(a=o==null?void 0:o.find(i=>i.charger_serial===e&&i.connector===s))==null?void 0:a.explanation}function jt(t){return t==="live"?"Live":t==="config"?"Config":"Est."}function Wt(t){var r,a,i,l,c;if(!t)return n``;const e=t.badge.tone,s=((r=t.technical)==null?void 0:r.limit_chain)??[],o=s.length>0||t.details&&Object.keys(t.details).length>0||((a=t.technical)==null?void 0:a.signals)&&Object.keys(t.technical.signals).length>0;return n`
    <div class="exp-expl-wrap">
      <span
        class="chip exp-badge exp-badge--${e}"
        title=${t.message}
        >${t.badge.label}</span
      >
      <details class="exp-details">
        <summary>Technical details</summary>
        <p class="muted small exp-expl-msg">${t.message}</p>
        ${(i=t.suggestions)!=null&&i.length?n`
              <div class="exp-suggest-h">What you can try</div>
              <ul class="exp-suggest">
                ${t.suggestions.map(d=>n`<li>${d.label}</li>`)}
              </ul>
            `:""}
        ${s.length?n`
              <div class="exp-chain-h">Limit chain</div>
              <ol class="exp-chain-list">
                ${s.map(d=>n`
                    <li class="exp-chain-li">
                      <span class="exp-chain-label">${d.label}</span>
                      <span class="mono">${d.value}</span>
                      <span class="exp-chain-src exp-chain-src--${d.source}"
                        >${jt(d.source)}</span
                      >
                    </li>
                  `)}
              </ol>
            `:""}
        ${o?n`
              <div class="exp-chain-h">Raw signals</div>
              <pre class="json-pre exp-json">
${JSON.stringify({details:t.details,pause_code:(l=t.technical)==null?void 0:l.pause_code,signals:(c=t.technical)==null?void 0:c.signals},null,2)}</pre
              >
            `:""}
      </details>
    </div>
  `}function re(){return n`
    <div class="state-card state-card-empty">
      <h3>No data received yet</h3>
      <p class="muted">Possible causes:</p>
      <ul class="state-cause-list">
        <li>No devices connected</li>
        <li>Wrong time range</li>
        <li>Data pipeline issue</li>
      </ul>
    </div>
  `}function tt(t){let e="Connection failed";return t==="error_no_data_range"&&(e="No data in selected range"),t==="error_parsing"&&(e="Parsing error"),n`<div class="state-card state-card-error"><strong>${e}</strong></div>`}function Ht(t=3){return n`
    <div class="widget-skel">
      ${Array.from({length:t}).map(()=>n`<div class="skel skel-line"></div>`)}
    </div>
  `}function A(t){const e=t.freshness==="live"?"fresh-live":t.freshness==="stale"?"fresh-stale":"fresh-offline";return n`
    <div class="widget-status-line muted small">
      <span>Last update: ${Rt(t.lastUpdate)}</span>
      <span class="fresh-pill ${e}">${t.freshness}</span>
      <span>Source: ${t.source}</span>
    </div>
  `}const Bt="ha_smappee_overview";function Ft(t,e,s,o,r){var c;const i=[...t.sessions_active,...t.sessions_enriched??[]].filter((d,g,u)=>u.findIndex(f=>f.id===d.id)===g).filter(d=>/charging|started/i.test(d.status||"")),l=async(d,g)=>{try{await e.callService(Bt,d,{config_entry_id:s,...g}),o()}catch(u){console.error(u)}};return(c=t.chargers)!=null&&c.length?n`
    ${A(r)}
    <div class="charger-list">
      ${t.chargers.map(d=>{var f;const g=(f=t.charger_features)==null?void 0:f[d.serial],u=zt(t,d.serial);return n`
          <div class="card charger-card">
            ${A(r)}
            <div class="charger-head">
              <h3>${d.name}</h3>
              <span class="chip ${d.availability?"ok":"off"}"
                >${d.availability?"Available":"Unavailable"}</span
              >
            </div>
            <div class="muted mono">${d.serial}</div>
            <div class="lb-row">
              Load balancing:
              ${u.reported?n`<code>${JSON.stringify(u.value)}</code>`:n`<span class="muted">Not reported by API</span>`}
            </div>
            ${d.connectors.map(v=>{const h=i.find(p=>p.charger_serial===d.serial&&p.connector===v.position),m=Ut(t,d.serial,v.position);return n`
                <div class="connector-block">
                  <div class="conn-title conn-title-row">
                    <span>
                      Connector ${v.position} · mode
                      <strong>${v.mode}</strong>
                      · ${v.current_a??"—"} A
                      ${v.session_active?n`<span class="live">Live</span>`:""}
                    </span>
                  </div>
                  ${Wt(m)}
                  ${h?n`
                        <div class="session-mini card-inner">
                          Session ${h.id.slice(0,8)}… ·
                          ${h.energy_wh!=null?`${(h.energy_wh/1e3).toFixed(2)} kWh`:"—"}
                        </div>
                      `:""}
                  <div class="btn-row">
                    <button
                      type="button"
                      class="btn"
                      @click=${()=>l("start_charging",{charger_serial:d.serial,connector_position:v.position})}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>l("pause_charging",{charger_serial:d.serial,connector_position:v.position})}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>l("stop_charging",{charger_serial:d.serial,connector_position:v.position})}
                    >
                      Stop
                    </button>
                  </div>
                  ${g!=null&&g.supports_smart_mode?n`
                        <div class="mode-row">
                          <label>Mode</label>
                          <select
                            @change=${p=>{const b=p.target;l("set_charging_mode",{charger_serial:d.serial,connector_position:v.position,mode:b.value})}}
                          >
                            <option value="standard">Standard</option>
                            <option value="smart">Smart</option>
                            <option value="solar">Solar</option>
                          </select>
                        </div>
                      `:""}
                  ${g!=null&&g.supports_current_limit?(()=>{const p=Math.min(32,g.max_current_a??32),b=6,_=Math.round(Math.min(p,Math.max(b,v.current_a??16)));return n`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label">Current (A)</label>
                            <input
                              type="range"
                              min=${b}
                              max=${p}
                              .value=${String(_)}
                              @change=${$=>{const k=$.target,w=parseInt(k.value,10);w>=b&&l("set_charging_current",{charger_serial:d.serial,connector_position:v.position,current_a:w})}}
                            />
                            <span class="mono small">${_} A</span>
                          </div>
                        `})():""}
                </div>
              `})}
          </div>
        `})}
    </div>
  `:n`${A(r)} ${re()}`}const Vt=14,Jt=["installation","gateway","monitor","charger","unknown"];function Gt(t){var o,r;const e=(o=t.health)==null?void 0:o.api_last_seen_iso;if(e)return`Cloud: ${e.slice(0,19).replace("T"," ")}`;const s=(r=t.health)==null?void 0:r.last_seen_iso;return s?`Observed: ${s.slice(0,19).replace("T"," ")}`:""}function qt(t){const e=[];return t.source_sl_devices&&e.push("service location"),t.source_charging_api&&e.push("charging API"),e.length?e.join(" · "):"—"}function Kt(t){return t==="ok"?"ok":t==="offline"?"err":t==="stale"?"load":""}function be(t,e){var r;const s=((r=t.health)==null?void 0:r.connectivity)??"unknown",o=Math.min(e,10)*16;return n`
    <div
      class="dev-node-row"
      style=${`padding-left:${o}px;border-left:${e>0?"2px solid var(--divider-color)":"none"};margin-left:${e>0?"6px":"0"}`}
    >
      <div class="dev-node-main">
        <span class="dev-node-label">${t.label}</span>
        <span class="pill small ${Kt(s)}">${s}</span>
      </div>
      <div class="dev-node-detail muted small">
        <span>${t.kind}</span>
        ${t.serial?n`<code>${t.serial}</code>`:""}
        ${t.connector_count!=null&&t.connector_count>0?n`<span>${t.connector_count} connector(s)</span>`:""}
        ${t.availability!=null?n`<span>Public: ${t.availability?"yes":"no"}</span>`:""}
      </div>
      <div class="dev-node-meta muted small">
        <span>${Gt(t)}</span>
        <span>Sources: ${qt(t)}</span>
      </div>
    </div>
  `}function st(t,e,s,o,r){if(e>Vt)return[];const a=s.get(t);if(!a)return[];r.add(t);const i=[be(a,e)];for(const l of o.get(t)??[])i.push(...st(l,e+1,s,o,r));return i}function Yt(t,e){var _,$,k,w,E;const s=t.discovery,o=(s==null?void 0:s.nodes)??[];if(!s||!o.length)return n`
      ${A(e)}
      <div class="card">
        <h3 class="card-h">Devices</h3>
        ${re()}
      </div>
    `;const r=new Map(o.map(y=>[y.id,y])),a=s.edges??[],i=new Map;for(const y of a){const C=i.get(y.parent)??[];C.push(y.child),i.set(y.parent,C)}const l=new Set(a.map(y=>y.child)),d=[...new Set(a.map(y=>y.parent))].filter(y=>!l.has(y)),g=((_=o.find(y=>y.kind==="installation"))==null?void 0:_.id)??(($=o.find(y=>y.id.startsWith("installation:")))==null?void 0:$.id)??d[0]??null,u=new Set,f=g&&a.length?st(g,0,r,i,u):[],v=o.filter(y=>!u.has(y.id)),h=a.length===0?o:v,m=new Map;for(const y of h){const C=y.kind||"unknown",B=m.get(C)??[];B.push(y),m.set(C,B)}const p=s.summary??{},b=((k=t.meta)==null?void 0:k.coordinator_last_update_success)!==!1;return n`
    ${A(e)}
    <div class="devices-root">
      ${s.partial||(w=s.notes)!=null&&w.length?n`
            <div class="banner ${s.partial?"warn":""}">
              ${s.partial?n`<strong>Limited discovery.</strong> Topology may be incomplete when the API
                    does not expose hardware device lists.`:""}
              ${(E=s.notes)==null?void 0:E.map(y=>n`<div>${y}</div>`)}
              <div class="muted small">
                Contributors: capture redacted <code>GET …/servicelocation</code> JSON — see
                <code>docs/API_CAPTURE.md</code>.
              </div>
            </div>
          `:""}
      ${s.consumption_stale_hint?n`
            <div class="banner warn">
              Energy snapshot is stale; installation-level connectivity may be degraded.
            </div>
          `:""}
      <div class="sov-health-strip" style="margin-bottom:14px">
        <div class="sov-health-item">
          <span class="sov-health-label">Coordinator</span>
          <span class="${b?"sov-health-ok":"sov-health-warn"}"
            >${b?"OK":"Issues"}</span
          >
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">OK</span>
          <strong>${p.ok??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Offline</span>
          <strong>${p.offline??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Stale</span>
          <strong>${p.stale??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Unknown</span>
          <strong>${p.unknown??0}</strong>
        </div>
      </div>

      ${f.length?n`
            <div class="card">
              <h3 class="card-h">Topology</h3>
              <p class="muted small">
                Parent/child links come from the API when available; otherwise use the grouped list
                below.
              </p>
              <div class="dev-tree">${f}</div>
            </div>
          `:""}

      <div class="card">
        <h3 class="card-h">Network overview</h3>
        ${a.length?v.length?n`<p class="muted small">Nodes not reached from the installation root:</p>`:"":n`<p class="muted small">No edges in API data — grouped by device kind.</p>`}
        ${a.length?v.length?v.map(y=>be(y,0)):f.length?n`<p class="muted small">All nodes are in the tree above.</p>`:n`<p class="muted small">No nodes.</p>`:Jt.filter(y=>m.has(y)).map(y=>n`
                <h4 class="dev-kind-head">${y}</h4>
                ${(m.get(y)??[]).map(C=>be(C,0))}
              `)}
      </div>

      ${s.sources&&Object.keys(s.sources).length?n`
            <div class="card">
              <h3 class="card-h">Data sources</h3>
              <ul class="dev-sources">
                ${Object.entries(s.sources).map(([y,C])=>n`<li><code>${y}</code>: ${C?"yes":"no"}</li>`)}
              </ul>
            </div>
          `:""}
    </div>
    <style>
      .devices-root {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dev-node-row {
        padding: 10px 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      .dev-node-row:last-child {
        border-bottom: none;
      }
      .dev-node-main {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .dev-node-label {
        font-weight: 600;
      }
      .pill.small {
        font-size: 11px;
        padding: 2px 8px;
      }
      .dev-node-detail,
      .dev-node-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        margin-top: 4px;
      }
      .dev-kind-head {
        margin: 14px 0 6px;
        font-size: 0.95rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .dev-sources {
        margin: 0;
        padding-left: 1.2rem;
      }
      .banner.warn {
        background: color-mix(in srgb, var(--warning-color) 18%, transparent);
        border: 1px solid var(--warning-color);
        border-radius: 8px;
        padding: 10px 12px;
      }
      .sov-health-ok {
        color: var(--success-color, #2e7d32);
        font-weight: 600;
      }
    </style>
  `}function T(t){return t==null?"—":(typeof t=="number"&&Number.isFinite(t),String(t))}function Qt(t){var d,g,u,f,v;const e=t.meta,s=(e==null?void 0:e.advanced_panel_allowed)===!0,o=(e==null?void 0:e.advanced_data_included)===!0,r=t.advanced,a=(d=t.consumption)==null?void 0:d.phase_metrics,i=((g=t.consumption)==null?void 0:g.submeters)??[],l=((u=t.overview_context)==null?void 0:u.active_ev_hints)??[],c=t.chargers_extended??[];return n`
    <div class="card advanced-region">
      <h3 class="card-h">Advanced</h3>
      ${s?n`
            ${o?x:n`<p class="muted small">
                  Raw excerpts and coordinator debug load on the next fetch. Click
                  <strong>Refresh</strong> if needed.
                </p>`}
            <details class="adv-details" open>
              <summary>Phase &amp; submeters</summary>
              ${a?n`
                    <table class="adv-table mono small">
                      <tbody>
                        <tr>
                          <td>L1</td>
                          <td>${T(a.l1_v)} V</td>
                          <td>${T(a.l1_a)} A</td>
                          <td>${T(a.l1_w)} W</td>
                        </tr>
                        <tr>
                          <td>L2</td>
                          <td>${T(a.l2_v)} V</td>
                          <td>${T(a.l2_a)} A</td>
                          <td>${T(a.l2_w)} W</td>
                        </tr>
                        <tr>
                          <td>L3</td>
                          <td>${T(a.l3_v)} V</td>
                          <td>${T(a.l3_a)} A</td>
                          <td>${T(a.l3_w)} W</td>
                        </tr>
                      </tbody>
                    </table>
                  `:n`<p class="muted small">No phase metrics on consumption.</p>`}
              ${i.length?n`
                    <p class="small"><strong>Submeters</strong></p>
                    <ul class="small">
                      ${i.map(h=>n`<li>
                            ${h.name??h.id}: ${T(h.power_w)} W
                            ${h.energy_wh!=null?n` / ${T(h.energy_wh)} Wh`:x}
                          </li>`)}
                    </ul>
                  `:n`<p class="muted small">No submeters in payload.</p>`}
            </details>
            <details class="adv-details" open>
              <summary>Internal limits &amp; load balance</summary>
              ${l.length?l.map(h=>{var m;return n`
                      <div class="adv-hint small">
                        <strong>${h.charger_serial}</strong> #${h.connector} —
                        ${h.status} / ${h.connector_mode}
                        ${(m=h.limit_chain)!=null&&m.length?n`<ul>
                              ${h.limit_chain.map(p=>n`<li>
                                    ${p.label}: ${p.value}
                                    <span class="muted">(${p.factor})</span>
                                  </li>`)}
                            </ul>`:n`<p class="muted">No limit chain.</p>`}
                      </div>
                    `}):n`<p class="muted small">No active EV hints.</p>`}
              <p class="small"><strong>chargers_extended</strong></p>
              <pre class="json-pre">${JSON.stringify(c,null,2)}</pre>
            </details>
          `:n`<p class="muted">
            Turn on <strong>Allow advanced panel data</strong> in the integration options
            (Configure → Smappee Overview), then reload the panel.
          </p>`}
      ${s&&o&&r?n`
            <details class="adv-details">
              <summary>Raw JSON</summary>
              <pre class="json-pre">${JSON.stringify(r.raw_excerpts,null,2)}</pre>
            </details>
            <details class="adv-details">
              <summary>Processed values</summary>
              <p class="small">Consumption (processed)</p>
              <pre class="json-pre">${JSON.stringify(t.consumption??{},null,2)}</pre>
              <p class="small">
                Stale: ${(((f=t.diagnostics)==null?void 0:f.stale_sections)??[]).join(", ")||"—"}
              </p>
              <p class="small">Unsupported connectors</p>
              <pre class="json-pre">${JSON.stringify(((v=t.diagnostics)==null?void 0:v.unsupported_connectors)??[],null,2)}</pre>
              <p class="small">Session JSON keys (union)</p>
              <pre class="json-pre">${JSON.stringify(r.session_json_keys_union,null,2)}</pre>
            </details>
            <details class="adv-details">
              <summary>Widget bindings</summary>
              <p class="small">Entity map bindings</p>
              <pre class="json-pre">${JSON.stringify(t.entity_map??{},null,2)}</pre>
              <p class="small">Coordinator state</p>
              <pre class="json-pre">${JSON.stringify(r.coordinator_state,null,2)}</pre>
            </details>
          `:x}
    </div>
  `}function Zt(t,e,s=!1){var i,l,c,d,g,u,f,v,h,m;const o=t.diagnostics,r=t.installation,a=t.__normalize_warnings??[];return n`
    ${A(e)}
    <div class="card">
      <h3 class="card-h">API health</h3>
      <p>Coordinator OK: <strong>${((i=t.meta)==null?void 0:i.coordinator_last_update_success)??"—"}</strong></p>
      <p>Partial API: <strong>${t.api_partial?"yes":"no"}</strong></p>
      <p>Last error: <code>${t.last_error??(o==null?void 0:o.last_error)??"—"}</code></p>
      <p>Update interval: ${((l=t.meta)==null?void 0:l.update_interval_s)??"—"}s</p>
      <p>Installation timezone: <code>${((c=t.meta)==null?void 0:c.installation_timezone)??"—"}</code></p>
    </div>
    <div class="card">
      <h3 class="card-h">Stale sections</h3>
      ${(d=o==null?void 0:o.stale_sections)!=null&&d.length?n`<ul>${o.stale_sections.map(p=>n`<li>${p}</li>`)}</ul>`:n`<p class="muted">None flagged.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Unsupported / limited features</h3>
      ${(g=o==null?void 0:o.unsupported_connectors)!=null&&g.length?n`<ul>
            ${o.unsupported_connectors.map(p=>{const b=p;return n`<li>${b.charger_serial} #${b.connector}: ${b.reason}</li>`})}
          </ul>`:n`<p class="muted">None listed.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Installation</h3>
      <pre class="json-pre">${JSON.stringify(r,null,2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Installation raw (excerpt)</h3>
      <pre class="json-pre">${JSON.stringify((o==null?void 0:o.installation_raw_excerpt)??{},null,2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Data Inspector</h3>
      <p class="muted small">
        Raw incoming + processed snapshots and render eligibility hints.
      </p>
      <pre class="json-pre">${JSON.stringify({normalizeWarnings:a,backendHealth:(o==null?void 0:o.backend_health)??{},validationWarnings:(o==null?void 0:o.validation_warnings)??[],hasConsumption:!!t.consumption,chargers:((u=t.chargers)==null?void 0:u.length)??0,sessionsActive:((f=t.sessions_active)==null?void 0:f.length)??0,sessionsRecent:((v=t.sessions_recent)==null?void 0:v.length)??0,apiPartial:t.api_partial??!1,timeWindowUtc:((h=t.meta)==null?void 0:h.time_window_today_utc)??null},null,2)}</pre>
    </div>
    ${(m=o==null?void 0:o.session_json_keys_union)!=null&&m.length?n`
          <div class="card">
            <h3 class="card-h">Session JSON keys (debug)</h3>
            <p class="muted small">
              Enable &quot;Debug session JSON keys&quot; in integration options. Union of keys seen in
              recent session payloads.
            </p>
            <pre class="json-pre">${JSON.stringify(o.session_json_keys_union,null,2)}</pre>
          </div>
        `:""}
    ${s&&t.advanced?n`
          <div class="card">
            <h3 class="card-h">Advanced Raw Excerpts (Debug mode)</h3>
            <pre class="json-pre">${JSON.stringify(t.advanced.raw_excerpts??{},null,2)}</pre>
          </div>
        `:""}
  `}function je(t){let e=0,s=0,o=0,r=0,a=0;for(const i of t)i.energy_wh!=null&&i.energy_wh>0&&(e+=i.energy_wh/1e3,a+=1),i.cost_estimate!=null&&(s+=i.cost_estimate),i.reimbursement_estimate!=null&&(o+=i.reimbursement_estimate),i.solar_savings_estimate!=null&&(r+=i.solar_savings_estimate);return{kwh:e,costEst:s,reimb:o,solarSave:r,count:a}}function Xt(t,e){return t.filter(s=>s.start&&s.start.slice(0,7)===e)}function es(t,e){return t.filter(s=>s.start&&s.start.slice(0,4)===e)}function ts(t,e,s,o){var w,E,y,C,B;const r=((w=t.reimbursement)==null?void 0:w.currency)??"EUR",a=(E=t.reimbursement)==null?void 0:E.belgium_cap,i=(y=t.reimbursement)==null?void 0:y.rate_per_kwh,l=t.economics,c=t.reimbursement_monthly,d=(l==null?void 0:l.reimbursement_history)??[],g=ke(t),u=new Date,f=(c==null?void 0:c.month)??`${u.getUTCFullYear()}-${String(u.getUTCMonth()+1).padStart(2,"0")}`,v=String(u.getUTCFullYear()),h=Xt(g,f),m=es(g,v),p=je(h),b=je(m),_=t.country_code==="BE"?n`
          <div
            class="card be-badge ${(l==null?void 0:l.belgium_cap_compliant)===!1?"warn":"ok"}"
          >
            <strong>Belgium cap</strong>
            ${a!=null?n`<p>Cap: ${a} EUR/kWh · Your rate: ${i??"—"} EUR/kWh</p>`:n`<p>Configure cap in integration options.</p>`}
            ${(l==null?void 0:l.belgium_cap_compliant)===!0?n`<p class="ok-text">Rate within cap.</p>`:(l==null?void 0:l.belgium_cap_compliant)===!1?n`<p class="warn-text">Rate exceeds configured cap.</p>`:""}
          </div>
        `:n``,$=(S,N)=>n`
    <button
      type="button"
      class=${e===S?"active":""}
      @click=${()=>s(S)}
    >
      ${N}
    </button>
  `;let k;if(e==="today")k=n`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Energy &amp; money (today, UTC)</h3>
          <p>
            EV energy (sessions): <strong>${((C=l==null?void 0:l.today_kwh)==null?void 0:C.toFixed(2))??"—"} kWh</strong>
          </p>
          <p>
            Tariff cost (est.):
            <strong
              >${(l==null?void 0:l.today_charging_cost_estimate_eur)!=null?`${l.today_charging_cost_estimate_eur.toFixed(2)} ${r}`:"—"}</strong
            >
          </p>
          <p>
            Pending reimbursement (est.):
            <strong
              >${(l==null?void 0:l.today_pending_eur)!=null?`${l.today_pending_eur.toFixed(2)} ${r}`:"—"}</strong
            >
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${(l==null?void 0:l.today_charging_cost_estimate_eur)!=null?n`Today's charging ≈
                  <strong
                    >${l.today_charging_cost_estimate_eur.toFixed(2)}
                    ${r}</strong
                  >
                  at primary tariff (estimate).`:n`<span class="muted">No tariff-based cost estimate for today.</span>`}
          </p>
          <p class="econ-hero-line">
            ${(l==null?void 0:l.today_pending_eur)!=null?n`<strong>${l.today_pending_eur.toFixed(2)} ${r}</strong>
                  pending reimbursement today (configured rate × energy).`:""}
          </p>
        </div>
      </div>
    `;else if(e==="month"){const S=(B=t.overview_context)==null?void 0:B.month_smart_savings;k=n`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Month ${f}</h3>
          <p>
            Sessions in payload: <strong>${p.count}</strong> ·
            <strong>${p.kwh.toFixed(2)} kWh</strong>
          </p>
          <p>
            Cost (est. sum): <strong>${p.costEst.toFixed(2)} ${r}</strong>
          </p>
          <p>
            Reimbursement (est. sum):
            <strong>${p.reimb.toFixed(2)} ${r}</strong>
          </p>
          <p>
            Solar savings (est. sum):
            <strong>${p.solarSave.toFixed(2)} ${r}</strong>
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${c!=null?n`<strong>${c.pending_amount.toFixed(2)} ${r}</strong>
                  pending reimbursement (${c.total_kwh.toFixed(2)} kWh,
                  ${c.sessions_count} sessions).`:n`<span class="muted">No monthly reimbursement summary.</span>`}
          </p>
          <p class="econ-hero-line">
            ${S!=null&&S.total_eur>0?n`You saved ≈
                  <strong
                    >${S.total_eur.toFixed(2)} ${S.currency}</strong
                  >
                  via solar-weighted tariff (estimated,
                  ${S.sessions_count} sessions).`:n`<span class="muted">No smart/solar savings total for this month.</span>`}
          </p>
        </div>
      </div>
    `}else k=n`
      <div class="card">
        <h3 class="card-h">Year ${v} (payload window)</h3>
        ${t.api_partial?n`<div class="banner">Partial API data — figures may be incomplete.</div>`:""}
        <p class="muted small">
          Only sessions present in this panel's history window are included
          (${b.count} sessions, ${b.kwh.toFixed(2)} kWh).
        </p>
        <p>
          Cost (est. sum): <strong>${b.costEst.toFixed(2)} ${r}</strong>
        </p>
        <p>
          Reimbursement (est. sum):
          <strong>${b.reimb.toFixed(2)} ${r}</strong>
        </p>
        <p>
          Solar savings (est. sum):
          <strong>${b.solarSave.toFixed(2)} ${r}</strong>
        </p>
        <p class="econ-hero-line">
          ${b.solarSave>0?n`≈ <strong>${b.solarSave.toFixed(2)} ${r}</strong> in
                estimated solar tariff savings for listed sessions.`:""}
        </p>
      </div>
    `;return n`
    ${A(o)}
    ${_}
    <nav class="econ-period-tabs" aria-label="Economics period">
      ${$("today","Today")} ${$("month","Month")}
      ${$("year","Year")}
    </nav>
    ${k}
    <div class="card">
      <h3 class="card-h">All tariffs (API)</h3>
      <p class="muted small">
        Session <em>cost estimates</em> use the first tariff only when multiple
        exist.
      </p>
      ${(()=>{var N,Se;const S=(Se=(N=t.economics)==null?void 0:N.tariffs_all)!=null&&Se.length?t.economics.tariffs_all:t.tariffs??[];return S.length?n`
              <ul class="tariff-list">
                ${S.map((X,ot)=>n`
                    <li>
                      ${ot===0&&S.length>1?n`<span class="badge">primary (estimates)</span> `:""}
                      <strong>${X.name??X.id}</strong> —
                      ${X.price_per_kwh??"—"} ${X.currency??""} / kWh
                    </li>
                  `)}
              </ul>
            `:n`<p class="muted">No tariff data from API.</p>`})()}
    </div>
    <div class="card row-2">
      <div>
        <h3 class="card-h">Split billing / reimbursement</h3>
        <p>Rate: <strong>${i??"—"}</strong> ${r}/kWh</p>
        <p>
          Config rate applies to pending amounts shown on Today / Month views.
        </p>
      </div>
      <div>
        <h3 class="card-h">Reimbursement history</h3>
        ${d.length?n`<ul>${d.map(S=>{const N=S;return n`<li>${N.valid_from}: ${N.rate_per_kwh}</li>`})}</ul>`:n`<p class="muted">No history entries (options-only rate).</p>`}
      </div>
    </div>
  `}function he(t){const e=new Map;for(const o of t){const r=new Date(o.t).getHours(),a=e.get(r)??{sum:0,n:0};a.sum+=o.v,a.n+=1,e.set(r,a)}const s=new Map;for(const[o,{sum:r,n:a}]of e)a>0&&s.set(o,r/a);return s}function ss(t,e){let s=null;for(let o=0;o<=22;o++){const r=t.get(o),a=t.get(o+1),i=e.get(o),l=e.get(o+1);if(r===void 0||a===void 0||i===void 0||l===void 0)continue;const c=(r+a-(i+l))/2;(s===null||c>s.score)&&(s={startH:o,score:c})}return s}function os(t){let e=null;for(let s=0;s<=22;s++){const o=t.get(s),r=t.get(s+1);if(o===void 0||r===void 0)continue;const a=(o+r)/2;(e===null||a>e.score)&&(e={startH:s,score:a})}return e}function We(t,e=2){const s=t+e,o=r=>r<10?`0${r}`:String(r);return`${o(t)}:00–${o(s)}:00`}const me=10,rs=250,as=350;function is(t,e){if(!e||!t)return null;const s=e.solar,o=e.consumption,r=e.grid_export;if(s&&o){const a=t[s]??[],i=t[o]??[];if(a.length>=me&&i.length>=me){const l=he(a),c=he(i),d=ss(l,c);if(d&&d.score>=rs)return{id:"history-surplus-pattern",category:"solar",severity:"info",title:"Typical solar surplus window (recent)",body:`In the last 24 hours, solar minus home load tended to be highest around ${We(d.startH)} (local time). This is a retrospective pattern from history—not a weather forecast.`,source:"history"}}}if(r){const a=t[r]??[];if(a.length>=me){const i=he(a),l=os(i);if(l&&l.score>=as)return{id:"history-export-pattern",category:"solar",severity:"info",title:"Typical export window (recent)",body:`Grid export was often strongest around ${We(l.startH)} (local) in the last 24 hours. Good past windows for self-consumption (e.g. EV charging) may repeat—but this is not a prediction.`,source:"history"}}}return null}function ns(t){if(!Array.isArray(t))return[];const e=[];for(const s of t){if(!s||typeof s!="object")continue;const o=s,r=typeof o.id=="string"?o.id:null,a=typeof o.title=="string"?o.title:null,i=typeof o.body=="string"?o.body:null,l=o.severity==="warn"||o.severity==="info"?o.severity:null;if(!r||!a||!i||!l)continue;const c=typeof o.category=="string"?o.category:void 0;let d;const g=o.savings;if(g&&typeof g=="object"){const u=g,f=typeof u.amount=="number"?u.amount:Number.NaN;if(Number.isFinite(f)){const v=typeof u.assumed_kwh=="number"?u.assumed_kwh:Number(u.assumed_kwh);d={amount:f,currency:typeof u.currency=="string"?u.currency:"EUR",assumed_kwh:Number.isFinite(v)?v:10,note:typeof u.note=="string"?u.note:""}}}e.push({id:r,category:c,severity:l,title:a,body:i,savings:d,source:"server"})}return e}const He=5;function ls(t,e,s){var i;const r=[...ns((i=t.overview_context)==null?void 0:i.assistant_suggestions)],a=is(e,s);return a&&r.length<He&&!r.some(l=>l.id===a.id)&&r.push(a),r.slice(0,He)}function te(t){return t==null||Number.isNaN(t)?"—":`${Math.round(t)} W`}function cs(t){if(t.pause_explanation.code!=="charging")return{short:t.pause_explanation.title,detail:t.pause_explanation.detail};const s=t.limit_chain??[],o=s.find(i=>i.factor==="load_balance");if(o)return{short:"Limited by load balancing / grid",detail:`${o.label}: ${o.value}. The installation may be capping current to protect the main fuse or tariff.`};const r=s.find(i=>i.factor==="smart_mode");if(r)return{short:"Smart mode may throttle",detail:r.value};const a=s.find(i=>i.factor==="set_current");return a?{short:"User current limit",detail:`${a.label}: ${a.value}.`}:{short:"Charging",detail:"Energy is being delivered when the vehicle accepts it."}}function ds(t){var o;const e=(o=t.overview_context)==null?void 0:o.operational_flags,s=[];return s.push({id:"charging",label:"Charging active",active:!!(e!=null&&e.charging_active),variant:e!=null&&e.charging_active?"ok":"neutral",title:e!=null&&e.charging_active?"At least one session is delivering or queued with current.":"No active charging detected on connectors."}),s.push({id:"overload",label:"Load cap / balance",active:!!(e!=null&&e.overload_suspected),variant:e!=null&&e.overload_suspected?"warn":"neutral",title:e!=null&&e.overload_suspected?"Load balancing or similar may be limiting available current.":"No load-balancing cap detected from API hints."}),s.push({id:"solar_surplus",label:"Solar surplus",active:!!(e!=null&&e.solar_surplus),variant:e!=null&&e.solar_surplus?"info":"neutral",title:e!=null&&e.solar_surplus?"Significant export to grid — surplus power available.":"Export is low or unknown."}),s.push({id:"smart",label:"Smart charging",active:!!(e!=null&&e.smart_mode_any),variant:e!=null&&e.smart_mode_any?"info":"neutral",title:e!=null&&e.smart_mode_any?"At least one connector uses SMART mode.":"No connector in SMART mode."}),s.push({id:"solar_mode",label:"Solar mode",active:!!(e!=null&&e.solar_mode_any),variant:e!=null&&e.solar_mode_any?"info":"neutral",title:e!=null&&e.solar_mode_any?"Solar-oriented charging mode reported by the API.":"Solar-specific mode not reported."}),s}function ps(t){var i;if(!t.consumption)return{nodes:[],edges:[],hasConsumption:!1};const s=Xe(t),o=((i=t.overview_context)==null?void 0:i.estimated_ev_power_w)??null,r=[{id:"grid",label:"Grid",powerW:s.gridImport!=null&&s.gridImport>0?s.gridImport:null,sub:s.gridExport!=null&&s.gridExport>0?`Export ${te(s.gridExport)}`:void 0},{id:"solar",label:"Solar",powerW:s.solar},{id:"home",label:"Home",powerW:s.home},{id:"battery",label:"Battery",powerW:s.battery,sub:s.batterySoc!=null?`${Math.round(s.batterySoc)}% SoC`:void 0},{id:"ev",label:"EV",powerW:o,sub:o!=null?"estimated":void 0}],a=[];return s.gridImport!=null&&s.gridImport>0&&a.push({id:"grid-in",from:"grid",to:"home",powerW:s.gridImport,kind:"import"}),s.gridExport!=null&&s.gridExport>0&&a.push({id:"grid-out",from:"home",to:"grid",powerW:s.gridExport,kind:"export"}),s.solar!=null&&s.solar>0&&a.push({id:"solar-in",from:"solar",to:"home",powerW:s.solar,kind:"solar"}),s.battery!=null&&Math.abs(s.battery)>5&&a.push({id:"battery",from:"battery",to:"home",powerW:s.battery,kind:"battery"}),o!=null&&o>0&&a.push({id:"ev",from:"ev",to:"home",powerW:o,kind:"ev"}),{nodes:r,edges:a,hasConsumption:!0}}function us(t){var r,a,i;const e=(r=t.economics)==null?void 0:r.tariff_primary,s=(e==null?void 0:e.currency)||((i=(a=t.tariffs)==null?void 0:a[0])==null?void 0:i.currency)||"EUR";return{price:typeof(e==null?void 0:e.price_per_kwh)=="number"?e.price_per_kwh:null,currency:s}}function gs(t){var i,l;const e=t.consumption,{price:s,currency:o}=us(t),r=(i=t.economics)==null?void 0:i.today_charging_cost_estimate_eur,a=(l=t.overview_context)==null?void 0:l.estimated_ev_power_w;return{consumption:{value:te(e==null?void 0:e.consumption_w),numeric:(e==null?void 0:e.consumption_w)??null,source:(e==null?void 0:e.consumption_w)!=null?"live":"missing",tooltip:"Total site consumption (live). Sparkline from Home Assistant history when entity mapping exists."},solar:{value:te(e==null?void 0:e.solar_w),numeric:(e==null?void 0:e.solar_w)??null,source:(e==null?void 0:e.solar_w)!=null?"live":"missing",tooltip:"Solar production (live)."},evPower:{value:te(a??void 0),numeric:a??null,source:a!=null?"estimated":"missing",tooltip:"Estimated from connector current × phase voltage (or 230 V fallback). Not a direct meter reading."},tariff:{value:s!=null?`${s.toFixed(4)} ${o}/kWh`:"—",numeric:s,source:s!=null?"calculated":"missing",tooltip:"Primary tariff from Smappee API (first in list). Used for session cost estimates."},todayCost:{value:r!=null?`≈ ${r.toFixed(2)} ${o}`:"—",numeric:r??null,source:r!=null?"calculated":"missing",tooltip:"Sum of primary-tariff estimates for sessions that started today (UTC). Not a utility bill."},selfConsumption:{value:(e==null?void 0:e.self_consumption_pct)!=null?`${Math.round(e.self_consumption_pct)}%`:"—",numeric:(e==null?void 0:e.self_consumption_pct)??null,source:(e==null?void 0:e.self_consumption_pct)!=null?"live":"missing",tooltip:"Self-consumption share from the last consumption snapshot."}}}function hs(t){if(!(t!=null&&t.phase_metrics))return null;const e=t.phase_metrics,s=[e.l1_a,e.l2_a,e.l3_a].filter(o=>typeof o=="number"&&Number.isFinite(o));return s.length?Math.max(...s):null}function ms(t){for(const e of ke(t))if(/charging|started/i.test(e.status||""))return!0;return!1}function vs(t){var l,c;const e=Xe(t),s=[];e.gridExport!=null&&e.gridExport>400&&!ms(t)&&s.push({id:"export-opportunity",severity:"info",title:"Export opportunity",body:"Significant power is flowing to the grid while no EV session is actively charging. Smart or solar charging modes could use this surplus."}),e.gridImport!=null&&e.gridImport>1500&&(e.solar==null||e.solar<800)&&s.push({id:"peak-grid-draw",severity:"warn",title:"High grid import",body:"Household draw is relying heavily on the grid with limited solar contribution. Consider shifting loads or checking tariff windows."}),e.batterySoc!=null&&e.batterySoc>=88&&e.battery!=null&&e.battery<-200&&e.gridExport!=null&&e.gridExport>300&&s.push({id:"battery-full-export",severity:"info",title:"Battery saturated, exporting",body:"Battery is full or discharging little while exporting to the grid. Surplus could go to an EV if a session starts."}),e.solar!=null&&e.solar>2e3&&e.home!=null&&e.home<500&&s.push({id:"solar-surplus",severity:"info",title:"Strong solar harvest",body:"Low home consumption vs solar production — a good window for EV charging if you need range."});const o=((l=t.overview_context)==null?void 0:l.active_ev_hints)??[],r=new Set;for(const d of o){const g=/charging|started/i.test(d.status||""),u=(d.limit_chain??[]).some(f=>f.factor==="load_balance");g&&u&&!r.has(d.session_id)&&(r.add(d.session_id),s.push({id:`load-balance-${d.session_id}`,severity:"warn",title:"Charging may be grid-limited",body:"Load balancing reports a cap on available current. The wallbox may be slower than your set limit until headroom improves."}))}const a=(c=t.overview_context)==null?void 0:c.peak_phase_current_warning_a,i=hs(t.consumption??void 0);return a!=null&&i!=null&&i>=a&&s.push({id:"peak-phase-current",severity:"warn",title:"Phase current near your alert threshold",body:`Highest reported phase current is ${i.toFixed(1)} A (your warning is ${a} A). Check main fuse / capacity tariffs if relevant.`}),s.slice(0,6)}function fs(t){var r,a,i,l;const e=[];t.api_partial&&e.push({id:"api-partial",severity:"warn",label:"Partial API data"}),((r=t.consumption)!=null&&r.stale||(a=t.meta)!=null&&a.consumption_stale)&&e.push({id:"consumption-stale",severity:"warn",label:"Consumption stale"}),(i=t.meta)!=null&&i.coordinator_last_update_success||e.push({id:"coord-fail",severity:"error",label:"Last update failed"});const s=Lt(t);t.country_code==="BE"&&s===!1&&e.push({id:"be-cap",severity:"error",label:"BE cap exceeded"});const o=((l=t.diagnostics)==null?void 0:l.unsupported_connectors)??[];for(let c=0;c<o.length;c++){const d=o[c];e.push({id:`unsupported-${c}`,severity:"info",label:`Mode unknown · ${d.charger_serial??"?"} #${d.connector??"?"}`})}for(const c of t.alerts??[]){const d=(c.severity||"").toLowerCase()==="error"?"error":(c.severity||"").toLowerCase()==="warning"?"warn":"info";e.push({id:`alert-${c.id}`,severity:d,label:c.message.slice(0,80)+(c.message.length>80?"…":"")})}return e.slice(0,12)}function bs(t){return t.length?n`
    <div class="sov-anomalies">
      ${t.map(e=>n`
          <span class="sov-anomaly sov-anomaly--${e.severity}" title=${e.label}
            >${e.label}</span
          >
        `)}
    </div>
  `:n`
      <div class="sov-anomalies sov-anomalies--ok">
        <span class="sov-anomaly sov-anomaly--ok">No anomalies flagged</span>
      </div>
    `}const ys="ha_smappee_overview";function _s(t,e,s){return t==null?void 0:t.find(o=>o.charger_serial===e&&o.connector===s)}function xs(t){return t==="live"?"Live":t==="config"?"Config":"Est."}function $s(t,e,s,o,r){var l,c;const a=((l=t.overview_context)==null?void 0:l.active_ev_hints)??[],i=async(d,g)=>{try{await e.callService(ys,d,{config_entry_id:s,...g}),o()}catch(u){console.error(u)}};return(c=t.chargers)!=null&&c.length?n`
    <div class="sov-charger-section">
      <div class="sov-charger-head">
        <h2 class="sov-h2">Charger control</h2>
        <button
          type="button"
          class="btn secondary sov-link-chargers"
          @click=${r}
        >
          Full controls →
        </button>
      </div>
      <div class="sov-charger-grid">
        ${t.chargers.map(d=>{var v,h;const g=(v=t.charger_features)==null?void 0:v[d.serial],u=d.connectors.some(m=>m.session_active),f=(h=t.overview_context)==null?void 0:h.estimated_ev_power_w;return n`
            <div class="card sov-charger-card">
              <div class="sov-charger-title-row">
                <strong>${d.name}</strong>
                <span class="chip ${d.availability?"ok":"off"}"
                  >${d.availability?"Available":"Unavailable"}</span
                >
              </div>
              <div class="muted mono small">${d.serial}</div>
              ${u&&f!=null&&f>0?n`<p class="muted small">
                    Site EV power (est.): ~${Math.round(f)} W
                  </p>`:""}
              ${d.connectors.map(m=>{const p=_s(a,d.serial,m.position),b=p?cs(p):null,_=Math.min(32,(g==null?void 0:g.max_current_a)??32),$=6,k=Math.round(Math.min(_,Math.max($,m.current_a??16)));return n`
                  <div class="sov-connector-quick">
                    <div class="sov-conn-line">
                      <span>Connector ${m.position}</span>
                      <span class="mono"
                        >${m.mode} · ${m.current_a??"—"} A</span
                      >
                      ${m.session_active?n`<span class="live">Session</span>`:""}
                    </div>
                    ${b?n`
                          <div
                            class="sov-charge-reason"
                            title=${b.detail}
                          >
                            <span class="sov-charge-reason-label"
                              >${b.short}</span
                            >
                          </div>
                        `:""}
                    <div class="btn-row">
                      <button
                        type="button"
                        class="btn"
                        @click=${()=>i("start_charging",{charger_serial:d.serial,connector_position:m.position})}
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        class="btn secondary"
                        @click=${()=>i("pause_charging",{charger_serial:d.serial,connector_position:m.position})}
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        class="btn secondary"
                        @click=${()=>i("stop_charging",{charger_serial:d.serial,connector_position:m.position})}
                      >
                        Stop
                      </button>
                    </div>
                    ${g!=null&&g.supports_current_limit?n`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label"
                              >Current limit (A)</label
                            >
                            <input
                              type="range"
                              min=${$}
                              max=${_}
                              .value=${String(k)}
                              @change=${w=>{const E=w.target,y=parseInt(E.value,10);y>=$&&i("set_charging_current",{charger_serial:d.serial,connector_position:m.position,current_a:y})}}
                            />
                            <span class="mono small">${k} A</span>
                          </div>
                        `:""}
                    ${p&&p.pause_explanation.code!=="charging"?n`
                          <div class="sov-pause-box card-inner">
                            <div class="sov-pause-title">Status</div>
                            <p>
                              <strong>${p.pause_explanation.title}</strong>
                            </p>
                            <p class="muted small">
                              ${p.pause_explanation.detail}
                            </p>
                          </div>
                        `:""}
                    ${p!=null&&p.limit_chain.length?n`
                          <div class="sov-limit-chain">
                            <div class="sov-limit-chain-h">
                              What limits charge speed
                            </div>
                            <ol class="sov-limit-list">
                              ${p.limit_chain.map(w=>n`
                                  <li>
                                    <span class="sov-limit-label"
                                      >${w.label}</span
                                    >
                                    <span class="mono">${w.value}</span>
                                    <span
                                      class="sov-src sov-src--${w.source}"
                                      >${xs(w.source)}</span
                                    >
                                  </li>
                                `)}
                            </ol>
                          </div>
                        `:""}
                    ${g!=null&&g.supports_smart_mode?n`
                          <div class="mode-row">
                            <label>Mode</label>
                            <select
                              @change=${w=>{const E=w.target;i("set_charging_mode",{charger_serial:d.serial,connector_position:m.position,mode:E.value})}}
                            >
                              <option value="standard">Standard</option>
                              <option value="smart">Smart</option>
                              <option value="solar">Solar</option>
                            </select>
                          </div>
                        `:""}
                  </div>
                `})}
            </div>
          `})}
      </div>
    </div>
  `:n`
      <div class="card sov-charger-section">
        <h2 class="sov-h2">EV chargers</h2>
        <p class="muted">No chargers discovered for this installation.</p>
      </div>
    `}const ws={live:"Live",calculated:"Calculated",config:"Config"},Be={live:"Directly from Smappee (real-time or latest connector state).",calculated:"Derived in this integration from sessions, tariffs, or history—not a utility invoice.",config:"From your integration options or Smappee tariff settings."};function ne(t,e){const s=e?`${Be[t]} ${e}`:Be[t];return n`
    <span class="sov-badge sov-badge--${t}" title=${s}>${ws[t]}</span>
  `}function ks(t){var a;const e=t.reimbursement_monthly,s=t.reimbursement,o=(s==null?void 0:s.currency)??"EUR",r=(a=t.overview_context)==null?void 0:a.month_smart_savings;return n`
    <div class="card sov-econ-compact">
      <div class="sov-section-head">
        <h2 class="sov-h2">Economics snapshot</h2>
        ${ne("calculated")}
      </div>
      <div class="sov-econ-compact-inner">
        <div class="sov-econ-compact-stat">
          <div class="sov-econ-label">Pending reimbursement (month)</div>
          <strong
            >${e!=null?`${e.pending_amount.toFixed(2)} ${o}`:"—"}</strong
          >
          <p class="muted small">
            ${e!=null?`${e.total_kwh.toFixed(2)} kWh · ${e.month}`:"Configure reimbursement in integration options."}
          </p>
        </div>
        <div class="sov-econ-compact-stat">
          <div class="sov-econ-label">Smart savings (est., month)</div>
          <strong
            >${r!=null?`${r.total_eur.toFixed(2)} ${r.currency}`:"—"}</strong
          >
          <p class="muted small">
            Tariff × kWh × solar share — approximate. See Economics tab for
            periods.
          </p>
        </div>
      </div>
    </div>
  `}function Ss(t,e,s,o,r){var d;const a=t.meta,i=((d=t.diagnostics)==null?void 0:d.stale_sections)??[],l=(a==null?void 0:a.coordinator_last_update_success)!==!1,c=[];return c.push(n`
    <div class="sov-health-item">
      ${ne("live")}
      <span class="sov-health-label">Coordinator</span>
      <strong class=${l?"ok-text":"warn-text"}
        >${l?"OK":"Issue"}</strong
      >
    </div>
  `),c.push(n`
    <div class="sov-health-item">
      <span class="sov-health-label">Connection</span>
      <strong
        >${e==="connected"?"Connected":e==="loading"?"Loading…":e==="error"?"Error":"Idle"}</strong
      >
    </div>
  `),t.last_successful_update&&c.push(n`
      <div class="sov-health-item">
        <span class="sov-health-label">Last sync</span>
        <span class="mono small"
          >${t.last_successful_update.replace("T"," ").slice(0,19)}Z</span
        >
      </div>
    `),i.length&&c.push(n`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Stale</span>
        <span>${i.join(", ")}</span>
      </div>
    `),t.api_partial&&c.push(n`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">API</span>
        <span>Partial</span>
      </div>
    `),o?s&&c.push(n`
      <div class="sov-health-item">
        <span class="sov-health-label">Trends</span>
        <span class="sov-shimmer">Loading history…</span>
      </div>
    `):c.push(n`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Trends</span>
        <span>No entity map</span>
      </div>
    `),n`
    <div class="sov-health-strip">
      ${c}
      ${""}
    </div>
  `}function As(t){return t==="solar"?"Solar":t==="cost"?"Cost":t==="peak"?"Peak":"Tip"}function Es(t){return t.length?n`
    <div class="sov-insights">
      <h2 class="sov-h2">Insights</h2>
      <div class="sov-insight-grid">
        ${t.map(e=>n`
            <div class="card sov-insight sov-insight--${e.severity}">
              <div class="sov-insight-title">${e.title}</div>
              <p class="sov-insight-body muted">${e.body}</p>
            </div>
          `)}
      </div>
    </div>
  `:n``}function Cs(t){return t.length?n`
    <div class="sov-insights">
      <h2 class="sov-h2">Assistant</h2>
      <div class="sov-insight-grid">
        ${t.map(e=>n`
            <div class="card sov-insight sov-insight--${e.severity}">
              <div class="sov-insight-head">
                ${e.category?n`<span class="sov-insight-cat">${As(e.category)}</span>`:x}
                <div class="sov-insight-title">${e.title}</div>
              </div>
              <p class="sov-insight-body muted">${e.body}</p>
              ${e.savings?n`<p class="sov-insight-savings muted">
                    ~${e.savings.amount.toFixed(2)}
                    ${e.savings.currency} · ~${e.savings.assumed_kwh} kWh ·
                    ${e.savings.note}
                  </p>`:x}
            </div>
          `)}
      </div>
    </div>
  `:n``}function Ts(t,e,s,o){return n`
    <div class="sov-empty">
      <div class="sov-empty-title">${t}</div>
      <p class="sov-empty-body muted">${e}</p>
      ${o?n`<button type="button" class="btn secondary" @click=${o}>
            ${s}
          </button>`:""}
    </div>
  `}function Ps(t,e){if(!(t!=null&&t.length))return n`<div class="spark-empty" aria-label=${e}>No trend data</div>`;const s=120,o=36,r=t.map(g=>g.v),a=Math.min(...r),l=Math.max(...r)-a||1,c=2,d=t.map((g,u)=>{const f=c+u/Math.max(t.length-1,1)*(s-c*2),v=c+(1-(g.v-a)/l)*(o-c*2);return`${u===0?"M":"L"}${f.toFixed(1)},${v.toFixed(1)}`}).join(" ");return n`
    <svg
      class="spark-svg"
      viewBox="0 0 ${s} ${o}"
      width="${s}"
      height="${o}"
      aria-label=${e}
    >
      <path
        d=${d}
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `}function Os(t){return t==="live"?"live":t==="calculated"||t==="estimated"?"calculated":"live"}function ve(t,e,s,o,r){const a=e==null?void 0:e[o],i=a?t[a]:void 0;return s&&!(i!=null&&i.length)?n`<div class="sov-spark-skel skel" aria-hidden="true"></div>`:Ps(i,r)}function U(t,e,s,o){return n`
    <div
      class="card kpi sov-kpi-premium ${o?"sov-kpi-premium--full":""}"
      title=${e.tooltip}
      aria-label=${`${t}: ${e.value}. ${e.tooltip}`}
    >
      <div class="sov-kpi-head">
        <span class="kpi-h">${t}</span>
        ${e.source==="missing"?"":ne(Os(e.source),e.tooltip)}
      </div>
      <div class="sov-kpi-premium-val">${e.value}</div>
      <div class="sov-kpi-spark">${s}</div>
    </div>
  `}function Is(t,e,s,o,r){const a=gs(t),i=P(t,"device");return n`
    ${A(i)}
    <div class="sov-kpi-premium-grid">
      ${U("Consumption",a.consumption,ve(e,s,o,"consumption","Consumption"),r)}
      ${U("Solar",a.solar,ve(e,s,o,"solar","Solar"),r)}
      ${U("EV (est.)",a.evPower,n`<div class="spark-empty" title="No history entity for EV power">
          Trend N/A
        </div>`,r)}
      ${U("Tariff now",a.tariff,n`<div class="spark-empty">—</div>`,r)}
      ${U("Cost today (est.)",a.todayCost,n`<div class="spark-empty">—</div>`,r)}
      ${U("Self-consumption",a.selfConsumption,ve(e,s,o,"self_consumption","Self-consumption"),r)}
    </div>
  `}function Ns(t){return t==="grid"?"sov-sf-node--grid":t==="solar"?"sov-sf-node--solar":t==="battery"?"sov-sf-node--battery":t==="ev"?"sov-sf-node--ev":"sov-sf-node--home"}function Ms(t,e=!1){const{nodes:s,hasConsumption:o}=ps(t),r=P(t,"device");if(!o)return n`
      <div class="card sov-smart-flow sov-smart-flow--empty">
        <div class="sov-section-head">
          <h2 class="sov-h2">Energy flow</h2>
        </div>
        ${A(r)}
        ${e?Ht(2):n`<p class="muted">No live consumption snapshot yet.</p>`}
      </div>
    `;const a=Object.fromEntries(s.map(l=>[l.id,l])),i=l=>{const c=a[l];return c?n`
      <div class="sov-sf-node ${Ns(c.id)}">
        <span class="sov-sf-node-label">${c.label}</span>
        <strong class="sov-sf-node-val">${c.powerW!=null?`${Math.round(c.powerW)} W`:"—"}</strong>
        ${c.sub?n`<span class="sov-sf-node-sub muted small">${c.sub}</span>`:""}
      </div>
    `:n``};return n`
    <div class="card sov-smart-flow">
      <div class="sov-section-head">
        <h2 class="sov-h2">Energy flow</h2>
        ${ne("live")}
      </div>
      ${A(r)}
      <p class="muted small sov-sf-hint">
        Flow arrows show direction of power. EV power is estimated when a session is active.
      </p>
      <div class="sov-sf-diagram" role="img" aria-label="Energy flow diagram">
        <div class="sov-sf-row sov-sf-row--top">
          ${i("solar")}
          <div class="sov-sf-connector sov-sf-connector--solar" aria-hidden="true"></div>
          ${i("home")}
          <div class="sov-sf-connector sov-sf-connector--grid-in" aria-hidden="true"></div>
          ${i("grid")}
        </div>
        <div class="sov-sf-row sov-sf-row--bot">
          ${i("battery")}
          <div class="sov-sf-connector sov-sf-connector--bat" aria-hidden="true"></div>
          <div class="sov-sf-spacer"></div>
          <div class="sov-sf-connector sov-sf-connector--ev" aria-hidden="true"></div>
          ${i("ev")}
        </div>
      </div>
    </div>
  `}function Rs(t){const e=ds(t);return n`
    <section class="sov-status-strip" aria-label="Operational status">
      <div class="sov-status-badges">
        ${e.map(s=>n`
            <span
              class="sov-op-badge sov-op-badge--${s.variant} ${s.active?"sov-op-badge--on":""}"
              title=${s.title}
              >${s.label}${s.active?" · on":""}</span
            >
          `)}
      </div>
    </section>
  `}const ye=["flow_kpi","insights","assistant","economics","chargers"],Fe={default:["flow_kpi","insights","assistant","economics","chargers"],operations:["chargers","flow_kpi","assistant","insights","economics"],compact:["flow_kpi","economics","chargers","insights","assistant"]};function zs(t){const e=[],s=new Set;for(const o of t)!ye.includes(o)||s.has(o)||(s.add(o),e.push(o));for(const o of ye)s.has(o)||e.push(o);return e}function Ls(t,e,s,o){var f;const r=!!(s&&Object.keys(s).length>0),a=fs(t),i=ls(t,e,s),l=vs(t),c=o.narrow,d=o.layoutTemplate,g=zs(o.layoutOrder),u={flow_kpi:n`<div class="sov-overview-main-grid">
      <div class="sov-overview-flow-col">${Ms(t,o.loading)}</div>
      <div class="sov-overview-kpi-col">
        ${Is(t,e,s,o.historyLoading,c)}
      </div>
    </div>`,insights:Es(l),assistant:Cs(i),economics:ks(t),chargers:$s(t,o.hass,o.entryId,o.afterAction,o.onOpenChargersTab)};return n`
    <div class="sov-root ${c?"sov-root--narrow":""}">
      <section class="sov-widget-toolbar card card-inner">
        <label>
          Widget template
          <select
            .value=${d}
            @change=${v=>{const h=v.target.value,m=Fe[h];o.onTemplateChange(h),o.onLayoutReorder(m)}}
          >
            <option value="default">Default</option>
            <option value="operations">Operations focus</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <button
          class="btn secondary"
          type="button"
          @click=${()=>o.onLayoutReorder(Fe[d])}
        >
          Reset layout
        </button>
      </section>
      ${Ss(t,o.connection,o.historyLoading,r)}
      <section class="sov-scan">
        <h2 class="sov-visually-hidden">Installation health</h2>
        ${bs(a)}
      </section>
      ${Rs(t)}
      ${A(o.widgetStatus)}
      ${!t.consumption&&!((f=t.chargers)!=null&&f.length)?Ts("No data received yet","No consumption snapshot and no chargers yet. Possible causes: no devices connected, wrong time range, or a data pipeline issue.","Open diagnostics",o.onOpenDiagnostics):n`
            <div class="sov-widget-grid">
              ${g.map(v=>n`<section
                  class="sov-widget"
                  draggable="true"
                  data-widget-id=${v}
                  @dragstart=${h=>{var m;return(m=h.dataTransfer)==null?void 0:m.setData("text/plain",v)}}
                  @dragover=${h=>{var m,p;h.preventDefault(),(p=(m=h.currentTarget)==null?void 0:m.classList)==null||p.add("sov-widget--drop-target")}}
                  @dragleave=${h=>{var m,p;return(p=(m=h.currentTarget)==null?void 0:m.classList)==null?void 0:p.remove("sov-widget--drop-target")}}
                  @drop=${h=>{var k,w,E;h.preventDefault();const m=((k=h.dataTransfer)==null?void 0:k.getData("text/plain"))||"",p=v;if(!ye.includes(m)||m===p)return;const b=[...g],_=b.indexOf(m),$=b.indexOf(p);_<0||$<0||(b.splice(_,1),b.splice($,0,m),o.onLayoutReorder(b),(E=(w=h.currentTarget)==null?void 0:w.classList)==null||E.remove("sov-widget--drop-target"))}}
                >
                  <header class="sov-widget-head">
                    <span class="sov-widget-handle" title="Drag to reorder">::</span>
                  </header>
                  ${u[v]}
                </section>`)}
            </div>
          `}
    </div>
  `}const Ds=Ge`
  .sov-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .sov-widget-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px 12px;
    padding: 10px 12px;
    margin-bottom: 0;
  }
  .sov-widget-toolbar label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .sov-widget-grid {
    display: grid;
    gap: 14px;
  }
  .sov-widget {
    border: 1px dashed color-mix(in srgb, var(--divider-color) 75%, transparent);
    border-radius: 12px;
    padding: 10px;
    transition: border-color 0.2s ease;
  }
  .sov-widget--drop-target {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .sov-widget-head {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }
  .sov-widget-handle {
    font-size: 12px;
    color: var(--secondary-text-color);
    user-select: none;
    cursor: grab;
  }
  .sov-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  .sov-h2 {
    margin: 0 0 10px;
    font-size: 1.05rem;
    font-weight: 600;
  }
  .sov-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .sov-health-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    border: 1px solid var(--divider-color);
    position: sticky;
    top: 0;
    z-index: 3;
    backdrop-filter: blur(6px);
  }
  .sov-health-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
  .sov-health-label {
    color: var(--secondary-text-color);
    font-size: 12px;
  }
  .sov-health-warn {
    color: var(--warning-color, #b35900);
  }
  .sov-shimmer {
    animation: sov-pulse 1.2s ease-in-out infinite;
  }
  @keyframes sov-pulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }
  .sov-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .sov-badge--live {
    background: color-mix(in srgb, var(--success-color, #2e7d32) 22%, transparent);
    color: var(--success-color, #1b5e20);
  }
  .sov-badge--calculated {
    background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    color: var(--primary-color);
  }
  .sov-badge--config {
    background: color-mix(in srgb, var(--secondary-text-color) 15%, transparent);
    color: var(--secondary-text-color);
  }
  .sov-scan {
    margin-bottom: 4px;
  }
  .sov-anomalies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .sov-anomalies--ok {
    padding: 4px 0;
  }
  .sov-anomaly {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sov-anomaly--ok {
    background: color-mix(in srgb, var(--success-color, #2e7d32) 15%, transparent);
    color: var(--success-color, #1b5e20);
  }
  .sov-anomaly--error {
    background: color-mix(in srgb, var(--error-color) 22%, transparent);
    color: var(--error-color);
  }
  .sov-anomaly--warn {
    background: color-mix(in srgb, var(--warning-color) 25%, transparent);
    color: var(--primary-text-color);
  }
  .sov-anomaly--info {
    background: var(--disabled-color);
    color: var(--primary-text-color);
  }
  .sov-flow-kpi-wrap {
    display: grid;
    grid-template-columns: minmax(260px, 0.9fr) minmax(300px, 1.4fr);
    gap: 12px;
    align-items: start;
  }
  .sov-root--narrow .sov-flow-kpi-wrap {
    grid-template-columns: 1fr;
  }
  .sov-flow-schematic {
    margin-bottom: 0;
  }
  .sov-flow-card--empty {
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sov-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .sov-root--narrow .sov-kpi-grid {
    grid-template-columns: 1fr;
  }
  .sov-kpi .kpi-v {
    font-size: 1.2rem;
  }
  .sov-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-wrap: wrap;
  }
  .sov-spark-skel {
    height: 36px;
    width: 100%;
    max-width: 140px;
    border-radius: 6px;
  }
  .sov-insights {
    margin-top: 4px;
  }
  .sov-insight-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .sov-root--narrow .sov-insight-grid {
    grid-template-columns: 1fr;
  }
  .sov-insight {
    margin-bottom: 0;
    transition: opacity 0.18s ease;
  }
  .sov-insight-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 6px;
  }
  .sov-insight-cat {
    align-self: flex-start;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    padding: 2px 8px;
  }
  .sov-insight-title {
    font-weight: 600;
    font-size: 14px;
  }
  .sov-insight-body {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
  }
  .sov-insight-savings {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.4;
  }
  .sov-insight--warn {
    border-left: 3px solid var(--warning-color);
  }
  .sov-insight--info {
    border-left: 3px solid var(--primary-color);
  }
  .sov-econ-hero {
    margin-bottom: 0;
  }
  .sov-econ-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  .sov-econ-primary {
    grid-column: span 2;
  }
  .sov-root--narrow .sov-econ-primary {
    grid-column: span 1;
  }
  .sov-econ-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .sov-econ-label {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .sov-econ-big {
    font-size: 1.75rem;
    line-height: 1.2;
  }
  .sov-econ-big strong {
    font-weight: 700;
  }
  .sov-econ-sub {
    display: block;
    font-size: 13px;
    margin-top: 6px;
  }
  .sov-footnote {
    margin: 10px 0 0;
  }
  .sov-charger-section {
    margin-top: 4px;
  }
  .sov-charger-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .sov-charger-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }
  .sov-charger-card {
    margin-bottom: 0;
  }
  .sov-charger-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
  .sov-connector-quick {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--divider-color);
  }
  .sov-conn-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .sov-pause-box {
    margin: 10px 0;
    padding: 10px 12px;
  }
  .sov-pause-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .sov-limit-chain {
    margin-top: 10px;
    padding: 10px;
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
  }
  .sov-limit-chain-h {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .sov-limit-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
  }
  .sov-limit-list li {
    margin-bottom: 6px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    align-items: baseline;
  }
  .sov-root--narrow .sov-limit-list li {
    grid-template-columns: 1fr;
  }
  .sov-limit-label {
    color: var(--secondary-text-color);
  }
  .sov-src {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .sov-src--live {
    background: color-mix(in srgb, var(--success-color) 18%, transparent);
  }
  .sov-src--config {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
  }
  .sov-src--estimated {
    background: color-mix(in srgb, var(--warning-color) 20%, transparent);
  }
  .sov-empty {
    padding: 32px 20px;
    text-align: center;
    border-radius: 12px;
    border: 1px dashed var(--divider-color);
  }
  .sov-empty-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  .sov-empty-body {
    margin: 0 0 16px;
  }

  .sov-status-strip {
    margin-bottom: 4px;
  }
  .sov-status-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .sov-op-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.06));
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }
  .sov-op-badge--on {
    border-color: transparent;
  }
  .sov-op-badge--ok.sov-op-badge--on {
    background: color-mix(in srgb, var(--success-color, #2e7d32) 22%, transparent);
    color: var(--success-color, #1b5e20);
  }
  .sov-op-badge--warn.sov-op-badge--on {
    background: color-mix(in srgb, var(--warning-color) 24%, transparent);
    color: var(--primary-text-color);
  }
  .sov-op-badge--info.sov-op-badge--on {
    background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    color: var(--primary-color);
  }

  .sov-smart-flow {
    margin-bottom: 0;
  }
  .sov-smart-flow--empty {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .sov-sf-hint {
    margin: 0 0 16px;
  }
  .sov-sf-diagram {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .sov-sf-row {
    display: grid;
    grid-template-columns: 1fr auto 1.2fr auto 1fr;
    align-items: center;
    gap: 8px;
  }
  .sov-sf-row--bot {
    grid-template-columns: 1fr auto 0.2fr auto 1fr;
  }
  .sov-sf-spacer {
    min-width: 8px;
  }
  .sov-sf-node {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .sov-sf-node {
      transition: none;
    }
  }
  .sov-sf-node:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
  .sov-sf-node-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    font-weight: 600;
  }
  .sov-sf-node-val {
    font-size: 1.35rem;
    font-weight: 700;
  }
  .sov-sf-node-sub {
    font-size: 11px;
  }
  .sov-sf-node--solar {
    border-color: color-mix(in srgb, var(--success-color, #2e7d32) 35%, var(--divider-color));
  }
  .sov-sf-node--grid {
    border-color: color-mix(in srgb, var(--warning-color) 35%, var(--divider-color));
  }
  .sov-sf-node--home {
    border-color: color-mix(in srgb, var(--primary-color) 30%, var(--divider-color));
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .sov-sf-node--battery {
    border-color: color-mix(in srgb, var(--primary-color) 20%, var(--divider-color));
  }
  .sov-sf-node--ev {
    border-color: color-mix(in srgb, var(--primary-color) 40%, var(--divider-color));
  }
  .sov-sf-connector {
    height: 3px;
    min-width: 24px;
    border-radius: 2px;
    opacity: 0.85;
    transition: opacity 0.2s ease;
  }
  .sov-sf-connector--solar {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--success-color) 55%, transparent),
      var(--divider-color)
    );
  }
  .sov-sf-connector--grid-in {
    background: linear-gradient(
      90deg,
      var(--divider-color),
      color-mix(in srgb, var(--warning-color) 50%, transparent)
    );
  }
  .sov-sf-connector--bat {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--primary-color) 40%, transparent),
      var(--divider-color)
    );
  }
  .sov-sf-connector--ev {
    background: linear-gradient(
      90deg,
      var(--divider-color),
      color-mix(in srgb, var(--primary-color) 45%, transparent)
    );
  }

  .sov-overview-main-grid {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.25fr);
    gap: 16px;
    align-items: start;
  }
  .sov-root--narrow .sov-overview-main-grid {
    grid-template-columns: 1fr;
  }
  .sov-kpi-premium-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .sov-root--narrow .sov-kpi-premium-grid {
    grid-template-columns: 1fr;
  }
  .sov-kpi-premium {
    margin-bottom: 0;
    transition: box-shadow 0.2s ease;
  }
  .sov-kpi-premium:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  }
  .sov-kpi-premium-val {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.15;
  }
  .sov-kpi-spark {
    min-height: 38px;
  }
  .sov-kpi-premium--full {
    grid-column: span 1;
  }

  .sov-econ-compact {
    margin-bottom: 0;
  }
  .sov-econ-compact-inner {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    align-items: start;
  }
  .sov-econ-compact-stat strong {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .sov-charge-reason {
    margin: 8px 0 10px;
    padding: 8px 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    border: 1px solid var(--divider-color);
    font-size: 13px;
  }
  .sov-charge-reason-label {
    font-weight: 600;
  }
  .sov-current-slider-row {
    display: grid;
    grid-template-columns: 1fr 4fr auto;
    gap: 10px;
    align-items: center;
    margin-top: 10px;
  }
  .sov-root--narrow .sov-current-slider-row {
    grid-template-columns: 1fr;
  }
  .sov-slider-label {
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .sov-current-slider-row input[type="range"] {
    width: 100%;
  }
`;function Us(){return n`
    <div class="skel-layout">
      <div class="skel skel-line skel-title"></div>
      <div class="skel skel-line" style="width:60%"></div>
      <div class="skel-grid">
        ${[1,2,3,4].map(()=>n`<div class="skel skel-card"></div>`)}
      </div>
    </div>
  `}function js(t){if(t.cost_api_amount==null)return"—";const e=t.cost_api_currency??"";return`${t.cost_api_amount.toFixed(2)} ${e}`.trim()}function Ws(t){if(t==null||!Number.isFinite(t)||t<=0)return"—";const e=Math.floor(t/3600),s=Math.floor(t%3600/60);return e>0?`${e}h ${s}m`:`${s}m`}function Hs(t){return t?t.slice(0,10):"unknown"}function Bs(t,e,s){const o=s==="asc"?1:-1;return[...t].sort((r,a)=>{let i=0,l=0;switch(e){case"start":i=r.start?new Date(r.start).getTime():0,l=a.start?new Date(a.start).getTime():0;break;case"energy":i=r.energy_wh??0,l=a.energy_wh??0;break;case"cost":i=r.cost_estimate??0,l=a.cost_estimate??0;break;case"cost_api":i=r.cost_api_amount??0,l=a.cost_api_amount??0;break;case"reimb":i=r.reimbursement_estimate??0,l=a.reimbursement_estimate??0;break;case"solar":i=r.solar_share_pct??0,l=a.solar_share_pct??0;break;case"savings":i=r.solar_savings_estimate??0,l=a.solar_savings_estimate??0;break;case"duration":i=r.duration_s??0,l=a.duration_s??0;break;default:i=String(r.id),l=String(a.id)}return i<l?-1*o:i>l?1*o:0})}const fe=12;function Fs(t,e,s,o,r,a,i,l,c){var m;let d=et(t,e);d=Bs(d,s.column,s.dir);const g=t.chargers??[],u=p=>a(p),f=(((m=t.sessions_enriched)==null?void 0:m.length)??0)||t.sessions_active.length+t.sessions_recent.length;let v;if(o.groupByDay){const p=new Map;for(const b of d){const _=Hs(b.start??void 0),$=p.get(_)??[];$.push(b),p.set(_,$)}v=[...p.entries()].sort(([b],[_])=>_.localeCompare(b)).map(([b,_])=>({key:b,label:b==="unknown"?"Unknown date":b,rows:_}))}else v=[{key:"all",label:"",rows:d}];const h=p=>{var _,$;const b=o.expandedRowId===p.id;return n`
      <tr
        class="sess-row ${b?"sess-row--open":""}"
        @click=${()=>o.onToggleExpand(b?null:p.id)}
      >
        <td>${((_=p.start)==null?void 0:_.replace("T"," ").slice(0,19))??"—"}</td>
        <td>${Ws(p.duration_s??void 0)}</td>
        <td class="mono">${p.charger_serial.slice(0,8)}…</td>
        <td>${p.energy_wh!=null?(p.energy_wh/1e3).toFixed(2):"—"}</td>
        <td>${js(p)}</td>
        <td>${p.cost_estimate??"—"}</td>
        <td>${p.reimbursement_estimate??"—"}</td>
        <td>${p.solar_share_pct??"—"}</td>
        <td>${p.solar_savings_estimate??"—"}</td>
        <td>
          ${p.user_display??p.user_label??p.user_id??"—"}${p.card_label?n`<br /><span class="muted mono small">${p.card_label}</span>`:""}
        </td>
        <td>${p.effective_mode??p.status}</td>
        <td class="muted small">${b?"▼":"▶"}</td>
      </tr>
      ${b?n`
            <tr class="sess-detail-row">
              <td colspan=${fe}>
                <div class="sess-detail card-inner">
                  <div class="mono small">Session ${p.id}</div>
                  <div class="mono small">Charger ${p.charger_serial}</div>
                  <p class="small">
                    End:
                    ${(($=p.end)==null?void 0:$.replace("T"," ").slice(0,19))??"—"} · Tariff
                    id: ${p.tariff_id??"—"}
                  </p>
                </div>
              </td>
            </tr>
          `:""}
    `};return n`
    ${A(l)}
    ${t.api_partial?n`<div class="banner">
          Session list may be incomplete (partial API data).
        </div>`:""}
    <p class="muted small">
      Showing ${d.length} of ${f} session(s) in this payload.
    </p>
    <div class="sessions-toolbar card">
      <p class="muted small">Active range: ${c}</p>
      <div class="toolbar-row">
        <label class="sess-toggle">
          <input
            type="checkbox"
            ?checked=${o.groupByDay}
            @change=${p=>o.onToggleGroupByDay(p.target.checked)}
          />
          Group by day
        </label>
        <label>
          Charger
          <select
            @change=${p=>r({chargerSerial:p.target.value||void 0})}
          >
            <option value="">All</option>
            ${g.map(p=>n`<option
                  value=${p.serial}
                  ?selected=${e.chargerSerial===p.serial}
                >
                  ${p.name}
                </option>`)}
          </select>
        </label>
        <label>
          User / ID
          <input
            type="search"
            placeholder="Filter…"
            .value=${e.userQuery??""}
            @input=${p=>r({userQuery:p.target.value})}
          />
        </label>
        <label>
          Mode
          <select
            @change=${p=>r({mode:p.target.value||void 0})}
          >
            <option value="">All</option>
            <option value="charging">charging</option>
            <option value="paused">paused</option>
            <option value="ended">ended</option>
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            .value=${e.periodStart??""}
            @change=${p=>r({periodStart:p.target.value||void 0})}
          />
        </label>
        <label>
          To
          <input
            type="date"
            .value=${e.periodEnd??""}
            @change=${p=>r({periodEnd:p.target.value||void 0})}
          />
        </label>
      </div>
      <button
        type="button"
        class="btn secondary"
        @click=${()=>r({chargerSerial:void 0,userQuery:void 0,mode:void 0,periodStart:void 0,periodEnd:void 0})}
      >
        Clear filters
      </button>
      <button
        type="button"
        class="btn secondary"
        disabled
        title="Coming soon"
        @click=${i}
      >
        Export CSV (soon)
      </button>
    </div>
    <div class="table-wrap card">
      <table class="data-table data-table--sessions">
        <thead>
          <tr>
            <th @click=${()=>u("start")}>
              Start
              ${s.column==="start"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("duration")}>
              Duration
              ${s.column==="duration"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th>Charger</th>
            <th @click=${()=>u("energy")}>
              kWh
              ${s.column==="energy"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("cost_api")}>
              Cost (API)
              ${s.column==="cost_api"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("cost")}>
              Cost est.
              ${s.column==="cost"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("reimb")}>
              Reimb. est.
              ${s.column==="reimb"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("solar")}>
              Solar %
              ${s.column==="solar"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>u("savings")}>
              Savings est.
              ${s.column==="savings"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th>User / card</th>
            <th>Mode</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${d.length===0?n`<tr>
                <td colspan=${fe}>${tt("error_no_data_range")}</td>
              </tr>`:v.flatMap(p=>[p.label?n`
                      <tr class="sess-group-head">
                        <td colspan=${fe}>
                          <strong>${p.label}</strong>
                          · ${p.rows.length} session(s) ·
                          ${p.rows.reduce((b,_)=>b+(_.energy_wh??0),0)/1e3} kWh
                        </td>
                      </tr>
                    `:n``,...p.rows.map(b=>h(b))])}
        </tbody>
      </table>
    </div>
  `}var Vs=Object.defineProperty,Js=Object.getOwnPropertyDescriptor,Z=(t,e,s,o)=>{for(var r=o>1?void 0:o?Js(e,s):e,a=t.length-1,i;a>=0;a--)(i=t[a])&&(r=(o?i(e,s,r):i(r))||r);return o&&r&&Vs(e,s,r),r};const Gs=[{id:"overview",label:"Overview"},{id:"chargers",label:"Chargers"},{id:"sessions",label:"Sessions"},{id:"economics",label:"Economics"},{id:"diagnostics",label:"Diagnostics"}],qs=[{id:"live",label:"Live"},{id:"5m",label:"5m"},{id:"1h",label:"1h"},{id:"24h",label:"24h"}];let D=class extends G{constructor(){super(...arguments),this.narrow=!1,this._tick=0,this._store=Ue(""),this._socketOpenHandler=()=>{this._loadPanel(!1)}}connectedCallback(){var s,o,r,a;super.connectedCallback();const t=((o=(s=this.panel)==null?void 0:s.config)==null?void 0:o.config_entry_id)??"";this._store=Ue(t),t&&!this._store.getState().selectedEntryId&&this._store.setState({selectedEntryId:t}),this._unsub=this._store.subscribe(()=>{this._tick++,this.requestUpdate()});const e=(r=this.hass)==null?void 0:r.connection.socket;(a=e==null?void 0:e.addEventListener)==null||a.call(e,"open",this._socketOpenHandler),this._bootstrap()}disconnectedCallback(){var e,s,o;super.disconnectedCallback(),(e=this._unsub)==null||e.call(this);const t=(s=this.hass)==null?void 0:s.connection.socket;(o=t==null?void 0:t.removeEventListener)==null||o.call(t,"open",this._socketOpenHandler)}updated(t){super.updated(t),t.has("hass")&&this.hass&&this._bootstrap()}get _entryId(){var t,e;return((e=(t=this.panel)==null?void 0:t.config)==null?void 0:e.config_entry_id)??""}async _bootstrap(){var t,e,s;if(!(!this.hass||!this._entryId))try{const o=await Tt(this.hass);let a=this._store.getState().selectedEntryId;o.some(i=>i.entry_id===a)||(a=((t=o[0])==null?void 0:t.entry_id)??this._entryId),this._store.setState({entries:o.map(i=>({entry_id:i.entry_id,title:i.title})),selectedEntryId:a}),this._store.persistEntry(a),await this._loadPanel(!0)}catch(o){this._store.setState({entries:[{entry_id:this._entryId,title:((s=(e=this.panel)==null?void 0:e.config)==null?void 0:s.title)??"Smappee"}],selectedEntryId:this._store.getState().selectedEntryId||this._entryId}),await this._loadPanel(!0),this._store.setState({panelError:o instanceof Error?`Installations list failed: ${o.message}`:String(o)})}}async _loadPanel(t){if(!this.hass)return;const{selectedEntryId:e}=this._store.getState();if(e){this._store.setState({connection:"loading",panelError:null});try{const s=await Ot(this.hass,e,this._store.getState().advancedMode,this._store.getState().debugMode);this._store.setState({panel:s,connection:"connected",panelError:null,lastFetchAt:Date.now(),tabError:null}),this._loadHistory(s)}catch(s){this._store.setState({connection:"error",panelError:s instanceof Error?s.message:String(s)})}}}async _loadHistory(t){var o;if(!((o=this.hass)!=null&&o.callWS))return;const e=t.entity_map;if(!e)return;const s=Object.values(e).filter(r=>!!r);if(s.length){this._store.setState({historyLoading:!0});try{const r=this._store.getState().timePreset,a=r==="5m"?5:r==="1h"?60:r==="24h"?24*60:5,i=await It(this.hass,s,48,a);this._store.setState({historyByEntity:i,historyLoading:!1})}catch{this._store.setState({historyLoading:!1})}}}async _onRefresh(){const t=this._store.getState().selectedEntryId;if(!(!this.hass||!t)){try{await this.hass.callService("ha_smappee_overview","refresh",{config_entry_id:t})}catch{}await this._loadPanel(!1)}}_renderTab(t){const e=this._store.getState(),s=e.selectedEntryId,o=this.hass;try{switch(e.activeTab){case"overview":return Ls(t,e.historyByEntity,t.entity_map,{connection:e.connection,historyLoading:e.historyLoading,narrow:this.narrow,hass:o,entryId:s,afterAction:()=>void this._loadPanel(!1),onOpenChargersTab:()=>this._store.setState({activeTab:"chargers"}),onOpenDiagnostics:()=>this._store.setState({activeTab:"diagnostics"}),widgetStatus:P(t,"device"),loading:e.connection==="loading",layoutTemplate:e.overviewTemplate,layoutOrder:e.overviewOrder,onTemplateChange:r=>this._store.persistOverviewLayout(r,e.overviewOrder),onLayoutReorder:r=>this._store.persistOverviewLayout(e.overviewTemplate,r)});case"devices":return Yt(t,P(t,"protocol"),e.connection==="loading");case"chargers":return Ft(t,o,s,()=>void this._loadPanel(!1),P(t,"device"),e.connection==="loading");case"sessions":return Fs(t,e.sessionsFilters,e.sessionsSort,{groupByDay:e.sessionsGroupByDay,expandedRowId:e.sessionsExpandedRowId,onToggleGroupByDay:r=>this._store.setState({sessionsGroupByDay:r}),onToggleExpand:r=>this._store.setState({sessionsExpandedRowId:r})},r=>this._store.setState({sessionsFilters:{...e.sessionsFilters,...r}}),r=>{const a=e.sessionsSort.column===r;this._store.setState({sessionsSort:{column:r,dir:a&&e.sessionsSort.dir==="desc"?"asc":"desc"}})},()=>{},P(t,"protocol"),e.timePreset,e.connection==="loading");case"economics":return ts(t,e.economicsPeriod,r=>this._store.setState({economicsPeriod:r}),P(t,"protocol"),e.connection==="loading");case"diagnostics":return Zt(t,P(t,"protocol"),e.connection==="loading");default:return n``}}catch(r){return console.error(r),n`
        <div class="tab-error">
          <p class="banner err">Something went wrong in this tab.</p>
          <button type="button" class="btn" @click=${()=>{this._store.setState({tabError:null}),this._loadPanel(!1)}}>
            Retry
          </button>
        </div>
      `}}render(){var d,g,u,f,v;const t=((g=(d=this.panel)==null?void 0:d.config)==null?void 0:g.title)??"Smappee",e=this._store.getState();if(this._tick,!this._entryId)return n`<div class="wrap">
        <div class="banner err">Missing panel configuration.</div>
      </div>`;const s=e.panel,o=Dt(s),r=((u=s==null?void 0:s.alerts)==null?void 0:u.length)??0,a=Mt(s,e.connection,e.panelError,e.sessionsFilters),i=((f=s==null?void 0:s.chargers)==null?void 0:f.length)??0,l=(s==null?void 0:s.last_successful_update)!=null?Math.max(0,Math.round((Date.now()-new Date(s.last_successful_update).getTime())/1e3)):null,c=l==null?"n/a":l<30?"high":l<120?"normal":"low";return n`
      <div class="wrap">
        <header class="header">
          <h1>${t}</h1>
          <div class="header-actions">
            <select
              aria-label="Installation"
              .value=${e.selectedEntryId}
              @change=${h=>{const m=h.target.value;this._store.persistEntry(m),this._store.setState({selectedEntryId:m}),this._loadPanel(!0)}}
            >
              ${e.entries.length?e.entries.map(h=>n`<option value=${h.entry_id}>${h.title}</option>`):n`<option value=${e.selectedEntryId}>${t}</option>`}
            </select>
            <button type="button" class="btn secondary" @click=${()=>void this._onRefresh()}>
              Refresh
            </button>
            <span
              class="pill ${e.connection==="connected"?"ok":e.connection==="loading"?"load":e.connection==="error"?"err":""}"
            >
              ${e.connection==="connected"?"Connected":e.connection==="loading"?"Loading…":e.connection==="error"?"Error":"Idle"}
            </span>
            ${s!=null&&s.last_successful_update?n`<span class="muted"
                  >Sync ${s.last_successful_update.replace("T"," ").slice(0,19)}Z</span
                >`:""}
            ${r>0?n`<span class="badge-alerts" title="Alerts">${r}</span>`:""}
            <label class="adv-toggle">
              <input
                type="checkbox"
                .checked=${e.advancedMode}
                @change=${h=>{const m=h.target.checked;this._store.persistAdvancedMode(m),this._loadPanel(!0)}}
              />
              Advanced mode
            </label>
            <label class="adv-toggle">
              <input
                type="checkbox"
                .checked=${e.debugMode}
                @change=${h=>{const m=h.target.checked;this._store.persistDebugMode(m),this._loadPanel(!1)}}
              />
              Debug mode
            </label>
          </div>
        </header>
        <div class="status-bar">
          <div class="status-item">
            <strong>System health</strong>
            ${((v=s==null?void 0:s.meta)==null?void 0:v.coordinator_last_update_success)===!1?"Degraded":"Healthy"}
          </div>
          <div class="status-item">
            <strong>Active connections</strong>
            ${i}
          </div>
          <div class="status-item">
            <strong>Data rate</strong>
            ${c}
          </div>
        </div>
        <div class="time-presets" role="group" aria-label="Time controls">
          ${qs.map(h=>n`<button
              type="button"
              class="time-preset-btn ${e.timePreset===h.id?"active":""}"
              @click=${()=>{this._store.setState({timePreset:h.id});const m=this._store.getState().panel;m&&this._loadHistory(m)}}
            >
              ${h.label}
            </button>`)}
          <span class="muted small">Active range: ${e.timePreset}</span>
        </div>
        ${e.panelError&&e.connection==="error"?n`
              <div class="banner err">
                Connection failed: ${e.panelError}
                <button
                  type="button"
                  class="btn secondary"
                  style="margin-left:12px"
                  @click=${()=>void this._loadPanel(!0)}
                >
                  Retry
                </button>
              </div>
            `:x}
        ${o?n`<div class="banner">${o}</div>`:x}
        <nav class="tabs" role="tablist">
          ${Gs.map(h=>n`
              <button
                type="button"
                role="tab"
                class=${e.activeTab===h.id?"active":""}
                aria-selected=${e.activeTab===h.id}
                @click=${()=>this._store.setState({activeTab:h.id})}
              >
                ${h.label}
              </button>
            `)}
        </nav>
        ${a==="loading"&&!s?Us():a==="error_connection"||a==="error_no_data_range"||a==="error_parsing"?tt(a):a==="empty_no_devices"?re():s?n`${A(P(s,"protocol"))}
                    ${this._renderTab(s)}
                    ${e.advancedMode?Qt(s):x}`:re()}
      </div>
    `}};D.styles=[Ge`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 400px;
      box-sizing: border-box;
      padding: 0;
      background: var(--lovelace-background, var(--primary-background-color));
      color: var(--primary-text-color);
      font-family: var(
        --ha-font-family-body,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        sans-serif
      );
      font-size: 14px;
      line-height: 1.45;
    }
    .wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 12px 16px 24px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
    }
    .status-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .status-item {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px 10px;
      background: var(--card-background-color);
    }
    .status-item strong {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .time-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      align-items: center;
    }
    .time-preset-btn {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      padding: 6px 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }
    .time-preset-btn.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      font-weight: 600;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }
    .header h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 600;
      flex: 1 1 200px;
    }
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .pill {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--disabled-color);
    }
    .pill.ok {
      background: color-mix(in srgb, var(--success-color, #418041) 25%, transparent);
      color: var(--success-color, #2e7d32);
    }
    .pill.err {
      background: color-mix(in srgb, var(--error-color) 20%, transparent);
      color: var(--error-color);
    }
    .pill.load {
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
    }
    select,
    input[type="number"],
    input[type="search"],
    input[type="date"] {
      background: var(--card-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 14px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      font-size: 14px;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn.secondary {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color);
    }
    .badge-alerts {
      background: var(--warning-color);
      color: #000;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .small {
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      margin-right: 4px;
      vertical-align: middle;
    }
    .mono.small {
      font-size: 11px;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 16px;
    }
    .tabs button {
      padding: 10px 16px;
      border: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .tabs button.active {
      background: var(--card-background-color);
      color: var(--primary-color);
      font-weight: 600;
    }
    .banner {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 12px;
      background: color-mix(in srgb, var(--warning-color) 22%, transparent);
      color: var(--primary-text-color);
    }
    .banner.err {
      background: color-mix(in srgb, var(--error-color) 18%, transparent);
    }
    .tab-error {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 12px;
    }
    .card {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: var(
        --ha-card-box-shadow,
        0 1px 3px rgba(0, 0, 0, 0.08)
      );
    }
    .card-h {
      margin: 0 0 8px;
      font-size: 1rem;
    }
    .muted {
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .mono {
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
    .flow-row {
      margin-bottom: 12px;
    }
    .flow-schematic .flow-title {
      font-weight: 600;
      margin-bottom: 12px;
    }
    .flow-nodes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }
    .flow-node {
      padding: 10px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .flow-label {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .kpi .kpi-h {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 0 0 4px;
    }
    .kpi .kpi-v {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .spark-svg {
      display: block;
    }
    .spark-empty {
      font-size: 11px;
      color: var(--secondary-text-color);
      min-height: 36px;
      line-height: 36px;
    }
    .row-2 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .charger-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .charger-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .charger-head h3 {
      margin: 0;
    }
    .chip {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .chip.ok {
      background: color-mix(in srgb, var(--success-color, #418041) 20%, transparent);
    }
    .chip.off {
      background: var(--disabled-color);
    }
    .lb-row {
      margin: 8px 0;
      font-size: 13px;
    }
    .connector-block {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
    }
    .conn-title {
      margin-bottom: 8px;
    }
    .conn-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .exp-expl-wrap {
      margin: 8px 0;
    }
    .exp-badge {
      cursor: help;
      font-weight: 500;
    }
    .exp-badge--warn {
      background: color-mix(
        in srgb,
        var(--warning-color, #b85c00) 22%,
        transparent
      );
    }
    .exp-badge--info {
      background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    }
    .exp-badge--neutral {
      background: var(--disabled-color);
    }
    .exp-details {
      margin-top: 6px;
    }
    .exp-details summary {
      cursor: pointer;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .exp-expl-msg {
      margin: 8px 0 0;
    }
    .exp-suggest-h,
    .exp-chain-h {
      font-size: 12px;
      font-weight: 600;
      margin: 10px 0 4px;
      color: var(--secondary-text-color);
    }
    .exp-suggest {
      margin: 0 0 8px;
      padding-left: 20px;
      font-size: 13px;
    }
    .exp-chain-list {
      margin: 0 0 8px;
      padding-left: 20px;
      font-size: 13px;
    }
    .exp-chain-li {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 4px;
    }
    .exp-chain-label {
      color: var(--primary-text-color);
    }
    .exp-chain-src {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .exp-json {
      margin-top: 8px;
    }
    .live {
      color: var(--success-color, #2e7d32);
      font-weight: 600;
      margin-left: 8px;
    }
    .session-mini {
      margin-bottom: 8px;
      padding: 8px;
      font-size: 13px;
    }
    .card-inner {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      border-radius: 8px;
    }
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .mode-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .sessions-toolbar {
      margin-bottom: 12px;
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
      align-items: flex-end;
    }
    .toolbar-row label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .data-table th,
    .data-table td {
      text-align: left;
      padding: 8px 10px;
      border-bottom: 1px solid var(--divider-color);
    }
    .data-table th {
      cursor: pointer;
      user-select: none;
      color: var(--secondary-text-color);
      font-weight: 600;
    }
    .table-wrap {
      overflow-x: auto;
    }
    .advanced-region {
      margin-top: 20px;
      border-left: 3px solid var(--warning-color);
      padding-left: 12px;
    }
    .adv-details {
      margin-top: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-details summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .adv-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .adv-table td {
      padding: 4px 8px 4px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-hint {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
    }
    .adv-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      user-select: none;
    }
    .adv-toggle input {
      margin: 0;
    }
    .json-pre {
      overflow: auto;
      max-height: 280px;
      font-size: 11px;
      margin: 0;
    }
    .be-badge.ok {
      border-left: 4px solid var(--success-color, #2e7d32);
    }
    .be-badge.warn {
      border-left: 4px solid var(--warning-color);
    }
    .ok-text {
      color: var(--success-color, #2e7d32);
    }
    .warn-text {
      color: var(--error-color);
    }
    .tariff-list {
      margin: 0;
      padding-left: 20px;
    }
    .ei-title {
      margin-bottom: 4px;
    }
    .ei-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .ei-split-bar {
      display: flex;
      height: 24px;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 8px;
      border: 1px solid var(--divider-color);
    }
    .ei-split-solar {
      height: 100%;
      background: color-mix(
        in srgb,
        var(--success-color, #2e7d32) 55%,
        transparent
      );
    }
    .ei-split-grid {
      height: 100%;
      background: color-mix(
        in srgb,
        var(--primary-color) 35%,
        var(--disabled-color)
      );
    }
    .ei-split-legend {
      margin-top: 8px;
    }
    .ei-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }
    .ei-dot.solar {
      background: var(--success-color, #2e7d32);
    }
    .ei-dot.grid {
      background: var(--primary-color);
    }
    .badge.warn {
      background: color-mix(
        in srgb,
        var(--warning-color) 45%,
        var(--disabled-color)
      );
      color: var(--primary-text-color);
    }
    .ei-svg {
      display: block;
      max-width: 100%;
      height: auto;
      margin-top: 8px;
    }
    .ei-assumptions summary {
      list-style: none;
    }
    .ei-assumptions summary::-webkit-details-marker {
      display: none;
    }
    .skel-layout {
      padding: 8px 0;
    }
    .skel {
      background: linear-gradient(
        90deg,
        var(--divider-color) 25%,
        var(--secondary-background-color) 50%,
        var(--divider-color) 75%
      );
      background-size: 200% 100%;
      animation: skel 1.2s ease-in-out infinite;
      border-radius: 8px;
    }
    @keyframes skel {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    .skel-line {
      height: 16px;
      margin-bottom: 12px;
    }
    .skel-title {
      height: 28px;
      width: 40%;
      margin-bottom: 20px;
    }
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }
    .skel-card {
      height: 120px;
    }
    .sess-toggle {
      flex-direction: row !important;
      align-items: center;
      gap: 8px;
    }
    .sess-row {
      cursor: pointer;
    }
    .sess-row:hover {
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
    }
    .sess-group-head td {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
      font-weight: 600;
      font-size: 13px;
    }
    .sess-detail {
      padding: 12px;
      text-align: left;
    }
    .sess-detail-row td {
      padding-top: 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .econ-period-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .econ-period-tabs button {
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
    }
    .econ-period-tabs button.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      font-weight: 600;
    }
    .econ-hero-line {
      font-size: 1.15rem;
      margin: 12px 0;
    }
    .state-card {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      background: var(--card-background-color);
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .state-card h3 {
      margin: 0 0 8px;
    }
    .state-card-error {
      border-left: 4px solid var(--error-color);
    }
    .state-card-empty {
      border-left: 4px solid var(--primary-color);
    }
    .state-cause-list {
      margin: 4px 0 0;
      padding-left: 18px;
    }
    .widget-status-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    .fresh-pill {
      border-radius: 999px;
      padding: 2px 8px;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .fresh-live {
      background: color-mix(in srgb, var(--success-color, #2e7d32) 20%, transparent);
      color: var(--success-color, #2e7d32);
    }
    .fresh-stale {
      background: color-mix(in srgb, var(--warning-color) 24%, transparent);
    }
    .fresh-offline {
      background: color-mix(in srgb, var(--error-color) 20%, transparent);
      color: var(--error-color);
    }
    .widget-skel {
      margin: 10px 0;
    }
  `,Ds];Z([ie({attribute:!1})],D.prototype,"hass",2);Z([ie({type:Boolean})],D.prototype,"narrow",2);Z([ie({type:Object})],D.prototype,"panel",2);Z([At()],D.prototype,"_tick",2);D=Z([wt("ha-smappee-overview-panel")],D);
