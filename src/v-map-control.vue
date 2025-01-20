<template>
    <div v-show="ready&&visible0" class="ol-unselectable ol-control">
		<slot></slot>
		<button v-if="!slotUsed" class="v-map-control-button" v-on:click.prevent="enter">
			<i v-if="icon" class="fa fa-xs" v-bind:class="icon"></i>
		</button>
	</div>
</template>
<script>
export default {
    name: 'VMapControl',
	props: {
        icon: String,
		visible:{
			default: 1
		},
    },
    computed: {
        slotPassed() {
            return !!this.$slots.default;
        }
    },
    data(){return {ready:null,visible0:null,slotUsed:false}},
	updated(){
		var l=this.$el.querySelectorAll(":scope > :not(.v-map-control-button)").length;
		if(l==0)l=this.$el.textContent.trim().length;
		this.slotUsed=l;
		//console.log(this.$slots);
	},
	created(){this.visible0=!!this.visible;},
    mounted(){
        let me = this,ol=window.ol;;
		me.slotUsed=!!this.$slots.default;
		//onsole.log('slotUsed='+me.slotUsed);
        if(me.$parent.map){
            me.$parent.map.addControl(new ol.control.Control({element:me.$el}));
            me.ready=true;
        }else
            me.$parent.$on('build', (e)=> {
                e.map.addControl(new ol.control.Control({element:me.$el}));
                me.ready=true;
            });
			/*
			var me = this;
		this.svg=!(this.icon&&this.icon.startsWith('fa-'));
        me.$parent.$on('build', function (m) {
            m.addControl(new ol.control.Control({element:me.$el}));
            me.ready=true;
        });
			*/
    },
    methods:{
        enter(e){
            if(e.x)this.$emit('click',e);
        },
		toggle(){
			this.visible0=!!!this.visible0;
		}
    }
};
</script>

