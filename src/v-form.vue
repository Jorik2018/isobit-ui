<script>
import { h, inject, provide,ref} from 'vue'
export default {
  name: 'VForm',
  props: ["header", "store", "action"],
  setup(props, cxt) {
    const { store } = props;
    const { slots, expose } = cxt;
    const formRef = ref(null);
    const viewCollector = inject('viewCollector');
    const formCollector = {
      get: () => ({ ...props })
    };
    provide('formCollector', formCollector)

    viewCollector.push({
      store,
      type: 'v-form',
      $el:formRef,
      $forceUpdate:()=>{}
    });
    expose({ ...props })
    return () => {
      const children = [];

      if (props.header) {
        children.push(
          h('div', { class: 'v-widget-header v-panel-titlebar' }, [
            h('span', { class: 'v-panel-title' }, props.header)
          ])
        );
      }
      children.push(
        h('div', { ref: formRef, class: 'v-dialog-content v-widget-content' }, [
          h('form', { action: props.action }, slots.default())
        ])
      );
      return h('div', { class: 'ui-panel' }, children);
    }
  },
  watch: {
    header(v) {
      this.setTitle(v);
    },
  },
  data() { return { timer: null } },
  methods: {
    setTitle(v) {
      var me = this, app = me.$parent.app;
      if (app) {
        setTimeout(() => { app.title = v; }, 100);
      }
    },
    getAbsoluteHeight(el) {
      var styles = window.getComputedStyle(el);
      var margin =
        parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);

      return Math.ceil(el.offsetHeight + margin);
    }
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
  },
};
</script>
