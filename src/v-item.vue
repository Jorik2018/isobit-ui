<template>
    <li @click="click" :style="style">
        <i class="fa" :class="icon"></i>{{ label }}
        <slot name="label"></slot>
    </li>
    <ul>
        <slot></slot>
    </ul>
</template>
<script>
import { useAppStore } from './useAppStore';
export default {
    name: 'VItem',
    setup({ href }, { emit }) {
        const click = () => {
            if (href) 
            useAppStore().router.push({ path: href })
            else emit('click')
        }
        return { click }
    },
    props: {
        icon: String,
        style: Object,
        label: String,
        href: String
    }
}
</script>