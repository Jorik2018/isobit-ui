<template>
    <Teleport to="body">
        <div
            v-if="isOpen"
            class="popup-overlay"
            @click.self="close"
        >
            <div class="popup" :style="{ width }">

                <button
                    type="button"
                    class="popup-close"
                    @click="close"
                >
                    ✕
                </button>

                <!-- Componente cargado por ruta -->
                <component
                    v-if="currentView"
                    :is="currentView"
                    v-bind="currentParams"
                    :callback="callback"
                />

                <!-- Si no hay componente, mostrar slot -->
                <slot
                    v-else
                    :close="close"
                    :callback="callback"
                />

            </div>
        </div>
    </Teleport>
</template>

<script setup>
import {
    inject,
    ref,
    shallowRef,
} from 'vue'

import { useRouter } from 'vue-router'


const props = defineProps({
    width: {
        type: String,
        default: '600px',
    },
    name: {
        type: String,
        default: null,
    },
})


const emit = defineEmits([
    'success',
    'close',
])

const router = useRouter()

const isOpen = ref(false)

const currentView = shallowRef(null)

const currentParams = ref({})

const viewCollector = inject('viewCollector');

const parentRefresh = inject('refresh', null)

const resolveView = async (routeRef) => {
    let route = router
        .getRoutes()
        .find(route => route.name === routeRef)

    let params = {}

    if (!route) {
        const resolved = router.resolve(routeRef)

        route = resolved.matched.at(-1)
        params = resolved.params
    }

    if (!route) {
        throw new Error(
            `No existe la ruta "${routeRef}"`
        )
    }

    let component =
        route.components?.default
        ?? route.component

    if (!component) {
        throw new Error(
            `La ruta "${routeRef}" no tiene componente`
        )
    }

    if (typeof component === 'function') {
        const module = await component()
        component = module.default ?? module
    }

    return {
        component,
        params,
    }
}

const open = async (
    routeRef = null,
    data = null,
) => {

    // Sin ruta => mostrar slot
    if (!routeRef) {
        currentView.value = null
        currentParams.value = data ?? {}
        isOpen.value = true
        return
    }

    // Con ruta => comportamiento actual
    const resolved = await resolveView(routeRef)

    currentView.value = resolved.component
    currentParams.value = {
        ...resolved.params,
        ...(data ?? {}),
    }

    isOpen.value = true
}

const close = (v) => {

    isOpen.value = false

    emit('close',v);
    currentView.value = null
}

const callback = async (
    value = null,
) => {
    if (value?.success) {
         parentRefresh?.()
    }
    close(value)
}

viewCollector.push({
    open,
    props,
    type: 'v-popup'
});

defineExpose({
    open,
    close,
})
</script>