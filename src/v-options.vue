<template>
  <div v-bind:title="data ? data.length : 0">
    <option
      v-for="(item, i) in filterList"
      :key="i"
      v-bind:value="getValueField(item)"
    >
      {{ item[displayField] }}
      <slot v-bind:item="item"></slot>
    </option>
  </div>
</template>
  <script>
export default {
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
      this.$parent.uu();
    },
  },
  data() {
    return {
      queue: [],
      data2: [],
      valueField_: [],
      lastLoad: null,
      loaded: null,
    };
  },
  computed: {
    filterList() {
      var me = this;
      return me.data2 && me.filter
        ? me.data2.filter((el) => {
            return (
              JSON.stringify(el)
                .toLowerCase()
                .indexOf(me.filter.toLowerCase()) !== -1
            );
          })
        : me.data2;
    },
  },
  created() {
    var me = this;
    if (me.data) me.data2 = me.data;
  },
  updated() {
    var me = this;
    if (!me.loaded && me.data) {
      me.data2 = me.data;
    }
    var p = me.$el.parentElement;

    while (me.$el.childNodes.length > 0) {
      p.appendChild(me.$el.childNodes[0]);
    }
    me.$parent.$emit("changed", p);
    me.$parent.uu();
  },
  mounted() {
    var me = this;
    if (me.valueField) me.valueField_ = me.valueField.split(".");
    if (me.$parent) me.$parent.uu();
  },
  methods: {
    getParentE() {
      return this.$el.parentElement.parentElement;
    },
    getIndexByValue(v, c) {
      if (v && v.id) v = v.id;
      else if (v && v.code) v = v.code;
      // var ee=this.getParentE();
      // if(ee.id){

      // console.log('=============getIndexByValue.this.filterList.length='+this.filterList.length);
      // }
      for (var j = 0; j < this.filterList.length; j++) {
        //if(ee.id){

        // console.log('compare '+this.getValueField(this.filterList[j])+' =? '+v);
        //}
        if (this.getValueField(this.filterList[j]) == v) {
          //                    console.log('se encontro '+v+' en index='+j);
          //console.log('c='+c);
          if (c) c(j);
          return j;
        }
      }

      if (c) c(-1);
      return -1;
    },
    getValueByIndex(i) {
      var me = this,
        f = me.filterList;
      return f ? me.getValueField(f[i], 1) : null;
    },

    getValueField(i, t) {
      var vf = this.valueField_;
      if (vf && vf.length)
        for (var j = 0; j < vf.length; j++) {
          if (i) i = i[vf[j]];
        }
      else if (i && !t) i = i.id ? i.id : i.code ? i.code : i; //es necesario que el elemento tenga la propiedad id
      return i;
    },
    getSelectedItem() {
      var me = this;
      var p = me.$el.parentElement;
      return me.filterList[p.selectedIndex - 1];
    },
    async load(p, nou, clearQueue) {
      var me = this;
      if (!clearQueue) me.queue.push([p, nou]);
      console.log(me.getParentE().name+'================load');
      
      if (me.queue.length > 1) return;
      var pa = me.$el.parentElement;
      me.data2 = me.data;
      if (!me.data2) me.data2 = [];
      if (me.store) {
        //console.log(JSON.stringify(me.data2));
        var storedList = await _.getStoredList(me.store,p);

        // if(this.getParentE().name){
        // console.log(this.$el.parentElement.parentElement);
        // console.log(storedList);
        // }
        const [key] = p ? Object.keys(p) : [];
        if (key) {
          try {
            var ittt;
            var fd=storedList.filter((item) => {
                ittt = item;
                //item[key]&&
                var ee = this.getParentE();
                if (ee.id) {
                  console.log(
                    item[key] +
                      " c " +
                      p[key] +
                      " = " +
                      item[key].startsWith(p[key])
                  );
                }
                return item[key].startsWith(p[key]);
              });
            me.data2 = me.data2.concat(
              fd
            );
          } catch (e) {
            console.log("Error trying to filter ", ittt);
            console.error(e);
          }
          //console.log("data filtrada");
        } else {
          me.data2 = me.data2.concat(storedList);
          //console.log("data no filtrada");
        }
        var displayField = me.displayField;
        me.data2 = me.data2.sort(function (a, b) {
          if (a[displayField] > b[displayField]) return 1;
          else if (a[displayField] < b[displayField]) return -1;
          else 0;
        });
        //console.log(JSON.stringify(me.data2));
      }
      //console.log(pa.name+'.antes de preguntar disabled options.load '+JSON.stringify(p));
      if ((me.url || me.src) && !pa.disabled) {
        if (!me.data2) me.data2 = [];
        if (me.filters) p = window.Vue.mergeDeep(p ? p : {}, me.filters);
        //console.log(pa.name+'.options.load '+JSON.stringify(p));
        await window.axios
          .get(me.url ? me.url : me.src, { params: p })
          .then((r) => {
            var data = r.data.data ? r.data.data : r.data;
            me.$emit("loaded", { target: me, data: data });
            me.data2 = me.data2.concat(data);
            me.loaded = 1;
            //if (me.store) localstore.setItem(me.store, JSON.stringify(data));
            me.$parent.$forceUpdate();
            if (nou) nou();
          })
          .catch(() => {
            //r = r.response;
            //var e = me.$parent.$el;
            //var error = document.createElement("div");
            /*error.innerHTML = r.config.method + ' ' + r.config.url + ' ' + r.status + ' (' + r.statusText + ')';
                          error.classList.add("v-error");
                          e.parentNode.insertBefore(error, e);*/
          });
      } /*else{
                  console.log('no se cargara aun '+pa.name);
              }*/
      if (!clearQueue) me.queue.shift();
      while (me.queue.length) {
        var d = me.queue.shift();
        await me.load(d[0], d[1], 1);
      }
    },
  },
};
</script>