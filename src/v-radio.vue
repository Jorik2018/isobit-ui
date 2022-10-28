<template>
<label class="v-radio" style="font-weight: normal !important;display:block" > {{label?label:value}}
    <input type="radio" v-bind:value="value" /><span class="checkmark"></span><slot></slot></label>
</template>
<script>
    export default {
        props: {
            value: String,
            label: String
        },
        mounted() {
            var me = this;
            var r = me.$el.querySelector('input');
            if(me.$parent&&me.$parent.nam)
                r.name = me.$parent.nam;
            if (me.$parent.required)
                r.required = me.$parent.required;
            r.onclick = function () {
                me.$parent.onChange(me.value);
                //this.$parent.$emit('input', value);
            }
        }
    }
</script>
