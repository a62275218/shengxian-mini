import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import { getIn, request, debounce, throttle } from "./util";
import imagep from "@/components/imagep.vue";
import skeleton from "@/components/skeleton.vue";
import searchbar from "@/components/searchbar.vue";
import productcard from "@/components/productcard.vue";
import tabbar from "@/components/tabbar.vue";
import custommodal from "@/components/custommodal.vue";
import numberbox from "@/components/numberbox.vue";
import cartbtn from "@/components/cartbtn.vue";
import uniCalendar from "@/components/uni-calendar/uni-calendar.vue";

Vue.config.productionTip = false;
Vue.prototype.$store = store;
Vue.prototype.$getIn = getIn;
Vue.prototype.$request = request;
Vue.prototype.$debounce = debounce;
Vue.prototype.$throttle = throttle;
Vue.component("imagep", imagep);
Vue.component("skeleton", skeleton);
Vue.component("searchbar", searchbar);
Vue.component("productcard", productcard);
Vue.component("tabbar", tabbar);
Vue.component("custommodal", custommodal);
Vue.component("numberbox", numberbox);
Vue.component("uniCalendar", uniCalendar);
Vue.component("cartbtn",cartbtn)

new App().$mount();
