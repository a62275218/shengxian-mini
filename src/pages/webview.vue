<template>
  <view>
    <web-view :src="url"/>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: "",
    };
  },
  onShow() {
    const { url } = this.$mp.query;
    this.url = url;
  },
};
</script>

<style>
</style>