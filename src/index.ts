import components from './components'
import { clean, _, pad, resize, configureAxios, app, setApp, initDB, MsgBox, date, db, getStoredList } from './commons'
import './cdn/theme.css'
import axios from 'axios'

export { resize, app, initDB, date, db,_ ,pad, getStoredList};

const bindLinks = (el, callback) => {
	var me = this;
	el = el ? el : me.$el;
	if (el.querySelectorAll) {
		//var a=el.querySelectorAll('a:not(._),ion-item:not(._)'); 
		var a = el.querySelectorAll('a:not(._),ion-item:not(._)');
		//console.log(a)
		var f0 = function (e) { e.preventDefault(); };
		var f = function (e) {
			e.preventDefault();
			if (callback) callback();
			me.open(e);
		};
		for (var i = 0; i < a.length; i++) {
			if (a[i].attributes.href) {
				a[i].onclick = f;
			} else
				a[i].onclick = f0;
			a[i].classList ? a[i].classList.add('_') : a[i].className = '_';
		}
	}
}

export const IsobitUI = {
	install(vApp: any) {
		setApp(vApp);
		vApp.BUILT_ON = import.meta.env.VITE_APP_BUILT_ON;
		vApp.bindLinks = bindLinks;
		configureAxios(axios)
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

export const ui = (cfg) => {
	const defs = {
		computed: {
			connected: {
				get() {
					return this.online&&this.x_connected_!==false;
				},
				set(v) {
					let me = this;
					let session = me.session;
					this.x_connected_ = v;
					console.log('this.x_connected_ = ' + this.x_connected_);
					//session.connected=v;
					this.$set(session, 'connected', v);
					me.session = session;
				},
			},
			session: {
				get() {
					if (!_._session) {
						var s = localStorage.getItem('session');
						if (s)
							s = JSON.parse(s);
						else s = {};
						_._session = s;
					}
					return _._session;
				},
				set(session) {
					if (!session)
						localStorage.removeItem('session');
					else {
						if (Array.isArray(session.perms)) {
							session.perms = session.perms.reduce((a, v) => { a[v] = true; return a; }, {});
						}
						localStorage.setItem('session', JSON.stringify(session));
					}
					_._session = session;
				}
			},
			online() {
				return this.app2&&this.app2.networkStatus?.connected;
			},
			cleanedFilters() {
				return clean(this.filters);
			},
			app() {
				return _.app;
			},
			user() {
				return _.app.session;
			},

			perms() {
				return this.session.perms || this.session.allcaps || {};
			},
			rowSelectedCount() {
				var me = this;
				//console.log(me.$children);
				return 1;
				/*if (!me.$children[0]) return 0;
				var t = me.$children[0].$children[0];
				return t ? t.selected.length : 0;*/
			},
			baseURL() { return axios.defaults.baseURL; }
		},
		data() {
			let me = this;
			return {
				app2:null,
				filters: {},
				ui: me,
				_session: null, x_connected_: null,
				//rowSelectedCount: 0,
				row: {},
				networkStatus: { connected: null }
			}
		},
		created(){
			let me=this;
			if(!_.app2){
				
				_.app2=me;
				console.log('app created',_.app2);
			}
			me.app2=_.app2;

		},
		methods: {
			pad,
			resize() {
				//Vue.resize();
			},
			vv(v) {
				var me = this;
				var sf = function (status) {
					if (status.connected) {
						var session = localStorage.getItem('session');
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
				};
				Network.getStatus().then(sf);
			},
			getSelected(e) {
				var me = this;
				var t = e && e.$vnode ? e : me.$children[0].$children[0];
				var s = [];
				for (var i = 0; i < t.selected.length; i++) {
					s.push(t.data[t.selected[i]]);
				}
				return s;
			},
			getRowSelectedCount() {
				var me = this;
				var t = me.$children[0].$children[0];
				return t ? t.selected.length : 0;
			},
			rewrite(url) { return url; },
			edit(e) {
				var me = this;
				var f = me.$children[0];
				var action = f.action;
				var t = [].filter.call(e.component.$parent.$children, (e) => {
					return e.$el.classList.contains('v-datatable');
				})[0];
				if (!action) {
					action = window.location.pathname;
				}
				if (t && t.src) action = t.src;
				if (e.action) action = e.action;
				if (!t) {
					t = e.$vnode ? e : (e.target && e.target.$vnode) ? e : me.$children[0].$children[0];
					if (t.src)
						action = t.src;
				}

				if (action) action = me.rewrite(action.replace("/api", "").replace("/0/0", ""));
				var selected = me.getSelected(t)[0];
				var id = selected[t.rowKey];
				if (selected.tmpId) id = -selected.tmpId;
				//console.log(selected);
				if (me.getSelectedId) id = me.getSelectedId(selected);
				if (_.app) {
					me.open(action + '/' + id + '/edit');
				} else {
					axios.get((_.currentPath = (action + '/' + id + '/edit').replace(/([^:]\/)\/+/g, "$1")) + '?modal')
						.then(me.open).catch(me.error);
				}
			},
			get(part) {
				var me = this;
				var p = me.$el;
				//Se debe buscar si abajo esta el form
				var f = p.querySelector("form");
				var action = f.action;
				//console.log(me.apiLink(action) + '/' + part);
				window.location.href = me.apiLink(action) + '/' + part;
			},
			error(e) {
				//console.log(e);
				alert(e);
				//this.open({data:''+e});
			},
			destroy(e) {
				var me = this;
				var f = me.$children[0];
				var action = f.action;
				var t = [].filter.call(e.component.$parent.$children, (e) => {
					return e.$el.classList.contains('v-datatable');
				})[0];
				if (!t)
					t = e.$vnode ? e : me.$children[0].$children[0];

				if (!action)
					action = window.location.pathname;
				var cb = e.$vnode ? e.load : null;

				var key = t.$attrs.rowkey;
				if (!key) key = t.rowKey;
				var dat = t.data[t.selected[0]];
				var data = t.data;
				if (dat.tmpId) {
					me.MsgBox('Esta seguro que desea eliminar los registros temporales seleccionados ?', function (r) {
						if (r == 0) {
							var c = 0, db = _.db;
							var objectStore = db.transaction([t.store], "readwrite").objectStore(t.store);
							var ele = [];
							for (var k = t.selected.length - 1; k >= 0; k--) {
								dat = t.data[t.selected[k]];
								ele.push(dat);
								if (dat.tmpId) objectStore.delete(dat.tmpId);
								c++;
								t.data.splice(t.selected[k], 1);
							}
							if (c) {
								if (me.app && me.app.toast) me.app.toast(c + ' registros eliminados');
								else
									me.MsgBox(c + ' registros eliminados');
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
					var c = 0, id = dat[key];
					me.MsgBox('Esta seguro que desea eliminar el registro seleccionado?', function (r) {
						if (r == 0) {
							var src = t.src.replace('/0/0', '');
							var ele = [];
							//console.log(t.selected);
							var k = (t.selected.length - 1)
							axios.delete(src + '/' + id, { params: t.filters }).then(() => {
								//console.log(t.selected);
								for (; k >= 0; k--) {
									//console.log('k=' + k);
									//console.log(t.data);
									//	console.log('t.selected[k]=' + t.selected[k]);
									dat = t.data[t.selected[k]];
									ele.push(dat);
									//console.log(ele);
									t.data.splice(t.selected[k], 1);
								}
								if (me.app && me.app.toast)
									me.app.toast(ele.length + ' registros eliminados');
								else
									me.MsgBox(ele.length + ' registros eliminados');

								t.rowSelect(null, -1);
								t.selected = [];
								//if(cb)cb();
							}).catch(me.error);
							//t.rowSelect(null,-1);
						}
					}, ['SI', 'NO']);
				}
			},
			apiLink(str) {
				return str.replace(_.contextPath, _.contextPath + '/api');
			},
			open(response, path, o) {


				if (!(response.$el) && !(response instanceof HTMLElement)) {
					var e = response;
					var t = e.target;

					var me = this;

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

					if (me.$route.path !== t) {
						//console.log('path=' + t);
						console.log('me.$route=', me.$router, t);
						me.$router.push(t);
					}
					return;
				}
				var me = this, el;
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
					if (typeof path == 'string') {
						var cfg = { path: _.currentPath = path + (typeof o == 'string' ? '/' + o : '') };
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
							var dd = document.querySelector('#layoutUnit-center > .ui-layout-unit-content,#page-content');
							//console.log(dd);
							for (var i = 0; i < dd.children.length; i++) {
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
								}).catch(me.error);
						}
					}
				} else if (!response.data) {
					return me.open('GET', response, path);
				} else if (response.data) {
					path = response;
				}
				//console.log("open(path="+path+")");
				//console.log(path);
				var dialog, nid = Vue.id(), scriptDom = [], for_, ifor = 0;
				if (response instanceof HTMLElement) {
					dialog = response;
					dialog.classList.add("v-dialog");
				} else {
					dialog = document.createElement("div");
					dialog.classList.add("v-dialog");
					dialog.innerHTML = path.data;
					var s = dialog.getElementsByTagName('script');
					//console.log('patttt=' + _.currentPath);
					dialog.setAttribute("path", _.currentPath);
					var ld = dialog.children;
					//console.log(s);
					for (var k = 0; k < s.length; k++) {
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

				var backPanel;
				var close = () => {
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
					Vue.resize();
				};
				if (for_ && for_.classList.contains('panel')) {
					//Si elemto tiene declarado el id se debe considerar que es 
					if (for_.id) {
						window.currentEl = '#' + for_.id;
					} else {
						var clsId = 'cls-id-' + Vue.id();
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
					for (var l2 = 0; scriptDom.length > l2; l2++) {
						//console.log(s[l2]);
						try {
							eval(scriptDom[l2].innerHTML);
						} catch (e) { console.error(e) }
					}
					dialog.style.display = 'none';
					var td;
					var aux = dialog.children[ifor];
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
					var overlay = document.createElement("div");
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
					var resize = (e) => {
						console.log('resize ');
						dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
						if (window.innerWidth < 600) {//console.log(333333);
							console.log(dialog);
							var dc = dialog.querySelector('.v-dialog-content');
							//console.log(dc);
							var h = dialog.querySelector('.v-panel-titlebar');
							//console.log(h.clientHeight);
							var ih = window.innerHeight - 94 - (h ? h.clientHeight : 0);

							(dc ? dc : dialog).style.height = ih + "px";
						}
					};
					window.addEventListener('resize', resize);
					if (path.class === 'v-search') {
						var d = dialog;
						d.className = d.className + ' ' + path.class;
						d.style.width = "100%";
						d.style.height = "calc(100% - 2px)";
						var children = d.querySelector('div');
						var f = d.querySelector('form');
						var t = d.querySelector('.v-datatable');
						var tb = d.querySelector('.v-datatable-scrollable-body');
						children.style.height = 'calc(100% - 2px)';
						children.style.overflowY = 'auto';
						children.children[1].style.padding = '0px';
						children.children[1].style.height = 'calc(100% - 33px)';
						f.style.height = '100%';
						f.style.overflowY = 'auto';
						t.style.height = 'calc(100% - 52px)';
						tb.style.height = 'calc(100% - 72px)';
						tb.style.overflowY = 'auto';
						var pag = d.querySelector('.v-paginator');
						pag.style.display = 'inline-block';
						f.appendChild(pag);
						tb = document.createElement("button");
						tb.innerHTML = 'Recuperar';
						tb.style.padding = '4px 16px';
						tb.className = "_ ui-widget v-state-default ui-corner-all v-button ui-button-text-only";
						var vue = _.varMap[children.getAttribute("vueid")];
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
							var d = [];
							var t = vue.$children[0].$children[0];
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
				var _vue_ = dialog.querySelector('[vueid]');
				if (_vue_) {
					path.__vue__ = _vue_.__vue__;
					_vue_.__vue__.$emit('opened', path);
				}
				dialog.setAttribute("callback", nid);
				var h = dialog.querySelector('.v-panel-titlebar');
				if (h) {
					var acl = h.querySelector('.ui-js-close');
					window.onkeyup = (event) => {
						if (event.keyCode == 27) {
							close();
						}
					}
					if (!acl) {
						var span = document.createElement("i");
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
			},
			close(ok) {
				if (ok.$el) ok = ok.$el;
				var dlg = (ok instanceof HTMLElement) ? ok : null;
				try {
					if (!dlg && event.target instanceof HTMLElement)
						dlg = _.closest(event.target, '.v-dialog');
				} catch (e) {
					console.log(e);
				}
				if (!dlg) dlg = this.$el.parentElement;
				var mask = dlg.parentElement;
				if (!mask && _.app.$router) {
					_.app.$router.back();
					return;
				}
				dlg.style.display = "none";
				if ((' ' + mask.className + ' ').indexOf(' v-overlay ') > -1) mask.style.display = "none";
				else mask = null;
				Vue.resize();
				var cb = _.storeFunction[dlg.getAttribute("callback")];
				if (cb) cb(ok);
				dlg.parentNode.removeChild(dlg);
				if (mask) mask.parentNode.removeChild(mask);
				document.documentElement.style.overflow = 'auto';  // firefox, chrome
				document.body.scroll = "yes";
				//si history esta activo
				//history.back();
			},
			create() {
				const me = this;
				const exposed = me.$el.__vnode.ctx.exposed;
				console.log(exposed);
				var action = exposed.action;
				if (!action) {
					action = window.location.pathname;
				}
				//action = _.processURL(action);
				if (action) action = action.replace("/api", "");
				if (app()) {
					me.open(action + '/create');
				} else {
					instance.get(_.currentPath = (action + '/create').replace(/([^:]\/)\/+/g, "$1") + '?modal')
						.then(_.open).catch(me.error);
				}
			},
			refresh() {
				const me = this;
				//console.log(me.$el.__vnode.dynamicChildren[0].el.__vnode.dynamicChildren[1].children[0].type.setup().al())
				const node = me.$el.__vnode;
				console.log(node.children[1].children[0]);
				const t = node.children[1].children[0].children[0].component.exposed;
				//const t = node.dynamicChildren[0].el.__vnode.dynamicChildren[1].children[0].component.exposed;
				t.load();
			},
			async sync(e) {
				var me = this;
				var p = me.$el;
				var f = p.querySelector("form");
				var action = f.getAttribute('action');
				//console.log('Action='+action);
				if (!action) {
					action = me.$el.parentNode.getAttribute('path');
					//debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
					var tc = action.split('/');
					if (tc[tc.length - 1] == 'edit')
						tc = tc.splice(0, tc.length - 2);
					else
						tc = tc.splice(0, tc.length - 1);
					action = me.apiLink(tc.join('/'));
				}
				var t = me.$children[0].$children[0];
				action = t.src;
				//debe recorrerse toda los registros seleccionados
				//ponerlos gris
				var dats = await me.getStoredList(t.store);
				var sel = t.selected;
				var sel2 = [];
				var sel3 = [];
				for (var i = 0; i < sel.length; i++) {
					//se recupra
					var item = t.data[sel[i]];
					if (item.tmpId && !item.synchronized) {
						for (var j = 0; j < dats.length; j++) {
							if (dats[j].tmpId == item.tmpId) {
								var o = JSON.clone(dats[j]);
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
							if (d[k].errors) { me.MsgBox(JSON.stringify(d[k].errors)); break; }
							if (d[k].error) { me.MsgBox(d[k].error); break; }
							for (var j = 0; j < dats.length; j++) {
								//cada registro recibido de bulk ss compara con los locales
								if (d[k].ext && d[k].ext.tmpId == dats[j].tmpId
									|| d[k].tmpId == dats[j].tmpId) {
									console.log('ok');
									if (d[k].ext && dats.ext) {
										dats[j].ext.error = d[k].ext.error;
									}
									if (d[k].id) dats[j].id = d[k].id;
									//aqui deberia revisarsee los registro anidados
									dats[j].synchronized = 1;
									me.$emit('sync', d[k], dats[j]);
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
							me.MsgBox(r.response.data);
						} else {
							console.log(r);
						}
					});
				}
			},
			async save() {
				var me = this;
				me.$forceUpdate();
				let p = me.$el;
				//Se debe buscar si abajo esta el form
				let f = p.querySelector("form");
				let va = this.validate(f);
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
					//console.log(me);
					let o0 = me.$data.data ? me.$data.data : me.$data.o;
					var o = JSON.parse(JSON.stringify(o0));
					if (me.process) o = me.process(o);
					
					if (!(typeof o === 'object'
						&& !Array.isArray(o) && o !== null)) return;
					if (!action || !me.app2.connected) {
						let store = me.$children[0].store;
						if (!store) { me.MsgBox('Store in form is undefined!'); return; }
						let storedList = await me.getStoredList(store);
						if (!storedList) storedList = [];
						if (o.id) {
							for (var k = 0; k < storedList.length; k++) {
								if (storedList[k].tmpId == o.tmpId) {
									delete o.synchronized;
									storedList[k] = o;
								}
							}
						}
						var db = _.db;
						var transaction = db.transaction([store], "readwrite");
						var objectStore = transaction.objectStore(store);
						if (!o.id) {
							o.tmpId = 1 * new Date();
							o.id = -o.tmpId;
							//add new item to start to array							
							var objectStoreRequest = objectStore.add(o);
							objectStoreRequest.onsuccess = (e) => {
								//console.log(e);
								//console.log('saved to ' + store);
								storedList.unshift(o);
								me.$emit('stored', o, storedList, objectStore);
								if (me.app && me.app.toast) me.app.toast('El registro fue grabado exitosamente!');
								o0.tmpId = o.tmpId;
								o0.id = o.id;
								me.close({ success: true, data: o });
							};
							objectStoreRequest.onerror = (e) => {
								if (me.app && me.app.toast) me.app.toast('Error!');
								//console.log(e);
							};
						} else {
							delete o.synchronized;
							var item = objectStore.get(o.tmpId);
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
								if (me.$ionic) me.app.toast('El registro fue grabado exitosamente!');
								me.close({ success: true, data: o });
							};
							item.onerror = function () {
								me.MsgBox('Error getting temporal record ' + o.tmpId);
							};
						}
					} else {
						axios.post(action, o).then((result) => {

							var data = result.data;
							if (o.tmpId) {
								alert(12)
								var store = me.$children[0].store;
								var objectStore = window._.db.transaction([store], "readwrite").objectStore(store);
								var item = objectStore.get(o.tmpId);
								if (data.id) { o.id = data.id; o0.id = o.id; }

								item.onsuccess = function () {
									o0.synchronized = 1;
									o.synchronized = 1;
									var re;
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
									me.MsgBox('Error getting temporal record ' + o.tmpId);
								};
							}
							
							if (me.app&&me.app.toast)
								me.app.toast('El registro fue grabado exitosamente!', () => {
									me.close({ success: true, data: data });
								});
							else {
								MsgBox('El registro fue grabado exitosamente!', () => {
									me.close({ success: true, data: data });
								});
							}
						}).catch(function (r) {
							//console.log(r);
							if (r.response) {
								var l, e;
								if ((typeof r.response.data) === 'string') {
									me.MsgBox(r.response.data);
								} else {
									l = r.response.data.propertyViolations;
									//ec += l.length;
									for (var i = 0; i < l.length; i++) {
										var t = l[i];
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
									me.MsgBox('Verifique el formulario, aun tiene campos obligatorio completar.');
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
			},
			saveAs(url, o, config) {
				if (typeof o == 'string') o = { body: o };
				var cfg = (typeof config == 'string') ? { fileName: config } : config;
				if (!cfg) cfg = {};


				/*
				var requestOptions = {
				  method: 'POST',
				  body: formdata
				};
				
				fetch("http://{url}", requestOptions)
				  .then(response => response.text())
				  .then(result => console.log(result))
				  .catch(error => console.log('error', error))
				*/
				var a = ("" + o) ? axios.post(url, o, {
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
					if (!cfg.fileName){
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
			},
			savePost() {

			},
			validate(e2?) {
				const me = this;
				var ok = true;
				const fieldsWithErrors = [];
				const fieldsOk = [];
				e2 = e2 && e2 != 0 ? e2 : me.$el;
				var input = e2?.querySelectorAll("input,select,textarea,div[required=required]");
				var radio = {}, previousElementSibling;
				for (i = 0; input?.length > i; i++) {
					var e = input[i];
					if (e.type === 'radio') {
						var oo = radio[e.name];
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
						if (e.tagName != 'DIV' && (!e.value/*||e.value == 0*/) || (e.tagName === 'DIV'
							&& !e.attributes.value)) {
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
							//console.log(e)
							fieldsWithErrors.push(e);
						} else {
							fieldsOk.push(e);
						}
					}
				}
				console.log('valid radios');
				for (var r in radio) {
					if (Object.prototype.hasOwnProperty.call(radio, r)) {
						var op = radio[r];
						var checked = false;
						var required = false;
						for (var i = 0; i < op.length; i++) {
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
							me.showerror(e);
							/*previousElementSibling = e.previousElementSibling;
								while(previousElementSibling&&previousElementSibling.nodeType != 1) {
								previousElementSibling = previousElementSibling.previousElementSibling;
								}
								if(!previousElementSibling){
								previousElementSibling=e.parentElement.previousElementSibling;
								while(previousElementSibling&&previousElementSibling.nodeType != 1) {
								previousElementSibling = previousElementSibling.previousElementSibling;
								}
								}
								var error = document.createElement("div"); 
								error.innerHTML = "Este campo es requerido!";*/
							ok = false;
							//error.classList.add("v-error");
							//e.parentNode.insertBefore(error, e);
						}
					}
				}
				console.log('ok=' + ok);
				for (const field of fieldsWithErrors) {
					if (!field.error) {
						const error = document.createElement("div");
						error.innerHTML = "Este campo es requerido!";
						error.classList.add("v-error");
						field.error = error;
						field.parentNode.insertBefore(error, field.nextSibling)
					} else {
						field.error.style.display = 'unset';
					}
				}
				return !fieldsWithErrors.length;
			},
		}
	}
	if (!cfg) cfg = { data: { o: {} } };
	const { setup, ...other } = cfg;
	cfg = { mixins: [defs, other], setup };
	//if(setup)
	return cfg;
}