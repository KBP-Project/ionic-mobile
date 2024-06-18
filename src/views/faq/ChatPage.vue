<template>
<ion-page>
    <ion-content :fullscreen="true" class="ion-padding-bottom">

        <div class="container bg-primary py-2 header">
            <div style="display: flex; align-items: center;">
                <div style="padding-right: 15px;">
                    <ion-icon style="font-size: 3rem; color: white; vertical-align: middle;" :icon="arrowBackCircle" @click="back" />
                </div>
                <div style="display: flex; align-items: center;">
                    <img class="ion-padding"  src="../../assets/img/kiara.png" style="width: 90px; height: auto; margin-top: -20px; margin-bottom:-20px; margin-left: -20px; margin-right: -10px;"></img>
                    <p style="color: white; margin: 0 0 0 0px; vertical-align: middle; font-size: 20px">Kiara</p>
                </div>
            </div>
        </div>

        <div class="message-container">
        <div v-for="(value, key) in chat" :key="key" class="message-wrapper" :class="value.tipe == 'web' ? 'received' : 'sent'">
            <div class="icon-container">
                <img style="width: 50px;" src="../../assets/img/kiara.png" v-if="value.tipe == 'web'">
                <ion-icon v-else :style="{ fontSize: '2rem', color: 'grey'}" :icon="personCircleSharp"></ion-icon>
            </div>
            <div class="chat-message">
                <p>{{ value.chat }}</p>
            </div>
        </div>
        </div>

    </ion-content>

    <div class="input-container">
        <ion-input v-model="value_inputChat" placeholder="Masukkan Pesan" fill="outline" class="input-message"></ion-input>
        <ion-button class="send-button" @click="storeDataFirestore()">
            <ion-icon :icon="sendOutline"></ion-icon>
        </ion-button>
    </div>
</ion-page>
</template>

<script>
import apiService from '@/services/api.js';
import {
    IonPage,
    IonContent,
    IonIcon,
    IonInput,
    IonButton,
    useIonRouter,
} from '@ionic/vue';
import {
    arrowBackCircle,
    personCircleSharp,
    sendOutline
} from 'ionicons/icons';

export default {
    components: {
        IonPage,
        IonContent,
        IonIcon,
        IonInput,
        IonButton,
    },
    setup() {
        return {
            arrowBackCircle,
            personCircleSharp,
            sendOutline,
            temp_docChat: {
                id: 'paklaring'
            },

        };
    },
    data() {
        return {
            chat: [],
            fullname: localStorage.getItem('nama'),
            value_inputChat: "",
            cat: []
        }
    },
    created() {
        this.getDataFromFirebase();
    },
    mounted() {
        this.getData();
    },

    methods: {
        async getData() {
            this.$root.openLoading(true); //untuk buka loading
            try {
                const id = localStorage.getItem("idSubCat");
                this.nameSubCat = localStorage.getItem("nameSubCat");
                const data = await apiService.getAnswer(id);
                this.cat = data.data;

                this.catList = data.data.answer_text.split(";");
                console.log(this.cat);
                this.$root.id_chat = this.cat.id;
            } catch (error) {
                console.log(error);
            }

            
            const openingChat = [
                {
                    nama: 'OPENING',
                    chat: `Mohon ditunggu ya Bapak ${this.fullname}, pertanyaan anda tentang "${this.cat.nama_subkategori}" akan segera direspon!` ,
                    time: new Date(),
                    tipe: 'web'
                },
                {
                    nama: 'OPENING',
                    chat: `Tolong ceritakan masalah anda lebih detail lagi` ,
                    time: new Date(),
                    tipe: 'web'
                },
            ];
            this.chat = this.chat.concat(openingChat);

            this.$root.openLoading(false); //untuk tutup loading
        },

        storeDataFirestore: async function () {
            try {
                this.$root.isLoading = true;
                const firstChat = {
                    nama: this.fullname,
                    chat: this.value_inputChat,
                    time: new Date(),
                    tipe: 'android'
                }
                this.$root.updateDocFirebase(this.$root.docFirebase(this.$root.dbfirebase, 'allchats', 'chat'), firstChat);
                this.chat.push(firstChat);

                // if(this.chat.length == 1){
                //     const openingChat = {
                //         nama: 'OPENING',
                //         chat: `Mohon ditunggu ya ${this.fullname}, pertanyaanmu tentang "${this.cat.nama_subkategori}" segera direspon!` ,
                //         time: new Date(),
                //         tipe: 'web'
                //     }
                //     this.$root.updateDocFirebase(this.$root.docFirebase(this.$root.dbfirebase, 'allchats', 'chat'), openingChat);
                //     this.chat.push(openingChat);
                // }

                this.value_inputChat = '';
            } catch (e) {
                console.log(e);
            }
            this.$root.isLoading = false;
        },
        getDataFromFirebase: async function () {
            try {
                this.$root.onSnapshotFirebase(this.$root.docFirebase(this.$root.dbfirebase, "allchats", "chat"), (snap) => {
                    if (this.$root.flagNotif == false) {
                        this.$root.flagNotif = true;
                        return;
                    }
                    console.log(snap.data());
                    if (snap.data().tipe == 'web') {
                        if(snap.data().nama != 'OPENING') this.chat.push(snap.data());
                    }
                });
            } catch (e) {
                console.log(e);
            }
        },
        back: function () {
            this.$router.back();
        }
    },
}
</script>

<style scoped>
.ion-padding-bottom {
    padding-bottom: 80px;
    padding-top: 70px;
    /* Increase padding to ensure content is not hidden by the header */
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.message-container{
    padding-top: 2%;
}

.message-wrapper {
    display: flex;
    margin-top: 10px;
    word-wrap: break-word;
    align-items: center;
    position: relative;
    max-width: 85vw;
    /* padding: 0 10px 0 0; */
}

.message-wrapper.received {
    flex-direction: row;
    align-self: flex-start;
    text-align: left;
    margin-right: auto;
}

.message-wrapper.sent {
    flex-direction: row-reverse;
    align-self: flex-end;
    text-align: right;
    margin-left: auto;
}

.icon-container {
    flex-shrink: 0;
    margin: 0 10px;
}

.chat-message {
    padding: 10px;
    border-radius: 10px;
    max-width: 100%;
    background-color: #f1f0f0;
}

.message-wrapper.received .chat-message {
    background-color: #ccf9ff;
}

.message-wrapper.sent .chat-message {
    background-color: #ffffff;
}

.message-wrapper:first-child {
    margin-top: 80px;
    /* Add margin-top to the first chat message to prevent it from being hidden by the header */
}

.input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 10px;
    display: flex;
    align-items: center;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.input-message {
    flex: 1;
    margin-right: 10px;
}

.send-button {
    --padding-start: 0;
    --padding-end: 0;
    --padding-top: 0;
    --padding-bottom: 0;
    height: 100%;
    width: 15%;
}
</style>
