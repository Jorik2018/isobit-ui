import Vue from 'vue'
import axios from 'axios'
import VAutocomplete from "./v-autocomplete.vue";
import VButton from "./v-button.vue";
import VCalendar from "./v-calendar.vue";
import VCheckbox from "./v-checkbox.vue";
import VCheckboxGroup from "./v-checkbox-group.vue";
import VForm from "./v-form.vue";
import VRadio from "./v-radio.vue";
import VGroup from "./v-group.vue";
import VRadioGroup from "./v-radio-group.vue";
import VDataview from "./v-dataview.vue";
import VFieldset from "./v-fieldset.vue";
import VTable from "./v-table.vue";
import VTabview from "./v-tabview.vue";
import VTextarea from "./v-textarea.vue";
import VSelect from "./v-select.vue";
import VSwitch from "./v-switch.vue";
import VNumber from "./v-number.vue";
import VOptions from "./v-options.vue";
import VUploader from "./v-uploader.vue";
import VPanel from "./v-panel.vue";
import VLayerControl from "./v-layer-control.vue";
import VMap from "./v-map.vue";
import VMapControl from "./v-map-control.vue";
import VOverlay from "./v-overlay.vue";
import VPopup from "./v-popup.vue";

window.isMobile = 1;
if (typeof Window._ == 'undefined') Window._ = {};
var _ = Window._;
Vue.config.ignoredElements = [...Vue.config.ignoredElements || [], ...['v-filter', 'v-footer']];
Vue.n = (v) => {
	v = v ? (v == '' ? null : Number('' + v)) : 0;
	return v;
}
if (typeof JSON.clone !== "function") {
	JSON.clone = function (obj) {
		return JSON.parse(JSON.stringify(obj));
	};
}
if (typeof Object.assign != 'function') {
	Object.assign = function (target) {
		'use strict';
		if (target == null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}
		var to = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) {
				for (var nextKey in nextSource) {
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
}
let buildPopupMenu = function (parent) {
	var pid = parent.getAttribute("v--popup");
	if (!pid){ 
		parent.setAttribute("v--popup", pid = _.id());
		var popup = _.storeFunction[pid];

		var bu = parent.querySelectorAll('.v-datatable-header .v-button');

		if (bu && bu.length && !popup && window.innerWidth <= 700) {
			setTimeout(function () {
				popup = document.createElement('ul');
				popup.className = 'v-popup-2';
				popup.style.backgroundColor = 'white';
				popup.style.position = 'absolute';
				popup.style.bottom = '0px';
				popup.style.fontSize = '26px';
				popup.style.right = '0px';
				popup.style.display = 'none';
				popup.style.width = '200px';
				popup.style.zIndex = '12000';
				parent.appendChild(popup);
				var mask = null;
				var itemClick = function () {
					//console.log(this);
					popup.style.display = 'none';
					var id = this.getAttribute('commandId');
					var cmd = document.querySelector('#' + id);
					if (cmd.tagName == 'BUTTON')
						cmd.click();
					else
						cmd.children[0].click();
					//console.log(cmd);
					_.unmask(mask);
				}
				parent.style.position = 'relative';
				var pbutton = document.createElement('div');
				pbutton.className = 'v-mobil v-table-buttons';
				var i = document.createElement('i');
				i.className = 'fa fa-bars fa-w-14';
				pbutton.appendChild(i);
				pbutton.onclick = function () {
					bu = parent.querySelectorAll('.v-datatable-header .v-button');
					while (popup.firstChild) {
						popup.removeChild(popup.firstChild);
					}
					for (i = 0; i < bu.length; i++) {
						//Debe tenerlo directamente no por herencia
						if ((bu[i].style.display != 'none')) {
							var ite = document.createElement('li');
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
					mask = _.mask(popup);
					//popup.style.top=(parseInt(pbutton.style.top)+pbutton.offsetHeight)+'px';
					popup.style.display = 'block';
					mask.onclick = function () {
						popup.style.display = 'none';
						_.unmask(mask);
					}
				}

				parent.appendChild(pbutton);

				_.storeFunction[pid] = popup;
			}, 1000);
		}
	}
}
let resize = function () {
	//console.log('resize');
	//dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
	var h = window.innerHeight;
	document.body.children[0].style.height = h + '.px';
	var ph = document.querySelectorAll("#page-header,.ui-layout-north,.v-layout-north,.ion-page >ion-header");
	ph = ph[0];
	var pc = document.querySelectorAll(".ion-page >ion-header + .ui-panel,#page-content,.ui-layout-pane-center,.v-layout-center ,.ion-page > ion-content");
	//console.log(pc);
	if (pc && pc[0]) {
		//console.log('cccccccccccc');
		//console.log(ph.dataset);
		//console.log(ph.offsetHeight);
		var p, i;

		if (pc[0].nodeName == "ION-CONTENT") {
			p = pc[0].children[0];
			h = h - ph.offsetHeight - 0;
			p.style.height = h + 'px';
			p.style.overflowY = 'auto';
			if (!p.classList.contains('ui-panel')) p = p.children[0];
			//console.log(p);
			var event = new Event("parentResize", { bubbles: true });
			event.height = h;
			p.dispatchEvent(event);

			//pass body panel it must have a form > v-datatable
			if (p.children[1]){
				var body=p.children[1];
				if(body.children[0].tagName=='FORM'){
					body=body.children[0].children[0]
				}
				console.log(body);
				buildPopupMenu(body);
			}
			return;
		} else if (pc[0].nodeName == "DIV") {
			p = pc[0];
			//console.log("========");
			//console.log(p);
			h = h - ph.offsetHeight - 0;
			p.style.height = h + 'px';
			p.style.overflowY = 'auto';
			if (!p.classList.contains('ui-panel')) p = p.children[0];
			//console.log(p);
			var event = new Event("parentResize", { bubbles: true });
			event.height = h;
			p.dispatchEvent(event);
			if (p.children[1]) buildPopupMenu(p.children[1]);
			return;
		}
		pc[0].style.height = (h - ph.offsetHeight - 2) + 'px';
		pc[0].style.overflowY = 'auto';
		p = pc[0].querySelector(".ui-panel");
		if (p) {
			pc = p.children;
			if (ph) h -= (ph.offsetHeight + pc[0].offsetHeight + 2);
			if (pc[1]) {
				console.log(pc[1]);
				pc[1].style.height = h + 'px';
				var e = pc[1].querySelectorAll(".v-resize,.v-datatable");
				for (i = 0; i < e.length; i++) {
					var evt2 = new Event("parentResize", { bubbles: true });
					evt2.height = h;
					e[i].dispatchEvent(evt2);
				}
			}
		} else {

			var f = function (el) {
				var style = window.getComputedStyle(el);
				return (style.display === 'none')
			}
			//function isHidden(el) {return (el.offsetParent === null)}
			if (!pc[0].children[0]) return;
			console.log(h);
			var items = pc[0].children;
			for (i = 0; i < items.length; i++) {
				var evt = new Event("parentResize", { bubbles: true });
				evt.height = h;
				items[i].dispatchEvent(evt);
			}
			items = pc[0].children[0].children;
			var vc = [];
			for (i = 0; i < items.length; i++) {
				if (!f(items[i])) vc.push(items[i]);
			}
			if (vc.length == 1) {
				vc[0].style.overflowY = 'auto';
				//se debe remover el padding
				/*var cs=window.getComputedStyle(vc[0]);
				var pt=parseInt(cs.getPropertyValue('padding-top'))||0;
				var pb=parseInt(cs.getPropertyValue('padding-bottom'))||0;
				vc[0].style.height=(h-(ph.offsetHeight+0+40))+'.px';*/
			}
		}
		console.log("p");
		console.log(p);

	} else {
		var ww = document.querySelectorAll(".ion-page");
		if (ww[0]) {
			var hr = 0;
			for (var kk = 0; kk < ww[0].childNodes.length; kk++) {
				if (ww[0].childNodes[kk].nodeName == 'ION-HEADER' || ww[0].childNodes[kk].nodeName == 'ION-FOOTER') {
					hr += ww[0].childNodes[kk].offsetHeight;
				}
			}
			var aft = 0;
			for (kk = 0; kk < ww[0].childNodes.length; kk++) {
				var cn = ww[0].childNodes[kk];
				if (cn.nodeName == 'ION-HEADER')
					aft = 1;
				if (aft == 1 && cn.nodeName != 'ION-HEADER' && cn.nodeName != 'ION-FOOTER' && cn.style) {
					cn.style.height = ww[0].offsetHeight - hr + 'px';
					cn.style.overflowY = 'auto';
					break;
				}
			}
			//console.log(ww[0].childNodes);
		}
	}
};
setTimeout(Vue.resize = resize, 400);
window.addEventListener('resize', function () {
	setTimeout(resize, 400);
});
function HTML2Canvas(props) {
	this.props = props;
	this.ctx = props.ctx;
	this.lineHeight = props.lineHeight ? props.lineHeight : 20;
	this.heightText = function (s, w) {
		var ctx = this.ctx, me = this;
		var s2 = '';
		var t = me.lineHeight;
		s.split('').forEach((e) => {
			s2 += e;
			if (ctx.measureText(s2).width >= (w - 15)) {
				s2 = '';
				t += me.lineHeight;
			}
		});
		t += 7;
		return t;
	},
		this.drawText = function (s, x, y, w, h, a) {
			var ctx = this.ctx, me = this;
			var s2 = '';
			var t = me.lineHeight + y;
			ctx.fillStyle = "#000000";
			s.split('').forEach((e) => {
				s2 += e;
				if (ctx.measureText(s2).width >= (w - 15)) {
					ctx.fillText(s2, x, t);
					s2 = '';
					t += me.lineHeight;
				}
			});
			ctx.fillText(s2, x + (a == 'right' ? (w - ctx.measureText(s2).width) : 0), t);
			ctx.beginPath();
			t += 7;
			return t;
		}
}
var f = {
	value: function (v) {
		var a = this;
		for (var i = 0; i < a.length; i++)
			if (a[i] == v) return true;
		return false;
	}
};
if (![].contains) Object.defineProperty(Array.prototype, 'contains', f);
if (!"".contains) Object.defineProperty(String.prototype, 'contains', f);
_ = Object.assign(_, {
	async getStoredList(store) {
		let p = new Promise((resolve) => {
			var t = _.db.transaction(store), objectStore = t.objectStore(store);//,d=[];
			var r = objectStore.getAll();
			r.onsuccess = function () {
				resolve(r.result);
			}
			//t.onerror = event => reject(event.target.error);
		});
		let result = await p;
		//console.log(result);
		return result;
	},
	remoteServer: '',
	_id: 0,
	networkStatus: { connected: true },
	storeFunction: {},
	varMap: {},
	id() {
		return ++_._id;
	},
	findForm(e) {
		var parent = e.parentNode;
		if (parent && parent.tagName != 'FORM') {
			parent = _.findForm(parent);
		}
		return parent;
	},
	contains(a, b) {
		return a && a.includes(b);
	},
	uiParent(e) {
		return e.ui || !e ? e : _.uiParent(e.$parent);
	},
	closest(el, sel) {
		while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el, sel)));
		return el;
	},
	fadeOut(id, val) {
		if (isNaN(val)) { val = 9; }
		document.getElementById(id).style.opacity = '0.' + val;
		//For IE
		document.getElementById(id).style.filter = 'alpha(opacity=' + val + '0)';
		if (val > 0) {
			val--;
			setTimeout('fadeOut("' + id + '",' + val + ')', 90);
		} else { return; }
	},
	fadeIn(id, val) {
		// ID of the element to fade, Fade value[min value is 0]
		if (isNaN(val)) { val = 0; }
		document.getElementById(id).style.opacity = '0.' + val;
		//For IE
		document.getElementById(id).style.filter = 'alpha(opacity=' + val + '0)';
		if (val < 9) {
			val++;
			setTimeout('fadeIn("' + id + '",' + val + ')', 90);
		} else { return; }
	},
	whichChild(e) {
		var i = 0;
		while ((e = e.previousElementSibling) != null)
			++i;
		return i;
	},
	showerror(e, m) {
		if (e.$el) e = e.$el;
		var previousElementSibling = e.previousElementSibling;
		if (previousElementSibling && previousElementSibling.classList && previousElementSibling.classList.contains('v-error')) {
			previousElementSibling.parentNode.removeChild(previousElementSibling);
		}
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
		var error = document.createElement("div");
		error.innerHTML = m ? m : "Este campo es requerido!";
		//ok = false;
		error.classList.add("v-error");
		e.parentNode.insertBefore(error, e);
	},
	print(o) {
		var e = document.createElement('iframe');
		document.body.appendChild(e);
		var d = e.contentWindow.document;
		e.style.display = 'none';
		d.open();
		d.write('<html><head><title>TT' + o.title + '</title>');
		d.write('<link rel="stylesheet" type="text/css" href="/cdn/isobit.css?v=0004">' +
			'<style>table{background-color:red}</style>');
		d.write('</head><body style="padding:20px;background-color:white !important">');
		d.write('<style>body, body > * {padding:20px;background-color:white !important }</style>');
		d.write('<h1>' + o.title + '</h1>');
		d.write(o.body);
		d.write('</body></html>');
		d.close();
		e.focus();
		e.contentWindow.print();
	},
	mask(ms, cfg) {
		if (!document.body) return;
		var w = window;
		var center = document.createElement("div");
		center.style = 'top:50%;transform:translate(-50%,-50%);position:absolute;width:100%;z-index:2';
		var s = center.style;
		s.left = '50%';
		s.textAlign = 'center';
		if (ms !== false) {
			if (ms instanceof Element) {
				center = ms;//.append(ms);
			} else {
				if (ms) {
					var d = document.createElement('div');
					d.innerHTML = ms;
					center.append(d);
					center.style = "padding:4px;margin-bottom:5px;color:white;font-size:24px;text-align:center"
				}
				var img = document.createElement('div');
				s = img.style;
				s.width = '100%';
				s.height = '180px';
				img.className = 'loading';
			}
		}
		var p = document.createElement('div');

		s = p.style;
		s.height = '100%'; w.innerHeight;
		s.top = '0px';
		s.position = 'absolute';
		s.left = '0'
		s.zIndex = 10000;
		s.width = '100%';
		var bg = document.createElement('div');

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
	},
	unmask(m) {
		if (m) {
			m.style.display = "none";
			if (m.parentNode)
				m.parentNode.removeChild(m);
		}
	},
	clean(obj) {
		for (var propName in obj) {
			if (obj[propName] === '' || obj[propName] === null || obj[propName] === undefined) {
				delete obj[propName];
			}
		}
		return obj;
	},
	processURL(s) {
		//console.log(s);
		return s;
	},
	loadCSS(url) {
		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		//link.id   = cssId;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		link.media = 'all';
		head.appendChild(link);
	},
	go(u) {
		window.location = u;
	},
	getCurrentPosition() {
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
	},
	URL(path) {
		var me = this;
		me.location = window.location;
		me.path = path ? path : window.location.pathname;
		var h = me.path.split('?');
		if (h.length > 1) {
			me.path = h[0];
			h = h[1].split('#');
			me.query = h[0];
		} else {

			h = h[0].split('#');
			me.path = h[0];
		}
		me.get = function (key, def) {
			if (me.query) {
				var kvp = me.query.split('&');
				var i = kvp.length;
				var x;
				while (i--) {
					x = kvp[i].split('=');
					if (x[0] == key) {
						return x[1];
					}
				}
			}
			return def;
		};
		me.put = function (key, value) {
			key = encodeURI(key);
			value = encodeURI(value);
			var kvp = me.path.split('?');
			if (kvp.length > 1) kvp = kvp[1].split('&');
			var i = kvp.length;
			var x;
			while (i--) {
				x = kvp[i].split('=');
				if (x[0] == key) {
					x[1] = value;
					kvp[i] = x.join('=');
					break;
				}
			}
			if (i < 0) {
				kvp[kvp.length] = [key, value].join('=');
			}
			//this will reload the page, it's likely better to store this until finished
			//document.location.search = kvp.join('&'); 
			//console.log('pathname='+me.location.pathname);
			//console.log('query='+kvp.join('&'));
			//console.log('hash='+me.location.hash);
			return me.location.pathname + '?' + kvp.join('&') + me.location.hash;
		}
	},
	loadScript(url, callback) {
		// adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		// then bind the event to the callback function 
		// there are several events for cross browser compatibility
		script.onreadystatechange = callback;
		script.onload = callback;
		// fire the loading
		head.appendChild(script);
	},
	sum(c) {
		return this.reduce((a, b) => {
			b = (c ? b[c] : b);
			return a + (b ? Number(b) : 0);
		}, 0);
	}
});
_.getLocation = _.getCurrentPosition;
Vue.id = _.id;
if (typeof ol !== 'undefined') {
	function getLayerById(m, id) {
		var ly;
		m.getLayers().forEach(function (l) {
			if (l.get("id") === id) {
				ly = l;
				return;
			}
		});
		return ly;
	}
	ol.getLayerById = getLayerById;
	window.ol = ol;
}
Vue.pad = function (num, size) {
	if (num != null) {
		var s = (1 * num) + "";
		while (s.length < size)
			s = "0" + s;
		return s;
	}
};
Vue.filter('upper', _.upper = (s) => {
	return s ? s.toUpperCase() : s;
});
Vue.filter('capitalize', _.capitalize = (o) => {
	if (o) {
		o = o.replace('_', ' ').replace(/\b[a-z](?=[a-z]{2})/gi, function (letter) {
			return letter.toUpperCase();
		})
	}
	return o;
});
Vue.filter('number', function (s/*, type*/) {//s usa   d|date('time')
	if (s) {
		//console.log('number='+s);
		//https://blog.abelotech.com/posts/number-currency-formatting-javascript/
		return s.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
	}
	return s;
});
Vue.filter('date', _.toDate = (s, type) => {//s usa   d|date('time')
	if (s) {
		var pad = Vue.pad, d;
		if (s instanceof Date) {
			d = s;
		} else if (typeof s === 'string') {
			var t = s.split('T');
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
				var h = s[0];
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
});
_.HTML2Canvas = HTML2Canvas;
Vue.dateDiff = function (fa, fb) {  //fa y fb dos fechas
	if (Number(fa) === fa) fa = new Date(fa);
	var totdias = fa - fb;
	totdias /= 3600000;
	totdias /= 24;
	totdias = Math.floor(totdias);
	totdias = Math.abs(totdias);
	var ans, meses, dias, m2, m1, d3, d2, d1;
	var f2 = new Date();
	var f1 = new Date();
	if (fa > fb) {
		f2 = fa;
		f1 = fb;
	} else {
		f2 = fb;
		f1 = fa;
	}  //Siempre f2 > f1
	ans = f2.getFullYear() - f1.getFullYear(); // dif de años inicial
	m2 = f2.getMonth();
	m1 = f1.getMonth();
	meses = m2 - m1;
	if (0 > meses) {
		meses += 12;
		--ans;
	}
	d2 = f2.getDate();
	d1 = f1.getDate();
	dias = d2 - d1;
	var f3 = new Date(f2.getFullYear(), m2, 1);
	f3.setDate(f3.getDate() - 1);
	d3 = f3.getDate();
	if (d1 > d2) {
		dias += d3;
		--meses;
		if (0 > meses) {
			meses += 12;
			--ans;
		}
		if (fa > fb) {  //corrección por febrero y meses de 30 días
			f3 = new Date(f1.getFullYear(), m1 + 1, 1);
			f3.setDate(f3.getDate() - 1);
			d3 = f3.getDate();
			if (d3 == 30)
				dias -= 1;
			if (d3 == 29)
				dias -= 2;
			if (d3 == 28)
				dias -= 3;
		}
	}
	return { ans: ans, meses: meses, dias: dias, Tdias: totdias };
}
var f = {
	value: function (v) {
		var a = this;
		for (var i = 0; i < a.length; i++)
			if (a[i] == v) return true;
		return false;
	}
};
if (![].contains) Object.defineProperty(Array.prototype, 'contains', f);
if (!"".contains) Object.defineProperty(String.prototype, 'contains', f);
_.contains = function (a, b) {
	//    console.log(a);
	//    console.log(a&&a.includes(b));
	return a && a.includes(b);
}
_.MsgBox = function MsgBox(m, cb, b) {
	if (!b) b = ['OK'];
	//si el elemento debe cargarse en un dialog
	if (!document.body) return;
	var overlay = document.createElement("div");
	overlay.classList.add("v-overlay");
	overlay.style.padding = "40px";
	overlay.style.zIndex = "2000";
	document.body.appendChild(overlay);
	var dialog = document.createElement("div");
	var dialogContent = document.createElement("div");
	var msgContent = document.createElement("div");
	var buttons = document.createElement("div");

	buttons.className = "v-msgbox-buttons";
	dialog.classList.add("v-dialog");
	dialog.classList.add("v-msgbox");
	msgContent.innerHTML = m;
	dialog.setAttribute("path", _.currentPath);
	dialog.setAttribute("callback", nid);
	var closeListener = function () {
		dialog.style.display = "none";
		overlay.style.display = "none";

		dialog.parentNode.removeChild(dialog);
		overlay.parentNode.removeChild(overlay);
		if (cb) cb(this.getAttribute("index"));
		//_.RSZ();
	};
	for (var i = 0; i < b.length; i++) {
		var button = document.createElement("button");
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
	var nid = 'v_' + 0;// _.id();

	/*var acl=h.querySelector('.ui-js-close');
if (!acl) {
	var span = document.createElement("span");
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
	Vue.resize();
}
function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}
Vue.mergeDeep = function () {
	var target = arguments[0];
	var sources = [];
	for (var i = 1; i < arguments.length; i++)sources.push(arguments[i]);
	//Vue.mergeDeep = function(target, ...sources) {
	if (!sources.length) return target;
	//Se obtiene el primer elemento de source
	var source = sources.shift(), nv;
	//const source = sources.shift();
	if (isObject(target) && isObject(source)) {
		for (var key in source) {
			//for (const key in source) {
			if (isObject(source[key])) {
				/*console.log(key);
				console.log(source[key]);
				console.log(typeof source[key]);*/
				if (!target[key]) { nv = {}; nv[key] = {}; Object.assign(target, nv); }
				Vue.mergeDeep(target[key], source[key]);
			} else {
				nv = {};
				nv[key] = source[key];
				Object.assign(target, nv);
				//Object.assign(target, { [key]: source[key] });
			}
		}
	}
	var args = [];
	args.push(target);
	args.concat(sources);
	return Vue.mergeDeep.apply(null, args);
	//return mergeDeep(target, ...sources);
}
window.ui = _.ui = function (cfg) {
	var defs = {
		watch: {
			$route(v) {
				Vue.resize();
				this.changeRoute(v);
			},
			connected(v) {
				window._.networkStatus.connected = v;
				this.networkStatus.connected = v;
			}
		},
		computed: {
			online() {
				return this.app.networkStatus.connected;
			},
			user() {
				return window.app.session;
			},
			app() {
				return window.app;
			},
			perms() {
				return this.user.perms || this.user.allcaps || {};
			},
			rowSelectedCount() {
				var me = this;
				//console.log(me.$children);
				if (!me.$children[0]) return 0;

				var t = me.$children[0].$children[0];
				return t ? t.selected.length : 0;
			},
			baseURL() { return Vue.baseURL ? Vue.baseURL : axios.defaults.baseURL; },
			session: {
				get() {
					var me = this;
					if (!me._session) {
						var s = localStorage.getItem('session');
						if (s)
							s = JSON.parse(s);
						else s = {};
						me._session = s;
					}
					return me._session;
				},
				set(d) {
					localStorage.setItem('session', JSON.stringify(d));
					this._session = d;
				}
			}
		},
		data() {
			var me = this;
			return {
				filters: {},
				ui: me,
				_session: null,
				//rowSelectedCount: 0,
				row: {}
			}
		},
		updated() {
			//            console.log(this);
		},
		mounted() {
			var me = this;
			var vueid = _.id();
			//error cuando se carga un mapa con v-panel el mapa de turismo  es ejemplo
			if (me.$el && me.$el.setAttribute) {
				me.$el.setAttribute("vueid", vueid);
			}
			_.varMap[vueid] = me;
			me.ddd(me.$root);
		},
		methods: {
			resize() {
				Vue.resize();
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
								console.log(e);
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
			bindLinks(el, callback) {
				var me = this;
				el = el ? el : me.$el;
				//console.log(el);
				//console.log("ENTLO")
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
			},
			MsgBox: _.MsgBox,
			changeRoute() {/*console.log(v)*/ },
			pad: Vue.pad,
			key() { return Math.random(); },
			submitFile: function (f, name, cb) {
				var formData = new FormData();
				name = name ? name : f.name.replace(/[^\w\s.]/gi, '');
				formData.append('filename', name);
				formData.append('file', f, name);
				axios.post('/api/file/upload', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						filename: name
					}
				}).then(function (r) {
					cb(r.data);
				}).catch(function () {
					console.log('FAILURE!!');
				});
			},
			go(e) { window.o(e); },
			ddd(/*o*/) {
				//                for(var i=0;i<o.$children.length;i++){
				//                    var child=o.$children[i];
				//                    console.log(child);
				//                    if (child.$vnode.tag && child.$vnode.tag.includes("v-table")) {
				//                        //child.setColumns(columns);
				//                    }else{
				//                        this.ddd(child);
				//                    }
				//                }
			},
			rowCreated(r) {
				this.row = r;
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
			create() {
				var me = this;
				var action = me.$children[0].action;
				if (!action)
					action = window.location.pathname;
				action = _.processURL(action);
				if (window.app) {
					me.open(action + '/create');
				} else {
					instance.get(_.currentPath = (action + '/create').replace(/([^:]\/)\/+/g, "$1") + '?modal')
						.then(_.open).catch(me.error);
				}
			},
			edit(e) {
				var me = this;
				var f = me.$children[0];
				var action =f.action;
                var t=[].filter.call(e.component.$parent.$children,(e)=>{
                    return e.$el.classList.contains('v-datatable');
                })[0];
                if(t&&t.src)action=t.src.replace("/api", "").replace("api/", "").replace("/0/0", "");
				if (e.action) action = e.action;
                if(!t)
				t = e.$vnode ? e : (e.target && e.target.$vnode) ? e : me.$children[0].$children[0];
				
				if (!action && t.src) action = t.src.replace("/api", "").replace("/0/0", "");
				
				if (!action)
					action = window.location.pathname;
				if(action)action=action.replace("/api", "");
					var selected = me.getSelected(t)[0];
				var id = selected[t.rowKey];
				if (selected.tmpId) id = -selected.tmpId;
				console.log(selected);
				if (me.getSelectedId) id = me.getSelectedId(selected);
				if (window.app) {
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
				var t=[].filter.call(e.component.$parent.$children,(e)=>{
                    return e.$el.classList.contains('v-datatable');
                })[0];
				if(!t)
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
							var c = 0, db = window._.db;
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
							console.log('cbb===' + cb);
							me.$emit('destroyed', ele);
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
							console.log(t.selected);
							var k = (t.selected.length - 1)
							axios.delete(src + '/' + id, { params: t.filters }).then(function () {
								console.log(t.selected);
								for (; k >= 0; k--) {
									console.log('k=' + k);
									console.log(t.data);
									console.log('t.selected[k]=' + t.selected[k]);
									dat = t.data[t.selected[k]];
									ele.push(dat);
									console.log(ele);
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
						console.log('path=' + t);
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
					console.log("PATH====");
					console.log(path);
				} else if (response.target) {
					el = response.target;
					return me.open(el.pathname ? el.pathname : el.href);
				} else if (response === 'GET') {
					if (typeof path == 'string') {
						var cfg = { path: _.currentPath = path + (typeof o == 'string' ? '/' + o : '') };
						if (typeof o == 'function') {
							cfg.result = o;
						} else if (typeof o == 'object') {
							cfg = Vue.mergeDeep(cfg, o);
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
				console.log("PATH====222");
				console.log(path);
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
				if (!mask && window.app.$router) {
					window.app.$router.back();
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
			refresh() {
				//Para que funcione se debe tener el listado respetando la estructura 
				var me = this;
				var t = me.$children[0].$children[0];
				t.load();
			},
			async getStoredList(storage, tt) {
				if (window._.db) {
					let p = new Promise((resolve) => {
						var t = (tt ? window._.db.transaction(storage, tt) : window._.db.transaction(storage)), objectStore = t.objectStore(storage);//,d=[];
						var r = objectStore.getAll();
						r.onsuccess = function () {
							resolve(r.result, t);
						}
						//t.onerror = event => reject(event.target.error);
					});
					let result = await p;
					return result;
				} else {
					var vvv = localStorage.getItem(storage);
					try {
						if (vvv) vvv = JSON.parse(vvv);
					} catch (e) { me.MsgBox(e); vvv = null }
					return vvv;
				}
			},
			removeStored(storage) {
				if (window.idb) {
					var me = this, db = window._.db, objectStore = db.transaction([storage], "readwrite").objectStore(storage);
					var objectStoreRequest = objectStore.clear();
					objectStoreRequest.onerror = function () {
						me.MsgBox('Error al eliminar data temporal');
					};
				} else {
					localStorage.removeItem(storage);
				}

			},
			async toast(msx, callback) {
				if (msx.message && !msx.duration) msx.duration = 2000;
				const toast = await this.$ionic.toastController.create(msx.message ? msx : {
					message: msx,
					duration: 2000
				});
				await toast.present();
				if (callback) callback();
			},
			async setStoredList(store, data) {
				if (window._.db) {
					var db = window._.db, objectStore = db.transaction([store], "readwrite").objectStore(store);
					var objectStoreRequest = objectStore.clear();
					objectStoreRequest.onsuccess = function () {
						for (var i in data) {
							var request = objectStore.add(data[i]);
							request.onerror = function (event) {
								console.log(event);
							}
						}
					};
				} else {
					localStorage.setItem(store, JSON.stringify(data))
				}
			},
			getStoreObject(storage, id) {
				var db = window._.db, objectStore = db.transaction([storage], "readwrite").objectStore(storage);
				return objectStore.get(id);
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
						var d = r.data;
						console.log(d);
						for (var k = 0; k < d.length; k++) {
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
				var p = me.$el;
				//Se debe buscar si abajo esta el form
				var f = p.querySelector("form");
				var va = this.validate(f);
				if (va) {
					var action = f.getAttribute('action');
					//console.log('Action='+action);
					if (!action) {
						action = me.$el.parentNode.getAttribute('path');
						if (action) {
							//debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
							var tc = action.split('/');
							if (tc[tc.length - 1] == 'edit')
								tc = tc.splice(0, tc.length - 2);
							else
								tc = tc.splice(0, tc.length - 1);
							action = me.apiLink(tc.join('/'));
						}
					}

					var o0 = this._data.data ? this._data.data : this._data.o;
					var o = JSON.parse(JSON.stringify(o0));

					if (me.process) o = me.process(o);
					//console.log('o2='+o);
					if (!(typeof o === 'object'
						&& !Array.isArray(o) && o !== null)) return;
					if (!action || !me.app.networkStatus.connected) {
						var store = me.$children[0].store;
						if (!store) { me.MsgBox('Store in form is undefined!'); return; }
						var storedList = await me.getStoredList(store);
						if (!storedList) storedList = [];
						if (o.id) {
							for (var k = 0; k < storedList.length; k++) {
								if (storedList[k].tmpId == o.tmpId) {
									delete o.synchronized;
									storedList[k] = o;
								}
							}
						}
						var db = window._.db;
						var objectStore = db.transaction([store], "readwrite").objectStore(store);
						if (!o.id) {
							o.tmpId = 1 * new Date();
							o.id = -o.tmpId;
							//add new item to start to array
							storedList.unshift(o);
							objectStore.add(o);
							me.$emit('stored', o, storedList, objectStore);
							if (me.app && me.app.toast) me.app.toast('El registro fue grabado exitosamente!');
							o0.tmpId = o.tmpId;
							o0.id = o.id;
							me.close({ success: true, data: o });
						} else {
							delete o.synchronized;
							var item = objectStore.get(o.tmpId);
							item.onsuccess = function () {
								console.log(item.result);
								if (item.result) {
									console.log('objectStore.put(o)');
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
						axios.post(action, o).then(function (result) {
							var data = result.data;
							if (o.tmpId) {
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

							if (me.$ionic)
								me.app.toast('El registro fue grabado exitosamente!', function () {
									me.close({ success: true, data: data });
								});
							else {
								console.log(data);
								me.MsgBox('El registro fue grabado exitosamente!', function () {
									me.close({ success: true, data: data });
								});
							}
						}).catch(function (r) {
							console.log(r);
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
					me.MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
					if (me.$el.parentNode.className == 'v-dialog')
						me.$el.parentNode.parentNode.scroll({
							top: 0,
							behavior: 'smooth'
						});
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
					if (!cfg.fileName)
						var disposition = response.headers['content-disposition'];
					if (disposition && disposition.indexOf('attachment') !== -1) {
						var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						var matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1]) {
							cfg.fileName = matches[1].replace(/['"]/g, '').trim();
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
			validate(e2) {
				var me = this;
				var ok = true;
				e2 = e2 ? e2 : me.$el;
				var input = e2.querySelectorAll("input,select,textarea,div[required=required]");
				var radio = {}, previousElementSibling;

				for (i = 0; input.length > i; i++) {
					var e = input[i];
					if (e.type === 'radio') {
						var oo = radio[e.name];
						if (!oo)
							radio[e.name] = (oo = []);
						oo.push(e);
						continue;
					}
					previousElementSibling = e.previousElementSibling;
					if (previousElementSibling && previousElementSibling.classList && previousElementSibling.classList.contains('v-error')) {
						previousElementSibling.parentNode.removeChild(previousElementSibling);
					}
					if (!(e.disabled || e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
						//console.log([e]);
						//console.log(e.value);console.log(e.nodeValue);

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
							var error = document.createElement("div");
							error.innerHTML = "Este campo es requerido!";
							ok = false;
							error.classList.add("v-error");
							e.parentNode.insertBefore(error, e);
						}
					}
				}
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
				return ok;
			},
			showerror: _.showerror
		}
	};
	if (!cfg) cfg = { data: { o: {} } };
	if (!window.isMobile) {
		var el = cfg.el;
		if (typeof cfg.el === 'string') {
			el = document.querySelector(cfg.el);
		} else {
			var script = document.getElementsByTagName("script");
			el = script[script.length - 1].previousElementSibling.previousElementSibling;
		}
		var tv = el.querySelectorAll("v-tabview");
		for (var i = 0; i < tv.length; i++) {
			var id = 'v-' + _.id();
			tv[i].setAttribute("vid", id);
			var cn = tv[i].childNodes;
			var tabs = [];
			_.varMap[id] = tabs;
			for (var j = 0; j < cn.length; j++) {
				if (cn[j].tagName) {
					cn[j].className = 'hide';
					tabs.push({
						title: cn[j].title
					});
				}
			}

		}
		cfg.el = el;
	}
	cfg = { mixins: [defs, cfg] };
	return window.isMobile ? cfg : new Vue(cfg);
}
function configureAxios(a) {
	var mask;
	a.interceptors.request.use(function (config) {
		_.eeee = config;
		if (config.mask) {
			config.mask();
		} else if (!mask) mask = _.mask();
		return config;
	}, function (e) {
		mask = _.unmask(mask);
		_.MsgBox('request ' + _.id() + ' ' + e.message)
		return Promise.reject(e);
	});
	a.interceptors.response.use(function (response) {
		mask = _.unmask(mask);
		return response;
	}, function (e) {
		if (axios.error && axios.error(e) == false) {
			mask = _.unmask(mask);
		} else {
			var r = e.response, msg = (r && r.data && r.data.msg) ? r.data.msg : e.message;
			if (r) {
				if (r.data && r.data.message) msg = r.data.message;
				if ((typeof r.data) === 'string') msg = r.data;
				if (!msg) {
					msg = r.status + ': ' + r.statusText;
				}
			}
			mask = _.unmask(mask);
			if (r && r.status == 401) {
				if (window.app) {
					window.app.toast('Session terminada');
					window.app.logout();
					return;
				}
			}
			if (e.config.error) {
				e.config.error(e, msg);
			} else {
				_.MsgBox('<b>' + e.request.responseURL + '</b><br/><br/>' + msg);
			}
		}
		delete axios.error;
		return Promise.reject(e);
	});
}
window._ = _;
window.Vue = Vue;
window.axios = axios;
Vue.configureAxios = configureAxios;
configureAxios(axios);
export default {
	install(Vue, options) {
		console.log(_.Vue);
		Vue.filter('upper', (s) => {
			return s ? s.toUpperCase() : s;
		});
		Vue.filter("date", _.toDate.bind(options));
		Vue.filter("capitalize", _.capitalize.bind(options));
		Vue.filter("upper", _.upper.bind(options));
		console.log('filter date addedd!');
		Vue.component("v-autocomplete", VAutocomplete);
		Vue.component("v-button", VButton);
		Vue.component("v-calendar", VCalendar);
		Vue.component("v-checkbox", VCheckbox);
		Vue.component("v-checkbox-group", VCheckboxGroup);
		Vue.component("v-radio", VRadio);
		Vue.component("v-radio-group", VRadioGroup);
		Vue.component("v-group", VGroup);
		Vue.component("v-dataview", VDataview);
		Vue.component("v-fieldset", VFieldset);
		Vue.component("v-form", VForm);
		Vue.component("v-table", VTable);
		Vue.component("v-tabview", VTabview);
		Vue.component("v-switch", VSwitch);
		Vue.component("v-select", VSelect);
		Vue.component("v-layer-control", VLayerControl);
		Vue.component("v-map", VMap);
		Vue.component("v-map-control", VMapControl);
		Vue.component("v-number", VNumber);
		Vue.component("v-options", VOptions);
		Vue.component("v-overlay", VOverlay);
		Vue.component("v-uploader", VUploader);
		Vue.component("v-panel", VPanel);
		Vue.component("v-popup", VPopup);
		Vue.component("v-textarea", VTextarea);
		Vue.component('v-filter-calendar', {
			template: '<div><v-button icon="fa-calendar" v-on:click.prevent="open"/>' +
				'<v-panel style="text-align:left;position:absolute;display:none" v-bind:header="\'Configurar Filtro []\'"><div style="padding:20px"><div class="v-form"><label>Desde:</label><v-calendar v-model="from"/><label>Hasta:</label><v-calendar v-model="to"/></div>' +
				'<center style="padding-top:20px"><v-button icon="fa-check" value="Aceptar"/><v-button icon="fa-ban" v-on:click.prevent="close" value="Cerrar"/></center></div>' +
				'</v-panel></div>',
			data: function () { return { el: null, mask: null } },
			methods: {
				open() {
					var el = this.el ? this.el : (this.el = this.$el.children[1]);
					this.mask = _.mask(el, { backgroundColor: 'rgba(0,0,0,0.95)' });
					el.style.display = 'block';
				},
				close() {
					_.unmask(this.mask);
				}
			}
		});
		Vue.component('v-accordion', {
			mounted() {
			},
			methods: {
				toggle(e) {
					this.$emit('change', e);
				}
			},
			template: '<div class="v-accordion"><slot></slot></div>'
		});
		Vue.component('v-tab', {
			props: ['title', 'expanded'],
			data() {
				return {
					count: 0, expanded_: 0
				}
			},
			update() {
				this.$el.querySelector('svg').dataset.icon = "chevron-down";
			},
			mounted() {
				var me = this;
				me.expanded_ = me.expanded;
				setTimeout(function () {
					me.$el.querySelector('svg').dataset.icon = "chevron-down";
				}, 100)
			},
			methods: {
				toggle() {
					this.expanded_ = !this.expanded_;
					this.$el.querySelector('svg').dataset.icon = this.expanded_ ? "chevron-up" : "chevron-down";
					//avisa al padre q este hijo se expandera
					if (this.$parent && this.$parent.toggle) {
						this.$parent.toggle(this);

					}
				}
			},
			template: '<div><div v-on:click="toggle" v-bind:class="{expanded:expanded_}" style="cursor:pointer;position: relative;padding: 10px 0px;">{{title}}<span style="position:absolute;right:0px" ><i data-icon="chevron-down" class="fa"></i></span></div>' +
				'<transition name="fade"><div class="v-tab-content" v-if="expanded_"><slot></slot></div></transition></div>'
		});
	}
};