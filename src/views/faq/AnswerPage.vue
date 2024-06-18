<template>
<ion-page>
    <ion-content :fullscreen="true">

        <div class="container bg-light" style=" position: fixed">

            <div class="header mb-5 pt-4">
                <img src="../../assets/img/kbp_logo.png" alt="kbp_logo">
            </div>

            <div class="text-wrap rounded-5 mb-3" :style="{ backgroundColor: role === 'R2' ? '#478111' : '#005ca1' }" style="padding: 10px;">

                <div style="display: flex; align-items: center;">

                    <div style="padding-right: 15px;">
                        <ion-icon style="font-size: 3rem; color: white" :icon="arrowBackCircle" @click="back" />
                    </div>

                    <div v-if="cat">
                        <h5 style="color: white; font-weight: bold;">{{ nameSubCat }}</h5>
                    </div>

                </div>

            </div>

        </div>

        <div v-if="cat" class="mx-auto p-4 scrollable-list" style="margin-top: 280px;">
            <ol>
                <li v-for="ans in catList">{{ ans }}</li>
            </ol>
        </div>

        <div class="mb-5"></div>

    </ion-content>

    <div class="text-center mb-5">
        <div class="mx-auto p-2 btn-container">
            <ion-button class="btn fw-bold rounded-5" color="primary" id="open-rating" expand="block" @click="openModalRating()">FEEDBACK</ion-button>

            <ion-button class="btn fw-bold rounded-5" color="danger" @click="chat()">HUBUNGI KAMI</ion-button>
        </div>
    </div>

    <!-- <ion-modal id="modal-rating" ref="modal" trigger="open-rating"> -->
    <ion-modal :is-open="openRating" id="modal-rating" ref="modal">
        <div class="wrapper text-center">
            <h1>
                <bold>Feedback</bold>
            </h1>

            <!-- Rating icon inline -->
            <div class="mb-2">
                <ion-icon v-for="i in 5" :key="i" class="star-icon" :icon="i <= rating ? star : starOutline" size="large" @click="setRating(i)"></ion-icon>
            </div>

            <!-- Text Rating -->
            <p v-if="textRating != null">{{ textRating.text }}</p>

            <!-- ion-input untuk menulis pesan -->
            <ion-input class="mb-1 p-3 input-rating" label="Tulis Pesan..." label-placement="floating" fill="outline" style="text-align: left;" v-model="pesan_feedback"></ion-input>

            <!-- Tombol untuk mengirim feedback -->
            <ion-button class="fw-bold rounded-5" color="success" @click="send()">KIRIM</ion-button>

        </div>
        <div class="peringatan">
            <p class="text-danger">*Harap Diisi Untuk Meningkatkan Pelayanan</p>
        </div>
    </ion-modal>

    <ion-toast :is-open="isOpen" message="Berhasil Dikirim" :duration="3000" :icon="checkmarkDoneOutline" position="middle" color="success"></ion-toast>

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
    IonModal,
    IonGrid,
    IonRow,
    IonButton,
    IonCardContent,
    IonHeader,
    IonInput,
    toastController,
    loadingController,
    useBackButton,
    IonFooter,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonToast,
    IonPopover,
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
    personCircleSharp,
    arrowBackCircle,
    starOutline,
    star,
    globe,
    closeCircleOutline,
    checkmarkDoneOutline
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
        IonInput,
        IonFooter,
        IonButton,
        IonCardContent,
        IonHeader,
        IonToolbar,
        IonModal,
        IonButtons,
        IonPopover,
        IonTitle,
        IonToast,
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
            arrowBackCircle,
            starOutline,
            star,
            globe,
            checkmarkDoneOutline,
            closeCircleOutline
        };
    },

    data() {
        return {
            cat: null,
            rating: 5,
            textRating: null,
            catList: [],
            role: localStorage.getItem('code_role'),

            masterRating: [{
                    level: 1,
                    text: "Sangat Tidak Membantu",
                },
                {
                    level: 2,
                    text: "Tidak Membantu",
                },
                {
                    level: 3,
                    text: "Membantu",
                },
                {
                    level: 4,
                    text: "Cukup Membantu",
                },
                {
                    level: 5,
                    text: "Sangat Membantu",
                },
            ],
            pesan_feedback: '',
            isOpen: false,
            openRating: false,
        }
    },

    mounted() {
        this.getData()
    },

    methods: {
        chat() {
            if (this.cat && this.cat.prioritas === "TEXT") {
                this.$router.push("/chat");
            } else if (this.cat && this.cat.prioritas === "CALL") {
                const nomor_wa = this.cat.nomor_hp.replace(/\D/g, "");
                const whatsappLink = "https://wa.me/62" + nomor_wa + "?text=Halo,%20bisa%20bantu%20saya";
                window.location.href = whatsappLink;
            }
            // this.$router.push("/chat");x 
        },
        openModalRating() {
            const setLevel = this.masterRating.find(x => x.level == this.rating);
            this.textRating = setLevel;
            this.openRating = true;
        },

        async openLoader(message = "Loading ...") {
            this.loading = await loadingController.create({
                message: message,
            });
            this.loading.present();
        },

        async getData() {
            try {
                this.openLoader();
                const id = localStorage.getItem("idSubCat");
                this.nameSubCat = localStorage.getItem("nameSubCat");
                const data = await apiService.getAnswer(id);
                this.cat = data.data;

                this.catList = data.data.answer_text.split(";");
                console.log(this.cat);
                console.log(this.cat.id);
                this.$root.id_chat = this.cat.id;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading.dismiss();
            }
        },

        back: function () {
            this.$router.back();
        },
        setRating(rating) {
            this.rating = rating;
            const setLevel = this.masterRating.find(x => x.level == rating);
            this.textRating = setLevel;
        },

        async send() {
            this.openLoader();
            const post = {
                pesan_feedback: this.pesan_feedback,
                rating_value: this.textRating.level,
                code_subkategori: this.cat.code_subkategori,
                created_by: localStorage.getItem('id')
            }

            await axios.post(this.$root.api_path + 'api/Ratings/postData', post)

                .then(async (r) => {
                    console.log(r);
                    this.loading.dismiss();
                    this.isOpen = true;
                    this.openRating = false;

                }).catch(async (e) => {
                    console.log(this.pesan_feedback)
                })
            // console.log(this.textRating.text)
        }
    },
}
</script>

<style scoped>
.btn-container {
    display: flex;
    justify-content: center;

}

.btn {
    width: 300px;
    /* Atur lebar sesuai kebutuhan */
    height: 70px;
    /* Atur tinggi sesuai kebutuhan */
}

ion-button {
    --border-radius: 100px;
    /* Atur radius sudut tombol */
}

ion-modal#modal-rating {
    --width: fit-content;
    --min-width: 350px;
    --height: fit-content;
    --border-radius: 30px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

ion-modal#modal-rating h1 {
    margin: 20px 20px 20px 20px;
}

ion-modal#modal-rating .wrapper {
    margin-bottom: 30px;
}

ion-modal#modal-rating .peringatan {
    margin-left: 15px;
    font-size: small;

}

.star-icon {
    font-size: 24px;
    /* Sesuaikan ukuran ikon bintang */
    color: #FFD700;
    /* Atur warna ikon bintang */
    display: inline-block;
    /* Membuat ikon bintang menjadi inline */
    vertical-align: middle;
    /* Menyamakan ketinggian ikon dengan teks */
    margin-right: 5px;
    /* Beri jarak kanan antara ikon bintang */
}

.scrollable-list {
    max-height: 500px;
    /* Sesuaikan tinggi maksimum sesuai kebutuhan */
    overflow-y: auto;
    overflow-x: hidden;
}

ion-toolbar {
    --background: rgb(220, 53, 69);
    --color: white;

}
</style>
