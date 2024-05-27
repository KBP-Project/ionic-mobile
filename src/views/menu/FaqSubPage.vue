<template>
<ion-page>
    <ion-content :fullscreen="true">

        <div class="container bg-light">

            <div class="header mb-5 pt-4">
                <img src="../../assets/img/kbp_logo.png" alt="kbp_logo">
            </div>

            <div class="rounded-5" :class="role == 'R2' ? 'bg-success' : 'bg-primary'"  style="padding: 10px;">

                <div style="display: flex; align-items: center;" class="mb-4">
                    <div style="padding-right: 15px;">
                        <ion-icon style="font-size: 3rem; color: white" :icon="arrowBackCircle" @click="back" />
                    </div>

                    <div v-if="cat" >
                        <h2 style="color: white; margin: 0; font-weight: bold;">{{ nameCat }}</h2>
                    </div>

                    <div></div> <!-- Spasi kosong untuk menjaga posisi tombol kembali -->
                </div>

                <div v-if="cat">
                    <div class="mb-3 " v-for="(c, index) in cat.data" :key="index">
                        <button class="btn btn-light w-100 text-start text-truncate rounded-5 fw-semibold" @click="getAnswer(c.code_subkategori, c.nama_subkategori)" expand="full">{{ c.nama_subkategori }}</button>
                    </div>
                </div>
            </div>

        </div>

    </ion-content>
</ion-page>
</template>

<script>
import {
    IonPage,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonCol,
    IonGrid,
    IonRow,
    IonButton,
    IonCardContent,
    IonHeader,
    toastController,
    loadingController,
    useBackButton,
    useIonRouter,

} from '@ionic/vue';
import {
    useRouter
} from 'vue-router';
import {
    App
} from '@capacitor/app';
import {
    person,
    personCircleSharp,
    arrowBackCircle
} from 'ionicons/icons';
import axios from 'axios';
import "@/assets/boxicons/css/boxicons.css";
import apiService from '@/services/api.js';

export default {
    components: {
        IonPage,
        IonContent,
        IonIcon,
        IonItem,
        IonLabel,
        IonList,
        IonCol,
        IonGrid,
        IonRow,
        IonButton,
        IonCardContent,
        IonHeader,
        toastController,
        loadingController,
        useBackButton,
        useIonRouter
    },
    // setup() {
    //     const ionRouter = useIonRouter();
    //     // useBackButton(-1, () => {
    //     //     if (!ionRouter.canGoBack()) {
    //     //         App.exitApp();
    //     //     }
    //     // });

    //     const router = useRouter();
    //     // return { useBackButton, router, personCircle, settingsOutline, logOutOutline, helpCircleOutline };
    // },

    setup() {
        return {
            person,
            personCircleSharp,
            arrowBackCircle
        };
    },

    data() {
        return {
            cat: null,
            nameCat: null,
            loading: null,
            role: localStorage.getItem('code_role'),
        }
    },

    mounted() {
        this.getData();
    },

    methods: {
        async openLoader(message = "Loading ...") {
            this.loading = await loadingController.create({
                message: message,
            });
            this.loading.present();
        },

        async getData() {
            try {
                this.openLoader();
                const id = localStorage.getItem("idCat");
                this.nameCat = localStorage.getItem("nameCat");
                const data = await apiService.getSubCat(id);
                this.cat = data;
                console.log(this.cat);
            } catch (error) {
                console.log(error);
            } finally {
                this.loading.dismiss();
            }
        },
        async getAnswer(id, nameSub) {
            try {
                localStorage.setItem("idSubCat", id);
                localStorage.setItem("nameSubCat", nameSub);
                this.$router.push("/answer");
            } catch (error) {
                console.log(error);

            }
        },
        back: function () {
            this.$router.back();
        }
    },
}
</script>

<style scoped>

    </style>
