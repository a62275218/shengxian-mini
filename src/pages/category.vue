<template>
  <div class="category-wrap">
    <div class="navbar">
      <div
        :class="{'nav-item active': item.active}"
        class="nav-item"
        v-for="(item,index) in category"
        :key="item"
        @click="changeActive(index)"
      >{{item.name}}</div>
    </div>
    <scroll-view class="content" scroll-y="true">
      <div v-if="!subloading && !subcategory.length" class="notfound">暂无内容</div>
      <skeleton :config="[{row:7},{row:7},{row:7}]" :loading="subloading">
        <div class="sublist">
          <div class="subitem" @click="goList(item.id)" v-for="item in subcategory" :key="item.id">
            <div class="img">
              <imagep :src="item.imgUrl" />
            </div>
            <div>{{item.name}}</div>
          </div>
        </div>
      </skeleton>
    </scroll-view>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      category: [],
      subcategory: [],
      subloading: true
    };
  },
  async onShow() {
    const category = await this.$request("fetchCategories", {});
    category[0].active = true;
    this.getSubCategory(category[0].id);
    this.category = category;
  },
  methods: {
    goList(id) {
      uni.navigateTo({
        url: `/pages/productlist?subid=${id}`
      });
    },
    changeActive(index) {
      this.getSubCategory(this.category[index].id);
      this.category.forEach((item, idx) => {
        item.active = idx === index;
      });
    },
    async getSubCategory(id) {
      this.subloading = true;
      const subcategory = await this.$request(
        "fetchSubCategoriesByCategoriesId",
        {
          data: {
            id
          }
        }
      );
      this.subloading = false;
      this.subcategory = subcategory;
    }
  }
};
</script>

<style lang="scss">
.category-wrap {
  display: flex;
  height: 100vh;
  .navbar {
    width: 200rpx;
    min-width:200rpx;
    background: #f7f7f7;
    .nav-item {
      padding: 40rpx;
      text-align: center;
      color: #666666;
      font-size: 30rpx;
    }
    .active {
      background: #fff;
      color: #ffcb34;
    }
  }
  .content {
    flex: 1;
  }
  .sublist {
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;
    .subitem {
      width: 33%;
      box-sizing: border-box;
      text-align: center;
      font-size: 26rpx;
      color: #666666;
      padding-bottom: 40rpx;
      .img {
        padding: 10rpx;
        box-sizing: border-box;
        height: 140rpx;
        margin-bottom: 20rpx;
      }
    }
  }
}
</style>