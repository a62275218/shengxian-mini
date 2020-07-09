<template>
  <div class="category-wrap">
    <div class="navbar">
      <div
        :class="{'nav-item active': item.active}"
        class="nav-item"
        v-for="(item,index) in category"
        :key="item.id"
        @click="changeActive(index)"
      >{{item.name}}</div>
    </div>
    <scroll-view class="content" scroll-y="true">
      <div v-if="!subcategory.length" class="empty">暂无内容</div>

      <div class="sublist">
        <div class="subitem" @click="goList(item.id)" v-for="item in subcategory" :key="item.id">
          <div class="img">
            <imagep :src="item.imgUrl" />
          </div>
          <div>{{item.name}}</div>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      category: [],
      subcategory: [],
      index: 0
    };
  },
  async mounted() {
    const category = await this.$request("fetchCategories", {});
    category[0].active = true;
    this.getSubCategory(category[0].id);
    this.category = category;
  },
  methods: {
    goList(id) {
      uni.navigateTo({
        url: `/pages/productlist?categoryid=${
          this.category[this.index].id
        }&subid=${id}`
      });
    },
    changeActive(index) {
      this.index = index;
      this.getSubCategory(this.category[index].id);
      this.category.forEach((item, idx) => {
        item.active = idx === index;
      });
    },
    async getSubCategory(id) {
      const subcategory = await this.$request(
        "fetchSubCategoriesByCategoriesId",
        {
          loading:true,
          data: {
            id
          }
        }
      );
      this.subcategory = subcategory;
    }
  }
};
</script>

<style lang="scss">
.category-wrap {
  display: flex;
  min-height: 100vh;
  height:100%;
  .navbar {
    width: 200rpx;
    min-width: 200rpx;
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
    padding: 20rpx 10rpx;
    .subitem {
      width: 50%;
      box-sizing: border-box;
      text-align: center;
      font-size: 28rpx;
      color: #666666;
      padding-bottom: 40rpx;
      .img {
        padding: 10rpx;
        box-sizing: border-box;
        height: 260rpx;
        margin-bottom: 20rpx;
      }
    }
  }
}
</style>