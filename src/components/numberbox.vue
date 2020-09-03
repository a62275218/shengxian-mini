<template>
  <div class="box" @click.stop>
    <div class="side" @click="minus">-</div>
    <div class="center">
      <input :disabled="true" type="number" v-model="input" />
    </div>
    <div class="side" @click="add">+</div>
  </div>
</template>

<script>
export default {
  props: ["max", "min", "initialVal", "unique"],
  data() {
    return {
      input: 0,
    };
  },
  mounted() {
    this.input = this.initialVal !== undefined ? this.initialVal : 0;
  },
  watch: {
    initialVal: {
      immediate: true,
      handler(val) {
        console.log("init", val);
        if (val) {
          this.input = val;
        }
      },
    },
  },
  methods: {
    handleValChange(e) {
      let value = Number(e.detail.value.replace(/[^0-9]/gi, ""));
      if (this.max !== null || this.min !== null) {
        if (Number(value) > Number(this.max)) {
          value = Number(this.max);
        } else if (Number(value) < Number(this.min)) {
          value = this.min;
        }
      }
      this.input = Number(value);
      this.$emit("change", value, this.unique);
    },
    minus(e) {
      let result = this.input;
      console.log("this", result - 1);
      if (this.min !== null) {
        const next = result - 1
        result = next < this.min ? this.min : next;
        if (next < this.min) {
          this.$emit("triggerMin", this.unique);
          return;
        }
      } else {
        result -= 1;
      }
      this.input = result;
      this.$emit("change", result, this.unique);
    },
    add(e) {
      if (this.max !== null) {
        this.input = this.input + 1 > this.max ? this.max : this.input + 1;
      } else {
        this.input += 1;
      }
      this.$emit("change", this.input, this.unique);
    },
  },
};
</script>

<style lang="scss">
.box {
  width: 100%;
  height: 100%;
  display: flex;
  .center {
    flex: 1;
    text-align: center;
    box-sizing: border-box;
    padding: 10rpx 0;
    height: 100%;
  }
  .side {
    width: 60rpx;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    border: 2rpx solid #c5c5c5;
    color: #c5c5c5;
    border-radius: 10rpx;
    font-size: 30rpx;
  }
}
</style>