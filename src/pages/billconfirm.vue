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
          <input type="text" placeholder="手机号码" v-model="phone" />
        </div>
        <!-- <div class="veriCode">
          <input
            :class="{'pass':veriPass,'fail':!veriPass}"
            type="number"
            v-model="veriCode"
            @input="verifyCode"
            placeholder="验证码"
          />
          <div
            class="get"
            @click="getVeriCode"
            v-if="(!share && !userInfo.phone) || (userInfo && (areaCode+phone) !== defaultAdd.phone)"
          >获取验证码</div>
        </div>-->
      </div>
      <div class="row">
        <div class="input">
          <div class="title">微信号</div>
          <input type="text" v-model="wechat" />
        </div>
      </div>
      <div class="row" style="position:relative;">
        <div class="input" style="width:90%;">
          <div class="title">收货地址</div>
          <textarea
            type="text"
            style="width:90%;"
            :auto-height="true"
            v-model="address"
            @input="debounceSearchGeoLocation"
          />
        </div>
        <div @click="goAddr" class="getGeo" v-if="showChangeAddress">更换地址</div>
        <div class="getGeo" v-else @click="getLocation">获取地址</div>
        <div class="scroll-wrap" v-if="pendingAddress.length > 0">
          <scroll-view class="address-list">
            <div v-for="item in pendingAddress" :key="item.address" @click="selectAddr(item)">
              <span>{{item.address}}</span>
            </div>
          </scroll-view>
          <div class="fixbtn" @click="cancelAddr">取消</div>
        </div>
      </div>
      <div class="row" style="position:relative;">
        <div class="scroll-wrap" v-if="pendingSubs.length > 0">
          <scroll-view scroll-y class="address-list">
            <div v-for="item in pendingSubs" :key="item.id" @click="selectSub(item)">
              <span>{{item.subName}}</span>
            </div>
          </scroll-view>
          <div class="fixbtn" @click="cancelSub">取消</div>
        </div>
        <div class="input" style="width:90%" v-if="pendingAddress.length === 0">
          <div class="title">收货地区</div>
          <input
            style="max-height:30rpx;"
            placeholder="请搜索选择区名如Box Hill"
            v-model="subName"
            @input="debounceSearchSub"
          />
        </div>
      </div>
      <div class="row" @click="openCalendar">
        <div class="input">
          <div class="title">送货日期</div>
          <image
            @click.stop="showTip"
            src="/static/shiptime.png"
            mode="widthFix"
            style="width:40rpx;margin-right:10rpx;"
          />
          <div class="delivery" v-if="deliveryTime">{{deliveryTime}}</div>
          <div v-else style="font-size:24rpx;">8pm前付款最快隔日送 点此选择日期</div>
        </div>
        <div>
          <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
        </div>
      </div>
      <div class="row">
        <div v-if="pendingAddress.length == 0" class="input" style="width:90%;">
          <div class="title">备注</div>
          <textarea
            type="text"
            :placeholder-style="pendingAddress.length > 0?'display:none':''"
            placeholder="如地址有误，请将准确地址填入备注"
            style="width:90%;"
            :auto-height="true"
            v-model="userComment"
          />
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="row-card">
      <div class="row" v-for="item in share?shareProducts:productsToBuy" :key="item.product.id">
        <div class="product">
          <image
            :src="item.product.imgUrls[0]"
            mode="widthFix"
            style="width:140rpx;border-radius:20rpx;max-height:200rpx;"
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

    <div class="gap"></div>
    <div class="must-know">
      <div class="title">亲爱的顾客请您看一下购买须知</div>
      <text style="line-height:1.5;">{{ruleText}}</text>
    </div>
    <div class="gap"></div>
    <button class="share" open-type="share" v-if="!share">转发订单</button>
    <div class="gap"></div>
    <div class="gap"></div>
    <div class="page-gap"></div>
    <div class="bottom-control">
      <div class="left">
        <div style="min-width:64rpx;">实付</div>
        <div class="price">${{share?shareTotalPrice:totalPrice}}</div>
        <div>
          <span style="font-size:24rpx;">{{shipText_c !== false ?shipText_c:shipText}}</span>
          <div
            style="font-size:24rpx;"
            v-if="cutPrice && threshold || cutText_c !== false"
          >{{cutText_c !== false ?cutText_c:cutText}}</div>
        </div>
      </div>
      <div style="min-width:120rpx;" class="confirm" @click="confirmPay" v-if="!share">立即支付</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { formatPhoneNumber, checkBill, debounce } from "@/util";
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
      shareProducts: [],
      pendingAddress: [],
      pendingSubs: [],
      shareTotalPrice: "",
      cutPrice: null,
      threshold: null,
      veriPass: false,
      geoLocation: undefined,
      share: false,
      subValid: false,
      defaultAdd: undefined,
      cutText_c: false,
      shipText_c: false,
    };
  },
  async onShow() {
    const { billInfo, deliveryDetail } = this.$mp.query;
    if (billInfo) {
      this.share = true;
      const bill = JSON.parse(decodeURIComponent(billInfo));
      this.name = bill.name;
      this.phone = bill.phone;
      this.wechat = bill.wechat || "";
      this.address = bill.address;
      this.subName = bill.subName;
      this.shipPrice = Number(bill.shipPrice);
      this.cutText_c = bill.cutText;
      this.shipText_c = bill.shipText;
      this.shareTotalPrice = bill.totalPrice;
      this.shareProducts = bill.productsToBuy;
    } else {
      this.cutText_c = false;
      this.shipText_c = false;
      const defaultAdd = deliveryDetail
        ? JSON.parse(deliveryDetail)
        : (this.userInfo.deliveryDetail || []).find((item) => {
            return item.ifDefault;
          });
      if (defaultAdd) {
        this.address = defaultAdd.address;
        this.subName = defaultAdd.subName;
        this.wechat = defaultAdd.wechat || "";
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
  mounted() {
    this.debounceSearchGeoLocation = debounce(this.searchGeoLocation, 200);
    this.debounceSearchSub = debounce(this.searchSub, 200);
  },
  computed: {
    ...mapState(["cart", "userInfo"]),
    productsToBuy() {
      return this.cart.filter((item) => item.active);
    },
    showChangeAddress() {
      return this.$getIn(this.userInfo, "deliveryDetail", "length") > 0;
    },
    shipText() {
      if (!this.subName) {
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
        if (!this.subName || typeof this.shipPrice !== "number") {
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
        .filter((item) => item.active)
        .forEach((product) => {
          total += Number(product.product.price) * Number(product.num);
        });
      return total;
    },
    totalPrice() {
      let total = 0;
      this.cart
        .filter((item) => item.active)
        .forEach((product) => {
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
      return total.toFixed(2);
    },
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
    },
  },
  methods: {
    openCalendar() {
      this.$refs.calendar.open();
    },
    goAddr() {
      uni.navigateTo({
        url: "/pages/address?type=confirm",
      });
    },
    async searchSub(e) {
      this.shipPrice = null;
      this.pendingAddress = [];
      this.subValid = false;
      const { value } = e.detail;
      const subRes = await this.$request("fetchFeeByKeyword", {
        data: {
          keyword: value,
        },
      });
      if (!subRes) {
        uni.showToast({
          title: "获取区域失败",
          icon: "none",
        });
        return;
      }
      this.pendingSubs = subRes;
    },
    cancelSub() {
      this.subName = "";
      this.pendingSubs = [];
    },
    async fetchShipFeeBySub(val) {
      if (val) {
        const shipRes = await this.$request("fetchFeeBySubName", {
          loading: true,
          data: {
            subName: val,
            productPrice: this.totalP,
          },
        });
        if (shipRes) {
          const { cutPrice, price, threshold } = shipRes;
          this.shipPrice = price;
          this.cutPrice = cutPrice;
          this.threshold = threshold;
        } else {
          uni.showToast({
            title: "该地区运费需人工确认，请联系客服完成下单",
            icon: "none",
          });
          this.shipPrice = null;
          this.cutPrice = null;
          this.threshold = null;
        }
      }
    },
    showTip() {
      uni.showModal({
        content: "每天八点前订单 隔日可派送 周一和大型节假日不送货",
      });
    },
    async confirmDate(e) {
      const result = await this.$request("checkDeliveryDateMakeOrder", {
        loading: true,
        data: {
          deliveryDate: e.fulldate,
        },
      });
      if (result) {
        if (result === "err2") {
          uni.showToast({
            title: "该日期已爆单，请更换其他配送日期",
            icon: "none",
          });
        } else {
          this.deliveryTime = e.fulldate;
        }
      } else {
        uni.showToast({
          title: "该日期无法配送,8:00pm前下单可隔日送货,周一和特定节假日不送货",
          icon: "none",
          duration: 6000,
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
        shipPrice: this.shipPrice,
        totalPrice: this.totalPrice,
        cutText: this.cutText,
        shipText: this.shipText,
      };

      return {
        title: "订单分享",
        path: `/pages/billconfirm?billInfo=${encodeURIComponent(
          JSON.stringify(billInfo)
        )}`,
      };
    },
    async searchGeoLocation(e) {
      this.pendingSubs = [];
      const { value } = e.detail;
      if (!value) {
        return;
      }
      const geoRes = await this.$request("googleFindAddress", {
        data: {
          input: value,
        },
      });
      if (!geoRes) {
        uni.showToast({
          title: "获取地理位置失败",
          icon: "none",
        });
        return;
      }
      this.pendingAddress = geoRes;
    },
    cancelAddr() {
      this.address = "";
      this.pendingAddress = [];
    },
    selectSub(selection) {
      const { subName } = selection;
      this.subName = subName;
      this.fetchShipFeeBySub(subName);
      this.subValid = true;
      this.pendingSubs = [];
    },
    selectAddr(selection) {
      const { address, subName } = selection;
      this.address = address;
      this.addValid = true;
      this.fetchingAddr = false;
      this.pendingAddress = [];
    },
    showAction() {
      const _this = this;
      const options = ["+61", "+86"];
      uni.showActionSheet({
        itemList: options,
        success: function (res) {
          _this.areaCode = options[res.tapIndex];
        },
      });
    },
    getLocation() {
      const _this = this;
      uni.getLocation({
        type: "wgs84",
        success: async function (res) {
          const geoRes = await _this.$request("googleFindAddressByLatlng", {
            loading: true,
            data: {
              latlng: `${res.latitude},${res.longitude}`,
            },
          });
          if (!geoRes) {
            uni.showToast({
              title: "获取地理位置失败",
              icon: "none",
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
            icon: "none",
          });
        },
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
          phone: formatPhoneNumber(this.phone, this.areaCode),
        },
      });
      if (veriRes) {
        uni.showToast({
          title: "发送验证码成功",
        });
        this.veriMatch = String(veriRes);
      } else {
        uni.showToast({
          title: "获取验证码失败",
          icon: "none",
        });
      }
    },
    async confirmPay() {
      if (!this.userInfo) {
        uni.showModal({
          title: "未登录",
          content: "请先至'我的'页面，点击左上角立即登入",
          confirmText: "前往登录",
          success: () => {
            uni.switchTab({
              url: "/pages/my",
            });
          },
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
      if (!this.address) {
        errorMsg = "请选择地址";
      }
      if (!this.deliveryTime) {
        errorMsg = "请选择送货日期";
      }
      // if (!this.veriPass) {
      //   errorMsg = "请输入正确的手机验证码";
      // }
      if (!this.subName) {
        errorMsg = "请选取有效地址";
      }
      if (typeof this.shipPrice !== "number") {
        errorMsg = "该地区运费需人工确认，请联系客服完成下单";
      }
      if (errorMsg) {
        uni.showToast({
          title: errorMsg,
          icon: "none",
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
          orderDetail: this.productsToBuy.map((item) => {
            return {
              ...item.product,
              buyNum: item.num || 1,
            };
          }),
        },
      });
      const bill = checkBill(billInfo);
      if (bill) {
        if (bill.orderDetail) {
          this.$store.commit(
            "batchRemoveFromCart",
            bill.orderDetail.map((item) => {
              return item.id;
            })
          );
        }
        this.$store.commit("changePendingBill", bill);
        uni.reLaunch({
          url: "/pages/pay",
        });
      }
      this.$store.dispatch("retriveUser");
    },
  },
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
    line-height: 2;
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

.scroll-wrap {
  position: absolute;
  width: 100%;
  top: 100%;
  left: 0;
  background: #fff;
  border-radius: 20rpx;
  border: 2rpx solid #f0f0f0;
  z-index: 999;
  .address-list {
    max-height: 300rpx;
    font-size: 28rpx;
    overflow: hidden;
    div {
      padding: 12rpx 20rpx;
      border-bottom: 2rpx solid #f0f0f0;
    }
  }
  .fixbtn {
    margin: 10rpx auto;
    width: 200rpx;
    background: #fcd81d;
    border-radius: 100rpx;
    font-size: 30rpx;
    text-align: center;
    padding: 4rpx;
    box-sizing: border-box;
  }
}
</style>