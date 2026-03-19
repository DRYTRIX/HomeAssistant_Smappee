/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W=globalThis,Z=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),se=new WeakMap;let fe=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Z&&e===void 0){const o=t!==void 0&&t.length===1;o&&(e=se.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),o&&se.set(t,e))}return e}toString(){return this.cssText}};const ke=s=>new fe(typeof s=="string"?s:s+"",void 0,Y),be=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((o,r,i)=>o+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[i+1],s[0]);return new fe(t,s,Y)},Se=(s,e)=>{if(Z)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const o=document.createElement("style"),r=W.litNonce;r!==void 0&&o.setAttribute("nonce",r),o.textContent=t.cssText,s.appendChild(o)}},oe=Z?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const o of e.cssRules)t+=o.cssText;return ke(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ae,defineProperty:Ee,getOwnPropertyDescriptor:Ce,getOwnPropertyNames:Pe,getOwnPropertySymbols:Oe,getPrototypeOf:Te}=Object,x=globalThis,re=x.trustedTypes,Ie=re?re.emptyScript:"",J=x.reactiveElementPolyfillSupport,I=(s,e)=>s,j={toAttribute(s,e){switch(e){case Boolean:s=s?Ie:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},X=(s,e)=>!Ae(s,e),ie={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:X};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),x.litPropertyMetadata??(x.litPropertyMetadata=new WeakMap);let C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ie){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const o=Symbol(),r=this.getPropertyDescriptor(e,o,t);r!==void 0&&Ee(this.prototype,e,r)}}static getPropertyDescriptor(e,t,o){const{get:r,set:i}=Ce(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){const d=r==null?void 0:r.call(this);i==null||i.call(this,n),this.requestUpdate(e,d,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ie}static _$Ei(){if(this.hasOwnProperty(I("elementProperties")))return;const e=Te(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(I("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(I("properties"))){const t=this.properties,o=[...Pe(t),...Oe(t)];for(const r of o)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[o,r]of t)this.elementProperties.set(o,r)}this._$Eh=new Map;for(const[t,o]of this.elementProperties){const r=this._$Eu(t,o);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const r of o)t.unshift(oe(r))}else e!==void 0&&t.push(oe(e));return t}static _$Eu(e,t){const o=t.attribute;return o===!1?void 0:typeof o=="string"?o:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const o of t.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Se(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var o;return(o=t.hostConnected)==null?void 0:o.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var o;return(o=t.hostDisconnected)==null?void 0:o.call(t)})}attributeChangedCallback(e,t,o){this._$AK(e,o)}_$ET(e,t){var i;const o=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,o);if(r!==void 0&&o.reflect===!0){const n=(((i=o.converter)==null?void 0:i.toAttribute)!==void 0?o.converter:j).toAttribute(t,o.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){var i,n;const o=this.constructor,r=o._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const d=o.getPropertyOptions(r),a=typeof d.converter=="function"?{fromAttribute:d.converter}:((i=d.converter)==null?void 0:i.fromAttribute)!==void 0?d.converter:j;this._$Em=r;const l=a.fromAttribute(t,d.type);this[r]=l??((n=this._$Ej)==null?void 0:n.get(r))??l,this._$Em=null}}requestUpdate(e,t,o,r=!1,i){var n;if(e!==void 0){const d=this.constructor;if(r===!1&&(i=this[e]),o??(o=d.getPropertyOptions(e)),!((o.hasChanged??X)(i,t)||o.useDefault&&o.reflect&&i===((n=this._$Ej)==null?void 0:n.get(e))&&!this.hasAttribute(d._$Eu(e,o))))return;this.C(e,t,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:o,reflect:r,wrapped:i},n){o&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||o||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var o;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,n]of r){const{wrapped:d}=n,a=this[i];d!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,n,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(o=this._$EO)==null||o.forEach(r=>{var i;return(i=r.hostUpdate)==null?void 0:i.call(r)}),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(o=>{var r;return(r=o.hostUpdated)==null?void 0:r.call(o)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[I("elementProperties")]=new Map,C[I("finalized")]=new Map,J==null||J({ReactiveElement:C}),(x.reactiveElementVersions??(x.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const N=globalThis,ne=s=>s,B=N.trustedTypes,ae=B?B.createPolicy("lit-html",{createHTML:s=>s}):void 0,_e="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+$,Ne=`<${ye}>`,A=document,U=()=>A.createComment(""),L=s=>s===null||typeof s!="object"&&typeof s!="function",ee=Array.isArray,ze=s=>ee(s)||typeof(s==null?void 0:s[Symbol.iterator])=="function",K=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,le=/-->/g,ce=/>/g,w=RegExp(`>|${K}(?:([^\\s"'>=/]+)(${K}*=${K}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),de=/'/g,pe=/"/g,$e=/^(?:script|style|textarea|title)$/i,Ue=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),c=Ue(1),P=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),he=new WeakMap,k=A.createTreeWalker(A,129);function xe(s,e){if(!ee(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ae!==void 0?ae.createHTML(e):e}const Le=(s,e)=>{const t=s.length-1,o=[];let r,i=e===2?"<svg>":e===3?"<math>":"",n=T;for(let d=0;d<t;d++){const a=s[d];let l,h,p=-1,u=0;for(;u<a.length&&(n.lastIndex=u,h=n.exec(a),h!==null);)u=n.lastIndex,n===T?h[1]==="!--"?n=le:h[1]!==void 0?n=ce:h[2]!==void 0?($e.test(h[2])&&(r=RegExp("</"+h[2],"g")),n=w):h[3]!==void 0&&(n=w):n===w?h[0]===">"?(n=r??T,p=-1):h[1]===void 0?p=-2:(p=n.lastIndex-h[2].length,l=h[1],n=h[3]===void 0?w:h[3]==='"'?pe:de):n===pe||n===de?n=w:n===le||n===ce?n=T:(n=w,r=void 0);const v=n===w&&s[d+1].startsWith("/>")?" ":"";i+=n===T?a+Ne:p>=0?(o.push(l),a.slice(0,p)+_e+a.slice(p)+$+v):a+$+(p===-2?d:v)}return[xe(s,i+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),o]};class R{constructor({strings:e,_$litType$:t},o){let r;this.parts=[];let i=0,n=0;const d=e.length-1,a=this.parts,[l,h]=Le(e,t);if(this.el=R.createElement(l,o),k.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=k.nextNode())!==null&&a.length<d;){if(r.nodeType===1){if(r.hasAttributes())for(const p of r.getAttributeNames())if(p.endsWith(_e)){const u=h[n++],v=r.getAttribute(p).split($),g=/([.?@])?(.*)/.exec(u);a.push({type:1,index:i,name:g[2],strings:v,ctor:g[1]==="."?He:g[1]==="?"?Me:g[1]==="@"?De:F}),r.removeAttribute(p)}else p.startsWith($)&&(a.push({type:6,index:i}),r.removeAttribute(p));if($e.test(r.tagName)){const p=r.textContent.split($),u=p.length-1;if(u>0){r.textContent=B?B.emptyScript:"";for(let v=0;v<u;v++)r.append(p[v],U()),k.nextNode(),a.push({type:2,index:++i});r.append(p[u],U())}}}else if(r.nodeType===8)if(r.data===ye)a.push({type:2,index:i});else{let p=-1;for(;(p=r.data.indexOf($,p+1))!==-1;)a.push({type:7,index:i}),p+=$.length-1}i++}}static createElement(e,t){const o=A.createElement("template");return o.innerHTML=e,o}}function O(s,e,t=s,o){var n,d;if(e===P)return e;let r=o!==void 0?(n=t._$Co)==null?void 0:n[o]:t._$Cl;const i=L(e)?void 0:e._$litDirective$;return(r==null?void 0:r.constructor)!==i&&((d=r==null?void 0:r._$AO)==null||d.call(r,!1),i===void 0?r=void 0:(r=new i(s),r._$AT(s,t,o)),o!==void 0?(t._$Co??(t._$Co=[]))[o]=r:t._$Cl=r),r!==void 0&&(e=O(s,r._$AS(s,e.values),r,o)),e}class Re{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:o}=this._$AD,r=((e==null?void 0:e.creationScope)??A).importNode(t,!0);k.currentNode=r;let i=k.nextNode(),n=0,d=0,a=o[0];for(;a!==void 0;){if(n===a.index){let l;a.type===2?l=new H(i,i.nextSibling,this,e):a.type===1?l=new a.ctor(i,a.name,a.strings,this,e):a.type===6&&(l=new We(i,this,e)),this._$AV.push(l),a=o[++d]}n!==(a==null?void 0:a.index)&&(i=k.nextNode(),n++)}return k.currentNode=A,r}p(e){let t=0;for(const o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(e,o,t),t+=o.strings.length-2):o._$AI(e[t])),t++}}class H{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,o,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=o,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),L(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==P&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ze(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){var i;const{values:t,_$litType$:o}=e,r=typeof o=="number"?this._$AC(e):(o.el===void 0&&(o.el=R.createElement(xe(o.h,o.h[0]),this.options)),o);if(((i=this._$AH)==null?void 0:i._$AD)===r)this._$AH.p(t);else{const n=new Re(r,this),d=n.u(this.options);n.p(t),this.T(d),this._$AH=n}}_$AC(e){let t=he.get(e.strings);return t===void 0&&he.set(e.strings,t=new R(e)),t}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let o,r=0;for(const i of e)r===t.length?t.push(o=new H(this.O(U()),this.O(U()),this,this.options)):o=t[r],o._$AI(i),r++;r<t.length&&(this._$AR(o&&o._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var o;for((o=this._$AP)==null?void 0:o.call(this,!1,!0,t);e!==this._$AB;){const r=ne(e).nextSibling;ne(e).remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class F{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,o,r,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=m}_$AI(e,t=this,o,r){const i=this.strings;let n=!1;if(i===void 0)e=O(this,e,t,0),n=!L(e)||e!==this._$AH&&e!==P,n&&(this._$AH=e);else{const d=e;let a,l;for(e=i[0],a=0;a<i.length-1;a++)l=O(this,d[o+a],t,a),l===P&&(l=this._$AH[a]),n||(n=!L(l)||l!==this._$AH[a]),l===m?e=m:e!==m&&(e+=(l??"")+i[a+1]),this._$AH[a]=l}n&&!r&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class He extends F{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class Me extends F{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class De extends F{constructor(e,t,o,r,i){super(e,t,o,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??m)===P)return;const o=this._$AH,r=e===m&&o!==m||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,i=e!==m&&(o===m||r);r&&this.element.removeEventListener(this.name,this,o),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class We{constructor(e,t,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const G=N.litHtmlPolyfillSupport;G==null||G(R,H),(N.litHtmlVersions??(N.litHtmlVersions=[])).push("3.3.2");const je=(s,e,t)=>{const o=(t==null?void 0:t.renderBefore)??e;let r=o._$litPart$;if(r===void 0){const i=(t==null?void 0:t.renderBefore)??null;o._$litPart$=r=new H(e.insertBefore(U(),i),i,void 0,t??{})}return r._$AI(s),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const S=globalThis;class z extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=je(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return P}}var me;z._$litElement$=!0,z.finalized=!0,(me=S.litElementHydrateSupport)==null||me.call(S,{LitElement:z});const Q=S.litElementPolyfillSupport;Q==null||Q({LitElement:z});(S.litElementVersions??(S.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Be=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Fe={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:X},qe=(s=Fe,e,t)=>{const{kind:o,metadata:r}=t;let i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),o==="setter"&&((s=Object.create(s)).wrapped=!0),i.set(t.name,s),o==="accessor"){const{name:n}=t;return{set(d){const a=e.get.call(this);e.set.call(this,d),this.requestUpdate(n,a,s,!0,d)},init(d){return d!==void 0&&this.C(n,void 0,s,d),d}}}if(o==="setter"){const{name:n}=t;return function(d){const a=this[n];e.call(this,d),this.requestUpdate(n,a,s,!0,d)}}throw Error("Unsupported decorator location: "+o)};function q(s){return(e,t)=>typeof t=="object"?qe(s,e,t):((o,r,i)=>{const n=r.hasOwnProperty(i);return r.constructor.createProperty(i,o),n?Object.getOwnPropertyDescriptor(r,i):void 0})(s,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ve(s){return q({...s,state:!0,attribute:!1})}const Je="ha_smappee_overview/get_panel_data",Ke="ha_smappee_overview/list_entries";function Ge(s,e){return typeof s.callWS=="function"?s.callWS(e):s.connection.sendMessagePromise(e)}async function Qe(s){return(await Ge(s,{type:Ke})).entries??[]}async function Ze(s,e){return await s.connection.sendMessagePromise({type:Je,config_entry_id:e})}async function Ye(s,e,t=48){const o=e.filter(Boolean);if(!o.length||typeof s.callWS!="function")return{};const r=new Date,i=new Date(r.getTime()-24*3600*1e3);let n;try{n=await s.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:r.toISOString(),entity_ids:o,minimal_response:!0,no_attributes:!0,significant_changes_only:!0})}catch{return{}}const d={},a=n&&typeof n=="object"&&!Array.isArray(n)?n:{};for(const l of o){const h=a[l];if(!Array.isArray(h))continue;const p=[];for(const g of h){if(!g||typeof g!="object")continue;const f=g,_=f.lu??f.lc,V=(typeof _=="number"?_:0)*1e3,te=parseFloat(String(f.s??""));Number.isFinite(te)&&p.push({t:V,v:te})}if(p.length<=t){d[l]=p;continue}const u=Math.ceil(p.length/t),v=[];for(let g=0;g<p.length;g+=u)v.push(p[g]);d[l]=v}return d}const ue="smappee_panel_entry";function ge(s){let e=s;try{const r=sessionStorage.getItem(ue);r&&(e=r)}catch{}let t={entries:[],selectedEntryId:e||s,activeTab:"overview",panel:null,connection:"idle",panelError:null,tabError:null,historyByEntity:{},historyLoading:!1,lastFetchAt:null,sessionsSort:{column:"start",dir:"desc"},sessionsFilters:{}};const o=new Set;return{getState:()=>t,subscribe:r=>(o.add(r),()=>o.delete(r)),setState:r=>{t={...t,...r},o.forEach(i=>i())},loadStoredEntry:()=>e||s,persistEntry:r=>{try{sessionStorage.setItem(ue,r)}catch{}e=r}}}function we(s){const e=s==null?void 0:s.consumption;return{gridImport:(e==null?void 0:e.grid_import_w)??null,gridExport:(e==null?void 0:e.grid_export_w)??null,solar:(e==null?void 0:e.solar_w)??null,home:(e==null?void 0:e.consumption_w)??null,battery:(e==null?void 0:e.battery_flow_w)??null,batterySoc:(e==null?void 0:e.battery_soc_pct)??null}}function Xe(s){var o;if(!s)return[];if((o=s.sessions_enriched)!=null&&o.length)return s.sessions_enriched;const e=new Set,t=[];for(const r of[...s.sessions_active,...s.sessions_recent])e.has(r.id)||(e.add(r.id),t.push(r));return t}function et(s,e){var o;let t=Xe(s);if(e.chargerSerial&&(t=t.filter(r=>r.charger_serial===e.chargerSerial)),(o=e.userQuery)!=null&&o.trim()){const r=e.userQuery.trim().toLowerCase();t=t.filter(i=>{const n=(i.user_display||i.user_label||i.user_id||"").toLowerCase(),d=(i.card_label||"").toLowerCase();return n.includes(r)||d.includes(r)||i.user_id&&i.user_id.toLowerCase().includes(r)||i.id.toLowerCase().includes(r)})}if(e.mode&&(t=t.filter(r=>(r.effective_mode||r.status||"").toLowerCase()===e.mode.toLowerCase())),e.periodStart){const r=new Date(e.periodStart).getTime();t=t.filter(i=>i.start?new Date(i.start).getTime()>=r:!1)}if(e.periodEnd){const r=new Date(e.periodEnd).getTime();t=t.filter(i=>i.start?new Date(i.start).getTime()<=r:!1)}return t}function tt(s,e){var o;const t=(o=s==null?void 0:s.chargers_extended)==null?void 0:o.find(r=>r.serial===e);return(t==null?void 0:t.load_balance)??{reported:!1,value:null}}function st(s){var e;return((e=s==null?void 0:s.economics)==null?void 0:e.belgium_cap_compliant)??null}function ot(s){var e,t;return s?s.api_partial?"Some data from the Smappee API is partial or failed to load.":(e=s.consumption)!=null&&e.stale?"Live consumption data may be stale.":(t=s.meta)!=null&&t.consumption_stale?"Consumption marked stale by coordinator.":null:null}const rt="ha_smappee_overview";function it(s,e,t,o){var d;const i=[...s.sessions_active,...s.sessions_enriched??[]].filter((a,l,h)=>h.findIndex(p=>p.id===a.id)===l).filter(a=>/charging|started/i.test(a.status||"")),n=async(a,l)=>{try{await e.callService(rt,a,{config_entry_id:t,...l}),o()}catch(h){console.error(h)}};return(d=s.chargers)!=null&&d.length?c`
    <div class="charger-list">
      ${s.chargers.map(a=>{var p;const l=(p=s.charger_features)==null?void 0:p[a.serial],h=tt(s,a.serial);return c`
          <div class="card charger-card">
            <div class="charger-head">
              <h3>${a.name}</h3>
              <span class="chip ${a.availability?"ok":"off"}"
                >${a.availability?"Available":"Unavailable"}</span
              >
            </div>
            <div class="muted mono">${a.serial}</div>
            <div class="lb-row">
              Load balancing:
              ${h.reported?c`<code>${JSON.stringify(h.value)}</code>`:c`<span class="muted">Not reported by API</span>`}
            </div>
            ${a.connectors.map(u=>{const v=i.find(g=>g.charger_serial===a.serial&&g.connector===u.position);return c`
                <div class="connector-block">
                  <div class="conn-title">
                    Connector ${u.position} · mode
                    <strong>${u.mode}</strong>
                    · ${u.current_a??"—"} A
                    ${u.session_active?c`<span class="live">Live</span>`:""}
                  </div>
                  ${v?c`
                        <div class="session-mini card-inner">
                          Session ${v.id.slice(0,8)}… ·
                          ${v.energy_wh!=null?`${(v.energy_wh/1e3).toFixed(2)} kWh`:"—"}
                        </div>
                      `:""}
                  <div class="btn-row">
                    <button
                      type="button"
                      class="btn"
                      @click=${()=>n("start_charging",{charger_serial:a.serial,connector_position:u.position})}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>n("pause_charging",{charger_serial:a.serial,connector_position:u.position})}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>n("stop_charging",{charger_serial:a.serial,connector_position:u.position})}
                    >
                      Stop
                    </button>
                  </div>
                  ${l!=null&&l.supports_smart_mode?c`
                        <div class="mode-row">
                          <label>Mode</label>
                          <select
                            @change=${g=>{const f=g.target;n("set_charging_mode",{charger_serial:a.serial,connector_position:u.position,mode:f.value})}}
                          >
                            <option value="standard">Standard</option>
                            <option value="smart">Smart</option>
                            <option value="solar">Solar</option>
                          </select>
                        </div>
                      `:""}
                  ${l!=null&&l.supports_current_limit?c`
                        <div class="mode-row">
                          <label>Current (A)</label>
                          <input
                            type="number"
                            min="6"
                            max=${l.max_current_a??32}
                            .value=${String(u.current_a??16)}
                            @change=${g=>{const f=g.target,_=parseInt(f.value,10);_>=6&&n("set_charging_current",{charger_serial:a.serial,connector_position:u.position,current_a:_})}}
                          />
                        </div>
                      `:""}
                </div>
              `})}
          </div>
        `})}
    </div>
  `:c`<p class="muted">No chargers discovered.</p>`}function nt(s){var o,r,i,n,d;const e=s.diagnostics,t=s.installation;return c`
    <div class="card">
      <h3 class="card-h">API health</h3>
      <p>Coordinator OK: <strong>${((o=s.meta)==null?void 0:o.coordinator_last_update_success)??"—"}</strong></p>
      <p>Partial API: <strong>${s.api_partial?"yes":"no"}</strong></p>
      <p>Last error: <code>${s.last_error??(e==null?void 0:e.last_error)??"—"}</code></p>
      <p>Update interval: ${((r=s.meta)==null?void 0:r.update_interval_s)??"—"}s</p>
    </div>
    <div class="card">
      <h3 class="card-h">Stale sections</h3>
      ${(i=e==null?void 0:e.stale_sections)!=null&&i.length?c`<ul>${e.stale_sections.map(a=>c`<li>${a}</li>`)}</ul>`:c`<p class="muted">None flagged.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Unsupported / limited features</h3>
      ${(n=e==null?void 0:e.unsupported_connectors)!=null&&n.length?c`<ul>
            ${e.unsupported_connectors.map(a=>{const l=a;return c`<li>${l.charger_serial} #${l.connector}: ${l.reason}</li>`})}
          </ul>`:c`<p class="muted">None listed.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Installation</h3>
      <pre class="json-pre">${JSON.stringify(t,null,2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Installation raw (excerpt)</h3>
      <pre class="json-pre">${JSON.stringify((e==null?void 0:e.installation_raw_excerpt)??{},null,2)}</pre>
    </div>
    ${(d=e==null?void 0:e.session_json_keys_union)!=null&&d.length?c`
          <div class="card">
            <h3 class="card-h">Session JSON keys (debug)</h3>
            <p class="muted small">
              Enable &quot;Debug session JSON keys&quot; in integration options. Union of keys seen in
              recent session payloads.
            </p>
            <pre class="json-pre">${JSON.stringify(e.session_json_keys_union,null,2)}</pre>
          </div>
        `:""}
  `}function at(s){var a,l,h,p,u;const e=((a=s.reimbursement)==null?void 0:a.currency)??"EUR",t=(l=s.reimbursement)==null?void 0:l.belgium_cap,o=(h=s.reimbursement)==null?void 0:h.rate_per_kwh,r=s.economics,i=s.reimbursement_monthly,n=(r==null?void 0:r.reimbursement_history)??[],d=s.country_code==="BE"?c`
          <div
            class="card be-badge ${(r==null?void 0:r.belgium_cap_compliant)===!1?"warn":"ok"}"
          >
            <strong>Belgium cap</strong>
            ${t!=null?c`<p>Cap: ${t} EUR/kWh · Your rate: ${o??"—"} EUR/kWh</p>`:c`<p>Configure cap in integration options.</p>`}
            ${(r==null?void 0:r.belgium_cap_compliant)===!0?c`<p class="ok-text">Rate within cap.</p>`:(r==null?void 0:r.belgium_cap_compliant)===!1?c`<p class="warn-text">Rate exceeds configured cap.</p>`:""}
          </div>
        `:"";return c`
    ${d}
    <div class="card">
      <h3 class="card-h">All tariffs (API)</h3>
      <p class="muted small">
        Session <em>cost estimates</em> use the first tariff only when multiple exist.
      </p>
      ${(()=>{var g,f;const v=(f=(g=s.economics)==null?void 0:g.tariffs_all)!=null&&f.length?s.economics.tariffs_all:s.tariffs??[];return v.length?c`
              <ul class="tariff-list">
                ${v.map((_,V)=>c`
                    <li>
                      ${V===0&&v.length>1?c`<span class="badge">primary (estimates)</span> `:""}
                      <strong>${_.name??_.id}</strong> —
                      ${_.price_per_kwh??"—"} ${_.currency??""} / kWh
                    </li>
                  `)}
              </ul>
            `:c`<p class="muted">No tariff data from API.</p>`})()}
    </div>
    <div class="card row-2">
      <div>
        <h3 class="card-h">Split billing / reimbursement</h3>
        <p>Rate: <strong>${o??"—"}</strong> ${e}/kWh</p>
        <p>
          Today pending: <strong>${((p=r==null?void 0:r.today_pending_eur)==null?void 0:p.toFixed(2))??"—"} ${e}</strong>
          (${((u=r==null?void 0:r.today_kwh)==null?void 0:u.toFixed(2))??"—"} kWh)
        </p>
        <p>
          Month ${i==null?void 0:i.month}: <strong>${(i==null?void 0:i.pending_amount)??"—"} ${e}</strong>
          (${(i==null?void 0:i.total_kwh)??"—"} kWh, ${(i==null?void 0:i.sessions_count)??0} sessions)
        </p>
      </div>
      <div>
        <h3 class="card-h">Reimbursement history</h3>
        ${n.length?c`<ul>${n.map(v=>{const g=v;return c`<li>${g.valid_from}: ${g.rate_per_kwh}</li>`})}</ul>`:c`<p class="muted">No history entries (options-only rate).</p>`}
      </div>
    </div>
  `}function lt(s){const e=[...s.sessions_active,...s.sessions_enriched??[]],t=new Set;for(const o of e)if(!t.has(o.id)&&(t.add(o.id),/charging|started/i.test(o.status||"")))return!0;return!1}function ct(s){const e=[],t=we(s);return t.gridExport!=null&&t.gridExport>400&&!lt(s)&&e.push({id:"export-opportunity",severity:"info",title:"Export opportunity",body:"Significant power is flowing to the grid while no EV session is actively charging. Smart or solar charging modes could use this surplus."}),t.gridImport!=null&&t.gridImport>1500&&(t.solar==null||t.solar<800)&&e.push({id:"peak-grid-draw",severity:"warn",title:"High grid import",body:"Household draw is relying heavily on the grid with limited solar contribution. Consider shifting loads or checking tariff windows."}),t.batterySoc!=null&&t.batterySoc>=88&&t.battery!=null&&t.battery<-200&&t.gridExport!=null&&t.gridExport>300&&e.push({id:"battery-full-export",severity:"info",title:"Battery saturated, exporting",body:"Battery is full or discharging lightly while solar still exports—surplus is leaving to the grid."}),t.solar!=null&&t.solar>2e3&&t.home!=null&&t.home<500&&e.push({id:"solar-surplus",severity:"info",title:"Strong solar harvest",body:"Low home consumption vs solar production—good window for EV charging if you need range."}),e.slice(0,4)}function dt(s){var r,i,n,d;const e=[];s.api_partial&&e.push({id:"api-partial",severity:"warn",label:"Partial API data"}),((r=s.consumption)!=null&&r.stale||(i=s.meta)!=null&&i.consumption_stale)&&e.push({id:"consumption-stale",severity:"warn",label:"Consumption stale"}),(n=s.meta)!=null&&n.coordinator_last_update_success||e.push({id:"coord-fail",severity:"error",label:"Last update failed"});const t=st(s);s.country_code==="BE"&&t===!1&&e.push({id:"be-cap",severity:"error",label:"BE cap exceeded"});const o=((d=s.diagnostics)==null?void 0:d.unsupported_connectors)??[];for(let a=0;a<o.length;a++){const l=o[a];e.push({id:`unsupported-${a}`,severity:"info",label:`Mode unknown · ${l.charger_serial??"?"} #${l.connector??"?"}`})}for(const a of s.alerts??[]){const l=(a.severity||"").toLowerCase()==="error"?"error":(a.severity||"").toLowerCase()==="warning"?"warn":"info";e.push({id:`alert-${a.id}`,severity:l,label:a.message.slice(0,80)+(a.message.length>80?"…":"")})}return e.slice(0,12)}function pt(s){return s.length?c`
    <div class="sov-anomalies">
      ${s.map(e=>c`
          <span class="sov-anomaly sov-anomaly--${e.severity}" title=${e.label}
            >${e.label}</span
          >
        `)}
    </div>
  `:c`
      <div class="sov-anomalies sov-anomalies--ok">
        <span class="sov-anomaly sov-anomaly--ok">No anomalies flagged</span>
      </div>
    `}const ht="ha_smappee_overview";function ut(s,e,t){return s==null?void 0:s.find(o=>o.charger_serial===e&&o.connector===t)}function gt(s){return s==="live"?"Live":s==="config"?"Config":"Est."}function vt(s,e,t,o,r){var d,a;const i=((d=s.overview_context)==null?void 0:d.active_ev_hints)??[],n=async(l,h)=>{try{await e.callService(ht,l,{config_entry_id:t,...h}),o()}catch(p){console.error(p)}};return(a=s.chargers)!=null&&a.length?c`
    <div class="sov-charger-section">
      <div class="sov-charger-head">
        <h2 class="sov-h2">EV quick controls</h2>
        <button
          type="button"
          class="btn secondary sov-link-chargers"
          @click=${r}
        >
          Full controls →
        </button>
      </div>
      <div class="sov-charger-grid">
        ${s.chargers.map(l=>{var p;const h=(p=s.charger_features)==null?void 0:p[l.serial];return c`
            <div class="card sov-charger-card">
              <div class="sov-charger-title-row">
                <strong>${l.name}</strong>
                <span class="chip ${l.availability?"ok":"off"}"
                  >${l.availability?"Available":"Unavailable"}</span
                >
              </div>
              <div class="muted mono small">${l.serial}</div>
              ${l.connectors.map(u=>{const v=ut(i,l.serial,u.position);return c`
                  <div class="sov-connector-quick">
                    <div class="sov-conn-line">
                      <span>Connector ${u.position}</span>
                      <span class="mono"
                        >${u.mode} · ${u.current_a??"—"} A</span
                      >
                      ${u.session_active?c`<span class="live">Session</span>`:""}
                    </div>
                    <div class="btn-row">
                      <button
                        type="button"
                        class="btn"
                        @click=${()=>n("start_charging",{charger_serial:l.serial,connector_position:u.position})}
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        class="btn secondary"
                        @click=${()=>n("pause_charging",{charger_serial:l.serial,connector_position:u.position})}
                      >
                        Pause
                      </button>
                    </div>
                    ${v?c`
                          ${v.pause_explanation.code!=="charging"?c`
                                <div class="sov-pause-box card-inner">
                                  <div class="sov-pause-title">
                                    Why charging is not active
                                  </div>
                                  <p>
                                    <strong>${v.pause_explanation.title}</strong>
                                  </p>
                                  <p class="muted small">
                                    ${v.pause_explanation.detail}
                                  </p>
                                </div>
                              `:""}
                          ${v.limit_chain.length?c`
                                <div class="sov-limit-chain">
                                  <div class="sov-limit-chain-h">
                                    What limits charge speed
                                  </div>
                                  <ol class="sov-limit-list">
                                    ${v.limit_chain.map(g=>c`
                                        <li>
                                          <span class="sov-limit-label"
                                            >${g.label}</span
                                          >
                                          <span class="mono">${g.value}</span>
                                          <span
                                            class="sov-src sov-src--${g.source}"
                                            >${gt(g.source)}</span
                                          >
                                        </li>
                                      `)}
                                  </ol>
                                </div>
                              `:""}
                        `:u.session_active?c`
                            <p class="muted small">
                              Live session—open Full controls for mode and
                              current.
                            </p>
                          `:""}
                    ${h!=null&&h.supports_smart_mode?c`
                          <div class="mode-row">
                            <label>Mode</label>
                            <select
                              @change=${g=>{const f=g.target;n("set_charging_mode",{charger_serial:l.serial,connector_position:u.position,mode:f.value})}}
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
  `:c`
      <div class="card sov-charger-section">
        <h2 class="sov-h2">EV chargers</h2>
        <p class="muted">No chargers discovered for this installation.</p>
      </div>
    `}const mt={live:"Live",calculated:"Calculated",config:"Config"},ve={live:"Directly from Smappee (real-time or latest connector state).",calculated:"Derived in this integration from sessions, tariffs, or history—not a utility invoice.",config:"From your integration options or Smappee tariff settings."};function b(s,e){const t=e?`${ve[s]} ${e}`:ve[s];return c`
    <span class="sov-badge sov-badge--${s}" title=${t}>${mt[s]}</span>
  `}function ft(s){var a,l,h,p,u;const e=s.economics,t=s.reimbursement_monthly,o=s.reimbursement,r=(o==null?void 0:o.currency)??"EUR",i=o==null?void 0:o.belgium_cap,n=o==null?void 0:o.rate_per_kwh,d=(a=s.overview_context)==null?void 0:a.month_smart_savings;return c`
    <div class="sov-econ-hero card">
      <h2 class="sov-h2">Economics & reimbursement</h2>
      <div class="sov-econ-grid">
        <div class="sov-econ-block sov-econ-primary">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Reimbursement this month</span>
            ${b("calculated","Pending = configured rate × session energy in month.")}
          </div>
          <div class="sov-econ-big">
            ${t!=null?c`<strong>${t.pending_amount.toFixed(2)} ${r}</strong>
                  <span class="muted sov-econ-sub"
                    >${t.total_kwh.toFixed(2)} kWh ·
                    ${t.sessions_count} sessions · ${t.month}</span
                  >`:c`<span class="muted">—</span>`}
          </div>
          <p class="sov-footnote muted small">
            Not a bank statement—verify against your tariff rules.
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Config rate</span>
            ${b("config")}
          </div>
          <p>
            ${n!=null?c`<strong>${n.toFixed(4)} ${r}/kWh</strong>`:c`<span class="muted">Not set</span>`}
            ${i!=null?c`<span class="muted small"><br />BE cap: ${i} ${r}/kWh</span>`:""}
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Today (sessions)</span>
            ${b("calculated")}
          </div>
          <p>
            <strong>${((l=e==null?void 0:e.today_kwh)==null?void 0:l.toFixed(2))??"—"} kWh</strong>
            <span class="muted">
              · pending ~${((h=e==null?void 0:e.today_pending_eur)==null?void 0:h.toFixed(2))??"—"} ${r}</span
            >
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Smart charging savings (est.)</span>
            ${b("calculated","Tariff × kWh × solar share; approximate only.")}
          </div>
          <p>
            <strong
              >${d!=null?`${d.total_eur.toFixed(2)} ${d.currency}`:"—"}</strong
            >
            <span class="muted small">
              ${d!=null?` · ${d.sessions_count} sessions with solar share`:""}
            </span>
          </p>
        </div>
        <div class="sov-econ-block">
          <div class="sov-econ-head">
            <span class="sov-econ-label">Self-use</span>
            ${b("calculated")}
          </div>
          <p>
            Self-consumption:
            <strong>${((p=s.consumption)==null?void 0:p.self_consumption_pct)??"—"}%</strong><br />
            Self-sufficiency:
            <strong>${((u=s.consumption)==null?void 0:u.self_sufficiency_pct)??"—"}%</strong>
          </p>
        </div>
      </div>
    </div>
  `}function bt(s,e){if(!(s!=null&&s.length))return c`<div class="spark-empty" aria-label=${e}>No trend data</div>`;const t=120,o=36,r=s.map(h=>h.v),i=Math.min(...r),d=Math.max(...r)-i||1,a=2,l=s.map((h,p)=>{const u=a+p/Math.max(s.length-1,1)*(t-a*2),v=a+(1-(h.v-i)/d)*(o-a*2);return`${p===0?"M":"L"}${u.toFixed(1)},${v.toFixed(1)}`}).join(" ");return c`
    <svg
      class="spark-svg"
      viewBox="0 0 ${t} ${o}"
      width="${t}"
      height="${o}"
      aria-label=${e}
    >
      <path
        d=${l}
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `}function y(s,e){return s==null||Number.isNaN(s)?"—":`${Math.round(s)} ${e}`}function D(s,e,t,o,r){const i=e==null?void 0:e[o],n=i?s[i]:void 0;return t&&!(n!=null&&n.length)?c`<div class="sov-spark-skel skel" aria-hidden="true"></div>`:bt(n,r)}function _t(s,e,t,o){const r=we(s);return s.consumption!=null?c`
    <div class="sov-flow-kpi-wrap">
      <div class="card sov-flow-schematic">
        <div class="sov-section-head">
          <h2 class="sov-h2">Energy flow</h2>
          ${b("live")}
        </div>
        <div class="sov-flow-nodes">
          <div class="sov-flow-node">
            <span class="flow-label">Solar</span>
            <strong>${y(r.solar,"W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Grid in</span>
            <strong>${y(r.gridImport,"W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Grid out</span>
            <strong>${y(r.gridExport,"W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Home</span>
            <strong>${y(r.home,"W")}</strong>
          </div>
          <div class="sov-flow-node">
            <span class="flow-label">Battery</span>
            <strong>${y(r.battery,"W")}</strong>
            ${r.batterySoc!=null?c`<span class="muted">${r.batterySoc}% SoC</span>`:""}
          </div>
        </div>
      </div>
      <div class="sov-kpi-grid">
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Grid import</span>
            ${b("live")}
          </div>
          <div class="kpi-v">${y(r.gridImport,"W")}</div>
          ${D(e,t,o,"grid_import","Grid import")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Solar</span>
            ${b("live")}
          </div>
          <div class="kpi-v">${y(r.solar,"W")}</div>
          ${D(e,t,o,"solar","Solar")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Consumption</span>
            ${b("live")}
          </div>
          <div class="kpi-v">${y(r.home,"W")}</div>
          ${D(e,t,o,"consumption","Consumption")}
        </div>
        <div class="card kpi sov-kpi">
          <div class="sov-kpi-head">
            <span class="kpi-h">Battery</span>
            ${b("live")}
          </div>
          <div class="kpi-v">${y(r.battery,"W")}</div>
          ${D(e,t,o,"battery_flow","Battery")}
        </div>
      </div>
    </div>
  `:c`
      <div class="sov-flow-kpi-wrap">
        <div class="card sov-flow-card sov-flow-card--empty">
          <p class="muted">No live consumption snapshot yet.</p>
        </div>
      </div>
    `}function yt(s,e,t,o,r){var l;const i=s.meta,n=((l=s.diagnostics)==null?void 0:l.stale_sections)??[],d=(i==null?void 0:i.coordinator_last_update_success)!==!1,a=[];return a.push(c`
    <div class="sov-health-item">
      ${b("live")}
      <span class="sov-health-label">Coordinator</span>
      <strong class=${d?"ok-text":"warn-text"}
        >${d?"OK":"Issue"}</strong
      >
    </div>
  `),a.push(c`
    <div class="sov-health-item">
      <span class="sov-health-label">Connection</span>
      <strong
        >${e==="connected"?"Connected":e==="loading"?"Loading…":e==="error"?"Error":"Idle"}</strong
      >
    </div>
  `),s.last_successful_update&&a.push(c`
      <div class="sov-health-item">
        <span class="sov-health-label">Last sync</span>
        <span class="mono small"
          >${s.last_successful_update.replace("T"," ").slice(0,19)}Z</span
        >
      </div>
    `),n.length&&a.push(c`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Stale</span>
        <span>${n.join(", ")}</span>
      </div>
    `),s.api_partial&&a.push(c`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">API</span>
        <span>Partial</span>
      </div>
    `),o?t&&a.push(c`
      <div class="sov-health-item">
        <span class="sov-health-label">Trends</span>
        <span class="sov-shimmer">Loading history…</span>
      </div>
    `):a.push(c`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Trends</span>
        <span>No entity map</span>
      </div>
    `),c`
    <div class="sov-health-strip">
      ${a}
      ${""}
    </div>
  `}function $t(s){return s.length?c`
    <div class="sov-insights">
      <h2 class="sov-h2">Insights</h2>
      <div class="sov-insight-grid">
        ${s.map(e=>c`
            <div class="card sov-insight sov-insight--${e.severity}">
              <div class="sov-insight-title">${e.title}</div>
              <p class="sov-insight-body muted">${e.body}</p>
            </div>
          `)}
      </div>
    </div>
  `:c``}function xt(s,e,t,o){return c`
    <div class="sov-empty">
      <div class="sov-empty-title">${s}</div>
      <p class="sov-empty-body muted">${e}</p>
      ${o?c`<button type="button" class="btn secondary" @click=${o}>
            ${t}
          </button>`:""}
    </div>
  `}function wt(s,e,t,o){var a;const r=!!(t&&Object.keys(t).length>0),i=dt(s),n=ct(s),d=o.narrow;return c`
    <div class="sov-root ${d?"sov-root--narrow":""}">
      ${yt(s,o.connection,o.historyLoading,r)}
      <section class="sov-scan">
        <h2 class="sov-visually-hidden">Installation health</h2>
        ${pt(i)}
      </section>
      ${!s.consumption&&!((a=s.chargers)!=null&&a.length)?xt("Waiting for data","No consumption snapshot and no chargers yet. Refresh or check Diagnostics.","Open diagnostics",o.onOpenDiagnostics):c`
            ${_t(s,e,t,o.historyLoading)}
            ${$t(n)}
            ${ft(s)}
            ${vt(s,o.hass,o.entryId,o.afterAction,o.onOpenChargersTab)}
          `}
    </div>
  `}const kt=be`
  .sov-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  .sov-insight-title {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 14px;
  }
  .sov-insight-body {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
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
`;function St(){return c`
    <div class="skel-layout">
      <div class="skel skel-line skel-title"></div>
      <div class="skel skel-line" style="width:60%"></div>
      <div class="skel-grid">
        ${[1,2,3,4].map(()=>c`<div class="skel skel-card"></div>`)}
      </div>
    </div>
  `}function At(s){if(s.cost_api_amount==null)return"—";const e=s.cost_api_currency??"";return`${s.cost_api_amount.toFixed(2)} ${e}`.trim()}function Et(s,e,t){const o=t==="asc"?1:-1;return[...s].sort((r,i)=>{let n=0,d=0;switch(e){case"start":n=r.start?new Date(r.start).getTime():0,d=i.start?new Date(i.start).getTime():0;break;case"energy":n=r.energy_wh??0,d=i.energy_wh??0;break;case"cost":n=r.cost_estimate??0,d=i.cost_estimate??0;break;case"cost_api":n=r.cost_api_amount??0,d=i.cost_api_amount??0;break;default:n=String(r.id),d=String(i.id)}return n<d?-1*o:n>d?1*o:0})}function Ct(s,e,t,o,r,i){let n=et(s,e);n=Et(n,t.column,t.dir);const d=s.chargers??[],a=l=>r(l);return c`
    <div class="sessions-toolbar card">
      <div class="toolbar-row">
        <label>
          Charger
          <select
            @change=${l=>o({chargerSerial:l.target.value||void 0})}
          >
            <option value="">All</option>
            ${d.map(l=>c`<option
                  value=${l.serial}
                  ?selected=${e.chargerSerial===l.serial}
                >
                  ${l.name}
                </option>`)}
          </select>
        </label>
        <label>
          User / ID
          <input
            type="search"
            placeholder="Filter…"
            .value=${e.userQuery??""}
            @input=${l=>o({userQuery:l.target.value})}
          />
        </label>
        <label>
          Mode
          <select
            @change=${l=>o({mode:l.target.value||void 0})}
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
            @change=${l=>o({periodStart:l.target.value||void 0})}
          />
        </label>
        <label>
          To
          <input
            type="date"
            .value=${e.periodEnd??""}
            @change=${l=>o({periodEnd:l.target.value||void 0})}
          />
        </label>
      </div>
      <button type="button" class="btn secondary" disabled title="Coming soon" @click=${i}>
        Export CSV (soon)
      </button>
    </div>
    <div class="table-wrap card">
      <table class="data-table">
        <thead>
          <tr>
            <th @click=${()=>a("start")}>Start ${t.column==="start"?t.dir==="asc"?"▲":"▼":""}</th>
            <th>Charger</th>
            <th @click=${()=>a("energy")}>kWh</th>
            <th @click=${()=>a("cost_api")}>Cost (API)</th>
            <th @click=${()=>a("cost")}>Cost est.</th>
            <th>Reimb. est.</th>
            <th>Solar %</th>
            <th>Savings est.</th>
            <th>User / card</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          ${n.length===0?c`<tr>
                <td colspan="10" class="muted">No sessions match filters.</td>
              </tr>`:n.map(l=>{var h;return c`
                  <tr>
                    <td>${((h=l.start)==null?void 0:h.replace("T"," ").slice(0,19))??"—"}</td>
                    <td class="mono">${l.charger_serial.slice(0,8)}…</td>
                    <td>${l.energy_wh!=null?(l.energy_wh/1e3).toFixed(2):"—"}</td>
                    <td>${At(l)}</td>
                    <td>${l.cost_estimate??"—"}</td>
                    <td>${l.reimbursement_estimate??"—"}</td>
                    <td>${l.solar_share_pct??"—"}</td>
                    <td>${l.solar_savings_estimate??"—"}</td>
                    <td>${l.user_display??l.user_label??l.user_id??"—"}${l.card_label?c`<br /><span class="muted mono small">${l.card_label}</span>`:""}</td>
                    <td>${l.effective_mode??l.status}</td>
                  </tr>
                `})}
        </tbody>
      </table>
    </div>
  `}var Pt=Object.defineProperty,Ot=Object.getOwnPropertyDescriptor,M=(s,e,t,o)=>{for(var r=o>1?void 0:o?Ot(e,t):e,i=s.length-1,n;i>=0;i--)(n=s[i])&&(r=(o?n(e,t,r):n(r))||r);return o&&r&&Pt(e,t,r),r};const Tt=[{id:"overview",label:"Overview"},{id:"chargers",label:"Chargers"},{id:"sessions",label:"Sessions"},{id:"economics",label:"Economics"},{id:"diagnostics",label:"Diagnostics"}];let E=class extends z{constructor(){super(...arguments),this.narrow=!1,this._tick=0,this._store=ge(""),this._socketOpenHandler=()=>{this._loadPanel(!1)}}connectedCallback(){var t,o,r,i;super.connectedCallback();const s=((o=(t=this.panel)==null?void 0:t.config)==null?void 0:o.config_entry_id)??"";this._store=ge(s),s&&!this._store.getState().selectedEntryId&&this._store.setState({selectedEntryId:s}),this._unsub=this._store.subscribe(()=>{this._tick++,this.requestUpdate()});const e=(r=this.hass)==null?void 0:r.connection.socket;(i=e==null?void 0:e.addEventListener)==null||i.call(e,"open",this._socketOpenHandler),this._bootstrap()}disconnectedCallback(){var e,t,o;super.disconnectedCallback(),(e=this._unsub)==null||e.call(this);const s=(t=this.hass)==null?void 0:t.connection.socket;(o=s==null?void 0:s.removeEventListener)==null||o.call(s,"open",this._socketOpenHandler)}updated(s){super.updated(s),s.has("hass")&&this.hass&&this._bootstrap()}get _entryId(){var s,e;return((e=(s=this.panel)==null?void 0:s.config)==null?void 0:e.config_entry_id)??""}async _bootstrap(){var s,e,t;if(!(!this.hass||!this._entryId))try{const o=await Qe(this.hass);let i=this._store.getState().selectedEntryId;o.some(n=>n.entry_id===i)||(i=((s=o[0])==null?void 0:s.entry_id)??this._entryId),this._store.setState({entries:o.map(n=>({entry_id:n.entry_id,title:n.title})),selectedEntryId:i}),this._store.persistEntry(i),await this._loadPanel(!0)}catch(o){this._store.setState({entries:[{entry_id:this._entryId,title:((t=(e=this.panel)==null?void 0:e.config)==null?void 0:t.title)??"Smappee"}],selectedEntryId:this._store.getState().selectedEntryId||this._entryId}),await this._loadPanel(!0),this._store.setState({panelError:o instanceof Error?`Installations list failed: ${o.message}`:String(o)})}}async _loadPanel(s){if(!this.hass)return;const{selectedEntryId:e}=this._store.getState();if(e){s&&this._store.setState({connection:"loading",panelError:null});try{const t=await Ze(this.hass,e);this._store.setState({panel:t,connection:"connected",panelError:null,lastFetchAt:Date.now(),tabError:null}),this._loadHistory(t)}catch(t){this._store.setState({connection:"error",panelError:t instanceof Error?t.message:String(t)})}}}async _loadHistory(s){var o;if(!((o=this.hass)!=null&&o.callWS))return;const e=s.entity_map;if(!e)return;const t=Object.values(e).filter(r=>!!r);if(t.length){this._store.setState({historyLoading:!0});try{const r=await Ye(this.hass,t);this._store.setState({historyByEntity:r,historyLoading:!1})}catch{this._store.setState({historyLoading:!1})}}}async _onRefresh(){const s=this._store.getState().selectedEntryId;if(!(!this.hass||!s)){try{await this.hass.callService("ha_smappee_overview","refresh",{config_entry_id:s})}catch{}await this._loadPanel(!1)}}_renderTab(s){const e=this._store.getState(),t=e.selectedEntryId,o=this.hass;try{switch(e.activeTab){case"overview":return wt(s,e.historyByEntity,s.entity_map,{connection:e.connection,historyLoading:e.historyLoading,narrow:this.narrow,hass:o,entryId:t,afterAction:()=>void this._loadPanel(!1),onOpenChargersTab:()=>this._store.setState({activeTab:"chargers"}),onOpenDiagnostics:()=>this._store.setState({activeTab:"diagnostics"})});case"chargers":return it(s,o,t,()=>void this._loadPanel(!1));case"sessions":return Ct(s,e.sessionsFilters,e.sessionsSort,r=>this._store.setState({sessionsFilters:{...e.sessionsFilters,...r}}),r=>{const i=e.sessionsSort.column===r;this._store.setState({sessionsSort:{column:r,dir:i&&e.sessionsSort.dir==="desc"?"asc":"desc"}})},()=>{});case"economics":return at(s);case"diagnostics":return nt(s);default:return c``}}catch(r){return console.error(r),c`
        <div class="tab-error">
          <p class="banner err">Something went wrong in this tab.</p>
          <button type="button" class="btn" @click=${()=>{this._store.setState({tabError:null}),this._loadPanel(!1)}}>
            Retry
          </button>
        </div>
      `}}render(){var i,n,d;const s=((n=(i=this.panel)==null?void 0:i.config)==null?void 0:n.title)??"Smappee",e=this._store.getState();if(this._tick,!this._entryId)return c`<div class="wrap">
        <div class="banner err">Missing panel configuration.</div>
      </div>`;const t=e.panel,o=ot(t),r=((d=t==null?void 0:t.alerts)==null?void 0:d.length)??0;return c`
      <div class="wrap">
        <header class="header">
          <h1>${s}</h1>
          <div class="header-actions">
            <select
              aria-label="Installation"
              .value=${e.selectedEntryId}
              @change=${a=>{const l=a.target.value;this._store.persistEntry(l),this._store.setState({selectedEntryId:l}),this._loadPanel(!0)}}
            >
              ${e.entries.length?e.entries.map(a=>c`<option value=${a.entry_id}>${a.title}</option>`):c`<option value=${e.selectedEntryId}>${s}</option>`}
            </select>
            <button type="button" class="btn secondary" @click=${()=>void this._onRefresh()}>
              Refresh
            </button>
            <span
              class="pill ${e.connection==="connected"?"ok":e.connection==="loading"?"load":e.connection==="error"?"err":""}"
            >
              ${e.connection==="connected"?"Connected":e.connection==="loading"?"Loading…":e.connection==="error"?"Error":"Idle"}
            </span>
            ${t!=null&&t.last_successful_update?c`<span class="muted"
                  >Sync ${t.last_successful_update.replace("T"," ").slice(0,19)}Z</span
                >`:""}
            ${r>0?c`<span class="badge-alerts" title="Alerts">${r}</span>`:""}
          </div>
        </header>
        ${e.panelError&&e.connection==="error"?c`
              <div class="banner err">
                ${e.panelError}
                <button
                  type="button"
                  class="btn secondary"
                  style="margin-left:12px"
                  @click=${()=>void this._loadPanel(!0)}
                >
                  Retry
                </button>
              </div>
            `:m}
        ${o?c`<div class="banner">${o}</div>`:m}
        <nav class="tabs" role="tablist">
          ${Tt.map(a=>c`
              <button
                type="button"
                role="tab"
                class=${e.activeTab===a.id?"active":""}
                aria-selected=${e.activeTab===a.id}
                @click=${()=>this._store.setState({activeTab:a.id})}
              >
                ${a.label}
              </button>
            `)}
        </nav>
        ${e.connection==="loading"&&!t?St():t?this._renderTab(t):c`<p class="muted">No data</p>`}
      </div>
    `}};E.styles=[be`
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
  `,kt];M([q({attribute:!1})],E.prototype,"hass",2);M([q({type:Boolean})],E.prototype,"narrow",2);M([q({type:Object})],E.prototype,"panel",2);M([Ve()],E.prototype,"_tick",2);E=M([Be("ha-smappee-overview-panel")],E);
