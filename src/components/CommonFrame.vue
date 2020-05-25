<template>
  <div class="common_frame_container">
    <div class="content">
      <div class="title">
        <label for="">
          {{title}}
        </label>
      </div>
      <div class="main">
        <slot name='content'></slot>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: "CommonFrame",
  props: {
    title: {
      type: String,
      required: false,
      default: ''
    },


  },
  data() {
    return {
    }
  },
  computed: {

  },
  watch: {

  },

  mounted() {

  },
  methods: {

  }

}
</script>

<style scoped lang='scss'>
.common_frame_container {
  padding: 20px;
  .content {
    width: 100%;
    height: 100%;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    .title {
      display: flex;
      font-size: 20px;
      &:before {
        content: "";
        display: inline-block;
        width: 100px;
        height: 1px;
        background-color: #ccc;
        // vertical-align: middle;
      }
      &:after {
        content: "";
        display: inline-block;
        // width: 100px;
        flex: 1;
        height: 1px;
        background-color: #ccc;
        // vertical-align: middle;
      }
      label {
        display: inline-block;
        padding: 0 20px;
        position: relative;
        bottom: 10px;
        // vertical-align: middle;
      }
    }
  }
}
</style>
