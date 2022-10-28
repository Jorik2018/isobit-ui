<template>
	<input type="number" v-on:keyup.enter="input" vmodel.number="v" v-on:input="input" class="_"/>
</template>
<script>
export default {
	props: {
        delay:null
    },
    /*watch:{
        value(v){
			var me=this;
            me.$el.value=v;
            me.$emit('input', v);
        }
    },*/
    data(){return {v:null};},
    created(){
        this.v=this.value;
    },
    methods:{
        input(){
            var me = this,t=me.$el,v=me.v,n=Vue.n;
            if(v){
                v=n(v);
                if (me.max&&v > n(me.max)) {
                    v = n(me.max);
                }
                if (me.min&&v < n(me.min)) {
                    v = n(me.min);
                }
                var de=t.getAttribute('decimal');
                if(de!==null){
                    v=v.toFixed(1*de);
                }
                //Debe evitarse borrarse el valor por edicion y mostrar un mensaje de error
            }else{
                v=null;
            }
            v = event.target.value;
			var ti=Vue.calendarTimer;
            if(ti)clearTimeout(ti);
            if(me.delay)
                Vue.calendarTimer = setTimeout(function() {
                    me.$emit('input',v);
                    Vue.calendarTimer=null;
                }, event.keyCode===13?0:me.delay);
            else
                me.$emit('input',v);
        }
    }

}
</script>
