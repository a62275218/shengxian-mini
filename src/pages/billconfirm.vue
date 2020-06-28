<template>
  <div class="bg confirm-bg">
    <kefubtn :bottom="140" />
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
          <div class="title" style="display:flex;align-items:center;min-width: 160rpx;">
            电话
            <div @click="showAction" style="display:flex;align-items:center">
              <div style="margin:0 10rpx;">{{areaCode}}</div>
              <image src="/static/down.png" mode="widthFix" style="width:20rpx;margin-right:10rpx;" />
            </div>
          </div>
          <input type="text" v-model="phone" />
        </div>
        <div class="veriCode">
          <input
            :class="{'pass':veriPass,'fail':!veriPass}"
            type="number"
            v-model="veriCode"
            @input="verifyCode"
          />
          <div
            class="get"
            @click="getVeriCode"
            v-if="(!share && !userInfo.phone) || (userInfo && (areaCode+phone) !== defaultAdd.phone)"
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
            type="text"
            style="width:90%;"
            :auto-height="true"
            v-model="address"
            @input="disableGeo"
            @blur="searchGeoLocation"
          />
        </div>
        <div @click="goAddr" class="getGeo">更换地址</div>
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
        <div style="min-width:64rpx;">实付</div>
        <div class="price">${{totalPrice}}</div>
        <div>
          <span style="font-size:24rpx;">{{shipText}}</span>
          <div style="font-size:24rpx;" v-if="cutPrice && threshold">{{cutText}}</div>
        </div>
      </div>
      <div style="min-width:120rpx;" class="confirm" @click="confirmPay" v-if="!share">立即支付</div>
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
      areaCode: "+61",
      userComment: "",
      shipPrice: null,
      cutPrice: null,
      threshold: null,
      veriPass: false,
      geoLocation: undefined,
      share: false,
      defaultAdd: undefined
    };
  },
  async onShow() {
    const { billInfo, deliveryDetail } = this.$mp.query;
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
      const defaultAdd = deliveryDetail
        ? JSON.parse(deliveryDetail)
        : (this.userInfo.deliveryDetail || []).find(item => {
            return item.ifDefault;
          });
      if (defaultAdd) {
        this.address = defaultAdd.address;
        this.subName = defaultAdd.subName;
        this.wechat = defaultAdd.wechat;
        this.name = defaultAdd.name;
        this.veriPass = Boolean(defaultAdd.phone);
        this.fetchShipFeeBySub(defaultAdd.subName);
        this.defaultAdd = defaultAdd;
        this.phone = defaultAdd.phone.substr(3);
        this.areaCode = defaultAdd.phone.substr(0, 3);
      }
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
      if(!this.subName){
        return "该地区无效";
      }
      if (this.subName && typeof this.shipPrice !== "number") {
        return "该地区运费需人工确认";
      }
      return typeof this.shipPrice == "number"
        ? `(包含运费:$${this.shipPrice})`
        : `请选择地址计算运费`;
    },
    cutText() {
      if (this.threshold) {
        if(!this.subName){
          return "";
        }
        if (this.totalP >= this.threshold) {
          if (this.shipPrice == 0) {
            return `该地区已满$${this.threshold}免配送费`;
          } else {
            return `该地区已满$${this.threshold}减$${this.cutPrice}`;
          }
        } else {
          return `该地区满$${this.threshold}即可减$${this.cutPrice}`;
        }
      } else {
        return "";
      }
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
      // if (this.threshold && this.cutPrice) {
      //   if (total >= this.threshold) {
      //     total -= this.cutPrice;
      //   }
      // }
      if (!isNaN(this.shipPrice)) {
        total += Number(this.shipPrice);
      }
      return total;
    }
  },
  watch: {
    phone(val) {
      if (this.defaultAdd) {
        this.veriPass = this.areaCode + val === this.defaultAdd.phone;
      }
    },
    areaCode(val) {
      if (this.defaultAdd) {
        this.veriPass = val + this.phone === this.defaultAdd.phone;
      }
    }
  },
  methods: {
    openCalendar() {
      this.$refs.calendar.open();
    },
    goAddr() {
      uni.navigateTo({
        url: "/pages/address?type=confirm"
      });
    },
    disableGeo(e){
      this.subName = null
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
          const { cutPrice, price, threshold } = shipRes;
          this.shipPrice = price;
          this.cutPrice = cutPrice;
          this.threshold = threshold;
        } else {
          uni.showToast({
            title: "该地区运费需人工确认，请联系客服完成下单",
            icon: "none"
          });
          this.shipPrice = null;
          this.cutPrice = null;
          this.threshold = null;
        }
      }
    },
    showTip() {
      uni.showModal({
        content: "每天八点半点前订单 隔日可派送 周一和大型节假日不送货"
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
          title: "该日期无法配送,8:30pm前下单可隔日送货,周一和特定节假日不送货",
          icon: "none",
          duration: 6000
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
    showAction() {
      const _this = this;
      const options = ["+61", "+86"];
      uni.showActionSheet({
        itemList: options,
        success: function(res) {
          _this.areaCode = options[res.tapIndex];
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
          phone: formatPhoneNumber(this.phone, this.areaCode)
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

      console.log(this.subName)

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
    min-width: 320rpx;
    width: 320rpx;
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