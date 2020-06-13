<template>
  <div class="bg">
    <div class="row-card">
      <div class="row">
        <div class="input">
          <div class="title">姓名</div>
          <input type="text" v-model="name" />
        </div>
      </div>
      <div class="row">
        <div class="input">
          <div class="title" style="display:flex;align-items:center;min-width: 160rpx;">
            电话
            <div @click="showAction" style="display:flex;align-items:center">
              <div style="margin:0 10rpx;">{{areaCode}}</div>
              <image src="/static/down.png" mode="widthFix" style="width:20rpx;margin-right:10rpx;" />
            </div>
          </div>
          <input type="text" v-model="phone" />
        </div>
        <div class="veriCode">
          <input
            :class="{'pass':veriPass,'fail':!veriPass}"
            type="number"
            v-model="veriCode"
            @input="verifyCode"
          />
          <div class="get" @click="getVeriCode">获取验证码</div>
        </div>
      </div>
      <div class="row">
        <div class="input">
          <div class="title">微信号</div>
          <input type="text" v-model="wechat" />
        </div>
      </div>
      <div class="row">
        <div class="input" style="width:90%;">
          <div class="title">收货地址</div>
          <textarea
            placeholder="为了计算运费，请输入后手动选择地址或者直接获取当前地址"
            type="text"
            style="width:90%"
            :auto-height="true"
            v-model="address"
            @blur="searchGeoLocation"
          />
        </div>
        <div @click="goAddr" class="getGeo">更换地址</div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="button" @click="changeUser">确认修改</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { formatPhoneNumber } from "@/util";
export default {
  data() {
    return {
      name: "",
      phone: "",
      wechat: "",
      address: "",
      subName: "",
      veriPass: false,
      veriCode: "",
      areaCode: "+61",
      veriMatch: "",
      addValid: true,
      fetchingAddr: false
    };
  },
  computed: {
    ...mapState(["userInfo"])
  },
  onShow() {
    const defaultAdd = (this.userInfo.deliveryDetail || []).find(item => {
      return item.ifDefault;
    });
    if (defaultAdd) {
      this.address = defaultAdd.address;
      this.subName = defaultAdd.subName;
      if (defaultAdd.phone) {
        this.phone = this.userInfo.phone.substr(3);
        this.areaCode = this.userInfo.phone.substr(0, 3);
      }
      this.wechat = defaultAdd.wechat;
      this.name = defaultAdd.name;
      this.veriPass = Boolean(defaultAdd.phone);
    }
  },
  watch: {
    phone(val) {
      this.veriPass = this.areaCode + val === this.userInfo.phone;
    },
    areaCode(val) {
      this.veriPass = val + this.phone === this.userInfo.phone;
    }
  },
  methods: {
    async searchGeoLocation(e) {
      const _this = this;
      const { value } = e.detail;
      if (!value) {
        this.subName = "";
        return;
      }
      _this.fetchingAddr = true;
      const geoRes = await this.$request("googleFindAddress", {
        loading: true,
        data: {
          input: value
        }
      });
      if (!geoRes || !geoRes.length) {
        uni.showToast({
          title: "获取地理位置失败",
          icon: "none"
        });
        _this.address = this.userInfo.address;
        _this.addValid = false;
        _this.fetchingAddr = false;
        return;
      }
      uni.showActionSheet({
        itemList: geoRes.map(item => item.address),
        success: function(res) {
          _this.address = geoRes[res.tapIndex].address;
          _this.subName = geoRes[res.tapIndex].subName;
          _this.addValid = true;
          _this.fetchingAddr = false;
        },
        fail: function(res) {
          _this.fetchingAddr = false;
        }
      });
    },
    goAddr() {
      uni.navigateTo({
        url: "/pages/address"
      });
    },
    showAction() {
      const _this = this;
      const options = ["+61", "+86"];
      uni.showActionSheet({
        itemList: options,
        success: function(res) {
          _this.areaCode = options[res.tapIndex];
        }
      });
    },
    verifyCode(e) {
      if (this.veriMatch) {
        this.veriPass = e.detail.value === this.veriMatch;
      }
    },
    getLocation() {
      const _this = this;
      _this.fetchingAddr = true;
      uni.getLocation({
        type: "wgs84",
        success: async function(res) {
          const geoRes = await _this.$request("googleFindAddressByLatlng", {
            loading: true,
            data: {
              latlng: `${res.latitude},${res.longitude}`
            }
          });
          if (!geoRes) {
            uni.showToast({
              title: "获取地理位置失败",
              icon: "none"
            });
            _this.address = this.userInfo.address;
            _this.addValid = false;
            _this.fetchingAddr = false;
          } else {
            _this.address = geoRes.address;
            _this.subName = geoRes.subName;
            _this.addValid = true;
            _this.fetchingAddr = false;
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取地理位置失败",
            icon: "none"
          });
          _this.address = this.userInfo.address;
          _this.addValid = false;
          _this.fetchingAddr = false;
        }
      });
    },
    async getVeriCode() {
      const veriRes = await this.$request("phoneSendVaildMessage", {
        loading: true,
        data: {
          phone: formatPhoneNumber(this.phone, this.areaCode)
        }
      });
      if (veriRes) {
        uni.showToast({
          title: "发送验证码成功"
        });
        this.veriMatch = String(veriRes);
      } else {
        uni.showToast({
          title: "获取验证码失败",
          icon: "none"
        });
      }
    },
    async changeUser() {
      let errMsg = "";
      if (!this.phone) {
        errMsg = "请输入电话";
      }
      if (!this.name) {
        errMsg = "请输入姓名";
      }
      if (!this.wechat) {
        errMsg = "请输入微信号";
      }
      if (!this.address) {
        errMsg = "请选择有效地址";
      }
      if (this.fetchingAddr) {
        errMsg = "正在获取地址中,请勿提交";
      }
      if (this.address) {
        if (!this.subName || !this.addValid) {
          errMsg = "请选择有效地址";
        }
      }
      if (this.phone !== this.userInfo.phone && !this.veriPass) {
        errMsg = "请输入有效的验证码";
      }
      if (errMsg) {
        uni.showToast({
          title: errMsg,
          icon: "none"
        });
        return;
      }

      const defaultAdd = (this.userInfo.deliveryDetail || []).find(item => {
        return item.ifDefault;
      });
      const newUser = await this.$request("updateUserDetailById", {
        loading: true,
        data: {
          id: this.userInfo.id,
          username: this.userInfo.username,
          imgUrl: this.userInfo.imgUrl,
          openId: this.userInfo.openId,
          name: this.name,
          phone: this.areaCode + this.phone,
          address: this.address,
          subName: this.subName,
          wechat: this.wechat,
          deliveryDetail: this.userInfo.deliveryDetail
        }
      });

      if (newUser) {
        uni.showToast({
          title: "修改成功"
        });
        this.$store.commit("updateUser", newUser);
      } else {
        uni.showToast({
          title: "修改用户信息失败",
          icon: "none"
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bg {
  padding: 20rpx;
  .button {
    padding: 20rpx;
    background: #ffcb34;
    padding: 20rpx;
    margin: 0 auto;
    border-radius: 20rpx;
    text-align: center;
    width: 200rpx;
  }
  .getGeo {
    width: 140rpx;
    padding: 0 20rpx;
    color: #1d90fc;
  }
  .veriCode {
    box-sizing: border-box;
    padding: 10rpx 20rpx;
    min-width: 320rpx;
    width: 320rpx;
    border-left: 2rpx solid #f0f0f0;
    display: flex;
    .pass {
      color: rgb(21, 201, 45);
    }
    .fail {
      color: red;
    }
    .get {
      min-width: 140rpx;
      color: #1d90fc;
    }
  }
}
</style>