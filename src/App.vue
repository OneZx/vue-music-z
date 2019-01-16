<template>
    <div id="app">
        <m-header></m-header>
        <tab></tab>
        <router-view />
    </div>
</template>

<script>
import MHeader from './components/m-header/m-header'
import Tab from 'components/tab/tab'
export default {
    name: 'App',
    components: {
        MHeader,
        Tab
    }
}
</script>

<style scoped lang="stylus">
// @import '～common/stylus/variable';
@import '~common/stylus/variable';
</style>
