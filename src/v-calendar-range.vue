<template>
    <div>
        <VButton icon="fa-calendar" @click="open" style="width: -webkit-fill-available;padding: 12px;" :class="from||to?'marked':''" />
        <div v-if="show" ref="elRef" style="position: relative;z-index: 1000;padding: 20px;max-width: 240px;"
            class=" v-dialog v-msgbox">

            <label>Desde:</label>
            <v-calendar v-model="from" />
            <label>Hasta:</label>
            <v-calendar v-model="to" />
            <div style="display: flex;
;
    align-items: center;
    justify-content: center;
    margin-top: 20px;">
                <v-button icon="fa-eraser" value="Limpiar" @click="click()"></v-button>
                <v-button icon="fa-filter" value="Aplicar" @click="click(true)"></v-button>
            </div>
        </div>
    </div>
</template>
<script>
import { ref, watch, nextTick } from 'vue';
import { mask, unmask, date } from "./commons";
export default {
    name: 'VCalendarRange',
    props: {
        modelValue: null,
        type: String,
        required: String,
        readonly: String,
        max: String,
        min: String
    },
    setup({ modelValue }, { emit }) {
        const show = ref();
        const from = ref();
        const to = ref();
        const elRef = ref();
        const maskRef = ref();
        const open = () => {
            show.value = true;
            nextTick(() => {
                maskRef.value = mask(elRef.value)
            })
        }
        const click = (state) => {
            if (!state) {
                from.value = ''
                to.value = ''
            }
            const value = (date(from.value, 'date-') || '') + '|' + (date(to.value, 'date-') || '')
            emit('update:modelValue', value == '|' ? null : value);
            unmask(maskRef.value)
        }
        return { show, open, elRef, from, to, click,modelValue }
    }

}
</script>
