<template>
    <div>
        <input
            ref="input"
            :required="required"
            :readonly="readonly"
            :min="min"
            :max="max"
            :type="type || 'date'"
            @change="enterD"
        />
    </div>
</template>

<script>
import {
    ref,
    watch,
    nextTick,
    onMounted
} from 'vue'

import { pad } from './commons'

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

        const input = ref(null)


        const _emit = (value) => {

            emit(
                'update:modelValue',
                value
            )

            nextTick(() => {
                emit(
                    'changed',
                    value
                )
            })
        }


        const toDate = (v) => {

            if (!v) {
                return v
            }


            if (props.type === 'time') {

                const d = v.split(':')

                return new Date(
                    1981,
                    1,
                    6,
                    parseInt(d[0]),
                    parseInt(d[1]),
                    d.length > 2
                        ? parseInt(d[2])
                        : 0
                )
            }


            if (!isNaN(v)) {
                return new Date(
                    Number(v)
                )
            }


            if (props.type === 'datetime-local') {

                let t = v.split('T')

                const d = t[1].split(':')

                t = t[0].split('-')

                return new Date(
                    parseInt(t[0]),
                    parseInt(t[1]) - 1,
                    parseInt(t[2]),
                    parseInt(d[0]),
                    parseInt(d[1]),
                    d.length > 2
                        ? parseInt(d[2])
                        : 0
                )
            }


            const t = v.split('-')

            const y = parseInt(t[0])


            if (y < 100) {
                return v
            }


            return new Date(
                y,
                parseInt(t[1]) - 1,
                parseInt(t[2])
            )
        }


        const changeDate = (modelValue) => {

            if (!input.value) {
                return
            }


            const d = toDate(modelValue)

            let fd = ''


            if (d) {

                if (typeof d === 'string') {

                    fd = d

                } else if (props.type === 'time') {

                    fd =
                        pad(d.getHours(), 2) +
                        ':' +
                        pad(d.getMinutes(), 2)

                } else if (
                    props.type === 'datetime-local'
                ) {

                    fd =
                        pad(d.getFullYear(), 4) +
                        '-' +
                        pad(d.getMonth() + 1, 2) +
                        '-' +
                        pad(d.getDate(), 2) +
                        'T' +
                        pad(d.getHours(), 2) +
                        ':' +
                        pad(d.getMinutes(), 2)

                } else {

                    fd =
                        pad(d.getFullYear(), 4) +
                        '-' +
                        pad(d.getMonth() + 1, 2) +
                        '-' +
                        pad(d.getDate(), 2)
                }
            }


            input.value.value = fd
        }


        const enterD = (event) => {

            const value = event.target.value

            let t = toDate(value)


            if (props.max) {

                if (
                    t &&
                    t.getTime() >=
                    toDate(props.max).getTime()
                ) {

                    emit('invalid', {
                        target: input.value,
                        value: t
                    })

                    event.target.value = ''

                    return
                }
            }


            if (props.min) {

                if (
                    t &&
                    t.getTime() <=
                    toDate(props.min).getTime()
                ) {

                    emit('invalid', {
                        target: input.value,
                        value: t
                    })

                    event.target.value = ''

                    return
                }
            }


            if (props.type === 'time') {

                _emit(
                    pad(t.getHours(), 2) +
                    ':' +
                    pad(t.getMinutes(), 2) +
                    ':00'
                )

            } else if (
                t &&
                typeof t.getTime === 'function'
            ) {

                _emit(
                    t.getTime()
                )
            }
        }


        watch(
            () => props.modelValue,
            (newValue) => {
                changeDate(newValue)
            }
        )


        onMounted(() => {
            changeDate(
                props.modelValue
            )
        })


        return {
            enterD,
            input
        }
    }
}
</script>