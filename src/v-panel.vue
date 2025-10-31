<template>
	<div class="ui-panel"><div v-if="header" class="v-panel-titlebar v-widget-header ui-helper-clearfix ui-corner-all"><span class="v-panel-title">{{header}}</span>
	</div><div class="v-panel-content v-dialog-content v-widget-content"><slot></slot></div></div>
</template>
<script>
export default {
	name: 'VPanel',
	props: {
        header: String
    },
}
</script>
