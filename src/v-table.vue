<script>
import { computed, ref, h, inject, onMounted, onUnmounted, getCurrentInstance, onUpdated, watch } from 'vue'
import VButton from './v-button.vue';
import { clean, HTML2Canvas, sum, networkStatus, db, getStoredList, whichChild } from './commons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSquareCheck, faSquare } from '@fortawesome/free-regular-svg-icons';
import { useAppStore } from './useAppStore';

export default {
    name: 'VTable',
    setup(props, cxt) {
        const { autoload, src, rowKey, store, groups } = props;
        const app = useAppStore();
        const viewCollector = inject('viewCollector');
        const formCollector = inject('formCollector');
        const selectable0 = ref(1)
        const scrollable0 = ref(0);
        const tableRef = ref(null);
        const kc = ref(1)
        const selected = ref([]);
        const data = ref([]);
        const sorter = ref(null);
        const sortDir = ref(1);
        const filteredData = computed(() => {
            //https://itqna.net/questions/514/how-do-search-ignoring-accent-javascript
            //https://stackoverflow.com/questions/5700636/using-javascript-to-perform-text-matches-with-without-accented-characters
            const me = props, data_ = data.value;
            let f, v;
            data_.sum = sum;
            console.log('data_===', data_);
            return data_.filter(item => {
                for (var key in me.filters) {
                    f = me.filters[key];
                    if (typeof f === 'function') {
                        if (!f(item)) {
                            return 0;
                        }
                    } else if (f && typeof f === 'string' && key in item) {
                        v = item[key];
                        if (typeof v === 'string') {
                            v = v.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                            if (!v.includes(f.toUpperCase())) {
                                //console.log(v+'  no contains2 '+f.toUpperCase()+' '+v.includes(f.toUpperCase()));
                                return 0;
                            }
                        }
                    }
                };
                return 1;
            });
        });
        const sortedData = computed(() => {
            let data = filteredData.value;
            data = sorter ? data.sort((a, b) => {
                b = b[sorter];
                b = b ? b : 0;
                a = a[sorter];
                const aa = Number(a);
                if (aa) a = aa;
                if (a < b) return -1 * sortDir;
                else if (a > b) return 1 * sortDir;
                else return 0;
            }) : data;
            data.sum = sum;
            return data;
        });
        const groupedData = computed(() => {
            const sum = function (keyOrIndex) {
                return this.reduce((total, item) => {
                    if (typeof keyOrIndex === 'number') {
                        return total + (item[keyOrIndex] || 0);
                    } else if (typeof keyOrIndex === 'string') {
                        return total + (item[keyOrIndex] || 0);
                    }
                    return total;
                }, 0);
            }
            Array.prototype.sum = sum;
            const grouped = {}, groupKeys = groups;
            if (groupKeys) {
                sortedData.value.forEach(row => {
                    const group = row[groupKeys];
                    if (!grouped[group]) {
                        const g = [];
                        g.sum = sum
                        grouped[group] = g;

                    }
                    grouped[group].push(row); // ✅ Copia para evitar referencias directas
                });
            } else if (sortedData.value.length) {
                grouped[''] = sortedData;
            }
            return Object.entries(grouped).map(([group, values]) => ({
                name: group,
                values
            }));
        })
        const getCheckColumnWidth = () => (42);
        const page = ref(1);
        const pages = ref(1);
        const { slots, expose, emit } = cxt;
        //console.log(cxt);
        watch(
            () => props.value,
            (newVal) => {
                if (!props.src) {
                    data.value = Array.isArray(newVal) ? newVal : [];
                }
            },
            { immediate: true, deep: true }
        );
        const ci = getCurrentInstance();

        const loadStore = async () => {
            if (store != null) {
                let datj;
                if (db) datj = await getStoredList(store);
                if (!datj) datj = [];
                data.value = data.value ? datj.concat(data.value) : datj;
            }
            return data.value;
        }
        const _selectRow = (event, row, indexRow) => {
            if (selectable0.value && whichChild(event.target) == 0)
                return;
            //se debe tener en cuenta si es 
            //record, numero fila 
            rowSelect(row, indexRow, 1);
        }
        const rowSelect = (row, i, c) => {
            const me = this;
            if (i === -10) {
                if (filteredData.value.length === selected.value.length) {
                    selected.value = [];
                } else {
                    selected.value = filteredData.value.map((value) => value);
                }
            } else if (c) {
                if (selectable0.value || !selected.value.includes(row))
                    selected.value = [row];
                else {
                    selected.value = [];
                    row = null;
                }
            } else if (!selected.value.includes(row)) {
                selected.value.push(row);
            } else {
                selected.value.splice(selected.value.indexOf(row), 1);
                row = null;
            }
            emit('row-select', { target: me, current: row, selection: selected });
        }
        const isSelected = (row) => {
            return selected.value.includes(row);
        }
        const getRowClass = (row) => {
            const cls = [];
            if (props.selectable && isSelected(row)) cls.push('v-selected');
            if (props.rowStyleClass) {
                if (typeof props.rowStyleClass == "string") {
                    cls.push(props.rowStyleClass);
                } else if (props.rowStyleClass) {
                    cls.push(props.rowStyleClass(row));
                }
            }
            return cls;
        }
        const to = (n, v) => { loadP(n, v) }
        const loadP = (n, v) => {
            if (page.value != n || v) {
                page.value = n;
                load()
            }
        }
        let s = ('' + props.selectable);
        selectable0.value = (s != 'false' && s != '0') ? 1 : 0;
        s = ('' + props.scrollable);
        scrollable0.value = (props.scrollable && s != 'false' && s != '0') ? 1 : 0;
        const load = (/*s*/) => {
            const me = props;
            selected.value = [];
            if (me.value) {
                data.value = [];
                data.value = me.value;
                emit('loaded', { target: me });
                emit('row-select', {});
                me.remoteLoaded = 1;
                me.loaded = 1;
                kc.value++;
            }
            if (src) {

                let s = src;
                if (!s)//esto deberia darse si 
                    return;
                //s = me.$root.apiLink(window.location.pathname);
                if (s.endsWith("/"))
                    s = s.slice(0, s.length - 1);

                const pagination = me.pagination;
                //console.log(props);
                if (pagination) {
                    s += '/' + (page.value - 1) * pagination + '/' + pagination;
                }
                if (networkStatus.connected) {
                    let request;
                    if (me.gql) {
                        const gql = me.gql;
                        const query = ('query{' + Object.keys(gql)[0] + '(offset:' + ((page.value - 1) * pagination)
                            + ' limit:' + (pagination) + '){\ndata{' + gql[Object.keys(gql)[0]] + '}\nsize\n}\n}');

                        request = app.axios.post(src, { query: query });
                    } else {
                        request = app.axios.get(s, { params: clean(me.filters) });
                    }
                    request.then((r) => {
                        if (r.data && r.data.error) {
                            MsgBox(r.data.error);
                        } else {
                            let re = r.data;
                            if (me.gql) {
                                //console.log(r.data);
                                //console.log(Object.keys(me.gql)[0]);
                                re = r.data.data[Object.keys(me.gql)[0]];
                            }
                            data.value = re.data || re;
                            //console.log(data)
                            if (re && re.hasOwnProperty('size') && pagination) {
                                pages.value = Math.ceil(re.size / pagination);
                                if (page.value > pages.value)
                                    page.value = 1;
                                me.size = re.size;
                            }
                            //console.log('======');
                            //console.log(me.data);
                            loadStore();
                            emit('loaded', { target: me });
                            emit('row-select', {});
                            me.remoteLoaded = 1;
                            me.loaded = 1;
                            kc.value++;
                        }
                    }).catch(me.error);
                } else {
                    data.value = [];
                    const result = loadStore();
                    if (result.then) result.then(result => { data.value = result });
                    emit('row-select', { target: me });
                }
            } else {
                //data.value = [];
                //loadStore().then(() => emit('loaded', { target: me }));
            }

            console.log("======", data.value);


            //data.value.push({});


            kc.value++;
            me.loaded = 1;
        };
        const rowSelectedCount = computed(() => {
            return selected.value.length;
        })
        load.rowSelectedCount = rowSelectedCount;
        load.src = src;
        load.getForm = formCollector.get;
        load.rowKey = rowKey;
        load.rowSelect = rowSelect;
        const j_is = (el) => {
            return tableRef.value === el;
        }
        load.is = j_is;
        load.remove = (item) => {
            console.log(item, data.value);
            const index = data.value.findIndex(_item => _item === item);
            if (index !== -1) {
                data.value.splice(index, 1);
            }

        };
        load.selected = selected;

        load.type = 'v-table';
        viewCollector.push(load);
        const listener = (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                load();
            }
        }
        onMounted(() => {
            if (autoload === true) load();
            setTimeout(() => {
                const component = ci.proxy;
                const spans = component.$el.querySelectorAll('.v-cloned-header div > span');

                // Obtener la altura máxima
                const maxHeight = Math.max(...Array.from(spans).map(span => span.offsetHeight));

                // Asignar la altura máxima a todos los elementos
                spans.forEach(span => {
                    span.style.height = maxHeight + 'px';
                });
                const filter = component.$el.querySelectorAll('v-filter');
                filter.forEach(f => {
                    console.log(f.querySelectorAll('input').forEach(e => e.addEventListener("keyup", listener)));
                });
            }, 100);
        });
        onUnmounted(() => {
            viewCollector.remove(load);
        });
        expose({ load, rowSelectedCount, j_is })
        return () => {
            const checkColumnWidth = getCheckColumnWidth();
            let tableWidth = 0;
            let hasFilters = 0;
            const children = slots.default({ row: {} });
            const columns = [];
            children.forEach((e, i) => {
                const column = e.props;
                if (e.children && typeof e.children.filter === "function") {
                    e.children.filter((e) => e.type == 'v-filter').forEach((e2) => {
                        column.filter = e2;
                        hasFilters = 1;
                        //console.log(createElement('div',column.filter));
                        e.children.shift();
                        //console.log(createElement('div',column.filter));
                    });
                    e.children.filter((e) => e.type == 'v-footer').forEach((e2) => {
                        column.footer = e2;
                        e.children.shift();
                    });
                }
                tableWidth += column.width ? Number(column.width) : 0;
                columns.push({
                    filter: column.filter,
                    header: column.header,
                    width: column.width
                });
            });

            tableWidth += (selectable0.value ? checkColumnWidth : 0);
            const shb = h('div', { className: 'v-datatable-scrollable-header-box', style: 'left: 0px;' },//position: absolute; height: 47px; 
                h('table', { className: 'v-cloned-header v-table', style: { width: `${tableWidth}px` } }, [
                    selectable0.value ? h('th', { width: checkColumnWidth }, [
                        h('span', {
                            onclick() { rowSelect(null, -10) },
                            className: 'v-check'
                        },
                            h(FontAwesomeIcon, { icon: selected.value.length ? faSquareCheck : faSquare, class: 'fa-lg' })
                        )
                    ]) : null,
                    columns.map((column) => h('th', column, h('div', [

                        h('span', {
                            style: 'display: flex;justify-content: center;align-items: center;'
                        },
                            [column.header]
                        ),
                        h('v-filter', column.filter?.children)

                    ])))
                ])
            );

            return h('div', { ref: tableRef, className: 'v-datatable ' + props.class }, [
                slots.header ? h('div', { className: 'v-datatable-header v-widget-header ui-corner-top' }, slots.header()) : null,
                props.pagination ? h('div', { className: 'v-paginator v-paginator-top v-widget-header v-paginator-pages center' }, [
                    h(VButton, { value: '|<', disabled: page.value <= 1, onClick: () => to(1) }),
                    h(VButton, { value: '<', disabled: page.value <= 1, onClick: () => to(page.value - 1) }),
                    h('div', { style: 'padding:3px 8px;display:inline-block' },
                        [h('input', { type: 'number', style: 'width:60px', value: page.value, onInput: (e) => to(Number(e.target.value), true) }), '/' + pages.value]
                    ),
                    h(VButton, { value: '>', disabled: page.value == pages.value, onClick: () => to(page.value + 1) }),
                    h(VButton, { value: '>|', disabled: page.value == pages.value, onClick: () => to(pages.value) })
                ]) : null,
                h('div', {
                    className: 'v-widget-header v-datatable-scrollable-header',
                    style: 'position: relative; margin-right: 0px;'//height: 110px; 
                },
                    shb
                ),
                h('div', {
                    className: 'v-datatable-scrollable-body', style: 'overflow-y: auto; flex:1',
                    onScroll(e) {
                        const horizontal = e.currentTarget.scrollLeft;

                        shb.el.style.transform = "translateX(-" + horizontal + "px)";
                        //shb.el.style.left = "-" + horizontal + "px";
                        //t[0].style.left = "-" + horizontal + "px";
                    }
                }, [
                    h('table', { className: 'v-table', style: { width: `${tableWidth}px` } }, [
                        /*h('thead', { className: 'v-head-cloned' }, [

                            selectable0.value ? h('th', { width: checkColumnWidth }) : null,

                            ...columns.map((column) => h('th', { width: column.width }))
                        ]),*/
                        h('tbody', { className: 'v-datatable-data', key: kc.value },
                            groupedData.value.length < 1 ? h('td', { colspan: columns.length + (selectable0.value ? 1 : 0) }, props.emptyMessage) : [


                                groupedData.value.map((groupItem) => {
                                    //console.log('groupItem.value', groupItem)
                                    return [

                                        slots['header-group'] ? (h('tr', { className: "v-header-group" }, [
                                            selectable0.value ? h('td') : null,
                                            slots['header-group']({ group: groupItem })
                                        ])) : null


                                        , (groupItem.values.value || groupItem.values).map((row, index) => {
                                            const item = slots.default({ row, index });
                                            item.forEach((e, i) => {

                                                //delete e.props.header;
                                                //delete e.props.width;


                                                if (e.children && typeof e.children.filter === "function") {
                                                    e.children.filter((e) => e.type == 'v-filter').forEach((e2) => {
                                                        hasFilters = 1;
                                                        e.children.shift();
                                                    });
                                                    e.children.filter((e) => e.type == 'v-footer').forEach((e2) => {
                                                        e.children.shift();
                                                    });
                                                }
                                            });

                                            return h('tr', {
                                                class: getRowClass(row),
                                                onclick(e) {
                                                    _selectRow(e, row, index)
                                                }
                                            }, [

                                                selectable0.value ? h('td', { className: 'center' }, h('span', {
                                                    onclick() { rowSelect(row, index) },
                                                    className: 'v-check'
                                                },
                                                    h(FontAwesomeIcon, { icon: isSelected(row) ? faSquareCheck : faSquare, class: 'fa-lg' })
                                                )) : null


                                                , ...item
                                            ])
                                        }),

                                        slots['footer-group'] ? (h('tr', { className: "v-footer-group" }, [
                                            selectable0.value ? h('td') : null,
                                            slots['footer-group']({ group: groupItem })
                                        ])) : null,

                                        slots['extra-group'] ? slots['extra-group']({ group: groupItem, groups: groupedData.value }) : null

                                    ]

                                })


                            ]
                        )
                    ])
                ])
            ]);
        }
    },
    props: {
        class: null,
        value: Array,
        filterKey: String,
        reflow: null,
        summary: null,
        src: String,
        gql: null,
        filters: Object,
        store: null,
        width: null,
        emptyMessage: { default: 'No existen registros' },
        groups: { default: '' },
        rowKey: { default: 'id' },
        rowStyleClass: null,
        pagination: null,
        selectable: { default: true },
        scrollable: null,
        autoload: {
            default: true
        }
    },
    data() {
        const sortOrders = {};
        return {
            resizeAfterUpddate: 0,
            active: 0,
            keyBody: 1,
            row: {},
            kt: 0,
            size: null,
            sortKey: '',
            paginatio_: 0,
            remoteLoaded: null,
            loaded: false,
            sortOrders: sortOrders,
            rowStyleClassFunc: null
        };
    },
    created() {
        const me = this;
        //Si el padre el un tabview debe considerarse q no se esta en la pestaña activa y no deberia cargarse
        if (!(me.$parent.tabs)) {
            //el padre es un tab
            me.active = 1;
        }
        me.paginatio_ = me.pagination ? me.pagination : 0;
        if (me.rowStyleClass) eval('me.rowStyleClassFunc=function(row){return ' + me.rowStyleClass + '}');
    },
    beforeUpdate() {
        var me = this;

        if (me.active) {
            //me.buildColumns();
            if (me.value) {
                // if (me.remoteLoaded == null)
                //   me.data = me.value;
            }
        }
    },
    filters: {
        capitalize(str) {
            return str ? (str.charAt(0).toUpperCase() + str.slice(1)) : str;
        },
    },
    methods: {
        hasSlot(s) {
            return !!this.$slots[s];
        },
        sortBy(/*key*/) {
            //this.sortKey = key
            //this.sortOrders[key] = this.sortOrders[key] * -1
        },
        filter() {
            alert(12);
        }
    }
}
</script>
