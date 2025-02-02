<template>
<div class="v-group"><slot></slot></div>
</template>
<script>
export default {
    props: {
        required: String,
        name: String
    },
    data() {
        return {
            value: null,
			nam:null,
        }
    },
    updated() {
        this.update2();
    },
    mounted(){
        this.update2();
    },
    created() {
        if (!this.nam) {
            this.nam = (this.$props.name?this.$props.name:'input_' + window._.id());
        }
    },
    methods: {
        getInputs(el,l){
            var me=this;
            if(el.children)
                Array.from(el.children).forEach(e=>{
                    if(e.tagName=='INPUT')
                        l.push(e);
                    else if(!e.classList.contains('v-group'))
                        me.getInputs(e,l);
                });
            return l;
        },
		update2(){
            var rl = this.getInputs(this.$el,[]);
			for (var i = 0; i < rl.length; i++) {
				if (rl[i].value == this.$attrs.value) {
					rl[i].checked = true;
				}else{
					rl[i].checked = false;
				}
			}
		},
        onChange(v) {
            this.value = v;
            if (v === '')
                v = null;
            this.$emit('input', v);
        }
    }
}
</script>