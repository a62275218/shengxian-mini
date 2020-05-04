<template>
  <div class="bg confirm-bg">
    <uniCalendar ref="calendar" :insert="false" @confirm="confirmDate" />
    <div class="row-card">
      <div class="row">
        <div class="title">支付方式</div>
        <div>
          <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="row-card">
      <div class="row">
        <div class="input">
          <div class="title">姓名</div>
          <input type="text" v-model="name" />
        </div>
      </div>
      <div class="row">
        <div class="input">
          <div class="title">电话</div>
          <input type="text" v-model="phone" />
        </div>
        <div class="veriCode">
          <input type="text" v-model="veriCode" />
          <div class="get">获取验证码</div>
        </div>
      </div>
      <div class="row">
        <div class="input">
          <div class="title">微信号</div>
          <input type="text" v-model="wechat" />
        </div>
      </div>
      <div class="row">
        <div class="input" style="width:90%;">
          <div class="title">地址</div>
          <textarea
            placeholder="为了计算运费，请输入后手动选择地址或者直接获取当前地址"
            type="text"
            style="width:90%;height:120rpx;"
            v-model="address"
            @confirm="searchGeoLocation"
          />
        </div>
        <div @click="getLocation">
          <image src="/static/address.png" mode="widthFix" style="width:36rpx" />
        </div>
      </div>
      <div class="row" @click="openCalendar">
        <div class="input">
          <div class="title">送货时间</div>
          <div class="delivery">{{deliveryTime}}</div>
        </div>
        <div>
          <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="row-card">
      <div class="row" v-for="item in productsToBuy" :key="item.product.id">
        <div class="product">
          <image
            :src="item.product.imgUrls[0]"
            mode="widthFix"
            style="width:140rpx;border-radius:20rpx;"
          />
          <div style="margin-left:20rpx;">{{item.product.title}}</div>
        </div>
        <div class="price">
          <div>${{item.product.price}}</div>
          <div>X{{item.num}}</div>
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <button class="share" open-type="share">转发订单信息给客服</button>
    <div class="gap"></div>
    <div class="must-know">
      <div class="title">购买须知</div>
      <text style="line-height:1.5;">{{ruleText}}</text>
    </div>
    <div class="page-gap"></div>
    <div class="bottom-control">
      <div class="left">
        实付
        <div class="price">${{totalPrice}}</div>
      </div>
      <div class="confirm" @click="confirmPay">立即支付</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      veriCode: "",
      name: this.userInfo ? this.userInfo.username : "",
      phone: this.userInfo ? this.userInfo.username : "",
      wechat: this.userInfo ? this.userInfo.wechat : "",
      address: this.userInfo ? this.userInfo.address : "",
      deliveryTime: "",
      ruleText: "",
      geoLocation: undefined
    };
  },
  async onShow() {
    console.log(this.$mp.query)
    const rule = await this.$request("fetchRuleText", {});
    if (rule) {
      this.ruleText = rule.ruleText;
    }
  },
  computed: {
    ...mapState(["cart", "userInfo"]),
    productsToBuy() {
      return this.cart.filter(item => item.active);
    },
    totalPrice() {
      let total = 0;
      this.cart
        .filter(item => item.active)
        .forEach(product => {
          total += Number(product.product.price) * product.num;
        });
      return total;
    }
  },
  methods: {
    openCalendar() {
      this.$refs.calendar.open();
    },
    confirmDate(e) {
      this.deliveryTime = e.fulldate;
    },
    onShareAppMessage() {
      const billInfo = {
        name: this.name,
        phone: this.phone,
        wechat: this.wechat,
        address: this.address,
        deliveryTime: this.deliveryTime,
        cart: this.productsToBuy
      };
      return {
        title: "订单分享",
        path: `/pages/billconfirm?billInfo=${billInfo}`
      };
    },
    async searchGeoLocation(e) {
      const _this = this;
      const { value } = e.detail;
      if (!value) {
        this.getLocation = undefined;
        return;
      }
      const geoRes = await this.$request("googleFindAddress", {
        data: {
          input: value
        }
      });
      if (!geoRes || !geoRes.length) {
        uni.showToast({
          title: "获取地理位置失败",
          icon: "none"
        });
        return;
      }
      uni.showActionSheet({
        itemList: geoRes.map(item => item.address),
        success: function(res) {
          _this.address = geoRes[res.tapIndex].address;
          this.getLocation = geoRes[res.tapIndex];
        },
        fail: function(res) {
          console.log(res.errMsg);
        }
      });
    },
    getLocation() {
      const _this = this;
      uni.getLocation({
        type: "wgs84",
        success: async function(res) {
          const geoRes = await _this.$request("googleFindAddressByLatlng", {
            loading: true,
            data: {
              latlng: `${res.latitude},${res.longitude}`
            }
          });
          if (!geoRes) {
            uni.showToast({
              title: "获取地理位置失败",
              icon: "none"
            });
          } else {
          }
          console.log(geoRes);
        },
        fail: () => {
          uni.showToast({
            title: "获取地理位置失败",
            icon: "none"
          });
        }
      });
    },
    confirmPay() {
      uni.getProvider({
        service: "payment",
        success: res => {
          console.log(res);
          const provider = res.provider[0];
          uni.requestPayment({
            provider: "wxpay",
            timeStamp: String(Date.now()),
            nonceStr: Math.random()
              .toString(36)
              .substr(2, 15),
            success: res => {
              console.log(res);
            },
            fail: err => {
              uni.showToast({
                title: "支付失败",
                icon: "none"
              });
              console.log(err);
            }
          });
        },
        fail: err => {
          uni.showToast({
            title: "获取服务商失败",
            icon: "none"
          });
        }
      });

      return;
      const _this = this;
      let errorMsg = "";
      if (!this.name) {
        errorMsg = "请输入姓名";
      }
      if (!this.phone) {
        errorMsg = "请输入电话";
      }
      if (!this.wechat) {
        errorMsg = "请输入微信号";
      }
      if (!this.geoLocation) {
        errorMsg = "请选择地址";
      }
      if (!this.deliveryTime) {
        errorMsg = "请选择送货时间";
      }
      if (errorMsg) {
        uni.showToast({
          title: errorMsg,
          icon: "none"
        });
        return;
      }
      uni.showModal({
        title: "支付确认",
        content: "确认要支付这笔订单吗?",
        success: function(res) {
          if (res.confirm) {
            console.log(_this);
            uni.requestPayment({
              provider: "wxpay",
              timeStamp: String(Date.now())
            });
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        }
      });
    }
  }
};
</script>

<style lang='scss' scoped>
.confirm-bg {
  padding: 20rpx;
  .veriCode {
    box-sizing: border-box;
    padding: 10rpx 20rpx;
    min-width: 330rpx;
    width: 330rpx;
    border-left: 2rpx solid #f0f0f0;
    display: flex;
    .get {
      min-width: 140rpx;
      color: #1d90fc;
    }
  }
  .product {
    display: flex;
  }
  .price {
    text-align: right;
    :nth-child(1) {
      margin-bottom: 20rpx;
    }
  }
  .share {
    border-radius: 20rpx;
    padding: 10rpx;
    background: #fcd81d;
    text-align: center;
  }
  .must-know {
    font-size: 26rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    .title {
      margin-bottom: 20rpx;
    }
  }
  .bottom-control {
    background: #fff;
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    color: #666666;
    font-size: 30rpx;
    border-top: 2rpx solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    .left {
      display: flex;
      align-items: center;
      padding: 30rpx;
      .price {
        margin-left: 20rpx;
        color: #fcd81d;
      }
    }
    .confirm {
      background: #fcd81d;
      padding: 0 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>