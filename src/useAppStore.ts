import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { configureAxios, getConfigApp, getPiniaInstance } from "./commons";

const deleteAllCookies = () => {
  // Retrieve all cookies from the document
  const cookies = document.cookie.split(";");

  // Iterate over each cookie and set its expiration date to a past date
  for (let cookie of cookies) {
    const cookieName = cookie.split("=")[0].trim();
    document.cookie =
      `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

export const useAppStore = defineStore("connection", () => {
  const pinia = getPiniaInstance();

  const _config = getConfigApp();

  if (!pinia) {
    throw new Error(
      "Pinia no ha sido inicializado. Llama a setupPinia() en tu app.",
    );
  }

  const connected = ref<boolean>(false);

  const unauthorized = ref<boolean>(false);

  const router = ref(_config.router);

  const axios = ref(_config.axios);

  const session = ref<Record<string, any> | null>(null);

  const networkStatus = ref<Record<string, any> | null>(null);

  connected.value = localStorage.getItem("connected") !== "false";

  const refreshSession = async () => {
    axios.value.noInterceptor = 1;
    const url = axios.value.VITE_LOGIN_PATH + "/refresh";
    console.log("REFRESH URL:", url);
    const { data } = await axios.value.post(
      url,
      {},
      {
        withCredentials: true,
      },
    );

    const {
      token,
      user_nicename,
      perms,
    } = data;

    session.value = {
      token,
      people: {
        display_name: user_nicename,
      },
      perms,
    };

    return session.value;
  };

  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleRefresh = () => {
    if (refreshTimer) {
      return;
    }

    refreshTimer = setTimeout(async () => {
      refreshTimer = null;

      try {
        await refreshSession();
        scheduleRefresh();
      } catch (e) {
        console.error("Error refreshing session", e);
      }
    }, 10 * 60 * 1000);
  };

  watch(session, (newValue: any) => {
    if (newValue?.token) {
      // Token solamente en memoria
      axios.value.defaults.headers.common.Authorization =
        `Bearer ${newValue.token}`;

      // Persistimos sesión offline SIN token
      const {
        token,
        ...cachedSession
      } = newValue;

      localStorage.setItem(
        "session",
        JSON.stringify(cachedSession),
      );

      scheduleRefresh();
    } else {
      // Puede haber people/perms cacheados,
      // simplemente no tenemos access token.
      delete axios.value.defaults.headers.common.Authorization;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
    }
  });

  const s = localStorage.getItem("session");
  session.value = s ? JSON.parse(s) : null;

  watch(connected, (newValue: any) => {
    localStorage.setItem("connected", String(newValue));
  });

  const online = computed(() => networkStatus.value?.connected);

  const networkStatusChange = (status: any) => {
    networkStatus.value = status;
  };

  const logout = async () => {
    try {
      await axios.value.get("/api/logout");
    } finally {
      session.value = null;
      localStorage.removeItem("session");

      delete axios.value.defaults.headers.common.Authorization;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }

      deleteAllCookies();

      // Recarga la ruta actual.
      // El guard detectará la ausencia de sesión y redirigirá al login,
      // conservando la ruta actual como destiny.
      router.value.go(0);
    }
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

  return {
    connected,
    session,
    logout,
    refreshSession,
    unauthorized,
    connect,
    authenticated,
    config,
    axios,
    router,
    online,
    networkStatusChange,
  };
});
