<template>
  <div class="v-select" style="position: relative">

    <select v-if="!readonly" v-show="!multiple" style="width: 100%" ref="selectRef" @change="onChange"
      :required="required" :disabled="disabled" :click="expand">
      <slot></slot>
    </select>
    <template v-if="multiple">
      <div class="v-widget-header v-button v-filter" ref="button" 
      style="padding-top: 7px; padding-bottom: 7px"
        :class="{ 'v-selected': show || sel.length }" @click="toggle">
        <template v-if="sel.length">
          ({{ sel.length }})
        </template>
        &nbsp;
      </div>
      <div v-show="show" ref="popup" class="v-popup">
        <div>
          <div>
            <v-checkbox v-model="sela" @change="selectAll" />
          </div>
          <v-checkbox-group class="v-select-checkbox-group" style="overflow-y: auto;" v-model="sel"
            @input="checkboxInput">
            <v-checkbox v-for="d in options" :value="d.id" :label="d.name" />
          </v-checkbox-group>
          <div class="center"><v-button icon="fa-sync" value="Filtrar"
              @click="apply"></v-button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="readonly">{{ label ? label : "---" }}</template>
  </div>
</template>
<script>
import { onMounted, provide, ref, watch, nextTick, unref } from 'vue'
import { app, log } from './commons'
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
    const updateMultiple = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        sel.value = [];
        return;
      }

      if (Array.isArray(value)) {
        sel.value = [...value];
        return;
      }

      sel.value = String(value).split(',');
    };
    const collect = (items) => {

      const list = unref(items) || [];

      options.value = Array.isArray(list)
        ? list.filter(item => item != null)
        : [];

      nextTick(() => {

        if (props.multiple) {
          updateMultiple(props.modelValue);
        } else {
          updateSelect(
            props.modelValue || prevValue.value
          );
        }

      });
    };

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

    const updateSelect = (v) => {
      let value = v || props.modelValue;
      if (selectRef.value) {
        let select = selectRef.value;
        let oldSelectedIndex = select.selectedIndex;
        if (!value || value === "") {
          select.selectedIndex = 0;
        }
        //if(value)value = value.id||value.code||value;
        log(name, 'value===', value)
        const valueId = value ? ('' + (value.id || value.code || value)) : value;
        //se recorre los items en el select
        for (let k = 0; k < select.length; k++) {
          //aquiobjeto_es_igual_a_objeto_yq_q_el_objeto_se_convierte_en_string_al_comparar_con_un_string

          if (select[k].value === valueId) {
            //log(name, 'select[k].value == value', select[k].value, "===", value, 'v=', v)

            select.selectedIndex = k;
          }
        }
        const children = loaders;
        for (let j = 0; j < children.length; j++) {
          if (!children[j].getValueByIndex) continue;
          //el problema es cuando 
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
              nextTick(() => {
                emit("input", null, {
                  value: null
                });
              });
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


    watch(
      () => props.modelValue,
      (newValue, oldValue) => {

        if (newValue == oldValue) {
          return;
        }

        if (props.multiple) {
          updateMultiple(newValue);
        } else {
          updateSelect();
        }
      }
    );

    watch(() => props.disabled, (newValue, oldValue) => {
      activate(newValue, oldValue);
    })

    const activate = (newVal, oldVal) => {
      newVal = !!newVal;
      oldVal = !!oldVal;
      let ll = lastLoad.value;
      log(name, 'activate.newVal=', newVal, 'oldVal=', oldVal)
      if (!newVal && (!newVal) === oldVal && ll.length) {
        //this.$el.disabled = false;
        load(ll[0], ll[1]);
      }
    }

    const load = (params, b) => {

      if (!props.disabled) {//} && !readonly) {
        lastLoad.value = [];
        loaders.forEach((loader) => {
          loader(params, b);
        });
      } else {
        log(name, 'select.load.params=', params);
        //tiene q aplicarse el filtro al data existente
        lastLoad.value = [params, b];
        loaders.forEach((loader) => {
          loader(params, b);
        });
      }
    };

    onMounted(() => {
      if (autoload_.value)
        load();
    });


    const show = ref(false);
    const sel = ref([]);
    const sela = ref(false);
    const tmp = ref("");



    const close = () => {

      show.value = false;

    };

    const apply = () => {

      const current = [...sel.value]
        .map(String)
        .sort();

      const previous = [...tmp.value]
        .map(String)
        .sort();

      const changed =
        current.length !== previous.length ||
        current.some(
          (value, index) =>
            value !== previous[index]
        );

      if (changed) {
        const value = current.length
          ? current.join(',')
          : null;
        emit(
          'update:modelValue',
          value
        );
      }
      close();
    };
    const toggle = () => {
      if (!show.value) {
        tmp.value = [...sel.value];
      }
      show.value = !show.value;
      if (!show.value) {
        apply()
      }
    };

    const checkboxInput = () => {

      let value = null;

      if (sel.value && sel.value.length) {
        value = sel.value.join(",");
      }
      console.log(sel);
      /*emit("update:modelValue", value);

      nextTick(() => {
        emit("input", value);
      });*/
    };

    const selectAll = (checked) => {
      console.log('selectAll.checked=', checked);
      if (checked) {
        sel.value = options.value.map(item => getValueField(item));
      } else {
        sel.value = [];
      }
      checkboxInput();
    };
    const expand = (event) => {
      if (props.readonly) {
        event.preventDefault();
        return false;
      }
    };
    return {
      options, getValueField, onChange, selectRef, load, lastLoad, autoload_,
      expand,
      show,
      sel,
      sela,
      toggle,
      close,

      apply,
      selectAll,
      checkboxInput
    }
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
      data: [],
      popup: null,
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
      }
    },
  }
};
</script>