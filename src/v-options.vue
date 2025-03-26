<script>
import axios from "axios";
import {
  inject, ref, onUnmounted, h, onMounted, computed, watch,
  onUpdated
} from "vue";
import { mergeDeep, getStoredList, log } from "./commons";

export default ({
  setup(props, cxt) {
    const me = props;
    const { valueField, displayField, store, filter, name } = me;
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

    const getValueField = (i, t) => {
      const vf = valueField_.value;
      if (vf && vf.length)
        for (let j = 0; j < vf.length; j++) {
          if (i) i = i[vf[j]];
        }
      else if (i && !t) i = i.id ? i.id : i.code ? i.code : i; //es necesario que el elemento tenga la propiedad id
      return i;
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
        let storedList = await getStoredList(store, params);
        const [key] = params ? Object.keys(params) : [];
        if (key) {
          let itemTmp;
          try {
            const l = (storedList.filter((item) => {
              itemTmp = item;
              return itemTmp[key].startsWith(params[key]);
            }));
            data2.value = l;
            //console.log('load4', params, data2.value);
          } catch (e) {
            log(name, "options.error trying to filter ", itemTmp);
            console.error(e);
          }
        } else {
          data2.value = data2.value.concat(storedList);
        }
      }
      if (false && (me.url || me.src)) {// && !pa.disabled) {
        if (!data2.value) data2.value = [];
        if (me.filters) params = mergeDeep(params ? params : {}, me.filters);
        //console.log(pa.name+'.options.load '+JSON.stringify(p));
        await axios.get('' + (me.url ? me.url : me.src), { params: params })
          .then((r) => {
            let data = r.data.data ? r.data.data : r.data;
            //me.$emit("loaded", { target: me, data: data });
            data2.value = data2.value.concat(data);

            collect(data2)
            loaded.value = 1;
            //if (me.store) localstore.setItem(me.store, JSON.stringify(data));
            //console.log('me.$parent.$forceUpdate()');
            if (nou) nou();
          })
          .catch(() => {
            //r = r.response;
            //let e = me.$parent.$el;
            //let error = document.createElement("div");
          });
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
    return () => {
      /*<option v-for="(item, i) in filterList" :key="i" v-bind:value="getValueField(item)">
          {{ item[displayField] }}
          <slot v-bind:item="item"></slot>
        </option>*/

      return filterList.value.map((item) => {
        const display=df?item[df]:item;
        if (!vf) {
          return h('option', { value: item.id||item.code||JSON.stringify(item) }, display);
        } else {
          return h('option', { value: getValueField(item) }, display);
        }
      })
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