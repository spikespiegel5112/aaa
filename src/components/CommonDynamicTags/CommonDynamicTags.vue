<template>
  <div class="common_dynamictag_wrapper" ref='periods'>
    <el-col :span='24'>
      <ul>
        <li v-for='(item, index) in innerTagsModel' :key='index'>
          <el-tag size="big" @close="handleClose" :closable='editable'>{{prefix}}{{item}}{{subfix}}</el-tag>
        </li>
      </ul>
      <div class="operation" v-if="editable">
        <el-input class="input_new_tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small"
          @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
        </el-input>
        <el-button v-else class="button-new-tag" size="small" @click="showInput" type='primary'>+</el-button>
      </div>

    </el-col>
  </div>

</template>

<script>
export default {
  name: "CommonUploadImage",
  props: {
    prefix: {
      type: String,
      required: false,
      default: ''
    },
    subfix: {
      type: String,
      required: false,
      default: ''
    },
    tagsModel: {
      type: Array | String,
      required: false,
      default() {
        return []
      }
    },
    activate: {
      type: Boolean,
      required: false,
      default: false
    },
    editable: {
      type: Boolean,
      required: false,
      default: false
    }


  },
  data() {
    return {
      uploadFlag: true,
      inputVisible: null,
      inputValue: '',
      innerTagsModel: [],
      innerActivate: null
    }
  },
  computed: {

  },
  watch: {

  },
  created() {
    this.innerTagsModel = typeof this.tagsModel === 'string' ? this.splitString(this.tagsModel) : this.tagsModel
    
    this.innerActivate = this.activate
  },
  async mounted() {
    setTimeout(() => {
      document.addEventListener('click', this.handleBlur)

    }, 100)
  },
  async beforeDestroy() {
    let result = this.innerTagsModel.join(',')
    this.$emit('update:tagsModel', result)

    document.removeEventListener('click', this.handleBlur)
  },
  methods: {
    splitPeriod(data) {
      const result = []
      if (data.indexOf(',') === '-1') {
        result.push(data)
      } else {
        result.push(...data.split(','))
      }
      return result
    },
    handleInputConfirm(event) {
      let inputValue = this.inputValue;

      if (inputValue) {
        this.innerTagsModel.push(inputValue);
        let result = this.innerTagsModel.join(',')
        this.$emit('update:tagsModel', result)
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    showInput() {
      setTimeout(() => {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      })

    },
    handleClose(tag) {
      this.innerTagsModel.splice(this.innerTagsModel.indexOf(tag), 1);
      let result = this.innerTagsModel.join(',')
      this.$emit('update:tagsModel', this.innerTagsModel.join(','))

    },
    splitString(data, symbol = ',') {
      const result = []
      if (data.indexOf(symbol) === '-1') {
        result.push(data)
      } else {
        result.push(...data.split(symbol))
      }
      return result
    },
    async handleBlur(e) {
      if (this.$refs.periods && this.$refs.periods.contains(e.target)) {
        this.innerActivate = true
        let result = this.innerTagsModel.join(',')
        this.$emit('update:tagsModel', result)
        this.$emit('update:activate', true)
      } else {
        if (typeof this.innerActivate === 'boolean' && this.innerActivate) {
          console.log('deactivated+++++')
          this.innerActivate = false
          let result = this.innerTagsModel.join(',')
        } else {
          console.log('deactivated2+++++')
          this.innerActivate = false
        }
        this.$emit('update:activate', false)

      }
    }
  }
}
</script>

<style lang='scss'>
.common_dynamictag_wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 0;

  ul {
    display: inline-block;
    min-height: 40px;

    // display: flex;
    // height: 100%;
    align-items: center;
    vertical-align: middle;

    li {
      display: inline-block;
      margin: 5px;
      vertical-align: middle;
    }
  }
  .operation {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
