<template>
  <div class="ui-panel">
    <div v-if="header" class="v-widget-header v-panel-titlebar">
      <span class="v-panel-title">{{ header }}</span>
    </div>
    <div class="v-dialog-content v-widget-content">
      <form v-bind:action="action"><slot></slot></form>
    </div>
  </div>
</template>
<script>
export default {
  props: ["header", "store", "action"],
  watch: {
    header(v) {
      this.setTitle(v);
    },
  },
  methods: {
    setTitle(v) {
      var me = this;
      if (me.$parent.app) {
        //console.log(window.app);
        setTimeout(function () {
          //console.log(v);
          window.app.title = v;
        }, 100);
      }
    },
    getAbsoluteHeight(el) {
      var styles = window.getComputedStyle(el);
      var margin =
        parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);

      return Math.ceil(el.offsetHeight + margin);
    },
    resize(e) {
      var me = this,
        el = me.$el,
        h = e.height;
      el.style.height = h + "px";
      //si tiene header
      if (el.children[1]) {
        //se obtiene el alto del headr
        h = h - el.children[0].offsetHeight;

        el.children[1].style.height = h + "px";
        el.children[1].style.overflowY = "auto";

        //obtien el form
        el = el.children[1].children[0];
        el.style.height = h + "px";
if(el.children){
el.parentNode.style.overflowY='hidden';
el.parentNode.style.overflow='hidden';
}
        var el2; //,style2;

        [].forEach.call(el.children, (ee, i) => {
          if (
            (i == el.children.length - 1 && ee.tagName == "CENTER") ||
            (!ee.classList.contains("v-scrollable") &&
              !ee.classList.contains("v-form") &&
              !ee.classList.contains("v-resize"))
          ) {
            h -= me.getAbsoluteHeight(ee);
          } else if (!el2) {
            el2 = ee;
          }
        });
        el = el2;
        //          console.log(el);
        //Se espera el sea una tabla
      } else {
        el = el.children[0];
        el.style.height = h + "px";
      }
      if(el){
        el.style.overflowY = "auto";
        el.style.height = h + "px";
        var event = new Event("parentResize", { bubbles: true });
        event.height = h;
        //console.log(el.children[0]);
        
        el.children[0].dispatchEvent(event);
        event.$target=me;
        me.$emit("resize",event);
      }
    },
  },
  mounted() {
    var me = this,
      f = me.$el.querySelector("form");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      var p = me.$parent;
      if (p.refresh) p.refresh();
      return false;
    });
    me.$el.addEventListener("parentResize", (e) => {
      if (e.target == me.$el) me.resize(e);
    });
    me.setTitle(me.header);
  },
  updated() {
    var me = this;
    var t = me.$el.querySelectorAll("[type=number]:not(._)");
    var i = 0;
    for (; i < t.length; i++) {
      var fn = () => {
        var m = this;
        var v = m.value;
        if (v) {
          v = n(v);
          if (m.max && v > n(m.max)) {
            v = n(m.max);
          }
          if (m.min && v < n(m.min)) {
            v = n(m.min);
          }
          var de = this.getAttribute("decimal");
          if (de !== null) {
            v = v.toFixed(1 * de);
          }
          m.value = v;
        }
      };
      t[i].oninput = fn;
      t[i].onblur = fn;
      if (t[i].classList) t[i].classList.add("_");
      else t[i].className = "_";
    }
    var t = me.$el.querySelectorAll(".numeric:not(._)");
    for (i = 0; i < t.length; i++) {
      t[i].addEventListener("keyup", (e) => {
        //e => {
        if (e.keyCode == 86) {
          if (isNaN(this.value)) {
            this.value = "";
          }
        }
      });
      t[i].addEventListener("keydown", (e) => {
        //e => {
        // Allow: backspace, delete, tab, escape, enter and .
        console.log("eeeeeee" + e.keyCode);

        //86 es pegar y 88 cortar se debe asegurar q al pegar sea un numero
        if (
          [46, 8, 9, 27, 13, 110, 88, 86].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Command+A
          (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
          // Allow: home, end, left, right, down, up
          (e.keyCode >= 35 && e.keyCode <= 40)
        ) {
          return;
        }
        // Ensure that it is a number and stop the keypress
        if (
          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105)
        ) {
          e.preventDefault();
        }
      });
      if (t[i].classList) t[i].classList.add("_");
      else t[i].className = "_";
    }
    var f = function (ev) {
      var e = this;
      var previousElementSibling = e.previousElementSibling;
      if (
        previousElementSibling &&
        previousElementSibling.classList &&
        previousElementSibling.classList.contains("v-error")
      ) {
        previousElementSibling.parentNode.removeChild(previousElementSibling);
      }
      if (
        !(e.disabled || e.getAttribute("disabled")) &&
        (e.required || e.tagName === "DIV")
      ) {
        if (
          (e.tagName != "DIV" && !e.value) /*||e.value == 0*/ ||
          (e.tagName === "DIV" && !e.attributes.value)
        ) {
          previousElementSibling = e.previousElementSibling;
          while (
            previousElementSibling &&
            previousElementSibling.nodeType != 1
          ) {
            previousElementSibling =
              previousElementSibling.previousElementSibling;
          }
          if (!previousElementSibling) {
            previousElementSibling = e.parentElement.previousElementSibling;
            while (
              previousElementSibling &&
              previousElementSibling.nodeType != 1
            ) {
              previousElementSibling =
                previousElementSibling.previousElementSibling;
            }
          }
          var error = document.createElement("div");
          error.innerHTML = "Este campo es requerido!";
          error.classList.add("v-error");
          e.parentNode.insertBefore(error, e);
        }
      }
    };
    me.$el
      .querySelectorAll(
        "select,input[type=date]:not(.__),input[type=text]:not(.__),textarea:not(.__)"
      )
      .forEach((e) => {
        e.addEventListener("focusout", f);
        if (e.classList) e.classList.add("__");
        else e.className = "__";
      });
    //resize();
  },
};
</script>
