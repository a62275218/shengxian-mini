<template>
  <div class="bg">
    <div class="middle">
      <icon type="success" size="46" />
      <div class="success-txt">支付成功</div>
      <div class="button" @click="backHome">返回主页</div>
    </div>
  </div>
</template>

<script>
export default {
  methods:{
    backHome(){
      uni.switchTab({
        url:'/pages/index'
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.middle{
  position:absolute;
  transform:translate(-50%,-50%);
  top:50%;
  left:50%;
  display:flex;
  flex-direction: column;
  align-items: center;
  .success-txt{
    padding:40rpx 0;
  }
  .button{
    background:#fcd81d;
    padding:20rpx 40rpx;
    border-radius:20rpx;
  }
}
</style>