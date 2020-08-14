<template>
  <div class="bg">
    <div class="middle">
      <icon :type="result==='success'?'success':'warn'" size="46" />
      <div class="success-txt">{{result==='success'?'支付成功':'支付失败'}}</div>
      <div class="button" @click="backHome">返回主页</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      result: "",
    };
  },
  onShow() {
    const { result } = this.$mp.query;
    if (result === "error") {
      uni.setNavigationBarTitle({
        title: "支付失败",
      });
    } else {
      uni.setNavigationBarTitle({
        title: "支付成功",
      });
    }
    this.result = result || "success";
  },
  methods: {
    backHome() {
      uni.switchTab({
        url: "/pages/index",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.middle {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  .success-txt {
    padding: 40rpx 0;
  }
  .button {
    background: #fcd81d;
    padding: 20rpx 40rpx;
    border-radius: 20rpx;
  }
}
</style>