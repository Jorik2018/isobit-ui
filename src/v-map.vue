<template>
    <div ref="el">
        <slot></slot>
    </div>
</template>
<script>
import "ol/ol.css";
import { Drag } from './Drag'
import { provide, reactive } from 'vue'
import { ref, onMounted, nextTick, watch } from 'vue'
import Map from "ol/Map";
import { Collection } from "ol";
import PointerInteraction from 'ol/interaction/Pointer.js';
import { defaults as defaultInteractions } from 'ol/interaction/defaults'
import View from "ol/View";
import { Point } from 'ol/geom';
import Select from 'ol/interaction/Select'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Circle, Fill, Stroke, Style, RegularShape } from 'ol/style'
import { Tile as TileLayer } from 'ol/layer'
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector'
import Translate from 'ol/interaction/Translate';
import Feature from 'ol/Feature'
export default {
    name: 'VMap',
    setup(props, { emit, expose }) {
        const el = ref(null);
        const map = ref(null);
        const moved = ref(null);
        const movingCompleted = ref(null);
        const controls = reactive([]);

        provide('collector', {
            remove(control) {
                controls.splice(controls.indexOf(control), 1);
            },
            push(control) {
                controls.push(control);
            }
        })

        const empty = (layer = 'default') => {
            // Validate that the argument is indeed an OpenLayers layer
            //if (!(layer instanceof ol.layer.Layer)) {
            //  throw new Error('Invalid layer provided.');
            //}
            const _map = map.value;
            layer = _map.getLayerById(layer);
            if (layer) {
                const source = layer.getSource();
                if (source instanceof VectorSource) {
                    const features = source.getFeatures();
                    return features.length === 0; // Returns true if the layer is empty
                }
            }
            return true;
        }

        const addLayer = (o) => {
            map.value.addLayer(o);
            emit('addlayer', o);
        }
        const addFeature = (f, cfg) => {
            f = f ? f : {};
            let point, c;
            const _map = map.value;
            if (f.lon && f.lat) {
                c = [f.lon, f.lat];
                point = new Point(c[0] > -100 ? fromLonLat(c) : c);
            } else {
                point = new Point(_map.getView().getCenter());
            }
            c = point.flatCoordinates;
            const coordinate = c[0] < -10000 ? toLonLat(c) : c;
            emit('translateend', { lon: coordinate[0], lat: coordinate[1] });
            f.geometry = point;
            const feature = new Feature(f);
            feature.data = f;


            if ((typeof f.style) == 'object') {
                feature.setStyle(f.style);
            } else {
                feature.setStyle(_map.styleMap[f.style ? f.style : 'default']);
            }
            c = point.flatCoordinates;
            c = c[0] < -10000 ? toLonLat(c) : c;
            emit('translateend', { lon: c[0], lat: c[1] });
            const layerId = f.layer || 'default';
            let layer = _map.getLayerById(layerId);
            if (!layer) {
                _map.addLayer(layer = new VectorLayer({
                    id: layerId,
                    source: new VectorSource({
                        features: new Collection([feature])
                    })
                }));
            } else
                layer.getSource().addFeatures(feature);

            if (f.draggable) {
                let drag = _map.drag;
                if (!drag) {
                    _map.drag = drag = new Drag();
                    drag.$on('up', ({ coordinate, feature }) => {
                        const c = toLonLat(coordinate);
                        emit('translateend', { lon: c[0], lat: c[1], feature });
                    })
                    _map.addInteraction(drag)
                    drag.addLayers([layer])
                }
            }
            if (cfg) {
                //console.log(feature.getGeometry().getCoordinates());
                _map.getView().animate(Object.assign({
                    center: feature.getGeometry().getCoordinates(),
                    zoom: 17,
                    duration: 500
                }, cfg))
            }
            return feature;
        }
        const animate = (o) => {
            map.value.getView().animate(o);
            //si zoom y coordnada son igual eejecura l complte directamente
            movingCompleted.value = o.complete;
        }
        const urlParam = (name, h) => {
            if (!h) h = window.location.href;
            const results = new RegExp('[?&]' + name + '=([^&#]*)').exec(h);
            return results && results[1] || 0;
        }
        const build = (value) => {
            const styleMap = {
                default: new Style({
                    image: new Circle({
                        radius: 8,
                        stroke: new Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        fill: new Fill({
                            color: '#ff0000'
                        })
                    })
                }),
                star: [new Style({
                    image: new RegularShape({
                        fill: new Fill({
                            color: '#ff0000'
                        }),
                        stroke: new Stroke({
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
            let pageLocation = urlParam('location');
            let zoom = -1;
            if (pageLocation) {
                //Pero no se debe hacer si en la carga se ha determinado unn centro
                let l = pageLocation.split('/');
                pageLocation = [parseFloat(l[0]), parseFloat(l[1])];
                zoom = l[2];
                moved.value = true;
            } else {
                pageLocation = false;
            }
            const _map = new Map({
                target: value,
                layers: [
                    new TileLayer({
                        source: new OSM()
                    })
                ],
                view: new View({ center: [0, 0], zoom: 2 })
            });
            _map.getLayerById = function (id = 'default') {
                let ly;
                _map.getLayers().forEach((l) => {
                    if (l.get("id") === id) {
                        ly = l;
                        return;
                    }
                });
                return ly;
            }
            _map.styleMap = styleMap;


            if (moved.value) {
                _map.getView().setCenter(pageLocation);
                console.log('en el momento de cargar moved to pageLocation=' + pageLocation);
                _map.getView().setZoom(zoom ? zoom : 12);
                map.value = _map;
                console.log('distarar evento buid  pageLocation=' + pageLocation);
                emit('build', m);
            } else {

                /*console.log('En caso no exista una coordenada se usara se fijara a los limites de la region');
                getCurrentPosition().then((e) => {
                    _map.getView().setCenter(ol.proj.fromLonLat([e.coords.longitude, e.coords.latitude]));
                    _map.getView().setZoom(12);
                    map.value=_map;
                    emit('build',m);
                }, () => {*/
                _map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], _map.getSize());
                map.value = _map;
                emit('build', { map: _map });

                controls.forEach((control) => {
                    control(_map)
                })
                //});
            }
            let currZoom = _map.getView().getZoom();
            _map.on('moveend', () => {
                if (movingCompleted.value) {
                    movingCompleted.value(m);
                    movingCompleted = null;
                }
                //console.log(evt);
                let newZoom = _map.getView().getZoom();
                if (currZoom != newZoom) {

                    currZoom = newZoom;
                    //se debe avisar a cada overlay del cambio de posicion
                    /*m.$children.forEach(function(e){
                        if(e.$vnode.tag.endsWith('v-overlay'))
                            emit("zoom",newZoom);
                    });*/
                }
            });
            _map.on('singleclick', (evt) => {
                let f = _map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                    if (layer)
                        return [feature, layer];
                });
                if (f) {
                    let layer = f[1];
                    let feature = f[0];
                    evt.feature = feature;
                    evt.map = _map;
                    evt.preventDefault();
                    if (layer.onSelect) { layer.onSelect(evt); return; } else;
                }
            });
            _map.on('dblclick', (evt) => {
                let f = _map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                    if (layer)
                        return [feature, layer];
                });
                if (f) {
                    let layer = f[1];
                    f = f[0];
                    //let old = null;///dblClickSelect.getFeatures().item(0);

                    evt.feature = f;
                    evt.map = _map;
                    //evt.preventDefault();
                    if (layer.onChange) { layer.onChange(evt); return; } else;
                    emit('change', f);
                    //if (true/*old && old.getId() === f.getId()*/) {
                    //Si es un punto acercalo hasta un zoom adecuado despues llamar a una ventana
                    _map.getView().animate({
                        center: f.getGeometry().getCoordinates(),
                        zoom: 17,//map.getView().getZoom() + 1,
                        duration: 500
                    }, () => {
                        for (let j = 0; j < m.$children.length; j++) {
                            let ch = m.$children[0];
                            if (ch.open) ch.open(evt);
                        }
                    });
                    //} else {
                    /*evt.preventDefault();
                    c = _.wg($(f.getId().length > 4 ? '.x-district' : '.x-province'));
                    c.selectValue(f.getId());*/
                    //}
                }
            });
            map.value = _map;
            setTimeout(() => {
                _map.updateSize();
                _map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], _map.getSize());
                map.value = _map;
                emit('build', { map: _map, addFeature });
            }, 100)
        }
        watch(el, (newValue) => {
            if (newValue) {
                nextTick(() => {
                    emit('beforeBuild');
                    build(newValue);
                })
            }
        })
        expose({ addFeature, addLayer, map, empty })
        return { el, addLayer, addFeature }
    },
    data() {
        return { moved: false, map: null, movingCompleted: null, styleMap: null, coordinate: {} };
    }
};
</script>
