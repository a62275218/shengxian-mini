<template>
  <div class="bg">
    <div v-if="!cart.length" class="empty">
      <image
        src="/static/cart-empty.png"
        style="display:block;width:200rpx;margin:0 auto;"
        mode="widthFix"
      />
      <div>购物车空空如也</div>
    </div>
    <block v-for="(item,index) in cart" :key="index">
      <div class="white-card item">
        <div
          :class="[{'active button':item.active},{'button':!item.active}]"
          @click="toggleActive(index)"
        />
        <div class="center">
          <div style="width:200rpx;height:200rpx;">
            <imagep :src="item.product.imgUrls[0]" />
          </div>

          <div class="content">
            <div>{{item.product.title}}</div>
            <div class="control">
              <div class="price">${{item.product.price}}</div>
              <div style="width:200rpx">
                <numberbox
                  :key="index"
                  :min="1"
                  :max="item.product.storageNum"
                  :initialVal="item.num"
                  :unique="item"
                  @change="changeNum"
                  @triggerMin="triggerMin"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="gap"></div>
    </block>
    <div class="page-gap"></div>
    <div class="bottom-control white-card" v-if="cart.length">
      <div class="select-all">
        <div @click="toggleSelectAll" :class="[{'active button':selectAll},{'button':!selectAll}]"></div>
        <div @click="toggleSelectAll">全选</div>
        <div class="del" @click="handleDel">删除</div>
      </div>
      <div class="action">
        <div class="price">${{totalPrice}}</div>
        <div class="confirm" @click="confirmBill">结算({{totalLength}})</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { checkBill } from "@/util";
export default {
  data() {
    return {
      selectAll: true,
    };
  },
  onShow(){
    this.$store.dispatch('fetchCart');
  },
  computed: {
    ...mapState(["cart", "userInfo"]),
    totalPrice() {
      let total = 0;
      this.cart.forEach((item) => {
        if (item.active) {
          total += item.product.price * item.num;
        }
      });
      return total.toFixed(2);
    },
    totalLength() {
      let total = 0;
      this.cart.forEach((item) => {
        if (item.active) {
          total += 1;
        }
      });
      return total;
    },
  },
  // watch: {
  //   selectAll: {
  //     handler(val) {
  //       this.$store.commit("changeCart", { index: "all", active: val });
  //     },
  //     immediate: true
  //   }
  // },
  methods: {
    toggleActive(index) {
      this.$store.commit("changeCart", {
        index,
        active: !this.cart[index].active,
      });
      this.$nextTick(() => {
        let activeAll = true;
        this.cart.forEach((item) => {
          if (!item.active) {
            activeAll = false;
          }
        });
        this.selectAll = activeAll;
      });
    },
    async confirmBill() {
      if (!this.totalLength) {
        return;
      }
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
      this.$store.dispatch('fetchCart');
      const result = await this.$request("checkProductStorageBeforeMakeOrder", {
        loading: true,
        data: {
          products: this.cart
            .filter((item) => item.active)
            .map((product) => {
              return {
                id: product.product.id,
                buyNum: product.num,
              };
            }),
          userId: this.userInfo.id,
        },
      });
      const resultT = checkBill(result);
      if (resultT) {
        uni.navigateTo({
          url: "/pages/billconfirm",
        });
      }
    },
    handleDel() {
      const _this = this;
      uni.showModal({
        title: "提示", //提示的标题,
        content: "确认要删除选中产品吗?", //提示的内容,
        success: (res) => {
          if (res.confirm) {
            _this.$store.commit(
              "batchRemoveFromCart",
              _this.cart
                .filter((item) => {
                  return item.active;
                })
                .map((i) => i.product.id)
            );
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    },
    changeNum(num, item) {
      const {
        product: { id },
      } = item;
      const index = this.cart.findIndex((i) => {
        return i.product.id === id;
      });
      this.$store.commit("changeCart", {
        index,
        num: Number(num),
      });
    },
    triggerMin(item) {
      const {
        product: { id },
        num,
      } = item;
      if (num == 1) {
        this.$store.commit("batchRemoveFromCart", [id]);
      }
    },
    toggleSelectAll() {
      const slAll = !this.selectAll;
      this.selectAll = slAll;
      this.$store.commit("changeCart", {
        index: "all",
        active: slAll,
      });
    },
  },
};
</script>

<style lang="scss">
.item {
  display: flex;
  padding: 0 20rpx;
  align-items: center;
  .button {
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    border: 2rpx solid #bdbdbd;
    margin-right: 20rpx;
  }
  .active {
    border: 2rpx solid #ffcb34;
    position: relative;
    &:after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 50%;
      height: 50%;
      border-radius: 50%;
      background: #ffcb34;
    }
  }
  .center {
    flex: 1;
    display: flex;
    height: 250rpx;
    align-items: center;
    padding: 40rpx 0;
    box-sizing: border-box;
    .content {
      padding: 0 20rpx;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      .control {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .price {
          color: rgba(255, 159, 36, 1);
        }
      }
    }
  }
}
.bottom-control {
  display: flex;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  justify-content: space-between;
  z-index: 101;
  .select-all {
    display: flex;
    align-items: center;
    padding: 0 30rpx;
  }
  .del {
    color: $uni-color-error;
    padding-left: 40rpx;
  }
  .button {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #bdbdbd;
    margin-right: 20rpx;
  }
  .action {
    display: flex;
    align-items: center;
    .price {
      color: #ff9f24;
      padding: 30rpx;
    }
    .confirm {
      background: #ffcb34;
      padding: 30rpx 60rpx;
    }
  }
  .active {
    border: 2rpx solid #ffcb34;
    position: relative;
    &:after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 50%;
      height: 50%;
      border-radius: 50%;
      background: #ffcb34;
    }
  }
}
</style>