<template>
  <LoginScreen/>

  <router-view />
</template>

<script>
  import LoginScreen from '../components/login.vue'
  import navBar from '../components/navBar.vue'

  export default{
    name: 'Home',
    components: {
      LoginScreen, 
      navBar 
    }
  }
</script>
