<template>
  <div id="container" class="container" :style="customStyle">
    <image
      :src="src"
      :mode="customMode || mode"
      :style="[innerStyle]"
      @load="handleLoad"
    />
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      widthMode: true
    };
  },
  props: ["src", "customStyle", "relativePos"],
  computed: {
    innerStyle() {
      return this.widthMode ? { width: "100%" } : { height: "100%" };
    },
    mode() {
      return this.widthMode ? "widthFix" : "heightFix";
    }
  },
  methods: {
    handleLoad(e) {
      const height = e.detail.height;
      const width = e.detail.width;
      setTimeout(() => {
        uni
          .createSelectorQuery()
          .in(this)
          .select("#container")
          .boundingClientRect(data => {
            const ratio = data.height / data.width;
            if (isNaN(ratio)) {
              this.widthMode = true;
              return;
            }
            this.widthMode = height / width > ratio;
          })
          .exec();
        this.$emit("load");
      }, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
image {
  will-change: transform;
}
</style>