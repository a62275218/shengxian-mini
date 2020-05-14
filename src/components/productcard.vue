<template>
  <div class="product" @click="goDetail(item.id)">
    <div class="item" :style="{height}">
      <div class="tag" >
        <image src="/static/tag.png" style="width:100%;height:100%;" />
        <div class="font">{{item.tagName.slice(0,2)}}</div>
      </div>
      <div class="img" :style="{height:imgHeight}">
        <imagep :src="item.imgUrls[0]" />
      </div>
      <div class="title">{{item.title}}</div>
      <div class="price">
        <span>{{item.price}}</span>
        <span>/{{item.unit}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["item", "height"],
  methods: {
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product?id=${id}` });
    }
  }
};
</script>

<style lang="scss">
.product {
  width: 100%;
  box-sizing: border-box;
  background: #f7f7f7;
  .item {
    position: relative;
    padding: 20rpx;
    height: 400rpx;
    border-radius: 10rpx;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 28rpx;
    .tag {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      z-index: 200;
      width:70rpx;
      height:84rpx;
      .font {
        width: 60%;
        text-align: center;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 0);
        color: #fff;
        font-size: 22rpx;
      }
    }
    .title {
      width: 100%;
      height: 38rpx;
      text-align: left;
      margin-bottom: 10rpx;
      color: #333333;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .price {
      width: 100%;
      text-align: left;
      justify-self: flex-end;
      span:nth-child(1) {
        color: #ff9f24;
      }
      span:nth-child(2) {
        color: #bfbfbf;
      }
    }
    .img {
      overflow: hidden;
      height: calc(100% - 60px);
      width: 100%;
      margin-bottom: 20rpx;
      image {
        height: 200rpx;
      }
    }
  }
}
</style>