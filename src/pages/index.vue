<template>
  <div class="bg">
    <kefubtn />
    <cartbtn />
    <div class="white-card top">
      <div class="search">
        <searchbar placeholder="搜索" @search="goSearchList" />
      </div>
      <swiper style="height:380rpx" :autoplay="true">
        <block v-for="item in banners" :key="item.id">
          <swiper-item @click="goProduct(item)">
            <imagep :src="item.imgUrl" @load="(item)=>handleLoad(item)" />
          </swiper-item>
        </block>
      </swiper>
      <div class="gap" style="background:#f7f7f7;"></div>
      <div class="white-card trotting" v-if="brodcasts.length">
        <image class="icon" mode="widthFix" src="/static/laba.png" />
        <div class="container">
          <div class="broadcast">
            <div v-for="broadcast in brodcasts" :key="broadcast.id">{{broadcast.notifyText}}</div>
          </div>
        </div>
      </div>
      <div class="gap" style="background:#f7f7f7;"></div>
      <div class="category">
        <div class="item" v-for="item in category" :key="item.id" @click="goList(item.id)">
          <image class="logo" :src="item.imgUrl" mode="widthFix" />
          <div>{{item.name}}</div>
        </div>
      </div>
    </div>
    <template v-if="limitedProducts.length >0">
      <div class="gap" style="background:#f7f7f7;"></div>
      <div class="limited-block">
        <div class="header">
          <div class="title">限时购</div>
          <div class="time">{{hours}}</div>:
          <div class="time">{{minutes}}</div>:
          <div class="time">{{seconds}}</div>
          <div class="sub">限时限量 低价疯抢</div>
        </div>
        <div class="products">
          <div class="product-item" v-for="product in limitedProducts" :key="product.id">
            <productcard imgHeight="200rpx" :item="product" :breakLine="true" />
          </div>
        </div>
      </div>
    </template>
    <div class="gap"></div>
    <div class="white-card ad-card">
      <image :src="firstAd" style="width:100%;vertical-align:middle" mode="widthFix" />
    </div>
    <div class="gap"></div>

    <block v-for="(item,index) in indexProducts" :key="item.id">
      <div class="white-card product-card">
        <div class="header">
          <div class="hot">
            <image src="/static/shuxian.png" mode="widthFix" style="width:8rpx" />
            {{item.name}}
          </div>
          <div class="more" @click="goTagList(item.id)">
            查看更多
            <image src="/static/youjiantou-gray.png" mode="widthFix" style="width:22rpx" />
          </div>
        </div>
        <div class="product-list">
          <div class="product-item" v-for="product in item.product" :key="product.id">
            <productcard imgHeight="200rpx" :item="product" :breakLine="true" />
          </div>
        </div>
      </div>
      <div class="gap"></div>
      <block v-if="index === 2">
        <div class="white-card ad-card">
          <image :src="secondAd" style="width:100%;vertical-align:middle" mode="widthFix" />
        </div>
        <div class="gap"></div>
      </block>
    </block>

    <div class="page-gap"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import tabBar from "@/components/tabbar.vue";
export default Vue.extend({
  data() {
    return {
      banners: [],
      category: [],
      indexProducts: [],
      limitedProducts: [],
      brodcasts: [],
      firstAd: "",
      secondAd: "",
      bannerLoading: true,
      cateLoading: true,
      productLoading: true,
      adLoading: true,
      limitLoading: true,
      restTime: 0,
      timer: null,
    };
  },
  computed: {
    ...mapState(["userInfo", "gotUrl"]),
    hours() {
      return this.restTime > 0
        ? String(Math.floor(this.restTime / 3600)).padStart(2, "0")
        : "";
    },
    minutes() {
      return this.restTime > 0
        ? String(Math.floor((this.restTime / 60) % 60)).padStart(2, "0")
        : "";
    },
    seconds() {
      return this.restTime > 0
        ? String(this.restTime % 60).padStart(2, "0")
        : "";
    },
  },
  async onLoad() {
    let timer = setInterval(() => {
      if (this.gotUrl) {
        this.fetchHomePageCategories();
        this.fetchAds();
        this.fetchProducts();
        this.fetchTrotting();
        this.fetchBanner();
        this.fetchLimitedProduct();
        clearInterval(timer);
        timer = undefined;
      }
    }, 1000);
  },
  components: {
    tabBar,
  },
  onShareAppMessage() {
    return {
      path: "/pages/index",
    };
  },
  methods: {
    handleLoad(item) {
      this.bannerLoading = false;
    },
    goList(id) {
      if (id === 999) {
        uni.navigateTo({
          url: `/pages/productlist?sort=latest`,
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/productlist?categoryid=${id}`,
      });
    },
    goSearchList(keyword) {
      if (keyword) {
        uni.navigateTo({
          url: `/pages/productlist?keyword=${keyword}`,
        });
      }
    },
    async fetchTrotting() {
      this.brodcastLoading = true;
      const brodcasts = await this.$request("fetchNotification", {});
      this.brodcasts = brodcasts;
      this.brodcastLoading = false;
    },
    goTagList(id) {
      uni.navigateTo({
        url: `/pages/productlist?tagid=${id}`,
      });
    },
    goProduct(payload) {
      const { param, type } = payload;
      if (type === "商品") {
        uni.navigateTo({ url: `/pages/product?id=${param}` });
      } else if (type === "小程序") {
        uni.navigateToMiniProgram({
          appId: param,
        });
      } else if (type === "分类") {
        uni.navigateTo({ url: `/pages/productlist?categoryid=${param}` });
      }
    },
    async fetchBanner() {
      this.bannerLoading = true;
      const bannerRes = await this.$request("fetchBanner", { loading: true });
      this.bannerLoading = false;
      this.banners = bannerRes;
    },
    async fetchHomePageCategories() {
      this.cateLoading = true;
      const category = await this.$request("fetchHomePageCategories", {
        loading: true,
      });
      if (category.length > 0) {
        category.unshift({
          name: "全部商品",
          imgUrl: "https://freshgo.top/file/newIcon.png",
          id: 999,
        });
      }
      this.category = category;
      this.cateLoading = false;
    },
    async fetchAds() {
      this.adLoading = true;
      const ads = await this.$request("fetchAdByType", {
        loading: true,
        data: {
          type: "首页",
        },
      });
      this.adLoading = false;
      if (ads && ads.length) {
        this.firstAd = ads[0].imgUrl;
        this.secondAd = ads[1].imgUrl;
      }
    },
    async fetchLimitedProduct() {
      this.limitLoading = true;
      const limitRes = await this.$request("fetchLimitedProduct", {
        loading: true,
      });
      this.limitLoading = false;
      if (limitRes) {
        const { product, restTime } = limitRes;
        this.limitedProducts = product;
        this.restTime = restTime;
        if (this.timer) {
          clearInterval(this.timer);
        } else {
          this.timer = setInterval(() => {
            if (this.restTime - 1 <= 0) {
              this.restTime = 0;
              clearInterval(this.timer);
              return;
            }
            this.restTime -= 1;
          }, 1000);
        }
      }
      console.log("limitedProducts", limitRes);
    },
    async fetchProducts() {
      this.productLoading = true;
      const tags = await this.$request("fetchTag", { loading: true });
      this.productLoading = false;
      if (tags && tags.length) {
        tags.forEach((item) => {
          item.products = [];
        });
      }
      this.indexProducts = tags;
    },
  },
});
</script>

<style lang="scss" scoped>
.top {
  position: relative;
  .search {
    z-index: 100;
    top: 10rpx;
    left: 50%;
    transform: translate(-50%, 0);
    width: 90%;
    margin: 0 auto;
    position: absolute;
  }
}

@keyframes horizontal {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-100%, 0, 0);
  }
}

.trotting {
  padding: 10rpx 20rpx;
  display: flex;
  align-items: center;
  image {
    margin-right: 20rpx;
  }
  .container {
    flex: 1;
    overflow: hidden;
    height: 60rpx;
    position: relative;
    .broadcast {
      color: #a1a1a1;
      white-space: nowrap;
      height: 100%;
      position: relative;
      transform: translate3d(0, 0, 0);
      margin-left: 100%;
      top: 0;
      display: flex;
      font-size: 24rpx;
      align-items: center;
      width: fit-content;
      animation: horizontal 300s linear infinite;
      & div {
        padding-right: 80rpx;
        &:nth-last-child(1) {
          padding: 0;
        }
      }
    }
  }

  .icon {
    width: 40rpx;
  }
}

.category {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 30rpx;
  .item {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    padding: 30rpx 20rpx 0;
    box-sizing: border-box;
    width: 20%;
    font-size: 26rpx;
    .logo {
      width: 100%;
      max-height: 140rpx;
      margin-bottom: 10rpx;
    }
  }
}
.ad-card {
  padding: 10rpx 20rpx;
}
.top-image {
  height: 570rpx;
  overflow: hidden;
}
.product-card {
  padding: 20rpx;
  .product-list {
    display: flex;
    flex-wrap: wrap;
    .product-item {
      width: calc(100% / 3);
    }
  }
  .header {
    display: flex;
    justify-content: space-between;
    .hot {
      display: flex;
      align-items: center;
      image {
        margin-right: 10rpx;
      }
    }
    .more {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #858585;
    }
  }
}

.limited-block {
  width: 96%;
  border-radius: 30rpx;
  overflow: hidden;
  margin: 0 auto;
  background: #fff;
  box-shadow: 4rpx 4rpx 8rpx rgba(0, 0, 0, 0.1);
  .header {
    padding: 20rpx 20rpx;
    display: flex;
    align-items: center;
    .title {
      font-weight: bold;
      margin-right: 10rpx;
    }
    .time {
      background: #f5273c;
      color: #fff;
      border-radius: 10rpx;
      padding: 0 8rpx;
      margin: 0 6rpx;
    }
    .sub {
      color: #919191;
      font-size: 24rpx;
      margin-left: 20rpx;
    }
  }
  .products {
    display: flex;
    flex-wrap: wrap;
    .product-item {
      width: calc(100% / 3);
    }
  }
}
</style>
