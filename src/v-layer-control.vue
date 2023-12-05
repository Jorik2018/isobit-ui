<template>
<div><slot></slot></div>
</template>
<script>
import {unByKey} from 'ol/Observable'

export default {
	data() {
        return {
            loaded: null,map:null,feature2:null,district:null,pl:null,selection:null,
            dl:null,scope:null,lastScope:null,unmove:null,
        }
    },
    methods:{
        setScope(v,anim){
            var me=this,map=me.map;
			console.log('me.map='+me.map);
            if(v==me.lastScope){
				map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014,
                    -899052.0546471546],map.getSize()); 
				return;
			}
            if(v<100)v=v*10000;//si es provincia se aumenta
            if(v<10000)v*100;//si es distrito
            //if(me.pl){
                me.scope=v;
           // }else{
            //    me.scope=-v;
            //}
            //console.log(me.scope);
            //console.log(me.lastScope);
            if(me.scope==0){
                map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014,
                    -899052.0546471546],map.getSize()); 
                me.lastScope=v;
                map.getLayerById('districts').getSource().clear();
                me.$emit('scope',{feature:{getId(){return null}},target:me});
            }else{
                //var f=event.feature;
                if(map){
                    if(v>9999){
                        var dl=map.getLayerById('districts');
                        var fl=dl.getSource().getFeatures();
                        //console.log('nscope='+v);
                        for(var i=0;i<fl.length;i++){ 
                            //console.log('nscope='+v+'=='+(1*fl[i].id_));
                            if((1*fl[i].id_)==v){
                                dl.onChange({feature:fl[i]});
                                break;
                            }
                        }
                    }else if(v){
                        //console.log('nscope2='+v);
                        var pl=map.getLayerById('provinces');
                        var v=1*(v.value?v.value:v);
                        var fl=pl.getSource().getFeatures();
                        //console.log('fl.length='+fl.length);
                        for(var i=0;i<fl.length;i++){
        //                    console.log('compare '+(1*fl[i].id_)+' - '+v);
                            if((1*fl[i].id_)==v){
        //                        console.log('me.changePMMMMMrovince='+t);
                                pl.onChange({feature:fl[i]});
                                break;
                            }
                        }
                    }
                }else{
                    me.lastScope=v;
                }
            }
        }
    },
	/*created(){
		alert('layrControl.created'+this.$parent);
		
	},*/
    //render() {
	created(){
        var me = this;
        me.$parent.$on('build', (e) => {
		
            var fspan = document.createElement('i'),map=e.map;
            me.selection = new ol.Collection();
            var selection=me.selection;
            fspan.setAttribute('class', 'fa fa-expand');
            map.addControl(new ol.control.FullScreen({ label: fspan, tipLabel: 'Fullscreen' }));
            var pv=new ol.source.Vector({
                url: (axios.defaults.baseURL?axios.defaults.baseURL:'')+'/fs/geo/02.geojson',
                format: new ol.format.GeoJSON()
            });
            var pl=me.pl=new ol.layer.Vector({
                source: pv,
                style(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                         color: 'rgba(255, 0, 0, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#4073CE',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#4073CE'}),
                            stroke: new ol.style.Stroke({color: '#4073CE', width: 0.5})
                        })
                    })
                },
                id: 'provinces'
            });
//            me.changeProvince = function (t) {
//                var v=1*(t.value?t.value:t);
//                var fl=pl.getSource().getFeatures();
//                for(var i=0;i<fl.length;i++){
//                    if((1*fl[i].id_)==v){
//                        pl.onChange({feature:fl[i]});
//                        break;
//                    }
//                }
//            }
            var listener=pv.on('change', ()=> {
                var prov=me.scope;
                if(prov>9999){
                    prov=Math.floor(prov/100);
                }
                var fl=pv.getFeatures();
                for(var i=0;i<fl.length;i++){
                    if((1*fl[i].id_)===1*prov){
                        //console.log('change prov '+prov);
                        pl.onChange({feature:fl[i]});
                        break;
                    }
                }
                unByKey(listener);
            });
            var dl=new ol.layer.Vector({
                preload: Infinity,
                source:new ol.source.Vector(),
                id: 'districts',
                style(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(16, 110, 138, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#194300',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#194300'}),
                            stroke: new ol.style.Stroke({color: '#194300', width: 0.5})
                        })
                    })
                }
            });
            var moveend=(/*evt*/)=>{
                if(me.feature2){
                    
                    //Se debe cargar si el feature es de una provincia
                    if(me.feature2.id_<10000){
                        dl.setSource(new ol.source.Vector({
                            url: (axios.defaults.baseURL?axios.defaults.baseURL:'')+'/fs/geo/' + me.feature2.id_ + '.geojson',
                            format: new ol.format.GeoJSON()
                        }));
                        var listenerKey = dl.getSource().on('change',(/*e*/)=>{
                            if(me.scope>0){
                                var fl=dl.getSource().getFeatures();
                                var v=me.scope;
                                for(var i=0;i<fl.length;i++){
                                    if((1*fl[i].id_)==v){
                                        me.scope=0;
                                        dl.onChange({feature:fl[i]});
                                        break;
                                    }
                                }
                            }
                            unByKey(listenerKey);
                        });
                    }
                    //console.log('me.feature__='+me.feature2.id_);
                    //console.log('emit scopee '+me.feature2.id_);
                    me.$emit('scope',{feature:me.feature2,target:me});
                    me.feature2=null;
                    //console.log('layer moveend termina');
                }
            };
            map.on('moveend', moveend);
            pl.onChange=(event)=>{
                var f=event.feature;
                if(me.lastScope!=f.getId()){
                    selection.clear();
                    selection.push(f);
                    if(event.preventDefault)event.preventDefault();
                    me.lastScope=f.getId();
                    me.feature2=f;
                    //console.log(f.getId()+"--unmove="+me.unmove);
                    if(me.unmove){
                        //console.log('moveend');
                        moveend();
                    }else
                        map.getView().fit(f.getGeometry().getExtent(), {duration: 300});
                    //Debe considerarse cuando no hay ningun cambio y no llama a moveend
                }
            };
            pl.onSelect=(f)=>{
                me.$emit('select',f);
            };
            map.addLayer(pl);
            map.addLayer(new ol.layer.Vector({
                id: 'district',
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 150, 150, 0.0)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#4073CE',
                        width: 1
                    })
                })
            }));
            var hoverStyle=new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(16, 110, 138, 5.0)'
                })
            });
            var emptyStyle=new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 150, 150, 0.0)'
                })
            });
            /*map.addInteraction(new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                style: function (f) {
                    if(f.getId()&&(selection.getLength()==1&&selection.item(0).getId() === f.getId()||
                            selection.getLength()==2&&selection.item(1).getId() === f.getId())){
                        //if(selection.getLength()==2)
                        emptyStyle.setText(selection.getLength()==2?new ol.style.Text({
                                    text: f.values_.name?f.values_.name.toUpperCase():'ooo',
                                    fill: new ol.style.Fill({color: '#000000'}),
                                    stroke: new ol.style.Stroke({color: '#4073CE', width: 1})
                                }):null);
                        return emptyStyle;
                    }
                    hoverStyle.setText(new ol.style.Text({
                                    text: f.values_.name?f.values_.name.toUpperCase():'',
                                    fill: new ol.style.Fill({color: '#FFFFFF'}),
                                    stroke: new ol.style.Stroke({color: '#4073CE', width: 1})
                                }));
                    return hoverStyle;
                }
            }));*/
            dl.onChange=(event) => {
                var f=event.feature;
                if(me.lastScope!=f.getId()){
                    //console.log(f);
                    if(selection.getLength()==2)selection.pop();
                    selection.push(f);
                    //Para evitar que el mismo mapa se mueva solo y poder manejar la animacion
                    if(event.preventDefault)event.preventDefault();
                    me.lastScope=f.getId();
                    me.feature2=f;
                    if(me.unmove)
                        moveend();
                    else
                        map.getView().fit(f.getGeometry().getExtent(), {duration: 300});
                }
            };
            dl.onSelect=(f)=>{
                me.$emit('select',f);
            };
            map.addLayer(dl);
            me.map=map;
            me.$emit('render',me);
        });
        return null;
    }
};
</script>

