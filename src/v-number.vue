<template>
    <input
        type="number"
        @keyup.enter="handleInput"
        v-model.number="v"
        @input="handleInput"
        class="_"
    />
</template>

<script>
import { ref, onMounted, watch, computed, onUpdated } from 'vue';
import { _, num } from './commons';

export default {
    name: 'VNumber',
    props: {
        value: Number,
        max: Number,
        min: Number,
        delay: Number
    },
    setup(props, ctx) {
        const { emit }=ctx;
        const v = ref(null);

        onMounted(() => {
            v.value = props.value; // Initialize value on component mount
        });

        onUpdated(() => {
            v.value = ctx.attrs.modelValue;
        });

        const handleInput = (event) => {
            let inputValue = v.value;
            const decimalPlaces = event.target.getAttribute('decimal');
            
            if (inputValue !== null) {
                inputValue = num(inputValue);
                if (props.max && inputValue > num(props.max)) {
                    inputValue = num(props.max);
                }
                if (props.min && inputValue < num(props.min)) {
                    inputValue = num(props.min);
                }
                if (decimalPlaces !== null) {
                    inputValue = inputValue.toFixed(Number(decimalPlaces));
                }
            } else {
                inputValue = null;
            }

            v.value = event.target.value; // Update the value from input

            let timer = _.calendarTimer;
            if (timer) clearTimeout(timer);

            if (props.delay) {
                _.calendarTimer = setTimeout(() => {
                    emit('input', inputValue);
                    _.calendarTimer = null;
                }, event.keyCode === 13 ? 0 : props.delay);
            } else {
                emit('input', inputValue);
            }
        };
        return {
            v,
            handleInput
        };
    }
};
</script>
