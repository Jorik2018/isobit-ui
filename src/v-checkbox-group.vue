<template>
    <div>
        <slot />
    </div>
</template>

<script>
import {
    provide,
    computed
} from 'vue'

import { id } from './commons'

export default {
    name: 'VCheckboxGroup',

    props: {
        modelValue: {
            type: [Array, String],
            default: undefined
        },
        required: String,
        name: String
    },

    emits: [
        'update:modelValue'
    ],

    setup(props, { emit }) {

        const nam =
            props.name ||
            'input_' + id()

        const normalize = value => {

            if (Array.isArray(value)) {
                return [...value]
            }

            if (
                typeof value === 'string' ||
                value instanceof String
            ) {
                return value
                    ? value.split('|')
                    : []
            }

            return []
        }

        const currentValue = computed(() => {

            if (props.modelValue !== undefined) {
                return normalize(props.modelValue)
            }

            return normalize(props.value)
        })

        const isSelected = value => {
            return currentValue.value.some(
                item => item == value
            )
        }

        const onChange = (value, checked) => {

            const values = [
                ...currentValue.value
            ]

            if (checked) {

                const exists = values.some(
                    item => item == value
                )

                if (!exists) {
                    values.push(value)
                }

            } else {

                const index = values.findIndex(
                    item => item == value
                )

                if (index !== -1) {
                    values.splice(index, 1)
                }
            }
            emit(
                'update:modelValue',
                values
            )
        }

        provide(
            'v-checkbox-group',
            {
                name: nam,
                isSelected,
                onChange
            }
        )
        return {
            nam,
            onChange,
            isSelected
        }
    }
}
</script>