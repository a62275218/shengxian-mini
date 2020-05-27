<template>
  <div class="bg">
    <block v-if="historyList.length">
      <div class="row-card">
        <div
          class="row"
          v-for="product in historyList"
          :key="product.id"
          @click="goDetail(product.id)"
        >
          <div class="left">
            <image :src="product.imgUrls[0]" mode="widthFix" style="min-width:180rpx;width:180rpx" />
            <div class="title">{{product.title}}</div>
          </div>
          <div>
            <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:40rpx;" />
          </div>
        </div>
      </div>
    </block>
    <block v-else>
      <div class="empty">暂无浏览历史</div>
    </block>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["historyList"])
  },
  methods: {
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product?id=${id}` });
    }
  }
};
</script>

<style lang="scss" scoped>
.bg {
  padding: 20rpx;
  .row {
    .left {
      display: flex;
      align-items: center;
      .title {
        margin-left: 20rpx;
      }
    }
  }
}
</style>