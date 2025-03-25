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

    const s = localStorage.getItem('session');


    session.value = s ? JSON.parse(s) : null;
    const refresh = (callback) => {
        setTimeout(() => {
            axios.value.noInterceptor = 1;
            if (localStorage.getItem('session')) {
                axios.value.post('/jwt-auth/v1/token', {}, { withCredentials: true })
                    .then(({ data }) => {
                        const { token, user_nicename, perms } = data;
                        session.value = { token, people: { display_name: user_nicename }, perms };
                        callback(refresh)
                    }).catch((e) => {
                        alert(JSON.stringify(e.data))
                    });
            }
        }, 1000 * 1 * 60);
    }
    if (session.value && session.value.token) {
        refresh(refresh);
    }
    watch(connected, (newValue: any) => {
        localStorage.setItem('connected', String(newValue));
    });

    watch(session, (newValue: any) => {

        if (newValue && newValue.token) {
            axios.value.defaults.headers.common = {
                Authorization: `Bearer ` + newValue.token,
            };
            localStorage.setItem('session', JSON.stringify(newValue));
        } else {
            localStorage.removeItem('session');
        }
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