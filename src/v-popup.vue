<template>
    <div class="v-popup" v-show="show" style="position:absolute;"><slot></slot></div>
</template>
<script>
export default {
	name: 'VPopup',
    data(){return {show:null,overlay:null}},
	mounted(){
		var me=this;
		me.$el.addEventListener("close", function () {
			me.hide();
		});
	},
	destroyed(){
		var overlay=this.overlay;
		if(overlay){
			overlay.style.visibility = "hidden";
			overlay.style.opacity = 0;
			overlay.remove();
			overlay=null;
		}
	},
	methods:{
		hide(){
			var overlay=this.overlay;
			if(overlay){
				overlay.style.visibility = "hidden";
				overlay.style.opacity = 0;
			}
			this.show=0;
		},
		toggle(){
			var me=this;
			me.show=!me.show;
			var overlay=me.overlay;
			if((me.show)){
				var h=document.querySelector('.v-layout-north');
				me.$el.style.top=h.offsetHeight+'px';
				console.log(me.$el);
				if (!overlay) {
					overlay = document.createElement("div");
					overlay.classList.add("v-overlay");
					overlay.style.padding = "40px";
					overlay.addEventListener("click", function () {
						overlay.style.visibility = "hidden";
						overlay.style.opacity = 0;
						me.show=false;
					});
					document.body.appendChild(me.overlay=overlay);
				}
				overlay.style.visibility = "unset";
				overlay.style.opacity = "unset";
			} else{
				this.hide();
			}
		}
	}
};
</script>