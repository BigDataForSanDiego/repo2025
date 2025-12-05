<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">MyApp</router-link>
    </div>
    
    <input type="checkbox" id="checkbox1" v-model="isOpen" />
    <label for="checkbox1">
      <div class="button">
        <span class="bar bar1"></span>
        <span class="bar bar2"></span>
        <span class="bar bar3"></span>
      </div>
    </label>
    
    <ul class="nav-links" :class="{ 'nav-active': isOpen }">
      <li><router-link to="/" @click="isOpen = false">Home</router-link></li>
      <li><router-link to="/login" @click="isOpen = false">Login</router-link></li>
    </ul>
  </nav>
</template>

<script>
  export default {
    name: 'Navbar',
    data() {
      return {
        isOpen: false
      }
    }
  }
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
  z-index: 100;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

#checkbox1 {
  display: none;
}

.button {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  cursor: pointer;
}

.bar1 {
  top: 6px;
}
.bar2 {
  top: 13px;
}
.bar3 {
  top: 20px;
}

.bar {
  width: 100%;
  height: 3px;
  background-color: white;
  transition: all 0.3s ease;
  transform-origin: center;
}

#checkbox1:checked ~ label .bar1 {
  transform: rotate(45deg) translate(7px, 7px); 
}

#checkbox1:checked ~ label .bar2 {
  opacity: 0;
}

#checkbox1:checked ~ label .bar3 {
  transform: rotate(-45deg) translate(7px, -7px);
}

.nav-links {
  position: fixed;
  top: 60px;
  right: -100%;
  width: 70%;
  height: calc(100vh - 60px);
  background-color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding-top: 2rem;
  list-style: none;
  transition: right 0.3s ease;
  z-index: 100;
}

.nav-links.nav-active {
  right: 0;
}

.nav-links li {
  width: 100%;
  text-align: center;
}

.nav-links a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 1rem;
  font-size: 1.2rem;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: #555;
}

.nav-links a.router-link-active {
  background-color: #007bff;
}
</style>
