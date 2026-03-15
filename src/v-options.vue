<template>
  <option v-for="(item, i) in filterList" :key="i"
    :value="vf ? getValueField(item) : (item.id || item.code || JSON.stringify(item))">
    <slot :item="item">
      {{ df ? item[df] : item }}
    </slot>
  </option>
</template>
<script>

import { useAppStore } from './useAppStore';

import {
  inject, ref, onUnmounted, h, onMounted, computed, watch,
  onUpdated
} from "vue";
import { mergeDeep, getStoredList, log } from "./commons";

export default ({
  setup(props, cxt) {
    const me = props;
    const { valueField, displayField, store, filter, name, src } = me;
    const app = useAppStore();
    const { expose, emit } = cxt;
    const queue = ref([]);
    const data2 = ref([]);
    const valueField_ = ref([]);
    const loaded = ref(null);
    const collect = inject('collect');

    if (valueField) valueField_.value = valueField.split(".");

    const filterList = computed(() => {
      const data = (me.data || []).concat(data2.value || [])
      return filter ? data.filter((el) => {
        return (
          JSON.stringify(el)
            .toLowerCase()
            .indexOf(filter.toLowerCase()) !== -1
        );
      }) : data;
    })

    watch(filterList, (nv) => {
      //console.log('options.' + name, nv)
    })

    const getIndexByValue = (v, callback) => {
      if (v && v.id) v = v.id;
      else if (v && v.code) v = v.code;
      for (let j = 0; j < filterList.value.length; j++) {
        const o = filterList.value[j];
        if (getValueField(o) == v) {
          if (callback) callback(j, o);
          return j;
        }
      }
      if (callback) callback(-1);
      return -1;
    }

    const getValueField = (value, t) => {
      const vf = valueField_.value;
      if (vf && vf.length) {
        for (let j = 0; j < vf.length; j++) {
          if (value) value = value[vf[j]];
        }
      } else if (value && !t) {
        value = value.id ? value.id : value.code ? value.code : value;//es necesario que el elemento tenga la propiedad id
      }
      return value;
    }

    const getValueByIndex = (i) => {
      const f = filterList.value;
      return f ? getValueField(f[i], 1) : null;
    }

    let vf = valueField;
    let df = displayField;
    if (!df) {
      //si display es vacio se usara mostrara el valueFiel
      df = vf;
    }
    const load = async (params = null, nou = null, clearQueue = false) => {
      if (!clearQueue && nou && params) queue.value.push([params, nou]);
      if (queue.value.length > 1) return;
      
      //let pa = me.$el.parentElement;
      data2.value = [];
      if (store) {
        
        const storedList = await getStoredList(store, params);
        console.log(store, params)
        if (params && Object.keys(params).length) {
          data2.value = storedList.filter(item =>
            Object.entries(params).every(([k, v]) =>
              String(item[k] ?? '').startsWith(v)
            )
          );
        } else {
          data2.value.push(...storedList);
        }
      }
      if (src) {// && !pa.disabled) {
        if (me.filters) params = mergeDeep(params ? params : {}, me.filters);
        //console.log(pa.name+'.options.load '+JSON.stringify(p));
        await app.axios.get(src, { params })
          .then((response) => {
            let data = response.data.data ? response.data.data : response.data;
            emit("loaded", { target: me, data: data });
            data2.value = data2.value.concat(data);
            collect(data2)
            loaded.value = 1;
            //if (me.store) localstore.setItem(me.store, JSON.stringify(data));
            //console.log('me.$parent.$forceUpdate()');
            if (nou) nou();
          })
          .catch(me.error);
      }
      collect(filterList)
      if (!clearQueue) queue.value.shift();
      while (queue.value.length) {
        const d = queue.value.shift() || [];
        await load(d[0], d[1], true);
      }
    }

    load.getObjectByIndex = (i) => {
      const f = filterList.value;
      return f ? f[i] : null;
    };

    load.getValueByIndex = getValueByIndex;

    load.getIndexByValue = getIndexByValue;

    collect.push(load);

    onUpdated(() => {
      collect((me.data || []).concat(data2.value))
    })

    onUnmounted(() => {
      collect.remove(load);
    });
    expose({ load })
    return {
      filterList,
      getValueField,
      vf,
      df
    }
  },
  name: 'VOptions',
  props: {
    url: String,
    src: String,
    name: String,
    displayField: String,
    data: Array,
    store: null,
    valueField: String,
    filters: null,
    filter: null,
    mode: null,
  },
  updated() {
    let me = this;
    if (!me.loaded && me.data) {
      me.data2 = me.data;
    }
    //me.$parent.$emit("changed", p);
    //me.$parent.updateSelect();
  },
  methods: {
    getParentE() {
      return this.$el.parentElement.parentElement;
    },
    getSelectedItem() {
      let me = this;
      let p = me.$el.parentElement;
      return me.filterList[p.selectedIndex - 1];
    }
  },
});
</script>