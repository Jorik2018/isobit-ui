import Vue from 'vue'
import Router from 'vue-router'
import './cdn/vue-ui.js'
import IsobitUI from 'isobit-ui'
import App from './App.vue'
import Ionic from '@ionic/vue';
import '@ionic/core/css/ionic.bundle.css';

import './cdn/isobit.css'
Vue.use(Router);
Vue.use(IsobitUI);
Vue.use(Ionic);
Vue.config.ignoredElements = [/^ion-/];   // add this line
Vue.config.productionTip = false;



Vue.filter('upper',(s)=>{
	return s?s.toUpperCase():s;
});
const  router  =  new  Router({
	mode: 'history',
	routes: [
		{
			path:'/shami/login',
			component:  r => require.ensure([], () => r(require('./shami/Login.vue')), 'login')
		},
		{
			path:'/shami/register',
			component:  r => require.ensure([], () => r(require('./shami/Register.vue')), 'registros')
		},
				{
			path:'/shami/password',
			component:  r => require.ensure([], () => r(require('./shami/Password.vue')), 'passwords')
		},
		{
			path:'/introduction',
			component:  r => require.ensure([], () => r(require('./shami/Introduction.vue')), 'introduction-pages')
		},
		{
			path:'/shami/intro',
			component:  r => require.ensure([], () => r(require('./shami/Intro.vue')), 'introduction-pages')
		},
		{
			path:'/shami/search',props: true,
			component:  r => require.ensure([], () => r(require('./shami/Template2.vue')), 'search'),
		},	
		{
			path:'/shami',
			component:  r => require.ensure([], () => r(require('./shami/Template.vue')), 'template'),
			children:[
							{
					path:'',//./admin/poll/List.vue
					component:  r => require.ensure([], () => r(require('./shami/Inicio.vue')), 'productosgeneral'),
				},
				{
					path:'pool',props: true,
					component:  r => require.ensure([], () => r(require('./admin/poll/List.vue')), 'productosgeneral'),
				},
				
				
				{
					path:'setting',props: true,
					component:  r => require.ensure([], () => r(require('./shami/Setting.vue')), 'productosgeneral'),
				},
				{
					path:'sectionA/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionA.vue')), 'productosgeneral'),
				},
								{
					path:'sectionB/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionB.vue')), 'productosgeneral'),
				},
				{
					path:'sectionBList/:parent',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionBList.vue')), 'productosgeneral'),
				},
				{
					path:'sectionBList/:parent/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionBList.vue')), 'productosgeneral'),
				},
				
				{
					path:'sectionC/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionC.vue')), 'productosgeneral'),
				},
				{
					path:'sectionD/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionDList.vue')), 'productosgeneral'),
				},
								{
					path:'sectionD/:parent/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionD.vue')), 'productosgeneral'),
				},
				{
					path:'sectionE/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionE.vue')), 'productosgeneral'),
				},
				{
					path:'section',
					component:  r => require.ensure([], () => r(require('./shami/SeccionMain.vue')), 'productosgeneral'),
				},
				{
					path:'sectionF/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionF.vue')), 'productosgeneral'),
				},
				{
					path:'sectionG/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionG.vue')), 'productosgeneral'),
				},
				{
					path:'sectionH/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionH.vue')), 'productosgeneral'),
				},
				{
					path:'sectionI/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionI.vue')), 'productosgeneral'),
				},
				{
					path:'sectionJ/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionJ.vue')), 'productosgeneral'),
				},
				{
					path: 'notification',
					component:  r => require.ensure([], () => r(require('./shami/Notifications.vue')), 'notifications')
				},				
				{
					path:  'profile',
					component:  r => require.ensure([], () => r(require('./shami/Profile.vue')), 'profile')
				},
				{	path:  'category/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/Category.vue')), 'categoriasx')	
				},
				{	path:  'category/:id/:subcategory',props: true,
					component:  r => require.ensure([], () => r(require('./shami/Category.vue')), 'categorias-pages')	
				},
				{
					path:'map',
					component:  r => require.ensure([], () => r(require('./shami/Map.vue')), 'mapitas'),
				}
			]
		},
		{
			path:'/admin',
			component:  r => require.ensure([], () => r(require('./shami/Template.vue')), 'template'),
			children:[
				{
					path:  'pool/create',
					component:  r => require.ensure([], () => r(require('./shami/SeccionMain.vue')), 'createe')
				},
				{
					path:  'pool/:id',props: true,
					component:  r => require.ensure([], () => r(require('./shami/SeccionMain.vue')), 'createe')
				},
				{
					path:'map',
					component:  r => require.ensure([], () => r(require('./admin/dircetur/restaurant/Map.vue')), 'mapitas'),
				}
			]
		},
		{
			path:  '/admin/me',
			component:  r => require.ensure([], () => r(require('./shami/Profile.vue')), 'admins')
		},
		{
			path:  '/restaurant',
			component:  r => require.ensure([], () => r(require('./admin/dircetur/restaurant/Map.vue')), 'bresss')
		}
	]
});


localStorage.setItem('intro',true);
router.beforeEach((to, from, next)=>{
	var session = localStorage.getItem('session');
	if(session)session=JSON.parse(session);
	if(session&&to.path == '/logout'){	
		window.app.session=null;
		localStorage.removeItem('session');
		next('/shami/login');
	}else if (session&&!localStorage.getItem('intro')&&to.path != '/shami/intro'){
		next('/shami/intro');
	}else if (!session&&to.path !== '/shami/login'){
		/*if (to.path == '/'&&!localStorage.getItem('intro')){
			next('/shami/intro');
		}else if ((to.path == '/shami/intro'&&!localStorage.getItem('intro'))||*/
		
		if (to.path == '/shami/register'||to.path=='/shami/password'){
			next();
		}else 
			next('/shami/login');
	}else if (to.path == '/'){
		next('/shami');
	}else{
		next();
	}
});
new Vue({
	router,
	render: h => h(App),
	created(){window.$app=this;}
}).$mount('#app')
