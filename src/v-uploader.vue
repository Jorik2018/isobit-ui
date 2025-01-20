<template>
	<div v-on:click="other" v-bind:class="onlyicon?'':'v-button ui-widget ui-state-default ui-corner-all'" class="v-uploader" 
		v-bind:style="{padding:(onlyicon?'0px':'')}">
		<label style="cursor:pointer" class="">
			<input v-if="!click" type="file" v-on:change="handleFileUpload()"/>
			<i class="fa" v-bind:data-icon="icon" v-bind:class="icon?icon:'fa-upload'" v-bind:style="{marginRight:(onlyicon||value=='')?'':'10px'}"></i>{{!onlyicon?(value!=null?value:'Adjuntar Archivo'):''}}
			<progress v-if="showProgress" max="100" style="width:100%"  v-bind:value.prop="uploadPercentage"></progress>
		</label>
	</div>
</template>
<script>
export default {
    name: 'VUploader',
    props: {
        value: String,
        onlyicon:Boolean,
		click:null,
        icon:String,
		domain:String
    },
	mounted(){
		var me=this;
		setTimeout(function(){
			me.$el.querySelector('svg').dataset.icon='image'; }, 1000);
	},
	updated(){
		var me=this;
		setTimeout(function(){me.$el.querySelector('svg').dataset.icon='image'; }, 1000);
	},
    data() {
        return {
            uploadPercentage: 0,
            showProgress: false
        }
    },
    methods: {
		other(){
			if(this.click)this.click(this);
		},
        handleFileUpload() {
            this.uploadPercentage = 0;
            this.submitFile(this.$el.children[0].children[0].files[0])
        },
        submitFile(f,name) {
            var me = this;
            /*let*/ var formData = new FormData();
			name=name?name:f.name.replace(/[^\w\s.]/gi, '');
            formData.append('filename', name);
			formData.append('file', f, name);
            me.showProgress = true;
            axios.post((me.domain?me.domain:'')+'/api/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: function (progressEvent) {
                    this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                }.bind(this)
            }).then(function (r) {
                me.$emit('input', r.data);
                me.showProgress = false;
            }).catch(function () {
                console.log('FAILURE!!');
            });
        }
    }
}
</script>
