<template>
	<div class="v-autocomplete" v-on:focusout2="focusout" :value="value" v-bind:disabled="disabled" >
		<div class="v-selection"  v-bind:style="{whiteSpace: nowrap?'nowrap':''}" v-if="selected&&showSelection">
			<slot name="label" v-bind:selected="selected"></slot>
			{{!hasSlot('label')?getLabel(selected):'&nbsp;'}}&nbsp;
			<span v-if="!readonly" v-on:click="remove" style="top:0px;margin:2px 4px;right: 0px;position: absolute;cursor:pointer;"><i class="fa fa-times"></i></span>
		</div>
		<span v-if="!selected" v-on:click="search" style="color:gray;top:4px;right:6px;position: absolute;cursor:pointer;">
			<i class="fa fa-xs fa-sync"></i>
		</span>
		<input v-if="!selected" v-on:keyup="keyup" v-on:keyup.enter.stop.prevent="search" 
			v-bind:class="inputClass"  v-on:focus="show=true" v-bind:disabled="disabled" v-bind:placeholder="placeholder" v-model="query">
		<button class="hide" onclick="return false"/>
		<transition name="fade">
			<div v-show="show&&!selected" class="v-resultpane" v-bind:style="{zIndex:2,width: 'calc(100% - 2px)',position: (floating?'absolute':'relative')}" 
				style="z-index:2,width: calc(100% - 2px);max-height: 300px;overflow-y: auto;border: 1px solid #0f62ac" >
				<div class="v-list">
					<div v-for="(d,i) in data2" v-bind:class="{'v-selected':selected==d,'v-focused':focused==i}"  v-on:click="setSelected(d)">
					<slot v-bind:row="d"></slot>
					</div>
					<div v-if="data0&&data0.length<total" class="center" v-on:click="search(1)">Cargar {{total-data0.length}} resultados mas...</div>
				</div>
				<div v-if="data2&&data2.length<1" class="center yellow" style="padding:5px">No existen resultados.</div>
			</div>
		</transition>
	</div>
</template>
<script>
export default {
props: {
	value: {
            value: Object
        },
        data: {
            type: Array,
            default: null
        },
        placeholder: String,
        label: String,
        default: Object,
        store:null,
        params:null,
        autoload:null,
        floating:{
            default: true
        },
        src: String,
        readonly: Boolean,
        nowrap:null,
        disabled: Boolean,
        showSelection: {
            type: Boolean,
            default: true
        },
        pagination:{default:10}
    },
    data(){
        return {page:0,selected: null,focused:-1, query: null, data0: null, show: false, total: 0, inputClass: ''}
    },
    updated(){
        var me = this;
        me.selected = me.value;
        if(me.data)me.data0 = me.data;
    },
    watch:{
        show(v){
            if(v)this.$emit('contextmenu',this);
        }
    },
    computed: {
        data2() {
            var me=this;
            this.focused=-1;
            var q=me.query?me.query.trim().toLowerCase().split(/[ ,]+/):null;
            return me.data0&&me.query?me.data0.filter((el)=>{
                var v=JSON.stringify(el).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                for(var j=0;j<q.length;j++){
                    if(v.indexOf(q[j]) == -1)return false;
                }
                return true;
            }):me.data0;
        }
    },
    mounted(){
        var me=this;
        me.inputClass = me.$attrs.inputclass;
        if(me.autoload)me.search();
        document.addEventListener("click", me.clickout);   
        if(!me.$root.online){
            me.loadStore();
        }
    },
    beforeDestroy(){
        document.removeEventListener("click", this.clickout); 
    },
    methods: {
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
            var me=this,store=me.store;
            if(store!=null){
                var datj;
				if(window._.db)datj=await me.getStoredList(store);
				if(!datj)datj=[];
                me.data0 = me.data0?datj.concat(me.data0):datj;
                return me.data0;
                //
                //console.log(me.data);
                //me.rowSelect(null, -10);
            }
        },
        keyup(){
            if(event.keyCode==40){
                if(this.focused<this.data.length)
               this.focused++; 
            }else if(event.keyCode==38){
               if(this.focused>0)
               this.focused--; 
            }else if(event.keyCode==13){
                if(this.focused>-1){
                    this.setSelected(this.data[this.focused]);
                }
            }
        },
        remove(){
            this.$emit('input',null);
        },
        clickout(){
            var t=event.target;
            event.stopPropagation();
            do{
                if(t==this.$el){
                    return false;
                }
            }while((t=t.parentNode));
            this.show=false;
        },
        focusout(){
            if(event.target.nodeName!='INPUT'){
            this.show=false;
            }
        },
        hasSlot (name = 'default') {
            return !!this.$slots[ name ] || !!this.$scopedSlots[ name ];
        },
        clear(){
            var me=this;
            me.selected=null;
            me.query='';
            me.data0=null;
        },
        focus(a){
            this.$el.querySelector('input').focus(a);
        },
        setSelected(v, h) {
            this.show = h;
            this.selected = v;
            this.$emit('input', v)
        },
        getLabel(i) {
            if(this.label){
                var vf = this.label.split('.');
                for (var j = 0; j < vf.length; j++) {
                    if (i)
                        i = i[vf[j]];
                }
            }
            return i;
        },
        search(e) {
            var me = this,pagination=Number(me.pagination);
            if(e===1){
                me.page+=pagination;
            }else{
                me.page=0;
                if(me.data&&me.autoload)return;
            }
            var params={query: me.query};
            if(me.params)params=Vue.mergeDeep(params,me.params);
            axios.get((me.src?me.src:me.source) + (pagination>0?'/'+me.page+'/'+pagination:''), {params: params})
                    .then((r)=>{
                var d=r.data;
                if(!d.error){
                    if(e===1){
                        me.data0=me.data0.concat(d.data ? d.data : d);
                    }else{
                        me.data0 = d.data ? d.data : d;
                    }
                    console.log(me.data0);
                    me.total = d.size;

                    if(!me.autoload)me.show = true;
                    console.log('=========================');
                    //me.$emit('complete',{data:me.data,query:me.query,target:me});
                }else{
                    MsgBox(d.error);
                }
            }).catch(me.error).then(()=>{
                me.$emit('complete',{data:me.data0,query:me.query,target:me});
            });
        }
    }
};
</script>

