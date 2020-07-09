<template>
  <div class="product">
    <div class="item" :style="{height}">
      <div class="lack-tag" v-if="Number(item.storageNum) <1">补货中</div>
      <div class="tag" v-else-if="judgeTagContent().length">
        <image src="/static/tag.png" style="width:100%;height:100%;" />
        <div class="font">{{judgeTagContent()}}</div>
      </div>
      <div class="img" :style="{height:imgHeight}" @click="goDetail(item.id)">
        <div class="mask" v-if="Number(item.storageNum) <1"></div>
        <imagep :src="item.imgUrls[0]" />
      </div>
      <div class="title">{{item.title}}</div>
      <div class="detail" v-if="item.detail">{{item.detail}}</div>
      <div class="product-bot">
        <div class="price">
          <span style="font-size:30rpx;">${{item.price}}</span>
          <span>/{{item.unit}}</span>
        </div>
        <div class="num" v-if="!breakLine">
          <div class="btn" v-if="num>0" @click="removeCart">-</div>
          <div class="number" v-if="num>0">{{num}}</div>
          <div class="btn" @click="addCart" v-if="Number(item.storageNum)>0">+</div>
        </div>
      </div>
      <div class="num" v-if="breakLine">
        <div class="btn" v-if="num>0" @click="removeCart">-</div>
        <div class="number" v-if="num>0">{{num}}</div>
        <div class="btn" @click="addCart" v-if="Number(item.storageNum)>0">+</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["item", "height", "breakLine", "imgHeight"],
  computed: {
    ...mapState(["cart"]),
    num() {
      const cartItem = this.cart.find(item => {
        return item.product.id == this.item.id;
      });
      if (!cartItem) {
        return 0;
      } else {
        return cartItem.num;
      }
    }
  },
  methods: {
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product?id=${id}` });
    },
    removeCart() {
      if (this.num > 0) {
        this.$store.commit("minusCart", {
          product: this.item,
          num: 1
        });
      }
    },
    judgeTagContent() {
      return this.item.tagName ? this.item.tagName.slice(0, 2) : "";
    },
    addCart() {
      if (this.num < this.item.storageNum) {
        this.$store.commit("addCart", {
          product: this.item,
          num: 1,
          toast: false
        });
      } else {
        uni.showToast({
          title: "没有库存啦",
          icon: "none"
        });
      }
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
    height: 460rpx;
    border-radius: 10rpx;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 28rpx;
    .lack-tag {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      z-index: 98;
      color: #fff;
      font-size: 22rpx;
      background: #ff8c40;
      padding: 8rpx 18rpx;
      border-bottom-right-radius: 10rpx;
    }
    .tag {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      z-index: 98;
      width: 70rpx;
      height: 84rpx;
      .font {
        width: 60%;
        text-align: center;
        position: absolute;
        top: 4rpx;
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
    .detail {
      width: 100%;
      font-size: 24rpx;
      color: #696969;
      text-align: left;
      padding: 10rpx 0;
    }

    .img {
      overflow: hidden;
      position: relative;
      width: 100%;
      margin-bottom: 20rpx;
      .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(1, 1, 1, 0.4);
        z-index: 97;
      }
      image {
        height: 200rpx;
      }
    }
  }
}
.product-bot {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rpx;
  .price {
    width: 80%;
    text-align: left;
    font-size: 24rpx;
    span:nth-child(1) {
      color: #ff9f24;
    }
    span:nth-child(2) {
      color: #bfbfbf;
    }
  }
}
.num {

  display: flex;
  align-items: center;
  justify-content: flex-end;
  .btn {
    width: 38rpx;
    height: 38rpx;
    background: rgba(255, 159, 36, 1);
    color: #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 36rpx;
    font-size: 24rpx;
  }
  .number {
    margin: 0 8rpx;
    font-size: 24rpx;
  }
}
</style>