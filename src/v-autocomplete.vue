<template>
    <div class="v-autocomplete" @focusout="focusout" ref="autocomplete" :value="value" :disabled="disabled">
        <div class="v-selection" :style="{ whiteSpace: nowrap ? 'nowrap' : '' }" v-if="selected && showSelection">
            <slot name="label" :selected="selected"></slot>
            {{ !hasSlot('label') ? getLabel(selected) : '&nbsp;' }}&nbsp;
            <span v-if="!readonly" @click="remove" class="remove-icon"><i class="fa fa-times"></i></span>
        </div>
        <span v-if="!selected" @click="search" class="search-icon"><i class="fa fa-xs fa-sync"></i></span>
        <input v-if="!selected" @keyup="keyup" @keyup.enter.stop.prevent="search" :class="inputClass"
            @focus="show = true" :disabled="disabled" :placeholder="placeholder" v-model="query">
        <transition name="fade">
            <div v-show="show && !selected" class="v-resultpane"
                :style="{ zIndex: 2, width: 'calc(100% - 2px)', position: (floating ? 'absolute' : 'relative') }">
                <div class="v-list" style="max-height: 300px;overflow-y: auto;">
                    <div v-for="(d, i) in filteredData" :key="i"
                        :class="{ 'v-selected': selected == d, 'v-focused': focused == i }" @click="setSelected(d)">
                        <slot :row="d"></slot>
                    </div>
                    <div v-if="allData.length < total" class="center" @click="search(1)">Load more {{ total -
                        allData.length }} results...</div>
                </div>
                <div v-if="filteredData.length < 1 && total == 0" class="center yellow" style="padding:5px">No results
                    found.
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { mergeDeep } from './commons';
import axios from 'axios';
import { useAppStore } from './useAppStore';

export default {
    name: 'VAutocomplete',
    emits: [
        'input'
    ],
    props: {
        modelValue: { type: Object, default: null },
        data: { type: Array, default: () => null },
        placeholder: String,
        label: String,
        default: Object,
        store: String,
        params: Object,
        autoload: { type: Boolean, default: false },
        floating: { type: Boolean, default: true },
        src: String,
        readonly: Boolean,
        nowrap: Boolean,
        disabled: Boolean,
        showSelection: { type: Boolean, default: true },
        pagination: { type: Number, default: 10 }
    },
    setup(props, ctx) {
        const { emit, slots } = ctx;
        const appStore = useAppStore();
        // State variables using refs
        const page = ref(0);
        const selected = ref(null);
        const focused = ref(-1);
        const query = ref('');
        const allData = ref([]);
        const show = ref(false);
        const total = ref(-1);
        const inputClass = ref('');
        const autocomplete = ref(null);

        watch(() => props.modelValue, newValue => {
            console.log('==============>', newValue);
            selected.value = newValue;
        });

        watch(() => props.data, newValue => {
            allData.value = newValue;
        });

        onMounted(() => {
            inputClass.value = props.inputClass;
            if (props.autoload) search();
            document.addEventListener("click", clickout);
            //if (!this.$root.online) loadStore();
        });

        onBeforeUnmount(() => {
            document.removeEventListener("click", clickout);
        });

        // Computed data for filtering
        const filteredData = computed(() => {
            focused.value = -1;
            const q = query.value ? query.value.trim().toLowerCase().split(/[ ,]+/) : null;
            return allData.value && query.value ? allData.value.filter((el) => {
                const v = JSON.stringify(el).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                return q.every(qPart => v.includes(qPart));
            }) : allData.value;
        });

        // Define methods
        const search = async (e) => {
            const { src, source } = props;
            let pagination = Number(props.pagination);
            if (e === 1) {
                page.value += pagination;
            } else {
                page.value = 0;
                if (props.data && props.autoload) return;
            }
            let params = { query: query.value };

            if (props.params) params = mergeDeep(params, props.params);

            axios.get((src ? src : props.source) + (pagination > 0 ? '/' + page.value + '/' + pagination : ''), { params: params })
                .then((r) => {
                    const d = r.data;
                    console.log(d)
                    if (!d.error) {
                        if (e === 1) {
                            allData.value = allData.value.concat(d.data ? d.data : d);
                        } else {
                            allData.value = d.data ? d.data : d;
                        }
                        console.log(allData);
                        total.value = d.size;
                        if (!props.autoload) show.value = true;
                        console.log('=========================');
                        //me.$emit('complete',{data:me.data,query:me.query,target:me});
                    } else {
                        MsgBox(d.error);
                    }
                }).catch(errorLog).then(() => {
                    emit('complete', { data: allData.value, query: query.value, target: 'me' });
                });
        };
        const errorLog = (e) => { console.log(e) };
        const remove = () => {
            selected.value = null;
            emit("update:modelValue", null);
            //emit('input', null); 
        };
        const clickout = (event) => {
            const parent = autocomplete.value;
            if (parent && !parent.contains(event.target)) {
                show.value = false;
            }

        };
        const focusout = (event) => { /* Logic for focus out */ };
        const setSelected = (value) => {
            selected.value = value;
            emit("update:modelValue", value);
            //emit('input', value, { value });
        };

        const getLabel = (i) => {
            if (props.label) {
                const vf = props.label.split('.');
                for (let j = 0; j < vf.length; j++) {
                    if (i)
                        i = i[vf[j]];
                }
            }
            return i;
        };

        const hasSlot = (name = 'default') => {
            return !!(slots[name])
        };

        // Return all reactive properties and methods
        return {
            query,
            show,
            selected,
            filteredData,
            allData,
            focused, autocomplete,
            inputClass,
            search,
            total,
            remove,
            clickout,
            focusout,
            setSelected,
            getLabel,
            hasSlot,
        };
    }
};
</script>

<style scoped>
/* Styles go here */
.remove-icon {
    top: 0px;
    margin: 2px 4px;
    right: 0px;
    position: absolute;
    cursor: pointer;
}

.search-icon {
    color: gray;
    top: 4px;
    right: 6px;
    position: absolute;
    cursor: pointer;
}
</style>
