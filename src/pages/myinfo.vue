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
          <div class="title">电话</div>
          <input type="text" v-model="phone" />
        </div>
        <div class="veriCode">
          <input
            :class="{'pass':veriPass,'fail':!veriPass}"
            type="text"
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
        <div @click="getLocation" class="getGeo">
          获取地址
        </div>
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
      veriMatch: "",
      addValid: true,
      fetchingAddr: false
    };
  },
  computed: {
    ...mapState(["userInfo"])
  },
  mounted() {
    this.name = this.userInfo.name;
    this.phone = this.userInfo.phone;
    this.wechat = this.userInfo.wechat;
    this.address = this.userInfo.address;
    this.subName = this.userInfo.subName;
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
        loading:true,
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
          phone: formatPhoneNumber(this.phone)
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
      if (this.fetchingAddr) {
        uni.showToast({
          title: "正在获取地址中,请勿提交",
          icon: "none"
        });
        return;
      }
      if (this.address) {
        if (!this.subName || !this.addValid) {
          uni.showToast({
            title: "请选择有效地址",
            icon: "none"
          });
          return;
        }
      }
      if (this.phone !== this.userInfo.phone && !this.veriPass) {
        uni.showToast({
          title: "请输入有效的验证码",
          icon: "none"
        });
        return;
      }
      console.log(this.veriPass);
      const newUser = await this.$request("updateUserDetailById", {
        loading: true,
        data: {
          id: this.userInfo.id,
          username: this.userInfo.username,
          openId: this.userInfo.openId,
          name: this.name,
          phone: this.phone,
          address: this.address,
          subName: this.subName,
          wechat: this.wechat
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
  .getGeo{
    width:140rpx;
    padding:0 20rpx;
    color: #1d90fc;
  }
  .veriCode {
    box-sizing: border-box;
    padding: 10rpx 20rpx;
    min-width: 330rpx;
    width: 330rpx;
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