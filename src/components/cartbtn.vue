<template>
  <div class="cart-btn" @click="goCart">
    <image src="/static/cart-icon.png" mode="widthFix" style="width:100%" />
    <div class="number" v-if="cart.length">{{cart.length}}</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["cart"])
  },
  methods: {
    goCart() {
      uni.switchTab({
        url: "/pages/cart"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.cart-btn {
  z-index: 100;
  position: fixed;
  bottom: 160rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background:#fff;
  border-radius:50%;
  .number {
    position: absolute;
    width: 40rpx;
    height: 40rpx;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    background: red;
    color: #fff;
    text-align: center;
    font-size: 28rpx;
  }
}
</style>