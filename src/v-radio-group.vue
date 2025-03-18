<script setup>
import { h, getCurrentInstance, onMounted, onUpdated, watch, ref } from 'vue';
import VRadio from './v-radio.vue';
import { removeError } from './index';

const props = defineProps({
    required: String,
    name: String,
    modelValue: String,
    items: {
        type: Array,
        //required: true
    },
    type: {
        type: String,
        default: 'radio'  // Default to 'radio', can be set to 'checkbox'
    },
    label: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

const { proxy } = getCurrentInstance();

const processedElements = new Set();

const getInputs = (el, l) => {
    if (el.children) {
        Array.from(el.children).forEach(e => {
            if (e.tagName === 'INPUT') {
                l.push(e);
            } else if (!e.classList || !e.classList.contains('v-group')) {
                getInputs(e, l);
            }
        });
    }
    return l;
};

const generateUniqueName = () => {
    return 'input_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};

const updateInputs = () => {
    const rl = getInputs(proxy.$el, []);
    let name = props.name;
    if (!name) {
        name = generateUniqueName();
    }
    const required = proxy.$props.required === '' || proxy.$props.required;
    let groupChecked = false;
    for (let i = 0; i < rl.length; i++) {
        rl[i].name = name;
        if (!processedElements.has(rl[i])) {
            rl[i].addEventListener('change', onChange);
            processedElements.add(rl[i]);
        }
        rl[i].checked = rl[i].value === value.value;
        if (rl[i].checked) groupChecked = true;
        rl[i].required = required;
        if (required) {
            if (value.value) rl[i].nextElementSibling.classList.remove('required');
            else rl[i].nextElementSibling.classList.add('required');
        }
    }
    if (groupChecked) {
        //console.log(rl[0].parentNode.parentNode);
        removeError(rl[0].parentNode.parentNode)
    }
};

const onChange = (event) => {
    let newValue = event.target.value;
    if (newValue === '') {
        newValue = null;
    }
    value.value = newValue;
    emit('update:modelValue', newValue);
};

watch(() => props.modelValue, (newVal) => {
    value.value = newVal;
    updateInputs();
});

onMounted(() => {
    updateInputs();
});

onUpdated(() => {
    updateInputs();
});

const render = () => {
    const children = [];

    if (proxy.$slots.default) {
        children.push(...proxy.$slots.default());
    }

    if (props.items) {
        children.push(...props.items.map(item => {
            return h(VRadio, {
                className: props.required && !props.modelValue ? 'required' : null,
                ...item,
                modelValue: value.value,
                'onUpdate:modelValue': onChange
            });
        }));
    }
    return h('div', {class:'v-radio-group'}, [
        props.label && h('label', props.label),
        ...children
    ]);
};

</script>
<template>
    <render />
</template>