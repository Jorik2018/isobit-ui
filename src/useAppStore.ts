import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { configureAxios, getPiniaInstance, getConfigApp } from './commons';

const deleteAllCookies = () => {
    // Retrieve all cookies from the document
    const cookies = document.cookie.split(";");

    // Iterate over each cookie and set its expiration date to a past date
    for (let cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
}

export const useAppStore = defineStore('connection', () => {

    const pinia = getPiniaInstance();

    const _config = getConfigApp();

    if (!pinia) throw new Error('Pinia no ha sido inicializado. Llama a setupPinia() en tu app.');

    const connected = ref<boolean>(false);

    const unauthorized = ref<boolean>(false);

    const router = ref(_config.router);

    const axios = ref(_config.axios);

    const session = ref<Record<string, any> | null>(null);

    const networkStatus = ref<Record<string, any> | null>(null);

    connected.value = localStorage.getItem('connected') !== 'false';

    /*connected: {
        get() {
            return this.online && this.x_connected_ !== false;
        },
        set(v) {
            let me = this;
            let session = me.session;
            this.x_connected_ = v;
            //session.connected=v;
            this.$set(session, 'connected', v);
            me.session = session;
            console.log(me);
        },
    }*/
    const refresh = (callback: Function) => {
        setTimeout(() => {
            if (session.value) {
                axios.value.noInterceptor = 1;
                axios.value.post(axios.value.VITE_LOGIN_PATH + '/refresh', {}
                    //, { withCredentials: true }
                )
                    .then(({ data }) => {
                        const { token, user_nicename, perms } = data;
                        session.value = { token, people: { display_name: user_nicename }, perms };
                        callback(refresh)
                    }).catch((e) => {
                        console.error(e);
                        //alert(JSON.stringify(e.data))
                    });
            }
        }, 1000 * 1 * 600);
    }

    let startRefresh: any;

    watch(session, (newValue: any) => {
        if (newValue && newValue.token) {
            axios.value.defaults.headers.common = {
                Authorization: `Bearer ` + newValue.token,
            };
            localStorage.setItem('session', JSON.stringify(newValue));
            if (!startRefresh) {
                startRefresh = refresh;
                refresh(refresh);
            }
        } else {
            localStorage.removeItem('session');
            startRefresh = null;
        }
    });

    const s = localStorage.getItem('session');
    session.value = s ? JSON.parse(s) : null;

    watch(connected, (newValue: any) => {
        localStorage.setItem('connected', String(newValue));
    });

    const online = computed(() => networkStatus.value?.connected);

    const networkStatusChange = (status: any) => {
        networkStatus.value = status;
    };

    const logout = () => {
        //connected.value = false;
        session.value = null;
        //localStorage.removeItem('connected');
        deleteAllCookies();
        router.value.push('/login');
    };

    const authenticated = computed(() => !!session.value?.token);

    const config = ({ axios: axiosInstance, router: routerInstance }: any) => {
        if (routerInstance) {
            //console.log('setRouter==', router)
            router.value = routerInstance;
        }
        if (axiosInstance) {
            //console.log('setAxios==', axios)
            axios.value = axiosInstance;
            configureAxios(axiosInstance);
        }
    };

    const connect = (value: Record<string, any>) => {
        session.value = value;
        router.value.push("/admin");
    };

    return { connected, session, logout, unauthorized, connect, authenticated, config, axios, router, online, networkStatusChange };
});