<template>
    <div class="row">
        <div class="col-12 text-center pt-5">
            <h5 class="title">What is SafeCross?</h5>
            <p class="text-white about-text">This system is a proof of concept for a passive road safety information 
                system called Sidewalk Proximity Warning System (SPWS). This allows autonomous vehicles in 
                the neighborhood of crosswalks to receive notifications about the state of the crosswalks and an 
                assessment of whether it is safe to continue the crossing of the crosswalk by the vehicle.</p>
        </div>
        <div class="col-12 text-center">
            <h5 class="title">Our Team</h5>
            <div class="row">            
                <div class="col-4 text-white">Luís Alves (a80165)</div>
                <div class="col-4 text-white">Pedro Moreira (a82364)</div>
                <div class="col-4 text-white">Rafaela Rodrigues (a80516)</div>
            </div>

        </div>
    </div>

</template>

<script>
    export default {
        name: "About",
    }
</script>

<style scoped>

    * {
        font-size: 2rem;
    }

    .title {
        color:#ccac14;
        font-size: 4rem;
    }

    .about-text {
        font-size: 1.2rem;
    }

</style>
