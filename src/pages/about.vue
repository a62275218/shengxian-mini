<template>
  <div class="bg">
    <div class="white-card about-card">
      <div class="intro">
        农夫生鲜Fresh Go是面向墨尔本华人的一站式生鲜购物平台,
        以“品质优选”为标准，聚合当地知名供货商, 为您优选各种果蔬肉禽、冷冻速食、粮油副食、零食干货等20多个品类的生鲜产品。
        源头直采，严格品控和全程冷链配送，一切尽在农夫生鲜Fresh Go!
        <br />买生鲜, 找农夫, 农夫生鲜Fresh Go让您买生鲜美食轻松无忧!
        <br />真诚为您服务, 请加客服微信号:
      </div>
      <div class="row" v-for="(item,index) in serviceList" :key="item.id">
        <div>
          <div>微信号: {{item.wxId}}</div>
          <div class="light">客服{{index+1}}号</div>
        </div>
        <div class="copy" @click="copy(item.wxId)">点此复制</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["serviceList"]),
  },
  methods: {
    copy(text) {
      uni.setClipboardData({
        data: text,
        success: function () {
          uni.showToast({ title: "复制成功" });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.intro {
  line-height: 2;
  margin-bottom: 40rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .light {
    font-size: 26rpx;
    color: $gray-color;
    margin-top: 10rpx;
  }
  .copy {
    color: #fcd81d;
  }
}
.about-card {
  padding: 40rpx;
  //margin:40rpx;
}
</style>