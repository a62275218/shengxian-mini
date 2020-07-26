<template>
  <div class="bg">
    <tabbar
      ref="tab"
      :list="list"
      normalColor="#666666"
      activeColor="#FFCB34"
      @change="getBillList"
      :defaultIndex="defaultIndex"
    />
    <div class="gap"></div>
    <block v-for="bill in bills" :key="bill.id">
      <div class="white-card bill">
        <div class="top">
          <div>下单时间: {{formatDate(bill.createTime,true)}}</div>
          <div>{{bill.status}}</div>
        </div>
        <div class="content" @click="goBill(bill)">
          <div class="row" v-for="item in bill.orderDetail" :key="item.id">
            <image :src="item.imgUrls[0]" style="width:100rpx" mode="widthFix" />
            <div class="title">{{item.title}}</div>
            <div class="price">
              <div>$ {{item.price}}</div>
              <div>X {{item.buyNum}}</div>
            </div>
          </div>
          <div class="total">
            <div style="flex:1;"></div>
            <div class="count">
              <div style="margin-right:20rpx;">共{{bill.orderDetail.length}}件商品</div>
              <div>
                实付
                <span class="price">
                  <span style="font-size:24rpx;">$</span>
                  {{bill.price}}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div style="display:flex;">
            <div class="deliveryImg" @click="preview(bill.deliveryImg)">送货图片</div>
            <div v-if="bill.paymentImg" class="deliveryImg" @click="preview(bill.paymentImg)">查看凭证</div>
          </div>
          <div class="control">
            <div class="cancel btn" @click="cancelOrder(bill)" v-if="currentIndex === 0">取消订单</div>
            <div class="pay btn" @click="goPayment(bill)" v-if="currentIndex === 0">立即支付</div>
            <div class="pay btn" @click="confirmBill(bill)" v-if="currentIndex === 1">确认收货</div>
          </div>
        </div>
      </div>
      <div class="gap"></div>
    </block>
    <div class="empty" v-if="!loading && !bills.length">暂无内容</div>
    <div class="page-gap"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {formatDate} from '@/util'
export default {
  data() {
    return {
      list: [
        { label: "待付款" },
        { label: "待配送" },
        { label: "已完成" },
        { label: "已退款" }
      ],
      bills: [],
      defaultIndex: 0,
      currentIndex: 0,
      loading: true
    };
  },
  computed: {
    ...mapState(["userInfo"])
  },
  onShow() {
    const { type } = this.$mp.query;
    this.defaultIndex = this.list.findIndex((item, index) => {
      return item.label === type;
    });
    this.$refs.tab.refetch();
  },
  methods: {
    formatDate,
    goPayment(bill) {
      this.$store.commit("changePendingBill", bill);
      uni.navigateTo({
        url: "/pages/pay"
      });
    },
    goBill(bill) {
      if(bill.status === '待付款'){
        this.goPayment(bill)
        return
      }
      this.$store.commit("changePendingBill", bill);
      uni.navigateTo({ url: `/pages/pay?mode=detail` });
    },
    cancelOrder(bill) {
      uni.showModal({
        title: "提示", //提示的标题,
        content: "确认要取消该订单吗?", //提示的内容,
        success: async res => {
          if (res.confirm) {
            const res = await this.$request("updateOrder", {
              loading: true,
              data: {
                orderId: bill.orderId,
                status: "已取消"
              }
            });
            if (res) {
              uni.showToast({
                title: "取消订单成功"
              });
            }
            this.$refs.tab.refetch();
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        }
      });
    },
    confirmBill(bill) {
      uni.showModal({
        title: "提示", //提示的标题,
        content: "是否要确认收货?", //提示的内容,
        success: async res => {
          if (res.confirm) {
            const res = await this.$request("updateOrder", {
              loading: true,
              data: {
                orderId: bill.orderId,
                status: "已完成"
              }
            });
            if (res) {
              uni.showToast({
                title: "确认收货成功"
              });
            }
            this.$refs.tab.refetch();
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        }
      });
    },
    async getBillList(index) {
      this.currentIndex = index;
      this.loading = true;
      const label = this.list[index].label;
      const billRes = await this.$request("fetchOrderByUserIdAndStatus", {
        loading: true,
        data: {
          id: this.userInfo.id,
          status: label
        }
      });
      this.loading = false;
      billRes.forEach(bill => {
        let total = 0;
        bill.orderDetail.forEach(order => {
          total += Number(order.price);
        });
        bill.totalPrice = total;
      });
      this.bills = billRes;
    },
    preview(src) {
      if (!src) {
        uni.showToast({
          title: "暂无送货图片", //提示的内容,
          icon: "none" //图标,
        });
      }
      uni.previewImage({
        urls: [src] //需要预览的图片链接列表,
      });
    }
  }
};
</script>

<style lang="scss">
.bill {
  width: 90%;
  border-radius: 14rpx;
  margin: 0 auto;
  font-size: 26rpx;
  .top {
    color: #666666;
    display: flex;
    justify-content: space-between;
    border-bottom: 2rpx solid #f3f3f3;
    padding: 20rpx;
  }
  .content {
    padding: 20rpx;
    .total {
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
      margin-right: 10rpx;
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
</style>