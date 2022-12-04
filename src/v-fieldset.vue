<template>
	<fieldset class="v-fieldset"><legend v-if="legend" 
		v-on:click="closed=closable&&!closed" v-bind:style="{cursor:(closable?'pointer':'')}" >
		<span v-if="closable" v-bind:data-icon="closed?'plus':'minus'" style="margin:0px 5px 0px 0px">
		<i v-bind:class="closed?'fa-plus':'fa-minus'" class="fa"></i></span>
		<span v-html="legend"></span></legend><div v-show="!closed"><slot></slot></div>
	</fieldset>
</template>
<script>
export default {
    props: {
        legend: String,
		closable: null
    },
	watch:{
		closed(c){
			this.$emit('change',{target:this,closed:c})
			this.$emit('input',!c)
		}
	},
	data(){
		return {closed:false}
	},
	created(){this.closed=this.closable;},
	updated(){
		var me=this;
		setTimeout(function(){
			var svg=me.$el.querySelector('legend > * > svg');
			if(svg){
				try{
					console.log();
				svg.dataset.icon = svg.parentNode.dataset.icon;
				}catch(e){console.log('icon');console.log(e);}
			}
		}, 50);
	}
}
</script>
