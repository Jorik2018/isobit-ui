
<template>
	<div class="v-ol-overlay">
		<div v-if="header" class="v-panel-titlebar">
			<span class="v-icon v-icon-close" v-on:click="close">
			<i class="fa fa-times"></i></span>{{header}}
		</div>
		<div class="v-ol-body" v-bind:key="'c-'+c" style="padding:10px">
			<slot v-if="value" v-bind:value="value"></slot>
		</div>
		<footer v-bind:key="'f-'+c" v-if="hasSlot('footer')&&value">
			<slot name="footer" v-bind:value="value"></slot>
		</footer>
		<div v-if="coordinate" style="text-align: center">
			<img src="@/cdn/images/triangle-down.svg" width="20" height="18"/></div>
	</div>
</template>
<script>
var ol=window.ol;
var _=window._;
var axios=window.axios;

export default {
	name: 'VOverlay',
        props: {
        value: {
            value: Object
        },
        src: String,
        width:{
            default:400
        },
        header: String
    },
    data(){return {coordinate:null,overlay:null,location:null,ele:null,c:0};},
    created() {
        var me = this;
        me.$parent.$on('beforeBuild',(m) => {
            console.log(m);
            me.overlay=new ol.Overlay({
                element:me.$el,
                positioning: 'bottom-right'
            });
        });
        me.$parent.$on('build',(m) => {
            m.map.addOverlay(me.overlay);
        });
    },
    mounted(){
        var me=this;
        if(me.header){
            var title = me.$el.childNodes[0];
            
            title.addEventListener('mousedown',function(evt){
                const wi=me.$el.parentElement;
                // Record where the window started
                var real = window.getComputedStyle(wi),
                winX = parseFloat(real.left),
                winY = parseFloat(real.top);
                // Record where the mouse started
                var mX = evt.clientX,
                mY = evt.clientY;
                // When moving anywhere on the page, drag the window
                // …until the mouse button comes up
                var pm=wi.parentElement;
                pm.addEventListener('mousemove',drag,false);
                pm.addEventListener('mouseup',function(){
                    pm.removeEventListener('mousemove',drag,false);
                },false);
                // Every time the mouse moves, we do the following 
                function drag(evt){
                    // Add difference between where the mouse is now
                    // versus where it was last to the original positions
                    wi.style.left = winX + evt.clientX-mX + 'px';
                    wi.style.top  = winY + evt.clientY-mY + 'px';
                }
            },false);

        }
    },
    methods:{
        close(){
            if(this.overlay)
            this.overlay.setPosition();
        },
        hasSlot (name = 'default') {
            return !!this.$slots[ name ] || !!this.$scopedSlots[ name ];
        },
        load(){
            var me=this;
            axios.get(_.remoteServer+me.src).then((r)=>{
                me.$emit('input', r.data);
                //me.$forceUpdate();
            });
        },
        open(evt){
		
            var me=this;
            var map=evt.map;
            var f=evt.feature;
            var overlay=me.overlay;
            var tp = overlay.element;
            var ch=me.$parent.$children;
            for(var k=0;k<ch.length;k++){
                if(ch[k].close){
                    ch[k].$el.style.opacity=0;
                    ch[k].close();
                }
            }
			if(evt.coordinate)
				me.coordinate=evt.coordinate;
			else{
				evt.coordinate=map.getView().getCenter();
				me.coordinate=null;
			}
            overlay.setPosition(evt.coordinate);
            var center = map.getView().getCenter();
            var resolution = map.getView().getResolution();
            var co=f?f.getGeometry().getCoordinates():[null];
            var pixel = map.getPixelFromCoordinate(Number(co[0])?co:evt.coordinate);
			if(this.src){
				axios.get(_.remoteServer+this.src).then((r)=>{
					me.$emit('input', r.data);
					me.c++;
					setTimeout(function () {
						var mw = map.viewport_.offsetWidth;
						var mvh = map.viewport_.offsetHeight;
						var body=tp.children[0].children[1];
						body.scrollTop=0;
						var he = tp.offsetHeight;    
						if (he + 100 >= mvh) {
							body.style.height=(mvh - 100 - tp.children[0].children[0].offsetHeight)+'px';
						} else {
							body.style.height='300px';
						}
						he = tp.offsetHeight;
						var ww=1*me.width;
						var nw = (mw <= (ww+40)) ? mw - 40 : ww;
						tp.style.zIndex=10;    
						tp.style.width=nw+'px';
						nw = nw / 2;
						map.getView().animate({
							center: [
								center[0] + (
										pixel[0] + nw + 20 >= mw ? +(pixel[0] + nw + 20 - mw)
										:
										(pixel[0] - 20 - nw < 0 ? (-nw + pixel[0] - 20) : 0)
										) * resolution,
								center[1] + (pixel[1] < he ? he - pixel[1] : 0) * resolution
							],
							duration: 500
						});
						//se desplaza el overlay
						pixel[0] = pixel[0] + nw - 0;
						pixel[1] = pixel[1] - 12;
						overlay.setPosition(map.getCoordinateFromPixel(pixel));
						me.$el.style.opacity=1;
						if(_.mobil){
							var a=overlay.getElement().querySelectorAll('a:not(._)');
							for(var k=0;k<a.length;k++){
								a[k].addEventListener("click", _.open2);
							}
						}
					}, 400);
				}).catch((e)=>{console.log(e)});
			}else{
				var mw = map.viewport_.offsetWidth;
				var mvh = map.viewport_.offsetHeight;
				var body=tp.children[0].children[1];
				//To show the overlay content from top
				body.scrollTop=0;
				var he = tp.offsetHeight;
				console.log(tp.offsetHeight);
                //console.log(tp);
				//If the height is greater than viewport height 
				if (he + 100 >= mvh) {
					body.style.height=(mvh - 100 - tp.children[0].children[0].offsetHeight)+'px';
				} else {
					body.style.height='300px';
				}

				he = tp.offsetHeight;
				var ww=1*me.width;
				var nw = (mw <= (ww+40)) ? mw - 40 : ww;
				tp.style.zIndex=10;    
				tp.style.width=nw+'px';
				nw = nw / 2;
				map.getView().animate({
					center: [
						center[0] + (
								pixel[0] + nw + 20 >= mw ? +(pixel[0] + nw + 20 - mw)
								:
								(pixel[0] - 20 - nw < 0 ? (-nw + pixel[0] - 20) : 0)
								) * resolution,
						center[1] + (pixel[1] < he ? he - pixel[1] : 0) * resolution
					],
					duration: 500
				});
				//se desplaza el overlay
				pixel[0] = pixel[0] + nw - 0;
				pixel[1] = pixel[1] - 12;
				overlay.setPosition(map.getCoordinateFromPixel(pixel));
me.$el.parentNode.style.opacity=0;
				me.$el.style.opacity=1;
                me.$el.parentNode.style.top=(mvh-me.$el.offsetHeight)/2+'px';
                me.$el.parentNode.style.opacity=1;
				if(_.mobil){
					var a=overlay.getElement().querySelectorAll('a:not(._)');
					for(k=0;k<a.length;k++){
						a[k].addEventListener("click", _.open2);
					}
				}
				me.$emit('opened',{target:me});
			}
        }
    }
}
</script>
<!-- <style>
	.v-ol-overlay > .v-panel-titlebar{
		padding:10px;
	}
	.v-icon-close{
		cursor:pointer;
	}
</style> -->