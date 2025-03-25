<template>
  <div class="v-select" style="position: relative">

    <select v-if="!readonly" v-show="!multiple" style="width: 100%" ref="selectRef" @change="onChange"
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
<script>
import { onMounted, provide, ref, watch, nextTick } from 'vue'
import { log } from './commons'
export default {
  name: 'VSelect',
  setup(props, ctx) {
    const { slots, emit } = ctx;
    const { valueField, disabled, readonly, autoload, name } = props;
    const options = ref([]);
    const valueField_ = ref([]);
    const prevValue = ref(null);
    const lastLoad = ref([]);
    const loaders = [];
    const autoload_ = ref(!(autoload + "" == "false" || autoload * 1 == 0));
    const selectRef = ref(null);
    const collect = (items) => {
      options.value = items;
      nextTick(() => {
        log(name, 'collect.nextTick=' + items.length)
        updateSelect(props.modelValue || prevValue.value)
      })
    }
    watch(disabled, (newValue, oldValue) => {
      activate(newValue, oldValue);
    })

    const onChange = (event) => {
      event.stopPropagation();
      let selectedValue = event.target.value;
      const select = selectRef.value;
      log(name, 'select.onchange=', selectedValue);
      if (!selectedValue || selectedValue === "") {
        selectedValue = null;
        select.selectedIndex = 0;
      }
      let found = 0, oo;
      const items = options.value;
      for (let i = 0; i < loaders.length; i++) {
        found = loaders[i].getValueByIndex(select.selectedIndex - 1);
        if (found == -1) {
          found = 0;
        } else {
          oo = loaders[i].getObjectByIndex(select.selectedIndex - 1);
          break;
        }
      }
      if (found) {
        log(name, 'change=found=', found)
        selectedValue = found;
      } else if (items.length) {
        select.selectedIndex = 0;
      }
      emit("update:modelValue", selectedValue, {
        value: selectedValue,
        select: select,
        //option: items[sel.selectedIndex],
        //target: me,
        object: oo,
      });
      nextTick(() => {
        emit("input", selectedValue, {
          value: selectedValue,
          select: select,
          //option: items[sel.selectedIndex],
          //target: me,
          object: oo,
        });
      })
    };

    const isPrimitive = (val) => {

      if (val === null) {
        console.log(true);
        return;
      }

      if (typeof val == "object" || typeof val == "function") {
        console.log(false)
      } else {
        console.log(true)
      }
    }

    const updateSelect = (v) => {
      let value = v || props.modelValue;
      if (selectRef.value) {
        let select = selectRef.value;
        let oldSelectedIndex = select.selectedIndex;
        if (!value || value === "") {
          select.selectedIndex = 0;
        }
        const value2 = value && isPrimitive(value) ? ('' + value) : value;
        //se recorre los items en el select
        for (let k = 0; k < select.length; k++) {
          //aquiobjeto_es_igual_a_objeto_yq_q_el_objeto_se_convierte_en_string_al_comparar_con_un_string

          if (select[k].value === value2) {
            log(name, 'select[k].value == value', select[k].value, "===", value, 'v=', v)
            select.selectedIndex = k;
          }
        }
        const children = loaders;
        for (let j = 0; j < children.length; j++) {
          if (!children[j].getValueByIndex) continue;
          let oldSelectedValue = children[j].getValueByIndex(oldSelectedIndex - 1);
          //se recupera el anterior valor para si detectar si el valor cambio

          children[j].getIndexByValue(value, (index, found) => {
            if (index > -1) {
              let object = children[j].getObjectByIndex(index);
              let a = Number(oldSelectedValue);

              if (!isNaN(a)) {
                a = a == Number(value);
              } else if (oldSelectedValue) {
                if (!value) {
                  a = false;
                } else if (value.id) {
                  a = value.id == oldSelectedValue.id;
                } else {
                  a = value == oldSelectedValue;
                }
              } else {
                a = !value;
              }

              if (prevValue.value != props.modelValue) {
                log(name, 'select.value', value, 'object=', object)
                if (props.modelValue) prevValue.value = props.modelValue;
                if (!a) {

                  log(name, 'select.updateSelect=' + value + ' ' + JSON.stringify(options.value.length));

                  select.selectedIndex = index + 1;
                  emit("update:modelValue", value, {
                    value: value,
                    select,
                    object
                  });
                  nextTick(() => {
                    emit("input", value, {
                      value: value,
                      select,
                      object
                    });
                  });
                }
              }

            } else {
              if (props.modelValue) prevValue.value = props.modelValue;
              log(name, 'select.updateselect.not fout', index)
              emit("update:modelValue", null, null);
              select.selectedIndex = 0;
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
    watch(() => props.modelValue, (newValue, oldValue) => {
      if (newValue != oldValue) {
        updateSelect()
      }
    });

    const activate = (newVal, oldVal) => {
      newVal = !!newVal;
      oldVal = !!oldVal;
      let ll = lastLoad.value;
      if (!newVal && (!newVal) === oldVal && ll.length) {
        //this.$el.disabled = false;
        load(ll[0], ll[1]);
      }
    }

    const load = (params, b) => {
      log(name, 'select.load.params=', params);
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
      if (autoload_.value)
        load();
    });

    return { options, getValueField, onChange, selectRef, load, lastLoad, autoload_ }
  },
  props: {
    modelValue: null,
    required: null,
    readonly: null,
    multiple: null,
    label: null,
    name: null,
    disabled: null,
    autoload: null,
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
  watch: {

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
  }
  /*methods: {
    expand() { console.log('click') },
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
  },*/
};
</script>