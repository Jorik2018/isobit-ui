<template>
	<div>
 <img v-if="can('admin/desarrollo-social/covid')" width="100%" src="@/fs/images/covid-new.jpg" />
<a v-if="can('admin/desarrollo-social/covid')" style="border: 1px solid rgb(220 178 125);
    display: block;
    padding: 10px;
    font-size: 150%;
    border-radius: 5px;
    background-color: #ffff99;
    margin: 10px;" href="/admin/desarrollo-social/covid"><i class="fa fa-virus"></i>Consulta COVID</a>
		</div>			
</template>
<script>
	export default window._.ui({
		mounted() {
			var app=window.app;
			app.title='Administracion';
			app.bindLinks(this.$el);
		},
		methods:{
			can(v){
				var me=this;
				return me.user.uid==1||me.perms[v];
			}
		}
	})
</script>
<style scoped>
	#dateDiff:empty,#msg:empty{
            display:none;
        }
        #dateDiff{
            border-radius:4px;background-color:#fdfad9;border:1px solid #dddddd;padding:5px 10px;margin-top:10px;
        }
        #msg{
            border-radius:4px;background-color:#ffd2d2;border:1px solid #dddddd;padding:5px 10px;margin-top:10px;
        }
        .i-coords{
            display:none !important;
        }
        #gallery > img{
            border:3px solid #61ff5f;
            max-width:100%;
        }
        #gallery > .synced{
            border:3px solid #dddddd !important;
        }
        #gallery{
            margin-bottom:18px;
        }
</style>