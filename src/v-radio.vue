<template>
<label :class="getClass()" > {{label?label:value}}
    <input type="radio" v-bind:value="value" />
    <span class="checkmark"></span><slot></slot></label>
</template>
<script>
    export default {
        name: 'VRadio',
        props: {
            value: String,
            label: String,
            className:String,
        },
        methods:{
            getClass(){
                return 'v-radio '+this.className;
            }
        },
        mounted() {
            var me = this;
            var r = me.$el.querySelector('input');
            if(me.$parent&&me.$parent.nam)
                r.name = me.$parent.nam;
            
            //r.required = me.$parent.required===''||me.$parent.required;
                //if(me.$parent)console.log(me.$parent)
            r.onclick = function () {
               // me.$parent.onChange(me.value);
                //this.$parent.$emit('input', value);
            }
        },
        updated() {
            var me = this;
            var r = me.$el.querySelector('input');
            //if(me.$parent)console.log(me.$parent)
        }
    }
</script>
