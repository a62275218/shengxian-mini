import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import { request, getIn } from "@/util";
import md5 from "md5";

const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: uni.getStorageSync("userInfo") || false,
    productList: [],
    filterProductList: [],
    cart: [],
    historyList: [],
    pendingBill: false,
  },
  actions: {
    fetchProductList: async ({ state, commit }, payload) => {
      const { keyword, orderBy, subCategoriesId, categoriesId } = payload;
      const productRes = await request("fetchProductBySth", {
        data: {
          ...payload,
        },
        loading: true,
      });
      const filterProductList = getIn(productRes, "data");
      if (filterProductList) {
        state.filterProductList = filterProductList;
      }
    },
    fetchTotalList: async ({ state }) => {
      const totalProductRes = await request("fetchProductBySth", {
        data: {},
      });
      const productList = getIn(totalProductRes, "data");
      if (productList) {
        state.productList = productList;
      }
    },
    userLogin: async ({ state, commit }, payload) => {
      if (!payload) {
        uni.showToast({
          title: "获取用户信息失败",
          icon: "none",
        });
        return;
      }
      const { avatarUrl, nickName } = payload;
      uni.login({
        async success(res) {
          if (res.code) {
            //发起网络请求
            console.log(res.code);
            const opendID = await request("wxGetOpenId", {
              data: { code: res.code },
              errorMsg: "登录失败",
              loading: true,
            });
            const openid = getIn(opendID, "openid");
            if (openid) {
              const userInfo: any = await request("registerUser", {
                data: { username: nickName, openId: openid },
                errorMsg: "登录失败",
                loading: true,
              });
              if (userInfo) {
                userInfo.avatar = avatarUrl;
                commit("updateUser", userInfo);
              }
            }
          } else {
            uni.showToast({
              title: "登录失败",
              icon: "none",
            });
          }
        },
      });
    },
    fetchUserInfo: async ({ state, commit }, payload) => {
      const { id } = payload;
      const userInfo = await request("fetchUserByUserId", {
        data: { id },
      });
      if (userInfo) {
        commit("updateUser", userInfo);
      }
    },
    retriveUser: async ({ state, commit }, payload) => {
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        const newUser = await request("fetchUserDetailById", {
          data: {
            openId: userInfo.openId,
          },
        });
        commit("updateUser", newUser);
      }
    },
  },
  mutations: {
    retriveCart: (state) => {
      const cart = uni.getStorageSync("cart") || [];
      state.cart = cart;
    },
    addHistory: (state, payload) => {
      const product = state.historyList.find((item) => {
        return item.id === payload.id;
      });
      if (product) {
        return;
      }
      state.historyList.unshift({ ...payload, recordTime: Date.now() });
      uni.setStorageSync("historyList", state.historyList);
    },
    retriveHistory: (state) => {
      const historyList = uni.getStorageSync("historyList");
      if (historyList) {
        //展示14天的
        const filteredList = historyList.filter((item) => {
          return Date.now() - item.recordTime < 14 * 24 * 3600 * 1000;
        });
        state.historyList = filteredList;
        uni.setStorageSync("historyList", state.historyList);
      }
    },
    addCart: (state, payload) => {
      const { product, num,immediateToBuy } = payload;
      const existCart = state.cart.find((item) => {
        return item.product.id === product.id;
      });
      if (!existCart) {
        state.cart.push({ product, num, active: true });
      } else {
        existCart.num += num;
      }
      uni.showToast({
        title: "添加成功",
      });
      uni.setStorageSync("cart", state.cart);
    },
    changePendingBill: (state, payload) => {
      state.pendingBill = payload;
    },
    clearCart: (state) => {
      state.cart = [];
      uni.removeStorageSync("cart");
    },
    changeCart: (state, payload) => {
      const { index, active, num } = payload;
      const cart = state.cart;
      if (index === "all") {
        cart.forEach((item) => {
          item.active = active;
        });
        state.cart = cart;
        return;
      }
      if (typeof active !== "undefined") {
        cart[index].active = active;
        console.log(cart);
      }
      if (typeof num !== "undefined") {
        cart[index].num = num;
      }
      state.cart = cart;
      uni.setStorageSync("cart", state.cart);
    },
    removeFromCart: (state, product) => {
      let index: number;
      state.cart.forEach((item, idx) => {
        if (item.product.id === product.id) {
          index = idx;
        }
      });
      if (index) {
        state.cart.splice(index, 1);
        uni.setStorageSync("cart", state.cart);
      }
    },
    batchRemoveFromCart: (state, idList) => {
      const newCart = state.cart.filter((item) => {
        const exist = idList.find(id=>{
          Number(id) == item.id
        })
        return !exist;
      });
      state.cart = newCart
      uni.setStorageSync("cart", newCart);
    },
    updateUser: (state, newUser) => {
      state.userInfo = newUser;
      uni.setStorageSync("userInfo", newUser);
    },
    userLogout: (state) => {
      state.userInfo = false;
      uni.removeStorageSync("userInfo");
    },
  },
  plugins: debug ? [createLogger()] : [],
});

export default store;
