<script>
import { computed, ref, h } from 'vue'
import VButton from './v-button.vue';
import { clean, HTML2Canvas, sum, networkStatus, db, getStoredList, whichChild } from './commons'
import axios from 'axios';

export default ({
    name: 'VTable',
    setup(props, cxt) {
        const selectable0 = ref(1)
        const scrollable0 = ref(0);
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
        const getCheckColumnWidth = () => (42);
        const columns = [];
        const page = ref(1);
        const hasFilters = ref(0);
        const { slots, expose, emit } = cxt;
        //console.log(cxt);
        const loadStore = async () => {
            var me = props, store = me.store;
            if (store != null) {
                var datj;
                if (db) datj = await getStoredList(store);
                if (!datj) datj = [];
                data.value = data.value ? datj.concat(data.value) : datj;
            }
            return data_;
        }
        const _selectRow = (event, rec, r) => {
            if (selectable0.value && whichChild(event.target) == 0)
                return;
            //se debe tener en cuenta si es 
            //record, numero fila 
            rowSelect(rec, r, 1);
        }
        const rowSelect = (r, i, c) => {
            var me = this, j;
            if (i === -10) {
                if (filteredData.value.length === selected.value.length) {
                    selected.value = [];
                } else {
                    selected.value = [];
                    for (j = 0; j < filteredData.value.length; j++) {
                        selected.value.push(j);
                    }
                }
            } else if (c) {
                if (selectable0.value || !selected.value.contains(i))
                    selected.value = [i];
                else {
                    selected.value = [];
                    r = null;
                }
            } else if (!me.selected.contains(i)) {
                selected.value.push(i);
            } else {
                selected.value.splice(selected.value.indexOf(i), 1);
                r = null;
            }
            var s2 = [], s = selected.value.sort((a, b) => { return a - b; });
            for (var i = 0; s.length > i; i++) {
                s2.push(data.value[s[i]]);
            }
            emit('row-select', { target: me, current: r, selection: s2 });
        }
        const isSelected = (r) => {
            return selected.value.includes(r);
        }
        const getRowClass = (r, row) => {
            const cls = [];
            if (props.selectable && isSelected(r)) cls.push('v-selected');
            if (props.rowStyleClassFunc) cls.push(props.rowStyleClassFunc(row));
            return cls;
        }
        let s = ('' + props.selectable);
        selectable0.value = (s != 'false' && s != '0') ? 1 : 0;
        s = ('' + props.scrollable);
        scrollable0.value = (props.scrollable && s != 'false' && s != '0') ? 1 : 0;
        const children = slots.default({ row: {} });
        if (children) {
            //me.columns=[];
            children.forEach((e, i) => {
                const column = e.props;
                if (e.children && e.children.filter) {
                    //console.log('-', e.children);
                    e.children.filter((e) => e.type == 'v-filter').forEach((e2) => {
                        column.filter = e2;
                        hasFilters.value = 1;
                        //console.log(createElement('div',column.filter));
                        e.children.shift();
                        //console.log(createElement('div',column.filter));
                    });
                    e.children.filter((e) => e.type == 'v-footer').forEach((e2) => {
                        column.footer = e2;
                        e.children.shift();
                    });
                }
                columns.push({
                    filter: column.filter,
                    header: column.header,
                    width: column.width
                });
            });
        }
        const load = (/*s*/) => {
            const me = props;
            selected.value = [];
            if (me.value) {
                data.value = me.value;
            }
            if (me.src) {
                var s = me.src;
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
                    var request;
                    if (me.gql) {
                        const gql = me.gql;
                        const query = ('query{' + Object.keys(gql)[0] + '(offset:' + ((page.value - 1) * pagination)
                            + ' limit:' + (pagination) + '){\ndata{' + gql[Object.keys(gql)[0]] + '}\nsize\n}\n}');

                        request = axios.post(me.src, { query: query });
                    } else {
                        request = axios.get(s, { params: clean(me.filters) });
                    }
                    request.then((r) => {
                        if (r.data && r.data.error) {
                            MsgBox(r.data.error);
                        } else {
                            var re = r.data;
                            if (me.gql) {
                                //console.log(r.data);
                                //console.log(Object.keys(me.gql)[0]);
                                re = r.data.data[Object.keys(me.gql)[0]];
                            }
                            data.value = re.data || re;
                            //console.log(data)
                            if (re && re.hasOwnProperty('size') && pagination) {
                                me.pages = Math.ceil(re.size / pagination);
                                if (page.value > me.pages)
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
                            me.kc++;
                        }
                    }).catch(me.error);
                } else {
                    data.value = [];
                    const result = loadStore();
                    if (result.then) result.then(result => { data.value = result });
                    emit('row-select', { target: me });
                }
            } else {
                data.value = [];
                loadStore().then(() => emit('loaded', { target: me }));
            }
            me.kc++;
            me.loaded = 1;
        };
        expose({ load })
        return () => {
            const checkColumnWidth = getCheckColumnWidth();
            const shb = h('div', { className: 'v-datatable-scrollable-header-box', style: 'position: absolute; height: 47px; left: 0px;' },
                h('table', { className: 'v-cloned-header v-table', style: 'width: 1536px;' }, [
                    h('th', { width: checkColumnWidth }, [
                        h('span', { className: 'v-check' }, h('i', { className: 'fa fa-lg' }))
                    ]),
                    columns.map((column) => h('th', column, [
                        column.header,
                        column.filter?.children
                    ]))
                ])
            );
            return h('div', { className: 'v-datatable' }, [
                h('div', { className: 'v-datatable-header v-widget-header ui-corner-top' }, slots.header()),
                h('div', { className: 'v-paginator v-paginator-top v-widget-header v-paginator-pages center' }, [
                    h(VButton, { value: '|<' }),
                    h(VButton, { value: '<' }),
                    h('input', { type: 'number', style: 'width:60px' }),
                    h(VButton, { value: '>' }),
                    h(VButton, { value: '>|' })
                    //  <v-button value="|<" :disabled="page<=1" v-on:click.prevent="to(1)"/>
                    //<v-button value="<" v-on:click.prevent="to(page-1)" :disabled="page<=1"/><div style="padding:3px 8px;display:inline-block">
                    //<input type="number" v-on:change="to(page,true)" style="width:60px" min="1" :max="pages" v-model="page"/> / {{pages}}</div>
                    //<v-button value=">" v-on:click.prevent="to(page+1)" :disabled="page==pages"/>
                    //<v-button v-on:click.prevent="to(pages)" value=">|" :disabled="page==pages"/>
                ]),
                h('div', {
                    className: 'v-widget-header v-datatable-scrollable-header',
                    style: 'position: relative; height: 110px; margin-right: 0px;'
                },
                    shb
                ),
                h('div', {
                    className: 'v-datatable-scrollable-body', style: 'overflow-y: auto; flex:1',
                    onScroll(e) {
                        const horizontal = e.currentTarget.scrollLeft;
                        shb.el.style.left = "-" + horizontal + "px";
                        //t[0].style.left = "-" + horizontal + "px";
                    }
                }, [
                    h('table', { className: 'v-table', style: 'width: 1536px;' }, [
                        h('thead', { className: 'v-head-cloned' }, [
                            h('th', { width: checkColumnWidth }),
                            ...columns.map((column) => h('th', { width: column.width }))
                        ]),
                        h('tbody', { className: 'v-datatable-data' },
                            sortedData.value.length < 1 ? h('td', { colspan: columns.length + (selectable0.value ? 1 : 0) }, props.emptyMessage) : [

                                sortedData.value.map((row, index) => {
                                    const item = slots.default({ row });
                                    item.forEach((e, i) => {
                                        //console.log(e);
                                        delete e.props.header;
                                        delete e.props.width;
                                        if (e.children) {
                                            e.children.filter((e) => e.type == 'v-filter').forEach((e2) => {
                                                hasFilters.value = 1;
                                                e.children.shift();
                                            });
                                            e.children.filter((e) => e.type == 'v-footer').forEach((e2) => {
                                                e.children.shift();
                                            });
                                        }
                                    });
                                    return h('tr', {
                                        className:getRowClass(index,row),
                                        onclick(e) {
                                            _selectRow(e, row, index)
                                        }
                                    }, [h('td', { width: 24 }), ...item])
                                })]
                        )
                    ])
                ])
            ]);
        }
    },
    props: {
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
        rowKey: { default: 'id' },
        rowStyleClass: String,
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
            pages: 1,
            resizeAfterUpddate: 0,
            active: 0,
            kc: 1,
            keyBody: 1,
            columns: null,
            row: {},
            hasFilters: 0,
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
    mounted() {
        var me = this;
        //console.log('mounted');
        //me.columns.forEach(e=>{console.log(e.filter)});
        //console.log(me.$el.querySelectorAll('.v-datatable-scrollable-header-box > th'));
        var h = me.$el.style ? me.$el.style.height : null;
        if (h) {
            me.scrollable0 = 1;
            //console.log('scroll for '+me.$el.id);
            me.resizeAfterUpddate = 1;
        }
        if (!!(me.$parent.tabs)) {
            me.$el.addEventListener("tabChange", (e) => {
                me.active = 1;
                var k = e.$target.k;
                if (me.kt != k) {
                    me.load();
                    me.kt = k;
                }
            });
        }
        if (me.active) {
            me.buildColumns();
            //if(me.autoload===true)me.load();
        }
        me.$el.addEventListener("parentResize", (e) => {
            me.resize(e.height);
        });
        me.$el.addEventListener("command", (e) => {
            switch (e.name) {
                case 'refresh':
                    if (!e.key || me.$el.getAttribute('refresh') != e.key) {
                        me.load();
                        me.$el.getAttribute('refresh', e.key);
                        break;
                    }
            }
        });
        if (h) {
            me.resize(parseInt(h));
        } else {
            // me.resize(me.$el.offsetHeight);
        }
        //console.log('mointed');
    },
    created() {
        var me = this;

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
            me.buildColumns();
            if (me.value) {
                if (me.remoteLoaded == null)
                    me.data = me.value;
            }
        }
    },
    updated() {
        var me = this;
        if (me.resizeAfterUpddate) {
            me.resize(parseInt(me.$el.style.height));
            me.resizeAfterUpddate = 0;
        }

        me.paginatio_ = me.pagination ? me.pagination : 0;
        var t = me.$el.querySelectorAll(".v-table");
        var p = me.$el.querySelectorAll(".v-datatable-scrollable-header-box")[0];
        if (p) {
            //console.log(me.co);
            var clonedHeader = me.$el.querySelectorAll(".v-cloned-header");
            if (clonedHeader.length === 0) {
                clonedHeader = document.createElement("table");
                var originalHeader = t[0].querySelectorAll("thead")[0];

                var tw = 0;
                var maxLabelHeight = 0;
                var ca = document.createElement('canvas');
                var cs = window.getComputedStyle(p);
                var ctx = ca.getContext("2d");
                ctx.font = cs.fontSize + " PTSans";
                var filtersMap = {};
                var listener = (event) => {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        me.load();
                    }
                }
                var th = originalHeader.childNodes[0].querySelectorAll("th");
                me.columns.forEach(e => {
                    if (e.filter) {
                        e.filter.elm.querySelectorAll('input').forEach(e => e.addEventListener("keyup", listener));
                    }
                });
                var ht = new HTML2Canvas({ lineHeight: parseInt(cs.lineHeight), ctx: ctx }), i, tw = 0;
                th.forEach((e, i) => {
                    e.childNodes[0].onclick = sortClick;
                    var f = me.columns[(i - (selectable0.value ? 1 : 0))];
                    //cltd.setAttribute("ind", '' + (i - (me.selectable0?1:0)));
                    if (f && f.filter && f.filter.elm) {
                        //console.log(f.filter.elm.children);
                        //console.log(typeof f.filter.elm.children);
                        if (f.filter.elm.children.forEach)
                            f.filter.elm.children.forEach(ef => e.appendChild(ef));
                        else
                            for (let ef of f.filter.elm.children) {
                                e.appendChild(ef);
                            }
                    } else if (i > 0 && me.hasFilters) {
                        var input = document.createElement("input");
                        input.disabled = "disabled";
                        input.className = "center"; // set the CSS class
                        e.appendChild(input);
                    }

                    if (e.clientHeight > maxLabelHeight)
                        maxLabelHeight = e.clientHeight;
                    tw += parseInt(e.width);
                    var hh = e.childNodes[0].offsetHeight;
                    hh = ht.heightText(e.childNodes[0].textContent, parseInt(e.width));
                    e.childNodes[0].style.width = e.width + 'px';
                    e.childNodes[0].style.display = 'table-cell';
                    e.childNodes[0].style.verticalAlign = 'middle';
                    if (hh > maxLabelHeight) maxLabelHeight = hh;
                });
                th.forEach((e, i) => {
                    if (i) e.childNodes[0].style.height = maxLabelHeight + 'px';
                    clonedHeader.appendChild(e);
                });
                th.forEach((e, i) => {
                    var e2 = document.createElement('th');
                    e2.width = e.width;
                    originalHeader.childNodes[0].appendChild(e2);
                });
                t[0].style.width = tw + 'px';
                t[0].width = tw;
                //console.log(t);
                if (t.length > 1) {
                    t[1].style.width = tw + 'px';
                    t[1].width = tw;
                    t[0].parentNode.style.overflowX = 'hidden';
                    t[0].parentNode.style.position = 'relative';
                    t[0].style.position = 'absolute';
                    t[0].parentNode.style.height = '150px'
                    t[1].parentNode.addEventListener("scroll", (e) => {
                        var horizontal = e.currentTarget.scrollLeft;
                        p.style.left = "-" + horizontal + "px";
                        t[0].style.left = "-" + horizontal + "px";
                    });
                    var ts = t[1].querySelectorAll('td');
                    //se debe considerar las columnas agregadas como el selector
                    for (i = 0; i < th.length; i++) {
                        if (ts[i])
                            ts[i].style.width = th[i].width + 'px';
                    }
                } else {

                    t[0].parentElement.addEventListener("scroll", (e) => {
                        var horizontal = e.currentTarget.scrollLeft;
                        p.style.left = "-" + horizontal + "px";
                    });
                }
                clonedHeader.style.width = tw + 'px';
                var sortClick = (e) => {
                    var sort = me.columns[e.target.parentNode.getAttribute("ind")].sort;
                    if (sort == me.sorter) me.sortDir = me.sortDir * -1;
                    me.sorter = sort;
                };

                clonedHeader.className = "v-cloned-header v-table";
                p.appendChild(clonedHeader);
                p.appendChild(p.firstChild);
                p.style.position = 'absolute';
                //no se para q agrego 37  -------
                p.style.height = (maxLabelHeight + 37 - 37) + 'px';
                //.v-widget-header
                p.parentElement.style.height = p.style.height;

                if (me.$el.style.maxHeight)
                    p.parentElement.nextElementSibling.style.maxHeight = (parseInt(me.$el.style.maxHeight) - maxLabelHeight) + 'px';

                originalHeader.className = 'v-head-cloned';
            }
            //resize();
        }
        var svg = me.$el.querySelectorAll('.v-check > svg');
        for (i = 0; i < svg.length; i++) {
            //square-check':'square
            svg[i].dataset.icon = svg[i].parentNode.dataset.icon;
        }
        if (me.loaded) {
            var group = me.$el.querySelectorAll('.group');
            for (var k = 0; k < group.length; k++) {
                group[k].parentNode.removeChild(group[k]);
            }
            //emit('updated',me);
            me.loaded = 0;
        }
    },
    filters: {
        capitalize(str) {
            return str ? (str.charAt(0).toUpperCase() + str.slice(1)) : str;
        },
        rowSelectedCount() {
            return this.selected.length;
        }
    },
    watch: {
        kc(nv) {
            var me = this;
            setTimeout(function () {
                emit('updated', me);
            }, 100);
        }
    },
    methods: {
        buildColumns() { },
        resize(h) {
            var el = this.$el;
            setTimeout(() => {
                //h=el.style.maxHeight?Math.min(parseInt(el.style.maxHeight,10),h):h;
                var e = el.querySelector(".v-datatable-header");
                if (e) h -= e.offsetHeight;
                e = el.querySelector(".v-paginator");
                if (e) h -= e.offsetHeight;
                e = el.querySelector(".v-datatable-scrollable-header");
                if (e) {
                    e.style.height = e.querySelector("table").offsetHeight + 'px';
                    h -= e.offsetHeight;
                }
                e = el.querySelector(".v-table-summary");
                if (e) {
                    h -= e.offsetHeight;
                }
                e = el.querySelector(".v-datatable-scrollable-body");
                const scrollbarWidth = e.offsetWidth - e.clientWidth;
                e.style.overflowY = 'auto';
                e.style.height = h + 'px';

                e = el.querySelector(".v-datatable-scrollable-header-box");
                if (e) {
                    e.parentNode.style.marginRight = scrollbarWidth + 'px';
                }
                e = el.querySelector(".v-table-summary");
                if (e) {
                    e.style.overflowY = 'hidden';
                    e.style.marginRight = scrollbarWidth + 'px';
                }

            }, 100);
        },
        to(n, v) { this.loadP(n, v) },
        loadP(n, v) {
            var m = this;
            //console.log('m.page != n=' + (m.page != n));
            if (m.page != n || v) {
                m.page = n;
                m.load()
            }
        },
        rowCreated(/*r*/) {
            /*this.$parent.$parent.row=r;
             console.log(this.$parent.$parent.row);
             this.$emit('row',r);*/
        },
        hasSlot(s) {
            return !!this.$slots[s];
        },
        sortBy(/*key*/) {
            //this.sortKey = key
            //this.sortOrders[key] = this.sortOrders[key] * -1
        },
        rowSelect(r, i, c) {
            var me = this, j;
            if (i === -10) {
                if (filteredData.value.length === me.selected.length) {
                    me.selected = [];
                } else {
                    me.selected = [];
                    for (j = 0; j < filteredData.value.length; j++) {
                        me.selected.push(j);
                    }
                }
            } else if (c) {
                if (selectable0.value || !me.selected.contains(i))
                    me.selected = [i];
                else {
                    me.selected = [];
                    r = null;
                }
            } else if (!me.selected.contains(i)) {
                me.selected.push(i);
            } else {
                me.selected.splice(me.selected.indexOf(i), 1);
                r = null;
            }
            var s2 = [], s = me.selected.sort((a, b) => { return a - b; });
            for (var i = 0; s.length > i; i++) {
                s2.push(me.data[s[i]]);
            }
            emit('row-select', { target: me, current: r, selection: s2 });
        },
        async getStoredList(store) {
            let p = new Promise((resolve) => {
                console.log(db)
                var t = db.transaction(store), objectStore = t.objectStore(store);//,d=[];
                var r = objectStore.getAll();
                r.onsuccess = function () {
                    resolve(r.result);
                }
                //t.onerror = event => reject(event.target.error);
            });
            try {
                let result = await p;
                //console.log(result);
                return result;
            } catch (e) {
                alert(store);
                throw e;
            }
        },
        filter() {
            alert(12);
        }
    }
})
</script>
