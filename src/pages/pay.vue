<template>
  <div class="bg">
    <div style="width:90%;margin:0 auto;">
      <div class="white-card bill">
        <div class="bill-title">订单信息</div>
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
              <div class="title">姓名</div>
              {{pendingBill.phone}}
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
          <div style="flex:1;"></div>
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
      <div class="row-card" @click="paymentWay">
        <div class="row">
          <div class="title">支付方式</div>
          <div style="display:flex;align-items:center">
            <div style="margin-right:20rpx;">{{payMode}}</div>
            <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:30rpx" />
          </div>
        </div>
      </div>
      <div class="page-gap"></div>
      <div class="page-gap"></div>
      <div class="page-gap"></div>
      <div class="bottom-control">
        <div class="left">{{payMode?'':'请在订单底部选择支付方式'}}</div>
        <div class="confirm" v-if="payMode==='微信支付'" @click="payBill">立即支付</div>
      </div>
    </div>
  </div>
</template>

<script>
const payConfig = ["微信支付", "银行转账"];
import { mapState } from "vuex";
import { checkBill } from "@/util";
export default {
  data() {
    return {
      payMode: ""
    };
  },
  computed: {
    ...mapState(["pendingBill", "userInfo"])
  },
  methods: {
    paymentWay() {
      const _this = this;
      uni.showActionSheet({
        itemList: payConfig,
        success: function(res) {
          _this.payMode = payConfig[res.tapIndex];
        },
        fail: function(res) {
          console.log(res.errMsg);
        }
      });
    },
    payBill() {
      const _this = this;
      uni.getProvider({
        service: "payment",
        success: async res => {
          const provider = res.provider[0];
          const royalPayRes = await _this.$request("royalpaySign", {
            data: {
              timeStamp: Date.now(),
              orderId: this.pendingBill.orderId,
              price: this.pendingBill.totalPrice,
              openId: this.userInfo.openId
            }
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
              success: res => {
                _this.$store.commit(
                  "batchRemoveFromCart",
                  _this.pendingBill.orderDetail.map(item => {
                    return item.id;
                  })
                );
                uni.reLaunch({ url: "/pages/payresult" });
              },
              fail: err => {
                uni.showToast({
                  title: "支付失败",
                  icon: "none"
                });
                console.log(err);
              }
            });
          } else {
            uni.showToast({
              title: "支付失败",
              icon: "none"
            });
          }
        },
        fail: err => {
          uni.showToast({
            title: "获取服务商失败",
            icon: "none"
          });
        }
      });
    }
  }
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
</style>