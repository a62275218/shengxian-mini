import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import { request, getIn } from "@/util";
import md5 from "md5";

const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: false,
    productList: [],
    filterProductList: [],
    cart: [],
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
          icon: "none"
        });
        return
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
  },
  mutations: {
    retriveUser: (state) => {
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        state.userInfo = userInfo;
      }
    },
    retriveCart: (state) => {
      const cart = uni.getStorageSync("cart") || [];
      state.cart = cart;
    },
    addCart: (state, payload) => {
      const { product, num } = payload;
      console.log(state);
      const existCart = state.cart.find((item) => {
        return item.product.id === product.id;
      });
      if (!existCart) {
        state.cart.push({ product, num });
      } else {
        existCart.num += num;
      }
      uni.showToast({
        title: "添加成功",
      });
      uni.setStorageSync("cart", state.cart);
    },
    clearCart: (state) => {
      state.cart = [];
      uni.removeStorageSync("cart");
    },
    changeCart: (state, payload) => {
      const { index, active, num } = payload;
      const cart = state.cart;
      if(index === 'all'){
        cart.forEach(item=>{
          item.active = active
        })
        state.cart = cart;
        return
      }
      if (typeof active !== "undefined") {
        cart[index].active = active;
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
