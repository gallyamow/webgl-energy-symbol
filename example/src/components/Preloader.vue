<template>
  <div class="preloader">
    <div class="red"></div>
    <div class="yellow"></div>
    <div class="green"></div>
  </div>
</template>

<script>
// just for fun
export default {}
</script>

<style scoped>
  .preloader {
    --red: #ff0000;
    --yellow: #feb60a;
    --green: #00b600;
    --size: 3vw;
    --half-size: 1.5vw;
    --padding: 0.6vw;
  }

  .preloader {
    display: flex;
  }

  .preloader div {
    width: var(--size);
    height: var(--size);
    border-radius: var(--half-size);
    animation: bounce 1.5s 0.5s linear infinite;
  }

  .preloader .yellow {
    background: var(--yellow);
  }

  .preloader .red {
    background: var(--red);
  }

  .preloader .green {
    background: var(--green);
  }

  @keyframes bounce {
    0%, 50%, 100% {
      transform: scale(1);
      filter: blur(0px);
    }
    25% {
      transform: scale(0.6);
      filter: blur(2px);
    }
    75% {
      transform: scale(1.4);
      filter: blur(2px);
    }
  }
</style>
