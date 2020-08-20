<template>
  <div class="cart-btn" :style="{bottom:`${bottom}rpx`}" @click="goAbout">
    <!-- <button class="hidden-btn" open-type="contact"></button> -->
    <image src="/static/kefu.png" mode="widthFix" style="width:100%" />
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props:["bottom"],
  computed: {
    ...mapState(["cart"])
  },
  methods: {
    goAbout(){
      uni.navigateTo({
        url: "/pages/about"
      });
    },
    goCart() {
      uni.switchTab({
        url: "/pages/cart"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.hidden-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.cart-btn {
  z-index: 99;
  position: fixed;
  bottom: 50rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #ffd66d;
  border-radius: 50%;
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