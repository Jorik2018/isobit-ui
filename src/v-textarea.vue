<template>
	<textarea>{{value}}</textarea>
</template>
<script>
export default {
	name: 'VTextarea',
    props: {
        value: {
            type: String
        }
    },
    data() {
        return {};
    },
    template: '<textarea>{{value}}</textarea>',
    updated(){
        var me=this,v=me.value;
        if(v&&me.$el.maxLength>0&&v.length>me.$el.maxLength){
            v=v.substring(0,me.$el.maxLength);
        }
        me.$el.value=v;
        me.$emit('input', v);
        me.delayedResize();
    },
	methods:{
		resize(){
			var text = this.$el;
			text.style.height = 'auto';
			text.style.height = (text.scrollHeight
			//-(parseInt(text.style.paddingTop)+parseInt(text.style.paddingBottom))
			)+'px';
		},
		delayedResize () {
			var me=this;
			window.setTimeout(me.resize, 100);
		}
	},
    mounted() {
        var me = this;
        me.$el.addEventListener('keyup', () => {
            me.$emit('input', me.$el.value);
        });
		var text = me.$el;
		/* 0-timeout to get the already changed text */
		var observe;
		if (window.attachEvent) {
			observe = function (element, event, handler) {
				element.attachEvent('on'+event, handler);
			};
		}else{
			observe = function (element, event, handler) {
				element.addEventListener(event, handler, false);
			};
		}
		observe(text, 'change',  me.resize);
		observe(text, 'cut',     me.delayedResize);
		observe(text, 'paste',   me.delayedResize);
		observe(text, 'drop',    me.delayedResize);
		observe(text, 'keydown', me.delayedResize);
    }
}
</script>
<!-- <style>
	textarea {
		box-sizing: border-box;
		resize: none;
	}
</style> -->
