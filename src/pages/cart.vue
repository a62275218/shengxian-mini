<template>
  <div class="bg">
    <div v-if="!cart.length" class="empty">购物车空空如也</div>
    <block v-for="(item,index) in cart" :key="item.product.id">
      <div class="white-card item" @click="toggleActive(index)">
        <div :class="[{'active button':item.active},{'button':!item.active}]" />
        <div class="center">
          <image :src="item.product.imgUrls[0]" style="width:200rpx;" mode="widthFix" />
          <div class="content">
            <div>{{item.product.title}}</div>
            <div class="control">
              <div class="price">${{item.product.price}}</div>
              <numberbox :min="1" :initialVal="item.num" :index="index" @change="changeNum" />
            </div>
          </div>
        </div>
      </div>
      <div class="gap"></div>
    </block>
    <div class="bottom-control white-card" v-if="cart.length">
      <div class="select-all" @click="toggleSelectAll">
        <div :class="[{'active button':selectAll},{'button':!selectAll}]"></div>
        <div>全选</div>
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
      selectAll: true
    };
  },
  computed: {
    ...mapState(["cart", "userInfo"]),
    totalPrice() {
      let total = 0;
      this.cart.forEach(item => {
        if (item.active) {
          total += item.product.price * item.num;
        }
      });
      return total;
    },
    totalLength() {
      let total = 0;
      this.cart.forEach(item => {
        if (item.active) {
          total += 1;
        }
      });
      return total;
    }
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
        active: !this.cart[index].active
      });
      this.$nextTick(() => {
        let activeAll = true;
        this.cart.forEach(item => {
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
        uni.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      const result = await this.$request("checkProductStorageBeforeMakeOrder", {
        loading: true,
        data: {
          products: this.cart
            .filter(item => item.active)
            .map(product => {
              return {
                id: product.product.id,
                buyNum: product.num
              };
            }),
          userId: this.userInfo.id
        }
      });
      const resultT = checkBill(result);
      if (resultT) {
        uni.navigateTo({
          url: "/pages/billconfirm"
        });
      }
    },
    changeNum(num, index) {
      this.$store.commit("changeCart", {
        index,
        num
      });
    },
    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      this.$store.commit("changeCart", {
        index: "all",
        active: !this.selectAll
      });
    }
  }
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
  .select-all {
    display: flex;
    align-items: center;
    padding: 0 30rpx;
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