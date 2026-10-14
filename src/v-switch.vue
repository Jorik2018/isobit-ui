<template>
    <div
        class="v-switch"
        :data-value="String(modelValue)"
    >
        <div
            v-for="v in options"
            :key="v"
            @click="onChange(v)"
            :class="{ 'v-selected': v === selected }"
        >
            {{ v }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'VSwitch',

    props: {
        modelValue: {
            type: Boolean,
            default: null
        }
    },

    emits: ['update:modelValue'],

    data() {
        return {
            options: ['NO', 'SI']
        };
    },

    computed: {
        selected() {
            if (this.modelValue === true) {
                return 'SI';
            }

            if (this.modelValue === false) {
                return 'NO';
            }

            return null;
        }
    },

    methods: {
        onChange(value) {
            this.$emit(
                'update:modelValue',
                value === 'SI'
                    ? true
                    : value === 'NO'
                        ? false
                        : null
            );
        }
    }
};
</script>

<style>
.v-switch {
    border: 1px solid rgb(252, 252, 252);
    display: flex;
    flex-direction: row;
}

.v-switch > div {
    padding: 6px;
    flex: 1;
    border: 1px solid gray;
    cursor: pointer;
    text-align: center;
    opacity: 0.5;
}

.v-switch > div.v-selected {
    opacity: 1;
    color: black;
}
</style>