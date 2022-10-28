<template>
	<div><slot></slot></div>
</template>
<script>
export default {
    mounted() {
        var m = this;
        //_.loadCSS('/cdn/ol.css');
        //_.loadScript('/cdn/ol.js',(r) => {
            m.$emit('beforeBuild');
            m.build();
        //});
    },
    data() {
        return {moved:false,map: null,movingCompleted:null, collection: null, styleMap: null, coordinate: {}};
    },
    methods: {
        addLayer(o){
            this.map.addLayer(o);
            this.$emit('addlayer',o);
        },
		urlParam(name,h){
			if(!h)h=window.location.href;
			var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(h);
			return results&&results[1] || 0;
		},
        addFeature(f,cfg) {
            f = f ? f : {};
            var me = this, point, map = me.map;
            if (f.lon && f.lat) {
                var c = [f.lon, f.lat];
                point = new ol.geom.Point(c[0] > -100 ? ol.proj.fromLonLat(c) : c);
            } else {
                point = new ol.geom.Point(map.getView().getCenter());
            }
            c = point.flatCoordinates;
            var c = c[0] < -10000 ? ol.proj.toLonLat(c) : c;
            
            me.$emit('translateend', {lon: c[0], lat: c[1]});
			f.geometry=point;
			console.log(f);
            var feature = new ol.Feature(f);
            feature.data = f;
			if(f.draggable){
				var interactionCollection = new ol.Collection();
				interactionCollection.push(feature);
				var translateIteraction = new ol.interaction.Translate({
					features: interactionCollection
				});
				translateIteraction.on('translateend',(e)=>{
					var c = ol.proj.toLonLat(e.coordinate);
					me.$emit('translateend', {lon: c[0], lat: c[1]});
				});
				translateIteraction.on('translatestart',(e)=>{
					me.selectedFeature = e.features.getArray()[0];
				});
				feature.interactionCollection = interactionCollection;
				me.map.addInteraction(translateIteraction);
			}
			if((typeof f.style)=='object'){
				feature.setStyle(f.style);
			}else
				feature.setStyle(me.styleMap[f.style ? f.style : 'default']);
            c = point.flatCoordinates;
            c = c[0] < -10000 ? ol.proj.toLonLat(c) : c;
            me.$emit('translateend', {lon: c[0], lat: c[1]});
			
			
			if(f.layer!=null){
				var layer=map.getLayerById(f.layer);
				if(!layer){
					map.addLayer(new ol.layer.Vector({
						id:f.layer,
						source: new ol.source.Vector({
							features: new ol.Collection([feature])
						})
					}));
				}else
					layer.getSource().addFeatures(feature);
			}else
				me.collection.push(feature);
            if(cfg){
                console.log(feature.getGeometry().getCoordinates());
                me.map.getView().animate(Object.assign({
                    center:feature.getGeometry().getCoordinates(),
                    zoom: 17,
                    duration: 500
                },cfg))
            }
            return feature;
        },
		animate(o){
			this.map.getView().animate(o);
			//si zoom y coordnada son igual eejecura l complte directamente
			this.movingCompleted=o.complete;
		},
        build(){
            var m = this;
            m.styleMap = {
                default: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,	
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                                color: '#ff0000'
                        })
                    })
                }),
                star: [new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({
                            color: '#ff0000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        points: 5,
                        radius: 10,
                        radius2: 4,
                        angle: 0
                    })
                })]
            };
            var pageLocation = m.urlParam('location');
            var zoom=-1;
            if (pageLocation) {
                //Pero no se debe hacer si en la carga se ha determinado unn centro
                var l = pageLocation.split('/');
                pageLocation = [parseFloat(l[0]), parseFloat(l[1])];
                zoom = l[2];
                m.moved = true;
            } else {
                pageLocation = false;
            }
            var map = new ol.Map({
                target: m.$el,
                layers: [
    //new ol.layer.VectorTile({
      /*source: new ol.source.VectorTile({
        format: new ol.format.MVT(),
        url:
                'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf'
         // 'https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf',
      }),
    })  */        
                    
                   /* new ol.layer.Tile({
                              source: new ol.source.XYZ({
        attributions:
          'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
                'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf'
                //'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
               // 'https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
          //'https://server.arcgisonline.com/ArcGIS/rest/services/' +
          //'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      }),*/
                        
                       /* 
                        source: new ol.source.XYZ({
        attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
        url:
          'https://services.arcgisonline.com/arcgis/rest/services/' +
          'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 15,
        projection: 'EPSG:4326',
        tileSize: 512, // the tile size supported by the ArcGIS tile service
        maxResolution: 180 / 512, // Esri's tile grid fits 180 degrees on one 512 px tile
        wrapX: true,
      })*/
                                
                      new ol.layer.Tile({              
                                   source: new ol.source.OSM({
                            //url: 'https://tiles.geodir.co/osm_tiles/{z}/{x}/{y}.png'
                                    //'https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png' 
                           // 'http://{a-c}.tile.stamen.com/toner/{z}/{x}/{y}.png'
                            //'http://tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
                            //'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                            //'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
                            //'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            //'https://maps-cdn.salesboard.biz/styles/klokantech-3d-gl-style/{z}/{x}/{y}.png'
                            //'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/NatGeoStyleBase/MapServer/tile/{z}/{y}/{x}'
                            //'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{x}/{y}.pbf'
                        })
                    })
                ],
                view: new ol.View({})
            });
			map.getLayerById=function(id) {
				var ly;
				map.getLayers().forEach((l) => {
					if (l.get("id") === id) {
						ly = l;
						return;
					}
				});
				return ly;
			},
            map.styleMap = m.styleMap;
            map.addLayer(new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: m.collection = new ol.Collection()
                })
            }));
            if(m.moved){
                map.getView().setCenter(pageLocation);
                console.log('en el momento de cargar moved to pageLocation='+pageLocation);
                map.getView().setZoom(zoom?zoom:12);
                m.map=map;
                console.log('distarar evento buid  pageLocation='+pageLocation);
                m.$emit('build',m);
            }else{
                console.log('En caso no exista una coordenada se usara se fijara a los limites de la region');
                _.getCurrentPosition().then((e) => {
                    map.getView().setCenter(ol.proj.fromLonLat([e.coords.longitude, e.coords.latitude]));
                    map.getView().setZoom(12);
                    m.map=map;
                    m.$emit('build',m);
                }, (e) => {
                    map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], map.getSize());
                    m.map=map;
                    m.$emit('build',m);
                });
            }
            var currZoom = map.getView().getZoom();
            map.on('moveend', (evt) => {
				if(this.movingCompleted){
					this.movingCompleted(m);
					this.movingCompleted=null;
				}
                //console.log(evt);
                var newZoom = map.getView().getZoom();
                if (currZoom != newZoom) {
                    
                    currZoom = newZoom;
					//se debe avisar a cada overlay del cambio de posicion
					m.$children.forEach(function(e){
						if(e.$vnode.tag.endsWith('v-overlay'))
							e.$emit("zoom",newZoom);
					});
                }
                /*console.log('vue.map-moveend '+map.getView().getCenter());
                if (!m.moved) {
                    var center = map.getView().getCenter();
                    history.replaceState({id: 'homepage'}, '', document.location.pathname + '?' + _.param('location', center[0] + '/' + center[1] + '/' + map.getView().getZoom()));
                }
                m.moved = false;*/
            });
            map.on('singleclick',(evt) => {
                //var l=[];
                var f = map.forEachFeatureAtPixel(evt.pixel, (feature,layer) => {
                    if(layer)
                    return [feature,layer];
                    //l.push([feature,layer]);
                });
                //console.log(l);
                if (f) {
                    var layer=f[1];
                    var f=f[0];
                    evt.feature=f;
                    evt.map=map;
                    evt.preventDefault();
                    if(layer.onSelect){layer.onSelect(evt);return;}else;
                }
            });
            map.on('dblclick', (evt) => {
                var f = map.forEachFeatureAtPixel(evt.pixel,(feature,layer)=>{
                    if(layer)
                    return [feature,layer];
                });
                if (f) {
                    var layer=f[1];
                    var f=f[0];
                    var old = null;///dblClickSelect.getFeatures().item(0);
                    
                    evt.feature=f;
                    evt.map=map;
                    //evt.preventDefault();
                    if(layer.onChange){console.log('dbclick manda event onchangue');layer.onChange(evt);return;}else;
                    m.$emit('change',f);
                    if (true/*old && old.getId() === f.getId()*/) {
                        //Si es un punto acercalo hasta un zoom adecuado despues llamar a una ventana
                        map.getView().animate({
                            center:f.getGeometry().getCoordinates(),
                            zoom: 17,//map.getView().getZoom() + 1,
                            duration: 500
                        },()=>{
                            for(var j=0;j<m.$children.length;j++){
                                var ch=m.$children[0];
                                if(ch.open)ch.open(evt);
                            }
                        });
                    } else {
                        /*evt.preventDefault();
                        c = _.wg($(f.getId().length > 4 ? '.x-district' : '.x-province'));
                        c.selectValue(f.getId());*/
                    }
                }
            });
            var vp=map.getViewport().parentNode;
            vp.addEventListener("parentResize",(event)=>{
                setTimeout(()=>{
                    map.updateSize();
                    //console.log('map.updateSize '+event.height);
                    //console.log(m.$el);
                    m.$emit('resize',map);
                }, 100)
            });
            Vue.resize();
        }
    }
};
</script>

