<template>
<div :value="value===false?'false':value" :data-value="''+value">
    <div v-on:click="onChange(v)" 
v-bind:style="'cursor:pointer;border: 1px solid #000;text-align:center;display:inline-block;width:calc(50% - 2px)'+(v===selected?'':';opacity: 0.5')" v-bind:class="{'v-selected':v==selected}"  
            v-for="v in options">{{v}}</div></div>
</template>
<script>
    export default {
        props: {
            value: {
                value: Object
            }
        },
        data() {
            return {options: ['NO', 'SI'], selected: null}
        },
        mounted() {
            var me = this;
            var v = '' + me.value;
            me.selected = (v === 'true' ? 'SI' : (v === 'false' ? 'NO' : null));
            me.$emit('input',me.value);
        },
        updated() {
            var me = this;
            var v = '' + me.value;
            me.selected = (v === 'true' ? 'SI' : (v === 'false' ? 'NO' : null));
            me.$emit('input',me.value);
        },
        methods: {
            onChange(value) {
                var me = this;
                me.selected = value;
                this.$emit('input', value === 'SI' ? true : (value === 'NO' ? false : null));
            }
        },
    }
</script>
