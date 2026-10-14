<template>
    <label
        style="
            font-weight: normal !important;
            display: block;
        "
        class="v-checkbox"
        @click="onClick"
    >
        <span v-html="getLabel()" />

        <input
            ref="input"
            type="checkbox"
            :name="group?.name"
            :readonly="!!readonly"
            :checked="checked"
            :value="value"
            @click="onClick"
            @change="change"
        />

        <span class="checkmark"></span>
    </label>
</template>

<script>
import {
    computed,
    inject,
    ref
} from 'vue'

export default {
    name: 'VCheckbox',

    props: {
        /*
         * Valor que representa este checkbox dentro
         * de un grupo:
         *
         * value="3"
         */
        value: null,
        modelValue: null,
        valueFalse: null,
        label: null,
        readonly: null
    },

    emits: [
        'update:modelValue',
        'input',
        'change'
    ],

    setup(props, { emit }) {

        const input = ref(null)

        const group = inject(
            'v-checkbox-group',
            null
        )

        const checked = computed(() => {

            /*
             * Si pertenece a un grupo, el grupo
             * determina si está seleccionado.
             */
            if (group) {
                return group.isSelected(
                    props.value
                )
            }

            /*
             * Standalone Vue 3
             */
            if (props.modelValue !== undefined) {

                if (props.value !== null &&
                    props.value !== undefined) {

                    return (
                        props.modelValue == props.value
                    )
                }

                return !!props.modelValue
            }

            /*
             * Compatibilidad antigua vmodel
             */
            if (props.value) {
                return (
                    props.value == props.vmodel
                )
            }

            return (
                String(props.vmodel) === 'true'
            )
        })

        const change = event => {

            if (props.readonly) {
                return
            }

            const isChecked =
                event.target.checked

            /*
             * Este sustituye exactamente al viejo:
             *
             * this.$parent.onChange(...)
             */
            if (group) {

                group.onChange(
                    props.value,
                    isChecked
                )
            }

            let result

            if (isChecked) {

                result =
                    props.value !== null &&
                    props.value !== undefined
                        ? props.value
                        : true

            } else {

                result =
                    props.valueFalse !== null &&
                    props.valueFalse !== undefined
                        ? props.valueFalse
                        : false
            }
            emit(
                'update:modelValue',
                result
            )
            emit(
                'change',
                result
            )
        }

        const getLabel = () => {

            if (props.label) {
                return props.label
            }

            return (
                props.value &&
                typeof props.value === 'string'
            )
                ? props.value
                : ''
        }

        const onClick = event => {

            if (props.readonly) {
                event.preventDefault()
                return false
            }
        }

        return {
            input,
            group,
            checked,
            change,
            getLabel,
            onClick
        }
    }
}
</script>