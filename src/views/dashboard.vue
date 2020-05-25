<template>
  <div class="dashboard_main_container">
    <div class="statistic">
      <ul>
        <li>
          <div>
            <label>统计</label>
            <span>1111</span>
          </div>
        </li>
        <li>
          <div>
            <label>统计</label>
            <span>111</span>
          </div>
        </li>
        <li>
          <div>
            <label>统计</label>
            <span>111</span>
          </div>
        </li>
        <li>
          <div>
            <label>统计</label>
            <span>111</span>
          </div>
        </li>
      </ul>
    </div>
    <div class="inventoryutilization" id="inventoryutilization" :style='chartStyle'></div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'Dashboard',
  components: {

  },
  data() {
    return {
      echartInstance: {},
      echartOption: {},
      windowWidth: '',
      windowHeight: '',
      chartWidthStyle: '',
      chartHeightStyle: ''
    }
  },
  computed: {
    sidebarOpened() {

      return this.$store.state.app.sidebar.opened
    },
    chartStyle() {
      return this.chartWidthStyle + this.chartHeightStyle
    }
  },
  watch: {
    async sidebarOpened() {
      
      let width = ''
      if (this.sidebarOpened) {
        width = 'width:calc(100vw - 400px);'
      } else {
        width = 'width:calc(100vw - 200px);'
      }
      if (this.windowWidth <= 990) {
        width = 'width:calc(100vw - 150px);'
      }
      this.chartWidthStyle = width

      await this.$nextTick()
      this.echartInstance.resize()

    },
    async chartStyle(value) {
      console.log('this.windowWidth++++', this.windowWidth)
      console.log('this.windowHeight++++', this.windowHeight)
      console.log('chartStyle++++', value)

      await this.$nextTick()
      this.echartInstance.resize()

    }
  },
  mounted() {
    this.initChartStyle()
    this.init()

    let index = 0

    window.onresize = () => {

      this.initChartStyle()
      console.log('resize', index++)
      this.echartInstance.resize()
    }
  },
  methods: {
    initChartStyle() {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      this.chartWidthStyle = this.getChartWidth()
      this.chartHeightStyle = this.getChartHeight()
    },
    getChartWidth() {
      let width = ''
      if (this.sidebarOpened) {
        width = 'width:calc(100vw - 400px);'
      } else {
        width = 'width:calc(100vw - 200px);'
      }
      if (this.windowWidth <= 990) {
        width = 'width:calc(100vw - 150px);'
      }
      return width
    },
    getChartHeight() {
      let height = this.windowHeight <= 800 ? 'height: 300px; ' : 'height: calc(100vh - 520px); '
      return height
    },
    async init() {
      await this.$nextTick()
      this.echartInstance = echarts.init(document.getElementById('inventoryutilization'));
      this.echartOption = {
        // backgroundColor: '#080b30',
        title: {
          text: '2020-年度趋势分析',
          textStyle: {
            fontSize: 22,
            color: '#1B253A',
            fontFamily: 'simhei',
            fontWeight: 'lighter'
          },
          padding: [0, 0, 120, 0],
          top: '0',
          left: '10px',
          bottom: '20px'
        },
        grid: {
          // top: '0%',
          left: '10px',
          right: '15px',
          bottom: '5%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#000',
            padding: [10, 0, 0, 0],
            textStyle: {
              color: '#000',
              fontSize: 14
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#E5E9ED'
            }
          },
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisTick: {
            show: false,
          },
        }],

        yAxis: [{
          type: 'value',
          min: 0,
          // max: 140,
          splitNumber: 4,
          splitArea: {
            show: true,
            areaStyle: {
              color: '#fff'
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#E5E9ED'
              // color: '#000'
            }
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: 20,
            textStyle: {
              color: '#000',
              fontSize: 12
            },
          },
          axisTick: {
            show: false,
          },
        }],
        series: [{
          name: '注册总量',
          type: 'line',
          // smooth: true, //是否平滑
          showAllSymbol: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            normal: {
              width: 1,
              borderWidth: 1,
              color: "#3A84FF",
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 0,
              shadowOffsetX: 0,
            },
          },
          label: {
            show: false,
            position: 'top',
            textStyle: {
              color: '#3A84FF',
            }
          },
          itemStyle: {
            width: 20,
            color: "#fff",
            borderColor: "#3A84FF",
            symbol: 'circle',
            shadowColor: 'rgba(0, 0, 0, .3)',
            shadowBlur: 0,
            shadowOffsetY: 0,
            shadowOffsetX: 0,
          },
          tooltip: {
            show: false
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(58, 132, 255, 0.6)'
              }, {
                offset: 0.5,
                color: 'rgba(58, 132, 255, 0.27)'
              }, {
                offset: 1,
                color: 'rgba(255,255,255,0)'
              }], false),
              shadowColor: 'rgba(58,132,255, 0.9)',
              shadowBlur: 20
            }
          },
          data: [502.84, 205.97, 332.79, 281.55, 398.35, 214.02, 281.55, 398.35, 214.02, 281.55, 398.35,
            214.02
          ]
        }]
      };

      this.echartInstance.setOption(this.echartOption);
    }
  }
}

</script>