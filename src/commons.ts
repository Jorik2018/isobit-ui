export const _ = {
	stores:[],
	_id:0,
	axios_get: null,
	storeFunction:{},
	id:()=>{
		return _._id++;
	}
}

const upper = (s:string) => {
	return s ? s.toUpperCase() : s;
};

const capitalize = (o:string) => {
	if (o) {
		o = o.replace('_', ' ').replace(/\b[a-z](?=[a-z]{2})/gi, function (letter:string) {
			return letter.toUpperCase();
		})
	}
	return o;
};
export const num = (v) => {
	v = v ? (v == '' ? null : Number('' + v)) : 0;
	return v;
}
const _number = function (s/*, type*/) {//s usa   d|date('time')
	if (s) {
		//console.log('number='+s);
		//https://blog.abelotech.com/posts/number-currency-formatting-javascript/
		return s.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
	}
	return s;
};
export const date = (s:Date|string, type:string|number) => {//s usa   d|date('time')
	if (s) {
		let d;
		if (s instanceof Date) {
			d = s;
		} else if (typeof s === 'string') {
			let t = s.split('T');
			d = t[0].split('-');
			if (t.length > 1) {
				t = t[1].split(':');
				d = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]),
					parseInt(t[0]), parseInt(t[1]), t.length > 2 ? parseInt(t[2]) : 0);
			} else if (d.length > 2) {
				d = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]));
			} else {
				d = s.split(':');
				if (d.length > 2) {
					d = new Date(1981, 0, 6, parseInt(d[0]), parseInt(d[1]), parseInt(d[2]));
				} else
					d = new Date(s);
			}
		} else {
			d = new Date(s);
		}
		//console.log(s);
		if (type == 1) {
			s = d;
		} else if (type === 'time') {
			s = pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2) + ':' + pad(d.setSeconds() ? d.setSeconds() : 0, 2);
		} else if (type == 'time a') {
			if (typeof s === 'string' || s instanceof String) {
				s = s.split(':');
				let h = s[0];
				s = pad(h > 12 ? (h - 12) : h, 2) + ':' + s[1] + ':' + s[2] + ' ' + (h > 12 ? 'PM' : 'AM');
			} else {
				h = d.getHours();
				s = pad(h > 12 ? (h - 12) : h, 2) + ":" + pad((d.getMinutes()), 2) + (d.setSeconds() ? ":" + pad(d.setSeconds(), 2) : '') + ' ' + (h > 12 ? 'PM' : 'AM');
			}
		} else if (type == 'date-')
			s = pad(d.getFullYear(), 4) + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2);
		else if (type == 'dMY' || type == 'date')
			s = pad(d.getDate(), 2) + "/" + pad((d.getMonth() + 1), 2) + "/" + pad(d.getFullYear(), 4) + '';
		else if (type == 'datetime')
			s = pad(d.getFullYear(), 4) + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2) + 'T'
				+ pad(d.getHours(), 2) + ":" + pad((d.getMinutes()), 2) + ":" + pad(d.setSeconds() ? d.setSeconds() : 0, 2);
		else
			s = pad(d.getDate(), 2) + "/" + pad((d.getMonth() + 1), 2) + "/" + pad(d.getFullYear(), 4) + ' ' + pad(d.getHours(), 2) + ":" + pad((d.getMinutes()), 2);

	}
	return s;
};
export const whichChild = (e) => {
	let i = 0;
	while ((e = e.previousElementSibling) != null)
		++i;
	return i;
};
const mask = (ms, cfg) => {
	if (!document.body) return;
	let w = window;
	let img;
	let center = document.createElement("div");
	center.className = 'abc';
	center.style = 'top:50%;transform:translate(-50%,-50%);position:absolute;width:100%;z-index:2; display: flex;justify-content: center;';
	let s = center.style;
	s.left = '50%';
	s.textAlign = 'center';
	if (ms !== false) {
		if (ms instanceof Element) {
			center = ms;//.append(ms);
		} else {
			if (ms) {
				let d = document.createElement('div');
				d.innerHTML = ms;
				center.append(d);
				center.style = "padding:4px;margin-bottom:5px;color:white;font-size:24px;text-align:center"
			}
			img = document.createElement('div');
			s = img.style;
			img.className = 'loading';
		}
	}
	let p = document.createElement('div');

	s = p.style;
	s.height = '100%'; w.innerHeight;
	s.top = '0px';
	s.position = 'absolute';
	s.left = '0'
	s.zIndex = 10000;
	s.width = '100%';
	let bg = document.createElement('div');

	s = bg.style;
	s.height = '100%';
	s.width = '100%';
	s.top = '0';
	s.position = 'absolute';
	s.left = '0';
	s.backgroundColor = 'rgba(0,0,0,0.5)';
	if (cfg && cfg.opacity) s.opacity = cfg.opacity;
	if (cfg && cfg.backgroundColor) s.backgroundColor = cfg.backgroundColor;
	p.appendChild(bg);
	p.appendChild(center);
	if (img)
		center.appendChild(img);
	document.body.appendChild(p);
	return p;
};

const unmask = (m) => {
	if (m) {
		m.style.display = "none";
		if (m.parentNode)
			m.parentNode.removeChild(m);
	}
};

const isObject = (item:any) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep: any = function() {
	let target = arguments[0];
	let sources = [];
	for (let i = 1; i < arguments.length; i++)sources.push(arguments[i]);
	//Vue.mergeDeep = function(target, ...sources) {
	if (!sources.length) return target;
	//Se obtiene el primer elemento de source
	let source = sources.shift(), nv: any;
	//const source = sources.shift();
	if (isObject(target) && isObject(source)) {
		for (let key in source) {
			//for (const key in source) {
			if (isObject(source[key])) {
				/*console.log(key);
				console.log(source[key]);
				console.log(typeof source[key]);*/
				if (!target[key]) {
					nv = {}; nv[key] = {}; Object.assign(target, nv); 
				}
				mergeDeep(target[key], source[key]);
			} else {
				nv = {};
				nv[key] = source[key];
				Object.assign(target, nv);
				//Object.assign(target, { [key]: source[key] });
			}
		}
	}
	let args = [];
	args.push(target);
	args.concat(sources);
	return mergeDeep.apply(null, args);
	//return mergeDeep(target, ...sources);
}

const buildPopupMenu = (parent) => {
	let pid = parent.getAttribute("v--popup");
	if (!pid) {
		parent.setAttribute("v--popup", pid = _.id());
		let popup = _.storeFunction[pid];
		let bu = parent.querySelectorAll('.v-datatable-header .v-button');
		if (bu && bu.length && !popup && window.innerWidth <= 700) {
			setTimeout(function () {
				popup = document.createElement('ul');
				popup.className = 'v-popup-2';
				parent.appendChild(popup);
				let ma = null;
				const itemClick = (e) => {
					//console.log(this);
					popup.style.display = 'none';
					//console.log(e);
					let id = e.target.getAttribute('commandId');
					let cmd = document.querySelector('#' + id);
					if (cmd.tagName == 'BUTTON')
						cmd.click();
					else
						cmd.children[0].click();
					//console.log(cmd);
					unmask(ma);
				}
				parent.style.position = 'relative';
				let pbutton = document.createElement('div');
				pbutton.className = 'v-mobil v-table-buttons';
				let i = document.createElement('i');
				i.className = 'fa fa-bars fa-w-14';
				pbutton.appendChild(i);
				pbutton.onclick = () => {
					bu = parent.querySelectorAll('.v-datatable-header .v-button');
					while (popup.firstChild) {
						popup.removeChild(popup.firstChild);
					}
					for (i = 0; i < bu.length; i++) {
						//Debe tenerlo directamente no por herencia
						if ((bu[i].style.display != 'none')) {
							let ite = document.createElement('li');
							if (!bu[i].id) bu[i].id = 'c-' + _.id();
							ite.setAttribute('commandId', bu[i].id);
							if (bu[i].tagName == 'BUTTON') {
								if (bu[i].disabled) continue;
								ite.appendChild(bu[i].children[0].cloneNode(true));
								ite.appendChild(document.createTextNode(bu[i].value ? bu[i].value : bu[i].title));
							} else if (bu[i].children[0].children[1]) {
								ite.appendChild(bu[i].children[0].children[1]);//.cloneNode()
								ite.appendChild(document.createTextNode(bu[i].textContent));
							}
							ite.onclick = itemClick;
							popup.appendChild(ite);
						}
					}
					ma = mask(popup);
					//popup.style.top=(parseInt(pbutton.style.top)+pbutton.offsetHeight)+'px';
					popup.style.display = 'block';
					ma.onclick = () => {
						popup.style.display = 'none';
						unmask(ma);
					}
				}

				parent.appendChild(pbutton);

				_.storeFunction[pid] = popup;
			}, 500);
		}
	}
}

export const resize = () => {
	//dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
	let h = window.innerHeight;
	//console.log(h);
	//console.log(document.body.children[0])
	document.body.children[0].style.height = h + '.px';
	let ph = document.querySelectorAll("#page-header,.ui-layout-north,.v-layout-north,.ion-page >ion-header");
	ph = ph[0];
	const pc = document.querySelectorAll("#app > .ui-panel > .v-dialog-content > form > .v-datatable");

	
	
	if (pc && pc[0]) {
		buildPopupMenu(pc[0]);
		//console.log('cccccccccccc');
		//console.log(ph.dataset);
		//console.log(ph.offsetHeight);
		let p, i;
if(1==1)return;
		if (pc[0].nodeName == "ION-CONTENT") {
			p = pc[0].children[0];
			h = h - ph.offsetHeight - 0;
			p.style.height = h + 'px';
			p.style.overflowY = 'auto';
			if (!p.classList.contains('ui-panel')) p = p.children[0];
			//console.log(p);
			let event = new Event("parentResize", { bubbles: true });
			event.height = h;
			p.dispatchEvent(event);
			//pass body panel it must have a form > v-datatable
			if (p.children[1]) {
				let body = p.children[1];
				if (body.children[0].tagName == 'FORM') {
					body = body.children[0].children[0]
				}
				//console.log(body);
				buildPopupMenu(body);
			}
			return;
		} else if (pc[0].nodeName == "DIV") {
			p = pc[0];
			//console.log('==========DIV============');
			//console.log(p);
			p.style.height = h + 'px';
			p.style.overflowY = 'auto';
			h = h - ph.offsetHeight - 0;
			if (p.classList.contains('ui-panel')) {
				//is v-form
			} else {
				p = p.children[0];
			}
			let event = new Event("parentResize", { bubbles: true });
			event.height = h;
			p.dispatchEvent(event);
			if (p.children[1]) buildPopupMenu(p.children[1]);
			return;
		}
		pc[0].style.height = (h - ph.offsetHeight - 2) + 'px';
		pc[0].style.overflowY = 'auto';
		p = pc[0].querySelector(".ui-panel");
		//console.log('==========ppp============');
		//	console.log(p);
		if (p) {
			//console.log(p);
			pc = p.children;
			if (ph) h -= (ph.offsetHeight + pc[0].offsetHeight + 2);
			if (pc[1]) {
				//console.log(pc[1]);
				pc[1].style.height = h + 'px';
				let e = pc[1].querySelectorAll(".v-resize,.v-datatable");
				for (i = 0; i < e.length; i++) {
					let evt2 = new Event("parentResize", { bubbles: true });
					evt2.height = h;
					e[i].dispatchEvent(evt2);
				}
			}
		} else {

			let f = function (el) {
				let style = window.getComputedStyle(el);
				return (style.display === 'none')
			}
			//console.log(pc[0]);
			//function isHidden(el) {return (el.offsetParent === null)}
			if (!pc[0].children[0]) return;
			//console.log(h);
			let items = pc[0].children;
			for (i = 0; i < items.length; i++) {
				let evt = new Event("parentResize", { bubbles: true });
				evt.height = h;
				items[i].dispatchEvent(evt);
			}
			items = pc[0].children[0].children;
			let vc = [];
			for (i = 0; i < items.length; i++) {
				if (!f(items[i])) vc.push(items[i]);
			}
			if (vc.length == 1) {
				vc[0].style.overflowY = 'auto';
				//se debe remover el padding
				/*let cs=window.getComputedStyle(vc[0]);
				let pt=parseInt(cs.getPropertyValue('padding-top'))||0;
				let pb=parseInt(cs.getPropertyValue('padding-bottom'))||0;
				vc[0].style.height=(h-(ph.offsetHeight+0+40))+'.px';*/
			}
		}
		//console.log("p");
		//console.log(p);

	} else {
		let ww = document.querySelectorAll(".ion-page");

		if (ww[0]) {
			//console.log('?????????????');
			let hr = 0;
			for (let kk = 0; kk < ww[0].childNodes.length; kk++) {
				if (ww[0].childNodes[kk].nodeName == 'ION-HEADER' || ww[0].childNodes[kk].nodeName == 'ION-FOOTER') {
					hr += ww[0].childNodes[kk].offsetHeight;
				}
			}
			let aft = 0;
			for (kk = 0; kk < ww[0].childNodes.length; kk++) {
				let cn = ww[0].childNodes[kk];
				if (cn.nodeName == 'ION-HEADER')
					aft = 1;
				if (aft == 1 && cn.nodeName != 'ION-HEADER' && cn.nodeName != 'ION-FOOTER' && cn.style) {
					cn.style.height = ww[0].offsetHeight - hr + 'px';
					cn.style.overflowY = 'auto';
					break;
				}
			}
			//console.log(ww[0].childNodes);
		}else{
			console.log(12);
		}
	}
};

export const MsgBox = (m, cb, b) => {
	if (!b) b = ['OK'];
	//si el elemento debe cargarse en un dialog
	if (!document.body) return;
	let overlay = document.createElement("div");
	overlay.classList.add("v-overlay");
	overlay.style.padding = "40px";
	overlay.style.zIndex = "2000";
	document.body.appendChild(overlay);
	let dialog = document.createElement("div");
	let dialogContent = document.createElement("div");
	let msgContent = document.createElement("div");
	let buttons = document.createElement("div");

	buttons.className = "v-msgbox-buttons";
	dialog.classList.add("v-dialog");
	dialog.classList.add("v-msgbox");
	msgContent.innerHTML = m;
	dialog.setAttribute("path", _.currentPath);
	//dialog.setAttribute("callback", nid);
	let closeListener = function () {
		dialog.style.display = "none";
		overlay.style.display = "none";

		dialog.parentNode.removeChild(dialog);
		overlay.parentNode.removeChild(overlay);
		if (cb){
			cb(this.getAttribute("index"));
		}
	};
	for (let i = 0; i < b.length; i++) {
		let button = document.createElement("button");
		button.innerHTML = b[i];
		button.type = "button";
		button.setAttribute("index", i);
		button.className = "v-button ui-widget ui-state-default ui-corner-all";
		buttons.appendChild(button);
		button.addEventListener("click", closeListener);
	}
	dialogContent.className = "v-dialog-content v-widget-content";
	dialogContent.appendChild(msgContent);
	dialogContent.appendChild(buttons);
	dialog.appendChild(dialogContent);
	overlay.appendChild(dialog);
	overlay.style.visibility = "unset";
	overlay.style.opacity = "unset";
	overlay.style.overflow = "auto";
	dialog.style.margin = "0 auto";
	dialog.style.position = "unset";
	let nid = 'v_' + 0;// _.id();

	/*let acl=h.querySelector('.ui-js-close');
if (!acl) {
	let span = document.createElement("span");
	span.style.top = "5px";
	span.style.right = "5px";
	h.style.position = "relative";
	span.style.position = "absolute";
	span.className = "ui-icon ui-icon-closethick";
	acl = document.createElement("a");
	acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
	acl.appendChild(span);
	h.appendChild(acl);
	acl.addEventListener("click", closeListener);
}*/
	resize();
}

export const configureAxios = (a) => {
	_.axios_get = a.get;
	let maskElement;
	a.interceptors.request.use(function (config) {
		_.eeee = config;
		if (config.mask) {
			config.mask();
		} else if (!maskElement)
			maskElement = mask();
		return config;
	}, function (e) {
		maskElement = unmask(maskElement);
		MsgBox('request ' + _.id() + ' ' + e.message)
		return Promise.reject(e);
	});
	a.interceptors.response.use(function (response) {
		maskElement = unmask(maskElement);
		return response;
	}, function (e) {
		//console.log(e)
		if (a.error && a.error(e) == false) {
			maskElement = unmask(maskElement);
		} else {
			let r = e.response, msg = (r && r.data && r.data.msg) ? r.data.msg : e.message;
			if (r) {
				if (r.data && r.data.message) msg = r.data.message;
				if ((typeof r.data) === 'string') msg = r.data;
				if (!msg) {
					msg = r.status + ': ' + r.statusText;
				}
			}
			maskElement = unmask(maskElement);
			if (r && r.status == 401) {
				if (_.app) {
					_.app.toast('Session terminada');
					_.app.logout();
					return;
				}
			}
			if (e.config?.error) {
				//console.log('error');
				e.config.error(e, msg);
			} else {
				//console.log('mssg');
				console.log(e)
				if(e.request)
				MsgBox('<b>' + e.request.responseURL + '</b><br/><br/>' + msg);
			else
			MsgBox(msg);
			}
			//console.log(msg);
			//console.log(r);
		}
		delete a.error;
		return Promise.reject(e);
	});
}

export const pad = (num, size) => {
	if (num != null) {
		let s = (1 * num) + "";
		while (s.length < size)
			s = "0" + s;
		return s;
	}
};

export const clean = (obj) => {
    for (let propName in obj) {
        if (obj[propName] === '' || obj[propName] === null
            || typeof obj[propName] === 'function'
            || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

export const sum = (c) => {
    return this.reduce((a, b) => {
      b = (c ? b[c] : b);
      return a + (b ? Number(b) : 0);
    }, 0);
}

function createGetters() {
	return {
		get networkStatus() {
		return _.app?.networkStatus || {connected: true};
		},
		get db() {
		return _.app?.db;
		},
		app() {
			console.log('get.app='+_.app)
		return _.app;
		},
		setApp(v) {
			_.app = v;
			console.log('setApp='+_.app)
		},
	};
}

export const app = () => _.app;

export const db = () => _.db;

export const initDB = (version, stores) => {
	let db = window.indexedDB ||
		window.mozIndexedDB ||
		window.webkitIndexedDB ||
		window.msIndexedDB;
	_.IDBTransaction =
		window.IDBTransaction ||
		window.webkitIDBTransaction ||
		window.msIDBTransaction;
	_.IDBKeyRange =
		window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
	if (!db) {
		window.alert(
			"Your browser doesn't support a stable version of IndexedDB."
		);
	} else {
		if (db) {
			_.stores = stores;
			return new Promise((resolve,reject) => {
				let request = db.open("db", version);
				request.onupgradeneeded = (event) => {
					let db = event.target.result;
					stores.forEach((e) => {
						if (!db.objectStoreNames.contains(e[0])) {
							db.createObjectStore(e[0], e[1]);
						}
					});
				};
				request.onerror = (e) => {
					reject(e);
				};
				request.onsuccess = () => {
					_.db = request.result;
					resolve(_.db);
				};
			});

		}
	}
	return db;
}

export const getStoredList = async (store, params) => {
	let loadedStores;
	try {
		loadedStores = JSON.parse(sessionStorage.getItem('loadedStores'));
	} catch (e) { }
	if (loadedStores == null) loadedStores = {};
	//console.log(loadedStores);
	const _db = db();
	if (!loadedStores[store] && networkStatus.connected) {
		let e = _.stores.filter(e => e[0] == store)[0];
		//console.log(e);
		if(!e) throw "store '"+store+"' undefined";
		if(!e[2]) throw "store url for '"+store+"' is empty";
		let data = e[2]?await _.axios_get(e[2]):[];
		const objectStore = _db.transaction([e[0]], "readwrite").objectStore(e[0]);
		await objectStore.clear();
		data = data.data||data;
		for (let i in data) {
			try {
				await objectStore.add(data[i]);
			} catch (exception) {
				//console.log(data[i]);
				//console.log(e[0]);
				throw exception;
			}
		}
		loadedStores[store] = 1;
		sessionStorage.setItem('loadedStores', JSON.stringify(loadedStores));
	}
	let p = new Promise((resolve,rejected) => {
		if(_db){
			let t = _db.transaction(store), objectStore = t.objectStore(store);//,d=[];
			let r = objectStore.getAll();
			r.onsuccess = function () {
				resolve(r.result);
			}
		}else rejected('db is null');
		//t.onerror = event => reject(event.target.error);
	});
	let result = await p;
	//console.log(result);
	return result;
};

export const getStoreObject = (storage, id) => {
	const objectStore = db().transaction([storage], "readwrite").objectStore(storage);
	return objectStore.get(id);
};

const getters = createGetters();

export const { networkStatus, setApp } = getters;

export class HTML2Canvas {
    private props: any;
    private ctx: CanvasRenderingContext2D;
    private lineHeight: number;
  
    constructor(props: any) {
        this.props = props;
        this.ctx = props.ctx;
        this.lineHeight = props.lineHeight ? props.lineHeight : 20;
    }
  
    private heightText(s: string, w: number): number {
        const { ctx, lineHeight } = this;
        let s2 = '';
        let t = lineHeight;
        s.split('').forEach((e) => {
            s2 += e;
            if (ctx.measureText(s2).width >= (w - 15)) {
                s2 = '';
                t += lineHeight;
            }
        });
        t += 7;
        return t;
    }
  
    public drawText(s: string, x: number, y: number, w: number, h: number, a: string): number {
        const { ctx, lineHeight } = this;
        let s2 = '';
        let t = lineHeight + y;
        ctx.fillStyle = "#000000";
        s.split('').forEach((e) => {
            s2 += e;
            if (ctx.measureText(s2).width >= (w - 15)) {
                ctx.fillText(s2, x, t);
                s2 = '';
                t += lineHeight;
            }
        });
        ctx.fillText(s2, x + (a == 'right' ? (w - ctx.measureText(s2).width) : 0), t);
        ctx.beginPath();
        t += 7;
        return t;
    }
  }