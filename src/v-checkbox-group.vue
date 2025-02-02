<template>
<div><slot></slot></div>
</template>
<script>
export default {
props: {
        required: String,
        name: String
    },
    data() {
        return {
            value: [],options:[],nam:null
        }
    },
    created() {
        if (!this.nam) {
            this.nam = (this.$props.name?this.$props.name:'input_' + _.id());
        }
		this.update2();
		
    },
    
    updated() {
		this.update2();
    },
    mounted(){
        this.options= this.$el.querySelectorAll('input:not(.v-chk)');
        for (var i = 0; i < this.options.length; i++) {
            this.options[i].classList.add("v-chk");
        }
        this.update2();
    },
    methods: {
		update2(){
			var me=this;
			var rl = me.options;
			var va = me.$attrs.value;
			if((typeof va)=='string')va=va.split('|');
			for (var i = 0; i < rl.length; i++){
				rl[i].checked = false;
				for (var j = 0; va&&j < va.length; j++){
					if (rl[i].value == va[j]){
						rl[i].checked = true;
					}
				}
			}
		},
        onChange:function(v, c) {
            var me = this;
			var va=me.$attrs.value;
			if(typeof va === 'string' || va instanceof String){
				va=va.split('|');
			}
            if (c) {
                if (!va){
                    me.$attrs.value = (va=[])
				}
                va.push(v);
            } else {
				//console.log('buscar '+v+' en '+JSON.stringify(va));
				var ii=va.indexOf(v);
				if(ii>-1)va.splice(ii, 1);
				//console.log(va);
            }
            me.$emit('input', va);
        }
    }    
}
</script>