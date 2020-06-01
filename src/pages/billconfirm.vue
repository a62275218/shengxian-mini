<template>
  <div class="bg confirm-bg">
    <uniCalendar ref="calendar" :insert="false" @confirm="confirmDate" />
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
          <input
            :class="{'pass':veriPass,'fail':!veriPass}"
            type="text"
            v-model="veriCode"
            @input="verifyCode"
          />
          <div
            class="get"
            @click="getVeriCode"
            v-if="(!share && !userInfo.phone) || (userInfo && phone !== userInfo.phone)"
          >获取验证码</div>
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
          <div class="title">收货地址</div>
          <textarea
            placeholder="为了计算运费，请输入后手动选择地址或者直接获取当前地址"
            type="text"
            style="width:90%;"
            :auto-height="true"
            v-model="address"
            @blur="searchGeoLocation"
          />
        </div>
        <div @click="getLocation" class="getGeo">获取地址</div>
      </div>
      <div class="row" @click="openCalendar">
        <div class="input">
          <div class="title">送货时间</div>
          <image
            @click.stop="showTip"
            src="/static/shiptime.png"
            mode="widthFix"
            style="width:40rpx;margin-right:10rpx;"
          />
          <div class="delivery">{{deliveryTime}}</div>
        </div>
        <div>
          <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
        </div>
      </div>
      <div class="row">
        <div class="input" style="width:90%;">
          <div class="title">备注</div>
          <textarea type="text" style="width:90%;" :auto-height="true" v-model="userComment" />
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
    <button class="share" open-type="share" v-if="!share">转发订单信息给客服</button>
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
        <span style="font-size:24rpx;">{{shipText}}</span>
      </div>
      <div class="confirm" @click="confirmPay" v-if="!share">立即支付</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { formatPhoneNumber, checkBill } from "@/util";
export default {
  data() {
    return {
      veriCode: "",
      veriMatch: "",
      name: "",
      phone: "",
      wechat: "",
      address: "",
      deliveryTime: "",
      ruleText: "",
      subName: "",
      userComment: "",
      shipPrice: null,
      veriPass: false,
      geoLocation: undefined,
      share: false
    };
  },
  async onShow() {
    const { billInfo } = this.$mp.query;
    if (billInfo) {
      this.share = true;
      const bill = JSON.parse(billInfo);
      this.name = bill.name;
      this.phone = bill.phone;
      this.wechat = bill.wechat;
      this.address = bill.address;
      this.subName = bill.subName;
      this.shipPrice = Number(bill.shipPrice);
    } else {
      this.name = this.userInfo.name;
      this.phone = this.userInfo.phone;
      this.wechat = this.userInfo.wechat;
      this.address = this.userInfo.address;
      this.subName = this.userInfo.subName;
      this.veriPass = Boolean(this.userInfo.phone);
      this.fetchShipFeeBySub(this.userInfo.subName);
    }
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
    shipText() {
      if (this.subName && typeof this.shipPrice !== "number") {
        return "该地区运费需人工确认";
      }
      return typeof this.shipPrice == "number"
        ? `(包含运费:$${this.shipPrice})`
        : `请选择地址计算运费`;
    },
    totalP() {
      let total = 0;
      this.cart
        .filter(item => item.active)
        .forEach(product => {
          total += Number(product.product.price) * Number(product.num);
        });
      return total;
    },
    totalPrice() {
      let total = 0;
      this.cart
        .filter(item => item.active)
        .forEach(product => {
          total += Number(product.product.price) * Number(product.num);
        });
      if (!isNaN(this.shipPrice)) {
        total += Number(this.shipPrice);
      }
      return total;
    }
  },
  watch: {
    phone(val) {
      if (this.userInfo) {
        this.veriPass = val === this.userInfo.phone;
      }
    }
  },
  methods: {
    openCalendar() {
      this.$refs.calendar.open();
    },
    async fetchShipFeeBySub(val) {
      if (val) {
        const shipRes = await this.$request("fetchFeeBySubName", {
          loading: true,
          data: {
            subName: val,
            productPrice: this.totalP
          }
        });
        if (shipRes) {
          this.shipPrice = Number(shipRes);
        } else {
          uni.showToast({
            title: "该地区运费需人工确认，请联系客服完成下单",
            icon: "none"
          });
          this.shipPrice = null;
        }
      }
    },
    showTip() {
      uni.showModal({
        content: "每天七点前订单 隔日可派送 周天和大型节假日不送货"
      });
    },
    async confirmDate(e) {
      const result = await this.$request("checkDeliveryDateMakeOrder", {
        loading: true,
        data: {
          deliveryDate: e.fulldate
        }
      });
      if (result && result.code === 0) {
        this.deliveryTime = e.fulldate;
      } else {
        uni.showToast({
          title: "该日期无法配送,7pm前下单可隔日送货,周日和特定节假日不送货",
          icon: "none"
        });
      }
    },
    onShareAppMessage() {
      const billInfo = {
        name: this.name,
        phone: this.phone,
        wechat: this.wechat,
        address: this.address,
        deliveryTime: this.deliveryTime,
        productsToBuy: this.productsToBuy,
        shipPrice: this.shipPrice
      };
      return {
        title: "订单分享",
        path: `/pages/billconfirm?billInfo=${JSON.stringify(billInfo)}`
      };
    },
    async searchGeoLocation(e) {
      const _this = this;
      const { value } = e.detail;
      if (!value) {
        this.subName = "";
        return;
      }
      const geoRes = await this.$request("googleFindAddress", {
        loading: true,
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
          _this.subName = geoRes[res.tapIndex].subName;
          _this.fetchShipFeeBySub(geoRes[res.tapIndex].subName);
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
            _this.address = geoRes.address;
            _this.subName = geoRes.subName;
            _this.fetchShipFeeBySub(geoRes.subName);
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取地理位置失败",
            icon: "none"
          });
        }
      });
    },
    verifyCode(e) {
      if (this.veriMatch) {
        this.veriPass = e.detail.value === this.veriMatch;
      }
    },
    async getVeriCode() {
      const veriRes = await this.$request("phoneSendVaildMessage", {
        loading: true,
        data: {
          phone: formatPhoneNumber(this.phone)
        }
      });
      if (veriRes) {
        uni.showToast({
          title: "发送验证码成功"
        });
        this.veriMatch = String(veriRes);
      } else {
        uni.showToast({
          title: "获取验证码失败",
          icon: "none"
        });
      }
    },
    async confirmPay() {
      if (!this.userInfo) {
        uni.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }

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
      if (!this.address) {
        errorMsg = "请选择地址";
      }
      if (!this.deliveryTime) {
        errorMsg = "请选择送货时间";
      }
      if (!this.veriPass) {
        errorMsg = "请输入正确的手机验证码";
      }
      if (!this.subName) {
        errorMsg = "请选取有效地址";
      }
      if (typeof this.shipPrice !== "number") {
        errorMsg = "该地区运费需人工确认，请联系客服完成下单";
      }
      if (errorMsg) {
        uni.showToast({
          title: errorMsg,
          icon: "none"
        });
        return;
      }

      const billInfo = await this.$request("addNewOrder", {
        loading: true,
        data: {
          belongUserId: this.userInfo.id,
          name: this.name,
          phone: this.phone,
          wechat: this.wechat,
          address: this.address,
          subName: this.subName,
          price: this.totalPrice,
          userComment: this.userComment,
          deliveryDate: this.deliveryTime,
          orderDetail: this.productsToBuy.map(item => {
            return {
              ...item.product,
              buyNum: item.num
            };
          })
        }
      });
      const bill = checkBill(billInfo);
      if (bill) {
        if (bill.orderDetail) {
          this.$store.commit(
            "batchRemoveFromCart",
            bill.orderDetail.map(item => {
              return item.id;
            })
          );
        }
        this.$store.commit("changePendingBill", bill);
        uni.reLaunch({
          url: "/pages/pay"
        });
      }

      // uni.showModal({
      //   title: "支付确认",
      //   content: "确认要支付这笔订单吗?",
      //   success: function(res) {
      //     if (res.confirm) {
      //       console.log(_this);
      //       uni.requestPayment({
      //         provider: "wxpay",
      //         timeStamp: String(Date.now())
      //       });
      //     } else if (res.cancel) {
      //       console.log("用户点击取消");
      //     }
      //   }
      // });
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
    .pass {
      color: rgb(21, 201, 45);
    }
    .fail {
      color: red;
    }
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
        margin: 0 20rpx;
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
  .getGeo {
    color: #1d90fc;
    width: 140rpx;
    padding: 0 20rpx;
  }
}
</style>