<template>
  <div class="bg">
    <div class="swiper">
      <swiper style="height:100%;" indicator-dots autoplay circular @change="swiperChange">
        <block v-for="item in product.imgUrls" :key="item.id">
          <swiper-item>
            <imagep :src="item"></imagep>
          </swiper-item>
        </block>
      </swiper>
      <div class="corner" v-if="product.imgUrls.length">{{current+1}}/{{product.imgUrls.length}}</div>
    </div>
    <div class="gap"></div>
    <div class="price-section">
      <div class="price">
        <div class="title">{{product.title}}23ds大多数</div>
        <div class="favorite">
          <image src="/static/favorite.png" style="width:100%" mode="widthFix" />
          <div>收藏</div>
        </div>
      </div>
      <div class="storage">库存: {{product.storageNum || 0}}</div>
      <div class="bottom-info">
        <div class="price">
          <span class="dollar">$</span>
          <span>{{product.price}}</span>
        </div>
        <div class="sell">月销量: {{product.soldNum}}</div>
      </div>
    </div>
    <div class="bottom-control">
      <div class="share">
        <image src="/static/share.png" style="width:30rpx;margin-right:10rpx" mode="widthFix" />分享
      </div>
      <div class="action">
        <div @click="showCart(product.storageNum)">加入购物车</div>
        <div>立即购买</div>
      </div>
    </div>
    <custommodal position="bottom" :visible="showAddCart" @close="this.showAddCart=false">
      <div class="white-card cartmodal">
        <div class="control">
          <div>数量</div>
          <numberbox
            :min="0"
            :max="product.storageNum"
            @change="handleCartNumChange"
            :initialVal="1"
          ></numberbox>
        </div>
        <div class="confirm" @click="addToCart">确认</div>
      </div>
    </custommodal>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      product: false,
      current: 0,
      numToAdd: 1,
      showAddCart: false
    };
  },
  async onLoad(options) {
    const { id } = options;
    let product;
    if (this.userInfo) {
      product = await this.$request("fetchProductById", {
        data: {
          productId: id,
          userId: this.userInfo.id
        },
        loading: true
      });
    } else {
      product = this.productList.find(item => item.id == id);
      console.log(this.productList);
    }
    this.product = product;
  },
  computed: {
    ...mapState(["productList", "userInfo"])
  },
  methods: {
    showCart(storageNum){
      if(storageNum < 1){
        uni.showToast({
          title:'该商品没货啦',
          icon:'none'
        })
        return
      }
      this.showAddCart = true
    },
    addToCart() {
      console.log(this.numToAdd)
      if (!this.numToAdd) {
        return;
      }
      this.$store.commit("addCart", {
        product: this.product,
        num: this.numToAdd
      });
      this.showAddCart = false;
      // uni.setStorageSync("cart");
    },
    handleCartNumChange(val) {
      this.numToAdd = val;
    },
    swiperChange(e) {
      const { current } = e.detail;
      this.current = current;
    }
  }
};
</script>

<style lang="scss">
.swiper {
  height: 550rpx;
  position: relative;
  .corner {
    position: absolute;
    width: 80rpx;
    height: 40rpx;
    bottom: 20rpx;
    right: 20rpx;
    background: rgba(67, 67, 67, 0.2);
    border-radius: 20rpx;
    color: #fff;
    text-align: center;
    font-size: 20rpx;
    line-height: 40rpx;
  }
}
.price-section {
  padding: 30rpx;
  background: #fff;
  .price {
    display: flex;
    .title {
      color: rgba(51, 51, 51, 1);
      font-weight: bold;
      flex: 1;
      padding-right: 30rpx;
      box-sizing: border-box;
    }
    .favorite {
      width: 40rpx;
      font-size: 20rpx;
      color: rgba(216, 216, 216, 1);
    }
  }
  .storage {
    height: 40rpx;
    width: auto;
    margin-top: 10rpx;
    padding: 4rpx 20rpx;
    border-radius: 20rpx;
    background: rgba(241, 241, 241, 1);
    color: rgba(102, 102, 102, 1);
    font-size: 26rpx;
    width: fit-content;
  }
  .bottom-info {
    padding-top: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .price {
      font-weight: bold;
      color: rgba(255, 159, 36, 1);
      font-size: 36rpx;
      display: table;
      .dollar {
        font-size: 24rpx;
        margin-right: 10rpx;
      }
    }
    .sell {
      font-size: 28rpx;
      color: rgba(102, 102, 102, 1);
    }
  }
}
.bottom-control {
  position: fixed;
  width: 100%;
  padding: 0 20rpx;
  bottom: 0;
  left: 0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  height: 100rpx;
  .share {
    box-sizing: border-box;
    height: 50rpx;
    background: rgba(252, 216, 29, 1);
    padding: 22rpx 30rpx;
    width: fit-content;
    display: flex;
    align-items: center;
    border-radius: 25rpx;
    margin: 24rpx 0;
  }
  .action {
    display: table;
    height: 100%;
    div {
      text-align: center;
      width: 160rpx;
      padding: 0 40rpx;
      display: table-cell;
      vertical-align: middle;
      &:nth-child(1) {
        border-left: 2rpx solid #f6f6f6;
      }
      &:nth-child(2) {
        background: #fcd81d;
      }
    }
  }
}
.cartmodal {
  .control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40rpx;
  }
  .confirm {
    background: rgba(252, 216, 29, 1);
    text-align: center;
    padding: 20rpx 0;
  }
}
</style>