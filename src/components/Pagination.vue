<template>
  <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagination.page+1"
    :prev-click='handlePrevPage' :next-click='handleNextPage' :page-sizes="[10, 20, 50, 100]"
    :page-size="pagination.size" layout="sizes, prev, pager, next, jumper" :total="pagination.limit">
  </el-pagination>
</template>

<script>
  import {
    scrollTo
  } from '@/utils/scroll-to'

  export default {
    name: 'Pagination',
    props: {
      total: {
        required: true,
        type: Number
      },
      page: {
        type: Number,
        default: 1
      },
      limit: {
        type: Number,
        default: 20
      },
      pageSizes: {
        type: Array,
        default () {
          return [10, 20, 30, 50]
        }
      },
      layout: {
        type: String,
        default: 'total, sizes, prev, pager, next, jumper'
      },
      background: {
        type: Boolean,
        default: true
      },
      autoScroll: {
        type: Boolean,
        default: true
      },
      hidden: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      currentPage: {
        get() {
          return this.page
        },
        set(val) {
          this.$emit('update:page', val)
        }
      },
      pageSize: {
        get() {
          return this.limit
        },
        set(val) {
          this.$emit('update:limit', val)
        }
      },
      pagination: {
        get() {
          return {
            page: this.page,
            size: this.size,
            limit: this.limit
          }
        },
        set(val) {
         
        }
      }
    },
    methods: {
      handleSizeChange(data) {
        this.pagination.size = data
        this.getTableData()
      },
      handleCurrentChange(pageNumber) {
        this.pagination.page = pageNumber
        this.getTableData()
      },
      handlePrevPage(pageNumber) {
        this.pagination.page = pageNumber - 1
        this.getTableData()
      },
      handleNextPage(pageNumber) {
        this.pagination.page = pageNumber + 1
        this.getTableData()
      },
    }
  }

</script>

<style scoped>
</style>
