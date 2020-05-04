<script lang="ts">
import Vue from "vue";
import { getIn } from "@/util";
export default Vue.extend({
  mpType: "app",
  onLaunch() {
  },
  methods: {

  },
  onLoad() {
    console.log("load");
  },
  onShow() {
    this.$store.commit('retriveUser')
    this.$store.dispatch('fetchTotalList')
    this.$store.commit('retriveCart')
  },
  onHide() {
    console.log("App Hide");
  }
});
</script>

<style lang="scss">
/*每个页面公共css */
</style>
