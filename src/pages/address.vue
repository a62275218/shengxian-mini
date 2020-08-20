<template>
  <div class="bg">
    <custommodal :visible="edit" @close="unsave">
      <div class="white-card row-card modal">
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
                <image
                  src="/static/down.png"
                  mode="widthFix"
                  style="width:20rpx;margin-right:10rpx;"
                />
              </div>
            </div>
            <input style="font-size:24rpx;" placeholder="手机号码" type="text" v-model="phone" />
          </div>
          <!-- <div class="veriCode">
            <input
              :class="{'pass':veriPass,'fail':!veriPass}"
              type="number"
              v-model="veriCode"
              @input="verifyCode"
              placeholder="验证码"
            />
            <div class="get" @click="getVeriCode">获取验证码</div>
          </div>-->
        </div>
        <div class="row">
          <div class="input">
            <div class="title">微信号</div>
            <input type="text" v-model="wechat" />
          </div>
        </div>
        <div class="row" style="position:relative;">
          <div class="input" style="width:90%;">
            <div class="title">收货地址</div>
            <textarea
              type="text"
              style="width:97%"
              :auto-height="true"
              placeholder="不要填门牌号"
              v-model="address"
              @input="debounceSearchGeoLocation"
            />
          </div>
          <div @click="getLocation" class="getGeo">获取地址</div>
          <div v-if="pendingAddress.length > 0" class="address-list">
            <div v-for="item in pendingAddress" :key="item.address" @click="selectAddr(item)">
              <span>{{item.address}}</span>
            </div>
            <div class="button" @click="cancelAddr">取消</div>
          </div>
        </div>
        <div class="bott">
          <div class="btnb cancel" @click="()=>this.edit = false">取消</div>
          <div class="btnb save" @click="save">保存</div>
        </div>
      </div>
    </custommodal>
    <div class="gap"></div>
    <div class="white-card address" v-for="(detail,index) in deliveryDetail" :key="index">
      <div class="content">
        <div>姓名: {{detail.name}}</div>
        <div>电话: {{detail.phone}}</div>
        <div>微信: {{detail.wechat || ''}}</div>
        <div>地址: {{detail.address}}</div>
      </div>
      <div class="bot">
        <div v-if="!confirm" :class="[{'active left':detail.ifDefault},{'left':!detail.ifDefault}]">
          <div class="button" @click="setDefault(index)" />
          <div>{{detail.ifDefault?"已设为默认":"设为默认"}}</div>
        </div>
        <div v-else class="left">
          <div class="btn" @click="confirmAdd(index)">使用该收货信息</div>
        </div>
        <div class="right">
          <div class="del" @click="deleteAdd(index)">删除</div>
          <div class="edit" @click="editDetail(detail,index)">编辑</div>
        </div>
      </div>
    </div>
    <div class="page-gap"></div>
    <div class="bottom">
      <div class="button" @click="addNew">+新增收货地址</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { formatPhoneNumber, debounce } from "@/util";
export default {
  computed: {
    ...mapState(["userInfo"]),
  },
  data() {
    return {
      deliveryDetail: [],
      pendingAddress: [],
      edit: false,
      name: "",
      veriPass: false,
      veriCode: "",
      areaCode: "+61",
      phone: "",
      address: "",
      subName: "",
      wechat: "",
      addValid: false,
      editing: false,
      confirm: false,
    };
  },
  onShow() {
    const { type } = this.$mp.query;
    if (type === "confirm") {
      this.confirm = true;
    }
  },
  mounted() {
    if (this.userInfo) {
      this.deliveryDetail = this.userInfo.deliveryDetail || [];
    }
    this.debounceSearchGeoLocation = debounce(this.searchGeoLocation, 200);
  },
  watch: {
    phone(val) {
      if (this.editing || this.editing === 0) {
        this.veriPass =
          this.areaCode + val === this.deliveryDetail[this.editing].phone;
      }
    },
    areaCode(val) {
      if (this.editing || this.editing === 0) {
        this.veriPass =
          val + this.phone === this.deliveryDetail[this.editing].phone;
      }
    },
  },
  onHide() {
    this.setUserAddress();
  },
  onUnload() {
    this.setUserAddress();
  },
  methods: {
    setDefault(index) {
      this.deliveryDetail.forEach(
        (item, idx) => (item.ifDefault = index === idx)
      );
    },
    async setUserAddress() {
      console.log("set");
      const newUser = await this.$request("updateUserDetailById", {
        loading: true,
        data: {
          id: this.userInfo.id,
          deliveryDetail: this.deliveryDetail,
        },
      });
      if (newUser) {
        this.$store.commit("updateUser", newUser);
      }
    },
    disableGeo(e) {
      this.subName = null;
    },
    editDetail(detail, index) {
      const { name, phone, wechat, address, subName } = detail;
      this.editing = index;
      this.$nextTick(() => {
        this.phone = phone.substr(3);
        this.areaCode = phone.substr(0, 3);
      });
      this.addValid = true;
      this.name = name;
      this.wechat = wechat;
      this.address = address;
      this.subName = subName;
      this.edit = true;
    },
    deleteAdd(index) {
      uni.showModal({
        title: "提示", //提示的标题,
        content: "确定要删除该地址?", //提示的内容,
        success: async (res) => {
          if (res.confirm) {
            this.deliveryDetail.splice(index, 1);
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    },
    confirmAdd(index) {
      const { type } = this.$mp.query;
      if (type === "confirm") {
        uni.navigateTo({
          url: `/pages/billconfirm?deliveryDetail=${JSON.stringify(
            this.deliveryDetail[index]
          )}`,
        });
      }
    },
    formatPhoneNumber,
    async save() {
      let errMsg = "";
      if (!this.phone) {
        errMsg = "请输入电话";
      }
      if (!this.name) {
        errMsg = "请输入姓名";
      }
      if (!this.address) {
        errMsg = "请选择有效地址";
      }
      if (this.address) {
        if (!this.subName || !this.addValid) {
          errMsg = "请选择有效地址";
        }
      }
      // if (this.phone !== this.userInfo.phone && !this.veriPass) {
      //   errMsg = "请输入有效的验证码";
      // }
      if (errMsg) {
        uni.showToast({
          title: errMsg,
          icon: "none",
        });
        return;
      }
      if (!this.editing && this.editing !== 0) {
        this.deliveryDetail.push({
          ifDefault: false,
          name: this.name,
          address: this.address,
          subName: this.subName,
          wechat: this.wechat || "",
          phone: this.areaCode + this.phone,
        });
      } else {
        const detail = this.deliveryDetail[this.editing];
        detail.name = this.name;
        detail.address = this.address;
        detail.subName = this.subName;
        detail.wechat = this.wechat || "";
        detail.phone = this.areaCode + this.phone;
      }
      this.edit = false;
    },
    async searchGeoLocation(e) {
      console.log("debounced");
      const { value } = e.detail;
      this.subName = "";
      if (!value) {
        return;
      }
      const geoRes = await this.$request("googleFindAddress", {
        data: {
          input: value,
        },
      });
      if (!geoRes) {
        uni.showToast({
          title: "获取地理位置失败",
          icon: "none",
        });
        return;
      }
      this.pendingAddress = geoRes;
      console.log(geoRes);
    },
    cancelAddr() {
      this.address = "";
      this.subName = "";
      this.pendingAddress = [];
    },
    selectAddr(selection) {
      const { address, subName } = selection;
      this.address = address;
      this.subName = subName;
      this.addValid = true;
      this.fetchingAddr = false;
      this.pendingAddress = [];
    },
    // uni.showActionSheet({
    //   itemList: geoRes.map((item) => item.address),
    //   success: function (res) {
    //     _this.address = geoRes[res.tapIndex].address;
    //     _this.subName = geoRes[res.tapIndex].subName;
    //     _this.addValid = true;
    //     _this.fetchingAddr = false;
    //   },
    //   fail: function (res) {
    //     _this.fetchingAddr = false;
    //   },
    // });
    unsave() {
      this.edit = false;
      this.phone = "";
      this.name = "";
      this.veriCode = "";
      this.areaCode = "+61";
      this.veriPass = false;
      this.editing = false;
    },
    showAction() {
      const _this = this;
      const options = ["+61", "+86"];
      uni.showActionSheet({
        itemList: options,
        success: function (res) {
          _this.areaCode = options[res.tapIndex];
        },
      });
    },
    addNew() {
      this.edit = true;
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
        success: async function (res) {
          const geoRes = await _this.$request("googleFindAddressByLatlng", {
            loading: true,
            data: {
              latlng: `${res.latitude},${res.longitude}`,
            },
          });
          if (!geoRes) {
            uni.showToast({
              title: "获取地理位置失败",
              icon: "none",
            });
            _this.address = this.userInfo.address;
            _this.addValid = false;
          } else {
            _this.address = geoRes.address;
            _this.subName = geoRes.subName;
            _this.addValid = true;
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取地理位置失败",
            icon: "none",
          });
          _this.address = this.userInfo.address;
          _this.addValid = false;
          _this.fetchingAddr = false;
        },
      });
    },
    async getVeriCode() {
      const veriRes = await this.$request("phoneSendVaildMessage", {
        loading: true,
        data: {
          phone: formatPhoneNumber(this.phone, this.areaCode),
        },
      });
      if (veriRes) {
        uni.showToast({
          title: "发送验证码成功",
        });
        this.veriMatch = String(veriRes);
      } else {
        uni.showToast({
          title: "获取验证码失败",
          icon: "none",
        });
      }
    },
    verifyCode(e) {
      if (this.veriMatch) {
        this.veriPass = e.detail.value === this.veriMatch;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  padding: 0;
  margin-bottom: 480rpx;
  .row {
    padding: 30rpx 0 30rpx 24rpx;
  }
}
.address {
  width: 90%;
  margin: 0 auto 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  .content {
    padding: 20rpx;
    line-height: 46rpx;
  }
  .bot {
    padding: 20rpx;
    border-top: 2rpx solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    .left {
      color: #bdbdbd;
      display: flex;
      align-items: center;
      .btn {
        background: #fcd81d;
        color: black;
        padding: 10rpx 30rpx;
        border-radius: 50px;
      }
      .button {
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
        border: 2rpx solid #bdbdbd;
        margin-right: 20rpx;
      }
    }
    .right {
      display: flex;
      align-items: center;
      .del {
        color: #df2d2d;
      }
      .edit {
        color: #9c9c9c;
        margin-left: 30rpx;
      }
    }

    .active {
      color: #ffcb34;
      .button {
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
  }
}

.bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20rpx 0;
  width: 100%;
  .button {
    margin: 0 auto;
    width: 90%;
    background: #fcd81d;
    border-radius: 100rpx;
    font-size: 30rpx;
    text-align: center;
    padding: 20rpx;
    box-sizing: border-box;
  }
}

.veriCode {
  box-sizing: border-box;
  padding: 10rpx 20rpx;
  min-width: 260rpx;
  width: 260rpx;
  border-left: 2rpx solid #f0f0f0;
  display: flex;
  font-size: 24rpx;
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
.getGeo {
  width: 140rpx;
  padding: 0 20rpx;
  color: #1d90fc;
  font-size: 24rpx;
}

.address-list {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border-radius: 20rpx;
  font-size: 28rpx;
  div {
    padding: 6rpx 20rpx;
  }
  .button {
    margin: 10rpx auto;
    width: 200rpx;
    background: #fcd81d;
    border-radius: 100rpx;
    font-size: 30rpx;
    text-align: center;
    padding: 4rpx;
    box-sizing: border-box;
  }
}

.bott {
  padding: 20rpx 0;
  display: flex;
  justify-content: space-around;
  .btnb {
    padding: 20rpx 90rpx;
    border-radius: 100rpx;
  }
  .cancel {
    color: #777777;
    background: #ededed;
  }
  .save {
    background: #fcd81d;
  }
}
</style>