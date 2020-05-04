<template>
  <div class="bg">
    <div class="top">
      <block v-if="userInfo">
        <image :src="userInfo.avatar" style="width:120rpx;border-radius:50%;" mode="widthFix" />
        <div class="text">{{userInfo.username}}</div>
      </block>
      <block v-else>
        <image src="/static/头像.png" style="width:120rpx;" mode="widthFix" />
        <button class="text normal-button" open-type="getUserInfo" @getuserinfo="login">立即登录</button>
        <image src="/static/youjiantou.png" style="width:40rpx;margin-top:6rpx" mode="widthFix" />
      </block>
    </div>
    <div class="white-card bill-section">
      <div class="section-title">我的订单</div>
      <div class="bill-list">
        <div v-for="item in menu" :key="item.title" class="item" @click="navigateBill(item.title)">
          <image style="width:80%;" :src="item.icon" mode="widthFix" />
          <div>{{item.title}}</div>
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="white-card service-section">
      <div class="section-title">我的服务</div>
      <div class="row" v-for="item in menu2" :key="item.title">
        <div class="left">
          <image style="width:60rpx;" :src="item.icon" mode="widthFix" />
          {{item.title}}
        </div>
        <div>
          <image style="width:30rpx;" src="/static/youjiantou-gray.png" mode="widthFix" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
export default {
  data() {
    return {
      menu: [
        {
          icon: "/static/daifukuan.png",
          title: "待付款"
        },
        {
          icon: "/static/daipeisong.png",
          title: "待配送"
        },
        {
          icon: "/static/peisongzhong.png",
          title: "配送中"
        },
        {
          icon: "/static/yiwancheng.png",
          title: "已完成"
        },
        {
          icon: "/static/yituikuan.png",
          title: "已退款"
        }
      ],
      menu2: [
        {
          icon: "/static/wodexiangqing.png",
          title: "我的详情"
        },
        {
          icon: "/static/liulanlishi.png",
          title: "浏览历史"
        },
        {
          icon: "/static/wodeshoucang.png",
          title: "我的收藏"
        },
        {
          icon: "/static/lianxikefu.png",
          title: "联系客服"
        }
      ]
    };
  },
  computed: {
    ...mapState(["userInfo"])
  },
  methods: {
    login(userInfoRes) {
      this.$store.dispatch("userLogin", userInfoRes.detail.userInfo);
    },
    navigateBill(title) {
      uni.navigateTo({
        url: `/pages/bill?type=${title}`
      });
    }
  }
};
</script>

<style lang="scss">
.top {
  color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 0;
  height: 280rpx;
  background: url("/static/me_bg.png") no-repeat;
  .text {
    font-size: 35rpx;
    color: #fff;
    padding: 0 10rpx 0 30rpx;
  }
}

.service-section {
  padding: 20rpx 20rpx 0 20rpx;
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    .left {
      display: flex;
      align-items: center;
      min-width: 200rpx;
      image {
        margin-right: 20rpx;
      }
    }
  }
}

.bill-section {
  padding: 20rpx;
  .bill-list {
    display: flex;
    justify-content: space-around;
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;
      font-size: 28rpx;
      color: #555555;
    }
  }
}
</style>