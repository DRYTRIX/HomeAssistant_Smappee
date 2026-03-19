/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z=globalThis,ge=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,me=Symbol(),_e=new WeakMap;let Le=class{constructor(e,s,o){if(this._$cssResult$=!0,o!==me)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(ge&&e===void 0){const o=s!==void 0&&s.length===1;o&&(e=_e.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),o&&_e.set(s,e))}return e}toString(){return this.cssText}};const Ge=t=>new Le(typeof t=="string"?t:t+"",void 0,me),De=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((o,r,i)=>o+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[i+1],t[0]);return new Le(s,t,me)},Ke=(t,e)=>{if(ge)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const o=document.createElement("style"),r=Z.litNonce;r!==void 0&&o.setAttribute("nonce",r),o.textContent=s.cssText,t.appendChild(o)}},xe=ge?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const o of e.cssRules)s+=o.cssText;return Ge(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ye,defineProperty:Ze,getOwnPropertyDescriptor:Qe,getOwnPropertyNames:Xe,getOwnPropertySymbols:et,getPrototypeOf:tt}=Object,P=globalThis,$e=P.trustedTypes,st=$e?$e.emptyScript:"",re=P.reactiveElementPolyfillSupport,W=(t,e)=>t,X={toAttribute(t,e){switch(e){case Boolean:t=t?st:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},ve=(t,e)=>!Ye(t,e),we={attribute:!0,type:String,converter:X,reflect:!1,useDefault:!1,hasChanged:ve};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),P.litPropertyMetadata??(P.litPropertyMetadata=new WeakMap);let U=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=we){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(e,s),!s.noAccessor){const o=Symbol(),r=this.getPropertyDescriptor(e,o,s);r!==void 0&&Ze(this.prototype,e,r)}}static getPropertyDescriptor(e,s,o){const{get:r,set:i}=Qe(this.prototype,e)??{get(){return this[s]},set(n){this[s]=n}};return{get:r,set(n){const c=r==null?void 0:r.call(this);i==null||i.call(this,n),this.requestUpdate(e,c,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??we}static _$Ei(){if(this.hasOwnProperty(W("elementProperties")))return;const e=tt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(W("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(W("properties"))){const s=this.properties,o=[...Xe(s),...et(s)];for(const r of o)this.createProperty(r,s[r])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[o,r]of s)this.elementProperties.set(o,r)}this._$Eh=new Map;for(const[s,o]of this.elementProperties){const r=this._$Eu(s,o);r!==void 0&&this._$Eh.set(r,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const o=new Set(e.flat(1/0).reverse());for(const r of o)s.unshift(xe(r))}else e!==void 0&&s.push(xe(e));return s}static _$Eu(e,s){const o=s.attribute;return o===!1?void 0:typeof o=="string"?o:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(s=>s(this))}addController(e){var s;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((s=e.hostConnected)==null||s.call(e))}removeController(e){var s;(s=this._$EO)==null||s.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const o of s.keys())this.hasOwnProperty(o)&&(e.set(o,this[o]),delete this[o]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ke(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(s=>{var o;return(o=s.hostConnected)==null?void 0:o.call(s)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(s=>{var o;return(o=s.hostDisconnected)==null?void 0:o.call(s)})}attributeChangedCallback(e,s,o){this._$AK(e,o)}_$ET(e,s){var i;const o=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,o);if(r!==void 0&&o.reflect===!0){const n=(((i=o.converter)==null?void 0:i.toAttribute)!==void 0?o.converter:X).toAttribute(s,o.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,s){var i,n;const o=this.constructor,r=o._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const c=o.getPropertyOptions(r),l=typeof c.converter=="function"?{fromAttribute:c.converter}:((i=c.converter)==null?void 0:i.fromAttribute)!==void 0?c.converter:X;this._$Em=r;const d=l.fromAttribute(s,c.type);this[r]=d??((n=this._$Ej)==null?void 0:n.get(r))??d,this._$Em=null}}requestUpdate(e,s,o,r=!1,i){var n;if(e!==void 0){const c=this.constructor;if(r===!1&&(i=this[e]),o??(o=c.getPropertyOptions(e)),!((o.hasChanged??ve)(i,s)||o.useDefault&&o.reflect&&i===((n=this._$Ej)==null?void 0:n.get(e))&&!this.hasAttribute(c._$Eu(e,o))))return;this.C(e,s,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,s,{useDefault:o,reflect:r,wrapped:i},n){o&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??s??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||o||(s=void 0),this._$AL.set(e,s)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var o;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,n]of r){const{wrapped:c}=n,l=this[i];c!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let e=!1;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),(o=this._$EO)==null||o.forEach(r=>{var i;return(i=r.hostUpdate)==null?void 0:i.call(r)}),this.update(s)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(s)}willUpdate(e){}_$AE(e){var s;(s=this._$EO)==null||s.forEach(o=>{var r;return(r=o.hostUpdated)==null?void 0:r.call(o)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(s=>this._$ET(s,this[s]))),this._$EM()}updated(e){}firstUpdated(e){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[W("elementProperties")]=new Map,U[W("finalized")]=new Map,re==null||re({ReactiveElement:U}),(P.reactiveElementVersions??(P.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const B=globalThis,ke=t=>t,ee=B.trustedTypes,Se=ee?ee.createPolicy("lit-html",{createHTML:t=>t}):void 0,je="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,He="?"+C,ot=`<${He}>`,M=document,V=()=>M.createComment(""),J=t=>t===null||typeof t!="object"&&typeof t!="function",fe=Array.isArray,rt=t=>fe(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ie=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ae=/-->/g,Ee=/>/g,T=RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ce=/'/g,Pe=/"/g,We=/^(?:script|style|textarea|title)$/i,it=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),a=it(1),L=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),Ie=new WeakMap,N=M.createTreeWalker(M,129);function Be(t,e){if(!fe(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Se!==void 0?Se.createHTML(e):e}const nt=(t,e)=>{const s=t.length-1,o=[];let r,i=e===2?"<svg>":e===3?"<math>":"",n=H;for(let c=0;c<s;c++){const l=t[c];let d,h,u=-1,m=0;for(;m<l.length&&(n.lastIndex=m,h=n.exec(l),h!==null);)m=n.lastIndex,n===H?h[1]==="!--"?n=Ae:h[1]!==void 0?n=Ee:h[2]!==void 0?(We.test(h[2])&&(r=RegExp("</"+h[2],"g")),n=T):h[3]!==void 0&&(n=T):n===T?h[0]===">"?(n=r??H,u=-1):h[1]===void 0?u=-2:(u=n.lastIndex-h[2].length,d=h[1],n=h[3]===void 0?T:h[3]==='"'?Pe:Ce):n===Pe||n===Ce?n=T:n===Ae||n===Ee?n=H:(n=T,r=void 0);const b=n===T&&t[c+1].startsWith("/>")?" ":"";i+=n===H?l+ot:u>=0?(o.push(d),l.slice(0,u)+je+l.slice(u)+C+b):l+C+(u===-2?c:b)}return[Be(t,i+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),o]};class q{constructor({strings:e,_$litType$:s},o){let r;this.parts=[];let i=0,n=0;const c=e.length-1,l=this.parts,[d,h]=nt(e,s);if(this.el=q.createElement(d,o),N.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=N.nextNode())!==null&&l.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const u of r.getAttributeNames())if(u.endsWith(je)){const m=h[n++],b=r.getAttribute(u).split(C),p=/([.?@])?(.*)/.exec(m);l.push({type:1,index:i,name:p[2],strings:b,ctor:p[1]==="."?lt:p[1]==="?"?ct:p[1]==="@"?dt:te}),r.removeAttribute(u)}else u.startsWith(C)&&(l.push({type:6,index:i}),r.removeAttribute(u));if(We.test(r.tagName)){const u=r.textContent.split(C),m=u.length-1;if(m>0){r.textContent=ee?ee.emptyScript:"";for(let b=0;b<m;b++)r.append(u[b],V()),N.nextNode(),l.push({type:2,index:++i});r.append(u[m],V())}}}else if(r.nodeType===8)if(r.data===He)l.push({type:2,index:i});else{let u=-1;for(;(u=r.data.indexOf(C,u+1))!==-1;)l.push({type:7,index:i}),u+=C.length-1}i++}}static createElement(e,s){const o=M.createElement("template");return o.innerHTML=e,o}}function D(t,e,s=t,o){var n,c;if(e===L)return e;let r=o!==void 0?(n=s._$Co)==null?void 0:n[o]:s._$Cl;const i=J(e)?void 0:e._$litDirective$;return(r==null?void 0:r.constructor)!==i&&((c=r==null?void 0:r._$AO)==null||c.call(r,!1),i===void 0?r=void 0:(r=new i(t),r._$AT(t,s,o)),o!==void 0?(s._$Co??(s._$Co=[]))[o]=r:s._$Cl=r),r!==void 0&&(e=D(t,r._$AS(t,e.values),r,o)),e}class at{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:o}=this._$AD,r=((e==null?void 0:e.creationScope)??M).importNode(s,!0);N.currentNode=r;let i=N.nextNode(),n=0,c=0,l=o[0];for(;l!==void 0;){if(n===l.index){let d;l.type===2?d=new G(i,i.nextSibling,this,e):l.type===1?d=new l.ctor(i,l.name,l.strings,this,e):l.type===6&&(d=new pt(i,this,e)),this._$AV.push(d),l=o[++c]}n!==(l==null?void 0:l.index)&&(i=N.nextNode(),n++)}return N.currentNode=M,r}p(e){let s=0;for(const o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(e,o,s),s+=o.strings.length-2):o._$AI(e[s])),s++}}class G{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,o,r){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=o,this.options=r,this._$Cv=(r==null?void 0:r.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=D(this,e,s),J(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==L&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):rt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&J(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){var i;const{values:s,_$litType$:o}=e,r=typeof o=="number"?this._$AC(e):(o.el===void 0&&(o.el=q.createElement(Be(o.h,o.h[0]),this.options)),o);if(((i=this._$AH)==null?void 0:i._$AD)===r)this._$AH.p(s);else{const n=new at(r,this),c=n.u(this.options);n.p(s),this.T(c),this._$AH=n}}_$AC(e){let s=Ie.get(e.strings);return s===void 0&&Ie.set(e.strings,s=new q(e)),s}k(e){fe(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let o,r=0;for(const i of e)r===s.length?s.push(o=new G(this.O(V()),this.O(V()),this,this.options)):o=s[r],o._$AI(i),r++;r<s.length&&(this._$AR(o&&o._$AB.nextSibling,r),s.length=r)}_$AR(e=this._$AA.nextSibling,s){var o;for((o=this._$AP)==null?void 0:o.call(this,!1,!0,s);e!==this._$AB;){const r=ke(e).nextSibling;ke(e).remove(),e=r}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,o,r,i){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=s,this._$AM=r,this.options=i,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=y}_$AI(e,s=this,o,r){const i=this.strings;let n=!1;if(i===void 0)e=D(this,e,s,0),n=!J(e)||e!==this._$AH&&e!==L,n&&(this._$AH=e);else{const c=e;let l,d;for(e=i[0],l=0;l<i.length-1;l++)d=D(this,c[o+l],s,l),d===L&&(d=this._$AH[l]),n||(n=!J(d)||d!==this._$AH[l]),d===y?e=y:e!==y&&(e+=(d??"")+i[l+1]),this._$AH[l]=d}n&&!r&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class lt extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}}class ct extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}}class dt extends te{constructor(e,s,o,r,i){super(e,s,o,r,i),this.type=5}_$AI(e,s=this){if((e=D(this,e,s,0)??y)===L)return;const o=this._$AH,r=e===y&&o!==y||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,i=e!==y&&(o===y||r);r&&this.element.removeEventListener(this.name,this,o),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class pt{constructor(e,s,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){D(this,e)}}const ne=B.litHtmlPolyfillSupport;ne==null||ne(q,G),(B.litHtmlVersions??(B.litHtmlVersions=[])).push("3.3.2");const ut=(t,e,s)=>{const o=(s==null?void 0:s.renderBefore)??e;let r=o._$litPart$;if(r===void 0){const i=(s==null?void 0:s.renderBefore)??null;o._$litPart$=r=new G(e.insertBefore(V(),i),i,void 0,s??{})}return r._$AI(t),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const O=globalThis;class F extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var s;const e=super.createRenderRoot();return(s=this.renderOptions).renderBefore??(s.renderBefore=e.firstChild),e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ut(s,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return L}}var Ue;F._$litElement$=!0,F.finalized=!0,(Ue=O.litElementHydrateSupport)==null||Ue.call(O,{LitElement:F});const ae=O.litElementPolyfillSupport;ae==null||ae({LitElement:F});(O.litElementVersions??(O.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ht=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const gt={attribute:!0,type:String,converter:X,reflect:!1,hasChanged:ve},mt=(t=gt,e,s)=>{const{kind:o,metadata:r}=s;let i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),o==="setter"&&((t=Object.create(t)).wrapped=!0),i.set(s.name,t),o==="accessor"){const{name:n}=s;return{set(c){const l=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,l,t,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,t,c),c}}}if(o==="setter"){const{name:n}=s;return function(c){const l=this[n];e.call(this,c),this.requestUpdate(n,l,t,!0,c)}}throw Error("Unsupported decorator location: "+o)};function se(t){return(e,s)=>typeof s=="object"?mt(t,e,s):((o,r,i)=>{const n=r.hasOwnProperty(i);return r.constructor.createProperty(i,o),n?Object.getOwnPropertyDescriptor(r,i):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function vt(t){return se({...t,state:!0,attribute:!1})}const ft="ha_smappee_overview/get_panel_data",bt="ha_smappee_overview/list_entries";function Fe(t,e){return typeof t.callWS=="function"?t.callWS(e):t.connection.sendMessagePromise(e)}async function yt(t){return(await Fe(t,{type:bt})).entries??[]}function _t(t){if(!t||typeof t!="object")throw new Error("Panel payload is not an object");const e=t;if(!Array.isArray(e.chargers))throw new Error("Panel payload missing chargers array");Array.isArray(e.sessions_active)||(e.sessions_active=[]),Array.isArray(e.sessions_recent)||(e.sessions_recent=[]),Array.isArray(e.tariffs)||(e.tariffs=[]),(!e.discovery||typeof e.discovery!="object")&&(e.discovery={partial:!0,notes:[],sources:{},generated_at:null,edges:[],nodes:[],summary:{ok:0,offline:0,stale:0,unknown:0},consumption_stale_hint:!1});const s=e.discovery;return Array.isArray(s.nodes)||(s.nodes=[]),Array.isArray(s.edges)||(s.edges=[]),(!s.summary||typeof s.summary!="object")&&(s.summary={ok:0,offline:0,stale:0,unknown:0}),e}async function xt(t,e,s=!1){const o={type:ft,config_entry_id:e};s&&(o.include_advanced=!0);const r=await Fe(t,o);return _t(r)}async function $t(t,e,s=48){const o=e.filter(Boolean);if(!o.length||typeof t.callWS!="function")return{};const r=new Date,i=new Date(r.getTime()-24*3600*1e3);let n;try{n=await t.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:r.toISOString(),entity_ids:o,minimal_response:!0,no_attributes:!0,significant_changes_only:!0})}catch{return{}}const c={},l=n&&typeof n=="object"&&!Array.isArray(n)?n:{};for(const d of o){const h=l[d];if(!Array.isArray(h))continue;const u=[];for(const p of h){if(!p||typeof p!="object")continue;const g=p,v=g.lu??g.lc,_=(typeof v=="number"?v:0)*1e3,$=parseFloat(String(g.s??""));Number.isFinite($)&&u.push({t:_,v:$})}if(u.length<=s){c[d]=u;continue}const m=Math.ceil(u.length/s),b=[];for(let p=0;p<u.length;p+=m)b.push(u[p]);c[d]=b}return c}const Te="smappee_panel_entry",le="smappee_panel_advanced";function Ne(t){let e=t;try{const i=sessionStorage.getItem(Te);i&&(e=i)}catch{}let s=!1;try{s=sessionStorage.getItem(le)==="1"}catch{}let o={entries:[],selectedEntryId:e||t,activeTab:"overview",panel:null,connection:"idle",panelError:null,tabError:null,historyByEntity:{},historyLoading:!1,lastFetchAt:null,sessionsSort:{column:"start",dir:"desc"},sessionsFilters:{},sessionsExpandedRowId:null,sessionsGroupByDay:!1,economicsPeriod:"today",advancedMode:s};const r=new Set;return{getState:()=>o,subscribe:i=>(r.add(i),()=>r.delete(i)),setState:i=>{o={...o,...i},r.forEach(n=>n())},loadStoredEntry:()=>e||t,persistEntry:i=>{try{sessionStorage.setItem(Te,i)}catch{}e=i},persistAdvancedMode:i=>{try{i?sessionStorage.setItem(le,"1"):sessionStorage.removeItem(le)}catch{}o={...o,advancedMode:i},r.forEach(n=>n())}}}function Ve(t){const e=t==null?void 0:t.consumption;return{gridImport:(e==null?void 0:e.grid_import_w)??null,gridExport:(e==null?void 0:e.grid_export_w)??null,solar:(e==null?void 0:e.solar_w)??null,home:(e==null?void 0:e.consumption_w)??null,battery:(e==null?void 0:e.battery_flow_w)??null,batterySoc:(e==null?void 0:e.battery_soc_pct)??null}}function be(t){var o;if(!t)return[];if((o=t.sessions_enriched)!=null&&o.length)return t.sessions_enriched;const e=new Set,s=[];for(const r of[...t.sessions_active,...t.sessions_recent])e.has(r.id)||(e.add(r.id),s.push(r));return s}function wt(t,e){var o;let s=be(t);if(e.chargerSerial&&(s=s.filter(r=>r.charger_serial===e.chargerSerial)),(o=e.userQuery)!=null&&o.trim()){const r=e.userQuery.trim().toLowerCase();s=s.filter(i=>{const n=(i.user_display||i.user_label||i.user_id||"").toLowerCase(),c=(i.card_label||"").toLowerCase();return n.includes(r)||c.includes(r)||i.user_id&&i.user_id.toLowerCase().includes(r)||i.id.toLowerCase().includes(r)})}if(e.mode&&(s=s.filter(r=>(r.effective_mode||r.status||"").toLowerCase()===e.mode.toLowerCase())),e.periodStart){const r=new Date(e.periodStart).getTime();s=s.filter(i=>i.start?new Date(i.start).getTime()>=r:!1)}if(e.periodEnd){const r=new Date(e.periodEnd).getTime();s=s.filter(i=>i.start?new Date(i.start).getTime()<=r:!1)}return s}function kt(t,e){var o;const s=(o=t==null?void 0:t.chargers_extended)==null?void 0:o.find(r=>r.serial===e);return(s==null?void 0:s.load_balance)??{reported:!1,value:null}}function St(t){var e;return((e=t==null?void 0:t.economics)==null?void 0:e.belgium_cap_compliant)??null}function At(t){var e,s;return t?t.api_partial?"Some data from the Smappee API is partial or failed to load.":(e=t.consumption)!=null&&e.stale?"Live consumption data may be stale.":(s=t.meta)!=null&&s.consumption_stale?"Consumption marked stale by coordinator.":null:null}function Et(t,e,s){var r,i;const o=(r=t.overview_context)==null?void 0:r.connector_explanations;return(i=o==null?void 0:o.find(n=>n.charger_serial===e&&n.connector===s))==null?void 0:i.explanation}function Ct(t){return t==="live"?"Live":t==="config"?"Config":"Est."}function Pt(t){var r,i,n,c,l;if(!t)return a``;const e=t.badge.tone,s=((r=t.technical)==null?void 0:r.limit_chain)??[],o=s.length>0||t.details&&Object.keys(t.details).length>0||((i=t.technical)==null?void 0:i.signals)&&Object.keys(t.technical.signals).length>0;return a`
    <div class="exp-expl-wrap">
      <span
        class="chip exp-badge exp-badge--${e}"
        title=${t.message}
        >${t.badge.label}</span
      >
      <details class="exp-details">
        <summary>Technical details</summary>
        <p class="muted small exp-expl-msg">${t.message}</p>
        ${(n=t.suggestions)!=null&&n.length?a`
              <div class="exp-suggest-h">What you can try</div>
              <ul class="exp-suggest">
                ${t.suggestions.map(d=>a`<li>${d.label}</li>`)}
              </ul>
            `:""}
        ${s.length?a`
              <div class="exp-chain-h">Limit chain</div>
              <ol class="exp-chain-list">
                ${s.map(d=>a`
                    <li class="exp-chain-li">
                      <span class="exp-chain-label">${d.label}</span>
                      <span class="mono">${d.value}</span>
                      <span class="exp-chain-src exp-chain-src--${d.source}"
                        >${Ct(d.source)}</span
                      >
                    </li>
                  `)}
              </ol>
            `:""}
        ${o?a`
              <div class="exp-chain-h">Raw signals</div>
              <pre class="json-pre exp-json">
${JSON.stringify({details:t.details,pause_code:(c=t.technical)==null?void 0:c.pause_code,signals:(l=t.technical)==null?void 0:l.signals},null,2)}</pre
              >
            `:""}
      </details>
    </div>
  `}const It="ha_smappee_overview";function Tt(t,e,s,o){var c;const i=[...t.sessions_active,...t.sessions_enriched??[]].filter((l,d,h)=>h.findIndex(u=>u.id===l.id)===d).filter(l=>/charging|started/i.test(l.status||"")),n=async(l,d)=>{try{await e.callService(It,l,{config_entry_id:s,...d}),o()}catch(h){console.error(h)}};return(c=t.chargers)!=null&&c.length?a`
    <div class="charger-list">
      ${t.chargers.map(l=>{var u;const d=(u=t.charger_features)==null?void 0:u[l.serial],h=kt(t,l.serial);return a`
          <div class="card charger-card">
            <div class="charger-head">
              <h3>${l.name}</h3>
              <span class="chip ${l.availability?"ok":"off"}"
                >${l.availability?"Available":"Unavailable"}</span
              >
            </div>
            <div class="muted mono">${l.serial}</div>
            <div class="lb-row">
              Load balancing:
              ${h.reported?a`<code>${JSON.stringify(h.value)}</code>`:a`<span class="muted">Not reported by API</span>`}
            </div>
            ${l.connectors.map(m=>{const b=i.find(g=>g.charger_serial===l.serial&&g.connector===m.position),p=Et(t,l.serial,m.position);return a`
                <div class="connector-block">
                  <div class="conn-title conn-title-row">
                    <span>
                      Connector ${m.position} · mode
                      <strong>${m.mode}</strong>
                      · ${m.current_a??"—"} A
                      ${m.session_active?a`<span class="live">Live</span>`:""}
                    </span>
                  </div>
                  ${Pt(p)}
                  ${b?a`
                        <div class="session-mini card-inner">
                          Session ${b.id.slice(0,8)}… ·
                          ${b.energy_wh!=null?`${(b.energy_wh/1e3).toFixed(2)} kWh`:"—"}
                        </div>
                      `:""}
                  <div class="btn-row">
                    <button
                      type="button"
                      class="btn"
                      @click=${()=>n("start_charging",{charger_serial:l.serial,connector_position:m.position})}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>n("pause_charging",{charger_serial:l.serial,connector_position:m.position})}
                    >
                      Pause
                    </button>
                    <button
                      type="button"
                      class="btn secondary"
                      @click=${()=>n("stop_charging",{charger_serial:l.serial,connector_position:m.position})}
                    >
                      Stop
                    </button>
                  </div>
                  ${d!=null&&d.supports_smart_mode?a`
                        <div class="mode-row">
                          <label>Mode</label>
                          <select
                            @change=${g=>{const v=g.target;n("set_charging_mode",{charger_serial:l.serial,connector_position:m.position,mode:v.value})}}
                          >
                            <option value="standard">Standard</option>
                            <option value="smart">Smart</option>
                            <option value="solar">Solar</option>
                          </select>
                        </div>
                      `:""}
                  ${d!=null&&d.supports_current_limit?(()=>{const g=Math.min(32,d.max_current_a??32),v=6,_=Math.round(Math.min(g,Math.max(v,m.current_a??16)));return a`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label">Current (A)</label>
                            <input
                              type="range"
                              min=${v}
                              max=${g}
                              .value=${String(_)}
                              @change=${$=>{const S=$.target,A=parseInt(S.value,10);A>=v&&n("set_charging_current",{charger_serial:l.serial,connector_position:m.position,current_a:A})}}
                            />
                            <span class="mono small">${_} A</span>
                          </div>
                        `})():""}
                </div>
              `})}
          </div>
        `})}
    </div>
  `:a`<p class="muted">No chargers discovered.</p>`}const Nt=14,Ot=["installation","gateway","monitor","charger","unknown"];function Mt(t){var o,r;const e=(o=t.health)==null?void 0:o.api_last_seen_iso;if(e)return`Cloud: ${e.slice(0,19).replace("T"," ")}`;const s=(r=t.health)==null?void 0:r.last_seen_iso;return s?`Observed: ${s.slice(0,19).replace("T"," ")}`:""}function Rt(t){const e=[];return t.source_sl_devices&&e.push("service location"),t.source_charging_api&&e.push("charging API"),e.length?e.join(" · "):"—"}function zt(t){return t==="ok"?"ok":t==="offline"?"err":t==="stale"?"load":""}function he(t,e){var r;const s=((r=t.health)==null?void 0:r.connectivity)??"unknown",o=Math.min(e,10)*16;return a`
    <div
      class="dev-node-row"
      style=${`padding-left:${o}px;border-left:${e>0?"2px solid var(--divider-color)":"none"};margin-left:${e>0?"6px":"0"}`}
    >
      <div class="dev-node-main">
        <span class="dev-node-label">${t.label}</span>
        <span class="pill small ${zt(s)}">${s}</span>
      </div>
      <div class="dev-node-detail muted small">
        <span>${t.kind}</span>
        ${t.serial?a`<code>${t.serial}</code>`:""}
        ${t.connector_count!=null&&t.connector_count>0?a`<span>${t.connector_count} connector(s)</span>`:""}
        ${t.availability!=null?a`<span>Public: ${t.availability?"yes":"no"}</span>`:""}
      </div>
      <div class="dev-node-meta muted small">
        <span>${Mt(t)}</span>
        <span>Sources: ${Rt(t)}</span>
      </div>
    </div>
  `}function Je(t,e,s,o,r){if(e>Nt)return[];const i=s.get(t);if(!i)return[];r.add(t);const n=[he(i,e)];for(const c of o.get(t)??[])n.push(...Je(c,e+1,s,o,r));return n}function Ut(t){var _,$,S,A,w;const e=t.discovery,s=(e==null?void 0:e.nodes)??[];if(!e||!s.length)return a`
      <div class="card">
        <h3 class="card-h">Devices</h3>
        <p class="muted">
          No devices in the discovery snapshot yet. If you have chargers, try Refresh. For hardware
          lists, the Smappee API may omit <code>devices[]</code> — see
          <code>docs/API_CAPTURE.md</code> in the integration repo to contribute redacted samples.
        </p>
      </div>
    `;const o=new Map(s.map(f=>[f.id,f])),r=e.edges??[],i=new Map;for(const f of r){const x=i.get(f.parent)??[];x.push(f.child),i.set(f.parent,x)}const n=new Set(r.map(f=>f.child)),l=[...new Set(r.map(f=>f.parent))].filter(f=>!n.has(f)),d=((_=s.find(f=>f.kind==="installation"))==null?void 0:_.id)??(($=s.find(f=>f.id.startsWith("installation:")))==null?void 0:$.id)??l[0]??null,h=new Set,u=d&&r.length?Je(d,0,o,i,h):[],m=s.filter(f=>!h.has(f.id)),b=r.length===0?s:m,p=new Map;for(const f of b){const x=f.kind||"unknown",j=p.get(x)??[];j.push(f),p.set(x,j)}const g=e.summary??{},v=((S=t.meta)==null?void 0:S.coordinator_last_update_success)!==!1;return a`
    <div class="devices-root">
      ${e.partial||(A=e.notes)!=null&&A.length?a`
            <div class="banner ${e.partial?"warn":""}">
              ${e.partial?a`<strong>Limited discovery.</strong> Topology may be incomplete when the API
                    does not expose hardware device lists.`:""}
              ${(w=e.notes)==null?void 0:w.map(f=>a`<div>${f}</div>`)}
              <div class="muted small">
                Contributors: capture redacted <code>GET …/servicelocation</code> JSON — see
                <code>docs/API_CAPTURE.md</code>.
              </div>
            </div>
          `:""}
      ${e.consumption_stale_hint?a`
            <div class="banner warn">
              Energy snapshot is stale; installation-level connectivity may be degraded.
            </div>
          `:""}
      <div class="sov-health-strip" style="margin-bottom:14px">
        <div class="sov-health-item">
          <span class="sov-health-label">Coordinator</span>
          <span class="${v?"sov-health-ok":"sov-health-warn"}"
            >${v?"OK":"Issues"}</span
          >
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">OK</span>
          <strong>${g.ok??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Offline</span>
          <strong>${g.offline??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Stale</span>
          <strong>${g.stale??0}</strong>
        </div>
        <div class="sov-health-item">
          <span class="sov-health-label">Unknown</span>
          <strong>${g.unknown??0}</strong>
        </div>
      </div>

      ${u.length?a`
            <div class="card">
              <h3 class="card-h">Topology</h3>
              <p class="muted small">
                Parent/child links come from the API when available; otherwise use the grouped list
                below.
              </p>
              <div class="dev-tree">${u}</div>
            </div>
          `:""}

      <div class="card">
        <h3 class="card-h">Network overview</h3>
        ${r.length?m.length?a`<p class="muted small">Nodes not reached from the installation root:</p>`:"":a`<p class="muted small">No edges in API data — grouped by device kind.</p>`}
        ${r.length?m.length?m.map(f=>he(f,0)):u.length?a`<p class="muted small">All nodes are in the tree above.</p>`:a`<p class="muted small">No nodes.</p>`:Ot.filter(f=>p.has(f)).map(f=>a`
                <h4 class="dev-kind-head">${f}</h4>
                ${(p.get(f)??[]).map(x=>he(x,0))}
              `)}
      </div>

      ${e.sources&&Object.keys(e.sources).length?a`
            <div class="card">
              <h3 class="card-h">Data sources</h3>
              <ul class="dev-sources">
                ${Object.entries(e.sources).map(([f,x])=>a`<li><code>${f}</code>: ${x?"yes":"no"}</li>`)}
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
  `}function E(t){return t==null?"—":(typeof t=="number"&&Number.isFinite(t),String(t))}function Lt(t){var d,h,u,m,b;const e=t.meta,s=(e==null?void 0:e.advanced_panel_allowed)===!0,o=(e==null?void 0:e.advanced_data_included)===!0,r=t.advanced,i=(d=t.consumption)==null?void 0:d.phase_metrics,n=((h=t.consumption)==null?void 0:h.submeters)??[],c=((u=t.overview_context)==null?void 0:u.active_ev_hints)??[],l=t.chargers_extended??[];return a`
    <div class="card advanced-region">
      <h3 class="card-h">Advanced</h3>
      ${s?a`
            ${o?y:a`<p class="muted small">
                  Raw excerpts and coordinator debug load on the next fetch. Click
                  <strong>Refresh</strong> if needed.
                </p>`}
            <details class="adv-details" open>
              <summary>Phase &amp; submeters</summary>
              ${i?a`
                    <table class="adv-table mono small">
                      <tbody>
                        <tr>
                          <td>L1</td>
                          <td>${E(i.l1_v)} V</td>
                          <td>${E(i.l1_a)} A</td>
                          <td>${E(i.l1_w)} W</td>
                        </tr>
                        <tr>
                          <td>L2</td>
                          <td>${E(i.l2_v)} V</td>
                          <td>${E(i.l2_a)} A</td>
                          <td>${E(i.l2_w)} W</td>
                        </tr>
                        <tr>
                          <td>L3</td>
                          <td>${E(i.l3_v)} V</td>
                          <td>${E(i.l3_a)} A</td>
                          <td>${E(i.l3_w)} W</td>
                        </tr>
                      </tbody>
                    </table>
                  `:a`<p class="muted small">No phase metrics on consumption.</p>`}
              ${n.length?a`
                    <p class="small"><strong>Submeters</strong></p>
                    <ul class="small">
                      ${n.map(p=>a`<li>
                            ${p.name??p.id}: ${E(p.power_w)} W
                            ${p.energy_wh!=null?a` / ${E(p.energy_wh)} Wh`:y}
                          </li>`)}
                    </ul>
                  `:a`<p class="muted small">No submeters in payload.</p>`}
            </details>
            <details class="adv-details" open>
              <summary>Internal limits &amp; load balance</summary>
              ${c.length?c.map(p=>{var g;return a`
                      <div class="adv-hint small">
                        <strong>${p.charger_serial}</strong> #${p.connector} —
                        ${p.status} / ${p.connector_mode}
                        ${(g=p.limit_chain)!=null&&g.length?a`<ul>
                              ${p.limit_chain.map(v=>a`<li>
                                    ${v.label}: ${v.value}
                                    <span class="muted">(${v.factor})</span>
                                  </li>`)}
                            </ul>`:a`<p class="muted">No limit chain.</p>`}
                      </div>
                    `}):a`<p class="muted small">No active EV hints.</p>`}
              <p class="small"><strong>chargers_extended</strong></p>
              <pre class="json-pre">${JSON.stringify(l,null,2)}</pre>
            </details>
          `:a`<p class="muted">
            Turn on <strong>Allow advanced panel data</strong> in the integration options
            (Configure → Smappee Overview), then reload the panel.
          </p>`}
      ${s&&o&&r?a`
            <details class="adv-details">
              <summary>Raw API excerpts</summary>
              <pre class="json-pre">${JSON.stringify(r.raw_excerpts,null,2)}</pre>
            </details>
            <details class="adv-details">
              <summary>Debug</summary>
              <p class="small">
                Stale: ${(((m=t.diagnostics)==null?void 0:m.stale_sections)??[]).join(", ")||"—"}
              </p>
              <p class="small">Unsupported connectors</p>
              <pre class="json-pre">${JSON.stringify(((b=t.diagnostics)==null?void 0:b.unsupported_connectors)??[],null,2)}</pre>
              <p class="small">Session JSON keys (union)</p>
              <pre class="json-pre">${JSON.stringify(r.session_json_keys_union,null,2)}</pre>
            </details>
            <details class="adv-details">
              <summary>Coordinator state</summary>
              <pre class="json-pre">${JSON.stringify(r.coordinator_state,null,2)}</pre>
            </details>
          `:y}
    </div>
  `}function Dt(t){var o,r,i,n,c;const e=t.diagnostics,s=t.installation;return a`
    <div class="card">
      <h3 class="card-h">API health</h3>
      <p>Coordinator OK: <strong>${((o=t.meta)==null?void 0:o.coordinator_last_update_success)??"—"}</strong></p>
      <p>Partial API: <strong>${t.api_partial?"yes":"no"}</strong></p>
      <p>Last error: <code>${t.last_error??(e==null?void 0:e.last_error)??"—"}</code></p>
      <p>Update interval: ${((r=t.meta)==null?void 0:r.update_interval_s)??"—"}s</p>
    </div>
    <div class="card">
      <h3 class="card-h">Stale sections</h3>
      ${(i=e==null?void 0:e.stale_sections)!=null&&i.length?a`<ul>${e.stale_sections.map(l=>a`<li>${l}</li>`)}</ul>`:a`<p class="muted">None flagged.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Unsupported / limited features</h3>
      ${(n=e==null?void 0:e.unsupported_connectors)!=null&&n.length?a`<ul>
            ${e.unsupported_connectors.map(l=>{const d=l;return a`<li>${d.charger_serial} #${d.connector}: ${d.reason}</li>`})}
          </ul>`:a`<p class="muted">None listed.</p>`}
    </div>
    <div class="card">
      <h3 class="card-h">Installation</h3>
      <pre class="json-pre">${JSON.stringify(s,null,2)}</pre>
    </div>
    <div class="card">
      <h3 class="card-h">Installation raw (excerpt)</h3>
      <pre class="json-pre">${JSON.stringify((e==null?void 0:e.installation_raw_excerpt)??{},null,2)}</pre>
    </div>
    ${(c=e==null?void 0:e.session_json_keys_union)!=null&&c.length?a`
          <div class="card">
            <h3 class="card-h">Session JSON keys (debug)</h3>
            <p class="muted small">
              Enable &quot;Debug session JSON keys&quot; in integration options. Union of keys seen in
              recent session payloads.
            </p>
            <pre class="json-pre">${JSON.stringify(e.session_json_keys_union,null,2)}</pre>
          </div>
        `:""}
  `}function Oe(t){let e=0,s=0,o=0,r=0,i=0;for(const n of t)n.energy_wh!=null&&n.energy_wh>0&&(e+=n.energy_wh/1e3,i+=1),n.cost_estimate!=null&&(s+=n.cost_estimate),n.reimbursement_estimate!=null&&(o+=n.reimbursement_estimate),n.solar_savings_estimate!=null&&(r+=n.solar_savings_estimate);return{kwh:e,costEst:s,reimb:o,solarSave:r,count:i}}function jt(t,e){return t.filter(s=>s.start&&s.start.slice(0,7)===e)}function Ht(t,e){return t.filter(s=>s.start&&s.start.slice(0,4)===e)}function Wt(t,e,s){var A,w,f,x,j;const o=((A=t.reimbursement)==null?void 0:A.currency)??"EUR",r=(w=t.reimbursement)==null?void 0:w.belgium_cap,i=(f=t.reimbursement)==null?void 0:f.rate_per_kwh,n=t.economics,c=t.reimbursement_monthly,l=(n==null?void 0:n.reimbursement_history)??[],d=be(t),h=new Date,u=(c==null?void 0:c.month)??`${h.getUTCFullYear()}-${String(h.getUTCMonth()+1).padStart(2,"0")}`,m=String(h.getUTCFullYear()),b=jt(d,u),p=Ht(d,m),g=Oe(b),v=Oe(p),_=t.country_code==="BE"?a`
          <div
            class="card be-badge ${(n==null?void 0:n.belgium_cap_compliant)===!1?"warn":"ok"}"
          >
            <strong>Belgium cap</strong>
            ${r!=null?a`<p>Cap: ${r} EUR/kWh · Your rate: ${i??"—"} EUR/kWh</p>`:a`<p>Configure cap in integration options.</p>`}
            ${(n==null?void 0:n.belgium_cap_compliant)===!0?a`<p class="ok-text">Rate within cap.</p>`:(n==null?void 0:n.belgium_cap_compliant)===!1?a`<p class="warn-text">Rate exceeds configured cap.</p>`:""}
          </div>
        `:a``,$=(k,I)=>a`
    <button
      type="button"
      class=${e===k?"active":""}
      @click=${()=>s(k)}
    >
      ${I}
    </button>
  `;let S;if(e==="today")S=a`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Energy &amp; money (today, UTC)</h3>
          <p>
            EV energy (sessions): <strong>${((x=n==null?void 0:n.today_kwh)==null?void 0:x.toFixed(2))??"—"} kWh</strong>
          </p>
          <p>
            Tariff cost (est.):
            <strong
              >${(n==null?void 0:n.today_charging_cost_estimate_eur)!=null?`${n.today_charging_cost_estimate_eur.toFixed(2)} ${o}`:"—"}</strong
            >
          </p>
          <p>
            Pending reimbursement (est.):
            <strong
              >${(n==null?void 0:n.today_pending_eur)!=null?`${n.today_pending_eur.toFixed(2)} ${o}`:"—"}</strong
            >
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${(n==null?void 0:n.today_charging_cost_estimate_eur)!=null?a`Today's charging ≈
                  <strong
                    >${n.today_charging_cost_estimate_eur.toFixed(2)}
                    ${o}</strong
                  >
                  at primary tariff (estimate).`:a`<span class="muted">No tariff-based cost estimate for today.</span>`}
          </p>
          <p class="econ-hero-line">
            ${(n==null?void 0:n.today_pending_eur)!=null?a`<strong>${n.today_pending_eur.toFixed(2)} ${o}</strong>
                  pending reimbursement today (configured rate × energy).`:""}
          </p>
        </div>
      </div>
    `;else if(e==="month"){const k=(j=t.overview_context)==null?void 0:j.month_smart_savings;S=a`
      <div class="card row-2">
        <div>
          <h3 class="card-h">Month ${u}</h3>
          <p>
            Sessions in payload: <strong>${g.count}</strong> ·
            <strong>${g.kwh.toFixed(2)} kWh</strong>
          </p>
          <p>
            Cost (est. sum): <strong>${g.costEst.toFixed(2)} ${o}</strong>
          </p>
          <p>
            Reimbursement (est. sum):
            <strong>${g.reimb.toFixed(2)} ${o}</strong>
          </p>
          <p>
            Solar savings (est. sum):
            <strong>${g.solarSave.toFixed(2)} ${o}</strong>
          </p>
        </div>
        <div>
          <p class="econ-hero-line">
            ${c!=null?a`<strong>${c.pending_amount.toFixed(2)} ${o}</strong>
                  pending reimbursement (${c.total_kwh.toFixed(2)} kWh,
                  ${c.sessions_count} sessions).`:a`<span class="muted">No monthly reimbursement summary.</span>`}
          </p>
          <p class="econ-hero-line">
            ${k!=null&&k.total_eur>0?a`You saved ≈
                  <strong
                    >${k.total_eur.toFixed(2)} ${k.currency}</strong
                  >
                  via solar-weighted tariff (estimated,
                  ${k.sessions_count} sessions).`:a`<span class="muted">No smart/solar savings total for this month.</span>`}
          </p>
        </div>
      </div>
    `}else S=a`
      <div class="card">
        <h3 class="card-h">Year ${m} (payload window)</h3>
        ${t.api_partial?a`<div class="banner">Partial API data — figures may be incomplete.</div>`:""}
        <p class="muted small">
          Only sessions present in this panel's history window are included
          (${v.count} sessions, ${v.kwh.toFixed(2)} kWh).
        </p>
        <p>
          Cost (est. sum): <strong>${v.costEst.toFixed(2)} ${o}</strong>
        </p>
        <p>
          Reimbursement (est. sum):
          <strong>${v.reimb.toFixed(2)} ${o}</strong>
        </p>
        <p>
          Solar savings (est. sum):
          <strong>${v.solarSave.toFixed(2)} ${o}</strong>
        </p>
        <p class="econ-hero-line">
          ${v.solarSave>0?a`≈ <strong>${v.solarSave.toFixed(2)} ${o}</strong> in
                estimated solar tariff savings for listed sessions.`:""}
        </p>
      </div>
    `;return a`
    ${_}
    <nav class="econ-period-tabs" aria-label="Economics period">
      ${$("today","Today")} ${$("month","Month")}
      ${$("year","Year")}
    </nav>
    ${S}
    <div class="card">
      <h3 class="card-h">All tariffs (API)</h3>
      <p class="muted small">
        Session <em>cost estimates</em> use the first tariff only when multiple
        exist.
      </p>
      ${(()=>{var I,ye;const k=(ye=(I=t.economics)==null?void 0:I.tariffs_all)!=null&&ye.length?t.economics.tariffs_all:t.tariffs??[];return k.length?a`
              <ul class="tariff-list">
                ${k.map((Y,qe)=>a`
                    <li>
                      ${qe===0&&k.length>1?a`<span class="badge">primary (estimates)</span> `:""}
                      <strong>${Y.name??Y.id}</strong> —
                      ${Y.price_per_kwh??"—"} ${Y.currency??""} / kWh
                    </li>
                  `)}
              </ul>
            `:a`<p class="muted">No tariff data from API.</p>`})()}
    </div>
    <div class="card row-2">
      <div>
        <h3 class="card-h">Split billing / reimbursement</h3>
        <p>Rate: <strong>${i??"—"}</strong> ${o}/kWh</p>
        <p>
          Config rate applies to pending amounts shown on Today / Month views.
        </p>
      </div>
      <div>
        <h3 class="card-h">Reimbursement history</h3>
        ${l.length?a`<ul>${l.map(k=>{const I=k;return a`<li>${I.valid_from}: ${I.rate_per_kwh}</li>`})}</ul>`:a`<p class="muted">No history entries (options-only rate).</p>`}
      </div>
    </div>
  `}function ce(t){const e=new Map;for(const o of t){const r=new Date(o.t).getHours(),i=e.get(r)??{sum:0,n:0};i.sum+=o.v,i.n+=1,e.set(r,i)}const s=new Map;for(const[o,{sum:r,n:i}]of e)i>0&&s.set(o,r/i);return s}function Bt(t,e){let s=null;for(let o=0;o<=22;o++){const r=t.get(o),i=t.get(o+1),n=e.get(o),c=e.get(o+1);if(r===void 0||i===void 0||n===void 0||c===void 0)continue;const l=(r+i-(n+c))/2;(s===null||l>s.score)&&(s={startH:o,score:l})}return s}function Ft(t){let e=null;for(let s=0;s<=22;s++){const o=t.get(s),r=t.get(s+1);if(o===void 0||r===void 0)continue;const i=(o+r)/2;(e===null||i>e.score)&&(e={startH:s,score:i})}return e}function Me(t,e=2){const s=t+e,o=r=>r<10?`0${r}`:String(r);return`${o(t)}:00–${o(s)}:00`}const de=10,Vt=250,Jt=350;function qt(t,e){if(!e||!t)return null;const s=e.solar,o=e.consumption,r=e.grid_export;if(s&&o){const i=t[s]??[],n=t[o]??[];if(i.length>=de&&n.length>=de){const c=ce(i),l=ce(n),d=Bt(c,l);if(d&&d.score>=Vt)return{id:"history-surplus-pattern",category:"solar",severity:"info",title:"Typical solar surplus window (recent)",body:`In the last 24 hours, solar minus home load tended to be highest around ${Me(d.startH)} (local time). This is a retrospective pattern from history—not a weather forecast.`,source:"history"}}}if(r){const i=t[r]??[];if(i.length>=de){const n=ce(i),c=Ft(n);if(c&&c.score>=Jt)return{id:"history-export-pattern",category:"solar",severity:"info",title:"Typical export window (recent)",body:`Grid export was often strongest around ${Me(c.startH)} (local) in the last 24 hours. Good past windows for self-consumption (e.g. EV charging) may repeat—but this is not a prediction.`,source:"history"}}}return null}function Gt(t){if(!Array.isArray(t))return[];const e=[];for(const s of t){if(!s||typeof s!="object")continue;const o=s,r=typeof o.id=="string"?o.id:null,i=typeof o.title=="string"?o.title:null,n=typeof o.body=="string"?o.body:null,c=o.severity==="warn"||o.severity==="info"?o.severity:null;if(!r||!i||!n||!c)continue;const l=typeof o.category=="string"?o.category:void 0;let d;const h=o.savings;if(h&&typeof h=="object"){const u=h,m=typeof u.amount=="number"?u.amount:Number.NaN;if(Number.isFinite(m)){const b=typeof u.assumed_kwh=="number"?u.assumed_kwh:Number(u.assumed_kwh);d={amount:m,currency:typeof u.currency=="string"?u.currency:"EUR",assumed_kwh:Number.isFinite(b)?b:10,note:typeof u.note=="string"?u.note:""}}}e.push({id:r,category:l,severity:c,title:i,body:n,savings:d,source:"server"})}return e}const Re=5;function Kt(t,e,s){var n;const r=[...Gt((n=t.overview_context)==null?void 0:n.assistant_suggestions)],i=qt(e,s);return i&&r.length<Re&&!r.some(c=>c.id===i.id)&&r.push(i),r.slice(0,Re)}function Q(t){return t==null||Number.isNaN(t)?"—":`${Math.round(t)} W`}function Yt(t){if(t.pause_explanation.code!=="charging")return{short:t.pause_explanation.title,detail:t.pause_explanation.detail};const s=t.limit_chain??[],o=s.find(n=>n.factor==="load_balance");if(o)return{short:"Limited by load balancing / grid",detail:`${o.label}: ${o.value}. The installation may be capping current to protect the main fuse or tariff.`};const r=s.find(n=>n.factor==="smart_mode");if(r)return{short:"Smart mode may throttle",detail:r.value};const i=s.find(n=>n.factor==="set_current");return i?{short:"User current limit",detail:`${i.label}: ${i.value}.`}:{short:"Charging",detail:"Energy is being delivered when the vehicle accepts it."}}function Zt(t){var o;const e=(o=t.overview_context)==null?void 0:o.operational_flags,s=[];return s.push({id:"charging",label:"Charging active",active:!!(e!=null&&e.charging_active),variant:e!=null&&e.charging_active?"ok":"neutral",title:e!=null&&e.charging_active?"At least one session is delivering or queued with current.":"No active charging detected on connectors."}),s.push({id:"overload",label:"Load cap / balance",active:!!(e!=null&&e.overload_suspected),variant:e!=null&&e.overload_suspected?"warn":"neutral",title:e!=null&&e.overload_suspected?"Load balancing or similar may be limiting available current.":"No load-balancing cap detected from API hints."}),s.push({id:"solar_surplus",label:"Solar surplus",active:!!(e!=null&&e.solar_surplus),variant:e!=null&&e.solar_surplus?"info":"neutral",title:e!=null&&e.solar_surplus?"Significant export to grid — surplus power available.":"Export is low or unknown."}),s.push({id:"smart",label:"Smart charging",active:!!(e!=null&&e.smart_mode_any),variant:e!=null&&e.smart_mode_any?"info":"neutral",title:e!=null&&e.smart_mode_any?"At least one connector uses SMART mode.":"No connector in SMART mode."}),s.push({id:"solar_mode",label:"Solar mode",active:!!(e!=null&&e.solar_mode_any),variant:e!=null&&e.solar_mode_any?"info":"neutral",title:e!=null&&e.solar_mode_any?"Solar-oriented charging mode reported by the API.":"Solar-specific mode not reported."}),s}function Qt(t){var n;if(!t.consumption)return{nodes:[],edges:[],hasConsumption:!1};const s=Ve(t),o=((n=t.overview_context)==null?void 0:n.estimated_ev_power_w)??null,r=[{id:"grid",label:"Grid",powerW:s.gridImport!=null&&s.gridImport>0?s.gridImport:null,sub:s.gridExport!=null&&s.gridExport>0?`Export ${Q(s.gridExport)}`:void 0},{id:"solar",label:"Solar",powerW:s.solar},{id:"home",label:"Home",powerW:s.home},{id:"battery",label:"Battery",powerW:s.battery,sub:s.batterySoc!=null?`${Math.round(s.batterySoc)}% SoC`:void 0},{id:"ev",label:"EV",powerW:o,sub:o!=null?"estimated":void 0}],i=[];return s.gridImport!=null&&s.gridImport>0&&i.push({id:"grid-in",from:"grid",to:"home",powerW:s.gridImport,kind:"import"}),s.gridExport!=null&&s.gridExport>0&&i.push({id:"grid-out",from:"home",to:"grid",powerW:s.gridExport,kind:"export"}),s.solar!=null&&s.solar>0&&i.push({id:"solar-in",from:"solar",to:"home",powerW:s.solar,kind:"solar"}),s.battery!=null&&Math.abs(s.battery)>5&&i.push({id:"battery",from:"battery",to:"home",powerW:s.battery,kind:"battery"}),o!=null&&o>0&&i.push({id:"ev",from:"ev",to:"home",powerW:o,kind:"ev"}),{nodes:r,edges:i,hasConsumption:!0}}function Xt(t){var r,i,n;const e=(r=t.economics)==null?void 0:r.tariff_primary,s=(e==null?void 0:e.currency)||((n=(i=t.tariffs)==null?void 0:i[0])==null?void 0:n.currency)||"EUR";return{price:typeof(e==null?void 0:e.price_per_kwh)=="number"?e.price_per_kwh:null,currency:s}}function es(t){var n,c;const e=t.consumption,{price:s,currency:o}=Xt(t),r=(n=t.economics)==null?void 0:n.today_charging_cost_estimate_eur,i=(c=t.overview_context)==null?void 0:c.estimated_ev_power_w;return{consumption:{value:Q(e==null?void 0:e.consumption_w),numeric:(e==null?void 0:e.consumption_w)??null,source:(e==null?void 0:e.consumption_w)!=null?"live":"missing",tooltip:"Total site consumption (live). Sparkline from Home Assistant history when entity mapping exists."},solar:{value:Q(e==null?void 0:e.solar_w),numeric:(e==null?void 0:e.solar_w)??null,source:(e==null?void 0:e.solar_w)!=null?"live":"missing",tooltip:"Solar production (live)."},evPower:{value:Q(i??void 0),numeric:i??null,source:i!=null?"estimated":"missing",tooltip:"Estimated from connector current × phase voltage (or 230 V fallback). Not a direct meter reading."},tariff:{value:s!=null?`${s.toFixed(4)} ${o}/kWh`:"—",numeric:s,source:s!=null?"calculated":"missing",tooltip:"Primary tariff from Smappee API (first in list). Used for session cost estimates."},todayCost:{value:r!=null?`≈ ${r.toFixed(2)} ${o}`:"—",numeric:r??null,source:r!=null?"calculated":"missing",tooltip:"Sum of primary-tariff estimates for sessions that started today (UTC). Not a utility bill."},selfConsumption:{value:(e==null?void 0:e.self_consumption_pct)!=null?`${Math.round(e.self_consumption_pct)}%`:"—",numeric:(e==null?void 0:e.self_consumption_pct)??null,source:(e==null?void 0:e.self_consumption_pct)!=null?"live":"missing",tooltip:"Self-consumption share from the last consumption snapshot."}}}function ts(t){if(!(t!=null&&t.phase_metrics))return null;const e=t.phase_metrics,s=[e.l1_a,e.l2_a,e.l3_a].filter(o=>typeof o=="number"&&Number.isFinite(o));return s.length?Math.max(...s):null}function ss(t){for(const e of be(t))if(/charging|started/i.test(e.status||""))return!0;return!1}function os(t){var c,l;const e=Ve(t),s=[];e.gridExport!=null&&e.gridExport>400&&!ss(t)&&s.push({id:"export-opportunity",severity:"info",title:"Export opportunity",body:"Significant power is flowing to the grid while no EV session is actively charging. Smart or solar charging modes could use this surplus."}),e.gridImport!=null&&e.gridImport>1500&&(e.solar==null||e.solar<800)&&s.push({id:"peak-grid-draw",severity:"warn",title:"High grid import",body:"Household draw is relying heavily on the grid with limited solar contribution. Consider shifting loads or checking tariff windows."}),e.batterySoc!=null&&e.batterySoc>=88&&e.battery!=null&&e.battery<-200&&e.gridExport!=null&&e.gridExport>300&&s.push({id:"battery-full-export",severity:"info",title:"Battery saturated, exporting",body:"Battery is full or discharging little while exporting to the grid. Surplus could go to an EV if a session starts."}),e.solar!=null&&e.solar>2e3&&e.home!=null&&e.home<500&&s.push({id:"solar-surplus",severity:"info",title:"Strong solar harvest",body:"Low home consumption vs solar production — a good window for EV charging if you need range."});const o=((c=t.overview_context)==null?void 0:c.active_ev_hints)??[],r=new Set;for(const d of o){const h=/charging|started/i.test(d.status||""),u=(d.limit_chain??[]).some(m=>m.factor==="load_balance");h&&u&&!r.has(d.session_id)&&(r.add(d.session_id),s.push({id:`load-balance-${d.session_id}`,severity:"warn",title:"Charging may be grid-limited",body:"Load balancing reports a cap on available current. The wallbox may be slower than your set limit until headroom improves."}))}const i=(l=t.overview_context)==null?void 0:l.peak_phase_current_warning_a,n=ts(t.consumption??void 0);return i!=null&&n!=null&&n>=i&&s.push({id:"peak-phase-current",severity:"warn",title:"Phase current near your alert threshold",body:`Highest reported phase current is ${n.toFixed(1)} A (your warning is ${i} A). Check main fuse / capacity tariffs if relevant.`}),s.slice(0,6)}function rs(t){var r,i,n,c;const e=[];t.api_partial&&e.push({id:"api-partial",severity:"warn",label:"Partial API data"}),((r=t.consumption)!=null&&r.stale||(i=t.meta)!=null&&i.consumption_stale)&&e.push({id:"consumption-stale",severity:"warn",label:"Consumption stale"}),(n=t.meta)!=null&&n.coordinator_last_update_success||e.push({id:"coord-fail",severity:"error",label:"Last update failed"});const s=St(t);t.country_code==="BE"&&s===!1&&e.push({id:"be-cap",severity:"error",label:"BE cap exceeded"});const o=((c=t.diagnostics)==null?void 0:c.unsupported_connectors)??[];for(let l=0;l<o.length;l++){const d=o[l];e.push({id:`unsupported-${l}`,severity:"info",label:`Mode unknown · ${d.charger_serial??"?"} #${d.connector??"?"}`})}for(const l of t.alerts??[]){const d=(l.severity||"").toLowerCase()==="error"?"error":(l.severity||"").toLowerCase()==="warning"?"warn":"info";e.push({id:`alert-${l.id}`,severity:d,label:l.message.slice(0,80)+(l.message.length>80?"…":"")})}return e.slice(0,12)}function is(t){return t.length?a`
    <div class="sov-anomalies">
      ${t.map(e=>a`
          <span class="sov-anomaly sov-anomaly--${e.severity}" title=${e.label}
            >${e.label}</span
          >
        `)}
    </div>
  `:a`
      <div class="sov-anomalies sov-anomalies--ok">
        <span class="sov-anomaly sov-anomaly--ok">No anomalies flagged</span>
      </div>
    `}const ns="ha_smappee_overview";function as(t,e,s){return t==null?void 0:t.find(o=>o.charger_serial===e&&o.connector===s)}function ls(t){return t==="live"?"Live":t==="config"?"Config":"Est."}function cs(t,e,s,o,r){var c,l;const i=((c=t.overview_context)==null?void 0:c.active_ev_hints)??[],n=async(d,h)=>{try{await e.callService(ns,d,{config_entry_id:s,...h}),o()}catch(u){console.error(u)}};return(l=t.chargers)!=null&&l.length?a`
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
        ${t.chargers.map(d=>{var b,p;const h=(b=t.charger_features)==null?void 0:b[d.serial],u=d.connectors.some(g=>g.session_active),m=(p=t.overview_context)==null?void 0:p.estimated_ev_power_w;return a`
            <div class="card sov-charger-card">
              <div class="sov-charger-title-row">
                <strong>${d.name}</strong>
                <span class="chip ${d.availability?"ok":"off"}"
                  >${d.availability?"Available":"Unavailable"}</span
                >
              </div>
              <div class="muted mono small">${d.serial}</div>
              ${u&&m!=null&&m>0?a`<p class="muted small">
                    Site EV power (est.): ~${Math.round(m)} W
                  </p>`:""}
              ${d.connectors.map(g=>{const v=as(i,d.serial,g.position),_=v?Yt(v):null,$=Math.min(32,(h==null?void 0:h.max_current_a)??32),S=6,A=Math.round(Math.min($,Math.max(S,g.current_a??16)));return a`
                  <div class="sov-connector-quick">
                    <div class="sov-conn-line">
                      <span>Connector ${g.position}</span>
                      <span class="mono"
                        >${g.mode} · ${g.current_a??"—"} A</span
                      >
                      ${g.session_active?a`<span class="live">Session</span>`:""}
                    </div>
                    ${_?a`
                          <div
                            class="sov-charge-reason"
                            title=${_.detail}
                          >
                            <span class="sov-charge-reason-label"
                              >${_.short}</span
                            >
                          </div>
                        `:""}
                    <div class="btn-row">
                      <button
                        type="button"
                        class="btn"
                        @click=${()=>n("start_charging",{charger_serial:d.serial,connector_position:g.position})}
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        class="btn secondary"
                        @click=${()=>n("pause_charging",{charger_serial:d.serial,connector_position:g.position})}
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        class="btn secondary"
                        @click=${()=>n("stop_charging",{charger_serial:d.serial,connector_position:g.position})}
                      >
                        Stop
                      </button>
                    </div>
                    ${h!=null&&h.supports_current_limit?a`
                          <div class="sov-current-slider-row">
                            <label class="sov-slider-label"
                              >Current limit (A)</label
                            >
                            <input
                              type="range"
                              min=${S}
                              max=${$}
                              .value=${String(A)}
                              @change=${w=>{const f=w.target,x=parseInt(f.value,10);x>=S&&n("set_charging_current",{charger_serial:d.serial,connector_position:g.position,current_a:x})}}
                            />
                            <span class="mono small">${A} A</span>
                          </div>
                        `:""}
                    ${v&&v.pause_explanation.code!=="charging"?a`
                          <div class="sov-pause-box card-inner">
                            <div class="sov-pause-title">Status</div>
                            <p>
                              <strong>${v.pause_explanation.title}</strong>
                            </p>
                            <p class="muted small">
                              ${v.pause_explanation.detail}
                            </p>
                          </div>
                        `:""}
                    ${v!=null&&v.limit_chain.length?a`
                          <div class="sov-limit-chain">
                            <div class="sov-limit-chain-h">
                              What limits charge speed
                            </div>
                            <ol class="sov-limit-list">
                              ${v.limit_chain.map(w=>a`
                                  <li>
                                    <span class="sov-limit-label"
                                      >${w.label}</span
                                    >
                                    <span class="mono">${w.value}</span>
                                    <span
                                      class="sov-src sov-src--${w.source}"
                                      >${ls(w.source)}</span
                                    >
                                  </li>
                                `)}
                            </ol>
                          </div>
                        `:""}
                    ${h!=null&&h.supports_smart_mode?a`
                          <div class="mode-row">
                            <label>Mode</label>
                            <select
                              @change=${w=>{const f=w.target;n("set_charging_mode",{charger_serial:d.serial,connector_position:g.position,mode:f.value})}}
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
  `:a`
      <div class="card sov-charger-section">
        <h2 class="sov-h2">EV chargers</h2>
        <p class="muted">No chargers discovered for this installation.</p>
      </div>
    `}const ds={live:"Live",calculated:"Calculated",config:"Config"},ze={live:"Directly from Smappee (real-time or latest connector state).",calculated:"Derived in this integration from sessions, tariffs, or history—not a utility invoice.",config:"From your integration options or Smappee tariff settings."};function oe(t,e){const s=e?`${ze[t]} ${e}`:ze[t];return a`
    <span class="sov-badge sov-badge--${t}" title=${s}>${ds[t]}</span>
  `}function ps(t){var i;const e=t.reimbursement_monthly,s=t.reimbursement,o=(s==null?void 0:s.currency)??"EUR",r=(i=t.overview_context)==null?void 0:i.month_smart_savings;return a`
    <div class="card sov-econ-compact">
      <div class="sov-section-head">
        <h2 class="sov-h2">Economics snapshot</h2>
        ${oe("calculated")}
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
  `}function us(t,e,s,o,r){var d;const i=t.meta,n=((d=t.diagnostics)==null?void 0:d.stale_sections)??[],c=(i==null?void 0:i.coordinator_last_update_success)!==!1,l=[];return l.push(a`
    <div class="sov-health-item">
      ${oe("live")}
      <span class="sov-health-label">Coordinator</span>
      <strong class=${c?"ok-text":"warn-text"}
        >${c?"OK":"Issue"}</strong
      >
    </div>
  `),l.push(a`
    <div class="sov-health-item">
      <span class="sov-health-label">Connection</span>
      <strong
        >${e==="connected"?"Connected":e==="loading"?"Loading…":e==="error"?"Error":"Idle"}</strong
      >
    </div>
  `),t.last_successful_update&&l.push(a`
      <div class="sov-health-item">
        <span class="sov-health-label">Last sync</span>
        <span class="mono small"
          >${t.last_successful_update.replace("T"," ").slice(0,19)}Z</span
        >
      </div>
    `),n.length&&l.push(a`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Stale</span>
        <span>${n.join(", ")}</span>
      </div>
    `),t.api_partial&&l.push(a`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">API</span>
        <span>Partial</span>
      </div>
    `),o?s&&l.push(a`
      <div class="sov-health-item">
        <span class="sov-health-label">Trends</span>
        <span class="sov-shimmer">Loading history…</span>
      </div>
    `):l.push(a`
      <div class="sov-health-item sov-health-warn">
        <span class="sov-health-label">Trends</span>
        <span>No entity map</span>
      </div>
    `),a`
    <div class="sov-health-strip">
      ${l}
      ${""}
    </div>
  `}function hs(t){return t==="solar"?"Solar":t==="cost"?"Cost":t==="peak"?"Peak":"Tip"}function gs(t){return t.length?a`
    <div class="sov-insights">
      <h2 class="sov-h2">Insights</h2>
      <div class="sov-insight-grid">
        ${t.map(e=>a`
            <div class="card sov-insight sov-insight--${e.severity}">
              <div class="sov-insight-title">${e.title}</div>
              <p class="sov-insight-body muted">${e.body}</p>
            </div>
          `)}
      </div>
    </div>
  `:a``}function ms(t){return t.length?a`
    <div class="sov-insights">
      <h2 class="sov-h2">Assistant</h2>
      <div class="sov-insight-grid">
        ${t.map(e=>a`
            <div class="card sov-insight sov-insight--${e.severity}">
              <div class="sov-insight-head">
                ${e.category?a`<span class="sov-insight-cat">${hs(e.category)}</span>`:y}
                <div class="sov-insight-title">${e.title}</div>
              </div>
              <p class="sov-insight-body muted">${e.body}</p>
              ${e.savings?a`<p class="sov-insight-savings muted">
                    ~${e.savings.amount.toFixed(2)}
                    ${e.savings.currency} · ~${e.savings.assumed_kwh} kWh ·
                    ${e.savings.note}
                  </p>`:y}
            </div>
          `)}
      </div>
    </div>
  `:a``}function vs(t,e,s,o){return a`
    <div class="sov-empty">
      <div class="sov-empty-title">${t}</div>
      <p class="sov-empty-body muted">${e}</p>
      ${o?a`<button type="button" class="btn secondary" @click=${o}>
            ${s}
          </button>`:""}
    </div>
  `}function fs(t,e){if(!(t!=null&&t.length))return a`<div class="spark-empty" aria-label=${e}>No trend data</div>`;const s=120,o=36,r=t.map(h=>h.v),i=Math.min(...r),c=Math.max(...r)-i||1,l=2,d=t.map((h,u)=>{const m=l+u/Math.max(t.length-1,1)*(s-l*2),b=l+(1-(h.v-i)/c)*(o-l*2);return`${u===0?"M":"L"}${m.toFixed(1)},${b.toFixed(1)}`}).join(" ");return a`
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
  `}function bs(t){return t==="live"?"live":t==="calculated"||t==="estimated"?"calculated":"live"}function pe(t,e,s,o,r){const i=e==null?void 0:e[o],n=i?t[i]:void 0;return s&&!(n!=null&&n.length)?a`<div class="sov-spark-skel skel" aria-hidden="true"></div>`:fs(n,r)}function z(t,e,s,o){return a`
    <div
      class="card kpi sov-kpi-premium ${o?"sov-kpi-premium--full":""}"
      title=${e.tooltip}
      aria-label=${`${t}: ${e.value}. ${e.tooltip}`}
    >
      <div class="sov-kpi-head">
        <span class="kpi-h">${t}</span>
        ${e.source==="missing"?"":oe(bs(e.source),e.tooltip)}
      </div>
      <div class="sov-kpi-premium-val">${e.value}</div>
      <div class="sov-kpi-spark">${s}</div>
    </div>
  `}function ys(t,e,s,o,r){const i=es(t);return a`
    <div class="sov-kpi-premium-grid">
      ${z("Consumption",i.consumption,pe(e,s,o,"consumption","Consumption"),r)}
      ${z("Solar",i.solar,pe(e,s,o,"solar","Solar"),r)}
      ${z("EV (est.)",i.evPower,a`<div class="spark-empty" title="No history entity for EV power">
          Trend N/A
        </div>`,r)}
      ${z("Tariff now",i.tariff,a`<div class="spark-empty">—</div>`,r)}
      ${z("Cost today (est.)",i.todayCost,a`<div class="spark-empty">—</div>`,r)}
      ${z("Self-consumption",i.selfConsumption,pe(e,s,o,"self_consumption","Self-consumption"),r)}
    </div>
  `}function _s(t){return t==="grid"?"sov-sf-node--grid":t==="solar"?"sov-sf-node--solar":t==="battery"?"sov-sf-node--battery":t==="ev"?"sov-sf-node--ev":"sov-sf-node--home"}function xs(t){const{nodes:e,hasConsumption:s}=Qt(t);if(!s)return a`
      <div class="card sov-smart-flow sov-smart-flow--empty">
        <div class="sov-section-head">
          <h2 class="sov-h2">Energy flow</h2>
        </div>
        <p class="muted">No live consumption snapshot yet.</p>
      </div>
    `;const o=Object.fromEntries(e.map(i=>[i.id,i])),r=i=>{const n=o[i];return n?a`
      <div class="sov-sf-node ${_s(n.id)}">
        <span class="sov-sf-node-label">${n.label}</span>
        <strong class="sov-sf-node-val">${n.powerW!=null?`${Math.round(n.powerW)} W`:"—"}</strong>
        ${n.sub?a`<span class="sov-sf-node-sub muted small">${n.sub}</span>`:""}
      </div>
    `:a``};return a`
    <div class="card sov-smart-flow">
      <div class="sov-section-head">
        <h2 class="sov-h2">Energy flow</h2>
        ${oe("live")}
      </div>
      <p class="muted small sov-sf-hint">
        Flow arrows show direction of power. EV power is estimated when a session is active.
      </p>
      <div class="sov-sf-diagram" role="img" aria-label="Energy flow diagram">
        <div class="sov-sf-row sov-sf-row--top">
          ${r("solar")}
          <div class="sov-sf-connector sov-sf-connector--solar" aria-hidden="true"></div>
          ${r("home")}
          <div class="sov-sf-connector sov-sf-connector--grid-in" aria-hidden="true"></div>
          ${r("grid")}
        </div>
        <div class="sov-sf-row sov-sf-row--bot">
          ${r("battery")}
          <div class="sov-sf-connector sov-sf-connector--bat" aria-hidden="true"></div>
          <div class="sov-sf-spacer"></div>
          <div class="sov-sf-connector sov-sf-connector--ev" aria-hidden="true"></div>
          ${r("ev")}
        </div>
      </div>
    </div>
  `}function $s(t){const e=Zt(t);return a`
    <section class="sov-status-strip" aria-label="Operational status">
      <div class="sov-status-badges">
        ${e.map(s=>a`
            <span
              class="sov-op-badge sov-op-badge--${s.variant} ${s.active?"sov-op-badge--on":""}"
              title=${s.title}
              >${s.label}${s.active?" · on":""}</span
            >
          `)}
      </div>
    </section>
  `}function ws(t,e,s,o){var d;const r=!!(s&&Object.keys(s).length>0),i=rs(t),n=Kt(t,e,s),c=os(t),l=o.narrow;return a`
    <div class="sov-root ${l?"sov-root--narrow":""}">
      ${us(t,o.connection,o.historyLoading,r)}
      <section class="sov-scan">
        <h2 class="sov-visually-hidden">Installation health</h2>
        ${is(i)}
      </section>
      ${$s(t)}
      ${!t.consumption&&!((d=t.chargers)!=null&&d.length)?vs("Waiting for data","No consumption snapshot and no chargers yet. Refresh or check Diagnostics.","Open diagnostics",o.onOpenDiagnostics):a`
            <div class="sov-overview-main-grid">
              <div class="sov-overview-flow-col">
                ${xs(t)}
              </div>
              <div class="sov-overview-kpi-col">
                ${ys(t,e,s,o.historyLoading,l)}
              </div>
            </div>
            ${gs(c)}
            ${ms(n)}
            ${ps(t)}
            ${cs(t,o.hass,o.entryId,o.afterAction,o.onOpenChargersTab)}
          `}
    </div>
  `}const ks=De`
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
`;function Ss(){return a`
    <div class="skel-layout">
      <div class="skel skel-line skel-title"></div>
      <div class="skel skel-line" style="width:60%"></div>
      <div class="skel-grid">
        ${[1,2,3,4].map(()=>a`<div class="skel skel-card"></div>`)}
      </div>
    </div>
  `}function As(t){if(t.cost_api_amount==null)return"—";const e=t.cost_api_currency??"";return`${t.cost_api_amount.toFixed(2)} ${e}`.trim()}function Es(t){if(t==null||!Number.isFinite(t)||t<=0)return"—";const e=Math.floor(t/3600),s=Math.floor(t%3600/60);return e>0?`${e}h ${s}m`:`${s}m`}function Cs(t){return t?t.slice(0,10):"unknown"}function Ps(t,e,s){const o=s==="asc"?1:-1;return[...t].sort((r,i)=>{let n=0,c=0;switch(e){case"start":n=r.start?new Date(r.start).getTime():0,c=i.start?new Date(i.start).getTime():0;break;case"energy":n=r.energy_wh??0,c=i.energy_wh??0;break;case"cost":n=r.cost_estimate??0,c=i.cost_estimate??0;break;case"cost_api":n=r.cost_api_amount??0,c=i.cost_api_amount??0;break;case"reimb":n=r.reimbursement_estimate??0,c=i.reimbursement_estimate??0;break;case"solar":n=r.solar_share_pct??0,c=i.solar_share_pct??0;break;case"savings":n=r.solar_savings_estimate??0,c=i.solar_savings_estimate??0;break;case"duration":n=r.duration_s??0,c=i.duration_s??0;break;default:n=String(r.id),c=String(i.id)}return n<c?-1*o:n>c?1*o:0})}const ue=12;function Is(t,e,s,o,r,i,n){var b;let c=wt(t,e);c=Ps(c,s.column,s.dir);const l=t.chargers??[],d=p=>i(p),h=(((b=t.sessions_enriched)==null?void 0:b.length)??0)||t.sessions_active.length+t.sessions_recent.length;let u;if(o.groupByDay){const p=new Map;for(const g of c){const v=Cs(g.start??void 0),_=p.get(v)??[];_.push(g),p.set(v,_)}u=[...p.entries()].sort(([g],[v])=>v.localeCompare(g)).map(([g,v])=>({key:g,label:g==="unknown"?"Unknown date":g,rows:v}))}else u=[{key:"all",label:"",rows:c}];const m=p=>{var v,_;const g=o.expandedRowId===p.id;return a`
      <tr
        class="sess-row ${g?"sess-row--open":""}"
        @click=${()=>o.onToggleExpand(g?null:p.id)}
      >
        <td>${((v=p.start)==null?void 0:v.replace("T"," ").slice(0,19))??"—"}</td>
        <td>${Es(p.duration_s??void 0)}</td>
        <td class="mono">${p.charger_serial.slice(0,8)}…</td>
        <td>${p.energy_wh!=null?(p.energy_wh/1e3).toFixed(2):"—"}</td>
        <td>${As(p)}</td>
        <td>${p.cost_estimate??"—"}</td>
        <td>${p.reimbursement_estimate??"—"}</td>
        <td>${p.solar_share_pct??"—"}</td>
        <td>${p.solar_savings_estimate??"—"}</td>
        <td>
          ${p.user_display??p.user_label??p.user_id??"—"}${p.card_label?a`<br /><span class="muted mono small">${p.card_label}</span>`:""}
        </td>
        <td>${p.effective_mode??p.status}</td>
        <td class="muted small">${g?"▼":"▶"}</td>
      </tr>
      ${g?a`
            <tr class="sess-detail-row">
              <td colspan=${ue}>
                <div class="sess-detail card-inner">
                  <div class="mono small">Session ${p.id}</div>
                  <div class="mono small">Charger ${p.charger_serial}</div>
                  <p class="small">
                    End:
                    ${((_=p.end)==null?void 0:_.replace("T"," ").slice(0,19))??"—"} · Tariff
                    id: ${p.tariff_id??"—"}
                  </p>
                </div>
              </td>
            </tr>
          `:""}
    `};return a`
    ${t.api_partial?a`<div class="banner">
          Session list may be incomplete (partial API data).
        </div>`:""}
    <p class="muted small">
      Showing ${c.length} of ${h} session(s) in this payload.
    </p>
    <div class="sessions-toolbar card">
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
            ${l.map(p=>a`<option
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
        disabled
        title="Coming soon"
        @click=${n}
      >
        Export CSV (soon)
      </button>
    </div>
    <div class="table-wrap card">
      <table class="data-table data-table--sessions">
        <thead>
          <tr>
            <th @click=${()=>d("start")}>
              Start
              ${s.column==="start"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("duration")}>
              Duration
              ${s.column==="duration"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th>Charger</th>
            <th @click=${()=>d("energy")}>
              kWh
              ${s.column==="energy"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("cost_api")}>
              Cost (API)
              ${s.column==="cost_api"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("cost")}>
              Cost est.
              ${s.column==="cost"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("reimb")}>
              Reimb. est.
              ${s.column==="reimb"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("solar")}>
              Solar %
              ${s.column==="solar"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th @click=${()=>d("savings")}>
              Savings est.
              ${s.column==="savings"?s.dir==="asc"?"▲":"▼":""}
            </th>
            <th>User / card</th>
            <th>Mode</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${c.length===0?a`<tr>
                <td colspan=${ue} class="muted">
                  No sessions match filters.
                </td>
              </tr>`:u.flatMap(p=>[p.label?a`
                      <tr class="sess-group-head">
                        <td colspan=${ue}>
                          <strong>${p.label}</strong>
                          · ${p.rows.length} session(s) ·
                          ${p.rows.reduce((g,v)=>g+(v.energy_wh??0),0)/1e3} kWh
                        </td>
                      </tr>
                    `:a``,...p.rows.map(g=>m(g))])}
        </tbody>
      </table>
    </div>
  `}var Ts=Object.defineProperty,Ns=Object.getOwnPropertyDescriptor,K=(t,e,s,o)=>{for(var r=o>1?void 0:o?Ns(e,s):e,i=t.length-1,n;i>=0;i--)(n=t[i])&&(r=(o?n(e,s,r):n(r))||r);return o&&r&&Ts(e,s,r),r};const Os=[{id:"overview",label:"Overview"},{id:"chargers",label:"Chargers"},{id:"sessions",label:"Sessions"},{id:"economics",label:"Economics"},{id:"diagnostics",label:"Diagnostics"}];let R=class extends F{constructor(){super(...arguments),this.narrow=!1,this._tick=0,this._store=Ne(""),this._socketOpenHandler=()=>{this._loadPanel(!1)}}connectedCallback(){var s,o,r,i;super.connectedCallback();const t=((o=(s=this.panel)==null?void 0:s.config)==null?void 0:o.config_entry_id)??"";this._store=Ne(t),t&&!this._store.getState().selectedEntryId&&this._store.setState({selectedEntryId:t}),this._unsub=this._store.subscribe(()=>{this._tick++,this.requestUpdate()});const e=(r=this.hass)==null?void 0:r.connection.socket;(i=e==null?void 0:e.addEventListener)==null||i.call(e,"open",this._socketOpenHandler),this._bootstrap()}disconnectedCallback(){var e,s,o;super.disconnectedCallback(),(e=this._unsub)==null||e.call(this);const t=(s=this.hass)==null?void 0:s.connection.socket;(o=t==null?void 0:t.removeEventListener)==null||o.call(t,"open",this._socketOpenHandler)}updated(t){super.updated(t),t.has("hass")&&this.hass&&this._bootstrap()}get _entryId(){var t,e;return((e=(t=this.panel)==null?void 0:t.config)==null?void 0:e.config_entry_id)??""}async _bootstrap(){var t,e,s;if(!(!this.hass||!this._entryId))try{const o=await yt(this.hass);let i=this._store.getState().selectedEntryId;o.some(n=>n.entry_id===i)||(i=((t=o[0])==null?void 0:t.entry_id)??this._entryId),this._store.setState({entries:o.map(n=>({entry_id:n.entry_id,title:n.title})),selectedEntryId:i}),this._store.persistEntry(i),await this._loadPanel(!0)}catch(o){this._store.setState({entries:[{entry_id:this._entryId,title:((s=(e=this.panel)==null?void 0:e.config)==null?void 0:s.title)??"Smappee"}],selectedEntryId:this._store.getState().selectedEntryId||this._entryId}),await this._loadPanel(!0),this._store.setState({panelError:o instanceof Error?`Installations list failed: ${o.message}`:String(o)})}}async _loadPanel(t){if(!this.hass)return;const{selectedEntryId:e}=this._store.getState();if(e){t&&this._store.setState({connection:"loading",panelError:null});try{const s=await xt(this.hass,e,this._store.getState().advancedMode);this._store.setState({panel:s,connection:"connected",panelError:null,lastFetchAt:Date.now(),tabError:null}),this._loadHistory(s)}catch(s){this._store.setState({connection:"error",panelError:s instanceof Error?s.message:String(s)})}}}async _loadHistory(t){var o;if(!((o=this.hass)!=null&&o.callWS))return;const e=t.entity_map;if(!e)return;const s=Object.values(e).filter(r=>!!r);if(s.length){this._store.setState({historyLoading:!0});try{const r=await $t(this.hass,s);this._store.setState({historyByEntity:r,historyLoading:!1})}catch{this._store.setState({historyLoading:!1})}}}async _onRefresh(){const t=this._store.getState().selectedEntryId;if(!(!this.hass||!t)){try{await this.hass.callService("ha_smappee_overview","refresh",{config_entry_id:t})}catch{}await this._loadPanel(!1)}}_renderTab(t){const e=this._store.getState(),s=e.selectedEntryId,o=this.hass;try{switch(e.activeTab){case"overview":return ws(t,e.historyByEntity,t.entity_map,{connection:e.connection,historyLoading:e.historyLoading,narrow:this.narrow,hass:o,entryId:s,afterAction:()=>void this._loadPanel(!1),onOpenChargersTab:()=>this._store.setState({activeTab:"chargers"}),onOpenDiagnostics:()=>this._store.setState({activeTab:"diagnostics"})});case"devices":return Ut(t);case"chargers":return Tt(t,o,s,()=>void this._loadPanel(!1));case"sessions":return Is(t,e.sessionsFilters,e.sessionsSort,{groupByDay:e.sessionsGroupByDay,expandedRowId:e.sessionsExpandedRowId,onToggleGroupByDay:r=>this._store.setState({sessionsGroupByDay:r}),onToggleExpand:r=>this._store.setState({sessionsExpandedRowId:r})},r=>this._store.setState({sessionsFilters:{...e.sessionsFilters,...r}}),r=>{const i=e.sessionsSort.column===r;this._store.setState({sessionsSort:{column:r,dir:i&&e.sessionsSort.dir==="desc"?"asc":"desc"}})},()=>{});case"economics":return Wt(t,e.economicsPeriod,r=>this._store.setState({economicsPeriod:r}));case"diagnostics":return Dt(t);default:return a``}}catch(r){return console.error(r),a`
        <div class="tab-error">
          <p class="banner err">Something went wrong in this tab.</p>
          <button type="button" class="btn" @click=${()=>{this._store.setState({tabError:null}),this._loadPanel(!1)}}>
            Retry
          </button>
        </div>
      `}}render(){var i,n,c;const t=((n=(i=this.panel)==null?void 0:i.config)==null?void 0:n.title)??"Smappee",e=this._store.getState();if(this._tick,!this._entryId)return a`<div class="wrap">
        <div class="banner err">Missing panel configuration.</div>
      </div>`;const s=e.panel,o=At(s),r=((c=s==null?void 0:s.alerts)==null?void 0:c.length)??0;return a`
      <div class="wrap">
        <header class="header">
          <h1>${t}</h1>
          <div class="header-actions">
            <select
              aria-label="Installation"
              .value=${e.selectedEntryId}
              @change=${l=>{const d=l.target.value;this._store.persistEntry(d),this._store.setState({selectedEntryId:d}),this._loadPanel(!0)}}
            >
              ${e.entries.length?e.entries.map(l=>a`<option value=${l.entry_id}>${l.title}</option>`):a`<option value=${e.selectedEntryId}>${t}</option>`}
            </select>
            <button type="button" class="btn secondary" @click=${()=>void this._onRefresh()}>
              Refresh
            </button>
            <span
              class="pill ${e.connection==="connected"?"ok":e.connection==="loading"?"load":e.connection==="error"?"err":""}"
            >
              ${e.connection==="connected"?"Connected":e.connection==="loading"?"Loading…":e.connection==="error"?"Error":"Idle"}
            </span>
            ${s!=null&&s.last_successful_update?a`<span class="muted"
                  >Sync ${s.last_successful_update.replace("T"," ").slice(0,19)}Z</span
                >`:""}
            ${r>0?a`<span class="badge-alerts" title="Alerts">${r}</span>`:""}
            <label class="adv-toggle">
              <input
                type="checkbox"
                .checked=${e.advancedMode}
                @change=${l=>{const d=l.target.checked;this._store.persistAdvancedMode(d),this._loadPanel(!0)}}
              />
              Advanced mode
            </label>
          </div>
        </header>
        ${e.panelError&&e.connection==="error"?a`
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
            `:y}
        ${o?a`<div class="banner">${o}</div>`:y}
        <nav class="tabs" role="tablist">
          ${Os.map(l=>a`
              <button
                type="button"
                role="tab"
                class=${e.activeTab===l.id?"active":""}
                aria-selected=${e.activeTab===l.id}
                @click=${()=>this._store.setState({activeTab:l.id})}
              >
                ${l.label}
              </button>
            `)}
        </nav>
        ${e.connection==="loading"&&!s?Ss():s?a`${this._renderTab(s)}
                ${e.advancedMode?Lt(s):y}`:a`<p class="muted">No data</p>`}
      </div>
    `}};R.styles=[De`
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
  `,ks];K([se({attribute:!1})],R.prototype,"hass",2);K([se({type:Boolean})],R.prototype,"narrow",2);K([se({type:Object})],R.prototype,"panel",2);K([vt()],R.prototype,"_tick",2);R=K([ht("ha-smappee-overview-panel")],R);
