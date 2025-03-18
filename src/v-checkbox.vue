<template>
    <label style="font-weight: normal !important; display: block;" class="v-checkbox" @click.stop="">
        <span v-html="getLabel"></span>
        <input ref="input" type="checkbox" :checked="isChecked" @change="change" :value="value" />
        <span class="checkmark"></span>
    </label>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';

export default defineComponent({
    name: 'VCheckbox',
    props: {
        value: null,  // Valor que representa `true`
        modelValue: null, // Valor del `v-model`
        valueFalse: null, // Valor que representa `false`
        label: String,
        readonly: Boolean,
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const input = ref(null);
        const hadValue = ref(0);

        // Computed para determinar si el checkbox debe estar seleccionado
        const isChecked = computed(() => {
            return props.value ? props.value === props.modelValue : ['true', '1', true].includes(props.modelValue);
        });

        // Se asegura de que el input refleje el estado correcto cuando cambia `modelValue`
        watch(() => props.modelValue, (newVal) => {
            if (input.value) {
                input.value.checked = isChecked.value;
            }
        });

        // Manejo del cambio del checkbox
        const change = () => {
            if (!props.readonly) {
                const checked = input.value.checked;
                const newValue = checked ? (props.value || checked) : (props.valueFalse ?? checked);
                if (newValue) hadValue.value = 1;
                emit('update:modelValue', newValue);
            }
        };

        // Asegurar que el estado inicial sea correcto cuando el componente se monta
        onMounted(() => {
            if (input.value) {
                input.value.checked = isChecked.value;
            }
        });

        return {
            input,
            hadValue,
            isChecked,
            change,
            getLabel: computed(() => props.label || (typeof props.value === 'string' ? props.value : '')),
        };
    },
});
</script>
