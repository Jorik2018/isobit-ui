<template>
	<div class="v-select" style="position:relative" >

		<select v-if="!readonly" v-show="!multiple" style="width:100%" @change="onChange($event.target.value)" 
			v-bind:required="required" v-bind:disabled="disabled" >
			<slot></slot>
		</select>
		<template v-if="multiple">
		<div class="v-widget-header" style="padding-top: 3px;padding-bottom: 3px;" v-bind:class="{'v-selected': show}" v-on:click="toggle">&nbsp;</div>
		<div v-show="show" style="padding:5px;border: 1px solid lightgray;">
		<div class="_ ui-widget ui-state-default ui-corner-all" style="padding: 5px 5px 1px 5px;margin-bottom: 5px;"><v-checkbox v-model="sela" v-on:input="selectAll"/></div><v-checkbox-group v-bind:key="'p'+ik" v-model="sel" v-on:input="checkboxInput">
		<template v-if="data.length" >
		<div  v-for="d in data"><v-checkbox  v-bind:value="d.value" v-bind:label="d.label"/></div>
		</template></v-checkbox-group></div>
		</template>
		<template v-if="readonly">{{label?label:'---'}}</template>
	</div>
</template>
<script>
export default {
    props: {
        required:null,
        readonly:null,
        multiple:null,
        label:null,
        disabled:null,
        autoload:null
    },
    data(){return {autoload_:true,ik:0,lastLoad:null,data:[],popup:null,show:false,sel:[],sela:null}},
    created(){
        var me = this;
        me.autoload_=!((me.autoload+'')=='false'||(me.autoload*1)==0);
    },
    mounted(){
        this.lll();
		this.uu();
    },
    watch:{ 
        //value: function(newVal/*, oldVal*/) {console.log('newv='+newVal)},
        disabled(newVal) {
            var ll=this.lastLoad,me=this;
            if(!newVal&&ll){
                this.$el.disabled=false;
                setTimeout(function(){
                    me.load(ll[0],ll[1]);
                }, 50);
            }
        },
        readonly(newVal){
            var ll=this.lastLoad,me=this;
            if(!newVal&&ll){
                this.$el.disabled=false;
                setTimeout(function(){
                    me.load(ll[0],ll[1]);
                }, 50);
            }
        },
        show(s){
            if(s){
                var cn=this.$el.childNodes[1];
                if(!this.popup){
                    this.popup=this.$el.childNodes[2];
                    this.popup.style.position='absolute';
                    this.popup.style.backgroundColor='white';
                    document.body.append(this.popup);
                }
                var rect = cn.getBoundingClientRect();
                this.popup.style.top=(rect.bottom+0)+'px';
                this.popup.style.left=(rect.left+0)+'px';
            }else{
                if(this.$parent.load)this.$parent.load();
            }
        }
    },
    updated() {
       this.uu();
    },
    methods: {
		uu(){
			var me = this;
			var v = me.$attrs.value; 
            //console.log(typeof v);
            if(v!=null&&v.target)v=v.value;
            //console.log(v);
			//console.log('updated.'+me.$el.id+'='+JSON.stringify(v));
			var select= me.$el.childNodes[0];
			var old=select.selectedIndex;
			//Si el valor es vacio se debe escoger 0
			if (!v || v === '') {
				select.selectedIndex = 0;
			}
			for(var k=0;k<select.length;k++){
				if(select[k].value==v){
					select.selectedIndex = k;
				}
			}
			//Se busca en cada options
			for(var j=0;j<me.$children.length;j++){
				if(!me.$children[j].getValueByIndex)continue;
				var oldv=me.$children[j].getValueByIndex(old-1);
				//se recupera el anterior valor para si detectar si el valor cambio
				me.$children[j].getIndexByValue(v,function(ii,found){
					if (ii > -1){
						select.selectedIndex = ii + 1;
                        var ffound=me.$children[j].getValueByIndex(select.selectedIndex - 1);
                        if(ffound==-1){ffound=null;}else{
                            ffound=me.$children[j].filterList[select.selectedIndex - 1];
					
				}
						/*if(me.$el.id){
						for(k=0;k<select.length;k++){
							console.log(k+'--'+select[k].value);
						}
						console.log('select.length.'+me.$el.id+'='+select.length);
						console.log('select.selectedIndex .'+me.$el.id+'='+select.selectedIndex);
						}*/
						var a=Number(oldv);
						if(!isNaN(a)){
							a=a==Number(v);
						}else if(oldv){
							if(!v){
								a=false;
							}else if(v.id){
								a=v.id==oldv.id;
							}else
								a=v==oldv;
						}else{
							a=!v;
						}
						if(!a){
							if(me.$el.id){
                                console.log('emit input .'+me.$el.id+'='+JSON.stringify(v));
                                console.log('ffound=',ffound);
                            }
							me.$emit('input',v,found);
						}
					}
				});
			};
		},
        lll(){
            var me = this;
            me.autoload_=!((me.autoload+'')=='false'||(me.autoload*1)==0);
            var v = me.$attrs.value;
            
            if(v!=null&&v.target)v=v.value;
            //console.log(v);
            var select = me.$el.childNodes[0];
            if (!v || v === '') {
                select.selectedIndex = 0;
            }
			var v = me.$attrs.value; 
            for(var k=0;k<select.length;k++){
                if(select[k].value==v){
                    select.selectedIndex = k;
                }
            }
            if(this.autoload_)this.load();
            me.$emit('mounted',me);
            me.$on('changed', function (m) {
                var op=m.querySelectorAll('option'),d=[];
                for(var j=0;op.length>j;j++){
                    d.push({value:op[j].value,label:op[j].textContent});
                }
                me.data=d;
                //console.log(d);
            });
        },
        load(a,b){
            var me=this;
            for(var i=0;i<me.$children.length;i++){
                if(me.$children[i].load)
                    me.$children[i].load(a,b);
            }
            if(!me.disabled&&!me.readonly){
                //console.log(this.$el.name+' loading with value='+me.$attrs.value);
				
                me.lastLoad=null;
            }else{
//                console.log(this.$el.name+' is disabled');
                me.lastLoad=[a,b];
            }
        },
        toggle(){
            this.show=!this.show;
        },
        selectAll(){
            var ee=[];
            for(var j=0;j<this.data.length;j++){
                ee.push(this.data[j].value);
            }
            this.sel=ee;
            //console.log(this.sel);
			this.ik++;
        },
        checkboxInput(){
            var d=this.sel;
            if(d&&d.length)
                d=d.join(',');
            this.$emit('input',d);
        },
        onChange(value) {
			var me = this;
            //console.log(me.$el.id+'.onchange='+JSON.stringify(value));
			//console.log(me.$el.id+'.onchange='+JSON.stringify(value));
            var select=this.$el.childNodes[0];
            if (!value || value === '') {
                value = null;
                select.selectedIndex = 0;
            }
            var found = 0,oo;
            for(var i=0;i<me.$children.length;i++){
                found=me.$children[i].getValueByIndex(select.selectedIndex - 1);
                if(found==-1){found=0;}else{
					oo=me.$children[i].filterList[select.selectedIndex - 1];
					break;
				}
            }
            if(found){
                value=found;
            }else if(me.$children.length){
                select.selectedIndex = 0;
            }
            me.$emit('input',value,{value:value,select:select,option:select[select.selectedIndex],target:me,object:oo});
        }
    },
};
</script>