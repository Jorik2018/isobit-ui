<template>
    <div>
        <slot></slot>
    </div>
</template>
<script>
import { unByKey } from 'ol/Observable'
import { inject, ref } from 'vue'
import { Collection } from 'ol'
import FullScreen from 'ol/control/FullScreen'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'
import axios from 'axios'

export default {
    name: 'VLayerControl',
    data() {
        return {
            loaded: null, map: null, district: null,
            dl: null
        }
    },
    setup({ baseURL = 'http://web.regionancash.gob.pe' }, { emit }) {
        const selectionRef = ref()
        const collector = inject('collector');
        const plRef = ref()
        const mapRef = ref();
        let feature2
        let scope;
        let lastScope;
        let unmove;
        const setScope = (v, anim) => {
            let map = mapRef.value;
            if (v == lastScope) {
                map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014,
                -899052.0546471546], map.getSize());
                return;
            }
            if (v < 100) v = v * 10000;//si es provincia se aumenta
            if (v < 10000) v * 100;//si es distrito
            //if(me.pl){
            scope = v;
            if (scope == 0) {
                map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014,
                -899052.0546471546], map.getSize());
                lastScope = v;
                map.getLayerById('districts').getSource().clear();
                emit('scope', { feature: { getId() { return null } }, target: me });
            } else {
                if (map) {
                    if (v > 9999) {
                        let districtLayer = map.getLayerById('districts');
                        let fl = districtLayer.getSource().getFeatures();
                        //console.log('nscope='+v);
                        for (let i = 0; i < fl.length; i++) {
                            //console.log('nscope='+v+'=='+(1*fl[i].id_));
                            if ((1 * fl[i].id_) == v) {
                                districtLayer.onChange({ feature: fl[i] });
                                break;
                            }
                        }
                    } else if (v) {
                        let provinceLayer = map.getLayerById('provinces');
                        let v = 1 * (v.value ? v.value : v);
                        let fl = provinceLayer.getSource().getFeatures();
                        for (let i = 0; i < fl.length; i++) {
                            if ((1 * fl[i].id_) == v) {
                                provinceLayer.onChange({ feature: fl[i] });
                                break;
                            }
                        }
                    }
                } else {
                    lastScope = v;
                }
            }
        }
        const build = (map) => {
            mapRef.value = map;
            let selection = new Collection();
            selectionRef.value = selection;
            let faExpand = document.createElement('i');
            faExpand.setAttribute('class', 'fa fa-expand');
            map.addControl(new FullScreen({ label: faExpand, tipLabel: 'Fullscreen' }));
            let provinceSource = new VectorSource({
                url: baseURL + '/fs/geo/02.geojson',
                format: new GeoJSON()
            });
            let provinceLayer = plRef.value = new VectorLayer({
                source: provinceSource,
                style(feature) {
                    return new Style({
                        fill: new Fill({
                            color: 'rgba(255, 0, 0, 0.0)'
                        }),
                        stroke: new Stroke({
                            color: '#4073CE',
                            width: 1
                        }),
                        text: new Text({
                            text: feature.values_.name ? feature.values_.name.toUpperCase() : '',
                            fill: new Fill({ color: '#4073CE' }),
                            stroke: new Stroke({ color: '#4073CE', width: 0.5 })
                        })
                    })
                },
                id: 'provinces'
            });
            provinceLayer.onChange = (event) => {
                let feature = event.feature;
                if (lastScope != feature.getId()) {
                    selection.clear();
                    selection.push(feature);
                    if (event.preventDefault) event.preventDefault();
                    lastScope = feature.getId();
                    feature2 = feature;
                    //console.log(f.getId()+"--unmove="+me.unmove);
                    if (unmove) {
                        console.log('layercontrol.moveend');
                        moveend();
                    } else {
                        map.getView().fit(feature.getGeometry().getExtent(), { duration: 200,callback:()=>{

                        }});
                    }
                    //Debe considerarse cuando no hay ningun cambio y no llama a moveend
                }
            };
            //            me.changeProvince = function (t) {
            //                let v=1*(t.value?t.value:t);
            //                let fl=pl.getSource().getFeatures();
            //                for(let i=0;i<fl.length;i++){
            //                    if((1*fl[i].id_)==v){
            //                        pl.onChange({feature:fl[i]});
            //                        break;
            //                    }
            //                }
            //            }
            let listener = provinceSource.on('change', () => {
                let prov = scope;
                if (prov > 9999) {
                    prov = Math.floor(prov / 100);
                }
                let fl = provinceSource.getFeatures();
                for (let i = 0; i < fl.length; i++) {
                    if ((1 * fl[i].id_) === 1 * prov) {
                        //console.log('change prov '+prov);
                        provinceLayer.onChange({ feature: fl[i] });
                        break;
                    }
                }
                unByKey(listener);
            });
            let districtLayer = new VectorLayer({
                preload: Infinity,
                source: new VectorSource(),
                id: 'districts',
                style(f) {
                    return new Style({
                        fill: new Fill({
                            color: 'rgba(16, 110, 138, 0.0)'
                        }),
                        stroke: new Stroke({
                            color: '#194300',
                            width: 1
                        }),
                        text: new Text({
                            text: f.values_.name ? f.values_.name.toUpperCase() : '',
                            fill: new Fill({ color: '#194300' }),
                            stroke: new Stroke({ color: '#194300', width: 0.5 })
                        })
                    })
                }
            });
            let moveend = (/*evt*/) => {
                if (feature2) {

                    //Se debe cargar si el feature es de una provincia
                    if (feature2.id_ < 10000) {
                        districtLayer.setSource(new VectorSource({
                            url: baseURL + '/fs/geo/' + feature2.id_ + '.geojson',
                            format: new GeoJSON()
                        }));
                        let listenerKey = districtLayer.getSource().on('change', (/*e*/) => {
                            if (scope > 0) {
                                let fl = districtLayer.getSource().getFeatures();
                                let v = scope;
                                for (let i = 0; i < fl.length; i++) {
                                    if ((1 * fl[i].id_) == v) {
                                        scope = 0;
                                        districtLayer.onChange({ feature: fl[i] });
                                        break;
                                    }
                                }
                            }
                            unByKey(listenerKey);
                        });
                    }
                    //console.log('me.feature__='+me.feature2.id_);
                    //console.log('emit scopee '+me.feature2.id_);
                    emit('scope', { feature: feature2, target: {} });
                    feature2 = null;
                    //console.log('layer moveend termina');
                }
            };
            map.on('moveend', moveend);

            provinceLayer.onSelect = (f) => {
                me.$emit('select', f);
            };
            map.addLayer(provinceLayer);
            map.addLayer(new VectorLayer({
                id: 'district',
                source: new VectorSource(),
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(255, 150, 150, 0.0)'
                    }),
                    stroke: new Stroke({
                        color: '#4073CE',
                        width: 1
                    })
                })
            }));
            let hoverStyle = new Style({
                fill: new Fill({
                    color: 'rgba(16, 110, 138, 5.0)'
                })
            });
            let emptyStyle = new Style({
                fill: new Fill({
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
            districtLayer.onChange = (event) => {
                let f = event.feature;
                if (lastScope != f.getId()) {
                    //console.log(f);
                    if (selection.getLength() == 2) selection.pop();
                    selection.push(f);
                    //Para evitar que el mismo mapa se mueva solo y poder manejar la animacion
                    if (event.preventDefault) event.preventDefault();
                    lastScope = f.getId();
                    feature2 = f;
                    if (unmove)
                        moveend();
                    else
                        map.getView().fit(f.getGeometry().getExtent(), { duration: 300 });
                }
            };
            districtLayer.onSelect = (f) => {
                emit('select', f);
            };
            map.addLayer(districtLayer);

            emit('render', { map });
        }
        collector.push((map) => {
            build(map)
        });
        return {}
    }
};
</script>
