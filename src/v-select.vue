<template>
  <div class="v-select" style="position: relative">

    <select v-if="!readonly" v-show="!multiple" style="width: 100%" ref="select" @change="onChange" @input="onInput"
      :required="required" :disabled="disabled" :click="expand">
      <slot></slot>
    </select>
    <template v-if="multiple">
      <div class="v-widget-header" ref="button" style="padding-top: 3px; padding-bottom: 3px"
        :class="{ 'v-selected': show }" @click="toggle">
        &nbsp;
      </div>
      <div v-show="show" ref="popup" @click="close" style="background-color: #0000009c;">
        <div style="border: 1px solid lightgray;background-color: white; padding:5px;">
          <div class="_ ui-widget ui-state-default ui-corner-all" style="padding: 3px 3px 1px 3px; margin-bottom: 5px">
            <v-checkbox v-model="sela" @input="selectAll" />
          </div>
          <v-checkbox-group class="v-select-checkbox-group" style="overflow-y: auto;" :key="'p' + ik" v-model="sel"
            @input="checkboxInput">
            <template v-if="data.length">
              <div v-for="d in data">
                <v-checkbox :value="d.value" :label="d.label" />
              </div>
            </template></v-checkbox-group>
          <div class="center" style="padding-top: 4px;"><v-button icon="fa-sync" value="Filtrar"></v-button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="readonly">{{ label ? label : "---" }}</template>
  </div>
</template>
<script lang="ts">
import { onMounted, provide, ref, watch, onUpdated } from 'vue'
export default {
  name: 'VSelect',
  setup(props, ctx) {
    const { slots, emit } = ctx;
    const me = props;
    const { displayField, valueField, disabled, readonly, autoload } = props;
    const options = ref([]);
    const valueField_ = ref([]);
    const lastLoad = ref([]);
    const loaders = [];
    const autoload_ = ref(!(autoload + "" == "false" || autoload * 1 == 0));
    const select = ref(null);
    const collect = (items) => {
      const value = items.value;
      if (displayField) {
        options.value = value.sort((a, b) => {
          const va = a[displayField];
          if (va > b[displayField]) return 1;
          else if (va < b[displayField]) return -1;
          else return 0;
        });
      } else {
        options.value = value;
      }
    }
    const updateSelect = () => {
      let v = ctx.attrs.modelValue;
      if (v != null && v.target) v = v.value;
      if (select.value) {
        let sel = select.value;
        let old = sel.selectedIndex;
        //console.log(sel, v)
        //Si el valor es vacio se debe escoger 0
        if (!v || v === "") {
          sel.selectedIndex = 0;
        }
        //se recorre los items en el select
        for (let k = 0; k < sel.length; k++) {
          //console.log(sel[k])
          if (sel[k].value == v) {
            sel.selectedIndex = k;
          }
        }
        //Se busca en cada options
        const children = loaders;
        for (let j = 0; j < children.length; j++) {
          if (!children[j].getValueByIndex) continue;
          let oldv = children[j].getValueByIndex(old - 1);
          //se recupera el anterior valor para si detectar si el valor cambio
          children[j].getIndexByValue(v, (ii, found) => {
            if (ii > -1) {
              sel.selectedIndex = ii + 1;

              let ffound = children[j].getValueByIndex(
                sel.selectedIndex - 1
              );
              if (ffound == -1) {
                ffound = null;
              } else if (children[j].getObjectByIndex) {
                ffound = children[j].getObjectByIndex(sel.selectedIndex - 1);
              }
              let a = Number(oldv);
              if (!isNaN(a)) {
                a = a == Number(v);
              } else if (oldv) {
                if (!v) {
                  a = false;
                } else if (v.id) {
                  a = v.id == oldv.id;
                } else {
                  a = v == oldv;
                }
              } else {
                a = !v;
              }
              if (!a) {
                //console.log('ffound2',ffound)
                emit("input", v, {
                  value: v,
                  select: sel,
                  //option: sel[sel.selectedIndex],
                  //target: me,
                  object: ffound,
                });
              }
            }
          });
        }
      }
    }

    collect.remove = (loader) => {
      const filteredArray = loaders.filter(item => item !== loader);
      loaders.length = 0;
      filteredArray.forEach(item => loaders.push(item));
    };
    collect.push = (loader) => {
      loaders.push(loader);
    };
    collect.updateSelect = () => {
      updateSelect();
    }
    if (valueField) valueField_.value = valueField.split(".");
    provide('collect', collect)
    const getValueField = (i, t) => {
      const vf = valueField_.value;
      if (vf && vf.length)
        for (let j = 0; j < vf.length; j++) {
          if (i) i = i[vf[j]];
        }
      else if (i && !t) i = i.id ? i.id : i.code ? i.code : i;
      return i;
    };
    const onInput = (event) => {
      let selectedValue = event.target.value;
      //console.log('onInput', selectedValue);
      event.stopPropagation();
    }
    const onChange = (event) => {
      event.stopPropagation();
      let selectedValue = event.target.value;
      const sel = select.value;
      if (!selectedValue || selectedValue === "") {
        selectedValue = null;
        sel.selectedIndex = 0;
      }
      let found = 0, oo;
      const items = options.value;
      for (let i = 0; i < loaders.length; i++) {
        found = loaders[i].getValueByIndex(sel.selectedIndex - 1);
        if (found == -1) {
          found = 0;
        } else {
          oo=loaders[i].getObjectByIndex(sel.selectedIndex - 1);
          break;
        }
      }
      if (found) {
        selectedValue = found;
      } else if (items.length) {
        sel.selectedIndex = 0;
      }
      emit("update:modelValue", selectedValue, {
        value: selectedValue,
        select: sel,
        //option: items[sel.selectedIndex],
        //target: me,
        object: oo,
      });
      emit("input", selectedValue, {
        value: selectedValue,
        select: sel,
        //option: items[sel.selectedIndex],
        //target: me,
        object: oo,
      });
    };
    const load = (params, b) => {
      //console.log('load',params);
      if (!props.disabled) {//} && !readonly) {
        
        lastLoad.value = [];
        loaders.forEach((loader) => {
          loader(params, b);
        });
      } else {
        lastLoad.value = [params, b];
      }
    };
    onMounted(() => {
      load();
    });
    onUpdated(() => {
      updateSelect()
    })
    return { options, getValueField, onChange, onInput, select, load, lastLoad, autoload_ }
  },
  props: {
    required: null,
    readonly: null,
    multiple: null,
    label: null,
    disabled: null,
    autoload: null,
    displayField: null,
    valueField: null
  },
  data() {
    return {
      autoload_: true,
      ik: 0,
      data: [],
      popup: null,
      show: false,
      sel: [],
      sela: null,
      tmp: [],
      sel2: []
    };
  },
  mounted() {
    //this.internalLoad();
    //this.updateSelect();
  },
  watch: {
    //value: function(newVal/*, oldVal*/) {console.log('newv='+newVal)},
    disabled(newVal, oldVal) { this.activate(newVal, oldVal); },
    // readonly(newVal) {this.activate(newVal);},
    show(s) {
      let me = this;
      if (s) {
        let cn = this.$refs.button, popup = this.popup;
        if (!popup) {
          popup = this.$refs.popup;
          popup.style.position = "absolute";
          document.body.append(popup);
        }
        let rect = cn.getBoundingClientRect();
        const body = popup.children[0];
        if (window.innerWidth < 400) {
          popup.style.padding = "40px";
          popup.style.height = "100%";
          body.style.height = "100%";
        } else {
          popup.style.top = rect.bottom + 0 + "px";
          popup.style.left = rect.left + 0 + "px";
          popup.style.maxHeight = (window.innerHeight - rect.bottom - 30) + 'px'
          body.style.maxHeight = popup.style.maxHeight;
        }
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        me.tmp = me.sel.sort().join(',');
      } else {
        let d = me.sel, t = me.$el.parentNode.tagName;
        if (t != 'TH' && d && d.length) d = d.join(',');
        else if (d && d.length == 0) d = null;
        if (me.tmp !== me.sel.sort().join(','))
          if (me.$parent.load) {
            me.$parent.load();
          } else {
            //me.$emit('input', d);
          }
      }
    },
  },
  methods: {
    activate(newVal, oldVal) {
      newVal = !!newVal;
      oldVal = !!oldVal;
      let ll = this.lastLoad, me = this;
      //if (ll.length && ll[1] == 77) alert(JSON.stringify(ll[0]) + ' newVal=' + newVal + ' oldVal=' + oldVal);
      if (!newVal && (!newVal) === oldVal && ll.length) {
        this.$el.disabled = false;
        me.load(ll[0], ll[1]);
      }
    },
    expand() { console.log('click') },
    internalLoad() {
      let me = this;
      me.autoload_ = !(me.autoload + "" == "false" || me.autoload * 1 == 0);
      let v = me.$attrs.value;
      if (v != null && v.target) v = v.value;
      //console.log(v);
      let select = me.$el.childNodes[0];
      if (!v || v === "") {
        select.selectedIndex = 0;
      }
      v = me.$attrs.value;
      for (let k = 0; k < select.length; k++) {
        if (select[k].value == v) {
          select.selectedIndex = k;
        }
      }
      //console.log('me.autoload_='+me.autoload_);
      if (me.autoload_) {
        me.load();
      }
      me.$emit("mounted", me);
    },

    toggle() {
      this.show = !this.show;
    },
    close() {
      this.show = false;
    },
    selectAll() {
      let ee = [];
      for (let j = 0; j < this.data.length; j++) {
        ee.push(this.data[j].value);
      }
      this.sel = ee;
      //console.log(this.sel);
      this.ik++;
    },
    checkboxInput() {
      let d = this.sel;
      if (d && d.length) d = d.join(",");
      //this.$emit("input", d);
    },
  },
};
</script>