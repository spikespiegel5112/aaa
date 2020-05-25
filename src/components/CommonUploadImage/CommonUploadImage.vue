<template>
  <div class="common_uploadimage_wrapper">
    <!-- <div class="common_imguploadpreview_wrapper">
      <div v-if="innerFileList.length===0">
        暂无{{fileType==='image'?'图片':'文件'}}
      </div>
      <a v-if="innerFileList.length!==0" class="close">
        <span class="iconfont icon-crosswide"></span>
      </a>
      <ul v-if="innerFileList.length>0" class="image_item">
        <li v-for="(item, index) in innerFileList" :key='item.id'>
          <div class="preview">
            <img v-if="checkFileType(item.name||item.url)==='image'" :src="checkPrefix(item.url)" class="avatar" />
            <div v-else-if="checkFileType(item.name)==='word'">
              <img src="./filetype/doc.png" />
            </div>
            <div v-else-if="checkFileType(item.name)==='excel'">
              <img src="./filetype/xls.png" />
            </div>
            <div v-else-if="checkFileType(item.name)==='pdf'">
              <img src="./filetype/pdf.png" />
            </div>
            <div v-else-if="checkFileType(item.name)==='file'">
              <img src="./filetype/file.png" />
            </div>
          </div>

          <ul class="operator">
            <li :class="{disabled:disabled===true}">
              <a class="el-icon-delete" @click="deleteFile(index)"></a>
            </li>
          </ul>
        </li>

      </ul>
    </div> -->
    <!-- {{innerFileList}} -->
    <el-upload ref="uploadAvatar" :action="action" :limit='limit' :auto-upload="true" :show-file-list='showFileList'
      :before-upload="handleBeforeUpload" :on-preview="handlePictureCardPreview" :on-change="handleChange"
      :on-remove="handleRemove" :on-progress="handleProgress" :on-success="uploadSuccess" :on-error="handleError"
      :on-exceed="uploadAvatarExceeded" :file-list="innerFileList" :data="params" :disabled="disabled"
      :list-type="isPictureCard" :multiple='multiple' :class="{'reached':reached}">
      <i class="el-icon-plus"></i>
      <!-- <div slot="file" slot-scope="{file}">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
            <i class="el-icon-zoom-in"></i>

          </span>
          <span class="el-upload-list__item-preview" @click="handleRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div> -->
      <!-- <el-button size="small" type="primary" :disabled="disabled">点击上传</el-button> -->
      <div v-if="fileType!==''" slot="tip" class="el-upload__tip">
        只能上传{{fileTypeDictionary.filter(item => item.name === this.fileType)[0].suffixList.join('、')}}文件，且不超过10MB
        <!-- {{reached}} -->
        <!-- {{limit}} -->
      </div>
    </el-upload>
    <el-dialog title="预览" class="preview" :visible.sync="dialogVisible" :modal='false'>
      <div class="content">
        <img width="100%" :src="dialogImageUrl" alt="">

      </div>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: "CommonUploadImage",
  props: {
    params: {
      type: Object,
      required: false,
      default: function () {
        return {

        }
      }
    },
    action: {
      type: String,
      required: true,
      default: ''
    },
    listType: {
      type: String,
      required: false,
      default: 'text'
    },
    limit: {
      type: Number,
      required: false,
      default: 1
    },
    imageUrlSuffix: {
      type: String,
      required: false,
      default: '-style_100x100'
    },
    previewUrl: {
      type: String,
      required: false,
      default: ''
    },
    newFile: {
      type: String,
      required: false,
      default: ''
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    returnUrlList: {
      type: Array | String | Object,
      required: false,
      default: []
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    fileType: {
      type: String,
      required: false,
      default: ''
    },
    fileSize: {
      type: Number,
      required: false,
      default: 10
    },
    pictureCard: {
      type: Boolean,
      required: false,
      default: true
    },
    multiple: {
      type: Boolean,
      required: false,
      default: true
    },
    // showFileList: {
    //   type: Boolean,
    //   required: false,
    //   default: false
    // }
  },
  data() {
    return {
      portraitParams: {

      },
      showFileList: true,
      fileList: [],
      innerFileType: '',
      innerFileList: [],
      fileTypeDictionary: [{
        name: 'image',
        suffixList: ['jpg', 'jpeg', 'png']
      }, {
        name: 'excel',
        suffixList: ['csv', 'xls', 'xlsx']
      }, {
        name: 'word',
        suffixList: ['doc']
      }, {
        name: 'pdf',
        suffixList: ['pdf']
      }],
      innerUrlList: [],
      usingResponseFlag: false,
      uploadFlag: true,
      dialogVisible: false,
      dialogImageUrl: '',
    }
  },
  computed: {
    isPictureCard() {
      return this.pictureCard ? 'picture-card' : ''
    },
    reached() {
      return this.innerFileList.length >= this.limit
    }
    // innerFileList: {
    //   get() {
    //     return this.fileList.map((item, index) => {
    //       return {
    //         name: index,
    //         url: item + this.imageUrlSuffix
    //       }
    //     });
    //   },
    //   set(val) {
    //     alert('dsdsds')
    //     this.$emit("update:fileList", val);
    //   }
    // },
  },
  watch: {
    fileList(value) {
      // alert('fileList')
    },
    newFile(value) {
    },
    returnUrlList(value) {
      console.warn('watch returnUrlList1++++++', value)
      this.usingResponseFlag = true;

      let rawUrlList = [];

      if (!value || value.length === this.innerFileList.length) {
        return
      }


      if (value instanceof Array && value.length > 0) {
        rawUrlList = value;
      } else {
        if (!!value && value !== '' && value !== {}) {
          rawUrlList = [value];
        }
      }
      this.innerFileList = rawUrlList;
      console.log('this.rawUrlList++++++', rawUrlList)
      console.log('this.innerFileList++++++', this.innerFileList)
      if (rawUrlList.length > 0) {

        this.updateFile(rawUrlList)

      }

    },
    innerFileList(value) {
      console.log('innerFileList++++++', value)
      this.$emit("update:fileList", value);
    }
  },

  mounted() {
    this.innerFileList = [];
    console.log('mounted', this.returnUrlList)
    // console.log(this.returnUrlList instanceof Array)
    let rawUrlList = [];
    if (this.returnUrlList instanceof Array) {


      rawUrlList = this.returnUrlList;
    } else {
      console.log('aasdasdsadsa')
      if (this.returnUrlList !== null && this.returnUrlList !== '' && this.returnUrlList !== {} && this.returnUrlList.length > 0) {


        rawUrlList = [this.returnUrlList];
      }
    }
    console.log('rawUrlList', rawUrlList)
    if (rawUrlList.length > 0) {


      this.updateFile(rawUrlList);
    }
  },
  methods: {
    updateFile(value) {
      console.log('updateFile++++++', value)
      let valueArr = [];

      // value.forEach(item => {
      //   if (typeof item === 'string' && item !== '' && item !== null && this.checkFileType(item) === 'image') {
      //     valueArr.push(item)
      //     //
      //   } else if (typeof item === 'string' && item !== '' && item !== null && this.checkFileType(item) !== 'image') {
      //     valueArr.push(item)
      //   }
      // });

      // this.innerFileList = [];
      // console.log(value.length)
      if (!!value && value.length > 0 && value !== '') {

        value.forEach((item, index) => {
          this.$set(this.innerFileList, index, {
            id: item.id,
            name: item.name,
            url: this.checkPrefix(item.name),
            type: this.fileTypeDictionary.filter(item2 => item2 === this.checkFileType(item.name)).name
          })
        });
      }


      this.$emit('update:return-file-list', this.innerFileList);
      this.updateUrlList();
      // console.log(this.innerFileList)
    },
    uploadSuccess(response, file, fileList) {

      // this.showFileList = false;
      // fileList.forEach((item, index) => {
      //   const fileData = item.response ? item.response.data : item
      //   this.$set(this.innerFileList, index, fileData)
      // });
      console.log('uploadSuccess response', response);
      console.log('uploadSuccess', fileList);
      console.log('uploadSuccess', this.innerFileList);


      this.currentFileType = this.checkFileType(this.innerFileList)

      let params = [response, file, fileList];
      this.$message.success('上传成功')
      this.$emit('on-success', ...params);
    },
    updateUrlList() {
      if (this.multiple) {
        console.log('update:returnUrlList1+++++', this.innerFileList)
        this.$emit('update:returnUrlList', this.innerFileList)
      } else {
        if (this.innerFileList.length === 0) {
          console.log('update:returnUrlList2+++++', this.innerFileList)

          this.$emit('update:returnUrlList', [])
        } else {
          console.log('update:returnUrlList3+++++', this.innerFileList)

          this.$emit('update:returnUrlList', this.innerFileList.map(item => {
            return item.url;
          })[0])
        }
      }
      // console.log(this.innerFileList.map(item => {
      //   return item.url;
      // })[0])
    },

    handleBeforeUpload(file) {
      // console.log('handleBeforeUpload', file)
      // console.log(this.fileType)
      // console.log(this.checkFileType(file.name))
      this.uploadFlag = true;
      // console.log('this.$refs[uploadAvatar]', this.$refs['uploadAvatar'])
      if (this.fileType === '' && this.checkFileType(file.name) === '') {
        this.$message({
          message: '未知的文件类型',
          type: 'error'
        });
        this.uploadFlag = false;
      } else if (this.fileType !== '' && this.checkFileType(file.name) !== this.fileType) {
        this.$message({
          message: '文件必须为' + this.fileTypeDictionary.filter(item => item.name === this.fileType)[0].suffixList.join('、') + '类型文件',
          type: 'error'
        });
        this.uploadFlag = false;
      }
      if (file.size > 1024 * 1024 * this.fileSize) {
        this.$message({
          message: `文件不得大于${this.fileSize}M`,
          type: 'error'
        });
        this.uploadFlag = false;

      }

      if (!this.uploadFlag) {
        // alert('!this.uploadFlag')
        // console.log(this.fileList)
        // console.log(this.$refs.uploadAvatar.clearFiles)
        this.$refs.uploadAvatar.abort(file);
        // return;
      } else {
        // alert('approve upload')
        this.showFileList = true;
        this.$emit('before-upload', file);
      }
      // console.log('this.uploadFlag', this.uploadFlag)
      return this.uploadFlag;
    },
    handleProgress(event, file, fileList) {
      let params = [event, file, fileList];
      // console.log('handleProgress', ...params)

      this.showFileList = true;



      // if (!this.uploadFlag) {
      //   alert('handleProgress')
      //   this.$refs.uploadAvatar.abort(file);
      // }
    },

    handleError(err, file, fileList) {
      // this.showFileList = false;

      this.$refs.uploadAvatar.abort(file);
      this.$message.error('文件上传失败')
      let params = [err, file, fileList];
      this.$emit('on-error', ...params);
    },
    handleChange(file, fileList) {
      // console.log('file', file)
      // console.log('fileList', fileList)
      // fileList.forEach((item, index) => {
      //   this.$set(this.innerFileList, index, item)
      // });
      if (!this.uploadFlag) {
        // alert('cccc')
        this.fileList = [];
        this.$refs.uploadAvatar.abort(file);
      }
    },
    handlePreview(file) {
      // console.log(file);
      if (!this.uploadFlag) {
        // alert('!this.uploadFlag')
        // console.log(this.fileList)
        // console.log(this.$refs.uploadAvatar.clearFiles)
        this.$refs.uploadAvatar.clearFiles();
        this.$refs.uploadAvatar.abort(file);
        // this.innerFileList.splice()
        // return;
      } else {
        // this.innerFileList.push(file);
        let params = [this.innerFileList, file];
        this.$emit('on-preview', params);
      }
    },





    uploadAvatarExceeded(files, fileList) {
      this.$emit('on-exceed', '');

      console.log('uploadAvatarExceeded', fileList)
      this.$message.error(`当前上传模块最多接受${this.limit}个文件，请删除已上传文件重新上传`);
    },
    handleRemove(file, fileList) {
      console.log('handleRemove+++++', file)
      console.log('handleRemove fileList+++++', this.innerFileList)
      console.log('handleRemove fileList+++++', this.innerUrlList)
      if (!this.disabled) {
        let deleteIndex = this.innerFileList.findIndex(item => {
          return item.id === file.id
        })
        console.log('deleteIndex+++++', deleteIndex)

        this.innerFileList.splice(deleteIndex, 1);

        // this.innerFileList.forEach((item, index) => {
        //   fileList.forEach((item2, index2) => {
        //     if (item2.id === file.id) {
        //       deleteIndex = index2
        //     }
        //   })
        // })
        this.$refs.uploadAvatar.abort(file);
        this.$emit('update:return-file-list', this.innerFileList);
        this.$emit('on-remove', '');
      }
    },
    deleteFile(index) {
      console.log(this.innerFileList)

      if (!this.disabled) {
        this.innerFileList.splice(index, 1);
        console.log(this.innerFileList)
        // console.log(this.innerFileList.length)
        this.updateUrlList();
        this.$emit('update:return-file-list', this.innerFileList);
      }

    },
    checkFileType(url) {
      console.log('checkFileType', url)
      let resultFileType = '';

      url = url.toString();
      if (url === null || url.lastIndexOf('.') === -1) {
        resultFileType = 'file';
      } else {
        let index1 = url.lastIndexOf('.') + 1;
        let index2 = url.length;
        let fileSuffix = url.substring(index1, index2);

        let fileTypeMatchFlag = false;
        this.fileTypeDictionary.forEach((item1, index1) => {
          item1.suffixList.forEach((item2, index2) => {
            if (item2 === fileSuffix) {
              resultFileType = this.fileTypeDictionary[index1].name;

              fileTypeMatchFlag = true;
            }
          });
          if (!fileTypeMatchFlag && index1 === this.fileTypeDictionary.length - 1) {
            resultFileType = 'file';
          }
        });
      }

      return resultFileType;
    },
    checkPrefix(url) {
      return process.env.VUE_APP_BASE_API + '/cretech' + url
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

  }

}
</script>

<style lang='scss'>
@import "style.scss";
</style>
