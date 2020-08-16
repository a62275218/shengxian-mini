<template>
  <view>
    <web-view :src="url" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: "",
      timer: null,
      stopPolling: false,
      bound: false,
    };
  },
  onShow() {
    const { url, partnerOrderId, orderId } = this.$mp.query;
    this.url = decodeURIComponent(url);
    this.pollResult(partnerOrderId, orderId);
  },
  methods: {
    pollResult(partnerOrderId, orderId) {
      if (this.stopPolling) {
        return;
      }
      this.timer = setInterval(async () => {
        const res = await this.$request("royalpayCheckOrder", {
          data: {
            partnerOrderId,
            orderId,
          },
        });
        if (this.stopPolling) {
          return;
        }
        if (res === "success") {
          this.stopPolling = true;
          uni.reLaunch({ url: "/pages/payresult" });
          this.$request("updateOrder", {
            data: {
              orderId: orderId,
              paymentWay: "澳元转账",
              status: "待配送",
            },
          });
        } else if (res === "error") {
          this.stopPolling = true;
          uni.reLaunch({ url: "/pages/payresult?result=error" });
        }
      }, 2000);
    },
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
};
</script>

<style>
</style>