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
    serviceList: [],
    pendingBill: false,
    productLoading: false,
    categoryList: [],
    baseUrl: "https://freshgo.top/api/public/api/v1/",
    gotUrl: false,
  },
  actions: {
    fetchProductList: async ({ state, commit }, payload) => {
      const {
        keyword,
        orderBy,
        subCategoriesId,
        categoriesId,
        callback,
      } = payload;
      state.productLoading = true;
      const productRes = await request("fetchProductBySth", {
        data: {
          ...payload,
        },
        loading: true,
      });
      const filterProductList = getIn(productRes, "data");
      state.productLoading = false;
      if (filterProductList) {
        state.filterProductList = filterProductList;
        if (callback) {
          callback(productRes);
        }
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
    fetchServiceList: async ({ state }) => {
      const list = await request("fetchSupport", {
        data: {},
      });
      const serviceList = getIn(list);
      if (list) {
        state.serviceList = serviceList;
      }
    },
    getBaseUrl: async ({ state }) => {
      return new Promise((resolve) => {
        uni.request({
          url: "https://freshgo.top/api/public/api/v1/apiControl",
          method: "POST",
          success: (res) => {
            // state.baseUrl = (res as any).data.data
            //   ? "https://freshgo123.com/api/public/api/v1/"
            //   : "https://freshgo.top/api/public/api/v1/";
            state.baseUrl = "https://freshgo123.com/api/public/api/v1/";
          },
          complete: (err) => {
            state.gotUrl = true;
            resolve();
          },
        });
      });
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
                data: { username: nickName, openId: openid, imgUrl: avatarUrl },
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
      const { product, num, toast = true } = payload;
      const existCart = state.cart.find((item) => {
        return item.product.id === product.id;
      });
      if (!existCart) {
        state.cart.push({ product, num, active: true });
      } else {
        existCart.num += num;
      }
      if (toast) {
        uni.showToast({
          title: "添加成功",
        });
      }
      uni.setStorageSync("cart", state.cart);
    },
    minusCart: (state, payload) => {
      const { product, num } = payload;
      const existCart = state.cart.find((item) => {
        return item.product.id === product.id;
      });
      if (!existCart) {
        return;
      } else {
        existCart.num -= num;
        if (existCart.num < 1) {
          let index: number;
          state.cart.forEach((item, idx) => {
            if (item.product.id === product.id) {
              index = idx;
            }
          });
          if (typeof index !== "undefined") {
            state.cart.splice(index, 1);
          }
        }
      }
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
      const cart = JSON.parse(JSON.stringify(state.cart));
      if (index === "all") {
        cart.forEach((item) => {
          item.active = active;
        });
        state.cart = cart;
        return;
      }
      if (typeof active !== "undefined") {
        cart[index].active = active;
      }
      if (typeof num !== "undefined") {
        if (num == 0) {
          console.log("orighin", cart);
          state.cart.splice(index, 1);
          uni.setStorageSync("cart", state.cart);
          return;
        } else {
          cart[index].num = num;
        }
      }
      console.log("cart", cart);
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
        const exist = idList.find((id) => {
          return Number(id) == Number(item.product.id);
        });
        return !exist;
      });
      state.cart = newCart;
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
