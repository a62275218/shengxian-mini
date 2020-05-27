<template>
  <div class="bg">
    <cartbtn />
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
        <div class="title">{{product.title}}</div>
        <div class="favorite" @click="handleFavorite">
          <image
            :src="liked?'/static/favorite-active.png':'/static/favorite.png'"
            style="width:100%"
            mode="widthFix"
          />
          <div :style="{'color':liked?'#FCD81D':'rgba(216, 216, 216, 1)'}">收藏</div>
        </div>
      </div>
      <div class="desc-text">{{product.detail}}</div>
      <div class="storage">库存: {{product.storageNum || 0}}</div>
      <div class="bottom-info">
        <div class="price">
          <span class="dollar">$</span>
          <span>{{product.price}}</span>
        </div>
        <div class="sell">月销量: {{product.soldNum}}</div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="white-card desc-card">
      <div class="title">产品详情</div>
      <block v-for="detail in product.description" :key="detail">
        <div class="gap"></div>
        <div v-if="detail.type==='文字'">{{detail.context}}</div>
        <image v-if="detail.type==='图片'" :src="detail.context" mode="widthFix" style="width:100%;" />
      </block>
    </div>
    <div class="large-gap"></div>
    <div class="bottom-control">
      <div class="share" @click="showShare">
        <image src="/static/share.png" style="width:30rpx;margin-right:10rpx" mode="widthFix" />分享
      </div>
      <div class="action">
        <div @click="showCart(product.storageNum)">加入购物车</div>
        <!-- <div @click="showCart(product.storageNum,true)">立即购买</div> -->
      </div>
    </div>
    <custommodal :visible="shareCardShow" @close="this.shareCardShow =false">
      <canvas class="canvas" canvas-id="poster"></canvas>
      <button v-if="canvasReady" class="share-btn" @click="saveToPhoto">保存</button>
      <!-- <canvas class="canvas" canvas-id="poster"></canvas> -->
    </custommodal>
    <custommodal position="bottom" :visible="showAddCart" @close="handleCartClose">
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
import { throttle } from "@/util";
import { mapState } from "vuex";
export default {
  data() {
    return {
      product: false,
      current: 0,
      numToAdd: 1,
      liked: false,
      showAddCart: false,
      immediateToBuy: false,
      shareCardShow: false,
      qrCode: "",
      template: {},
      canvasReady: false,
      tempFilePath: ""
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
    }
    this.liked = product.ifUserLike;
    this.product = product;
    this.$store.commit("addHistory", product);
    this.checkProductLike();
  },
  computed: {
    ...mapState(["productList", "userInfo"]),
    handleFavorite() {
      return this.$throttle(async () => {
        this.liked = !this.liked;
        const liked = await this.$request("userLikeProduct", {
          data: {
            id: this.product.id,
            userId: this.userInfo.id
          }
        });
        this.checkProductLike();
      }, 1000);
    }
    // textDesc() {
    //   return this.product.description
    //     ? this.product.description
    //         .filter(item => item.type === "文字")
    //         .map(item => item.context)
    //     : [];
    // },
    // imgDesc() {
    //   return this.product.description
    //     .filter(item => item.type === "图片")
    //     .map(item => item.context);
    // }
  },
  methods: {
    showCart(storageNum, immediate) {
      this.immediateToBuy = Boolean(immediate);
      if (Number(storageNum) < 1) {
        uni.showToast({
          title: "该商品没货啦",
          icon: "none"
        });
        return;
      }
      this.showAddCart = true;
    },
    addToCart() {
      if (!this.numToAdd) {
        return;
      }
      this.$store.commit("addCart", {
        product: this.product,
        num: this.numToAdd,
        immediateToBuy: this.immediateToBuy
      });
      this.showAddCart = false;
      if (this.immediateToBuy) {
        uni.switchTab({
          url: "/pages/cart"
        });
      }
    },
    handleCartClose() {
      this.showAddCart = false;
      this.immediateToBuy = false;
    },
    saveToPhoto() {
      const _this = this;
      uni.getSetting({
        success: res => {
          if (res.authSetting["scope.writePhotosAlbum"]) {
            uni.showLoading({
              title: "保存中"
            });
            uni.saveImageToPhotosAlbum({
              filePath: this.tempFilePath, //图片文件路径，可以是临时文件路径也可以是永久文件路径，不支持网络图片路径,
              success: res => {
                uni.showToast({
                  title: "保存分享图成功",
                  duration:5000
                });
                _this.shareCardShow = false
              },
              fail: err => {
                console.log(err);
                uni.showToast({
                  title: "保存分享图失败",
                  icon: "none"
                });
              },
              complete: () => {
                uni.hideLoading();
              }
            });
          } else {
            uni.authorize({
              scope: "scope.writePhotosAlbum",
              success: () => {
                _this.saveNameCard();
              }
            });
            uni.showToast({
              title: "未获得授权",
              icon: "none"
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取授权失败",
            icon: "none"
          });
        }
      });
    },
    async showShare() {
      this.canvasReady = false;
      this.shareCardShow = true;
      const qrCode = await this.$request("generateItemQrcode", {
        loading: true,
        data: {
          scene: this.product.id,
          page: ``
        }
      });
      if (!qrCode) {
        uni.showToast({
          title: "生成失败",
          icon: "none"
        });
        return;
      }
      uni.showLoading();
      Promise.all([
        uni.getImageInfo({ src: qrCode }),
        uni.getImageInfo({ src: this.product.imgUrls[0] })
      ])
        .then(res => {
          const qr = res[0][1].path;
          const productImg = res[1][1].path;
          const ratio = res[1][1].height / res[1][1].width;
          const ctx = uni.createCanvasContext("poster", this);
          const imgHeight = 200;
          this.drawRadiusCard(ctx, 0, 0, 300, imgHeight + 110 + 30, 20);
          ctx.drawImage(productImg, 0, 0, 300, imgHeight);
          ctx.drawImage(qr, 200 - 10, imgHeight + 10, 100, 100);
          ctx.setFillStyle("black");
          ctx.font = "bold 20px sans-serif";
          const height = this.lineBreakText(
            ctx,
            this.product.title,
            10,
            imgHeight + 30,
            200 - 10,
            20
          );
          ctx.setFillStyle("#FF9F24");
          ctx.fillText(`$${this.product.price}`, 10, height + 12);
          ctx.draw(false, () => {
            uni.hideLoading();
            setTimeout(() => {
              uni.canvasToTempFilePath({
                canvasId: "poster",
                success: e => {
                  this.canvasReady = true;
                  this.tempFilePath = e.tempFilePath;
                },
                fail: () => {
                  this.canvasReady = false;
                }
              });
            });
          });
        })
        .catch(err => {
          uni.showToast({
            title: "生成失败",
            icon: "none"
          });
        });
    },
    lineBreakText(ctx, text, x, y, width, fontSize) {
      const arr = [];
      let string = text;
      let needBreak = true;
      while (needBreak) {
        for (let i = 0; i < string.length; i++) {
          const txtWidth = ctx.measureText(string.substr(0, i)).width;
          if (txtWidth > width) {
            arr.push(string.substr(0, i - 1));
            string = string.substr(i - 1);
            break;
          } else if (i === string.length - 1 && txtWidth <= width) {
            arr.push(string);
            needBreak = false;
          }
        }
      }
      arr.forEach((txt, index) => {
        ctx.fillText(txt, x, y + index * fontSize);
      });
      return y + (arr.length - 1) * fontSize + fontSize;
    },
    drawRadiusCard(ctx, x, y, w, h, r, color) {
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, 1.0 * Math.PI, 1.5 * Math.PI);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 0);
      ctx.lineTo(x + w, y + h - r);
      ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
      ctx.lineTo(x + r, y + h);
      ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, 1 * Math.PI);
      ctx.lineTo(x, y + r);
      ctx.clip();
      ctx.setFillStyle(color || "#FFFFFF");
      ctx.fill();
    },
    handleCartNumChange(val) {
      this.numToAdd = val;
    },
    async checkProductLike() {
      if (!this.userInfo) {
        return;
      }
      const liked = await this.$request("checkIfUserLikeThisProduct", {
        data: {
          id: this.product.id,
          userId: this.userInfo.id
        }
      });
      if (typeof liked === "boolean") {
        this.liked = liked;
      }
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
.desc-card{
  padding:20rpx;
  .title{
    font-weight:bold;
    font-size:32rpx;
  }
}
.price-section {
  padding: 30rpx;
  background: #fff;
  .desc-text {
    font-size: 26rpx;
    padding: 10rpx 0;
  }
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
  height: 130rpx;
  align-items: center;
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
      &:nth-child(1) {
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

.canvas {
  width: 300px;
  height: 350px;
  margin: 0 auto;
}

.share-btn {
  margin-top: 20rpx;
  width: 80%;
  background: #fcd81d;
}
</style>