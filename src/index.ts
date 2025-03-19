import components from './components'
import { clean, _, pad, log,resize, app, setApp, initDB, MsgBox, date, db, getStoredList, id, setupApp, getConfigApp, buildPopupMenu } from './commons'
import './cdn/theme.css'
const VForm = components.VForm;
import {Drag} from './Drag'

export { resize, app, initDB, date, db, _, pad, getStoredList,Drag, VForm, MsgBox, useAppStore, id, setupApp };

import { getCurrentInstance, onMounted, onUnmounted, reactive, provide, computed, ref, watch } from "vue";
import { useRouter } from 'vue-router';
import { useAppStore } from './useAppStore';
export const IsobitUI = {
	install(vApp: any) {
		setApp(vApp);
		vApp.BUILT_ON = import.meta.env.VITE_APP_BUILT_ON;
		for (const prop in components) {
			if (components.hasOwnProperty(prop)) {
				const component = (components as any)[prop]
				vApp.component(component.name || prop, component)
			}
		}
	}
}

setTimeout(resize, 400);

window.addEventListener('resize', () => {
	setTimeout(resize, 400);
});
export const removeError = (e) => {
	let previousElementSibling = e.previousElementSibling;
	if (previousElementSibling && previousElementSibling.classList && previousElementSibling.classList.contains('v-error')) {
		previousElementSibling.parentNode.removeChild(previousElementSibling);
	}
}

const getCurrentPosition = () => {
	return new Promise(function (res, rej) {
		if (_.location) {
			var id = 'result' + _.id();
			_[id] = function (r) {
				delete _[id];
				if (r.coords) {
					res(r);
				} else
					rej(r);
			};
			_.location(id);
		} else if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(res, rej);
		}
	})
}
export const ui = (cfg) => {

	const defs = {

		computed: {
			user() {
				return _.app.session;
			},
			perms() {
				return this.session.perms || this.session.allcaps || {};
			}
		},
		data() {
			let me = this;
			return {
				app2: null,
				ui: me,
				_session: null, x_connected_: null,
				row: {},
				networkStatus: { connected: null }
			}
		},
		methods: {
			get(part) {
				let me = this;
				let p = me.$el;
				//Se debe buscar si abajo esta el form
				let f = p.querySelector("form");
				let action = f.action;
				//console.log(me.apiLink(action) + '/' + part);
				window.location.href = me.apiLink(action) + '/' + part;
			},
			async sync(e) {
				let me = this;
				let p = me.$el;
				let f = p.querySelector("form");
				let action = f.getAttribute('action');
				//console.log('Action='+action);
				if (!action) {
					action = me.$el.parentNode.getAttribute('path');
					//debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
					let tc = action.split('/');
					if (tc[tc.length - 1] == 'edit')
						tc = tc.splice(0, tc.length - 2);
					else
						tc = tc.splice(0, tc.length - 1);
					action = me.apiLink(tc.join('/'));
				}
				let t = me.$children[0].$children[0];
				action = t.src;
				//debe recorrerse toda los registros seleccionados
				//ponerlos gris
				let dats = await me.getStoredList(t.store);
				let sel = t.selected;
				let sel2 = [];
				let sel3 = [];
				for (let i = 0; i < sel.length; i++) {
					//se recupra
					let item = t.data[sel[i]];
					if (item.tmpId && !item.synchronized) {
						for (let j = 0; j < dats.length; j++) {
							if (dats[j].tmpId == item.tmpId) {
								let o = JSON.clone(dats[j]);
								delete o.synchronized;
								sel3.push(o);
								sel2.push(j);
							}
						}
					}
				}
				//se envia solo los selccionados
				if (sel2.length > 0) {
					axios.post(action + '/bulk' + (e.sufix ? e.sufix : ''), sel3).then(function (r) {
						let d = r.data;
						//console.log(d);
						for (let k = 0; k < d.length; k++) {
							if (d[k].errors) { MsgBox(JSON.stringify(d[k].errors)); break; }
							if (d[k].error) { MsgBox(d[k].error); break; }
							for (let j = 0; j < dats.length; j++) {
								//cada registro recibido de bulk ss compara con los locales
								if (d[k].ext && d[k].ext.tmpId == dats[j].tmpId
									|| d[k].tmpId == dats[j].tmpId) {
									log('ui.ok');
									if (d[k].ext && dats.ext) {
										dats[j].ext.error = d[k].ext.error;
									}
									if (d[k].id) dats[j].id = d[k].id;
									//aqui deberia revisarsee los registro anidados
									dats[j].synchronized = 1;
									emit('sync', d[k], dats[j]);
								}
							}
						}
						me.setStoredList(t.store, dats);
						//dat.id=r.data.id;
						//t.$emit('synchronized',{data:dat,result:r.data,index:kk,count:tr});
						//dat.synchronized=1;
						//dats[kk]=dat;
						//sendf(dats,k0+1,te+1);
						me.refresh();
					}).catch(function (r) {
						if (r.response) {
							MsgBox(r.response.data);
						} else {
							console.log(r);
						}
					});
				}
			}
		}
	}
	if (!cfg) cfg = { data: { o: {} } };
	const { setup, ...other } = cfg;
	const customSetup = setup;
	cfg = {
		mixins: [defs, other],
		setup(props: any, ctx: any) {

			const app = useAppStore();

			app.config(getConfigApp());

			const me = props;

			let router = useRouter();

			const ci = getCurrentInstance();

			const views: any[] = reactive([]);

			const viewCollector = {
				remove(view: any[]) {
					views.splice(views.indexOf(view), 1);
				},
				push(view: any) {
					views.push(view);
				}
			};

			const _error = (e) => {
				//console.log(e);
				alert(e);
				//this.open({data:''+e});
			}

			const getStoredList = async (store/*, params*/) => {
				const component = ci.proxy;
				const db = _.db;
				let loadedStores;
				try {
					loadedStores = JSON.parse(sessionStorage.getItem('loadedStores'));
				} catch (_e) { loadedStores == null }
				if (loadedStores == null) loadedStores = {};
				//console.log(loadedStores);
				if (!loadedStores[store] && component.connected) {
					let e = _.stores.filter(e => e[0] == store)[0];
					//console.log(e);
					if (!e[2]) throw `ERROR: Url for store '${e[0]}' is empty!`;
					let data = await app.axios.get(e[2]);
					data = data.data || data;
					await new Promise((resolve, reject) => {
						let transaction = db.transaction([e[0]], "readwrite");
						let objectStore = transaction.objectStore(e[0]);
						const objectStoreRequest = objectStore.clear();
						objectStoreRequest.onsuccess = () => {
							data.forEach((item) => {
								objectStore.add(item).onerror = (e) => {
									console.error(`⚠️ Store '${e[0]}' error addd data!`, e);
								}
							});
						};
						objectStoreRequest.onerror = () => {
							console.error(`⚠️ Store '${e[0]}' error data!`, e);
						};
						transaction.oncomplete = () => {
							loadedStores[store] = 1;
							sessionStorage.setItem('loadedStores', JSON.stringify(loadedStores));
							resolve();
						};
						transaction.onerror = (e) => {
							console.error(`ERROR: ⚠️ Error en la transacción for store '${e[0]}'!`, e);
							reject();
						};
					});
				}
				let result = await new Promise((resolve, rejected) => {
					if (db) {
						const transaction = db.transaction(store), objectStore = transaction.objectStore(store);
						const getAllRequest = objectStore.getAll();
						getAllRequest.onsuccess = () => {
							resolve(getAllRequest.result);
						}
					} else {
						console.log('1=========>db=', window._.db);
						rejected('=======>db is null esta faltando');
					}
					//t.onerror = event => reject(event.target.error);
				});
				return result;
			}

			const refresh = () => {
				views.find(view => view.type == 'v-table')();
			}

			const rewrite = (url: string) => {
				return '/admin' + url;
			}

			const open = (response: any, path?: any, o?: any) => {
				if (!(response.$el) && !(response instanceof HTMLElement)) {
					let e = response;
					let t = e.target;
					if (typeof e == 'string') {
						t = e;
					} else if (t.tagName == "ION-ITEM" && t.href) {
						e.preventDefault();
						t = t.href;
					} else {
						e.preventDefault();
						if (!t.pathname) t = t.parentNode;
						if (!t.pathname) t = t.parentNode;
						if (!t.pathname) t = t.parentNode;
						t = t.pathname;
					}
					if (router.path !== t) {
						router.push(t);
					}
					return;
				}
				/*
				let me = this, el;
				if (response.$el) {
					response = response.$el;
					path = {};
				} else if (response instanceof HTMLElement) {

					path = (path && path.closeOnClickOut) ? (path) : {};
					//console.log("PATH====");
					//console.log(path);
				} else if (response.target) {
					el = response.target;
					return me.open(el.pathname ? el.pathname : el.href);
				} else if (response === 'GET') {
					alert('GET');
					if (typeof path == 'string') {
						let cfg = { path: _.currentPath = path + (typeof o == 'string' ? '/' + o : '') };
						if (typeof o == 'function') {
							cfg.result = o;
						} else if (typeof o == 'object') {
							cfg = mergeDeep(cfg, o);
						}
						return me.open(response, cfg);
					} else if (!path.data) {
						//Tiene q buscarse el elemt si existe
						//console.log('path='+path.path);
						el = document.querySelector('[path=\'' + path.path + '\']');
						//console.log(el);
						if (el) {
							let dd = document.querySelector('#layoutUnit-center > .ui-layout-unit-content,#page-content');
							//console.log(dd);
							for (let i = 0; i < dd.children.length; i++) {
								//Se ocultan todas las demas paginas
								if (dd.children[i].style) {
									if (dd.children[i].className == 'ui-panel' && dd.children[i].style.display != 'none') {
										backPanel = dd.children[i];
									}
									dd.children[i].style.display = 'none';
								}
							}
							el.style.removeProperty('display');
							return el;
						} else {

							return axios.get((path.path + '/?modal').replace(/([^:]\/)\/+/g, "$1"))
								.then((r) => {
									r.class = path.class ? path.class : '';
									r.path = path.path;
									r.result = path.callback;
									r = Object.assign(r, path);
									me.open(response, r);
								}).catch(_error);
						}
					}
				} else if (response.data) {
					path = response;
				} else {

					return me.open('GET', response, path);
				}
				//console.log("open(path="+path+")");
				//console.log(path);
				let dialog, nid = Vue.id(), scriptDom = [], for_, ifor = 0;
				if (response instanceof HTMLElement) {
					dialog = response;
					dialog.classList.add("v-dialog");
				} else {
					dialog = document.createElement("div");
					dialog.classList.add("v-dialog");
					dialog.innerHTML = path.data;
					let s = dialog.getElementsByTagName('script');
					//console.log('patttt=' + _.currentPath);
					dialog.setAttribute("path", _.currentPath);
					let ld = dialog.children;
					//console.log(s);
					for (let k = 0; k < s.length; k++) {
						scriptDom.push(s[k]);
					}
					for (k = 0; k < ld.length; k++) {
						//console.log(ld[k].tagName);
						if (ld[k].tagName == 'V-FORM' || ld[k].tagName == 'V-PANEL') {
							for_ = ld[k];
							ifor = k;
						}
					}

				}

				let backPanel;
				const close = () => {
					dialog.style.display = "none";
					overlay = dialog.parentNode;
					if (overlay.classList.contains('v-overlay')) {//para los dialog
						overlay.style.display = "none";
						dialog.parentNode.removeChild(dialog);
						overlay.parentNode.removeChild(overlay);
					}
					if (backPanel) {
						dialog.parentNode.removeChild(dialog);
						backPanel.style.display = 'block';
					}
					//Vue.resize();
				};
				if (for_ && for_.classList.contains('panel')) {
					//Si elemto tiene declarado el id se debe considerar que es 
					if (for_.id) {
						window.currentEl = '#' + for_.id;
					} else {
						let clsId = 'cls-id-' + Vue.id();
						for_.classList.add(clsId);
						window.currentEl = '.' + clsId;
					}
					dd = document.querySelector('#layoutUnit-center > .ui-layout-unit-content,#page-content');
					for (i = 0; i < dd.children.length; i++) {
						//Se ocultan todas las demas paginas
						if (dd.children[i].style) {
							if (dd.children[i].className == 'ui-panel' && dd.children[i].style.display != 'none') {
								backPanel = dd.children[i];
							}
							dd.children[i].style.display = 'none';
						}

					}
					//se agrega el dialog recuperado y se genera
					dd.appendChild(dialog);

					//console.log(scriptDom);
					for (let l2 = 0; scriptDom.length > l2; l2++) {
						//console.log(s[l2]);
						try {
							eval(scriptDom[l2].innerHTML);
						} catch (e) { console.error(e) }
					}
					dialog.style.display = 'none';
					let td;
					let aux = dialog.children[ifor];
					//todo los elementos del dialog son agregados al panel
					while (dialog.children.length > 0) {
						if (!td) td = dialog.children[0];
						dd.appendChild(dialog.children[0]);
					}
					dialog.parentNode.removeChild(dialog);
					dialog = aux;
					//console.log(path);
					dialog.setAttribute("path", path.path);
				} else {
					let overlay = document.createElement("div");
					//console.log('create overlay');
					overlay.classList.add("v-overlay");
					overlay.style.padding = "40px";
					document.body.appendChild(overlay);
					overlay.appendChild(dialog);
					if (!(response instanceof HTMLElement)) {
						for (l2 = 0; s.length > l2; l2++) {
							//console.log(s[l2]);
							try {
								eval(s[l2].innerHTML);
							} catch (e) { console.error(e) }
						}
					}
					overlay.style.visibility = "unset";
					overlay.style.opacity = "unset";
					overlay.style.overflow = "auto";
					dialog.style.margin = "0 auto";
					dialog.style.position = "unset";
					//console.log(dialog);
					let resize = (e) => {
						console.log('resize ');
						dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
						if (window.innerWidth < 600) {//console.log(333333);
							console.log(dialog);
							let dc = dialog.querySelector('.v-dialog-content');
							//console.log(dc);
							let h = dialog.querySelector('.v-panel-titlebar');
							//console.log(h.clientHeight);
							let ih = window.innerHeight - 94 - (h ? h.clientHeight : 0);

							(dc ? dc : dialog).style.height = ih + "px";
						}
					};
					window.addEventListener('resize', resize);
					if (path.class === 'v-search') {
						let d = dialog;
						d.className = d.className + ' ' + path.class;
						d.style.width = "100%";
						d.style.height = "calc(100% - 2px)";
						let children = d.querySelector('div');
						let f = d.querySelector('form');
						let t = d.querySelector('.v-datatable');
						let tb = d.querySelector('.v-datatable-scrollable-body');
						children.style.height = 'calc(100% - 2px)';
						children.style.overflowY = 'auto';
						children.children[1].style.padding = '0px';
						children.children[1].style.height = 'calc(100% - 33px)';
						f.style.height = '100%';
						f.style.overflowY = 'auto';
						t.style.height = 'calc(100% - 52px)';
						tb.style.height = 'calc(100% - 72px)';
						tb.style.overflowY = 'auto';
						let pag = d.querySelector('.v-paginator');
						pag.style.display = 'inline-block';
						f.appendChild(pag);
						tb = document.createElement("button");
						tb.innerHTML = 'Recuperar';
						tb.style.padding = '4px 16px';
						tb.className = "_ ui-widget v-state-default ui-corner-all v-button ui-button-text-only";
						let vue = _.varMap[children.getAttribute("vueid")];
						tb.onclick = (e) => {
							e.preventDefault();
							vue.refresh();
						};
						f.appendChild(tb);
						tb = document.createElement("button");
						tb.innerHTML = 'Seleccionar';
						tb.style.padding = '4px 16px';
						tb.className = "_ ui-widget v-state-default ui-corner-all v-button ui-button-text-only";
						vue = _.varMap[children.getAttribute("vueid")];
						tb.onclick = (e) => {

							e.preventDefault();
							let d = [];
							let t = vue.$children[0].$children[0];
							for (i = 0; i < t.selected.length; i++) {
								d.push(t.filteredData[t.selected[i]]);
							}
							path.result(d);
							delete path.result;
							vue.close(e);
						};
						f.appendChild(tb);
					}
					resize();
				}
				_.storeFunction['PROPS=' + nid] = path;
				_.storeFunction[nid] = (o) => {
					if (path.result) {
						path.result(o);
					}
					if (o === true)
						me.refresh();
				}
				let _vue_ = dialog.querySelector('[vueid]');
				if (_vue_) {
					path.__vue__ = _vue_.__vue__;
					_vue_.__vue__.$emit('opened', path);
				}
				dialog.setAttribute("callback", nid);
				let h = dialog.querySelector('.v-panel-titlebar');
				if (h) {
					let acl = h.querySelector('.ui-js-close');
					window.onkeyup = (event) => {
						if (event.keyCode == 27) {
							close();
						}
					}
					if (!acl) {
						let span = document.createElement("i");
						span.style.top = "6px";
						span.style.right = "6px";
						h.style.position = "relative";
						span.style.position = "absolute";
						span.style.color = "white";
						span.className = "fa fa-window-close v-dialog-close";
						acl = document.createElement("a");
						acl.className = "ui-js-close v-dialog-titlebar-icon v-dialog-titlebar-close ui-corner-all";
						acl.appendChild(span);
						h.appendChild(acl);
						acl.addEventListener("click", close);
					}
				}
				if (path.closeOnClickOut) {
					dialog.parentNode.addEventListener("click", close);
				}
				dialog.style.display = 'block';
				Vue.resize();
				document.documentElement.style.overflow = 'hidden';  // firefox, chrome
				document.body.scroll = "no"; // ie only
				*/
			}

			const saveAs = (url, o, config) => {
				if (typeof o == 'string') o = { body: o };
				let cfg = (typeof config == 'string') ? { fileName: config } : config;
				if (!cfg) cfg = {};


				/*
				let requestOptions = {
				  method: 'POST',
				  body: formdata
				};
				
				fetch("http://{url}", requestOptions)
				  .then(response => response.text())
				  .then(result => console.log(result))
				  .catch(error => console.log('error', error))
				*/
				let a = ("" + o) ? axios.post(url, o, {
					responseType: 'blob'
				}) :
					axios({
						method: "post",
						url: url,
						data: o,
						headers: { "Content-Type": "multipart/form-data" }
					});

				a.then((response) => {
					//console.log(response);
					const url = window.URL.createObjectURL(new Blob([response.data]));
					const link = document.createElement('a');
					link.href = url;
					if (!cfg.fileName) {
						const disposition = response.headers['content-disposition'];
						if (disposition && disposition.indexOf('attachment') !== -1) {
							const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
							const matches = filenameRegex.exec(disposition);
							if (matches != null && matches[1]) {
								cfg.fileName = matches[1].replace(/['"]/g, '').trim();
							}
						} else {
							console.warn('content-disposition: attachment; filename = <filename>; header no es accesible o no esta definido correctamente')
						}
					}
					//console.log('cfg.fileName='+cfg.fileName);
					link.setAttribute('download', cfg.fileName);
					document.body.appendChild(link);
					link.click();
				});
			}

			const save = () => {

				const component = ci.proxy;
				component.$forceUpdate();
				let p = component.$el;
				//Se debe buscar si abajo esta el form
				let f = p.querySelector("form");
				let va = validate(f);
				if (va) {
					let action = f.getAttribute('action');
					//console.log('Action='+action);
					if (!action) {
						action = me.$el.parentNode.getAttribute('path');
						if (action) {
							//debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
							let tc = action.split('/');
							if (tc[tc.length - 1] == 'edit') {
								tc = tc.splice(0, tc.length - 2);
							} else {
								tc = tc.splice(0, tc.length - 1);
							}
							action = me.apiLink(tc.join('/'));
						}
					}

					let o0 = component.data || component.o;
					let o = JSON.parse(JSON.stringify(o0));
					if (component.process) o = component.process(o);
					if (!(typeof o === 'object'
						&& !Array.isArray(o) && o !== null)) return;
					console.log('action/componet==', action, component, ctx);
					if (!action || !app.connected) {
						const store = views[0].store;
						if (!store) { MsgBox('Store in form is undefined!'); return; }
						getStoredList(store).then(storedList => {
							if (!storedList) storedList = [];
							if (o.id) {
								for (let k = 0; k < storedList.length; k++) {
									if (storedList[k].tmpId == o.tmpId) {
										delete o.synchronized;
										storedList[k] = o;
									}
								}
							}
							let db = _.db;
							let transaction = db.transaction([store], "readwrite");
							let objectStore = transaction.objectStore(store);
							if (!o.id) {
								o.tmpId = 1 * new Date();
								o.id = -o.tmpId;
								//add new item to start to array							
								let objectStoreRequest = objectStore.add(o);
								objectStoreRequest.onsuccess = (e) => {
									//console.log(e);
									//console.log('saved to ' + store);
									storedList.unshift(o);
									me.$emit('stored', o, storedList, objectStore);
									if (app && app.toast) app.toast('El registro fue grabado exitosamente! storeeeeee not connected');
									o0.tmpId = o.tmpId;
									o0.id = o.id;
									console.log('========>>', component)
									component.close({ success: true, data: o });
								};
								objectStoreRequest.onerror = (e) => {
									if (app && app.toast) app.toast('Error!');
									//console.log(e);
								};
							} else {
								delete o.synchronized;
								let item = objectStore.get(o.tmpId);
								item.onsuccess = function () {
									//console.log(item.result);
									if (item.result) {
										//console.log('objectStore.put(o)');
										objectStore.put(o);
									} else {
										storedList.forEach((ee) => {
											if (ee.tmpId == o.tmpId) {
												objectStore.put(o);
											}
										});
									}
									me.$emit('stored', o, storedList, objectStore);
									if (me.$ionic) app.toast('El registro fue grabado exitosamente! onstored');
									console.log("============2", component);
									component.close({ success: true, data: o });
								};
								item.onerror = function () {
									MsgBox('Error getting temporal record ' + o.tmpId);
								};
							}
						});
					} else {
						app.axios.post(action, o).then((result: any) => {

							let data = result.data;
							if (o.tmpId) {
								alert(12)
								let store = me.$children[0].store;
								let objectStore = window._.db.transaction([store], "readwrite").objectStore(store);
								let item = objectStore.get(o.tmpId);
								if (data.id) { o.id = data.id; o0.id = o.id; }

								item.onsuccess = function () {
									o0.synchronized = 1;
									o.synchronized = 1;
									let re;
									if (item.result) {
										re = objectStore.put(o);
									} else {
										re = objectStore.add(o);
									}
									re.onerror = (e) => {
										console.error(e);
									};
									//data es l valor recibiddo y o l nviao
									me.$emit('sync', data, o);
								};
								item.onerror = function () {
									MsgBox('Error getting temporal record ' + o.tmpId);
								};
							}

							if (app && app.toast)
								app.toast('El registro fue grabado exitosamente!', () => {
									component.close({ success: true, data: data });
								});
							else {
								MsgBox('El registro fue grabado exitosamente! msg', () => {
									//component
									alert(2222)
									close({ success: true, data: data });
								});
							}
						}).catch(function (r) {
							//console.log(r);
							if (r.response) {
								let l, e;
								if ((typeof r.response.data) === 'string') {
									MsgBox(r.response.data);
								} else {
									l = r.response.data.propertyViolations;
									//ec += l.length;
									for (let i = 0; i < l.length; i++) {
										let t = l[i];
										e = f.querySelector('[name=' + t.path + ']');
										if (e) {
											me.showerror(e, t.message);
										}
									}
									l = r.response.data.fieldViolations;
									//ec += l.length;
									for (i = 0; i < l.length; i++) {
										t = l[i];
										e = f.querySelector('[name=' + t.path + ']');
										if (e) {
											me.showerror(e, t.message + ', valor=' + t.value);
										}
									}
									MsgBox('Verifique el formulario, aun tiene campos obligatorio completar.');
									if (me.$el.parentNode.className == 'v-dialog')
										me.$el.parentNode.parentNode.scroll({
											top: 0,
											behavior: 'smooth'
										});
								}
							}
						});
					}
				} else {
					MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
					if (me.$el.parentNode.className == 'v-dialog') {
						me.$el.parentNode.parentNode.scroll({
							top: 0,
							behavior: 'smooth'
						});
					}
				}
			}

			const showerror = (e, m) => {
				if (e.$el) e = e.$el;
				removeError(e)
				let previousElementSibling = e.previousElementSibling;
				while (previousElementSibling && previousElementSibling.nodeType != 1) {
					previousElementSibling = previousElementSibling.previousElementSibling;
				}
				if (!previousElementSibling) {
					previousElementSibling = e.parentElement.previousElementSibling;
					while (previousElementSibling && previousElementSibling.nodeType != 1) {
						previousElementSibling = previousElementSibling.previousElementSibling;
					}
				}
				let error = document.createElement("div");
				error.innerHTML = m ? m : "Este campo es requerido!";
				//ok = false;
				error.classList.add("v-error");
				e.parentNode.insertBefore(error, e);
			}

			const validate = (e2?) => {
				const me = this;
				let ok = true;
				const fieldsWithErrors = [];
				const fieldsOk = [];
				const component = ci.proxy;
				e2 = e2 && e2 != 0 ? e2 : component.$el;
				const input = e2?.querySelectorAll("input,select,textarea,div[required=required]");


				let radio: any = {}, previousElementSibling;
				for (let i = 0; input?.length > i; i++) {
					let e = input[i];
					if (e.type === 'radio') {
						let oo = radio[e.name];
						if (!oo)
							radio[e.name] = (oo = []);
						oo.push(e);
						continue;
					}
					if (e.error) {
						e.error.style.display = 'none';
					}
					if (!(e.disabled || e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
						//console.log(document.activeElement==e);
						if (e.tagName != 'DIV' && (!e.value/*||e.value == 0*/) || (e.tagName === 'DIV' && !e.attributes.value)) {
							previousElementSibling = e.previousElementSibling;
							while (previousElementSibling && previousElementSibling.nodeType != 1) {
								previousElementSibling = previousElementSibling.previousElementSibling;
							}
							if (!previousElementSibling) {
								previousElementSibling = e.parentElement.previousElementSibling;
								while (previousElementSibling && previousElementSibling.nodeType != 1) {
									previousElementSibling = previousElementSibling.previousElementSibling;
								}
							}
							fieldsWithErrors.push(e);
						} else {
							fieldsOk.push(e);
						}
					}
				}
				for (let r in radio) {
					if (Object.prototype.hasOwnProperty.call(radio, r)) {
						const op = radio[r];

						let checked = false;
						let required = false;
						for (let i = 0; i < op.length; i++) {
							if (op[i].required && !op[i].disabled)
								required = true;
							if (op[i].checked)
								checked = true;
						}
						e = op[0].parentNode.parentNode;
						previousElementSibling = e.previousElementSibling;
						if (previousElementSibling && previousElementSibling.classList && previousElementSibling.classList.contains('v-error')) {
							previousElementSibling.parentNode.removeChild(previousElementSibling);
						}
						if (required && !checked) {
							//console.log(e);
							//showerror(e);
							fieldsWithErrors.push(e);
							ok = false;
						} else {
							fieldsOk.push(e);
						}
					}
				}
				//console.log(fieldsWithErrors);
				for (const field of fieldsWithErrors) {
					showerror(field);
				}
				for (const e of fieldsOk) {
					let previousElementSibling = e.previousElementSibling;
					if (previousElementSibling && previousElementSibling.classList && previousElementSibling.classList.contains('v-error')) {
						previousElementSibling.parentNode.removeChild(previousElementSibling);
					}
				}
				return !fieldsWithErrors.length;
			}

			const create = (e) => {
				const dt = findInSameParent(e.target, '.v-datatable');
				let view = views.filter(view => view.type == 'v-table').find(view => view.is(dt));
				let action = view.getForm().action;
				if (!action) {
					action = window.location.pathname;
				}
				if (action) action = action.replace("/api", "");
				if (app) {
					open(action + '/create');
				} /*else {
					instance.get(_.currentPath = (action + '/create').replace(/([^:]\/)\/+/g, "$1") + '?modal')
						.then(_.open).catch(_error);
				}*/
			}

			const findInSameParent = (el: HTMLElement, qs: string) => {
				let parent = el.parentElement;
				while (parent) {
					const dt = parent.querySelector(qs);
					if (dt) {
						return dt;
					}
					parent = parent.parentElement;
				}
				return null;
			}

			const edit = (e) => {
				const dt = findInSameParent(e.target, '.v-datatable');
				let view = views.filter(view => view.type == 'v-table').find(view => view.is(dt));
				let action = view.getForm().action;
				if (!action) {
					action = window.location.pathname;
				}
				if (view && view.src) action = view.src;
				if (e.action) action = e.action;
				if (action) action = rewrite(action.replace("/api", "").replace("/0/0", ""));
				const selected = view.selected.value[0];
				let id = selected[view.rowKey];
				if (selected.tmpId) id = -selected.tmpId;
				if (app) {
					open(action + '/' + id + '/edit');
				} else {
					app.axios.get((_.currentPath = (action + '/' + id + '/edit').replace(/([^:]\/)\/+/g, "$1")) + '?modal')
						.then(me.open).catch(_error);
				}
			}

			const getSelected = () => {
				return views.find(view => view.type == 'v-table').selected.value;
			}

			const close = (ok) => {
				console.log(ctx);
				/*if (ok.$el) ok = ok.$el;
				let dlg = (ok instanceof HTMLElement) ? ok : null;
				try {
					if (!dlg && event.target instanceof HTMLElement)
						dlg = _.closest(event.target, '.v-dialog');
				} catch (e) {
					console.log(e);
				}

				if (!dlg) dlg = this.$el.parentElement;

				let mask = dlg.parentElement;
				if (!mask && _.app.$router) {
					_.app.$router.back();
					return;
				}
				dlg.style.display = "none";
				if ((' ' + mask.className + ' ').indexOf(' v-overlay ') > -1) mask.style.display = "none";
				else mask = null;
				//Vue.resize();
				let cb = _.storeFunction[dlg.getAttribute("callback")];
				if (cb) cb(ok);
				dlg.parentNode.removeChild(dlg);
				if (mask) mask.parentNode.removeChild(mask);
				document.documentElement.style.overflow = 'auto';  // firefox, chrome
				document.body.scroll = "yes";
				//si history esta activo
				//history.back();
				*/
			}

			const destroy = (e) => {
				let me = this;
				const dt = findInSameParent(e.target, '.v-datatable');
				let t = views.filter(view => view.type == 'v-table').find(view => view.is(dt));
				let f = views.find(view => view.type != 'v-table');
				let action = f.action;
				if (!action)
					action = window.location.pathname;
				let cb = e.$vnode ? e.load : null;
				let key = t.rowKey;
				let dat = t.selected.value[0];
				if (dat.tmpId) {
					MsgBox('Esta seguro que desea eliminar los registros temporales seleccionados ?', function (r) {
						if (r == 0) {
							let c = 0, db = _.db;
							let objectStore = db.transaction([t.store], "readwrite").objectStore(t.store);
							let ele = [];
							for (let k = t.selected.length - 1; k >= 0; k--) {
								dat = t.data[t.selected[k]];
								ele.push(dat);
								if (dat.tmpId) objectStore.delete(dat.tmpId);
								c++;
								t.data.splice(t.selected[k], 1);
							}
							if (c) {
								if (app && app.toast) app.toast(c + ' registros eliminados');
								else
									MsgBox(c + ' registros eliminados');
							}
							t.rowSelect(null, -1);
							t.selected = [];
							me.$emit('destroyed', ele, t.store);
							if (cb) cb();

						}
					}, ['SI', 'NO']);
				} else {
					if (!key)
						return alert('Table don`t have defined attribute \'rowkey\'');
					let c = 0, id = dat[key];
					MsgBox('Esta seguro que desea eliminar el registro seleccionado?', (r) => {
						if (r == 0) {
							const src = t.src.replace('/0/0', '');
							const ele = [];
							let k = (t.selected.value.length - 1)
							app.axios.delete(src + '/' + id, { params: filters.value }).then(() => {
								for (; k >= 0; k--) {
									dat = t.selected.value[k];
									ele.push(dat);
									t.remove(dat);
								}
								if (app && app.toast)
									app.toast(ele.length + ' registros eliminados');
								else
									MsgBox(ele.length + ' registros eliminados');
								t.rowSelect(null, -1);
								t.selected.value = [];
							}).catch(_error);
						}
					}, ['SI', 'NO']);
				}
			}

			provide('viewCollector', viewCollector)

			const rowSelectedCount = computed(() => {
				let v = views.find(view => view.selected?.value.length > 0);
				return v?.rowSelectedCount || 0;
			})

			const cleanedFilters = computed(() => {
				return clean(filters.value);
			})

			const filters = reactive({});

			const refreshTimeout = ref(null);

			watch(filters, () => {
				const view = views.find(view => view.type == 'v-table');
				if (view) {
					if (refreshTimeout.value) clearTimeout(refreshTimeout.value);
					refreshTimeout.value = setTimeout(() => {
						refresh();
					}, 1200);
				}
			})

			let resizeTimeout: any;

			const adjustScrollableWidth = () => {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(() => {
					const datatable = document.querySelector(".v-datatable");
					if (datatable?.parentNode) {
						buildPopupMenu(datatable);
					}
				}, 100);
			}

			const vv = (v) => {
				Network.getStatus().then((status) => {
					if (status.connected) {
						let session = localStorage.getItem('session');
						if (session) {
							try {
								session = JSON.parse(session);
							} catch (e) {
								//console.log(e);
								session = {};
							}
							session.connected = v;
							localStorage.setItem('session', JSON.stringify(session));
						}
					} else {
						me.toast('El dispositivo no tiene acceso a internet!');
						me.connected = status.connected;
					}
				});
			}

			onMounted(() => {
				router = useRouter();
				//app.config({router,axios});
				ctx.emit('sync', { u: 9 })
				adjustScrollableWidth();
				window.addEventListener("resize", adjustScrollableWidth);
			});

			onUnmounted(() => {
				window.removeEventListener("resize", adjustScrollableWidth);
			});

			const baseURL = computed(() => {
				return app.axios.defaults.baseURL;
			})

			const session = computed(() => {
				return app.session;
			})

			const listeners = [];

			const $on = (name: string, fn: any) => {
				listeners.push({ name, fn });
			}

			let q = customSetup ? customSetup({ ...props, $on, router, getStoredList }, ctx) : {};
			ctx.expose({ router })
			let res = {
				app,cleanedFilters,
				router,
				baseURL,
				filters,
				session,
				date, pad, getStoredList, refresh, getSelected, saveAs,
				validate, save, open, close, create, edit, destroy, rowSelectedCount
				//, ...other?.methods
				, ...q
			};
			/*if (other.methods?.refresh) {
				delete res.refresh;
			}
			if (other.methods?.save) {
				delete res.save;
			}*/
			return res;
		},
	};
	return cfg;
}
