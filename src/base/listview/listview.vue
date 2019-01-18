<template>
    <scroll
        @scroll="scroll"
        :listen-scroll="listenScroll"
        :probe-type="probeType"
        :data="data"
        class="listview"
        ref="listview"
    >
        <ul>
            <li
                v-for="(group, index) in data"
                :key="index"
                class="list-group"
                ref="listGroup"
            >
                <h2 class="list-group-title">{{ group.title }}</h2>
                <uL>
                    <!-- 遍历内部的item -->
                    <li
                        @click="selectItem(item)"
                        v-for="(item, index) in group.items"
                        class="list-group-item"
                        :key="index"
                    >
                        <img class="avatar" v-lazy="item.avatar" />
                        <span class="name">{{ item.name }}</span>
                    </li>
                </uL>
            </li>
        </ul>
        <!-- 右侧快速入口 -->
        <div
            class="list-shortcut"
            @touchstart="onShortcutTouchStart"
            @touchmove.stop.prevent="onShortcutTouchMove"
        >
            <ul>
                <li
                    v-for="(item, index) in shortcutList"
                    :data-index="index"
                    class="item"
                    :class="{ current: currentIndex === index }"
                    :key="index"
                >
                    {{ item }}
                </li>
            </ul>
        </div>
        <!-- 固定标题 -->
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{ fixedTitle }}</div>
        </div>
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getData } from 'common/js/dom'

// 标题高度
const TITLE_HEIGHT = 30
// 每个右侧字母锚点的高度
const ANCHOR_HEIGHT = 18

export default {
    data() {
        return {
            scrollY: -1,
            // 当前应该显示第几个,对应右侧哪个高亮
            currentIndex: 0,
            //  标题头的偏移
            diff: -1
        }
    },
    props: {
        data: {
            type: Array,
            // 这里版本升级了,必须写为函数形式
            // https://github.com/vuejs/vue/issues/1032
            default: () => []
        }
    },
    // 这里不在data里创建, 这里不需要vue监听
    created() {
        // probeType=3 不截留的滚动
        this.probeType = 3
        this.listenScroll = true
        this.touch = {}
        this.listHeight = []
    },
    components: {
        Scroll,
        Loading
    },
    computed: {
        shortcutList() {
            // 数组的map方法
            return this.data.map(group => {
                return group.title.substr(0, 1)
            })
        },
        // 计算属性
        fixedTitle() {
            // 到顶后向下拖动时,边界条件判断
            if (this.scrollY > 0) {
                return ''
            }
            return this.data[this.currentIndex]
                ? this.data[this.currentIndex].title
                : ''
        }
    },

    methods: {
        // 建议公共方法或者绑定事件的方法上面,私有方法下面
        selectItem(item) {
            this.$emit('select', item)
        },
        onShortcutTouchStart(e) {
            // 这里在dom.js封装了getData
            let anchorIndex = getData(e.target, 'index')
            // 点击时直接到某个
            // this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
            let firstTouch = e.touches[0]
            this.touch.y1 = firstTouch.pageY
            this.touch.anchorIndex = anchorIndex

            this._scrollTo(anchorIndex)
        },
        onShortcutTouchMove(e) {
            let firstTouch = e.touches[0]
            this.touch.y2 = firstTouch.pageY
            // | 0, 相当于Math.floor()向下取整,delta表示偏移了几个锚点
            let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0
            // this.touch.anchorIndex是字符串,转换一下
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta
            console.log(anchorIndex)
            this._scrollTo(anchorIndex)
        },
        refresh() {
            this.$refs.listview.refresh()
        },
        // 监听scrollY 与右侧锚点联动
        scroll(pos) {
            this.scrollY = pos.y
        },
        // 获取到每个group的高度
        _calculateHeight() {
            this.listHeight = []
            const list = this.$refs.listGroup
            let height = 0
            this.listHeight.push(height)
            for (let i = 0; i < list.length; i++) {
                let item = list[i]
                height += item.clientHeight
                this.listHeight.push(height)
            }
        },
        _scrollTo(index) {
            // 为了shortcut上下两块黑边点击时,排除
            if (!index && index !== 0) {
                return
            }
            // 滑动到顶部时,为负值,设为0
            if (index < 0) {
                index = 0
            } else if (index > this.listHeight.length - 2) {
                index = this.listHeight.length - 2
            }
            // 这里是为了点击时也对应更改
            this.scrollY = -this.listHeight[index]
            // 第二个参数表示要不要一个缓动动画,0表示不要
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        }
    },
    watch: {
        // 监听数据变化没
        data() {
            setTimeout(() => {
                this._calculateHeight()
            }, 20)
        },
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当滚动到顶部，newY>0
            if (newY > 0) {
                this.currentIndex = 0
                return
            }
            // 在中间部分滚动  遍历到长度减1
            for (let i = 0; i < listHeight.length - 1; i++) {
                let height1 = listHeight[i]
                let height2 = listHeight[i + 1]
                // 如果落在了height1和height2的区间内 这里注意是>=
                if (-newY >= height1 && -newY < height2) {
                    this.currentIndex = i
                    // 标题头的偏差
                    this.diff = height2 + newY
                    return
                }
            }
            // 当滚动到底部，且-newY大于最后一个元素的上限
            this.currentIndex = listHeight.length - 2
        },
        diff(newVal) {
            let fixedTop =
                newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0
            if (this.fixedTop === fixedTop) {
                return
            }
            this.fixedTop = fixedTop
            // 添加偏移效果
            this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $color-background;

    .list-group {
        padding-bottom: 30px;

        .list-group-title {
            height: 30px;
            line-height: 30px;
            padding-left: 20px;
            font-size: $font-size-small;
            color: $color-text-l;
            background: $color-highlight-background;
        }

        .list-group-item {
            display: flex;
            align-items: center;
            padding: 20px 0 0 30px;

            .avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }

            .name {
                margin-left: 20px;
                color: $color-text-l;
                font-size: $font-size-medium;
            }
        }
    }

    .list-shortcut {
        position: absolute;
        z-index: 30;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        padding: 20px 0;
        border-radius: 10px;
        text-align: center;
        background: $color-background-d;
        font-family: Helvetica;

        .item {
            padding: 3px;
            line-height: 1;
            color: $color-text-l;
            font-size: $font-size-small;

            &.current {
                color: $color-theme;
            }
        }
    }

    .list-fixed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;

        .fixed-title {
            height: 30px;
            line-height: 30px;
            padding-left: 20px;
            font-size: $font-size-small;
            color: $color-text-l;
            background: $color-highlight-background;
        }
    }

    .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }
}
</style>
