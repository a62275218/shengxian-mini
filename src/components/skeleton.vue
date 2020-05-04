<template>
  <div>
    <div class="skeleton" v-if="loading">
      <div class="block" v-for="(item,index) in config" :key="index">
        <div class="avatar" v-if="item.avatar"></div>
        <div class="skeleton-content">
          <div class="text" v-for="(itm,idx) in item.row" :key="idx"></div>
        </div>
      </div>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template> 

<script>
export default {
  props: ["loading", "config"]
};
</script>

<style lang="scss" scoped>
@keyframes skeleton-ani {
  /* 骨架屏动画 */
  from {
    left: -100%;
  }
  to {
    left: 0;
  }
}

@mixin bg {
  content: "";
  width: 200%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  animation: skeleton-ani 2s ease-in-out infinite;
  background: linear-gradient(45deg, #eeeeee 33%, #dddddd 66%, #eeeeee 100%);
}
.skeleton {
  padding: 40rpx;
  background: #fff;
  .block {
    margin-bottom: 40rpx;
    display: flex;
    .avatar {
      position: relative;
      width: 60rpx;
      height: 60rpx;
      overflow: hidden;
      border-radius: 50%;
      margin-right: 20rpx;
      &::after {
        @include bg();
      }
    }
    .skeleton-content {
      width:100%;
      .text {
        position: relative;
        overflow: hidden;
        &:nth-child(1) {
          width: 40%;
        }
        &:nth-last-child(2) {
          width: 80%;
        }
        &:nth-last-child(1) {
          width: 70%;
        }
        height: 20rpx;
        margin-bottom: 20rpx;
        &::after {
          @include bg();
        }
      }
    }
  }
}
</style>