<template>
<div v-bind:value="toDate(value)" >
    <input :required="required" :readonly="readonly" :min="min" :max="max"
     v-on:change="enterD" v-bind:type="type?type:'date'"/></div>
</template>
<script>
    export default {
        props: {
            value: {
                value: String
            },
            type: String,
            required:String,
            readonly:String,
            max:String,
            min:String
        },
        data() {
            return {
                value2: null
            }
        },
        template: '<div v-bind:value="toDate(value)" ><input v-bind:required="required" style2="width:calc(100% - 0px)" v-on:change="enterD" v-bind:type="type?type:\'date\'"/></div>',
        methods: {
            enterD() {
                var v = event.target.value;
                var me = this;
                var t = me.toDate(v);
                if (me.$props.type === 'time') {
                    this.$emit('input', me.pad(t.getHours(), 2) + ':' + me.pad(t.getMinutes(), 2) + ':00');
                } else {
                    //solo se sobreescribira la fecha si es fecha valida
                    if(t.getTime){
                        this.$emit('input', t.getTime());
                    }
                }
            },
            pad(num, size) {
                var s = num + "";
                while (s.length < size)
                    s = "0" + s;
                return s;
            },
            toDate(v) {
            
                if (v) { var me = this,d;
                    if (me.$props.type === 'time') {
                        d = v.split(':');
                        return new Date(1981, 1, 6, parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                    } else {
                        if (!isNaN(v)) {
                            return new Date(v);
                        }
                        var t;
                        if (me.$props.type === 'datetime-local') {
                            t = v.split('T');
                            d = t[1].split(':');
                            t = t[0].split('-');
                            t = new Date(parseInt(t[0]), parseInt(t[1]) - 1, parseInt(t[2]), parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                            return t;
                        } else {
                            t = v.split('-');
                            var y=parseInt(t[0]);
                            if(y<100){
                                return v;
                            }
                            t = new Date(y, parseInt(t[1]) - 1, parseInt(t[2]));
                            return t;
                        }
                    }
                }
                return v;
            },
            changeDate(){
                var me = this;
                //console.log(me.value);
                var d = me.toDate(me.value);
                //console.log(d);
                var fd;
                if (d) {
                    if (me.$props.type === 'time') {
                        fd = me.pad(d.getHours(), 2) + ":" + me.pad(d.getMinutes(), 2);
                    } else if (me.$props.type === 'datetime-local') {
                        fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2) + 'T' + me.pad(d.getHours(), 2) + ":" + me.pad((d.getMinutes()), 2);
                    } else {
                        fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2)
                    }
                }
                this.$el.children[0].value = fd;
            }
        },
        updated() {
            this.changeDate();
        },
        mounted() {
            this.changeDate();
        }
    }
</script>
