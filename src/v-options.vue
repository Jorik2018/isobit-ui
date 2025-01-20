<script>
import axios from "axios";
import {
  inject, ref, onUnmounted, h, onMounted, computed,
  onUpdated
} from "vue";
import { mergeDeep, getStoredList } from "./commons";

export default ({
  setup(props, cxt) {
    const me = props;
    const { displayField, store, filter } = me;
    const { expose, emit } = cxt;
    const queue = ref([]);
    const data2 = ref([]);
    const valueField_ = ref([]);
    const lastLoad = ref(null);
    const loaded = ref(null);
    const collect = inject('collect');

    const filterList = computed(() => {
      return data2.value && filter
        ? data2.value.filter((el) => {
          return (
            JSON.stringify(el)
              .toLowerCase()
              .indexOf(filter.toLowerCase()) !== -1
          );
        })
        : data2.value;
    })

    const getIndexByValue = (v, c) => {
      if (v && v.id) v = v.id;
      else if (v && v.code) v = v.code;
      // var ee=this.getParentE();
      // if(ee.id){

      // console.log('=============getIndexByValue.this.filterList.length='+this.filterList.length);
      // }
      for (var j = 0; j < filterList.value.length; j++) {
        //if(ee.id){

        // console.log('compare '+this.getValueField(this.filterList[j])+' =? '+v);
        //}
        if (getValueField(filterList.value[j]) == v) {
          //                    console.log('se encontro '+v+' en index='+j);
          //console.log('c='+c);
          if (c) c(j);
          return j;
        }
      }

      if (c) c(-1);
      return -1;
    }

    const getValueField = (i, t) => {
      const vf = valueField_.value;
      if (vf && vf.length)
        for (var j = 0; j < vf.length; j++) {
          if (i) i = i[vf[j]];
        }
      else if (i && !t) i = i.id ? i.id : i.code ? i.code : i; //es necesario que el elemento tenga la propiedad id
      return i;
    }

    const getValueByIndex = (i) => {
      const f = filterList.value;
      return f ? getValueField(f[i], 1) : null;
    }

    const load = async (params = null, nou = null, clearQueue = false) => {
      if (!clearQueue && nou && params) queue.value.push([params, nou]);
      if (queue.value.length > 1) return;
      //let pa = me.$el.parentElement;
      data2.value = [];//me.data;
      if (!data2.value) data2.value = [];
      if (me.store) {
        let storedList = await getStoredList(me.store, params);

        const [key] = params ? Object.keys(params) : [];
        if (key) {
          //console.log('load4', params, key);
          let itemTmp;
          //console.log(key)
          try {

            data2.value = /*data2.value.concat*/(storedList.filter((item) => {
              itemTmp = item;
              return itemTmp[key].startsWith(params[key]);
            }));
            //console.log('load4', params, data2.value);


          } catch (e) {
            console.log("Error trying to filter ", itemTmp);
            console.error(e);
          }
        } else {
          data2.value = data2.value.concat(storedList);
        }
        //console.log(JSON.stringify(me.data2));
      }
      //console.log(pa.name+'.antes de preguntar disabled options.load '+JSON.stringify(p));
      if (false && (me.url || me.src)) {// && !pa.disabled) {
        if (!data2.value) data2.value = [];
        if (me.filters) params = mergeDeep(params ? params : {}, me.filters);
        //console.log(pa.name+'.options.load '+JSON.stringify(p));
        await axios.get('' + (me.url ? me.url : me.src), { params: params })
          .then((r) => {
            var data = r.data.data ? r.data.data : r.data;
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
            //var e = me.$parent.$el;
            //var error = document.createElement("div");
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
      collect.updateSelect();
    })
    onMounted(() => {
      //console.log('xxxx2', me)
      if (me.valueField) valueField_.value = me.valueField.split(".");
      collect.updateSelect();
    });
    onUnmounted(() => {
      collect.remove(load);
    });
    expose({ load })
    return () => {
      /*<option v-for="(item, i) in filterList" :key="i" v-bind:value="getValueField(item)">
          {{ item[displayField] }}
          <slot v-bind:item="item"></slot>
        </option>*/
      return filterList.value.map((item) => h('option', { value: getValueField(item) }, item[displayField]))
    }
  },
  name: 'VOptions',
  props: {
    url: String,
    src: String,
    displayField: String,
    data: Array,
    store: null,
    valueField: String,
    filters: null,
    filter: null,
    mode: null,
  },
  watch: {
    data(/*nv,ov*/) {
      // if (this.$parent.$el && this.$parent.$el.id)
      // console.log("data changed " + this.$parent.$el.id);
      this.$parent.updateSelect();
    },
  },
  created() {
    var me = this;
    if (me.data) me.data2 = me.data;
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
      var me = this;
      var p = me.$el.parentElement;
      return me.filterList[p.selectedIndex - 1];
    },
    async load2(p, nou, clearQueue) {
      let me = this;
      //console.log(me);
      //console.log(me.queue);
      return;
    },
  },
});
</script>