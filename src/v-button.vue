<template>
	<button type="button" class="_ ui-widget ui-state-default ui-corner-all v-button"/>
</template>
<script>
export default {
    name: 'VButton',
    mounted() {
		var me = this;
        var span = document.createElement("span");
        var fa = document.createElement("i");
        span.className = "ui-button-text ui-c ";
        span.innerHTML = me.$attrs.value?me.$attrs.value:'ui-button';
        //me.$el.appendChild(span);
        me.$el.addEventListener('click',(event)=>{
            event.component=me;
            //me.$emit('click', event);
        });
        if (me.$attrs.icon) {
            if (!me.$attrs.value)
                me.$el.classList.add("v-button-icon-only");
            else
                me.$el.classList.add("v-button-text-icon-left");
            /*span = document.createElement("span");
            span.className = "ui-button-icon-left ui-icon ui-c " + me.$attrs.icon;*/
			fa.dataset.icon=me.$attrs.icon;
			fa.className = "fa " + me.$attrs.icon;
            //me.$el.appendChild(span);
            me.$el.appendChild(fa);
        } else {
            span = document.createElement("span");
            me.$el.classList.add("ui-button-text-only");
            me.$el.appendChild(span);
        }
		if(me.$attrs.value){
            span = document.createElement("span");
            span.appendChild(document.createTextNode(me.$attrs.value))
            me.$el.appendChild(span);
        }
		//span.innerHTML = me.$attrs.value?me.$attrs.value:'ui-button';
		me.updateIcon();
    },
	methods:{updateIcon(){var me=this;setTimeout(function(){var svg=me.$el.querySelector('svg');if(svg){var d=svg.dataset;if(!d.icon)d.icon=me.$attrs.icon; }}, 1000);}}
};
</script>

