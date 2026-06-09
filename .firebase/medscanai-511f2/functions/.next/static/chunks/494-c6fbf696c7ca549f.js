"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[494],{3053:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var i,n=r(9523),o=r(3825),a=r(1626),s=r(6512);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(!function(e){let t=e.getComponent();return t?.type==="VERSION"}(e))return null;{let t=e.getImmediate();return`${t.library}/${t.version}`}}).filter(e=>e).join(" ")}}let c="@firebase/app",h="0.14.13",u=new o.Logger("@firebase/app"),d="[DEFAULT]",f={[c]:"fire-core","@firebase/app-compat":"fire-core-compat","@firebase/analytics":"fire-analytics","@firebase/analytics-compat":"fire-analytics-compat","@firebase/app-check":"fire-app-check","@firebase/app-check-compat":"fire-app-check-compat","@firebase/auth":"fire-auth","@firebase/auth-compat":"fire-auth-compat","@firebase/database":"fire-rtdb","@firebase/data-connect":"fire-data-connect","@firebase/database-compat":"fire-rtdb-compat","@firebase/functions":"fire-fn","@firebase/functions-compat":"fire-fn-compat","@firebase/installations":"fire-iid","@firebase/installations-compat":"fire-iid-compat","@firebase/messaging":"fire-fcm","@firebase/messaging-compat":"fire-fcm-compat","@firebase/performance":"fire-perf","@firebase/performance-compat":"fire-perf-compat","@firebase/remote-config":"fire-rc","@firebase/remote-config-compat":"fire-rc-compat","@firebase/storage":"fire-gcs","@firebase/storage-compat":"fire-gcs-compat","@firebase/firestore":"fire-fst","@firebase/firestore-compat":"fire-fst-compat","@firebase/ai":"fire-vertex","fire-js":"fire-js",firebase:"fire-js-all"},p=new Map,g=new Map,b=new Map;function m(e,t){try{e.container.addComponent(t)}catch(r){u.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,r)}}function v(e){let t=e.name;if(b.has(t))return u.debug(`There were multiple attempts to register component ${t}.`),!1;for(let r of(b.set(t,e),p.values()))m(r,e);for(let t of g.values())m(t,e);return!0}function _(e,t){let r=e.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),e.container.getProvider(t)}function E(e){return void 0!==e.options}function C(e){return!E(e)&&("authIdToken"in e||"appCheckToken"in e||"releaseOnDeref"in e||"automaticDataCollectionEnabled"in e)}let y=new a.ErrorFactory("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new n.Component("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw y.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function w(e,t){let r=a.base64Decode(e.split(".")[1]);if(null===r){console.error(`FirebaseServerApp ${t} is invalid: second part could not be parsed.`);return}if(void 0===JSON.parse(r).exp){console.error(`FirebaseServerApp ${t} is invalid: expiration claim could not be parsed`);return}1e3*JSON.parse(r).exp-new Date().getTime()<=0&&console.error(`FirebaseServerApp ${t} is invalid: the token has expired.`)}class S extends A{constructor(e,t,r,i){let n=void 0===t.automaticDataCollectionEnabled||t.automaticDataCollectionEnabled,o={name:r,automaticDataCollectionEnabled:n};void 0!==e.apiKey?super(e,o,i):super(e.options,o,i),this._serverConfig={automaticDataCollectionEnabled:n,...t},this._serverConfig.authIdToken&&w(this._serverConfig.authIdToken,"authIdToken"),this._serverConfig.appCheckToken&&w(this._serverConfig.appCheckToken,"appCheckToken"),this._finalizationRegistry=null,"undefined"!=typeof FinalizationRegistry&&(this._finalizationRegistry=new FinalizationRegistry(()=>{this.automaticCleanup()})),this._refCount=0,this.incRefCount(this._serverConfig.releaseOnDeref),this._serverConfig.releaseOnDeref=void 0,t.releaseOnDeref=void 0,L(c,h,"serverapp")}toJSON(){}get refCount(){return this._refCount}incRefCount(e){this.isDeleted||(this._refCount++,void 0!==e&&null!==this._finalizationRegistry&&this._finalizationRegistry.register(e,this))}decRefCount(){return this.isDeleted?0:--this._refCount}automaticCleanup(){O(this)}get settings(){return this.checkDestroyed(),this._serverConfig}checkDestroyed(){if(this.isDeleted)throw y.create("server-app-deleted")}}function I(e,t={}){let r=e;"object"!=typeof t&&(t={name:t});let i={name:d,automaticDataCollectionEnabled:!0,...t},o=i.name;if("string"!=typeof o||!o)throw y.create("bad-app-name",{appName:String(o)});if(r||(r=a.getDefaultAppConfig()),!r)throw y.create("no-options");let s=p.get(o);if(s){if(a.deepEqual(r,s.options)&&a.deepEqual(i,s.config))return s;throw y.create("duplicate-app",{appName:o})}let l=new n.ComponentContainer(o);for(let e of b.values())l.addComponent(e);let c=new A(r,i,l);return p.set(o,c),c}async function O(e){let t=!1,r=e.name;p.has(r)?(t=!0,p.delete(r)):g.has(r)&&0>=e.decRefCount()&&(g.delete(r),t=!0),t&&(await Promise.all(e.container.getProviders().map(e=>e.delete())),e.isDeleted=!0)}function L(e,t,r){let i=f[e]??e;r&&(i+=`-${r}`);let o=i.match(/\s|\//),a=t.match(/\s|\//);if(o||a){let e=[`Unable to register library "${i}" with version "${t}":`];o&&e.push(`library name "${i}" contains illegal characters (whitespace or "/")`),o&&a&&e.push("and"),a&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),u.warn(e.join(" "));return}v(new n.Component(`${i}-version`,()=>({library:i,version:t}),"VERSION"))}let D="firebase-heartbeat-store",P=null;function k(){return P||(P=s.openDB("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(D)}catch(e){console.warn(e)}}}).catch(e=>{throw y.create("idb-open",{originalErrorMessage:e.message})})),P}async function R(e){try{let t=(await k()).transaction(D),r=await t.objectStore(D).get(T(e));return await t.done,r}catch(e){if(e instanceof a.FirebaseError)u.warn(e.message);else{let t=y.create("idb-get",{originalErrorMessage:e?.message});u.warn(t.message)}}}async function N(e,t){try{let r=(await k()).transaction(D,"readwrite"),i=r.objectStore(D);await i.put(t,T(e)),await r.done}catch(e){if(e instanceof a.FirebaseError)u.warn(e.message);else{let t=y.create("idb-set",{originalErrorMessage:e?.message});u.warn(t.message)}}}function T(e){return`${e.name}!${e.options.appId}`}class M{constructor(e){this.container=e,this._heartbeatsCache=null;let t=this.container.getProvider("app").getImmediate();this._storage=new F(t),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){try{let e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),t=W();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===t||this._heartbeatsCache.heartbeats.some(e=>e.date===t))return;if(this._heartbeatsCache.heartbeats.push({date:t,agent:e}),this._heartbeatsCache.heartbeats.length>30){let e=function(e){if(0===e.length)return -1;let t=0,r=e[0].date;for(let i=1;i<e.length;i++)e[i].date<r&&(r=e[i].date,t=i);return t}(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){u.warn(e)}}async getHeartbeatsHeader(){try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||0===this._heartbeatsCache.heartbeats.length)return"";let e=W(),{heartbeatsToSend:t,unsentEntries:r}=function(e,t=1024){let r=[],i=e.slice();for(let n of e){let e=r.find(e=>e.agent===n.agent);if(e){if(e.dates.push(n.date),B(r)>t){e.dates.pop();break}}else if(r.push({agent:n.agent,dates:[n.date]}),B(r)>t){r.pop();break}i=i.slice(1)}return{heartbeatsToSend:r,unsentEntries:i}}(this._heartbeatsCache.heartbeats),i=a.base64urlEncodeWithoutPadding(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(e){return u.warn(e),""}}}function W(){return new Date().toISOString().substring(0,10)}class F{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!a.isIndexedDBAvailable()&&a.validateIndexedDBOpenable().then(()=>!0).catch(()=>!1)}async read(){if(!await this._canUseIndexedDBPromise)return{heartbeats:[]};{let e=await R(this.app);return e?.heartbeats?e:{heartbeats:[]}}}async overwrite(e){if(await this._canUseIndexedDBPromise){let t=await this.read();return N(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){if(await this._canUseIndexedDBPromise){let t=await this.read();return N(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:[...t.heartbeats,...e.heartbeats]})}}}function B(e){return a.base64urlEncodeWithoutPadding(JSON.stringify({version:2,heartbeats:e})).length}i="node",v(new n.Component("platform-logger",e=>new l(e),"PRIVATE")),v(new n.Component("heartbeat",e=>new M(e),"PRIVATE")),L(c,h,i),L(c,h,"cjs2020"),L("fire-js",""),Object.defineProperty(t,"FirebaseError",{enumerable:!0,get:function(){return a.FirebaseError}}),t.SDK_VERSION="12.14.0",t._DEFAULT_ENTRY_NAME=d,t._addComponent=m,t._addOrOverwriteComponent=function(e,t){e.container.addOrOverwriteComponent(t)},t._apps=p,t._clearComponents=function(){b.clear()},t._components=b,t._getProvider=_,t._isFirebaseApp=E,t._isFirebaseServerApp=function(e){return null!=e&&void 0!==e.settings},t._isFirebaseServerAppSettings=C,t._registerComponent=v,t._removeServiceInstance=function(e,t,r=d){_(e,t).clearInstance(r)},t._serverApps=g,t.deleteApp=O,t.getApp=function(e=d){let t=p.get(e);if(!t&&e===d&&a.getDefaultAppConfig())return I();if(!t)throw y.create("no-app",{appName:e});return t},t.getApps=function(){return Array.from(p.values())},t.initializeApp=I,t.initializeServerApp=function(e,t={}){let r;if(a.isBrowser()&&!a.isWebWorker())throw y.create("invalid-server-app-environment");let i=t||{};if(e&&(E(e)?r=e.options:C(e)?i=e:r=e),void 0===i.automaticDataCollectionEnabled&&(i.automaticDataCollectionEnabled=!0),r||(r=a.getDefaultAppConfig()),!r)throw y.create("no-options");let o={...i,...r};if(void 0!==o.releaseOnDeref&&delete o.releaseOnDeref,void 0!==i.releaseOnDeref&&"undefined"==typeof FinalizationRegistry)throw y.create("finalization-registry-not-supported",{});let s=""+[...JSON.stringify(o)].reduce((e,t)=>Math.imul(31,e)+t.charCodeAt(0)|0,0),l=g.get(s);if(l)return l.incRefCount(i.releaseOnDeref),l;let c=new n.ComponentContainer(s);for(let e of b.values())c.addComponent(e);let h=new S(r,i,s,c);return g.set(s,h),h},t.onLog=function(e,t){if(null!==e&&"function"!=typeof e)throw y.create("invalid-log-argument");o.setUserLogHandler(e,t)},t.registerVersion=L,t.setLogLevel=function(e){o.setLogLevel(e)}},9523:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var i=r(1626);class n{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let o="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){let e=new i.Deferred;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:t});r&&e.resolve(r)}catch(e){}}return this.instancesDeferred.get(t).promise}getImmediate(e){let t=this.normalizeInstanceIdentifier(e?.identifier),r=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(e){if(r)return null;throw e}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if("EAGER"===e.instantiationMode)try{this.getOrInitializeService({instanceIdentifier:o})}catch(e){}for(let[e,t]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(e);try{let e=this.getOrInitializeService({instanceIdentifier:r});t.resolve(e)}catch(e){}}}}clearInstance(e=o){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=o){return this.instances.has(e)}getOptions(e=o){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(let[e,t]of this.instancesDeferred.entries())r===this.normalizeInstanceIdentifier(e)&&t.resolve(i);return i}onInit(e,t){let r=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);let n=this.instances.get(r);return n&&e(n,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){let r=this.onInitCallbacks.get(t);if(r)for(let i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:e===o?void 0:e,options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=o){return this.component?this.component.multipleInstances?e:o:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let t=this.getProvider(e.name);if(t.isComponentSet())throw Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let t=new a(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}t.Component=n,t.ComponentContainer=s,t.Provider=a},3825:function(e,t){var r;Object.defineProperty(t,"__esModule",{value:!0});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let i=[];t.LogLevel=void 0,(r=t.LogLevel||(t.LogLevel={}))[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT";let n={debug:t.LogLevel.DEBUG,verbose:t.LogLevel.VERBOSE,info:t.LogLevel.INFO,warn:t.LogLevel.WARN,error:t.LogLevel.ERROR,silent:t.LogLevel.SILENT},o=t.LogLevel.INFO,a={[t.LogLevel.DEBUG]:"log",[t.LogLevel.VERBOSE]:"log",[t.LogLevel.INFO]:"info",[t.LogLevel.WARN]:"warn",[t.LogLevel.ERROR]:"error"},s=(e,t,...r)=>{if(t<e.logLevel)return;let i=new Date().toISOString(),n=a[t];if(n)console[n](`[${i}]  ${e.name}:`,...r);else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class l{constructor(e){this.name=e,this._logLevel=o,this._logHandler=s,this._userLogHandler=null,i.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in t.LogLevel))throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?n[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,t.LogLevel.DEBUG,...e),this._logHandler(this,t.LogLevel.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,t.LogLevel.VERBOSE,...e),this._logHandler(this,t.LogLevel.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,t.LogLevel.INFO,...e),this._logHandler(this,t.LogLevel.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,t.LogLevel.WARN,...e),this._logHandler(this,t.LogLevel.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,t.LogLevel.ERROR,...e),this._logHandler(this,t.LogLevel.ERROR,...e)}}t.Logger=l,t.setLogLevel=function(e){i.forEach(t=>{t.setLogLevel(e)})},t.setUserLogHandler=function(e,r){for(let o of i){let i=null;r&&r.level&&(i=n[r.level]),null===e?o.userLogHandler=null:o.userLogHandler=(r,n,...o)=>{let a=o.map(e=>{if(null==e)return null;if("string"==typeof e)return e;if("number"==typeof e||"boolean"==typeof e)return e.toString();if(e instanceof Error)return e.message;try{return JSON.stringify(e)}catch(e){return null}}).filter(e=>e).join(" ");n>=(i??r.logLevel)&&e({level:t.LogLevel[n].toLowerCase(),message:a,args:o,type:r.name})}}}},1626:function(e,t,r){var i=r(357);Object.defineProperty(t,"__esModule",{value:!0});var n=r(7099);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let o={NODE_CLIENT:!1,NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"},a=function(e,t){if(!e)throw s(t)},s=function(e){return Error("Firebase Database ("+o.SDK_VERSION+") INTERNAL ASSERT FAILED: "+e)},l=function(e){let t=[],r=0;for(let i=0;i<e.length;i++){let n=e.charCodeAt(i);n<128?t[r++]=n:(n<2048?t[r++]=n>>6|192:((64512&n)==55296&&i+1<e.length&&(64512&e.charCodeAt(i+1))==56320?(n=65536+((1023&n)<<10)+(1023&e.charCodeAt(++i)),t[r++]=n>>18|240,t[r++]=n>>12&63|128):t[r++]=n>>12|224,t[r++]=n>>6&63|128),t[r++]=63&n|128)}return t},c=function(e){let t=[],r=0,i=0;for(;r<e.length;){let n=e[r++];if(n<128)t[i++]=String.fromCharCode(n);else if(n>191&&n<224){let o=e[r++];t[i++]=String.fromCharCode((31&n)<<6|63&o)}else if(n>239&&n<365){let o=((7&n)<<18|(63&e[r++])<<12|(63&e[r++])<<6|63&e[r++])-65536;t[i++]=String.fromCharCode(55296+(o>>10)),t[i++]=String.fromCharCode(56320+(1023&o))}else{let o=e[r++],a=e[r++];t[i++]=String.fromCharCode((15&n)<<12|(63&o)<<6|63&a)}}return t.join("")},h={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let r=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let t=0;t<e.length;t+=3){let n=e[t],o=t+1<e.length,a=o?e[t+1]:0,s=t+2<e.length,l=s?e[t+2]:0,c=n>>2,h=(3&n)<<4|a>>4,u=(15&a)<<2|l>>6,d=63&l;s||(d=64,o||(u=64)),i.push(r[c],r[h],r[u],r[d])}return i.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(l(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):c(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let r=t?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let t=0;t<e.length;){let n=r[e.charAt(t++)],o=t<e.length?r[e.charAt(t)]:0,a=++t<e.length?r[e.charAt(t)]:64,s=++t<e.length?r[e.charAt(t)]:64;if(++t,null==n||null==o||null==a||null==s)throw new u;let l=n<<2|o>>4;if(i.push(l),64!==a){let e=o<<4&240|a>>2;if(i.push(e),64!==s){let e=a<<6&192|s;i.push(e)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class u extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}let d=function(e){let t=l(e);return h.encodeByteArray(t,!0)},f=function(e){return d(e).replace(/\./g,"")},p=function(e){try{return h.decodeString(e,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function g(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:return new Date(t.getTime());case Object:void 0===e&&(e={});break;case Array:e=[];break;default:return t}for(let r in t)t.hasOwnProperty(r)&&"__proto__"!==r&&(e[r]=g(e[r],t[r]));return e}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==r.g)return r.g;throw Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let m=()=>b().__FIREBASE_DEFAULTS__,v=()=>{if(void 0===i||void 0===i.env)return;let e=i.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},_=()=>{let e;if("undefined"==typeof document)return;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(e){return}let t=e&&p(e[1]);return t&&JSON.parse(t)},E=()=>{try{return n.getDefaultsFromPostinstall()||m()||v()||_()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}},C=e=>E()?.emulatorHosts?.[e];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function A(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function w(){let e=E()?.forceEnvironment;if("node"===e)return!0;if("browser"===e)return!1;try{return"[object process]"===Object.prototype.toString.call(r.g.process)}catch(e){return!1}}function S(){return"undefined"!=typeof WorkerGlobalScope&&"undefined"!=typeof self&&self instanceof WorkerGlobalScope}class I extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name="FirebaseError",Object.setPrototypeOf(this,I.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,O.prototype.create)}}class O{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){let r=t[0]||{},i=`${this.service}/${e}`,n=this.errors[e],o=n?n.replace(L,(e,t)=>{let i=r[t];return null!=i?String(i):`<${t}?>`}):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new I(i,a,r)}}let L=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(e){return JSON.parse(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let P=function(e){let t={},r={},i={},n="";try{let o=e.split(".");t=D(p(o[0])||""),r=D(p(o[1])||""),n=o[2],i=r.d||{},delete r.d}catch(e){}return{header:t,claims:r,data:i,signature:n}};function k(e){return null!==e&&"object"==typeof e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=64,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){let r,i;t||(t=0);let n=this.W_;if("string"==typeof e)for(let r=0;r<16;r++)n[r]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let r=0;r<16;r++)n[r]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let e=16;e<80;e++){let t=n[e-3]^n[e-8]^n[e-14]^n[e-16];n[e]=(t<<1|t>>>31)&4294967295}let o=this.chain_[0],a=this.chain_[1],s=this.chain_[2],l=this.chain_[3],c=this.chain_[4];for(let e=0;e<80;e++){e<40?e<20?(r=l^a&(s^l),i=1518500249):(r=a^s^l,i=1859775393):e<60?(r=a&s|l&(a|s),i=2400959708):(r=a^s^l,i=3395469782);let t=(o<<5|o>>>27)+r+c+i+n[e]&4294967295;c=l,l=s,s=(a<<30|a>>>2)&4294967295,a=o,o=t}this.chain_[0]=this.chain_[0]+o&4294967295,this.chain_[1]=this.chain_[1]+a&4294967295,this.chain_[2]=this.chain_[2]+s&4294967295,this.chain_[3]=this.chain_[3]+l&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,t){if(null==e)return;void 0===t&&(t=e.length);let r=t-this.blockSize,i=0,n=this.buf_,o=this.inbuf_;for(;i<t;){if(0===o)for(;i<=r;)this.compress_(e,i),i+=this.blockSize;if("string"==typeof e){for(;i<t;)if(n[o]=e.charCodeAt(i),++o,++i,o===this.blockSize){this.compress_(n),o=0;break}}else for(;i<t;)if(n[o]=e[i],++o,++i,o===this.blockSize){this.compress_(n),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){let e=[],t=8*this.total_;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let e=this.blockSize-1;e>=56;e--)this.buf_[e]=255&t,t/=256;this.compress_(this.buf_);let r=0;for(let t=0;t<5;t++)for(let i=24;i>=0;i-=8)e[r]=this.chain_[t]>>i&255,++r;return e}}class N{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(e=>{this.error(e)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(void 0===e&&void 0===t&&void 0===r)throw Error("Missing Observer.");void 0===(i=!function(e,t){if("object"!=typeof e||null===e)return!1;for(let r of t)if(r in e&&"function"==typeof e[r])return!0;return!1}(e,["next","error","complete"])?{next:e,error:t,complete:r}:e).next&&(i.next=T),void 0===i.error&&(i.error=T),void 0===i.complete&&(i.complete=T);let n=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch(e){}}),this.observers.push(i),n}unsubscribeOne(e){void 0!==this.observers&&void 0!==this.observers[e]&&(delete this.observers[e],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[e])try{t(this.observers[e])}catch(e){"undefined"!=typeof console&&console.error&&console.error(e)}})}close(e){this.finalized||(this.finalized=!0,void 0!==e&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function T(){}function M(e,t){return`${e} failed: ${t} argument `}async function W(e){return(await fetch(e,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function F(e){let t=new TextEncoder().encode(e);return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",t))).map(e=>e.toString(16).padStart(2,"0")).join("")}t.CONSTANTS=o,t.DecodeBase64StringError=u,t.Deferred=y,t.ErrorFactory=O,t.FirebaseError=I,t.MAX_VALUE_MILLIS=144e5,t.RANDOM_FACTOR=.5,t.Sha1=R,t.areCookiesEnabled=function(){return"undefined"!=typeof navigator&&!!navigator.cookieEnabled},t.assert=a,t.assertionError=s,t.async=function(e,t){return(...r)=>{Promise.resolve(!0).then(()=>{e(...r)}).catch(e=>{t&&t(e)})}},t.base64=h,t.base64Decode=p,t.base64Encode=d,t.base64urlEncodeWithoutPadding=f,t.calculateBackoffMillis=function(e,t=1e3,r=2){let i=t*Math.pow(r,e);return Math.min(144e5,i+Math.round(.5*i*(Math.random()-.5)*2))},t.contains=/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.createMockUserToken=/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t){if(e.uid)throw Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let r=t||"demo-project",i=e.iat||0,n=e.sub||e.user_id;if(!n)throw Error("mockUserToken must contain 'sub' or 'user_id' field!");let o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:n,user_id:n,firebase:{sign_in_provider:"custom",identities:{}},...e};return[f(JSON.stringify({alg:"none",type:"JWT"})),f(JSON.stringify(o)),""].join(".")},t.createSubscribe=function(e,t){let r=new N(e,t);return r.subscribe.bind(r)},t.decode=P,t.deepCopy=/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){return g(void 0,e)},t.deepEqual=function e(t,r){if(t===r)return!0;let i=Object.keys(t),n=Object.keys(r);for(let o of i){if(!n.includes(o))return!1;let i=t[o],a=r[o];if(k(i)&&k(a)){if(!e(i,a))return!1}else if(i!==a)return!1}for(let e of n)if(!i.includes(e))return!1;return!0},t.deepExtend=g,t.errorPrefix=M,t.extractQuerystring=function(e){let t=e.indexOf("?");if(!t)return"";let r=e.indexOf("#",t);return e.substring(t,r>0?r:void 0)},t.generateSHA256Hash=F,t.getDefaultAppConfig=()=>E()?.config,t.getDefaultEmulatorHost=C,t.getDefaultEmulatorHostnameAndPort=e=>{let t=C(e);if(!t)return;let r=t.lastIndexOf(":");if(r<=0||r+1===t.length)throw Error(`Invalid host ${t} with no separate hostname and port!`);let i=parseInt(t.substring(r+1),10);return"["===t[0]?[t.substring(1,r-1),i]:[t.substring(0,r),i]},t.getDefaults=E,t.getExperimentalSetting=e=>E()?.[`_${e}`],t.getGlobal=b,t.getModularInstance=/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){return e&&e._delegate?e._delegate:e},t.getUA=A,t.isAdmin=function(e){let t=P(e).claims;return"object"==typeof t&&!0===t.admin},t.isBrowser=function(){return"undefined"!=typeof window||S()},t.isBrowserExtension=function(){let e="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof e&&void 0!==e.id},t.isCloudWorkstation=/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){try{return(e.startsWith("http://")||e.startsWith("https://")?new URL(e).hostname:e).endsWith(".cloudworkstations.dev")}catch{return!1}},t.isCloudflareWorker=function(){return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent},t.isElectron=function(){return A().indexOf("Electron/")>=0},t.isEmpty=function(e){for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0},t.isIE=function(){let e=A();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0},t.isIndexedDBAvailable=function(){try{return"object"==typeof indexedDB}catch(e){return!1}},t.isMobileCordova=function(){return"undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(A())},t.isNode=w,t.isNodeSdk=function(){return!0===o.NODE_CLIENT||!0===o.NODE_ADMIN},t.isReactNative=function(){return"object"==typeof navigator&&"ReactNative"===navigator.product},t.isSafari=function(){return!w()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")},t.isSafariOrWebkit=function(){return!w()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")},t.isUWP=function(){return A().indexOf("MSAppHost/")>=0},t.isValidFormat=function(e){let t=P(e).claims;return!!t&&"object"==typeof t&&t.hasOwnProperty("iat")},t.isValidTimestamp=function(e){let t=P(e).claims,r=Math.floor(new Date().getTime()/1e3),i=0,n=0;return"object"==typeof t&&(t.hasOwnProperty("nbf")?i=t.nbf:t.hasOwnProperty("iat")&&(i=t.iat),n=t.hasOwnProperty("exp")?t.exp:i+86400),!!r&&!!i&&!!n&&r>=i&&r<=n},t.isWebWorker=S,t.issuedAtTime=function(e){let t=P(e).claims;return"object"==typeof t&&t.hasOwnProperty("iat")?t.iat:null},t.jsonEval=D,t.map=function(e,t,r){let i={};for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&(i[n]=t.call(r,e[n],n,e));return i},t.ordinal=/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){return Number.isFinite(e)?e+function(e){let t=(e=Math.abs(e))%100;if(t>=10&&t<=20)return"th";let r=e%10;return 1===r?"st":2===r?"nd":3===r?"rd":"th"}(e):`${e}`},t.pingServer=W,t.promiseWithTimeout=/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t=2e3){let r=new y;return setTimeout(()=>r.reject("timeout!"),t),e.then(r.resolve,r.reject),r.promise},t.querystring=/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){let t=[];for(let[r,i]of Object.entries(e))Array.isArray(i)?i.forEach(e=>{t.push(encodeURIComponent(r)+"="+encodeURIComponent(e))}):t.push(encodeURIComponent(r)+"="+encodeURIComponent(i));return t.length?"&"+t.join("&"):""},t.querystringDecode=function(e){let t={};return e.replace(/^\?/,"").split("&").forEach(e=>{if(e){let[r,i]=e.split("=");t[decodeURIComponent(r)]=decodeURIComponent(i)}}),t},t.safeGet=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)?e[t]:void 0},t.stringLength=function(e){let t=0;for(let r=0;r<e.length;r++){let i=e.charCodeAt(r);i<128?t++:i<2048?t+=2:i>=55296&&i<=56319?(t+=4,r++):t+=3}return t},t.stringToByteArray=function(e){let t=[],r=0;for(let i=0;i<e.length;i++){let n=e.charCodeAt(i);if(n>=55296&&n<=56319){let t=n-55296;a(++i<e.length,"Surrogate pair missing trail surrogate."),n=65536+(t<<10)+(e.charCodeAt(i)-56320)}n<128?t[r++]=n:(n<2048?t[r++]=n>>6|192:(n<65536?t[r++]=n>>12|224:(t[r++]=n>>18|240,t[r++]=n>>12&63|128),t[r++]=n>>6&63|128),t[r++]=63&n|128)}return t},t.stringify=function(e){return JSON.stringify(e)},t.validateArgCount=function(e,t,r,i){let n;if(i<t?n="at least "+t:i>r&&(n=0===r?"none":"no more than "+r),n)throw Error(e+" failed: Was called with "+i+(1===i?" argument.":" arguments.")+" Expects "+n+".")},t.validateCallback=function(e,t,r,i){if((!i||r)&&"function"!=typeof r)throw Error(M(e,t)+"must be a valid function.")},t.validateContextObject=function(e,t,r,i){if((!i||r)&&("object"!=typeof r||null===r))throw Error(M(e,t)+"must be a valid context object.")},t.validateIndexedDBOpenable=function(){return new Promise((e,t)=>{try{let r=!0,i="validate-browser-context-for-indexeddb-analytics-module",n=self.indexedDB.open(i);n.onsuccess=()=>{n.result.close(),r||self.indexedDB.deleteDatabase(i),e(!0)},n.onupgradeneeded=()=>{r=!1},n.onerror=()=>{t(n.error?.message||"")}}catch(e){t(e)}})},t.validateNamespace=function(e,t,r){if((!r||t)&&"string"!=typeof t)throw Error(M(e,"namespace")+"must be a valid firebase namespace.")}},7099:function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.getDefaultsFromPostinstall=()=>void 0},9494:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var i=r(5290);Object.keys(i).forEach(function(e){"default"===e||t.hasOwnProperty(e)||Object.defineProperty(t,e,{enumerable:!0,get:function(){return i[e]}})})},5290:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0});var i=r(5036);r(3053),r(1626),r(3825),r(9523),t.ActionCodeOperation=i.ActionCodeOperation,t.ActionCodeURL=i.ActionCodeURL,t.AuthCredential=i.AuthCredential,t.AuthErrorCodes=i.AUTH_ERROR_CODES_MAP_DO_NOT_USE_INTERNALLY,t.EmailAuthCredential=i.EmailAuthCredential,t.EmailAuthProvider=i.EmailAuthProvider,t.FacebookAuthProvider=i.FacebookAuthProvider,t.FactorId=i.FactorId,t.GithubAuthProvider=i.GithubAuthProvider,t.GoogleAuthProvider=i.GoogleAuthProvider,t.OAuthCredential=i.OAuthCredential,t.OAuthProvider=i.OAuthProvider,t.OperationType=i.OperationType,t.PhoneAuthCredential=i.PhoneAuthCredential,t.PhoneAuthProvider=i.PhoneAuthProvider,t.PhoneMultiFactorGenerator=i.PhoneMultiFactorGenerator,t.ProviderId=i.ProviderId,t.RecaptchaVerifier=i.RecaptchaVerifier,t.SAMLAuthProvider=i.SAMLAuthProvider,t.SignInMethod=i.SignInMethod,t.TotpMultiFactorGenerator=i.TotpMultiFactorGenerator,t.TotpSecret=i.TotpSecret,t.TwitterAuthProvider=i.TwitterAuthProvider,t.applyActionCode=i.applyActionCode,t.beforeAuthStateChanged=i.beforeAuthStateChanged,t.browserCookiePersistence=i.browserCookiePersistence,t.browserLocalPersistence=i.browserLocalPersistence,t.browserPopupRedirectResolver=i.browserPopupRedirectResolver,t.browserSessionPersistence=i.browserSessionPersistence,t.checkActionCode=i.checkActionCode,t.confirmPasswordReset=i.confirmPasswordReset,t.connectAuthEmulator=i.connectAuthEmulator,t.createUserWithEmailAndPassword=i.createUserWithEmailAndPassword,t.debugErrorMap=i.debugErrorMap,t.deleteUser=i.deleteUser,t.fetchSignInMethodsForEmail=i.fetchSignInMethodsForEmail,t.getAdditionalUserInfo=i.getAdditionalUserInfo,t.getAuth=i.getAuth,t.getIdToken=i.getIdToken,t.getIdTokenResult=i.getIdTokenResult,t.getMultiFactorResolver=i.getMultiFactorResolver,t.getRedirectResult=i.getRedirectResult,t.inMemoryPersistence=i.inMemoryPersistence,t.indexedDBLocalPersistence=i.indexedDBLocalPersistence,t.initializeAuth=i.initializeAuth,t.initializeRecaptchaConfig=i.initializeRecaptchaConfig,t.isSignInWithEmailLink=i.isSignInWithEmailLink,t.linkWithCredential=i.linkWithCredential,t.linkWithPhoneNumber=i.linkWithPhoneNumber,t.linkWithPopup=i.linkWithPopup,t.linkWithRedirect=i.linkWithRedirect,t.multiFactor=i.multiFactor,t.onAuthStateChanged=i.onAuthStateChanged,t.onIdTokenChanged=i.onIdTokenChanged,t.parseActionCodeURL=i.parseActionCodeURL,t.prodErrorMap=i.prodErrorMap,t.reauthenticateWithCredential=i.reauthenticateWithCredential,t.reauthenticateWithPhoneNumber=i.reauthenticateWithPhoneNumber,t.reauthenticateWithPopup=i.reauthenticateWithPopup,t.reauthenticateWithRedirect=i.reauthenticateWithRedirect,t.reload=i.reload,t.revokeAccessToken=i.revokeAccessToken,t.sendEmailVerification=i.sendEmailVerification,t.sendPasswordResetEmail=i.sendPasswordResetEmail,t.sendSignInLinkToEmail=i.sendSignInLinkToEmail,t.setPersistence=i.setPersistence,t.signInAnonymously=i.signInAnonymously,t.signInWithCredential=i.signInWithCredential,t.signInWithCustomToken=i.signInWithCustomToken,t.signInWithEmailAndPassword=i.signInWithEmailAndPassword,t.signInWithEmailLink=i.signInWithEmailLink,t.signInWithPhoneNumber=i.signInWithPhoneNumber,t.signInWithPopup=i.signInWithPopup,t.signInWithRedirect=i.signInWithRedirect,t.signOut=i.signOut,t.unlink=i.unlink,t.updateCurrentUser=i.updateCurrentUser,t.updateEmail=i.updateEmail,t.updatePassword=i.updatePassword,t.updatePhoneNumber=i.updatePhoneNumber,t.updateProfile=i.updateProfile,t.useDeviceLanguage=i.useDeviceLanguage,t.validatePassword=i.validatePassword,t.verifyBeforeUpdateEmail=i.verifyBeforeUpdateEmail,t.verifyPasswordResetCode=i.verifyPasswordResetCode}}]);