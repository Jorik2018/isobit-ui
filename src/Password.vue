<template>
  <div class="hello">
	<v-table 
		v-bind:selectable="true"
		v-bind:scrollable="true"
		src="https://web.regionancash.gob.pe/admin/project/api/project" 
		rowkey="id"
		row-style-class="row.scheduledAdvance>row.physicalAdvance?'red':(row.physicalAdvance==100?'green':'')"
		v-bind:pagination="20">
		<template v-slot="{row}">
			<td width="100" label="ESTADO PROCESO" >
				<v-filter>
					<input v-model="filters.estatusSeace"/>
				</v-filter>
				{{row.estatusSeace}}
			</td>
		</template>
	</v-table>
	<div v-on:click="takePhoto">booo</div>
	<img src="" id="cordova">
  </div>
</template>
<script>
import { Capacitor, Plugins, CameraResultType, FilesystemDirectory } from '@capacitor/core';

const { Camera, Filesystem } = Plugins;

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods:{
	msgBox:async function(o){
		await Plugins.Modals.alert(o);
	},
	async takePhoto() {
		//https://www.joshmorony.com/using-the-capacitor-filesystem-api-to-store-photos/
		const originalPhoto = await Camera.getPhoto({resultType: CameraResultType.Uri});
		const photoInTempStorage = await Filesystem.readFile({ path: originalPhoto.path });
		let date = new Date(),
		time = date.getTime(),
		fileName = time + ".jpeg";
		await Filesystem.writeFile({
			data: photoInTempStorage.data,
			path: fileName,
			directory: FilesystemDirectory.Data
		});
		const finalPhotoUri = await Filesystem.getUri({
			directory: FilesystemDirectory.Data,
			path: fileName
		});
		let photoPath = Capacitor.convertFileSrc(finalPhotoUri.uri);
		
		
		
		
		document.getElementById('cordova').src = photoPath;
	},
	async sho(){
	/*
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
	
    console.log('file system open: ' + fs.name);
    fs.root.getFile('bot.png', { create: true, exclusive: false }, function (fileEntry) {
        console.log('fileEntry is file? ' + fileEntry.isFile.toString());
        var oReq = new XMLHttpRequest();
        // Make sure you add the domain name to the Content-Security-Policy <meta> element.
		//http://web.regionancash.gob.pe/admin/seguimientometa/api/gantt/download?format=pdf
        oReq.open("GET", "http://cordova.apache.org/static/img/cordova_bot.png", true);
        // Define how you want the XHR data to come back
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var blob = oReq.response; // Note: not oReq.responseText
            if (blob) {
                // Create a URL based on the blob, and set an <img> tag's src to it.
                var url = window.URL.createObjectURL(blob);
                document.getElementById('cordova').src = url;
                // Or read the data with a FileReader
                var reader = new FileReader();
                reader.addEventListener("loadend", function() {
                   // reader.result contains the contents of blob as text
                });
                reader.readAsText(blob);
            } else console.error('we didnt get an XHR response!');
        };
        oReq.send(null);
    }, function (err) { console.error('error getting file! ' + err); });
}, function (err) { console.error('error getting persistent fs! ' + err); });
	*/
	
		this.msgBox({
			title: 'Alert2',
			message: 'This is an example alert box'
		});
	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
</style>
