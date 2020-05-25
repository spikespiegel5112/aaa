<template>
  <div ref="tableHeader" class="common_tableheader_container" :class="{absolute:absolute}">
    <div class="title">
      <slot name='title'></slot>
    </div>
    <div class="form_wrapper">
      <slot name='formWrapper'></slot>
    </div>
    <div class="operation">
      <slot name='operation'></slot>
    </div>

  </div>
</template>

<script>
export default {
  name: 'TableHeader',
  props: {
    absolute: {
      type: Boolean,
      default: false,
      require: false
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {

  },
  beforeDestroy() {

  },
  methods: {

  }
}

</script>
<style lang="scss" scoped>
</style>
