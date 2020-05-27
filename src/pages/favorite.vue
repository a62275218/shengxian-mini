<template>
  <div class="bg">
    <block v-if="likeList.length">
      <div class="row-card">
        <div
          class="row"
          v-for="product in likeList"
          :key="product.id"
          @click="goDetail(product.id)"
        >
          <div class="left">
            <image :src="product.imgUrls[0]" mode="widthFix"  style="min-width:180rpx;width:180rpx" />
            <div class="title">{{product.title}}</div>
          </div>
          <div>
            <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:40rpx;" />
          </div>
        </div>
      </div>
    </block>
    <block v-else>
      <div class="empty">暂无收藏内容</div>
    </block>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["userInfo", "productList"]),
    likeList() {
      return this.productList.filter(item => {
        return this.userInfo.likeList.find(id => {
          return id === item.id;
        });
      });
    }
  },
  mounted() {
    this.$store.dispatch("retriveUser");
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