<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup"><slot></slot></div>
        <div class="dots">
            <span
                class="dot"
                :class="{ active: currentPageIndex === index }"
                v-for="(item, index) in dots"
                :key="index"
            ></span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { addClass } from 'common/js/dom'
import BScroll from 'better-scroll'

export default {
    name: 'slider',
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        // 多久滚动一次
        interval: {
            type: Number,
            default: 1000
        }
    },
    data() {
        return {
            dots: [], // 多少个图片点
            currentPageIndex: 0 // 当前第几个
        }
    },
    mounted() {
        setTimeout(() => {
            this._setSliderWidth()
            this._initDots()
            this._initSlider()

            if (this.autoPlay) {
                this._play()
            }
            // 浏览器刷新大概17ms
        }, 20)

        // 监听窗口改变事件
        window.addEventListener('resize', () => {
            if (!this.slider) {
                return
            }
            this._setSliderWidth(true)
            // 当宽度发生变化,重新计算
            this.slider.refresh()
        })
    },
    activated() {
        if (this.autoPlay) {
            this._play()
        }
    },
    deactivated() {
        clearTimeout(this.timer)
    },
    beforeDestroy() {
        // 计时器在组件销毁时记得清理
        this.slide.disable()
        clearTimeout(this.timer)
    },
    methods: {
        _setSliderWidth(isResize) {
            // console.log(isResize)
            // 多少个元素
            this.children = this.$refs.sliderGroup.children

            console.log(this.children.length)

            let width = 0
            // 父容器的宽度
            let sliderWidth = this.$refs.slider.clientWidth
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i]
                addClass(child, 'slider-item')

                child.style.width = sliderWidth + 'px'
                width += sliderWidth
            }
            // 循环的时候左右各clone一个,要加两倍宽度
            if (this.loop && !isResize) {
                width += 2 * sliderWidth
            }
            this.$refs.sliderGroup.style.width = width + 'px'
        },
        _initSlider() {
            this.slider = new BScroll(this.$refs.slider, {
                scrollX: true,
                scrollY: false,
                momentum: false,
                // snap api改变了
                snap: {
                    loop: this.loop,
                    threshold: 0.3,
                    speed: 400
                }
                // stopPropagation: true,
                // click: this.click
                // click: true
            })

            this.slider.on('scrollEnd', () => {
                let pageIndex = this.slider.getCurrentPage().pageX

                // 新版本去掉,不然小圆点对不上
                // if (this.loop) {
                //     pageIndex -= 1
                // }
                this.currentPageIndex = pageIndex

                if (this.autoPlay) {
                    this._play()
                }
            })

            this.slider.on('beforeScrollStart', () => {
                if (this.autoPlay) {
                    clearTimeout(this.timer)
                }
            })
        },
        _initDots() {
            this.dots = new Array(this.children.length)
        },
        _play() {
            clearTimeout(this.timer)
            // let pageIndex = this.currentPageIndex + 1
            // if (this.loop) {
            //     pageIndex += 1
            // }
            this.timer = setTimeout(() => {
                // 0 代表y方向  所以是横向轮播
                // this.slider.goToPage(pageIndex, 0, 400)
                // 新版本改
                this.slider.next()
            }, this.interval)
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.slider {
    min-height: 1px;

    .slider-group {
        position: relative;
        overflow: hidden;
        white-space: nowrap;

        .slider-item {
            float: left;
            box-sizing: border-box;
            overflow: hidden;
            text-align: center;

            a {
                display: block;
                width: 100%;
                overflow: hidden;
                text-decoration: none;
            }

            img {
                display: block;
                width: 100%;
            }
        }
    }

    .dots {
        position: absolute;
        right: 0;
        left: 0;
        bottom: 12px;
        text-align: center;
        font-size: 0;

        .dot {
            display: inline-block;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;

            &.active {
                width: 20px;
                border-radius: 5px;
                background: $color-text-ll;
            }
        }
    }
}
</style>
