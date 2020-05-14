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
      </div>
      <div class="row">
        <div class="input">
          <div class="title">微信号</div>
          <input type="text" v-model="wechat" />
        </div>
      </div>
      <div class="row">
        <div class="input" style="width:90%;">
          <div class="title">地址</div>
          <textarea
            placeholder="为了计算运费，请输入后手动选择地址或者直接获取当前地址"
            type="text"
            style="width:90%;height:120rpx;"
            v-model="address"
            @blur="searchGeoLocation"
          />
        </div>
        <div @click="getLocation">
          <image src="/static/address.png" mode="widthFix" style="width:36rpx" />
        </div>
      </div>
    </div>
    <div class="gap"></div>
    <div class="button" @click="changeUser">提交</div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      name: "",
      phone: "",
      wechat: "",
      address: "",
      subName: ""
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
      const geoRes = await this.$request("googleFindAddress", {
        data: {
          input: value
        }
      });
      if (!geoRes || !geoRes.length) {
        uni.showToast({
          title: "获取地理位置失败",
          icon: "none"
        });
        return;
      }
      uni.showActionSheet({
        itemList: geoRes.map(item => item.address),
        success: function(res) {
          _this.address = geoRes[res.tapIndex].address;
          _this.subName = geoRes[res.tapIndex].subName;
          this.getLocation = geoRes[res.tapIndex];
        },
        fail: function(res) {
          console.log(res.errMsg);
        }
      });
    },
    getLocation() {
      const _this = this;
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
          } else {
            _this.address = geoRes.address;
            _this.subName = geoRes.subName;
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取地理位置失败",
            icon: "none"
          });
        }
      });
    },
    async changeUser() {
      if (this.address) {
        if (!this.subName) {
          uni.showToast({
            title: "请选择有效地址",
            icon:'none'
          });
          return;
        }
      }
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
}
</style>