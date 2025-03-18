<template>
    <div>
        <input :required="required" ref="input" :readonly="readonly" :min="min" :max="max" @change="enterD"
            :type="type ? type : 'date'" />
    </div>
</template>
<script>
import { ref, watch,nextTick } from 'vue';
import { pad } from "./commons";
export default {
    name: 'VCalendar',
    props: {
        modelValue: null,
        type: String,
        required: String,
        readonly: String,
        max: String,
        min: String
    },
    setup(props, { emit }) {
        const { type, modelValue, max, min } = props;
        const input = ref(null);
        const _emit = (o) => {
            emit('update:modelValue', o);
            nextTick(()=>{
                emit('changed', o);
            })
        }
        const enterD = (event) => {
            let v = event.target.value;
            let t = toDate(v);
            if (max) {
                if (t && t.getTime() >= toDate(max).getTime()) {
                    emit('invalid', { target: me, value: t });
                    t = null;
                    event.target.value = t;
                    //this.$emit('input', t);
                    return;
                }
            }
            if (min) {
                if (t && t.getTime() <= toDate(min).getTime()) {
                    emit('invalid', { target: me, value: t });
                    t = null;
                    event.target.value = t;
                    //this.$emit('input', t);
                    return;
                }
            }
            if (type === 'time') {
                _emit(pad(t.getHours(), 2) + ':' + pad(t.getMinutes(), 2) + ':00');
            } else {
                //solo se sobreescribira la fecha si es fecha valida
                if (t.getTime) {
                    _emit(t.getTime());
                }
            }
        }
        const toDate = (v) => {
            if (v) {
               
                let d;
                if (type === 'time') {
                    d = v.split(':');
                    return new Date(1981, 1, 6, parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                } else {
                    if (!isNaN(v)) {
                        return new Date(v);
                    }
                    let t;
                    if (type === 'datetime-local') {
                        t = v.split('T');
                        d = t[1].split(':');
                        t = t[0].split('-');
                        t = new Date(parseInt(t[0]), parseInt(t[1]) - 1, parseInt(t[2]), parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                        return t;
                    } else {
                        t = v.split('-');
                        let y = parseInt(t[0]);
                        if (y < 100) {
                            return v;
                        }
                        t = new Date(y, parseInt(t[1]) - 1, parseInt(t[2]));
                        return t;
                    }
                }
            }
            return v;
        }
        watch(() => props.modelValue, (newValue) => {
            changeDate(newValue)
        });
        const changeDate = (modelValue) => {
            if (!input.value) return;
            let d = toDate(modelValue);
            let fd;
            if (d) {
                if (type === 'time') {
                    fd = pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2);
                } else if (type === 'datetime-local') {
                    fd = pad(d.getFullYear(), 4) + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2) + 'T' + pad(d.getHours(), 2) + ":" + pad((d.getMinutes()), 2);
                } else {
                    fd = pad(d.getFullYear(), 4) + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2)
                }
            }
            input.value.value = fd;
        }
        return { enterD, input }
    }
}
</script>
