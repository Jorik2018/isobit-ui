<template>
    <div ref="el" v-show="ready && true" class="ol-unselectable ol-control">
        <slot></slot>
        <button v-if="!slotUsed" class="v-map-control-button" @click.prevent="enter">
            <i v-if="icon" class="fa fa-xs" :class="icon"></i>
        </button>
    </div>
</template>
<script>
import Control from 'ol/control/Control';
import { inject, ref } from "vue";
export default {
    name: 'VMapControl',
    setup(props, { emit }) {
        //console.log(props);
        const { visible } = props;
        const el = ref(null);
        const visible0 = ref(!!visible);
        const collector = inject('collector');
        const ready = ref(null);
        //me.slotUsed=!!this.$slots.default;
        const addControl = (map) => {
            map.addControl(new Control({ element: el.value }));
            ready.value = true;
        }
        collector.push(addControl);
        const timeout = ref();
        const enter = (e) => {
            e.stopPropagation()
            if (!timeout.value) {
                emit('click', e);
            }else{
                clearTimeout(timeout.value)
            }
            timeout.value = setTimeout(() => {
                timeout.value = null;
            }, 500)
        }
        return { el, ready, visible0, enter }
    },
    props: {
        icon: String,
        visible: {
            default: 1
        },
    },
    computed: {
        slotPassed() {
            return !!this.$slots.default;
        }
    },
    data() { return { slotUsed: false } },
    updated() {
        var l = this.$el.querySelectorAll(":scope > :not(.v-map-control-button)").length;
        if (l == 0) l = this.$el.textContent.trim().length;
        this.slotUsed = l;
        //console.log(this.$slots);
    },
    methods: {
        toggle() {
            this.visible0 = !!!this.visible0;
        }
    }
};
</script>
