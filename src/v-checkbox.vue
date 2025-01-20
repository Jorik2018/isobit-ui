<template>
	<label style="font-weight: normal !important;display:block" class="v-checkbox"><span v-html="getLabel()"></span>
		<input type="checkbox" v-bind:checked="value&&vmodel==value||vmodel" v-on:change="change" v-bind:value="value" /> 
		<span class="checkmark"></span>
	</label>
</template>
<script>
export default {
    name: 'VCheckbox',
    model: {
        prop: 'vmodel',
        event2: 'change'
    },
    props: {
        value:null,
        vmodel:null,
        valueFalse:null,
        label:null,
        readonly:null
    },
    data(){return {input:null,hadValue:0};},
    mounted() {
        var me = this;
        /*if(me.$parent.$el.classList.contains('v-datatable')){
            if(me.$options.propsData.readonly+''== 'undefined'){
                me.readonly=true;
                console.log(me.$el.parentNode.tagName);
            }
        }*/
        var c=me.$el.querySelector('input');
		if(me.$parent&&me.$parent.nam)
			c.name = me.$parent.nam;
        me.input = c;
        if(!me.$parent.onChange)c.checked=me.value&&me.value==me.vmodel||(''+me.vmodel)==='true'||(''+me.vmodel)==='1';
        me.$parent.$emit("mounted",me);
        if(me.$parent.update2)
        me.$parent.update2();
    },
    updated(){
        var me=this,c=me.input;
        c.checked=me.value&&me.value==me.vmodel||(''+me.vmodel)==='true'||(''+me.vmodel)==='1';
    },
    methods:{
        change(){
            var me=this;
            if(!me.readonly){
                var r = me.$el.querySelector('input');
                if(me.$parent.onChange)me.$parent.onChange(me.value, r.checked);
                var v=r.checked?(me.value?me.value:r.checked):((me.valueFalse!==null&&me.valueFalse!==undefined)?me.valueFalse:r.checked);
                if(v)me.hadValue=1;
                //if(!v&&me.hadValue){
                  //  v=(me.valueFalse!==null&&me.valueFalse!==undefined);
                //}
                console.log('nv='+v);
                me.$emit('input', v);
            }
        },
        getLabel(){
            var v=this.value;
            if(this.label)return this.label;
            return (v&&(typeof v)=='string'?v:'');
        },
        onClick(e){if (this.readonly)e.preventDefault();return false;}
    }
};
</script>

