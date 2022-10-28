<template>
	<div style="min-height: calc(100% - 40px);
    padding: 20px;
    background-color: rgb(15, 98, 172);">
	<div class="inner" style="max-width:400px;margin:2px auto;">
		<div>
			<div class="x-simple-header">
				<img height="80" class="ui-banner-login" src="@/fs/images/logo2018.png">                
			</div>
			<div>
			<form id="LoginForm">
			<div style="padding: .5em 1em;" class="v-form">
			<div class="title center">Inicio de Sesi&oacute;n</div>
			<label for="name">Nombre de Usuario:</label>{{o.name}}
			<input class="form-control center" type="text" v-model="o.name" required />fff
			<ion-item>
				<ion-label position="floating">Floating Label</ion-label>
				<ion-input v-model="o.name" ></ion-input>
			  </ion-item>
			<label for="pass">Contrase&ntilde;a:</label>
			<input class="form-control center" type="password" v-model="o.pass" minlength="6" required />
			</div>
			<v-button value="Iniciar Sesión" v-on:click.prevent="login" v-bind:disabled="!o.pass||!o.name"></v-button>
			<div class=center style="margin: 30px 0px;">
			<a class="v-primary-dark" style="
			display: inline-block;
			width: auto;max-width: calc(100% - 120px) !important;
			padding: 5px 40px;
			text-decoration: none;
			border-radius: 10px;
			margin-bottom: 10px;" href="register.html"><i class="fa fa-star"></i>Crear Cuenta</a>
			<a class="v-primary-dark" style="
			display: inline-block;
			width: auto;max-width: calc(100% - 120px) !important;
			padding: 5px 40px;
			text-decoration: none;
			border-radius: 10px;
			margin-bottom: 10px;" href="password.html"><i class="fa fa-exclamation-triangle"></i>&iquest;Olvido su Contrase&ntilde;a?</a>
			</div>
			</form>
			</div>
			<div class="subtitle center">
			Unidad de Tecnolog&iacute;as de Informaci&oacute;n - UTI
			</div>
		</div>
		<div style="border-radius: 10px;z-index:-1;top:0px;position: absolute; opacity: 0.85; width: 100%; background-color: white; height: 100%"></div>
	</div>
</div>
</template>
<script>
	var axios=window.axios;
	var _=window._;
	export default {
		name: 'HelloWorld',
		data:function(){return {o:{}}},
		methods:{
			success(d){
				if(d.user){
					console.log(JSON.stringify(d));
					try{
						if(d.id){
							d.name=d.id;
						}else if(d.uid)d.name=-d.uid;
						d.datetime=new Date().getTime();
						if(!d.ext)d.ext={};
						var v=d.ext.perms;
						delete d.ext.perms;
						var p={};
						console.log(v);
						if(v)
							for(var i=0;v.length>i;i++){
								p[v[i]]=1;
							}
						d.perms=p;
						window.app.session=d;
						localStorage.setItem('session', JSON.stringify(d));
						this.$router.push('/admin');
					}catch(e){console.log(e)}
				}else{
					_.MsgBox('El usuario o la contrase&ntilde;a no son reconocidas por el servidor.');
				}
			},
			/*
			,{
					
    headers1: {
      Authorization: 'Bearer accessToke'
    },
    withCredentials2: true,
header2: {
  "Content-Type": "application/json",
  'Access-Control-Allow-Origin': '*',
  }
}*/
			login(){
				var me=this;
				if (this.validate(this.$el)) {
					axios.error = function (e) {
						if(e.response.status==404){
							_.MsgBox('Cuenta valida no encontrada.');
							return false;
						}
					};
					axios.post('/api/login',JSON.parse(JSON.stringify(this.o)))
					.then(response => {
						me.success(response.data);
					}).catch(function(e){
						console.log(e);
					});
				}
			}
		}
	,		extends:{
		methods:{validate:function() {
                var me = this;
                var ok = true;
                var input = me.$el.querySelectorAll("input,select,textarea,div[required=required]");
                var radio = {};

                for (i = 0; input.length > i; i++) {
                    var e = input[i];
                    if (e.type === 'radio') {
                        var oo = radio[e.name];
                        if (!oo)
                            radio[e.name] = (oo = []);
                        oo.push(e);
                        continue;
                    }
                    var previousSibling = e.previousSibling;
                    if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                        previousSibling.parentNode.removeChild(previousSibling);
                    }
//                    console.log('id='+e.id);
//                    console.log('disabled='+e.getAttribute('disabled'));
                    
                    if (!(e.disabled||e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
                        if (e.value == 0 || (e.tagName === 'DIV' && !e.attributes.value)) {
                            previousSibling = e.previousSibling;
                            while (previousSibling && previousSibling.nodeType != 1) {
                                previousSibling = previousSibling.previousSibling;
                            }
                            if (!previousSibling) {
                                previousSibling = e.parentElement.previousSibling;
                                while (previousSibling && previousSibling.nodeType != 1) {
                                    previousSibling = previousSibling.previousSibling;
                                }
                            }
                            var error = document.createElement("div");
                            error.innerHTML = "Este campo es requerido!";
                            ok = false;
                            error.classList.add("v-error");
                            e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                for (var r in radio) {
                    if (Object.prototype.hasOwnProperty.call(radio, r)) {
                        var op = radio[r];
                        var checked = false;
                        var required = false;
                        for (var i = 0; i < op.length; i++) {
                            if (op[i].required && !op[i].disabled)
                                required = true;
                            if (op[i].checked)
                                checked = true;
                        }
                        e = op[0].parentNode.parentNode;
                        previousSibling = e.previousSibling;
                        if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                            previousSibling.parentNode.removeChild(previousSibling);
                        }
                        if (required && !checked) {
                            me.showerror(e);
                            /*previousSibling = e.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             if(!previousSibling){
                             previousSibling=e.parentElement.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             }
                             var error = document.createElement("div"); 
                             error.innerHTML = "Este campo es requerido!";*/
                            ok = false;
                            //error.classList.add("v-error");
                            //e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                return ok;
            }}
		
		}
	}
</script>
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
@media(max-width:400px){
	.v-primary-dark{
	width: calc(100% - 120px) !important;
	}
	}
	.v-primary-dark i{
	margin-right:10px;
	}
	body{
		padding:20px;
		background-image: linear-gradient(#007bff, #000000);
	}
	html {
		height: 100%;
	}
	body {
		--height: 100%;
		min-height: calc(100% - 40px);
		margin: 0;
		background-repeat: no-repeat;
		background-attachment: fixed;
	}
	input[type='submit'],label,a {
		width: 100%;
	}
	.title {
		font-size: 30px !important;
		margin-bottom: 10px;
	}
	a{
	display:block;
	text-align: center;
	}
	a:hover{
	color:white;
	}
	.v-button {
		width: 100%;
		background: none !important;
		border: none !important;
		background-color: #d82f4b !important;
		border-color: #d82f4b !important;
		padding: 3px;
		color: white;
		font-weight: normal !important;
		padding: .3em 1em;
		margin: 10px 20px;
		width: calc(100% - 40px);
		border-radius: 10px;
	}
	div, li, span, label, .ui-outputlabel, a, ui-link {
		font-family: PTSans !important;
		-font-size: 16px;
	}
	.ui-widget ,.v-button{
		font-family: PTSans !important;
		font-size: 16px !important;
	}
	.inner {
		--height: 100%;
		border: 1px solid #ececec;
		border-radius: 10px;
		position: relative;
		background-color: white;
	}
	.x-simple-header {
		padding: 10px 0px;
		background-color: white;
		max-height: 120px !important;
		display: inline-block;
		width: calc(100% - 0px);
		text-align: left;
		position: relative;
		border-radius: 10px 10px 0px 0px;
		border-bottom: 1px solid #d2cccc;
		padding-top: 18px;
		background-color: #0f62ac;
		text-align: center;
	}
	label {
		display: inline-block;
		margin-bottom: 0px;
		font-size: 20px;
	}
	.subtitle {
		padding: 5px;
		padding-top: 10px;
		border-top: 1px solid #d2cccc;
		font-size: 14px;
		color: #d82f4b;
		margin: 0px 20px 12px 20px;
	}
</style>
