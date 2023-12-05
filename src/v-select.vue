<template>
  <div class="v-select" style="position: relative">
    <select
      v-if="!readonly"
      v-show="!multiple"
      style="width: 100%"
      @change="onChange($event.target.value)"
      v-bind:required="required"
      v-bind:disabled="disabled"
      v-bind:click="expand"
    >
      <slot></slot>
    </select>
    <template v-if="multiple">
      <div
        class="v-widget-header"
        ref="button"
        style="padding-top: 3px; padding-bottom: 3px"
        v-bind:class="{ 'v-selected': show }"
        v-on:click="toggle"
      >
        &nbsp;
      </div>
      <div v-show="show" ref="popup"  @click="close" style="background-color: #0000009c;">
        <div style="border: 1px solid lightgray;background-color: white; padding:5px;">
          <div
            class="_ ui-widget ui-state-default ui-corner-all"
            style="padding: 3px 3px 1px 3px; margin-bottom: 5px"
          >
            <v-checkbox v-model="sela" v-on:input="selectAll" />
          </div>
          <v-checkbox-group class="v-select-checkbox-group" style="overflow-y: auto;"
            v-bind:key="'p' + ik"
            v-model="sel"
            v-on:input="checkboxInput"
          >
            <template v-if="data.length">
              <div v-for="d in data">
                <v-checkbox v-bind:value="d.value" v-bind:label="d.label" />
              </div> </template
          ></v-checkbox-group>
          <div class="center"  style="padding-top: 4px;"><v-button icon="fa-sync" value="Filtrar"></v-button>
          </div>
        </div>
      </div>
    </template>
    <template v-if="readonly">{{ label ? label : "---" }}</template>
  </div>
</template>
<script>
export default {
  props: {
    required: null,
    readonly: null,
    multiple: null,
    label: null,
    disabled: null,
    autoload: null,
  },
  data() {
    return {
      autoload_: true,
      ik: 0,
      lastLoad: null,
      data: [],
      popup: null,
      show: false,
      sel: [],
      sela: null,
      tmp:[],
      sel2:[]
    };
  },
  created() {
    var me = this;
    me.autoload_ = !(me.autoload + "" == "false" || me.autoload * 1 == 0);
  },
  mounted() {
    this.internalLoad();
    this.updateSelect();
  },
  watch: {
    //value: function(newVal/*, oldVal*/) {console.log('newv='+newVal)},
    disabled(newVal) {
      var ll = this.lastLoad,
        me = this;
      if (!newVal && ll) {
        this.$el.disabled = false;
        setTimeout(function () {
          me.load(ll[0], ll[1]);
        }, 50);
      }
    },
    readonly(newVal) {
      let ll = this.lastLoad,
        me = this;
      if (!newVal && ll) {
        this.$el.disabled = false;
        setTimeout(() => {
          me.load(ll[0], ll[1]);
        }, 50);
      }
    },
    show(s) {
      let me = this;
      if (s) {
        let cn = this.$refs.button,popup = this.popup;
        if (!popup) {
          popup = this.$refs.popup;
          popup.style.position = "absolute";
          document.body.append(popup);
        }
        let rect = cn.getBoundingClientRect();
        const body = popup.children[0];
        if(window.innerWidth<400){
          popup.style.padding = "40px";
          popup.style.height = "100%";
          body.style.height = "100%";
        }else{
          popup.style.top = rect.bottom + 0 + "px";
          popup.style.left = rect.left + 0 + "px";
          popup.style.maxHeight = (window.innerHeight - rect.bottom - 30)+'px'
          body.style.maxHeight = popup.style.maxHeight;
        }
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        me.tmp=me.sel.sort().join(',');
      } else {
        var d=me.sel,t=me.$el.parentNode.tagName;
        if(t!='TH'&&d&&d.length)d=d.join(',');
        else if(d&&d.length==0)d=null;
        if(me.tmp!==me.sel.sort().join(','))
          if(me.$parent.load){
            me.$parent.load();
          }else{
            me.$emit('input',d);
          }
      }
    },
  },
  updated() {
    this.updateSelect();
  },
  methods: {
    expand(){console.log('click')},
    updateSelect() {
      var me = this;
      var v = me.$attrs.value;
      //console.log(typeof v);
      if (v != null && v.target) v = v.value;
      //console.log(v);
      //console.log('updated.'+me.$el.id+'='+JSON.stringify(v));
      var select = me.$el.childNodes[0];
      var old = select.selectedIndex;
      //Si el valor es vacio se debe escoger 0
      if (!v || v === "") {
        select.selectedIndex = 0;
      }
      for (var k = 0; k < select.length; k++) {
        if (select[k].value == v) {
          select.selectedIndex = k;
        }
      }
      //Se busca en cada options
      for (var j = 0; j < me.$children.length; j++) {
        if (!me.$children[j].getValueByIndex) continue;
        var oldv = me.$children[j].getValueByIndex(old - 1);
        //se recupera el anterior valor para si detectar si el valor cambio
        me.$children[j].getIndexByValue(v, function (ii, found) {
          if (ii > -1) {
            select.selectedIndex = ii + 1;
            var ffound = me.$children[j].getValueByIndex(
              select.selectedIndex - 1
            );
            if (ffound == -1) {
              ffound = null;
            } else {
              ffound = me.$children[j].filterList[select.selectedIndex - 1];
            }
            /*if(me.$el.id){
						for(k=0;k<select.length;k++){
							console.log(k+'--'+select[k].value);
						}
						console.log('select.length.'+me.$el.id+'='+select.length);
						console.log('select.selectedIndex .'+me.$el.id+'='+select.selectedIndex);
						}*/
            var a = Number(oldv);
            if (!isNaN(a)) {
              a = a == Number(v);
            } else if (oldv) {
              if (!v) {
                a = false;
              } else if (v.id) {
                a = v.id == oldv.id;
              } else a = v == oldv;
            } else {
              a = !v;
            }
            if (!a) {
              if (me.$el.id) {
                console.log(
                  "emit input ." + me.$el.id + "=" + JSON.stringify(v)
                );
                console.log("ffound=", ffound);
              }
              me.$emit("input", v, {
                value: v,
                select: select,
                option: select[select.selectedIndex],
                target: me,
                object: ffound,
              });
            }
          }
        });
      }
    },
    internalLoad() {
      var me = this;
      me.autoload_ = !(me.autoload + "" == "false" || me.autoload * 1 == 0);
      let v = me.$attrs.value;
      if (v != null && v.target) v = v.value;
      //console.log(v);
      var select = me.$el.childNodes[0];
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
      if (me.autoload_){
        me.load();
      }
      me.$emit("mounted", me);
      me.$on("changed", function (m) {
        let op = m.querySelectorAll("option"),
          d = [];
        for (let j = 0; op.length > j; j++) {
          d.push({ value: op[j].value, label: op[j].textContent });
        }
        me.data = d;
        //console.log(d);
      });
    },
    load(a, b) {
      let me = this;
      me.$children.forEach(child => {
        if (child.load) {
          child.load(a, b);
        }
      });
      if (!me.disabled && !me.readonly) {
        //console.log(this.$el.name+' loading with value='+me.$attrs.value);

        me.lastLoad = null;
      } else {
        //                console.log(this.$el.name+' is disabled');
        me.lastLoad = [a, b];
      }
    },
    toggle() {
      this.show = !this.show;
    },
    close(){
      this.show = false;
    },
    selectAll() {
      var ee = [];
      for (var j = 0; j < this.data.length; j++) {
        ee.push(this.data[j].value);
      }
      this.sel = ee;
      //console.log(this.sel);
      this.ik++;
    },
    checkboxInput() {
      var d = this.sel;
      if (d && d.length) d = d.join(",");
      this.$emit("input", d);
    },
    onChange(value) {
      var me = this;
      //console.log(me.$el.id+'.onchange='+JSON.stringify(value));
      //console.log(me.$el.id+'.onchange='+JSON.stringify(value));
      var select = this.$el.childNodes[0];
      if (!value || value === "") {
        value = null;
        select.selectedIndex = 0;
      }
      var found = 0,
        oo;
      for (var i = 0; i < me.$children.length; i++) {
        found = me.$children[i].getValueByIndex(select.selectedIndex - 1);
        if (found == -1) {
          found = 0;
        } else {
          oo = me.$children[i].filterList[select.selectedIndex - 1];
          break;
        }
      }
      if (found) {
        value = found;
      } else if (me.$children.length) {
        select.selectedIndex = 0;
      }
      me.$emit("input", value, {
        value: value,
        select: select,
        option: select[select.selectedIndex],
        target: me,
        object: oo,
      });
    },
  },
};
</script>
<style>
.v-select-checkbox-group .v-checkbox{
  height: auto;
  margin-bottom: 5px;
}

.v-select-checkbox-group > div {
         
            background: linear-gradient(to bottom, #ffffff, #e0e0e0); /* Gradient from white to light gray */
            z-index: -1; /* Move it behind the content */
        }
.v-select-checkbox-group .checkmark{
margin: 3px;;
}

.v-select-checkbox-group{
  font-size: 20px;
}
</style>