<template>
	<div class="v-dataview">
		<div v-if="data" v-bind:class="getRowClass(entry,r)" v-for="(entry,r) in data">
			<slot v-bind:row="entry" v-bind:item="entry" v-bind:index="r"></slot>
		</div>
		<div v-if="data&&!data.length" class="center v-no-results" v-bind:class="{error:error}">{{error?error:'No existen registros para mostrar'}}</div>
		<div v-if="data&&size>data.length" v-on:click="load(page++)" class="center v-more-results">Ver mas resultados</div>
	</div>
</template>
<script>
export default {
	name: 'VDataview',
    props: {
        value: Array,
        filterKey: String,
        src: String,
        filters: Object,
		store:null,
		itemWidth:null,
        rowKey: String,
        rowStyleClass:null,
        pagination: null,
        selectable: Boolean,
        scrollable: Boolean,
		autoload: {
			type: Boolean,
			default: true
		}
    },
	data: function () {
        var sortOrders = {}
        return {
            data: null,
            pages: 1,
            page: 1,
			columns:1,
			w:0,
            row: {},
			error:null,
			size:null,
            sortKey: '',
            selected: [],
            sortOrders: sortOrders,
            rowStyleClassFunc:null
        }
    },
	created(){
        var me=this;
		//console.log(typeof me.rowStyleClass);
		try{
			if(me.rowStyleClass){
				eval('me.rowStyleClassFunc=function(row,item,index){return '+me.rowStyleClass+'}');
				me.rowStyleClassFunc({},{},0);
			}
		}catch(e){me.rowStyleClassFunc=null;console.log('Error en la expresion rowStyleClassFunc=function(row,item,index){return '+me.rowStyleClass+'}')}
    },
	updated(){console.log('updated');this.$emit('updated');this.resize();},
	mounted(){
		var me=this;		
		me.$el.addEventListener("parentResize2",me.resize);
		if(me.autoload)me.load();
		me.resize();
	},
	methods:{
		resize(){
			var me=this;
			
			if(me.itemWidth){
				var w=1+Math.trunc((me.$el.offsetWidth)/Number(me.itemWidth));
				if(w>6)w=6;
				me.columns=w;
			}
		},
		async getStoredList(store){
			let p= new Promise((resolve) => {
				var t=window._.db.transaction(store),objectStore = t.objectStore(store);//,d=[];
				var r= objectStore.getAll();
				r.onsuccess = function() {
					resolve(r.result);
				}
				//t.onerror = event => reject(event.target.error);
			});
			let result = await p;
			//console.log(result);
			return result;
		},
        async loadStore(){
            let me=this,store=me.store;
            if(store!=null){
                let datj;
				if(window._.db)datj=await me.getStoredList(store);
				if(!datj)datj=[];
                me.data = me.data?datj.concat(me.data):datj;
                console.log('loadStore');
                console.log(me.data);
                return me.data;
                //
                //console.log(me.data);
                //me.rowSelect(null, -10);
            }
        },
		getRowClass(row,r){
            var me=this,c=r%me.columns+1;
			var cls=['c-w-'+me.columns];
			if(c==me.columns)cls.push('v-last');
            if(me.rowStyleClassFunc)cls.push(me.rowStyleClassFunc(row,row,r));
			else cls.push(me.rowStyleClass);
            return cls;
        },
		remove(id){
			id=id.id?id.id:id;
			var list=this.data;
			var index = list.map(x => {
				return x.id;
			}).indexOf(id);
			list.splice(index, 1);
		},
		error2(e,m){
			this.data=[];
			this.error=m;
		},
		load(reset) {
			var me = this;
			this.selected = [];
			if (me.value) {
				me.data = me.value;
			} else {
				if(reset===true)me.page=1;
				var s = me.src;
				if (!s)
					s = me.$root.apiLink(window.location.pathname);
				if (s.endsWith("/"))
					s = s.slice(0, s.length - 1);
				if (me.pagination) {
					s += '/' + (me.page - 1) * me.pagination + '/' + (me.pagination);
				}
				//console.log(s);console.log(me.filters);
				axios.get(s, {error:me.error2,params: me.filters}).then(function (r) {
					if(r.data&&r.data.error){
						MsgBox(r.data.error);
					}else{
						var d=me.value ? me.value : (r.data.data ? r.data.data : r.data);
						if(!me.data)me.data=[];
						me.data = reset===true?d:me.data?me.data.concat(d):me.data/*:d*/;
						me.size=r.data.size;
						if (r.data && r.data.size){
							me.pages = Math.ceil(r.data.size / me.pagination);
							if (me.page > me.pages)
								me.page = 1;
						}
						me.$emit('loaded',{target:me,response:r});
						//me.rowSelect(null, -10);
					}
				}).catch(me.error);
			}
		}
	}
}
</script>
<!-- <style>
	.v-dataview > .v-no-results{
		padding: 15px;
		color: rgb(255 193 7);
		background: #ffffff45;
		padding-bottom: 7px;
		padding-top: 7px;
		border-radius:10px;
		border-style:solid;
		border-width: 1px;
	}
	.v-dataview > .v-more-results{
		cursor:pointer;
		padding: 15px;
		color: #106e8a;
		background: #ffffff45;
		padding-bottom:7px;
		padding-top:7px;
		border-radius:10px;
		border-style:solid;
		border-width: 1px;
	}
</style> -->
