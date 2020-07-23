<script lang="ts">
import Vue from "vue";
import { getIn } from "@/util";
export default Vue.extend({
  mpType: "app",
  onLaunch() {
    
  },
  methods: {},
  onLoad() {
    console.log("load");
  },
  onShow() {
    this.$store.dispatch("getBaseUrl").then(() => {
      this.$store.dispatch("retriveUser");
      this.$store.dispatch("fetchTotalList");
      this.$store.dispatch("fetchServiceList");
      this.$store.commit("retriveCart");
      this.$store.commit("retriveHistory");
    });
  },
  onHide() {
    console.log("App Hide");
  },
});
</script>

<style lang="scss">
/*每个页面公共css */
</style>
