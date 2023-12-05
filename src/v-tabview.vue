<template>
	<div class="v-tabview" :style="{height:height+'px'}">

		<ul class="v-tab-nav">
			<li :class="{'v-selected': index==currentTabIndex }" 
            v-for="(tab,index) in tabs" :key="index" @click="currentTabIndex=index">
				{{tab.title}}
			</li>
		</ul>
		<slot></slot>
	</div>
</template>
<script>
export default {
       data() {
        return {
            tabs: [],height:0,
            currentTabIndex: 0,
            k:0,
        };
    },
    methods:{
        load(k){
            var event = new Event("command", {bubbles: false});
            event.name = 'refresh';
            event.target=this.$el;
            this.$el.children[1+this.currentTabIndex].dispatchEvent(event);
        },
        reset(){
            this.load((this.k++));
        }
    },
    watch: {
        currentTabIndex(v) {
            var me=this,t=me.$el.children[v+1],c=me.$children[v+1];
            if(t){
                //console.log('aviso al actual tab q esta seleccionado seltab=='+v);
                var event=new Event("tabChange", {bubbles: false});
                event.$target=me;
                t.dispatchEvent(event);
                me.$el.style.height=(me.height)+'px';
                event = new Event("parentResize", {bubbles: false});
                event.height = me.$el.offsetHeight-25;
                t.style.height=event.height+'px';
                setTimeout(()=>{
                    t.dispatchEvent(event);
                },2);
            }
        }
    },
    updated(){
        var el = this.$el;
        var cn = el.children;
        for (var j = 1; j < cn.length; j++) {

            if (cn[j].tagName) {
                if((j-1) === this.currentTabIndex){
                    cn[j].style.display='flex';
                    cn[j].style.flex='1';
                    cn[j].style.flexDirection='column';
                    //cn[j].style.height=(this.$el.offsetHeight-cn[0].offsetHeight)+'px';
                }
                if((j-1) === this.currentTabIndex){
                    cn[j].classList.remove('hide');
                }else{
                    cn[j].style.display='none';
                    cn[j].classList.add('hide');
                }
            }
            console.log(cn[j])
        }
    },
    mounted(){
        var me=this,t=me.$el.children;
        for(var j=1;j<t.length;j++){
            t[j].style.display='none';
            me.tabs.push({title:''+t[j].getAttribute('tab')});
        }
        me.$el.addEventListener("parentResize",(e) => {
            me.$el.style.height=(e.height+1)+'px';
            me.height=e.height+1;
            var event = new Event("parentResize", {bubbles: false});
            event.height = (me.$el.offsetHeight-25);
            event.target=me.$el;
            event.$target=me;
            for(var j=1;j<t.length;j++){
                if(t[j].style.display!='none'){
                    console.log('Se envia el alto '+event.height);
                    t[j].style.height=event.height+'px';
                    t[j].dispatchEvent(event);
                }
            }
            me.$emit('resize',event);
        });
        t[1+me.currentTabIndex].setAttribute('active',1);
        var event=new Event("tabChange", {bubbles: false});
        event.$target=me;
        t[1+me.currentTabIndex].dispatchEvent(event);
    }
}
</script>
