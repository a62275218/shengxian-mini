<template>
  <div class="bg">
    <kefubtn :bottom="132" />
    <custommodal :visible="loading">
      <div class="loading">上传中...</div>
    </custommodal>
    <div style="width:90%;margin:0 auto;">
      <div class="white-card bill">
        <div class="bill-title">
          <div>订单信息</div>
          <div class="sub">下单时间: {{formatDate(pendingBill.createTime,true)}}</div>
        </div>
        <div class="top">
          <div>订单号: {{pendingBill.orderId}}</div>
          <div>{{pendingBill.status}}</div>
        </div>
        <div class="content">
          <div class="row" v-for="item in pendingBill.orderDetail" :key="item.id">
            <image :src="item.imgUrls[0]" style="width:100rpx" mode="widthFix" />
            <div class="title">{{item.title}}</div>
            <div class="price">
              <div>$ {{item.price}}</div>
              <div>X {{item.buyNum}}</div>
            </div>
          </div>
        </div>
        <div class="bill-title">配送信息</div>
        <div class="userinfo">
          <div class="row">
            <div class="input">
              <div class="title">姓名</div>
              {{pendingBill.name}}
            </div>
          </div>
          <div class="row">
            <div class="input">
              <div class="title">电话</div>
              {{pendingBill.phone}}
            </div>
          </div>
          <div class="row">
            <div class="input">
              <div class="title">微信号</div>
              {{pendingBill.wechat}}
            </div>
          </div>
          <div class="row">
            <div class="input">
              <div class="title">地址</div>
              {{pendingBill.address}}
            </div>
          </div>
          <div class="row">
            <div class="input">
              <div class="title">配送日期</div>
              {{pendingBill.deliveryDate}}
            </div>
          </div>
        </div>
        <div class="total">
          <div style="flex:1;">{{cutText}}</div>
          <div class="count">
            <div style="margin-right:20rpx;">共{{pendingBill.orderDetail.length}}件商品</div>
            <div>
              实付
              <span class="price">
                <span style="font-size:24rpx;">$</span>
                {{pendingBill.price}}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="gap"></div>
      <div class="row-card" @click="paymentWay(false)" v-if="!detail">
        <div class="row">
          <div class="title">支付方式</div>
          <div style="display:flex;align-items:center">
            <div style="margin-right:20rpx;">{{bound?'货到付款':payMode}}</div>
            <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
          </div>
        </div>
      </div>
      <div class="gap"></div>
      <div class="white-card pay-desc" v-if="payMode !=='RoyalPay' && payMode || bound">
        <block v-if="bound">
          <div>选择货到付款的客户，请通过下面三种方式支付$20澳元定金，收货时需要支付尾款 ${{pendingBill.price-20>0?pendingBill.price-20:0}} 澳币，尾款目前只支持现金支付</div>
          <div>请确保送货当天家中有人</div>
          <div>请准备好现金支付尾款</div>
          <div>请您支付定金以确认下单</div>
          <button class="button" @click="paymentWay(true)">支付定金</button>
        </block>
        <block v-if="payMode ==='澳元转账'">
          <div>请务必截图，以便上传支付凭证</div>
          <div>Commonwealth Bank</div>
          <div class="row">
            <div>Name: fresh go</div>
            <div class="copy" @click="copy('fresh go')">点此复制</div>
          </div>
          <div class="row">
            <div>BSB: 063109</div>
            <div class="copy" @click="copy('063109')">点此复制</div>
          </div>
          <div class="row">
            <div>Account: 13315625</div>
            <div class="copy" @click="copy('13315633')">点此复制</div>
          </div>
          <button class="button" @click="uploadPay">上传支付凭证</button>
        </block>
        <block v-else-if="payMode ==='RMB支付'">
          <div>人民币支付 实时汇率 零手续费</div>
          <div>扫描以下二维码支付</div>
          <div>请务必截图，以便上传支付凭证</div>
          <div class="paycode" @click="previewCode">
            <image
              src="https://freshgo123.com/file/paymentQr.jpg"
              mode="widthFix"
              style="width:100%;"
            />
          </div>
          <button class="button" @click="uploadPay">上传支付凭证</button>
        </block>
        <block v-else-if="payMode ==='货到付款'">
          <div>选择货到付款的客户，请通过下面三种方式支付$20澳元定金，收货时需要支付尾款 ${{pendingBill.price-20>0?pendingBill.price-20:0}} 澳币，尾款目前只支持现金支付</div>
          <div>请确保送货当天家中有人</div>
          <div>请准备好现金支付尾款</div>
          <div>请您支付定金以确认下单</div>
          <button class="button" @click="paymentWay(true)">支付定金</button>
        </block>
        <button open-type="contact" class="button">联系客服</button>
        <div style="10rpx;"></div>
        <div class="row" v-for="(item,index) in serviceList" :key="item.id">
          <div>客服微信{{index+1}}: {{item.wxId}}</div>
          <div class="copy" @click="copy(item.wxId)">点此复制</div>
        </div>
      </div>
      <div class="page-gap"></div>
      <div class="page-gap"></div>
      <div class="page-gap"></div>
      <div class="bottom-control" v-if="(payMode==='RoyalPay' || !payMode || bound) && !detail">
        <div class="left">{{payMode === 'RoyalPay'?'手续费 0.88%':bound?'':'请在订单底部选择支付方式'}}</div>
        <div class="right" v-if="bound" style="align-self: center;padding-right:20rpx;">请支付20澳元定金</div>
        <div class="confirm" v-if="payMode==='RoyalPay'" @click="payBill">立即支付</div>
      </div>
    </div>
  </div>
</template>

<script>
const payConfig = [
  { label: "Royalpay 微信支付", value: "RoyalPay" },
  { label: "澳元支付 银行转账", value: "澳元转账" },
  { label: "RMB支付 零手续费", value: "RMB支付" },
  { label: "货到付款 定金$20", value: "货到付款" },
];
import { mapState } from "vuex";
import { checkBill, formatDate } from "@/util";
export default {
  data() {
    return {
      payMode: "RoyalPay",
      enablePay: true,
      bound: false,
      loading: false,
      detail: false,
    };
  },
  onShow() {
    const { mode } = this.$mp.query;
    this.detail = Boolean(mode);
  },
  computed: {
    ...mapState(["pendingBill", "userInfo", "serviceList", "baseUrl"]),
    cutText() {
      const areaInfo = this.$getIn(this.pendingBill, "areaInfo");
      const paymentWay = this.$getIn(this.pendingBill, "paymentWay");
      console.log(paymentWay);
      if (paymentWay) {
        return paymentWay === "货到付款" && this.pendingBill.status === '待配送'
          ? `实付$20,尾款$${
              this.pendingBill.price - 20 < 0 ? 0 : this.pendingBill.price - 20
            }`
          : paymentWay;
      }
      if (areaInfo && areaInfo.threshold) {
        const { cutPrice, price, threshold, originalPrice } = areaInfo;
        if (price == 0) {
          return `该地区已满$${threshold}免配送费`;
        } else if (originalPrice == price) {
          return `该地区满$${threshold}即可减$${cutPrice}`;
        } else if (originalPrice > price) {
          return `该地区已满$${threshold}减$${cutPrice}`;
        }
      } else {
        return "";
      }
    },
  },
  methods: {
    formatDate,
    paymentWay(bound) {
      let itemList = JSON.parse(
        JSON.stringify(payConfig.map((item) => item.label))
      );
      if (bound) {
        itemList = itemList.filter((item) => {
          return item !== "货到付款 定金$20";
        });
      }
      this.bound = Boolean(bound);
      const _this = this;
      uni.showActionSheet({
        itemList,
        success: function (res) {
          _this.payMode = payConfig[res.tapIndex].value;
        },
        fail: function (res) {
          console.log(res.errMsg);
        },
      });
    },
    previewCode() {
      uni.previewImage({
        urls: ["https://freshgo123.com/file/paymentQr.jpg"],
      });
    },
    updateOrder() {
      this.$request("updateOrder", {
        data: {
          orderId: this.pendingBill.orderId,
          paymentWay: this.bound ? "货到付款" : this.payMode,
          status: "待配送",
        },
      });
      uni.hideLoading();
    },
    async confirmProductArrival() {
      uni.showModal({
        title: "提示", //提示的标题,
        content: "是否要确认下单?", //提示的内容,
        success: async (res) => {
          if (res.confirm) {
            const res = await this.$request("updateOrder", {
              loading: true,
              data: {
                orderId: this.pendingBill.orderId,
                paymentWay: this.payMode,
                status: "待配送",
              },
            });
            if (res) {
              uni.showToast({
                title: "确认成功",
              });
              setTimeout(() => {
                uni.switchTab({
                  url: "/pages/my",
                });
              }, 1000);
            }
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    },
    payBill() {
      if (!this.enablePay) {
        return;
      }

      const _this = this;
      this.enablePay = false;
      uni.getProvider({
        service: "payment",
        success: async (res) => {
          const provider = res.provider[0];
          const royalPayRes = await _this.$request("royalpaySign", {
            loading: true,
            data: {
              timeStamp: Date.now(),
              orderId: this.pendingBill.orderId,
              price: this.bound ? 20 : this.pendingBill.price,
              openId: this.userInfo.openId,
            },
          });
          const data = checkBill(royalPayRes);
          if (data) {
            const { sdk_params } = data;
            const { nonceStr, signType, paySign, timeStamp } = sdk_params;
            uni.requestPayment({
              provider,
              timeStamp,
              nonceStr,
              package: sdk_params.package,
              signType,
              paySign,
              success: (res) => {
                // _this.$store.commit(
                //   "batchRemoveFromCart",
                //   _this.pendingBill.orderDetail.map(item => {
                //     return item.id;
                //   })
                // );
                _this.updateOrder();
                this.enablePay = true;
                uni.reLaunch({ url: "/pages/payresult" });
              },
              fail: (err) => {
                uni.showToast({
                  title: "支付失败",
                  icon: "none",
                });
                this.enablePay = true;
              },
            });
          } else {
            uni.showToast({
              title: "支付失败",
              icon: "none",
            });
            this.enablePay = true;
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "获取服务商失败",
            icon: "none",
          });
          this.enablePay = true;
        },
      });
    },
    uploadPay() {
      const _this = this;
      uni.chooseImage({
        count: 1,
        success: (e) => {
          const filePath = e.tempFilePaths[0];
          _this.loading = true;
          uni.uploadFile({
            url: `${this.baseUrl}uploadOrderPaymentImg`,
            name: "file",
            filePath,
            formData: {
              id: _this.pendingBill.orderId,
            },
            success: (res) => {
              _this.loading = false;
              if (res.statusCode === 200) {
                uni.showModal({
                  title: "提示", //提示的标题,
                  content: "上传成功", //提示的内容,
                  showCancel: false,
                  success: async (res) => {
                    _this.updateOrder();
                    if (res.confirm) {
                      uni.switchTab({
                        url: "/pages/my",
                      });
                      // this.$refs.tab.refetch();
                    } else if (res.cancel) {
                      uni.switchTab({
                        url: "/pages/my",
                      });
                    }
                  },
                });
              } else {
                uni.showToast({
                  title: "上传失败",
                  icon: "none",
                });
              }
            },
            fail: () => {
              uni.showToast({
                title: "上传失败",
                icon: "none",
              });
              _this.loading = false;
            },
          });
        },
        fail: () => {
          _this.loading = false;
          uni.hideLoading();
        },
      });
    },
    copy(text) {
      uni.setClipboardData({
        data: text,
        success: function () {
          uni.showToast({ title: "复制成功" });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.bill {
  border-radius: 14rpx;
  font-size: 26rpx;
  .bill-title {
    font-size: 30rpx;
    padding: 20rpx;
    border-bottom: 2rpx solid #f3f3f3;
    display: flex;
    justify-content: space-between;
    .sub {
      font-size: 26rpx;
    }
  }
  .top {
    color: #666666;
    display: flex;
    justify-content: space-between;
    border-bottom: 2rpx solid #f3f3f3;
    padding: 20rpx;
  }
  .content {
    padding: 20rpx;
  }
  .row {
    display: flex;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 20rpx;
    }
    .title {
      flex: 1;
      padding: 10rpx 20rpx;
    }
    .price {
      padding-top: 10rpx;
      text-align: right;
    }
  }
  .bottom {
    border-top: 2rpx solid #f3f3f3;
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .deliveryImg {
      color: #1d90fc;
    }
    .control {
      display: flex;
      .cancel {
        border: 2rpx solid #c9c9c9;
        color: #c9c9c9;
      }
      .pay {
        background: #fcd81d;
      }
      .btn {
        margin-left: 10rpx;
        padding: 10rpx 30rpx;
        border-radius: 30rpx;
        text-align: center;
      }
    }
  }
}
.total {
  padding: 20rpx;
  display: flex;
  color: #666666;
  .count {
    display: flex;
    align-items: center;
    .price {
      color: #ff9f24;
      font-size: 30rpx;
      margin-left: 20rpx;
    }
  }
}
.userinfo {
  border-bottom: 2rpx solid #f3f3f3;
  .row {
    display: flex;
  }
  .input {
    display: flex;
    align-items: center;
  }
}
.paycode {
  overflow: hidden;
  border-radius: 124rpx;
  image {
    margin-bottom: -40rpx;
  }
}
.pay-desc {
  font-size: 26rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  & > div {
    padding-bottom: 26rpx;
  }
  .row {
    display: flex;
    justify-content: space-between;
    .copy {
      color: #fcd81d;
    }
  }
  .button {
    background: #fcd81d;
    border-radius: 20rpx;
    margin: 26rpx 0;
    font-size: 28rpx;
  }
}
.bottom-control {
  min-height: 110rpx;
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
.loading {
  color: #fff;
  text-align: center;
}
</style>