<template>
  <div class="bg">
    <div class="white-card about-card">
      <div class="row" v-for="(item,index) in serviceList" :key="item.id">
        <div>客服微信{{index+1}}: {{item.wxId}}</div>
        <div class="copy" @click="copy(item.wxId)">点此复制</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["serviceList"])
  },
  methods: {
    copy(text) {
      uni.setClipboardData({
        data: text,
        success: function() {
          uni.showToast({ title: "复制成功" });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  justify-content: space-between;
  .copy {
    color: #fcd81d;
  }
}
.about-card {
  padding: 40rpx;
  //margin:40rpx;
}
</style>