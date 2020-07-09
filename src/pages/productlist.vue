<template>
  <div class="bg">
    <kefubtn />
    <cartbtn />
    <div class="header">
      <div class="search">
        <div class="cate-text">
          <span style="margin-right:10rpx;">{{currentCategory.name}}</span>
          {{subCategoryList.length?currentSubCategory.name:''}}
        </div>
        <div style="flex:1;">
          <searchbar
            placeholder="商品名称"
            background="#F4F4F4"
            @search="changeSearch"
            :value="searchWord"
          />
        </div>
      </div>
      <div class="filter">
        <picker
          class="item"
          mode="multiSelector"
          :value="multiIndex"
          :range="[categoryList,subCategoryList]"
          range-key="name"
          @click="()=>getSubCategory(currentCategory?currentCategory.id:999)"
          @change="handleCateChange"
          @columnchange="handleColChange"
        >
          <div>分类</div>
        </picker>
        <div class="item" v-for="item in filterTab" :key="item.name" @click="changeStatus(item)">
          {{item.name}}
          <image style="width:34rpx;" :src="judgeSortImg(item.status)" mode="widthFix" />
        </div>
      </div>
      <div class="products">
        <div class="product-item" v-for="item in filterProductList" :key="item.id">
          <productcard imgHeight="300rpx" :item="item" />
        </div>
      </div>
    </div>
    <div v-if="lastPage" class="loadMore">{{judgeLoading}}</div>
    <div class="page-gap"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      filterTab: [
        { name: "销量", status: "descend" },
        { name: "最新", status: "" },
        { name: "价格", status: "" }
      ],
      show: false,
      searchWord: "",
      tagId: "",
      currentPage:1,
      lastPage:undefined,
      multiIndex: [0, 0],
      categoryList: [],
      subCategoryList: [],
      loading:false,
      filterProductList:[]
    };
  },
  onUnload() {
    this.categoryList = [];
    this.subCategoryList = [];
    this.show = false;
  },
  watch: {
    productLoading(val) {
      if (!val) {
        this.show = true;
      }
    }
  },
  computed: {
    ...mapState(["productLoading"]),
    currentCategory() {
      return this.categoryList[this.multiIndex[0]];
    },
    judgeLoading(){
      if(this.loading){
        return '加载中...'
      }
      console.log(this.lastPage)
      return this.currentPage === this.lastPage?'暂无更多内容':'下拉加载更多'
    },
    currentSubCategory() {
      return this.subCategoryList[this.multiIndex[1]];
    },
    categoryId() {
      return this.categoryList[this.multiIndex[0]]
        ? this.categoryList[this.multiIndex[0]].id
        : undefined;
    },
    subCategoryId() {
      return this.subCategoryList[this.multiIndex[1]]
        ? this.subCategoryList[this.multiIndex[1]].id
        : undefined;
    }
  },
  async onShow() {
    const category = await this.$request("fetchCategories", {});
    this.categoryList = category;
    const { subid, categoryid, tagid, keyword, sort } = this.$mp.query;
    if (subid) {
      const subcategory = await this.$request(
        "fetchSubCategoriesByCategoriesId",
        {
          data: {
            id: categoryid
          }
        }
      );
      this.subCategoryList = subcategory;
      this.$set(
        this.multiIndex,
        1,
        subcategory.findIndex(item => item.id == subid)
      );
    } else {
      this.subCategoryList = [];
    }
    if (sort) {
      this.filterTab = [
        { name: "销量", status: "" },
        { name: "最新", status: "descend" },
        { name: "价格", status: "" }
      ];
    }
    if (categoryid) {
      this.$set(
        this.multiIndex,
        0,
        category.findIndex(item => item.id == Number(categoryid))
      );
    }else{
      this.$set(
        this.multiIndex,
        0,
        999
      );
    }
    if (tagid) {
      this.tagId = tagid;
    }
    if (keyword) {
      this.searchWord = keyword;
    }
    this.filterProducts();
  },
  onReachBottom(){
    this.filterProducts(true)
  },
  methods: {
    goDetail(id) {
      uni.navigateTo({ url: `/pages/product?id=${id}` });
    },
    async handleColChange(e) {
      if (e.detail.column === 0) {
        const cateid = await this.categoryList[e.detail.value].id;
        this.getSubCategory(cateid);
      }
    },
    handleCateChange(e) {
      this.multiIndex = e.detail.value;
      this.filterProducts();
    },
    judgeSortImg(status) {
      if (status) {
        if (status === "ascend") {
          return "/static/ascend.png";
        } else if (status === "descend") {
          return "/static/descend.png";
        }
      } else {
        return "/static/sort.png";
      }
    },
    async getSubCategory(id) {
      if(id === 999){
        id = this.categoryList[0].id
      }
      const subcategory = await this.$request(
        "fetchSubCategoriesByCategoriesId",
        {
          data: {
            id
          }
        }
      );
      this.subCategoryList = subcategory;
    },
    changeSearch(searchWord) {
      this.searchWord = searchWord;
      this.filterProducts();
    },
    changeStatus(item) {
      this.filterTab.forEach(i => {
        if (i.name === item.name) {
          i.status = item.status === "descend" ? "ascend" : "descend";
        } else {
          i.status = "";
        }
      });
      this.filterProducts();
    },
    async filterProducts(loadingMore) {
      if(!loadingMore){
        this.currentPage = 1
      }else{
        if(this.currentPage >= this.lastPage){
          return
        }else{
          this.currentPage +=1
        }
      }
      const current = this.filterTab.find(item => {
        return item.status !== "";
      });
      let orderBy = "";
      const ascending = current.status === "ascend";
      switch (current.name) {
        case "销量":
          orderBy = ascending ? "销量低到高" : "销量高到低";
          break;
        case "最新":
          orderBy = ascending ? "旧到新" : "新到旧";
          break;
        case "价格":
          orderBy = ascending ? "价格低到高" : "价格高到低";
          break;
        default:
          break;
      }
      this.loading = true
      const productRes = await this.$request("fetchProductBySth", {
        data: {
            keyword: this.searchWord || "",
            orderBy,
            subCategoriesId: this.subCategoryId
              ? [this.categoryId, this.subCategoryId]
              : undefined,
            categoriesId: this.categoryId,
            tagId: this.tagId,
            page:this.currentPage,
          },
        loading: true,
      });
      this.loading = false
      if(productRes){
        const {data,last_page,current_page} = productRes;
        this.lastPage = last_page
        this.currentPage = current_page
        if(loadingMore){
          this.filterProductList = this.filterProductList.concat(data)
        }else{
          this.filterProductList = data
          console.log(this.filterProductList)
        }
      }
      
      // this.$store.dispatch("fetchProductList", {
      //   keyword: this.searchWord || "",
      //   orderBy,
      //   subCategoriesId: this.subCategoryId
      //     ? [this.categoryId, this.subCategoryId]
      //     : undefined,
      //   categoriesId: this.categoryId,
      //   tagId: this.tagId,
      //   page:this.currentPage,
      //   callback:(res)=>{
      //     const {last_page} = res;
      //     this.lastPage = last_page
      //   }
      // });
    }
  },
  
};
</script>

<style lang="scss">
.header {
  background: #fff;
  .search {
    padding: 20rpx;
    border-bottom: 2rpx solid #f3f3f3;
    display: flex;
    align-items: center;
    .cate-text {
      font-size: 24rpx;
      margin-right: 10rpx;
    }
  }
  .filter {
    display: flex;
    padding: 20rpx 0;
    vertical-align: middle;
    .item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      image {
        vertical-align: middle;
      }
    }
  }
}
.products {
  display: flex;
  flex-wrap: wrap;
  background: #f7f7f7;
  .product-item {
    width: 50%;
    box-sizing: border-box;
    padding: 20rpx 20rpx 0 20rpx;
    &:nth-child(2n-1) {
      padding-right: 0;
    }
  }
}
.loadMore{
  text-align:center;
  padding-top:120rpx;
  color:#ccc;
}
</style>