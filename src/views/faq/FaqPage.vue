<template>
<ion-page>
    <ion-content :fullscreen="true">

        <div class="container bg-light">

            <div class="header mb-5 pt-5">
                <img src="../../assets/img/kbp_logo.png" alt="kbp_logo">
            </div>

            <div class="rounded-5" :style="{ backgroundColor: role === 'R2' ? '#478111' : '#005ca1' }">
                <div class="ion-text-center mb-4">
                    <div style="padding: 10px 0;">
                        <img width="100" src="../../assets/img/kiara.png"></img>
                        <div>
                            <ion-label style="font-size: 20px; color: white">HI BAPAK {{ name }} </ion-label>
                        </div>
                    </div>
                </div>

                <ion-grid class="ion-text-center" v-if="cat">
                    <ion-row>
                        <ion-col size="4" v-for="(c, index) in cat.data" :key="index">
                            <ion-button color="light" @click="getSubCat(c.code_kategori, c.nama_kategori)">
                                <i style="font-size: 3rem;" :class="c.icon"></i>
                            </ion-button>
                            <p style="color: white">{{ c.nama_kategori }}</p>
                        </ion-col>
                    </ion-row>
                </ion-grid>

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
    useIonRouter
} from '@ionic/vue';
import {
    useRouter
} from 'vue-router';
import {
    App
} from '@capacitor/app';
import {
    person,
    personCircleSharp
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
            personCircleSharp
        };
    },

    data() {
        return {
            cat: null,

            loading: null,

            name: null,
            role: localStorage.getItem('code_role'),
        }
    },

    mounted() {

        this.getData();

        this.checkSession();
    },

    methods: {
        async checkSession() {
            this.name = localStorage.getItem('nama')
            // check token akses
            // axios.get(this.$root.api_path + 'mst/user/getByUserId/' + localStorage.getItem('id'),
            //   {
            //     dataType: "json",
            //     headers: {
            //       Authorization: 'bearer ' + localStorage.getItem('token')
            //     }
            //   }).then((response) => {
            //     // console.log(response.data.status)
            //     const data = response.data.data;
            //     this.name = data.profile_name;
            //   }).catch(async (e) => {
            //     const err = e.response.data;
            //     const toast = await toastController.create({
            //       message: 'Sesi anda telah berakhir',
            //       duration: 3000,
            //       position: 'top'
            //     });

            //     await toast.present();
            //     if (err.code == 401) {
            //       localStorage.clear()
            //       this.$router.replace('/login', 'forward');
            //     }
            //   });
        },

        async openLoader(message = "Loading ...") {
            this.loading = await loadingController.create({
                message: message,
            });
            this.loading.present();
        }, 

        async getData() {
            try {
                const role = localStorage.getItem('code_role');
                this.openLoader();
                const data = await apiService.getCat(role);
                this.cat = data;
                console.log(this.cat);
            } catch (error) {
                console.log(error);
            } finally {
                this.loading.dismiss();
            }
        },
        async getSubCat(id, name) {
            try {
                localStorage.setItem("idCat", id);
                localStorage.setItem("nameCat", name);
                this.$router.push("/subFaq");
            } catch (error) {
                console.log(error);

            }
        }
    },
}
</script>

<style scoped>

</style>
