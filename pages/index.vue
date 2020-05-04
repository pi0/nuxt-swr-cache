<template>
  <div>Rendered {{ renderedAgo }} seconds ago</div>
</template>

<script>
export default {
  cache: 'swr',
  asyncData () {
    return {
      renderedOn: new Date(),
      renderedAgo: ''
    }
  },
  beforeMount () {
    this.update()
    setInterval(() => { this.update() }, 1000)
  },
  methods: {
    update () {
      this.renderedAgo = Math.round((new Date() - this.renderedOn) / 1000)
    }
  }
}
</script>
