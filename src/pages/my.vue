<template>
  <div class="bg">
    <div class="top">
      <image src="/static/me_bg.png" class="bg-img" mode="heightFix" />
      <block v-if="userInfo">
        <div class="avatar">
          <open-data type="userAvatarUrl"></open-data>
        </div>
        <!-- <image :src="userInfo.avatar" style="width:120rpx;border-radius:50%;" mode="widthFix" /> -->
        <div class="text">{{userInfo.username}}</div>
      </block>
      <block v-else>
        <image src="/static/头像.png" style="width:120rpx;z-index:200" mode="widthFix" />
        <button class="text normal-button" open-type="getUserInfo" @getuserinfo="login">立即登录</button>
        <image src="/static/youjiantou.png" style="width:40rpx;margin-top:6rpx" mode="widthFix" />
      </block>
    </div>
    <div class="white-card bill-section" v-if="userInfo">
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
      <block v-for="item in menu2" :key="item.title">
        <div
          class="row"
          v-if="userInfo || item.title==='联系客服' || item.title==='关于我们'"
          @click="navigateService(item.url)"
        >
          <div class="left">
            <image style="width:60rpx;" :src="item.icon" mode="widthFix" />
            {{item.title}}
          </div>
          <div>
            <image style="width:30rpx;" src="/static/youjiantou-gray.png" mode="widthFix" />
          </div>
          <!-- <button open-type="contact" v-if="item.title==='联系客服'" class="hidden-btn"></button> -->
        </div>
      </block>
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
          title: "待付款",
        },
        {
          icon: "/static/peisongzhong.png",
          title: "待配送",
        },
        {
          icon: "/static/yiwancheng.png",
          title: "已完成",
        },
        {
          icon: "/static/yituikuan.png",
          title: "已退款",
        },
      ],
      menu2: [
        {
          icon: "/static/wodexiangqing.png",
          title: "我的信息",
          url: "/pages/address",
        },
        {
          icon: "/static/liulanlishi.png",
          title: "浏览历史",
          url: "/pages/history",
        },
        {
          icon: "/static/wodeshoucang.png",
          title: "我的收藏",
          url: "/pages/favorite",
        },
        {
          icon: "/static/lianxikefu.png",
          title: "联系客服",
          url: "/pages/about",
        },
        {
          icon: "/static/info.png",
          title: "关于我们",
          url: "/pages/about",
        },
      ],
    };
  },
  onShow() {
    this.$store.dispatch("retriveUser");
  },
  computed: {
    ...mapState(["userInfo"]),
  },
  methods: {
    login(userInfoRes) {
      this.$store.dispatch("userLogin", userInfoRes.detail.userInfo);
    },
    navigateBill(title) {
      uni.navigateTo({
        url: `/pages/bill?type=${title}`,
      });
    },
    navigateService(url) {
      if (url) {
        console.log(url);
        uni.navigateTo({
          url,
        });
      }
    },
  },
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
  position: relative;
  overflow: hidden;
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    z-index: 1;
  }
  .bg-img {
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
  }
  .text {
    font-size: 35rpx;
    color: #fff;
    padding: 0 10rpx 0 30rpx;
    z-index: 1;
  }
}

.service-section {
  padding: 20rpx 20rpx 0 20rpx;
  .row {
    position: relative;
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
    .hidden-btn {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
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