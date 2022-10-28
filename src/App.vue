<template>
	<router-view></router-view>
</template>
<script>
	import './cdn/vue-ui.js'
	import {LocalNotifications} from "@capacitor/local-notifications";
	import '@fortawesome/fontawesome-free/css/all.css'
	import '@fortawesome/fontawesome-free/js/all.js'
	import { Network } from '@capacitor/network';
	import { App as CapacitorApp } from '@capacitor/app';
	window.Vue.config.ignoredElements = ['v-filter']
	var a=window.axios;
	var axios=window.axios;
	var session = localStorage.getItem('session');
	var _=window._;
	_.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	_.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	_.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
	if (!_.indexedDB) {
		window.alert("Your browser doesn't support a stable version of IndexedDB.")
	}else{
		var request = window.indexedDB.open("db", 1);
		request.onerror = function() {
			alert("error al crear db :/!");
		};
		request.onsuccess = function() {
			_.db = request.result;
		};
		request.onupgradeneeded = function(event) {
            var db = event.target.result;
			db.createObjectStore("region", {keyPath: "id"});
			db.createObjectStore("province", {keyPath: "code"});
            db.createObjectStore("district", {keyPath: "code"});
			db.createObjectStore("town", {keyPath: "id"});
			db.createObjectStore("sample", {keyPath: "id"});
			db.createObjectStore("pool", {keyPath: "id"});
			db.createObjectStore("people", {keyPath: "id"});
		}
	}

	if(session){
		try{
			console.log(session.length);
			session=JSON.parse(session);
			a.defaults.headers.common = {'Authorization': `Bearer `+(session.token?session.token:session.uid)};
		}catch(e){
			localStorage.removeItem('session');
			session=null;
		}
	}
	a.defaults.baseURL = 'https://grupoipeys.com/wp-json';
	export default {
		created(){
			var me=this;
			if(!session)
			me.$router.push('/');
			this.imgError=require('@/cdn/images/no-image.png');
			var sf=function(status){
				status.connected=status.connected&&me.connected;
				window._.networkStatus =status;
				me.networkStatus=status;
			};
			Network.addListener('networkStatusChange',sf);
			Network.getStatus().then(sf);
			var s=session?session[0]:null;
			if(s){
				s.uid=s.idUsuario;
				if(!s.people){
					axios.get('/apishami/api/persona/datos/'+s.idPer).then(function(d){
						s.people=d.data;
						localStorage.setItem('session', JSON.stringify(session=[s]));
					});
				}
			}
			var p=JSON.parse(localStorage.getItem('cart')),t=0;
			if(!p)p=[];
			me.cart.products=p;
			for(var i=0;i<p.length;i++){
				t+=p[i].count;
			}
			me.cart.total=t;
			//this.connect();

		},
		watch:{
			connected(v){
				window._.networkStatus.connected=v;
				this.networkStatus.connected=v;
			}
		},
		data(){return {
			iconoConClick:false,
			ws: null,
			connected:true,
			baseURL:a.defaults.baseURL,
			title:'',
			icono:'',
			categories:[],
			notification:[],
			profileImg:null,
			ki:0,
			imgError:null,
			k:0,
			networkStatus:null,
			idcategoria:null,
			showMenu:false,showUser:false,session:session,
			overlay:null,
			cart:{
				products:[],
				total:0,
				get(e){
					if(!e.id)e.id=e.idProducto;
					var p=this.products;
					for(var i=0;i<p.length;i++){
						if(p[i].idProducto==e.id||p[i].id==e.id){
							return p[i];
						}
					}
					return e;
				},
				remove(e){
					if(!e.id)e.id=e.idProducto;
					var t=0;
					var p=this.products;
					var j=-1;
					for(var i=0;i<p.length;i++){
						if(p[i].idProducto==e.id||p[i].id==e.id){
							j=i;
							p[i].count--;
							e['count']=p[i].count;
						}
						t+=p[i].count;
					}
					if(j>-1&&e.count==0){
						p.splice(j, 1)
					}
					this.total=t;
					localStorage.setItem('cart', JSON.stringify(p));
					return e;
				},
				removeAll(e){
					if(!e.id)e.id=e.idProducto;
					var p=this.products;
					var index = p.map(x => {
						return x.id?x.id:x.idProducto;
					}).indexOf(e.id);
					if(index>-1){
						p.splice(index, 1);
						this.products=p;
						localStorage.setItem('cart', JSON.stringify(p));
						this.total-=e.count;
					}
				},
				add(e){
					if(!e.id)e.id=e.idProducto;
					var t=0;
					var p=this.products;
					var j=-1;
					for(var i=0;i<p.length;i++){
						if(p[i].idProducto==e.id||p[i].id==e.id){
							j=i;
							p[i].count++;
							e['count']=p[i].count;
						}
						t+=p[i].count;
					}
					if(j==-1){
						e.count=1;
						p.push(e);
						t++;
					}
					this.total=t;
					localStorage.setItem('cart', JSON.stringify(p));
					return e;
				}
			}
		}},
		methods:{
			connect() {
				var me=this,session = localStorage.getItem('session');
				if(session){
					session=JSON.parse(session);
				}
				if(session!=null){
					var ws = new WebSocket("wss://web.regionancash.gob.pe/ws/S"+session.uid);
					ws.onopen = function() {
						// subscribe to some channels
						//ws.send(JSON.stringify({
						//.... some message the I must send when I connect ....
						//}));
					};
					ws.onmessage = function(e) {
						me.notify({body:e.data.msg?e.data.msg:e.data,title:'SHAMI APP'});
					};
					ws.onclose = function(e) {
						console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
						setTimeout(function() {
							me.connect();
						}, 5000);
					};
					ws.onerror = function(err) {
						console.error('Socket encountered error: ', err.message, 'Closing socket');
						ws.close();
					};
					me.ws=ws;
				}
			},
			async regionList(){
				return new Promise((resolve, reject) => {
					var t=window._.db.transaction("region"),objectStore = t.objectStore("region");//,d=[];
					var r=objectStore.getAll();
					r.onsuccess = function() {
						resolve(r.result);
					}
					t.onerror = event => reject(event.target.error);
				});
			},
			async townList(code){
				return new Promise((resolve, reject) => {
					var t=window._.db.transaction("town"),objectStore = t.objectStore("town"),d=[];
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							console.log(cursor.value);
							if(cursor.value.id.startsWith(code))d.push(cursor.value);
							cursor.continue();
						}
					};
					t.oncomplete = function () {
						resolve(d);
					};
					t.onerror = event => reject(event.target.error);
				});
			},
			async provinceList(code){
				return new Promise((resolve, reject) => {
					var t=window._.db.transaction("province"),objectStore = t.objectStore("province"),d=[];
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							if(cursor.value.code.startsWith(code))d.push(cursor.value);
							cursor.continue();
						}
					};
					t.oncomplete = function () {
						resolve(d);
					};
					t.onerror = event => reject(event.target.error);
				});
			},
			async districtList(code){
				return new Promise((resolve, reject) => {
					var t=window._.db.transaction("district"),objectStore = t.objectStore("district"),d=[];
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							if(cursor.value.code.startsWith(code))d.push(cursor.value);
							cursor.continue();
						}
					};
					t.oncomplete = function () {
						resolve(d);
					};
					t.onerror = event => reject(event.target.error);
				});
			},
			async notify(o){
				const notifs = await LocalNotifications.schedule({
					notifications: [
						{
							title: o.title,
							body: o.body,
							id: 1,
							/*schedule: { at: new Date(Date.now() + 1000 * 5) },*/
							sound:  'file://sound.mp3',
							attachments: null,
							actionTypeId: '',
							extra: null
						}
					]
				});
				this.notification.push(o);
				console.log('scheduled notifications', notifs);
			},
			async openToast(msx) {
				const toast = await this.$ionic.toastController.create({
					message: msx,
					duration: 2000
				});
				await toast.present();
			},
			async toast(msx) {
				const toast = await this.$ionic.toastController.create({
					message: msx,
					duration: 2000
				});
				await toast.present();
			},
			o(e){
				var me=this,t=e.target;
				e.preventDefault();
				console.log([t]);
				if(typeof e=='string'){
					t=e;
				}else if(t.href){
					t=t.pathname?t.pathname:t.href;
				}else{
					e.preventDefault();
					if(!t.pathname)t=t.parentNode;
					if(!t.pathname)t=t.parentNode;
					//if(!t.pathname)t=t.parentNode;
					t=t.pathname;
				}console.log(t);
				if (t&&me.$route.path!==t){
					me.$router.push(t);
				}
			},
			logout(){
				this.session=null;
				localStorage.removeItem('session');
				this.$router.push('/shami/login');
			},
			bindLinks(el,callback){
				var me=this;
				el=el?el:me.$el;
				//console.log(el);
				//console.log("ENTLO")
				if(el.querySelectorAll){
					//var a=el.querySelectorAll('a:not(._),ion-item:not(._)'); 
					var a=el.querySelectorAll('a:not(._),ion-item:not(._)');
					//console.log(a)
					var f=function(e){
						if(callback)callback();
						me.o(e);
					};
					for(var i=0;i<a.length;i++){
						console.log(a[i]);
						console.log(a[i].attributes);
						if(a[i].attributes.href){
							a[i].onclick=f;
							a[i].classList?a[i].classList.add('_'):a[i].className='_';
						}
					}
				}
			},
			isElement(obj) {
				try {
					return obj instanceof HTMLElement;
				}catch(e){
					return (typeof obj==="object")&&(obj.nodeType===1)&&(typeof obj.style === "object")&&(typeof obj.ownerDocument ==="object");
				}
			},
			error(event,src){
				if(!src)
					src=this.imgError;
				event.target.src=src;
				event.target.style.objectFit='contain';
			}
		},
		updated(){
			this.bindLinks();
			this.$emit('updated');
		},
		mounted(){
			var me=this;
			window.o=this.o;
			window.app=me;
			
			CapacitorApp.addListener('backButton', ({canGoBack}) => {
				console.log('window.history.length============='+window.history.length);
				if(!canGoBack||window.history.length==0){
					CapacitorApp.exitApp();
				} else {
					me.$router.back();
				}
			});
			window.app.profileImg=session&&session.people?session.people.urlPerfil:null;
			me.bindLinks();
		}
	}
</script>
<style>

	@font-face {
		font-family: 'DeliusSwashCaps';
		src: url('~@/cdn/fonts/DeliusSwashCaps-Regular.ttf');
	}
	@font-face {
		font-family: 'NeoSans';
		src: url('~@/cdn/fonts/NeoSansProRegular.OTF');
	}
	* {
		margin: 0px;
		padding: 0px;
	}
	*,ion-content,div,li,span,label,.ui-outputlabel,a,ui-link,.ui-widget{
		font-family: NeoSans !important;
	}
	.a_product{
		position: absolute;
		right: 0px;
		height: 100%;
		width:50% !important;
		top: 0px;
		color: white;
		padding: 10px;padding-left: 20px;
		background-color: #3f51b5a3;
		background: linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(9,9,121,0.2) 40%, rgba(9,9,121,0.8) 100%);
	}
	.v-title {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		position: absolute;
		padding: 5px;
		width: calc(100% - 66px);
		display: inline-block;
		left: 28px;
	}
	img.error{
		opacity:0;
		width:100%;
	}
	.view-list > *:not(label):not(:last-child){
		margin-bottom:10px;
	}
	.view-list > h2:first-of-type *,.view-list > h2:first-of-type{
		font-size: 23px !important;
	}
	.view-list > h2:first-of-type > *{
		margin-right:5px !important;
	}
	.loading{
		background: url(./cdn/images/loading.svg) no-repeat top center;
	}
	.v-controls > *:not(:last-child){
		margin-right:15px;
	}
	.v-primary-dark{
		display: inline-block !important;
		width: calc(100% - 80px) !important;
		padding: 5px 40px;
		text-decoration: none;
		border-radius: 10px;
		margin-bottom: 10px;
		border:1px solid white;
	}
	li > .v-primary-dark{
		border-radius: 0px;
		width:calc(100% - 20px);
		border:0px solid white;
	}
	body {
		background-color: #0f62ac;
	}
	#app {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
		margin-top: 0px;
	}
	#page-header{
		border: 1px solid gray;		
		min-height: 36px;
	}
	#page-header > *{	
		min-height: 36px;
	}
	.v-widget-header,.ui-state-default{
		border: 1px solid #a8a8a8;
		background: #c4c4c4 linear-gradient(top,rgba(255,255,255,0.8),rgba(255,255,255,0));
		background: #c4c4c4 -webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(255,255,255,0)));
		background: #c4c4c4 -moz-linear-gradient(top,rgba(255,255,255,0.8),rgba(255,255,255,0));
		background: #c4c4c4 -webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(255,255,255,0)));
		color: #333;
		font-weight: bold;
		text-shadow: 0 1px 0 rgba(255,255,255,0.7);
	}
	.v-button-text-icon-left i,.v-button-text-icon-left svg, a svg {
		margin-right: 10px;
	}
	.tre li a {
		border-bottom: 1px solid #5d4141;
		padding: 10px;
		font-size: 22px;
		font-weight: normal;
	}
	.tre ul {
		padding-left: 30px;
	}
	.tre i{
		margin-right: 10px;
		width: 26px;
		text-align: center;
	}
	#page-header > .v-header-button {
		min-height: 36px;
		padding: 0px 6px;
		display: inline-block;
	}
	.v-header-button{
		cursor:pointer;
	}
	.v-header-button:hover{
		background-color:#0e355a;
	}
	.v-header-button > svg {
		overflow: visible;
		height: 34px;
		width: 22px !important;
		color: white;
	}
	.ui-datatable thead th, .ui-datatable tbody td, .ui-datatable tfoot td, .ui-datatable tfoot th {
		padding: 4px 5px;
		border-color: #ccd0d4;
		overflow: hidden;
		border: 1px solid #ccd0d4;
	}
	body{
		overflow-y:unset;
	}
	.v-popup-2 svg{
		left:0px;
		top:0px;
		margin:10px;
		position:absolute;
	}
	.v-popup-2 li{
		position:relative;
		border: 1px solid #c1c1c1;
		cursor:pointer;
		padding: 7px 7px 7px 50px;
	}
	.v-table{
		width:100%;
	}
	.v-popup-2 li:hover{
		font-weight:bold;
		background-color: #dae1e4;
	}
	.v-popup-2{
		list-style-type: none;
	}
	@media (min-width: 700px){
		.v-mobil{
			visibility: hidden;
			display: none;
		}
	}
	@media (max-width: 700px){
		.v-popup-2{
			width:100% !important;
		}
		.ui-datatable-header{
			visibility: hidden;
			display: none;
		}
	}
	.ic-42 svg{
		height: 36px;
		width: 36px;
		-webkit-filter: brightness(10);
		filter: brightness(10);
		background-size: 34px 34px;
		background-position: 2px 2px;
		background-repeat: no-repeat;
	}
	.v-map-overlay{
		background-color:white;border-radius: 5px;border:1px solid gray;
	}
	.v-map-overlay .x-dlg-body{
		overflow-y:auto;
	}
	.v-map-overlay .x-dlg-header{
		border-radius: 5px 5px 0px 0px;
		background-color: #0f62ac;
		color: white;
		padding: 10px 30px 10px 10px;
	}
	.v-map-overlay .x-dlg-footer{
		padding:5px;
	}
	.v-map-overlay .x-dlg-footer > *{
		display:inline-block;
	}
	.v-map-overlay .triangle{
		width: 0;
		height: 0;
		border-width: 21px 13px 0 13px;
		border-color: #FFFFFF transparent transparent transparent;
		border-style: solid;
		filter: drop-shadow(0px 8px 1px #A3A3A3);
		position: absolute;
		bottom: -12px;
	}
	.ui-user > a{
		display:inline-block;
		padding:5px;
	}
	.ui-user{
		min-height: 0px !important;
		float: right;
		color: white;
		padding: 7px 0px 7px 7px;
		margin: 0px;
	}
	.x-menu-list{
		z-index: 1005;
		top: 38px;
		width:200px;
	}
	.x-menu-list > li > a {
		padding: 10px 20px;
		display: block !important;
		width:unset !important;
	}
	.x-menu-bar svg.fa-bars{
		font-size: 24px !important;
		padding: 5px !important;
	}
	.tre ul > li a > svg{
		width:24px;
		height:24px;
	}
	.s-button{
		background:unset;
		border-radius:10px;
		text-shadow: none;
	}
	.v-load-more{
		padding: 10px;
		margin: 0px 0px 10px 0px;
		background-color: gray;
		color: white;
		border-radius: 10px;
	}
	.v-selected > td.yellow{
		background-color:#9c9c38 !important;
	}
	.primary{
		background-color:rgb(15, 98, 172);
		color:white;
	}
	.ui-datatable-scrollable-body::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb {
		background:rgb(15, 98, 172);
	}
	.img{
		width:100%;
	}
	div.img.error{
		background-color: rgb(232, 232, 232);
	}
	.img.error > img{
		opacity:0;
	}
	.v-dataview > :not(:last-child){
		margin-bottom:15px;
	}
	.v-search{
		position:relative;margin:15px 0px
	}
	.v-search input{
		border: 1px solid rgb(187, 187, 187);
		width: calc(100% - 60px);
		background-color: rgb(232, 232, 232);
		padding: 5px 30px;
		border-radius: 10px;
	}
	.v-search > span{
		padding: 5px 7px;position: absolute; right: 0px; top: 0px;
	}
	.v-search > i,.v-search > svg{
		position: absolute; left: 0px; top: 0px;padding: 5px 7px;
	}
	.v-dataview > div > *{
		width:100%;
		display:inline-block;
	}
	.fade-enter-active, .fade-leave-active {
		transition: opacity .5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
	.v-input-field svg{
		margin: 5px;
		opacity:.5;
	}
	.v-form input,.v-form select,.v-form textarea{
		border-radius: 8px !important;
	}
	.v-input-field input{
		border-radius: 8px;
		padding-left: 26px !important;
	}
	.v-tab-content > span{
		text-align:justify;
		padding:5px 0px;
	}
	.v-accordion > div:not(:last-child) > .v-tab-content{
		padding-bottom:20px;
	}
	.v-accordion > div:not(:last-child){
		border-bottom:1px solid gray;
	}
	.v-accordion > * > .expanded{
		font-weight: bolder;
	}
	#page-header > * {
		min-height: unset;
	}
/*@jgmel95 se agrego para poder cargar el css y html nativo junto a ionic*/
	html:not(.hydrated) body {
    display: initial !important;
	}
	/* Works - pass "my-custom-class" in cssClass to increase specificity */
	.modaltodo .modal-wrapper {
		--min-height: 100%;
		--min-width	: 100%;
		--border-radius: 0px;
	}
	/*.sub-category ion-segment-button {
		background-color: #f5ffb2;
		min-height: auto;
		padding: 10px;
		border: 1px solid #dad68e;
		margin-top: 1px;
		border-radius: 5px;
		margin-right: 5px;
		min-height:auto;
	}
	.sub-category ion-segment-button.segment-button-checked{
		background-color:#0f62ac;
	}
	#subcate{
		padding-top: 10px;
	}*/
	.c-w-1{
		width:100%;
	}
	.product img{
		height: 100%;
		object-fit: cover;
		max-height: none !important;
	}
	.c-w-2{
		width:calc(50% - 9px);
	}
	.c-w-3{
		width:calc(33.33% - 9px);
	}
	.c-w-4{
		width:calc(25% - 9px);
	}
	.c-w-5{
		width:calc(20% - 9px);
	}
	.c-w-6{
		width:calc(16.6667% - 9px);
	}
	.v-search{
		position:relative;
		margin:15px 0px
	}
	.v-search input{
		border: 1px solid rgb(187, 187, 187);
		width: calc(100% - 60px);
		background-color: rgb(232, 232, 232);
		padding: 5px 30px;
		border-radius: 10px;
	}
	.v-search > span{
		padding: 5px 7px;
		position: absolute; right: 0px; top: 0px;
	}
	.v-search > i,.v-search > svg{
		position: absolute; 
		padding:0px;
		left: 6px; 
		top: 6px;
	}
	.v-search > input:nth-child(2){
		padding-left:36px !important;
	}
	.v-last{
		margin-right:0px !important;
	}
	ion-content > .v-dataview{      
		margin:10px;
		display:inline-block;
		width: -webkit-fill-available;
	}
	/*.segment-button-checked{
		
		padding-top:10px;
	}*/
	ion-segment-button.category2{
		padding-top:10px;
	}/*
	ion-toolbar > ion-segment{
		background-color: #e1f0ff;
	}
	.segment-button-checked.category2 > div{
		color:white;
	}
	ion-segment-button.category2 > div{
		font-size:12px;
		width: 100%;
		height: 100%;
		padding-bottom: 10px;
		margin-top: 11px;
		color:black;
	}*/
	.primary{
		background-color: white !important;
		color:#2958b1;
	}
	.toolbar > a{
		width: 25%;
		text-align:center;
		color:#2958b1;
	}
	.toolbar > a .svg-inline--fa{
		width: 100% !important;
		text-align:center;
		
	}
	.sc-ion-searchbar-ios-h{
		display:block;
		height: auto;
		contain: unset;
	}
	.searchionic {
		margin-top: 0px !important;
	}
	ion-toolbar{
		min-height: auto;
	}
	.sub_product_detail{
		display:none !important;
	}
	.product .v-controls,#iconosproducto {
		margin: 5px 0px;
	}
	.a_product .price{
		font-size: 22px;
		color: #FFF;
	}
	.v-dataview > .product {
		margin-bottom: 10px !important;
	}
	.ion-content-yellow{
		background-color: #ffd102;
		--ion-background-color: #ffd102;
	}
	.ion-content-blue{
		background-color: #2b58b5;
		--ion-background-color: #2b58b5;
	}
	.ion-content-blue .fa-shopping-cart{
		color:white;
	}
	.ion-content-blue .v-dataview>.v-more-results,
	.v-dataview>.v-more-results	{
		background:#ffffffff !important;
	}
	.v-no-results {
		background: white;
	}
	#logotienda {
		display: block;
		margin-left: auto;
		width: 80px;
		background-color: white;
		background-repeat: no-repeat;
		background-position: 50%;
		border-radius: 50%;
		background-size: 100% auto;
		margin-top: -25px;
		transition: .4s all;
		transition: .3s all;
		z-index: 1;
		border-style: solid;
		padding: 5px;
		border-width: 2px;
		border-color: #535353a3;
		padding: 0px;
		box-shadow: 1px 2px 2px #535353a3;
		margin-right: 10px;
	}
	.product-info .price{
		color:black;
	}
	.loading{
		background:url(./cdn/images/loading.svg) no-repeat top center !important;
	}
	ion-router-outlet{
		display:none;
	}
	.v-dialog-content{
		background-color:transparent !important;
	}
	.ui-panel .v-panel-titlebar {
		background: transparent !important;
		color: #2b57b5 !important;
		border-width:0px;
		font-size: 30px;
	}
	.span-rounded{
		background-color:white;padding:2px;border-radius:1000px;width:24px;position:absolute;right:5px;
	}
	.v-button{
		color: white;
		background: #2b57b5;
		text-shadow: none;
	}
	.v-button:focus,.v-button:hover,.v-button:not(.ui-state-disabled):not(disabled):not(.disabled):hover{
		color: white;
		background: #1c3977 !important;
		text-shadow: none;
	}
	label{
		color: #2b57b5;
	}
	.v-button label{
		color: #FFF;
	}
	span.yellow{
		background-color:yellow;
	}
	.v-msgbox{
		background-color:white;
		text-align:center;
	}
	.v-widget-header > .v-panel-title {
		background-size: 20px !important;
		padding-left: 25px !important;
		background: none !important;
	}
	.v-button.red {
		background-color: red;
	}
	.v-button.red:hover,.v-button:not(.ui-state-disabled):not(disabled):not(.disabled):hover  {
		background-color: red !important;
	}	@media (max-width: 700px){
		*{
			font-size: 103%;
		}
	}
	.v-button-top-float{
		float: right;
		position: sticky;
		display: inline-block;
		cursor: pointer;
		font-size: 32px;
		padding: 5px 10px;
		background-color: #c9d5ff;
		top: 12px;
		border: 1px solid #919bff;
		z-index: 100;
		border-radius: 10px;
	}
	.v-button-top-float > svg{
		margin:0px;
	}
	svg{
	font-size:30px !important;
	}
	.v-dialog-content > form > h2{
	padding-left: 44px !important;margin-bottom: 20px;position: relative;font-size: 24px;background-color: transparent;
	}
	fieldset > div {
    padding: 0px !important;
}
</style>
